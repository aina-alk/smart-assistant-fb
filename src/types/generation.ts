/**
 * Types pour la génération de documents médicaux via Claude API
 */

import { z } from 'zod';

// ============================================================================
// Structures CRC (Compte-Rendu de Consultation)
// ============================================================================

/**
 * Résultats de l'examen clinique ORL
 */
export interface CRCExamen {
  otoscopie_droite: string | null;
  otoscopie_gauche: string | null;
  rhinoscopie: string | null;
  oropharynx: string | null;
  palpation_cervicale: string | null;
  autres: string | null;
}

/**
 * Compte-Rendu de Consultation généré par Claude
 */
export interface CRCGenerated {
  motif: string;
  histoire: string;
  examen: CRCExamen;
  examens_complementaires: string | null;
  diagnostic: string;
  conduite: string;
  conclusion: string;
}

// ============================================================================
// Options de génération
// ============================================================================

/**
 * Contexte patient pour enrichir la génération
 */
export interface PatientContext {
  age?: number;
  sexe?: 'M' | 'F';
  antecedents?: string;
}

/**
 * Options pour la génération de CRC
 */
export interface GenerateCRCOptions {
  transcription: string;
  patientContext?: PatientContext;
  onStream?: (chunk: string) => void;
}

/**
 * Options de configuration du client Claude
 */
export interface ClaudeClientOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// ============================================================================
// Réponses API
// ============================================================================

/**
 * Réponse de génération CRC
 */
export interface GenerateCRCResponse {
  crc: CRCGenerated;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Réponse d'erreur génération
 */
export interface GenerationErrorResponse {
  error: string;
  code?: GenerationErrorCode;
  details?: string;
}

/**
 * Codes d'erreur de génération
 */
export type GenerationErrorCode =
  | 'INVALID_TRANSCRIPTION'
  | 'GENERATION_FAILED'
  | 'PARSE_ERROR'
  | 'RATE_LIMITED'
  | 'API_ERROR'
  | 'TIMEOUT';

// ============================================================================
// Schemas Zod pour validation
// ============================================================================

/**
 * Schema Zod pour l'examen clinique
 */
export const crcExamenSchema = z.object({
  otoscopie_droite: z.string().nullable(),
  otoscopie_gauche: z.string().nullable(),
  rhinoscopie: z.string().nullable(),
  oropharynx: z.string().nullable(),
  palpation_cervicale: z.string().nullable(),
  autres: z.string().nullable(),
});

/**
 * Schema Zod pour le CRC complet
 */
export const crcGeneratedSchema = z.object({
  motif: z.string().min(1, 'Le motif de consultation est requis'),
  histoire: z.string().min(1, "L'histoire de la maladie est requise"),
  examen: crcExamenSchema,
  examens_complementaires: z.string().nullable(),
  diagnostic: z.string().min(1, 'Le diagnostic est requis'),
  conduite: z.string().min(1, 'La conduite à tenir est requise'),
  conclusion: z.string().min(1, 'La conclusion est requise'),
});

/**
 * Schema pour le contexte patient
 */
export const patientContextSchema = z.object({
  age: z.number().min(0).max(150).optional(),
  sexe: z.enum(['M', 'F']).optional(),
  antecedents: z.string().optional(),
});

/**
 * Schema pour les options de génération
 */
export const generateCRCOptionsSchema = z.object({
  transcription: z.string().min(10, 'La transcription doit contenir au moins 10 caractères'),
  patientContext: patientContextSchema.optional(),
});

// ============================================================================
// Messages d'erreur
// ============================================================================

/**
 * Messages d'erreur localisés en français
 */
export const GENERATION_ERROR_MESSAGES: Record<GenerationErrorCode, string> = {
  INVALID_TRANSCRIPTION: 'Transcription invalide ou trop courte.',
  GENERATION_FAILED: 'La génération du compte-rendu a échoué.',
  PARSE_ERROR: 'Erreur lors du traitement de la réponse.',
  RATE_LIMITED: 'Trop de requêtes. Veuillez patienter.',
  API_ERROR: "Erreur de l'API de génération.",
  TIMEOUT: 'Délai de génération dépassé.',
};
