/**
 * Callable Function : Mettre à jour le statut d'un utilisateur
 * Réservée aux admins - pour les statuts intermédiaires
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { CustomClaims, UserData, UserStatus } from '../types';
import { createAuditLog } from '../services/audit.service';

const db = getFirestore();

// Statuts valides pour cette fonction (hors approve/reject)
const VALID_INTERMEDIATE_STATUSES: UserStatus[] = [
  'pending_call',
  'in_review',
  'pending_callback',
  'pending_info',
];

interface UpdateUserStatusRequest {
  userId: string;
  newStatus: UserStatus;
  note?: string;
}

export const updateUserStatus = onCall<UpdateUserStatusRequest>(async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentification requise');
  }

  // Vérifier les droits admin
  const callerClaims = request.auth.token as CustomClaims;
  if (callerClaims.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Droits administrateur requis');
  }

  const { userId, newStatus, note } = request.data;

  if (!userId) {
    throw new HttpsError('invalid-argument', 'userId requis');
  }

  if (!newStatus) {
    throw new HttpsError('invalid-argument', 'newStatus requis');
  }

  // Vérifier que le statut est valide pour cette fonction
  if (!VALID_INTERMEDIATE_STATUSES.includes(newStatus)) {
    throw new HttpsError(
      'invalid-argument',
      `Statut invalide. Utilisez approveUser ou rejectUser pour les statuts finaux. Statuts valides: ${VALID_INTERMEDIATE_STATUSES.join(', ')}`
    );
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'Utilisateur non trouvé');
    }

    const userData = userDoc.data() as UserData;

    // Vérifier que l'utilisateur n'est pas déjà dans un état final
    if (userData.status === 'approved' || userData.status === 'rejected') {
      throw new HttpsError(
        'failed-precondition',
        "Impossible de modifier le statut d'un utilisateur approuvé ou rejeté"
      );
    }

    // Mettre à jour le document utilisateur
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.auth.uid,
    };

    if (note) {
      updateData.adminNotes = FieldValue.arrayUnion({
        note,
        timestamp: new Date().toISOString(),
        by: request.auth.uid,
      });
    }

    await userRef.update(updateData);

    // Audit log
    await createAuditLog({
      action: 'status_changed',
      targetUserId: userId,
      performedBy: request.auth.uid,
      changes: {
        oldStatus: userData.status,
        newStatus,
        note: note || null,
      },
      metadata: {
        adminEmail: request.auth.token.email,
        userEmail: userData.email,
      },
    });

    console.warn(`Statut de ${userId} changé en ${newStatus} par ${request.auth.uid}`);

    return {
      success: true,
      message: `Statut mis à jour: ${newStatus}`,
      oldStatus: userData.status,
      newStatus,
    };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Erreur mise à jour statut:', error);
    throw new HttpsError('internal', 'Erreur lors de la mise à jour du statut');
  }
});
