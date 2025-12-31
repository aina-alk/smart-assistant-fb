/**
 * Types pour la transcription vocale via AssemblyAI
 */

// ============================================================================
// Statuts de transcription
// ============================================================================

/**
 * Statuts possibles d'une transcription AssemblyAI
 */
export type TranscriptionStatus = 'queued' | 'processing' | 'completed' | 'error';

/**
 * Codes d'erreur de transcription
 */
export type TranscriptionErrorCode =
  | 'MICROPHONE_PERMISSION_DENIED'
  | 'MICROPHONE_NOT_FOUND'
  | 'RECORDING_FAILED'
  | 'UPLOAD_FAILED'
  | 'TRANSCRIPTION_FAILED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'INVALID_AUDIO'
  | 'FILE_TOO_LARGE';

// ============================================================================
// Réponses API AssemblyAI
// ============================================================================

/**
 * Réponse de l'endpoint d'upload AssemblyAI
 */
export interface AssemblyAIUploadResponse {
  upload_url: string;
}

/**
 * Réponse de création de transcription AssemblyAI
 */
export interface AssemblyAICreateResponse {
  id: string;
  status: TranscriptionStatus;
  audio_url: string;
  language_code: string;
}

/**
 * Segment de parole avec identification du locuteur
 */
export interface AssemblyAIUtterance {
  speaker: string;
  text: string;
  start: number;
  end: number;
  confidence: number;
}

/**
 * Réponse complète de transcription AssemblyAI
 */
export interface AssemblyAITranscriptResponse {
  id: string;
  status: TranscriptionStatus;
  text: string | null;
  utterances: AssemblyAIUtterance[] | null;
  error: string | null;
  audio_duration: number | null;
  language_code: string;
}

// ============================================================================
// Types Application
// ============================================================================

/**
 * Segment de parole simplifié pour l'application
 */
export interface Utterance {
  /** Identifiant du locuteur (A, B, C...) */
  speaker: string;
  /** Texte transcrit */
  text: string;
  /** Temps de début en ms */
  startTime: number;
  /** Temps de fin en ms */
  endTime: number;
}

/**
 * Résultat de transcription pour l'application
 */
export interface TranscriptionResult {
  /** ID unique de la transcription */
  id: string;
  /** Statut actuel */
  status: TranscriptionStatus;
  /** Texte transcrit complet (null si pas encore terminé) */
  text: string | null;
  /** Segments avec identification des locuteurs */
  utterances: Utterance[] | null;
  /** Message d'erreur (null si pas d'erreur) */
  error: string | null;
  /** Durée audio en secondes */
  audioDuration: number | null;
}

/**
 * Configuration pour démarrer une transcription
 */
export interface TranscriptionConfig {
  /** Code langue (défaut: 'fr') */
  languageCode?: string;
  /** Activer la détection des locuteurs */
  speakerLabels?: boolean;
  /** Vocabulaire à booster */
  wordBoost?: string[];
}

// ============================================================================
// Requêtes/Réponses API Route
// ============================================================================

/**
 * Réponse de l'API POST /api/transcription
 */
export interface StartTranscriptionResponse {
  /** ID de la transcription pour polling */
  transcriptId: string;
  /** Message de confirmation */
  message: string;
}

/**
 * Réponse de l'API GET /api/transcription/{id}
 */
export interface GetTranscriptionResponse {
  /** Résultat de la transcription */
  result: TranscriptionResult;
}

/**
 * Réponse d'erreur standard
 */
export interface TranscriptionErrorResponse {
  error: string;
  code?: TranscriptionErrorCode;
  details?: string;
}

// ============================================================================
// Messages d'erreur utilisateur
// ============================================================================

/**
 * Messages d'erreur localisés en français
 */
export const TRANSCRIPTION_ERROR_MESSAGES: Record<TranscriptionErrorCode, string> = {
  MICROPHONE_PERMISSION_DENIED:
    "Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.",
  MICROPHONE_NOT_FOUND: 'Aucun microphone détecté. Veuillez connecter un microphone.',
  RECORDING_FAILED: "L'enregistrement a échoué. Veuillez réessayer.",
  UPLOAD_FAILED: "Erreur lors de l'envoi de l'audio. Vérifiez votre connexion.",
  TRANSCRIPTION_FAILED: 'La transcription a échoué. Veuillez réessayer.',
  NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion internet.',
  TIMEOUT: "Délai d'attente dépassé. Veuillez réessayer.",
  INVALID_AUDIO: 'Format audio non supporté.',
  FILE_TOO_LARGE: 'Fichier trop volumineux. Maximum 100 MB.',
};
