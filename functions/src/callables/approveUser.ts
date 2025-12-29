/**
 * Callable Function : Approuver un utilisateur
 * Réservée aux admins
 */

import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { UserData } from '../types';
import { createAuditLog } from '../services/audit.service';

const db = getFirestore();

interface ApproveUserRequest {
  userId: string;
  structureId?: string;
}

export const approveUser = functions
  .region('europe-west1')
  .https.onCall(async (data: ApproveUserRequest, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentification requise');
    }

    // Vérifier les droits admin
    const callerRole = context.auth.token.role as string | undefined;
    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Droits administrateur requis');
    }

    const { userId, structureId } = data;

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

      // Vérifier que l'utilisateur peut être approuvé
      if (userData.status === 'approved') {
        throw new functions.https.HttpsError('failed-precondition', 'Utilisateur déjà approuvé');
      }

      if (userData.status === 'rejected') {
        throw new functions.https.HttpsError('failed-precondition', 'Utilisateur déjà rejeté');
      }

      // Mettre à jour le document utilisateur
      await userRef.update({
        status: 'approved',
        structureId: structureId || userData.structureId || null,
        approvedAt: FieldValue.serverTimestamp(),
        approvedBy: context.auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid,
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
        performedBy: context.auth.uid,
        changes: {
          oldStatus: userData.status,
          newStatus: 'approved',
          structureId: structureId || null,
        },
        metadata: {
          adminEmail: context.auth.token.email,
          userEmail: userData.email,
        },
      });

      console.warn(`Utilisateur ${userId} approuvé par ${context.auth.uid}`);

      return {
        success: true,
        message: `Utilisateur ${userData.email} approuvé avec succès`,
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error('Erreur approbation utilisateur:', error);
      throw new functions.https.HttpsError('internal', "Erreur lors de l'approbation");
    }
  });
