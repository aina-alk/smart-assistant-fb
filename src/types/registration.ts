/**
 * Types pour le formulaire d'inscription multi-étapes
 */

// ===== RÔLES (exclut admin qui est attribué manuellement) =====

export type RegistrationRole = 'medecin' | 'secretaire' | 'technicien';

// ===== CRÉNEAUX DE RAPPEL =====

export type CallbackSlot = 'morning' | 'noon' | 'afternoon' | 'evening';

export const CALLBACK_SLOTS = [
  { value: 'morning' as const, label: 'Matin (9h - 12h)' },
  { value: 'noon' as const, label: 'Midi (12h - 14h)' },
  { value: 'afternoon' as const, label: 'Après-midi (14h - 18h)' },
  { value: 'evening' as const, label: 'Soir (18h - 20h)' },
] as const;

// ===== SPÉCIALITÉS =====

export const MEDICAL_SPECIALTIES = [
  'ORL',
  'Médecine générale',
  'Chirurgie',
  'Pédiatrie',
  'Dermatologie',
  'Cardiologie',
  'Autre',
] as const;

export type MedicalSpecialty = (typeof MEDICAL_SPECIALTIES)[number];

export const TECHNICIAN_SPECIALIZATIONS = [
  'Audioprothésiste',
  'Orthophoniste',
  'Manipulateur radio',
  'Autre',
] as const;

export type TechnicianSpecialization = (typeof TECHNICIAN_SPECIALIZATIONS)[number];

// ===== DONNÉES SPÉCIFIQUES PAR RÔLE =====

export interface MedecinRegistrationData {
  rpps: string; // 11 chiffres
  specialty: MedicalSpecialty;
  sector: 1 | 2;
  adeli?: string; // Optionnel
}

export interface SecretaireRegistrationData {
  supervisorName: string; // Nom du médecin ou cabinet référent
}

export interface TechnicienRegistrationData {
  specialization: TechnicianSpecialization;
}

// ===== DONNÉES COMPLÈTES DU FORMULAIRE =====

export interface RegistrationFormData {
  // Étape 1 : Identité
  displayName: string;
  email: string;
  phone: string;

  // Étape 2 : Profil professionnel
  role: RegistrationRole | null;
  medecinData: MedecinRegistrationData | null;
  secretaireData: SecretaireRegistrationData | null;
  technicienData: TechnicienRegistrationData | null;

  // Étape 3 : Disponibilités & Consentement
  callbackSlots: CallbackSlot[];
  callbackNote: string;
  acceptContact: boolean;
  acceptTerms: boolean;
}

// ===== ÉTAT DU FORMULAIRE =====

export interface RegistrationFormState extends RegistrationFormData {
  currentStep: number;
  isSubmitting: boolean;
  submitError: string | null;
}

// ===== VALEURS PAR DÉFAUT =====

export const DEFAULT_REGISTRATION_DATA: RegistrationFormData = {
  displayName: '',
  email: '',
  phone: '',
  role: null,
  medecinData: null,
  secretaireData: null,
  technicienData: null,
  callbackSlots: [],
  callbackNote: '',
  acceptContact: false,
  acceptTerms: false,
};

// ===== ÉTAT D'AUTORISATION =====

export type AuthorizationState =
  | 'loading'
  | 'unauthenticated'
  | 'no_document' // → /inscription
  | 'pending' // → /en-attente (pending_call, in_review, pending_callback, pending_info)
  | 'approved' // → /dashboard
  | 'rejected' // → /demande-refusee
  | 'suspended'; // → /compte-suspendu

// ===== CONSTANTES POUR L'UI =====

export const ROLE_LABELS: Record<RegistrationRole, string> = {
  medecin: 'Médecin',
  secretaire: 'Secrétaire médical(e)',
  technicien: 'Technicien(ne) de santé',
};

export const ROLE_DESCRIPTIONS: Record<RegistrationRole, string> = {
  medecin: 'Médecin généraliste ou spécialiste avec numéro RPPS',
  secretaire: 'Secrétaire médical(e) rattaché(e) à un médecin',
  technicien: 'Professionnel de santé technique (audioprothésiste, etc.)',
};

export const SECTOR_LABELS: Record<1 | 2, string> = {
  1: 'Secteur 1',
  2: 'Secteur 2',
};
