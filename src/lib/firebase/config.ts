/**
 * Configuration Firebase Client (côté navigateur)
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth, type ActionCodeSettings } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialiser Firebase (singleton)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Auth instance
export const auth: Auth = getAuth(app);

// Firestore instance
export const db: Firestore = getFirestore(app);

// Functions instance
export const functions: Functions = getFunctions(app, 'europe-west1');

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

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

export default app;
