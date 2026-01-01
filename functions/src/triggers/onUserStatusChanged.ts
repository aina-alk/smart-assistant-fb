/**
 * Trigger Firestore : Changement de statut utilisateur
 * Déclenché lors de la mise à jour d'un document dans /users
 */

import * as functions from 'firebase-functions';
import { getAuth } from 'firebase-admin/auth';
import { UserData, UserStatus } from '../types';
import {
  sendWelcomeEmail,
  sendRejectionEmail,
  sendAdminStatusChangeNotification,
} from '../services/email.service';
import { createAuditLog } from '../services/audit.service';

export const onUserStatusChanged = functions
  .region('europe-west1')
  .firestore.document('users/{userId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data() as UserData;
    const afterData = change.after.data() as UserData;

    const userId = context.params.userId;
    const oldStatus = beforeData.status;
    const newStatus = afterData.status;

    // Ne rien faire si le statut n'a pas changé
    if (oldStatus === newStatus) {
      return;
    }

    console.warn(`Changement de statut pour ${userId}: ${oldStatus} → ${newStatus}`);

    try {
      // Mettre à jour les Custom Claims
      await getAuth().setCustomUserClaims(userId, {
        role: afterData.role,
        status: newStatus,
        structureId: afterData.structureId || null,
      });
      console.warn(`Custom Claims mis à jour pour ${userId}`);

      // Actions selon le nouveau statut (emails à l'utilisateur)
      await handleStatusChange(userId, afterData, oldStatus, newStatus);

      // Notifier l'admin du changement de statut
      await sendAdminStatusChangeNotification(
        afterData,
        userId,
        oldStatus,
        newStatus,
        afterData.updatedBy || undefined
      );

      // Logger dans l'audit
      await createAuditLog({
        action: 'status_changed',
        targetUserId: userId,
        performedBy: afterData.updatedBy || 'system',
        changes: {
          oldStatus,
          newStatus,
        },
        metadata: {
          email: afterData.email,
        },
      });
    } catch (error) {
      console.error(`Erreur changement statut ${userId}:`, error);
      throw error;
    }
  });

async function handleStatusChange(
  userId: string,
  userData: UserData,
  _oldStatus: UserStatus,
  newStatus: UserStatus
): Promise<void> {
  switch (newStatus) {
    case 'approved':
      // Compte approuvé → envoyer email de bienvenue
      await sendWelcomeEmail(userData);
      console.warn(`Email de bienvenue envoyé à ${userData.email}`);
      break;

    case 'rejected':
      // Compte rejeté → envoyer email de refus
      await sendRejectionEmail(userData);
      console.warn(`Email de refus envoyé à ${userData.email}`);
      break;

    case 'in_review':
      // Passage en revue (après appel)
      console.warn(`Utilisateur ${userId} en cours de revue`);
      break;

    case 'pending_callback':
      // En attente de rappel
      console.warn(`Utilisateur ${userId} en attente de rappel`);
      break;

    case 'pending_info':
      // En attente d'informations complémentaires
      console.warn(`Utilisateur ${userId} en attente d'infos`);
      break;

    default:
      console.warn(`Statut non géré: ${newStatus}`);
  }
}
