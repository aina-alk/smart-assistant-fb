/**
 * Firebase Admin SDK (côté serveur uniquement)
 * Lazy initialization pour compatibilité Docker build
 */

import { initializeApp, getApps, cert, type ServiceAccount, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, type Firestore } from 'firebase-admin/firestore';

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function initializeFirebaseAdmin(): App {
  if (_app) return _app;

  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId) {
    throw new Error('FIREBASE_ADMIN_PROJECT_ID est requis');
  }

  if (clientEmail && privateKey) {
    _app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      } as ServiceAccount),
    });
  } else {
    console.warn(
      'Firebase Admin: clientEmail et privateKey non configurés. Utilisation des credentials par défaut.'
    );
    _app = initializeApp({ projectId });
  }

  return _app;
}

function getAdminAuth(): Auth {
  if (!_auth) {
    initializeFirebaseAdmin();
    _auth = getAuth();
  }
  return _auth;
}

function getAdminDb(): Firestore {
  if (!_db) {
    initializeFirebaseAdmin();
    _db = getFirestore();
  }
  return _db;
}

export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    const auth = getAdminAuth();
    const value = auth[prop as keyof Auth];
    return typeof value === 'function' ? value.bind(auth) : value;
  },
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    const db = getAdminDb();
    const value = db[prop as keyof Firestore];
    return typeof value === 'function' ? value.bind(db) : value;
  },
});

export { FieldValue, getAdminAuth, getAdminDb };

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
