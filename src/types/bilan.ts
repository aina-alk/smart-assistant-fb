/**
 * Types Bilan - Génération et gestion des prescriptions d'examens
 */

import { z } from 'zod';

// ============================================================================
// Types Catégories
// ============================================================================

export type CategorieExamen = 'imagerie' | 'biologie' | 'exploration' | 'autre';

export const CATEGORIES_EXAMEN: Record<CategorieExamen, string> = {
  imagerie: 'Imagerie',
  biologie: 'Biologie',
  exploration: 'Explorations fonctionnelles',
  autre: 'Autre',
};

// ============================================================================
// Types Examen
// ============================================================================

export interface ExamenPrescrit {
  code: string;
  libelle: string;
  categorie: CategorieExamen;
  indication: string;
  urgent: boolean;
  commentaire?: string;
}

export const examenPrescritSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  libelle: z.string().min(1, 'Le libellé est requis'),
  categorie: z.enum(['imagerie', 'biologie', 'exploration', 'autre']),
  indication: z.string().min(1, "L'indication est requise"),
  urgent: z.boolean(),
  commentaire: z.string().optional(),
});

export type ExamenPrescritCreate = Omit<ExamenPrescrit, 'code'> & { code?: string };

export const examenPrescritCreateSchema = examenPrescritSchema.extend({
  code: z.string().optional(),
});

// ============================================================================
// Types BilanPrescription
// ============================================================================

export interface BilanPrescription {
  id: string;
  consultationId: string;
  patientId: string;
  date: Date;
  examens: ExamenPrescrit[];
  contexte_clinique: string;
  createdAt: Date;
  updatedAt: Date;
}

export const bilanPrescriptionSchema = z.object({
  id: z.string(),
  consultationId: z.string(),
  patientId: z.string(),
  date: z.date(),
  examens: z.array(examenPrescritSchema),
  contexte_clinique: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BilanPrescriptionCreate = Omit<BilanPrescription, 'id' | 'createdAt' | 'updatedAt'>;
export type BilanPrescriptionUpdate = Partial<
  Omit<BilanPrescription, 'id' | 'consultationId' | 'createdAt'>
>;

// ============================================================================
// Types Extraction IA
// ============================================================================

export interface ExamenExtrait {
  code: string;
  libelle: string;
  categorie: CategorieExamen;
  indication: string;
  urgent: boolean;
}

export interface ExtractionBilanResult {
  examens: ExamenExtrait[];
  contexte_clinique: string;
  notes?: string;
}

export const examenExtraitSchema = z.object({
  code: z.string(),
  libelle: z.string(),
  categorie: z.enum(['imagerie', 'biologie', 'exploration', 'autre']),
  indication: z.string(),
  urgent: z.boolean(),
});

export const extractionBilanResultSchema = z.object({
  examens: z.array(examenExtraitSchema),
  contexte_clinique: z.string(),
  notes: z.string().optional(),
});

// ============================================================================
// Types API Request/Response
// ============================================================================

export interface ExtractBilanRequest {
  crc: string;
  diagnostic?: string;
}

export const extractBilanRequestSchema = z.object({
  crc: z.string().min(10, 'Le CRC doit contenir au moins 10 caractères'),
  diagnostic: z.string().optional(),
});

export interface ExtractBilanResponse {
  examens: ExamenExtrait[];
  contexte_clinique: string;
  notes?: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface CreateBilanRequest {
  consultationId: string;
  examens: ExamenPrescritCreate[];
  contexte_clinique: string;
}

export const createBilanRequestSchema = z.object({
  consultationId: z.string().min(1, "L'ID de consultation est requis"),
  examens: z.array(examenPrescritCreateSchema).min(1, 'Au moins un examen est requis'),
  contexte_clinique: z.string().min(1, 'Le contexte clinique est requis'),
});

export interface BilanResponse {
  bilan: BilanPrescription;
}
