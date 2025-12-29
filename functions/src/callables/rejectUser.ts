/**
 * Callable Function : Rejeter un utilisateur
 * Réservée aux admins
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { CustomClaims, UserData } from '../types';
import { createAuditLog } from '../services/audit.service';

const db = getFirestore();

interface RejectUserRequest {
  userId: string;
  reason?: string;
}

export const rejectUser = onCall<RejectUserRequest>(async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentification requise');
  }

  // Vérifier les droits admin
  const callerClaims = request.auth.token as CustomClaims;
  if (callerClaims.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Droits administrateur requis');
  }

  const { userId, reason } = request.data;

  if (!userId) {
    throw new HttpsError('invalid-argument', 'userId requis');
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'Utilisateur non trouvé');
    }

    const userData = userDoc.data() as UserData;

    // Vérifier que l'utilisateur peut être rejeté
    if (userData.status === 'approved') {
      throw new HttpsError('failed-precondition', 'Impossible de rejeter un utilisateur approuvé');
    }

    if (userData.status === 'rejected') {
      throw new HttpsError('failed-precondition', 'Utilisateur déjà rejeté');
    }

    // Mettre à jour le document utilisateur
    await userRef.update({
      status: 'rejected',
      rejectionReason: reason || null,
      rejectedAt: FieldValue.serverTimestamp(),
      rejectedBy: request.auth.uid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.auth.uid,
    });

    // Mettre à jour les Custom Claims
    await getAuth().setCustomUserClaims(userId, {
      role: userData.role,
      status: 'rejected',
      structureId: null,
    });

    // Audit log
    await createAuditLog({
      action: 'user_rejected',
      targetUserId: userId,
      performedBy: request.auth.uid,
      changes: {
        oldStatus: userData.status,
        newStatus: 'rejected',
        reason: reason || null,
      },
      metadata: {
        adminEmail: request.auth.token.email,
        userEmail: userData.email,
      },
    });

    console.warn(`Utilisateur ${userId} rejeté par ${request.auth.uid}`);

    return {
      success: true,
      message: `Utilisateur ${userData.email} rejeté`,
    };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Erreur rejet utilisateur:', error);
    throw new HttpsError('internal', 'Erreur lors du rejet');
  }
});
