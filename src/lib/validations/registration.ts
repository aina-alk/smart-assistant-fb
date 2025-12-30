/**
 * Schémas de validation Zod pour le formulaire d'inscription
 * Validation stricte côté client, validation métier par l'admin
 */

import { z } from 'zod';
import {
  MEDICAL_SPECIALTIES,
  TECHNICIAN_SPECIALIZATIONS,
  CALLBACK_SLOTS,
} from '@/types/registration';

// ===== REGEX ET VALIDATIONS COMMUNES =====

// Format téléphone français : 06/07 suivi de 8 chiffres, avec ou sans espaces
const PHONE_REGEX = /^(?:(?:\+33|0033|0)[67])(?:[\s.-]?\d{2}){4}$/;

// RPPS : exactement 11 chiffres
const RPPS_REGEX = /^\d{11}$/;

// ADELI : 9 chiffres (optionnel)
const ADELI_REGEX = /^\d{9}$/;

// ===== ÉTAPE 1 : IDENTITÉ =====

export const identitySchema = z.object({
  displayName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(
      /^[\p{L}\s\-'.]+$/u,
      'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    ),

  email: z.string().email('Email invalide'),

  phone: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(PHONE_REGEX, 'Format de téléphone invalide (ex: 06 12 34 56 78)'),
});

export type IdentityFormData = z.infer<typeof identitySchema>;

// ===== ÉTAPE 2 : PROFIL PROFESSIONNEL =====

// Sous-schéma médecin
export const medecinDataSchema = z.object({
  rpps: z
    .string()
    .min(1, 'Le numéro RPPS est requis')
    .regex(RPPS_REGEX, 'Le RPPS doit contenir exactement 11 chiffres'),

  specialty: z.enum(MEDICAL_SPECIALTIES, {
    errorMap: () => ({ message: 'Veuillez sélectionner une spécialité' }),
  }),

  sector: z.union([z.literal(1), z.literal(2)], {
    errorMap: () => ({ message: 'Veuillez sélectionner un secteur' }),
  }),

  adeli: z
    .string()
    .optional()
    .refine((val) => !val || ADELI_REGEX.test(val), 'Le numéro ADELI doit contenir 9 chiffres'),
});

export type MedecinDataFormData = z.infer<typeof medecinDataSchema>;

// Sous-schéma secrétaire
export const secretaireDataSchema = z.object({
  supervisorName: z
    .string()
    .min(2, 'Le nom du médecin/cabinet référent est requis')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
});

export type SecretaireDataFormData = z.infer<typeof secretaireDataSchema>;

// Sous-schéma technicien
export const technicienDataSchema = z.object({
  specialization: z.enum(TECHNICIAN_SPECIALIZATIONS, {
    errorMap: () => ({ message: 'Veuillez sélectionner une spécialisation' }),
  }),
});

export type TechnicienDataFormData = z.infer<typeof technicienDataSchema>;

// Sous-schéma admin
export const adminDataSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Le nom de l'organisation doit contenir au moins 2 caractères")
    .max(200, "Le nom de l'organisation ne peut pas dépasser 200 caractères"),

  position: z
    .string()
    .min(2, 'La fonction doit contenir au moins 2 caractères')
    .max(100, 'La fonction ne peut pas dépasser 100 caractères'),

  requestReason: z
    .string()
    .min(10, 'Le motif doit contenir au moins 10 caractères')
    .max(500, 'Le motif ne peut pas dépasser 500 caractères'),
});

export type AdminDataFormData = z.infer<typeof adminDataSchema>;

