/**
 * Configuration Firebase Client (côté navigateur)
 * Lazy initialization pour compatibilité Docker build
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth, type ActionCodeSettings } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _functions: Functions | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;

  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  _app = initializeApp(firebaseConfig);
  return _app;
}

function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

function getFirebaseDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

function getFirebaseFunctions(): Functions {
  if (!_functions) {
    _functions = getFunctions(getFirebaseApp(), 'europe-west1');
  }
  return _functions;
}

function getGoogleProvider(): GoogleAuthProvider {
  if (!_googleProvider) {
    _googleProvider = new GoogleAuthProvider();
    _googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
  return _googleProvider;
}

/**
 * Getters pour les instances Firebase
 *
 * Note: On exporte des getters au lieu de Proxies car signInWithPopup
 * et d'autres méthodes Firebase vérifient instanceof sur les arguments.
 * Les Proxies ne passent pas ces vérifications.
 */

/** @deprecated Utiliser getAuthInstance() pour les opérations d'auth */
export const auth: Auth = {} as Auth;

/** @deprecated Utiliser getDbInstance() pour Firestore */
export const db: Firestore = {} as Firestore;

/** @deprecated Utiliser getFunctionsInstance() pour Cloud Functions */
export const functions: Functions = {} as Functions;

/** @deprecated Utiliser getGoogleProviderInstance() pour OAuth */
export const googleProvider: GoogleAuthProvider = {} as GoogleAuthProvider;

// Getters qui retournent les vraies instances
export const getAuthInstance = getFirebaseAuth;
export const getDbInstance = getFirebaseDb;
export const getFunctionsInstance = getFirebaseFunctions;
export const getGoogleProviderInstance = getGoogleProvider;

/**
 * Configuration pour l'authentification par lien email (passwordless)
 * L'URL de callback doit être ajoutée dans Firebase Console > Authentication > Sign-in method > Authorized domains
 */
export const getEmailLinkActionCodeSettings = (): ActionCodeSettings => {
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    url: `${baseUrl}/auth/email-link/callback`,
    handleCodeInApp: true,
  };
};

export default getFirebaseApp;
