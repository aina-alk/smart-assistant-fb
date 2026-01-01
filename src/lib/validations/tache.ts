/**
 * Schémas Zod pour la validation des tâches
 * Messages d'erreur en français
 */

import { z } from 'zod';

// ============================================================================
// Schémas de base
// ============================================================================

/**
 * Schéma pour la priorité de tâche
 */
export const tachePrioriteSchema = z.enum(['basse', 'normale', 'haute', 'urgente'], {
  required_error: 'La priorité est requise',
  invalid_type_error: 'Priorité invalide',
});

/**
 * Schéma pour le statut de tâche
 */
export const tacheStatutSchema = z.enum(['a_faire', 'en_cours', 'terminee', 'annulee'], {
  required_error: 'Le statut est requis',
  invalid_type_error: 'Statut invalide',
});

/**
 * Schéma pour la catégorie de tâche
 */
export const tacheCategorieSchema = z.enum(
  ['rappel', 'suivi', 'administratif', 'medical', 'autre'],
  {
    required_error: 'La catégorie est requise',
    invalid_type_error: 'Catégorie invalide',
  }
);

// ============================================================================
// Schéma Formulaire Tâche (création)
// ============================================================================

/**
 * Schéma de validation pour le formulaire de création de tâche
 */
export const tacheFormSchema = z.object({
  titre: z
    .string({
      required_error: 'Le titre est requis',
    })
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),

  description: z
    .string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional()
    .or(z.literal('')),

  priorite: tachePrioriteSchema.default('normale'),

  statut: tacheStatutSchema.default('a_faire'),

  categorie: tacheCategorieSchema.default('autre'),

  echeance: z
    .date({
      invalid_type_error: "Date d'échéance invalide",
    })
    .optional(),

  rappel: z
    .date({
      invalid_type_error: 'Date de rappel invalide',
    })
    .optional(),

  patientId: z.string().optional(),

  consultationId: z.string().optional(),
});

/**
 * Type inféré du schéma formulaire tâche
 */
export type TacheFormData = z.infer<typeof tacheFormSchema>;

// ============================================================================
// Schéma Mise à jour Tâche
// ============================================================================

/**
 * Schéma de validation pour la mise à jour de tâche
 */
export const tacheUpdateSchema = tacheFormSchema.partial();

/**
 * Type inféré du schéma mise à jour tâche
 */
export type TacheUpdateData = z.infer<typeof tacheUpdateSchema>;

// ============================================================================
// Schéma Recherche Tâche
// ============================================================================

/**
 * Schéma de validation pour la recherche de tâches
 */
export const tacheSearchSchema = z.object({
  statut: tacheStatutSchema.optional(),

  priorite: tachePrioriteSchema.optional(),

  categorie: tacheCategorieSchema.optional(),

  patientId: z.string().optional(),

  consultationId: z.string().optional(),

  echeanceAvant: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (AAAA-MM-JJ)')
    .optional(),

  echeanceApres: z
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
 * Type inféré du schéma recherche tâche
 */
export type TacheSearchParams = z.infer<typeof tacheSearchSchema>;

// ============================================================================
// Schémas API Tâche
// ============================================================================

/**
 * Schéma pour la création de tâche via API
 */
export const tacheCreateApiSchema = tacheFormSchema;

/**
 * Schéma pour la mise à jour de tâche via API
 */
export const tacheUpdateApiSchema = tacheUpdateSchema;

/**
 * Type pour la création de tâche via API
 */
export type TacheCreateApiData = z.infer<typeof tacheCreateApiSchema>;

/**
 * Type pour la mise à jour de tâche via API
 */
export type TacheUpdateApiData = z.infer<typeof tacheUpdateApiSchema>;

// ============================================================================
// Schéma Complétion Tâche
// ============================================================================

/**
 * Schéma pour marquer une tâche comme terminée
 */
export const tacheCompleteSchema = z.object({
  completedAt: z
    .date({
      invalid_type_error: 'Date de complétion invalide',
    })
    .optional()
    .default(() => new Date()),
});

/**
 * Type pour la complétion de tâche
 */
export type TacheCompleteData = z.infer<typeof tacheCompleteSchema>;
