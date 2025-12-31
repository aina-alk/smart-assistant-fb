/**
 * Types pour le codage médical (CIM-10, NGAP, CCAM)
 */

import { z } from 'zod';

// ============================================================================
// CIM-10 Types
// ============================================================================

export type CIM10Category = 'Oreille' | 'Nez' | 'Gorge' | 'Cou' | 'Général';

export interface CIM10Code {
  code: string;
  libelle: string;
  libelle_court: string;
  categorie: CIM10Category;
  frequence?: number;
}

export interface DiagnosticSuggestion {
  code: string;
  libelle: string;
  confiance: number;
  isPrincipal?: boolean;
}

export interface DiagnosticSelection {
  principal: CIM10Code | null;
  secondaires: CIM10Code[];
}

export interface CIM10ExtractionResult {
  principal: DiagnosticSuggestion | null;
  secondaires: DiagnosticSuggestion[];
  confiance: number;
  notes?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CIM10SearchParams {
  q: string;
  limit?: number;
  categorie?: CIM10Category;
}

export interface CIM10SearchResponse {
  codes: CIM10Code[];
  total: number;
}

export interface CIM10ExtractRequest {
  diagnostic: string;
  contexte?: string;
}

export interface CIM10ExtractResponse {
  suggestions: CIM10ExtractionResult;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// ============================================================================
// Zod Schemas
// ============================================================================

export const cim10CodeSchema = z.object({
  code: z.string().regex(/^[A-Z]\d{2}(\.\d{1,2})?$/, 'Format de code CIM-10 invalide'),
  libelle: z.string().min(1),
  libelle_court: z.string().min(1),
  categorie: z.enum(['Oreille', 'Nez', 'Gorge', 'Cou', 'Général']),
  frequence: z.number().optional(),
});

export const diagnosticSuggestionSchema = z.object({
  code: z.string(),
  libelle: z.string(),
  confiance: z.number().min(0).max(1),
  isPrincipal: z.boolean().optional(),
});

export const cim10ExtractionResultSchema = z.object({
  principal: diagnosticSuggestionSchema.nullable(),
  secondaires: z.array(diagnosticSuggestionSchema),
  confiance: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export const cim10ExtractRequestSchema = z.object({
  diagnostic: z.string().min(3, 'Le diagnostic doit contenir au moins 3 caractères'),
  contexte: z.string().optional(),
});
