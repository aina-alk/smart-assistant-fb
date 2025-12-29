/**
 * Types pour le système d'autorisation utilisateurs
 */

import type { Timestamp } from 'firebase/firestore';

// ===== RÔLES ET STATUTS =====

export type UserRole = 'admin' | 'medecin' | 'secretaire' | 'technicien';

export type UserStatus =
  | 'pending_call' // En attente d'appel
  | 'in_review' // En cours d'examen
  | 'pending_callback' // En attente de rappel
  | 'pending_info' // En attente d'informations
  | 'approved' // Approuvé
  | 'rejected' // Rejeté
  | 'suspended'; // Suspendu

export type CallbackSlot = 'morning' | 'afternoon' | 'evening';

// ===== DONNÉES SPÉCIFIQUES AU RÔLE =====

export interface MedecinData {
  rpps: string; // 11 chiffres obligatoire
  adeli: string | null; // Optionnel
  specialty: string; // 'ORL', 'Généraliste', etc.
  sector: 1 | 2; // Secteur conventionnel
  conventionStatus: string | null;
  signature: string | null; // URL image signature
}

export interface SecretaireData {
  supervisorId: string; // UID médecin référent
  supervisorName: string; // Nom pour affichage
  permissions: string[]; // ['patients:read', 'rdv:write']
  service: string | null;
}

export interface TechnicienData {
  specialization: string; // 'audioprothésiste', etc.
  certifications: string[];
  supervisorId: string | null;
}

export interface AdminData {
  level: 'super' | 'structure';
  managedStructures: string[];
}

// ===== HISTORIQUE DES STATUTS =====

export interface StatusHistoryEntry {
  status: UserStatus;
  changedAt: Timestamp | Date;
  changedBy: string; // UID ou 'system'
  note: string | null;
}

// ===== UTILISATEUR COMPLET =====

export interface User {
  // Identité
  email: string;
  displayName: string;
  phone: string;
  photoURL: string | null;

  // Rôle et Statut
  role: UserRole;
  status: UserStatus;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Workflow Entretien
  callbackSlots: CallbackSlot[];
  callbackNote: string | null;
  interviewScheduledAt: Timestamp | null;
  interviewCompletedAt: Timestamp | null;
  interviewNotes: string | null;
  interviewedBy: string | null;

  // Approbation / Rejet
  approvedAt: Timestamp | null;
  approvedBy: string | null;
  rejectedAt: Timestamp | null;
  rejectedBy: string | null;
  rejectionReason: string | null;

  // Historique
  statusHistory: StatusHistoryEntry[];

  // Structure (futur multi-cabinet)
  structureId: string | null;
  structureName: string | null;

  // Données spécifiques au rôle
  medecinData: MedecinData | null;
  secretaireData: SecretaireData | null;
  technicienData: TechnicienData | null;
  adminData: AdminData | null;
}

// ===== FORMULAIRE D'INSCRIPTION =====

export interface RegistrationFormData {
  // Étape 1 : Identité
  displayName: string;
  phone: string;

  // Étape 2 : Profil professionnel
  role: UserRole;
  medecinData?: Omit<MedecinData, 'signature'>;
  secretaireData?: Omit<SecretaireData, 'supervisorId' | 'supervisorName'> & {
    supervisorEmail: string;
  };
  technicienData?: TechnicienData;

  // Étape 3 : Disponibilités
  callbackSlots: CallbackSlot[];
  callbackNote?: string;
}

// ===== AUDIT LOGS =====

export type AuditAction =
  | 'user_created'
  | 'user_approved'
  | 'user_rejected'
  | 'status_changed'
  | 'role_changed'
  | 'user_suspended';

export interface AuditLog {
  action: AuditAction;
  targetUserId: string;
  targetUserEmail: string;
  performedBy: string; // UID admin ou 'system'
  performedByEmail: string | null;
  timestamp: Timestamp;
  previousValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
  metadata: {
    ip: string | null;
    userAgent: string | null;
    source: 'admin_dashboard' | 'cloud_function' | 'api';
  };
}

// ===== STRUCTURES (préparation futur) =====

export interface Structure {
  name: string;
  address: string;
  siret: string | null;
  phone: string | null;
  email: string | null;
  adminIds: string[]; // UIDs des admins
  createdAt: Timestamp;
  settings: {
    allowSelfRegistration: boolean;
    requireApproval: boolean;
  };
}

// ===== CUSTOM CLAIMS FIREBASE =====

export interface CustomClaims {
  role: UserRole | null;
  status: UserStatus | null;
  structureId: string | null;
  adminLevel?: 'super' | 'structure';
}

// ===== CONTEXTE AUTORISATION =====

export interface AuthorizationState {
  user: User | null;
  status: UserStatus | null;
  role: UserRole | null;
  isApproved: boolean;
  isAdmin: boolean;
  isMedecin: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface AuthorizationContextType extends AuthorizationState {
  refreshUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