// Schéma profil complet (avec rôle)
export const profileSchema = z
  .object({
    role: z.enum(['medecin', 'secretaire', 'technicien', 'admin'], {
      errorMap: () => ({ message: 'Veuillez sélectionner votre profil' }),
    }),
    medecinData: medecinDataSchema.nullable(),
    secretaireData: secretaireDataSchema.nullable(),
    technicienData: technicienDataSchema.nullable(),
    adminData: adminDataSchema.nullable(),
  })
  .superRefine((data, ctx) => {
    // Validation conditionnelle selon le rôle
    if (data.role === 'medecin') {
      if (!data.medecinData) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Les informations médecin sont requises',
          path: ['medecinData'],
        });
      }
    } else if (data.role === 'secretaire') {
      if (!data.secretaireData) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Les informations secrétaire sont requises',
          path: ['secretaireData'],
        });
      }
    } else if (data.role === 'technicien') {
      if (!data.technicienData) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Les informations technicien sont requises',
          path: ['technicienData'],
        });
      }
    } else if (data.role === 'admin') {
      if (!data.adminData) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Les informations administrateur sont requises',
          path: ['adminData'],
        });
      }
    }
  });

export type ProfileFormData = z.infer<typeof profileSchema>;

// ===== ÉTAPE 3 : DISPONIBILITÉS =====

const callbackSlotValues = CALLBACK_SLOTS.map((s) => s.value) as [
  'morning',
  'noon',
  'afternoon',
  'evening',
];

export const availabilitySchema = z.object({
  callbackSlots: z
    .array(z.enum(callbackSlotValues))
    .min(1, 'Veuillez sélectionner au moins un créneau'),

  callbackNote: z
    .string()
    .max(250, 'Le commentaire ne peut pas dépasser 250 caractères')
    .optional()
    .default(''),

  acceptContact: z.literal(true, {
    errorMap: () => ({
      message: "Vous devez accepter d'être contacté(e) par téléphone",
    }),
  }),

  acceptTerms: z.literal(true, {
    errorMap: () => ({
      message: 'Vous devez accepter les conditions générales',
    }),
  }),
});

export type AvailabilityFormData = z.infer<typeof availabilitySchema>;

// ===== SCHÉMA DE BASE POUR PROFIL (sans superRefine, pour merge) =====

const profileSchemaBase = z.object({
  role: z.enum(['medecin', 'secretaire', 'technicien', 'admin'], {
    errorMap: () => ({ message: 'Veuillez sélectionner votre profil' }),
  }),
  medecinData: medecinDataSchema.nullable(),
  secretaireData: secretaireDataSchema.nullable(),
  technicienData: technicienDataSchema.nullable(),
  adminData: adminDataSchema.nullable(),
});

// ===== SCHÉMA COMPLET (pour types uniquement) =====

export const registrationSchemaBase = identitySchema
  .merge(profileSchemaBase)
  .merge(availabilitySchema);

export type RegistrationSchemaData = z.infer<typeof registrationSchemaBase>;

// ===== VALIDATION PAR ÉTAPE =====

export const stepSchemas = [identitySchema, profileSchema, availabilitySchema] as const;

export type StepSchema = (typeof stepSchemas)[number];

// ===== HELPERS =====

/**
 * Valide une étape spécifique du formulaire
 */
export function validateStep(step: number, data: unknown) {
  const schema = stepSchemas[step];
  if (!schema) {
    throw new Error(`Invalid step: ${step}`);
  }
  return schema.safeParse(data);
}

/**
 * Extrait les données pertinentes pour une étape
 */
export function getStepData(step: number, data: Record<string, unknown>): Record<string, unknown> {
  switch (step) {
    case 0:
      return {
        displayName: data.displayName,
        email: data.email,
        phone: data.phone,
      };
    case 1:
      return {
        role: data.role,
        medecinData: data.medecinData,
        secretaireData: data.secretaireData,
        technicienData: data.technicienData,
        adminData: data.adminData,
      };
    case 2:
      return {
        callbackSlots: data.callbackSlots,
        callbackNote: data.callbackNote,
        acceptContact: data.acceptContact,
        acceptTerms: data.acceptTerms,
      };
    default:
      return {};
  }
}

/**
 * Normalise le numéro de téléphone (retire espaces et tirets)
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s.-]/g, '');
}

/**
 * Formate le numéro de téléphone pour l'affichage
 */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) return phone;
  return normalized.replace(/(\d{2})(?=\d)/g, '$1 ');
}
