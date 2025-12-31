/**
 * Types Ordonnance - Génération et gestion des ordonnances médicales
 */

import { z } from 'zod';

// ============================================================================
// Types Médicament
// ============================================================================

export interface Medicament {
  id: string;
  nom: string;
  forme: string;
  posologie: string;
  duree: string;
  quantite?: number;
  instructions?: string;
}

export const medicamentSchema = z.object({
  id: z.string(),
  nom: z.string().min(1, 'Le nom du médicament est requis'),
  forme: z.string().min(1, 'La forme est requise'),
  posologie: z.string().min(1, 'La posologie est requise'),
  duree: z.string().min(1, 'La durée est requise'),
  quantite: z.number().positive().optional(),
  instructions: z.string().optional(),
});

export type MedicamentCreate = Omit<Medicament, 'id'>;

export const medicamentCreateSchema = medicamentSchema.omit({ id: true });

// ============================================================================
// Types Ordonnance
// ============================================================================

export interface Ordonnance {
  id: string;
  consultationId: string;
  patientId: string;
  date: Date;
  medicaments: Medicament[];
  commentaire?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ordonnanceSchema = z.object({
  id: z.string(),
  consultationId: z.string(),
  patientId: z.string(),
  date: z.date(),
  medicaments: z.array(medicamentSchema),
  commentaire: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OrdonnanceCreate = Omit<Ordonnance, 'id' | 'createdAt' | 'updatedAt'>;
export type OrdonnanceUpdate = Partial<Omit<Ordonnance, 'id' | 'consultationId' | 'createdAt'>>;

// ============================================================================
// Types Extraction IA
// ============================================================================

export interface MedicamentExtrait {
  nom: string;
  forme: string;
  posologie: string;
  duree: string;
  quantite?: number;
  instructions?: string;
}

export interface ExtractionOrdonnanceResult {
  medicaments: MedicamentExtrait[];
  notes?: string;
}

export const medicamentExtraitSchema = z.object({
  nom: z.string(),
  forme: z.string(),
  posologie: z.string(),
  duree: z.string(),
  quantite: z.number().optional(),
  instructions: z.string().optional(),
});

export const extractionOrdonnanceResultSchema = z.object({
  medicaments: z.array(medicamentExtraitSchema),
  notes: z.string().optional(),
});

// ============================================================================
// Types API Request/Response
// ============================================================================

export interface ExtractOrdonnanceRequest {
  conduite: string;
  contextePatient?: string;
}

export const extractOrdonnanceRequestSchema = z.object({
  conduite: z.string().min(10, 'La conduite à tenir doit contenir au moins 10 caractères'),
  contextePatient: z.string().optional(),
});

export interface ExtractOrdonnanceResponse {
  medicaments: MedicamentExtrait[];
  notes?: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface CreateOrdonnanceRequest {
  consultationId: string;
  medicaments: MedicamentCreate[];
  commentaire?: string;
}

export const createOrdonnanceRequestSchema = z.object({
  consultationId: z.string().min(1, "L'ID de consultation est requis"),
  medicaments: z.array(medicamentCreateSchema).min(1, 'Au moins un médicament est requis'),
  commentaire: z.string().optional(),
});

export interface OrdonnanceResponse {
  ordonnance: Ordonnance;
}
