/**
 * Callable Function : Mettre à jour le statut d'un utilisateur
 * Réservée aux admins - pour les statuts intermédiaires
 */

import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { UserData, UserStatus } from '../types';
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

export const updateUserStatus = functions
  .region('europe-west1')
  .https.onCall(async (data: UpdateUserStatusRequest, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentification requise');
    }

    // Vérifier les droits admin
    const callerRole = context.auth.token.role as string | undefined;
    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Droits administrateur requis');
    }

    const { userId, newStatus, note } = data;

    if (!userId) {
      throw new functions.https.HttpsError('invalid-argument', 'userId requis');
    }

    if (!newStatus) {
      throw new functions.https.HttpsError('invalid-argument', 'newStatus requis');
    }

    // Vérifier que le statut est valide pour cette fonction
    if (!VALID_INTERMEDIATE_STATUSES.includes(newStatus)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Statut invalide. Utilisez approveUser ou rejectUser pour les statuts finaux. Statuts valides: ${VALID_INTERMEDIATE_STATUSES.join(', ')}`
      );
    }

    try {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Utilisateur non trouvé');
      }

      const userData = userDoc.data() as UserData;

      // Vérifier que l'utilisateur n'est pas déjà dans un état final
      if (userData.status === 'approved' || userData.status === 'rejected') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          "Impossible de modifier le statut d'un utilisateur approuvé ou rejeté"
        );
      }

      // Mettre à jour le document utilisateur
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid,
      };

      if (note) {
        updateData.adminNotes = FieldValue.arrayUnion({
          note,
          timestamp: new Date().toISOString(),
          by: context.auth.uid,
        });
      }

      await userRef.update(updateData);

      // Audit log
      await createAuditLog({
        action: 'status_changed',
        targetUserId: userId,
        performedBy: context.auth.uid,
        changes: {
          oldStatus: userData.status,
          newStatus,
          note: note || null,
        },
        metadata: {
          adminEmail: context.auth.token.email,
          userEmail: userData.email,
        },
      });

      console.warn(`Statut de ${userId} changé en ${newStatus} par ${context.auth.uid}`);

      return {
        success: true,
        message: `Statut mis à jour: ${newStatus}`,
        oldStatus: userData.status,
        newStatus,
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error('Erreur mise à jour statut:', error);
      throw new functions.https.HttpsError('internal', 'Erreur lors de la mise à jour du statut');
    }
  });
