/**
 * Callable Function : Rejeter un utilisateur
 * Réservée aux admins
 */

import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { UserData } from '../types';
import { createAuditLog } from '../services/audit.service';

const db = getFirestore();

interface RejectUserRequest {
  userId: string;
  reason?: string;
}

export const rejectUser = functions
  .region('europe-west1')
  .https.onCall(async (data: RejectUserRequest, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentification requise');
    }

    // Vérifier les droits admin
    const callerRole = context.auth.token.role as string | undefined;
    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Droits administrateur requis');
    }

    const { userId, reason } = data;

    if (!userId) {
      throw new functions.https.HttpsError('invalid-argument', 'userId requis');
    }

    try {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Utilisateur non trouvé');
      }

      const userData = userDoc.data() as UserData;

      // Vérifier que l'utilisateur peut être rejeté
      if (userData.status === 'approved') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Impossible de rejeter un utilisateur approuvé'
        );
      }

      if (userData.status === 'rejected') {
        throw new functions.https.HttpsError('failed-precondition', 'Utilisateur déjà rejeté');
      }

      // Mettre à jour le document utilisateur
      await userRef.update({
        status: 'rejected',
        rejectionReason: reason || null,
        rejectedAt: FieldValue.serverTimestamp(),
        rejectedBy: context.auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid,
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
        performedBy: context.auth.uid,
        changes: {
          oldStatus: userData.status,
          newStatus: 'rejected',
          reason: reason || null,
        },
        metadata: {
          adminEmail: context.auth.token.email,
          userEmail: userData.email,
        },
      });

      console.warn(`Utilisateur ${userId} rejeté par ${context.auth.uid}`);

      return {
        success: true,
        message: `Utilisateur ${userData.email} rejeté`,
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error('Erreur rejet utilisateur:', error);
      throw new functions.https.HttpsError('internal', 'Erreur lors du rejet');
    }
  });
