/**
 * Client AssemblyAI pour transcription vocale
 * Gère l'upload audio et le polling des résultats
 */

import {
  ASSEMBLYAI_BASE_URL,
  ORL_VOCABULARY,
  TRANSCRIPTION_CONFIG,
} from '@/lib/constants/assemblyai';
import type {
  AssemblyAIUploadResponse,
  AssemblyAICreateResponse,
  AssemblyAITranscriptResponse,
  TranscriptionResult,
  Utterance,
} from '@/types/transcription';

/**
 * Erreur spécifique AssemblyAI
 */
export class AssemblyAIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AssemblyAIError';
  }
}

/**
 * Client AssemblyAI pour les opérations de transcription
 */
export class AssemblyAIClient {
  private baseUrl: string;
  private apiKey: string;
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  constructor(apiKey: string) {
    this.baseUrl = ASSEMBLYAI_BASE_URL;
    this.apiKey = apiKey;
  }

  /**
   * Effectue une requête HTTP avec retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          authorization: this.apiKey,
          ...options.headers,
        },
      });

      // Gérer le rate limiting (429)
      if (response.status === 429 && retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      // Parser la réponse
      const data = await response.json();

      // Gérer les erreurs HTTP
      if (!response.ok) {
        const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new AssemblyAIError(errorMessage, response.status);
      }

      return data as T;
    } catch (error) {
      // Si c'est déjà une AssemblyAIError, la relancer
      if (error instanceof AssemblyAIError) {
        throw error;
      }

      // Gérer les erreurs réseau/autres
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      throw new AssemblyAIError(
        `AssemblyAI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  /**
   * Vérifie si une erreur est retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('fetch failed')
      );
    }
    return false;
  }

  /**
   * Upload un blob audio vers AssemblyAI
   * @returns URL de l'audio uploadé
   */
  async uploadAudio(audioData: ArrayBuffer): Promise<string> {
    // Convertir en Uint8Array pour compatibilité avec fetch body
    const uint8Data = new Uint8Array(audioData);

    const response = await this.request<AssemblyAIUploadResponse>('/v2/upload', {
      method: 'POST',
      headers: {
        'content-type': 'application/octet-stream',
      },
      body: uint8Data,
    });

    return response.upload_url;
  }

  /**
   * Démarre une transcription avec la config ORL
   * @returns ID de la transcription
   */
  async createTranscript(audioUrl: string): Promise<string> {
    const requestBody = {
      audio_url: audioUrl,
      ...TRANSCRIPTION_CONFIG,
      word_boost: [...ORL_VOCABULARY],
    };

    const response = await this.request<AssemblyAICreateResponse>('/v2/transcript', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    return response.id;
  }

  /**
   * Récupère le statut et résultat d'une transcription
   */
  async getTranscript(transcriptId: string): Promise<TranscriptionResult> {
    const response = await this.request<AssemblyAITranscriptResponse>(
      `/v2/transcript/${transcriptId}`,
      {
        method: 'GET',
      }
    );

    // Convertir les utterances au format application
    const utterances: Utterance[] | null = response.utterances
      ? response.utterances.map((u) => ({
          speaker: u.speaker,
          text: u.text,
          startTime: u.start,
          endTime: u.end,
        }))
      : null;

    return {
      id: response.id,
      status: response.status,
      text: response.text,
      utterances,
      error: response.error,
      audioDuration: response.audio_duration,
    };
  }

  /**
   * Upload audio et démarre la transcription en une opération
   * @returns ID de la transcription
   */
  async uploadAndTranscribe(audioData: ArrayBuffer): Promise<string> {
    // 1. Upload l'audio
    const uploadUrl = await this.uploadAudio(audioData);

    // 2. Démarrer la transcription
    const transcriptId = await this.createTranscript(uploadUrl);

    return transcriptId;
  }
}

/**
 * Cache pour l'instance du client AssemblyAI
 */
let cachedClient: AssemblyAIClient | null = null;
let clientInitialized = false;

/**
 * Factory pour créer ou récupérer l'instance du client AssemblyAI
 * Utilise une initialisation lazy pour permettre le chargement des env vars après le démarrage
 */
function getAssemblyAIClient(): AssemblyAIClient | null {
  // Si déjà initialisé avec succès, retourner le client caché
  if (clientInitialized && cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    // Ne logger l'avertissement qu'une fois
    if (!clientInitialized) {
      console.warn(
        '[AssemblyAI] Client not configured: missing ASSEMBLYAI_API_KEY environment variable'
      );
      clientInitialized = true;
    }
    return null;
  }

  // Créer et cacher le client
  cachedClient = new AssemblyAIClient(apiKey);
  clientInitialized = true;

  return cachedClient;
}

/**
 * Getter pour l'instance du client AssemblyAI
 * Utilise une initialisation lazy - peut être null si la variable d'environnement n'est pas configurée
 */
export const assemblyAIClient = {
  get instance(): AssemblyAIClient | null {
    return getAssemblyAIClient();
  },
};
