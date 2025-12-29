/**
 * Trigger Firestore : Nouvelle demande d'inscription
 * Déclenché lors de la création d'un document dans /users
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getAuth } from 'firebase-admin/auth';
import { UserData } from '../types';
import { sendConfirmationEmail, sendAdminNotification } from '../services/email.service';
import { createAuditLog } from '../services/audit.service';

export const onUserCreated = onDocumentCreated('users/{userId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.error('Pas de données dans le snapshot');
    return;
  }

  const userId = event.params.userId;
  const userData = snapshot.data() as UserData;

  console.warn(`Nouvelle demande d'inscription: ${userId} - ${userData.email}`);

  try {
    // 1. Définir les Custom Claims initiaux
    await getAuth().setCustomUserClaims(userId, {
      role: userData.role,
      status: 'pending_call',
      structureId: userData.structureId || null,
    });
    console.warn(`Custom Claims définis pour ${userId}`);

    // 2. Envoyer l'email de confirmation au candidat
    await sendConfirmationEmail(userData);

    // 3. Notifier l'admin
    await sendAdminNotification(userData, userId);

    // 4. Logger l'action dans l'audit
    await createAuditLog({
      action: 'user_created',
      targetUserId: userId,
      performedBy: 'system',
      changes: {
        status: 'pending_call',
        role: userData.role,
      },
      metadata: {
        email: userData.email,
        displayName: userData.displayName,
      },
    });

    console.warn(`Traitement inscription terminé pour ${userId}`);
  } catch (error) {
    console.error(`Erreur traitement inscription ${userId}:`, error);
    throw error;
  }
});
