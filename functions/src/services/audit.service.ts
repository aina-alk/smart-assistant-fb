/**
 * Service de logging d'audit pour traçabilité des actions
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { AuditAction, AuditLog } from '../types';

const db = getFirestore();

interface CreateAuditLogParams {
  action: AuditAction;
  targetUserId: string;
  performedBy: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Crée une entrée dans le journal d'audit
 */
export async function createAuditLog({
  action,
  targetUserId,
  performedBy,
  changes,
  metadata,
}: CreateAuditLogParams): Promise<string> {
  const auditLog: Omit<AuditLog, 'id'> = {
    action,
    targetUserId,
    performedBy,
    timestamp: FieldValue.serverTimestamp() as unknown as FirebaseFirestore.Timestamp,
    changes,
    metadata,
  };

  const docRef = await db.collection('audit_logs').add(auditLog);
  console.warn(`Audit log créé: ${action} sur ${targetUserId} par ${performedBy}`);
  return docRef.id;
}

/**
 * Récupère les logs d'audit pour un utilisateur
 */
export async function getAuditLogsForUser(userId: string): Promise<AuditLog[]> {
  const snapshot = await db
    .collection('audit_logs')
    .where('targetUserId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AuditLog[];
}

/**
 * Récupère les derniers logs d'audit (pour admin)
 */
export async function getRecentAuditLogs(limit = 100): Promise<AuditLog[]> {
  const snapshot = await db
    .collection('audit_logs')
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AuditLog[];
}
