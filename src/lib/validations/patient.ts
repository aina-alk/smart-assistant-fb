/**
 * Schémas Zod pour la validation des patients
 * Messages d'erreur en français
 */

import { z } from 'zod';
import { validateNIR, validateFrenchPhone, cleanNIR, cleanPhone } from '@/lib/utils/validators';

// ============================================================================
// Schéma Formulaire Patient (création/édition)
// ============================================================================

/**
 * Schéma de validation pour le formulaire patient
 */
export const patientFormSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom contient des caractères invalides'),

  prenom: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le prénom contient des caractères invalides'),

  dateNaissance: z
    .date({
      required_error: 'La date de naissance est requise',
      invalid_type_error: 'Date de naissance invalide',
    })
    .max(new Date(), 'La date de naissance ne peut pas être dans le futur')
    .min(new Date('1900-01-01'), 'Date de naissance invalide'),

  sexe: z.enum(['M', 'F'], {
    required_error: 'Le sexe est requis',
    invalid_type_error: 'Sexe invalide',
  }),

  telephone: z
    .string()
    .transform((val) => (val ? cleanPhone(val) : val))
    .refine((val) => !val || validateFrenchPhone(val), {
      message: 'Numéro de téléphone invalide (format attendu : 0X XX XX XX XX)',
    })
    .optional()
    .or(z.literal('')),

  email: z.string().email('Adresse email invalide').optional().or(z.literal('')),

  adresse: z
    .string()
    .max(200, "L'adresse ne peut pas dépasser 200 caractères")
    .optional()
    .or(z.literal('')),

  codePostal: z
    .string()
    .regex(/^[0-9]{5}$/, 'Code postal invalide (5 chiffres)')
    .optional()
    .or(z.literal('')),

  ville: z
    .string()
    .max(100, 'La ville ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),

  nir: z
    .string()
    .transform((val) => (val ? cleanNIR(val) : val))
    .refine((val) => !val || val.length === 15, {
      message: 'Le NIR doit contenir 15 caractères',
    })
    .refine((val) => !val || validateNIR(val), {
      message: 'NIR invalide (vérifiez la clé de contrôle)',
    })
    .optional()
    .or(z.literal('')),

  mutuelleNom: z
    .string()
    .max(100, 'Le nom de la mutuelle ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),

  mutuelleNumero: z
    .string()
    .max(50, 'Le numéro de mutuelle ne peut pas dépasser 50 caractères')
    .optional()
    .or(z.literal('')),
});

/**
 * Type inféré du schéma formulaire patient
 */
export type PatientFormData = z.infer<typeof patientFormSchema>;

// ============================================================================
// Schéma Recherche Patient
// ============================================================================

/**
 * Schéma de validation pour la recherche de patients
 */
export const patientSearchSchema = z.object({
  query: z
    .string()
    .min(2, 'La recherche doit contenir au moins 2 caractères')
    .max(100, 'La recherche ne peut pas dépasser 100 caractères')
    .optional(),

  nom: z.string().max(100).optional(),

  prenom: z.string().max(100).optional(),

  dateNaissance: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (AAAA-MM-JJ)')
    .optional(),

  nir: z
    .string()
    .transform((val) => (val ? cleanNIR(val) : val))
    .optional(),

  telephone: z
    .string()
    .transform((val) => (val ? cleanPhone(val) : val))
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
 * Type inféré du schéma recherche patient
 */
export type PatientSearchParams = z.infer<typeof patientSearchSchema>;

// ============================================================================
// Schéma API Patient
// ============================================================================

/**
 * Schéma pour la création de patient via API
 */
export const patientCreateApiSchema = patientFormSchema;

/**
 * Schéma pour la mise à jour de patient via API
 */
export const patientUpdateApiSchema = patientFormSchema.partial();

/**
 * Type pour la création de patient via API
 */
export type PatientCreateApiData = z.infer<typeof patientCreateApiSchema>;

/**
 * Type pour la mise à jour de patient via API
 */
export type PatientUpdateApiData = z.infer<typeof patientUpdateApiSchema>;
