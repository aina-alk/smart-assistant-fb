/**
 * Callable Function : Retraiter une inscription échouée
 * Utilisé par les admins pour relancer le traitement onUserCreated
 */

import * as functions from 'firebase-functions';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { UserData } from '../types';
import { sendConfirmationEmail, sendAdminNotification } from '../services/email.service';
import { createAuditLog } from '../services/audit.service';

export const retryUserCreated = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentification requise');
    }

    // Vérifier que l'appelant est admin
    const callerClaims = context.auth.token;
    if (callerClaims.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Réservé aux administrateurs');
    }

    const { userId } = data;
    if (!userId || typeof userId !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'userId requis');
    }

    console.warn(`Retraitement inscription demandé pour ${userId} par ${context.auth.uid}`);

    try {
      // Récupérer le document utilisateur
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Utilisateur non trouvé');
      }

      const userData = userDoc.data() as UserData;

      // 1. Définir les Custom Claims
      await getAuth().setCustomUserClaims(userId, {
        role: userData.role,
        status: userData.status,
        structureId: userData.structureId || null,
      });
      console.warn(`Custom Claims définis pour ${userId}`);

      // 2. Envoyer l'email de confirmation au candidat
      await sendConfirmationEmail(userData);

      // 3. Notifier l'admin
      await sendAdminNotification(userData, userId);

      // 4. Logger l'action dans l'audit
      await createAuditLog({
        action: 'user_created_retry',
        targetUserId: userId,
        performedBy: context.auth.uid,
        changes: {
          status: userData.status,
          role: userData.role,
        },
        metadata: {
          email: userData.email,
          displayName: userData.displayName,
          retryReason: 'Manual retry after failed onCreate trigger',
        },
      });

      console.warn(`Retraitement inscription terminé pour ${userId}`);

      return {
        success: true,
        message: `Inscription retraitée avec succès pour ${userData.email}`,
      };
    } catch (error) {
      console.error(`Erreur retraitement inscription ${userId}:`, error);
      throw new functions.https.HttpsError(
        'internal',
        `Erreur lors du retraitement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  });
