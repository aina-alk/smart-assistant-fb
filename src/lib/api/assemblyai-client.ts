/**
 * AssemblyAI Server-Side Client
 *
 * Used exclusively in API routes for secure token generation.
 * Never import this file in client-side code.
 *
 * @server-only
 */

import {
  ASSEMBLYAI_API_BASE_URL,
  ASSEMBLYAI_WEBSOCKET_BASE_URL,
  DEFAULT_CONNECTION_PARAMS,
} from '@/lib/constants/assemblyai';
import type { AssemblyAIConnectionParams } from '@/types/transcription';

// ============================================================================
// TYPES
// ============================================================================

interface TemporaryTokenResponse {
  token: string;
}

interface AssemblyAIError {
  error: string;
  status?: number;
}

// ============================================================================
// CLIENT CLASS
// ============================================================================

/**
 * AssemblyAI server-side client for token generation
 *
 * This client is used exclusively on the server to generate temporary
 * authentication tokens that can be safely passed to the browser.
 */
class AssemblyAIClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('AssemblyAI API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = ASSEMBLYAI_API_BASE_URL;
  }

  /**
   * Generate a temporary authentication token for WebSocket connections
   *
   * This token can be safely passed to the client browser. It expires
   * after the specified duration and can only be used for streaming.
   *
   * @param expiresInSeconds - Token validity in seconds (default: 480 = 8 min)
   * @returns Temporary token string
   */
  async createTemporaryToken(expiresInSeconds: number = 480): Promise<string> {
    const response = await fetch(`${this.baseUrl}/realtime/token`, {
      method: 'POST',
      headers: {
        Authorization: this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expires_in: expiresInSeconds,
      }),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as AssemblyAIError;
      throw new AssemblyAITokenError(
        error.error || `Token generation failed: ${response.status}`,
        response.status
      );
    }

    const data = (await response.json()) as TemporaryTokenResponse;
    return data.token;
  }

  /**
   * Build the WebSocket URL with connection parameters
   *
   * @param connectionParams - Optional custom connection parameters
   * @returns Full WebSocket URL with query parameters
   */
  buildWebSocketUrl(connectionParams: Partial<AssemblyAIConnectionParams> = {}): string {
    const params = {
      ...DEFAULT_CONNECTION_PARAMS,
      ...connectionParams,
    };

    // Build query string
    const queryParams = new URLSearchParams();

    queryParams.set('sample_rate', params.sample_rate.toString());
    queryParams.set('format_turns', params.format_turns.toString());
    queryParams.set(
      'end_of_turn_confidence_threshold',
      params.end_of_turn_confidence_threshold.toString()
    );
    queryParams.set(
      'min_end_of_turn_silence_when_confident',
      params.min_end_of_turn_silence_when_confident.toString()
    );
    queryParams.set('max_turn_silence', params.max_turn_silence.toString());
    queryParams.set('language', params.language);

    // Keyterms need special handling - join as comma-separated
    if (params.keyterms_prompt.length > 0) {
      queryParams.set('keyterms_prompt', params.keyterms_prompt.join(','));
    }

    return `${ASSEMBLYAI_WEBSOCKET_BASE_URL}?${queryParams.toString()}`;
  }
}

// ============================================================================
// CUSTOM ERROR
// ============================================================================

/**
 * Custom error for AssemblyAI token generation failures
 */
export class AssemblyAITokenError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AssemblyAITokenError';
    this.statusCode = statusCode;
  }
}

// ============================================================================
// SINGLETON FACTORY
// ============================================================================

let clientInstance: AssemblyAIClient | null = null;

/**
 * Get or create the AssemblyAI client singleton
 *
 * Uses ASSEMBLYAI_API_KEY environment variable.
 * Returns null if the API key is not configured.
 */
export function getAssemblyAIClient(): AssemblyAIClient | null {
  if (clientInstance) {
    return clientInstance;
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    console.warn(
      '[AssemblyAI] API key not configured. Set ASSEMBLYAI_API_KEY environment variable.'
    );
    return null;
  }

  clientInstance = new AssemblyAIClient(apiKey);
  return clientInstance;
}

/**
 * Create a new AssemblyAI client with explicit API key
 *
 * Use this when you need a non-singleton instance.
 */
export function createAssemblyAIClient(apiKey: string): AssemblyAIClient {
  return new AssemblyAIClient(apiKey);
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Generate a temporary token and WebSocket URL in one call
 *
 * This is the main function to use in API routes.
 *
 * @param options - Optional configuration
 * @returns Token and WebSocket URL
 */
export async function generateTranscriptionCredentials(options?: {
  expiresInSeconds?: number;
  connectionParams?: Partial<AssemblyAIConnectionParams>;
}): Promise<{
  token: string;
  websocketUrl: string;
  expiresAt: Date;
}> {
  const client = getAssemblyAIClient();

  if (!client) {
    throw new AssemblyAITokenError('AssemblyAI client not configured', 503);
  }

  const expiresInSeconds = options?.expiresInSeconds ?? 480;

  const token = await client.createTemporaryToken(expiresInSeconds);
  const websocketUrl = client.buildWebSocketUrl(options?.connectionParams);
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  return {
    token,
    websocketUrl,
    expiresAt,
  };
}
