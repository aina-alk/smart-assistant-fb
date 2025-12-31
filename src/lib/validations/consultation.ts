/**
 * Schémas Zod pour la validation des consultations
 * Messages d'erreur en français
 */

import { z } from 'zod';
import { crcGeneratedSchema } from '@/types/generation';

// ============================================================================
// Schémas de base
// ============================================================================

/**
 * Schéma pour le statut de consultation
 */
export const consultationStatutSchema = z.enum(['brouillon', 'en_cours', 'termine', 'annule'], {
  required_error: 'Le statut est requis',
  invalid_type_error: 'Statut invalide',
});

/**
 * Schéma pour la sélection de diagnostics
 */
export const diagnosticSelectionSchema = z.object({
  principal: z
    .object({
      code: z.string(),
      libelle: z.string(),
      libelle_court: z.string(),
      categorie: z.enum(['Oreille', 'Nez', 'Gorge', 'Cou', 'Général']),
      frequence: z.number().optional(),
    })
    .nullable(),
  secondaires: z.array(
    z.object({
      code: z.string(),
      libelle: z.string(),
      libelle_court: z.string(),
      categorie: z.enum(['Oreille', 'Nez', 'Gorge', 'Cou', 'Général']),
      frequence: z.number().optional(),
    })
  ),
});

/**
 * Schéma pour le codage consultation
 */
export const codageConsultationSchema = z.object({
  actes: z.array(
    z.object({
      type: z.enum(['NGAP', 'CCAM']),
      code: z.string(),
      libelle: z.string(),
      tarif_base: z.number(),
      modificateurs: z.array(z.string()).optional(),
      coefficient: z.number().optional(),
      selected: z.boolean().optional(),
    })
  ),
  total_base: z.number(),
  depassement: z.number(),
  total_honoraires: z.number(),
});

// ============================================================================
// Schéma Formulaire Consultation (création/édition)
// ============================================================================

/**
 * Schéma de validation pour le formulaire consultation
 */
export const consultationFormSchema = z.object({
  patientId: z.string().min(1, 'Le patient est requis'),

  praticienId: z.string().min(1, 'Le praticien est requis'),

  date: z
    .date({
      required_error: 'La date est requise',
      invalid_type_error: 'Date invalide',
    })
    .max(new Date(Date.now() + 24 * 60 * 60 * 1000), 'La date ne peut pas être trop dans le futur'),

  motif: z
    .string()
    .min(3, 'Le motif doit contenir au moins 3 caractères')
    .max(500, 'Le motif ne peut pas dépasser 500 caractères'),

  statut: consultationStatutSchema.default('brouillon'),

  transcription: z
    .string()
    .max(50000, 'La transcription ne peut pas dépasser 50000 caractères')
    .optional()
    .or(z.literal('')),

  crc: crcGeneratedSchema.optional(),

  diagnostics: diagnosticSelectionSchema.optional(),

  codage: codageConsultationSchema.optional(),

  documents: z.array(z.string()).optional(),
});

/**
 * Type inféré du schéma formulaire consultation
 */
export type ConsultationFormData = z.infer<typeof consultationFormSchema>;

// ============================================================================
// Schéma Recherche Consultation
// ============================================================================

/**
 * Schéma de validation pour la recherche de consultations
 */
export const consultationSearchSchema = z.object({
  patientId: z.string().optional(),

  praticienId: z.string().optional(),

  statut: consultationStatutSchema.optional(),

  dateDebut: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (AAAA-MM-JJ)')
    .optional(),

  dateFin: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (AAAA-MM-JJ)')
    .optional(),

  limit: z
    .number()
    .int()
    .min(1, 'La limite doit être au moins 1')
    .max(100, 'La limite ne peut pas dépasser 100')
    .default(20),

  pageToken: z.string().optional(),
});

/**
 * Type inféré du schéma recherche consultation
 */
export type ConsultationSearchParams = z.infer<typeof consultationSearchSchema>;

// ============================================================================
// Schéma API Consultation
// ============================================================================

/**
 * Schéma pour la création de consultation via API
 */
export const consultationCreateApiSchema = consultationFormSchema;

/**
 * Schéma pour la mise à jour de consultation via API
 */
export const consultationUpdateApiSchema = consultationFormSchema.partial().omit({
  patientId: true, // Le patient ne peut pas être changé
});

/**
 * Type pour la création de consultation via API
 */
export type ConsultationCreateApiData = z.infer<typeof consultationCreateApiSchema>;

/**
 * Type pour la mise à jour de consultation via API
 */
export type ConsultationUpdateApiData = z.infer<typeof consultationUpdateApiSchema>;
