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

// ============================================================================
// NGAP Types
// ============================================================================

export type NGAPType =
  | 'consultation' // Consultations (C, CS, APC, COE, CSC, AVS)
  | 'majoration' // Majorations (MPC, MCS, MCG, MN, MM, F, U)
  | 'acte' // Actes techniques (K codes)
  | 'bilan' // Bilans (orthophonie, ORL)
  | 'reeducation' // Rééducation (AMO, AMK)
  | 'soins'; // Soins (AMI, SFI)

export interface NGAPCode {
  code: string;
  libelle: string;
  tarif_base: number;
  type: NGAPType;
  coefficient?: number;
  // Champs RAG pour optimisation IA
  categorie?: string;
  content?: string;
  conditions?: string;
  reference_ngap?: string;
  keywords?: string[];
  profession?: string;
  cotation?: string;
}

// ============================================================================
// CCAM Types
// ============================================================================

export type CCAMRegroupement =
  // Legacy (codes existants)
  | 'ATM' // Audiométrie (legacy)
  | 'ENS' // Endoscopie (legacy)
  | 'VNG' // Vidéonystagmographie (legacy)
  | 'ACT' // Actes techniques courants (legacy)
  | 'CHI' // Chirurgie ORL courante (legacy)
  // Nouveaux regroupements ORL étendus
  | 'AUD' // Audiométrie
  | 'VES' // Vestibulaire
  | 'ORE' // Oreille (chirurgie)
  | 'NEZ' // Nez et Sinus
  | 'LAR' // Larynx et Pharynx
  | 'CER' // Cervical
  | 'THY' // Thyroïde
  | 'SAL' // Glandes salivaires
  | 'TRA' // Trachée
  | 'DIV'; // Divers ORL

export interface CCAMCode {
  code: string;
  libelle: string;
  tarif_base: number;
  regroupement: CCAMRegroupement;
  modificateurs?: string[];
}

// ============================================================================
// Codage Consultation Types
// ============================================================================

export type ActeType = 'NGAP' | 'CCAM';

export interface ActeFacturable {
  type: ActeType;
  code: string;
  libelle: string;
  tarif_base: number;
  modificateurs?: string[];
  coefficient?: number;
  selected?: boolean;
}

export interface ActeSuggestion extends ActeFacturable {
  confiance: number;
  raison?: string;
}

export interface CodageConsultation {
  actes: ActeFacturable[];
  total_base: number;
  depassement: number;
  total_honoraires: number;
}

export interface CodageSuggestionResult {
  actes: ActeSuggestion[];
  confiance: number;
  notes?: string;
}

// ============================================================================
// NGAP/CCAM API Types
// ============================================================================

export interface NGAPSearchResponse {
  codes: NGAPCode[];
  total: number;
}

export interface CCAMSearchResponse {
  codes: CCAMCode[];
  total: number;
}

export interface CodageSuggestRequest {
  crc: string;
  diagnostics?: string[];
}

export interface CodageSuggestResponse {
  suggestions: CodageSuggestionResult;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// ============================================================================
// NGAP/CCAM Zod Schemas
// ============================================================================

export const ngapCodeSchema = z.object({
  code: z.string().min(1),
  libelle: z.string().min(1),
  tarif_base: z.number().nonnegative(),
  type: z.enum(['consultation', 'majoration', 'acte', 'bilan', 'reeducation', 'soins']),
  coefficient: z.number().optional(),
  // Champs RAG optionnels
  categorie: z.string().optional(),
  content: z.string().optional(),
  conditions: z.string().optional(),
  reference_ngap: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  profession: z.string().optional(),
  cotation: z.string().optional(),
});

export const ccamCodeSchema = z.object({
  code: z.string().regex(/^[A-Z]{4}\d{3}$/, 'Format de code CCAM invalide'),
  libelle: z.string().min(1),
  tarif_base: z.number().positive(),
  regroupement: z.enum([
    // Legacy
    'ATM',
    'ENS',
    'VNG',
    'ACT',
    'CHI',
    // Nouveaux regroupements ORL
    'AUD',
    'VES',
    'ORE',
    'NEZ',
    'LAR',
    'CER',
    'THY',
    'SAL',
    'TRA',
    'DIV',
  ]),
  modificateurs: z.array(z.string()).optional(),
});

export const acteSuggestionSchema = z.object({
  type: z.enum(['NGAP', 'CCAM']),
  code: z.string(),
  libelle: z.string(),
  tarif_base: z.number().positive(),
  confiance: z.number().min(0).max(1),
  raison: z.string().optional(),
});

export const codageSuggestionResultSchema = z.object({
  actes: z.array(acteSuggestionSchema),
  confiance: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export const codageSuggestRequestSchema = z.object({
  crc: z.string().min(10, 'Le CRC doit contenir au moins 10 caractères'),
  diagnostics: z.array(z.string()).optional(),
});
