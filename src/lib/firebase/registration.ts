/**
 * Service de création du document utilisateur lors de l'inscription
 * Crée le document users/{uid} avec le status initial 'pending_call'
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import type {
  RegistrationRole,
  CallbackSlot,
  MedecinRegistrationData,
  SecretaireRegistrationData,
  TechnicienRegistrationData,
  AdminRegistrationData,
} from '@/types/registration';
import type {
  UserRole,
  MedecinData,
  SecretaireData,
  TechnicienData,
  AdminData,
} from '@/types/user';

// ===== TYPES =====

interface CreateUserDocumentParams {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: RegistrationRole;
  callbackSlots: CallbackSlot[];
  callbackNote: string | null;
  medecinData: MedecinRegistrationData | null;
  secretaireData: SecretaireRegistrationData | null;
  technicienData: TechnicienRegistrationData | null;
  adminData: AdminRegistrationData | null;
}

// ===== MAPPERS =====

/**
 * Mappe RegistrationRole vers UserRole
 */
function mapRole(role: RegistrationRole): UserRole {
  return role as UserRole;
}

/**
 * Mappe les données médecin du formulaire vers le format Firestore
 */
function mapMedecinData(data: MedecinRegistrationData | null): MedecinData | null {
  if (!data) return null;

  return {
    rpps: data.rpps,
    adeli: data.adeli || null,
    specialty: data.specialty,
    sector: data.sector,
    conventionStatus: null,
    signature: null,
  };
}

/**
 * Mappe les données secrétaire du formulaire vers le format Firestore
 */
function mapSecretaireData(data: SecretaireRegistrationData | null): SecretaireData | null {
  if (!data) return null;

  return {
    supervisorId: '', // Sera renseigné par l'admin lors de l'approbation
    supervisorName: data.supervisorName,
    permissions: [], // Permissions par défaut, configurées par l'admin
    service: null,
  };
}

/**
 * Mappe les données technicien du formulaire vers le format Firestore
 */
function mapTechnicienData(data: TechnicienRegistrationData | null): TechnicienData | null {
  if (!data) return null;

  return {
    specialization: data.specialization,
    certifications: [],
    supervisorId: null,
  };
}

/**
 * Mappe les données admin du formulaire vers le format Firestore
 * Les champs level et managedStructures sont définis par l'admin lors de l'approbation
 */
function mapAdminData(data: AdminRegistrationData | null): AdminData | null {
  if (!data) return null;

  return {
    level: 'structure',
    managedStructures: [],
  };
}

/**
 * Mappe les créneaux de callback vers le format Firestore
 * Le type User utilise 'morning' | 'afternoon' | 'evening' (sans 'noon')
 * On mappe 'noon' vers 'afternoon' pour compatibilité
 */
function mapCallbackSlots(slots: CallbackSlot[]): ('morning' | 'afternoon' | 'evening')[] {
  return slots.map((slot) => {
    if (slot === 'noon') return 'afternoon';
    return slot as 'morning' | 'afternoon' | 'evening';
  });
}

// ===== SERVICE =====

/**
 * Crée le document utilisateur dans Firestore lors de l'inscription
 * Le document est créé avec le status 'pending_call' pour déclencher le workflow d'approbation
 */
export async function createUserDocument(params: CreateUserDocumentParams): Promise<void> {
  const userRef = doc(getDbInstance(), 'users', params.uid);

  const now = new Date();

  await setDoc(userRef, {
    // Identité
    email: params.email,
    displayName: params.displayName,
    phone: params.phone,
    photoURL: null,

    // Rôle et Statut
    role: mapRole(params.role),
    status: 'pending_call',

    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    // Workflow Entretien
    callbackSlots: mapCallbackSlots(params.callbackSlots),
    callbackNote: params.callbackNote,
    interviewScheduledAt: null,
    interviewCompletedAt: null,
    interviewNotes: null,
    interviewedBy: null,

    // Approbation / Rejet
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,

    // Historique initial
    statusHistory: [
      {
        status: 'pending_call',
        changedAt: now,
        changedBy: 'system',
        note: 'Demande initiale soumise',
      },
    ],

    // Structure (futur multi-cabinet)
    structureId: null,
    structureName: null,

    // Données spécifiques au rôle
    medecinData: mapMedecinData(params.medecinData),
    secretaireData: mapSecretaireData(params.secretaireData),
    technicienData: mapTechnicienData(params.technicienData),
    adminData: mapAdminData(params.adminData),

    // Données de demande admin (pour examen par l'organisation)
    adminRequestData: params.adminData
      ? {
          organizationName: params.adminData.organizationName,
          position: params.adminData.position,
          requestReason: params.adminData.requestReason,
        }
      : null,
  });
}
