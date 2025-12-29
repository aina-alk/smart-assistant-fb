/**
 * Firebase Admin SDK (côté serveur uniquement)
 */

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialiser Firebase Admin (singleton)
if (!getApps().length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId) {
    throw new Error('FIREBASE_ADMIN_PROJECT_ID est requis');
  }

  // Si clientEmail et privateKey sont fournis, utiliser le Service Account
  // Sinon, utiliser l'Application Default Credentials (pour dev local)
  if (clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      } as ServiceAccount),
    });
  } else {
    // En développement, on peut utiliser GOOGLE_APPLICATION_CREDENTIALS
    // ou laisser Firebase Admin utiliser les credentials par défaut
    console.warn(
      'Firebase Admin: clientEmail et privateKey non configurés. Utilisation des credentials par défaut.'
    );
    initializeApp({
      projectId,
    });
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export { FieldValue };

/**
 * Vérifie et décode un cookie de session Firebase
 */
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Erreur lors de la vérification du cookie de session:', error);
    return null;
  }
}

/**
 * Crée un cookie de session Firebase à partir d'un ID token
 * @param idToken - Le token d'identité Firebase
 * @param expiresIn - Durée de validité en ms (par défaut: 5 jours)
 */
export async function createSessionCookie(idToken: string, expiresIn = 60 * 60 * 24 * 5 * 1000) {
  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    return sessionCookie;
  } catch (error) {
    console.error('Erreur lors de la création du cookie de session:', error);
    throw error;
  }
}
