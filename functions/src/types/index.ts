/**
 * Types pour les Cloud Functions
 */

import { Timestamp } from 'firebase-admin/firestore';

// ===== RÔLES ET STATUTS =====

export type UserRole = 'admin' | 'medecin' | 'secretaire' | 'technicien';

export type UserStatus =
  | 'pending_call'
  | 'in_review'
  | 'pending_callback'
  | 'pending_info'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type CallbackSlot = 'morning' | 'afternoon' | 'evening';

// ===== DONNÉES SPÉCIFIQUES AU RÔLE =====

export interface MedecinData {
  rpps: string;
  adeli: string | null;
  specialty: string;
  sector: 1 | 2;
  conventionStatus: string | null;
  signature: string | null;
}

export interface SecretaireData {
  supervisorId: string;
  supervisorName: string;
  permissions: string[];
  service: string | null;
}

export interface TechnicienData {
  specialization: string;
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
  changedBy: string;
  note: string | null;
}

// ===== UTILISATEUR COMPLET =====

export interface UserData {
  id?: string;
  email: string;
  displayName: string;
  phone: string;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy?: string;
  callbackSlots: CallbackSlot[];
  callbackNote: string | null;
  interviewScheduledAt: Timestamp | null;
  interviewCompletedAt: Timestamp | null;
  interviewNotes: string | null;
  interviewedBy: string | null;
  approvedAt: Timestamp | null;
  approvedBy: string | null;
  rejectedAt: Timestamp | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  statusHistory: StatusHistoryEntry[];
  structureId: string | null;
  structureName: string | null;
  medecinData: MedecinData | null;
  secretaireData: SecretaireData | null;
  technicienData: TechnicienData | null;
  adminData: AdminData | null;
  adminNotes?: Array<{ note: string; timestamp: string; by: string }>;
}

// ===== CUSTOM CLAIMS =====

export interface CustomClaims {
  role: UserRole;
  status: UserStatus;
  structureId: string | null;
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
  id?: string;
  action: AuditAction;
  targetUserId: string;
  performedBy: string;
  timestamp: Timestamp | FirebaseFirestore.Timestamp;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Alias pour compatibilité
export type AuditLogData = AuditLog;

// ===== PARAMÈTRES CALLABLE FUNCTIONS =====

export interface ApproveUserParams {
  userId: string;
  interviewNotes?: string;
}

export interface RejectUserParams {
  userId: string;
  reason: string;
}

export interface UpdateUserStatusParams {
  userId: string;
  newStatus: UserStatus;
  note?: string;
}

// ===== RÉPONSES =====

export interface AdminStats {
  pendingCall: number;
  inReview: number;
  pendingCallback: number;
  pendingInfo: number;
  approved: number;
  rejected: number;
  suspended: number;
  total: number;
}

export interface SuccessResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}
