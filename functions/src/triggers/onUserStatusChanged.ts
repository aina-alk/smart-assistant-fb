/**
 * Trigger Firestore : Changement de statut utilisateur
 * Déclenché lors de la mise à jour d'un document dans /users
 */

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getAuth } from 'firebase-admin/auth';
import { UserData, UserStatus } from '../types';
import { sendWelcomeEmail, sendRejectionEmail } from '../services/email.service';
import { createAuditLog } from '../services/audit.service';

export const onUserStatusChanged = onDocumentUpdated('users/{userId}', async (event) => {
  const beforeData = event.data?.before.data() as UserData | undefined;
  const afterData = event.data?.after.data() as UserData | undefined;

  if (!beforeData || !afterData) {
    console.error('Données manquantes dans le snapshot');
    return;
  }

  const userId = event.params.userId;
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

    // Actions selon le nouveau statut
    await handleStatusChange(userId, afterData, oldStatus, newStatus);

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
  oldStatus: UserStatus,
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
