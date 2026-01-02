/**
 * FHIR Client pour Google Cloud Healthcare API
 * Gère les opérations CRUD et la connexion au FHIR Store
 */

import { GoogleAuth } from 'google-auth-library';
import type { FHIRResource, Bundle, OperationOutcome } from '@/types/fhir';

/**
 * Configuration du client FHIR
 */
export interface FHIRClientConfig {
  projectId: string;
  location: string;
  datasetId: string;
  fhirStoreId: string;
}

/**
 * Erreur FHIR avec détails de l'OperationOutcome
 */
export class FHIRError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public outcome?: OperationOutcome
  ) {
    super(message);
    this.name = 'FHIRError';
  }
}

/**
 * Client FHIR pour interagir avec Google Cloud Healthcare API
 */
export class FHIRClient {
  private baseUrl: string;
  private auth: GoogleAuth;
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  constructor(config: FHIRClientConfig) {
    const { projectId, location, datasetId, fhirStoreId } = config;

    // Construire l'URL de base du FHIR Store
    this.baseUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/fhirStores/${fhirStoreId}/fhir`;

    // Initialiser GoogleAuth avec credentials explicites pour Vercel
    const credentials = this.getCredentials();
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-healthcare'],
      ...(credentials && { credentials }),
    });
  }

  /**
   * Récupère les credentials Google Cloud depuis les variables d'environnement
   * Supporte GOOGLE_APPLICATION_CREDENTIALS_JSON (Vercel) ou ADC (local)
   */
  private getCredentials(): { client_email: string; private_key: string } | null {
    // Option 1: JSON credentials en variable d'environnement (Vercel)
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (credentialsJson) {
      try {
        const parsed = JSON.parse(credentialsJson);
        return {
          client_email: parsed.client_email,
          private_key: parsed.private_key,
        };
      } catch {
        console.error('FHIR: Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON');
      }
    }

    // Option 2: Credentials séparées (alternative)
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (clientEmail && privateKey) {
      return { client_email: clientEmail, private_key: privateKey };
    }

    // Option 3: Fallback sur ADC (local dev avec gcloud auth)
    return null;
  }

  /**
   * Récupère un access token pour l'authentification
   */
  private async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient();
    const tokenResponse = await client.getAccessToken();

    if (!tokenResponse.token) {
      throw new Error('Failed to obtain access token from Google Auth');
    }

    return tokenResponse.token;
  }

  /**
   * Effectue une requête HTTP vers l'API FHIR avec retry logic
   */
  private async request<T>(url: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/fhir+json',
          ...options.headers,
        },
      });

      // Gérer le rate limiting (429)
      if (response.status === 429 && retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request<T>(url, options, retryCount + 1);
      }

      // Parser la réponse
      const data = await response.json();

      // Gérer les erreurs HTTP
      if (!response.ok) {
        const outcome = data as OperationOutcome;
        const message =
          outcome.issue?.[0]?.diagnostics || `HTTP ${response.status}: ${response.statusText}`;
        throw new FHIRError(message, response.status, outcome);
      }

      return data as T;
    } catch (error) {
      // Si c'est déjà une FHIRError, la relancer
      if (error instanceof FHIRError) {
        throw error;
      }

      // Gérer les erreurs réseau/autres
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request<T>(url, options, retryCount + 1);
      }

      throw new Error(
        `FHIR request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Vérifie si une erreur est retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      // Erreurs réseau
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
   * Crée une nouvelle ressource FHIR
   */
  async create<T extends FHIRResource>(
    resourceType: string,
    resource: Omit<T, 'id' | 'meta'>
  ): Promise<T> {
    const url = `${this.baseUrl}/${resourceType}`;
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  }

  /**
   * Lit une ressource FHIR par son ID
   */
  async read<T extends FHIRResource>(resourceType: string, id: string): Promise<T> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    return this.request<T>(url, {
      method: 'GET',
    });
  }

  /**
   * Met à jour une ressource FHIR existante
   */
  async update<T extends FHIRResource>(resourceType: string, id: string, resource: T): Promise<T> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(resource),
    });
  }

  /**
   * Supprime une ressource FHIR
   */
  async delete(resourceType: string, id: string): Promise<void> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    await this.request(url, {
      method: 'DELETE',
    });
  }

  /**
   * Recherche des ressources FHIR avec paramètres
   */
  async search<T extends FHIRResource>(
    resourceType: string,
    params?: Record<string, string>
  ): Promise<Bundle<T>> {
    const searchParams = new URLSearchParams(params);
    const url = `${this.baseUrl}/${resourceType}${params ? `?${searchParams.toString()}` : ''}`;
    return this.request<Bundle<T>>(url, {
      method: 'GET',
    });
  }

  /**
   * Test la connexion au FHIR Store
   * Retourne true si la connexion est établie
   */
  async testConnection(): Promise<boolean> {
    try {
      // Essaie de lister les ressources Patient (limite à 1 pour tester)
      await this.search('Patient', { _count: '1' });
      return true;
    } catch (error) {
      console.error('FHIR connection test failed:', error);
      return false;
    }
  }

  /**
   * Récupère les métadonnées du serveur FHIR (CapabilityStatement)
   */
  async getCapabilityStatement(): Promise<FHIRResource> {
    const url = `${this.baseUrl}/metadata`;
    return this.request<FHIRResource>(url, {
      method: 'GET',
    });
  }

  /**
   * Exécute une opération batch ou transaction
   */
  async batch<T extends FHIRResource>(bundle: Bundle<T>): Promise<Bundle<T>> {
    const url = this.baseUrl;
    return this.request<Bundle<T>>(url, {
      method: 'POST',
      body: JSON.stringify(bundle),
    });
  }
}

/**
 * Factory pour créer une instance du client FHIR à partir des variables d'environnement
 */
function createFHIRClient(): FHIRClient | null {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.HEALTHCARE_LOCATION;
  const datasetId = process.env.HEALTHCARE_DATASET_ID;
  const fhirStoreId = process.env.HEALTHCARE_FHIR_STORE_ID;

  // Vérifier que toutes les variables d'environnement sont définies
  if (!projectId || !location || !datasetId || !fhirStoreId) {
    console.warn(
      'FHIR client not configured: missing environment variables. ' +
        'Required: GOOGLE_CLOUD_PROJECT, HEALTHCARE_LOCATION, HEALTHCARE_DATASET_ID, HEALTHCARE_FHIR_STORE_ID'
    );
    return null;
  }

  return new FHIRClient({
    projectId,
    location,
    datasetId,
    fhirStoreId,
  });
}

/**
 * Singleton instance du client FHIR
 * Peut être null si les variables d'environnement ne sont pas configurées
 */
export const fhirClient = createFHIRClient();
