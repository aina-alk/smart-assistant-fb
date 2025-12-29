/**
 * Callable Function : Approuver un utilisateur
 * Réservée aux admins
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { CustomClaims, UserData } from '../types';
import { createAuditLog } from '../services/audit.service';

const db = getFirestore();

interface ApproveUserRequest {
  userId: string;
  structureId?: string;
}

export const approveUser = onCall<ApproveUserRequest>(async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentification requise');
  }

  // Vérifier les droits admin
  const callerClaims = request.auth.token as CustomClaims;
  if (callerClaims.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Droits administrateur requis');
  }

  const { userId, structureId } = request.data;

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

    // Vérifier que l'utilisateur peut être approuvé
    if (userData.status === 'approved') {
      throw new HttpsError('failed-precondition', 'Utilisateur déjà approuvé');
    }

    if (userData.status === 'rejected') {
      throw new HttpsError('failed-precondition', 'Utilisateur déjà rejeté');
    }

    // Mettre à jour le document utilisateur
    await userRef.update({
      status: 'approved',
      structureId: structureId || userData.structureId || null,
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: request.auth.uid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.auth.uid,
    });

    // Mettre à jour les Custom Claims
    await getAuth().setCustomUserClaims(userId, {
      role: userData.role,
      status: 'approved',
      structureId: structureId || userData.structureId || null,
    });

    // Audit log
    await createAuditLog({
      action: 'user_approved',
      targetUserId: userId,
      performedBy: request.auth.uid,
      changes: {
        oldStatus: userData.status,
        newStatus: 'approved',
        structureId: structureId || null,
      },
      metadata: {
        adminEmail: request.auth.token.email,
        userEmail: userData.email,
      },
    });

    console.warn(`Utilisateur ${userId} approuvé par ${request.auth.uid}`);

    return {
      success: true,
      message: `Utilisateur ${userData.email} approuvé avec succès`,
    };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Erreur approbation utilisateur:', error);
    throw new HttpsError('internal', "Erreur lors de l'approbation");
  }
});
