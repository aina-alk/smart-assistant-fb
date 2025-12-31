/**
 * Client Claude API pour la génération de documents médicaux
 * Gère le streaming et les retries avec exponential backoff
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  GenerateCRCOptions,
  ClaudeClientOptions,
  GenerateCRCResponse,
} from '@/types/generation';
import { CRC_SYSTEM_PROMPT } from '@/lib/prompts/system-prompts';
import { buildCRCPrompt, parseCRCResponse } from '@/lib/prompts/crc-generation';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.3;

/**
 * Erreur spécifique Claude API
 */
export class ClaudeError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ClaudeError';
  }
}

/**
 * Client Claude pour la génération de documents médicaux
 */
export class ClaudeClient {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(apiKey: string, options: ClaudeClientOptions = {}) {
    this.client = new Anthropic({ apiKey });
    this.model = options.model ?? DEFAULT_MODEL;
    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
    this.temperature = options.temperature ?? DEFAULT_TEMPERATURE;
  }

  /**
   * Vérifie si une erreur est retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Anthropic.RateLimitError) return true;
    if (error instanceof Anthropic.InternalServerError) return true;
    if (error instanceof Anthropic.APIConnectionError) return true;

    if (error instanceof Error) {
      return (
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('fetch failed')
      );
    }

    return false;
  }

  /**
   * Extrait le code d'erreur HTTP si disponible
   */
  private getErrorStatusCode(error: unknown): number {
    if (error instanceof Anthropic.APIError) {
      return error.status ?? 500;
    }
    return 500;
  }

  /**
   * Génère un Compte-Rendu de Consultation à partir d'une transcription
   * Support streaming via callback onStream
   */
  async generateCRC(options: GenerateCRCOptions, retryCount = 0): Promise<GenerateCRCResponse> {
    const { transcription, patientContext, onStream } = options;

    const userPrompt = buildCRCPrompt(transcription, patientContext);

    try {
      if (onStream) {
        return await this.generateCRCWithStreaming(userPrompt, onStream);
      }

      return await this.generateCRCDirect(userPrompt);
    } catch (error) {
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.generateCRC(options, retryCount + 1);
      }

      if (error instanceof ClaudeError) throw error;

      const statusCode = this.getErrorStatusCode(error);
      const message = error instanceof Error ? error.message : 'Unknown error';

      throw new ClaudeError(`Claude API error: ${message}`, statusCode);
    }
  }

  /**
   * Génération directe sans streaming
   */
  private async generateCRCDirect(userPrompt: string): Promise<GenerateCRCResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: CRC_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content.find((block) => block.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      throw new ClaudeError('No text content in response', 500, 'NO_CONTENT');
    }

    const crc = parseCRCResponse(textContent.text);

    return {
      crc,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  /**
   * Génération avec streaming (appelle onStream à chaque chunk)
   */
  private async generateCRCWithStreaming(
    userPrompt: string,
    onStream: (chunk: string) => void
  ): Promise<GenerateCRCResponse> {
    let fullText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: CRC_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text;
        fullText += chunk;
        onStream(chunk);
      }

      if (event.type === 'message_start' && event.message.usage) {
        inputTokens = event.message.usage.input_tokens;
      }

      if (event.type === 'message_delta' && event.usage) {
        outputTokens = event.usage.output_tokens;
      }
    }

    const crc = parseCRCResponse(fullText);

    return {
      crc,
      usage: {
        inputTokens,
        outputTokens,
      },
    };
  }

  /**
   * Test de connexion à l'API Claude
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Ping' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Factory pour créer une instance du client Claude
 */
function createClaudeClient(options?: ClaudeClientOptions): ClaudeClient | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('Claude client not configured: missing ANTHROPIC_API_KEY environment variable');
    return null;
  }

  return new ClaudeClient(apiKey, options);
}

/**
 * Singleton instance du client Claude
 * Peut être null si la variable d'environnement n'est pas configurée
 */
export const claudeClient = createClaudeClient();
