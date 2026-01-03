/**
 * AuthProvider - Gère l'état d'authentification global
 */

'use client';

import { createContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import {
  getAuthInstance,
  getGoogleProviderInstance,
  getEmailLinkActionCodeSettings,
} from '@/lib/firebase/config';
import type { AuthContextType, AuthUser } from '@/types/auth';

// Clé localStorage pour stocker l'email en attendant le callback
const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [emailLinkLoading, setEmailLinkLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(
      getAuthInstance(),
      async (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });

          // Synchroniser les custom claims et créer la session
          setSessionReady(false);
          try {
            let idToken = await firebaseUser.getIdToken(true);

            // Synchroniser les claims depuis Firestore si nécessaire
            const syncResponse = await fetch('/api/auth/sync-claims', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            });

            const syncResult = await syncResponse.json();

            // Si les claims ont été mis à jour, récupérer un nouveau token
            if (syncResult.synced) {
              idToken = await firebaseUser.getIdToken(true);
            }

            // Créer le cookie de session avec le token final
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            });

            // Session cookie créé, prêt pour la navigation
            setSessionReady(true);
          } catch (err) {
            console.error('Erreur lors de la création de la session:', err);
            setSessionReady(false);
          }
        } else {
          setUser(null);
          // Supprimer le cookie de session si l'utilisateur n'est pas connecté
          // Cela évite une boucle de redirection avec le middleware
          fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {
            // Ignorer les erreurs silencieusement
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error('Erreur onAuthStateChanged:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(getAuthInstance(), getGoogleProviderInstance());
      // L'état sera mis à jour automatiquement via onAuthStateChanged
    } catch (err) {
      console.error('Erreur lors de la connexion Google:', err);
      setError(err as Error);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(getAuthInstance());

      // Supprimer le cookie de session côté serveur
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });

      setUser(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Envoie un lien de connexion par email (passwordless)
   */
  const sendEmailLink = async (email: string) => {
    try {
      setError(null);
      setEmailLinkLoading(true);
      setEmailLinkSent(false);

      const actionCodeSettings = getEmailLinkActionCodeSettings();
      await sendSignInLinkToEmail(getAuthInstance(), email, actionCodeSettings);

      // Sauvegarder l'email pour la vérification au callback
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
      setEmailLinkSent(true);
    } catch (err) {
      console.error("Erreur lors de l'envoi du lien email:", err);
      setError(err as Error);
      throw err;
    } finally {
      setEmailLinkLoading(false);
    }
  };

  /**
   * Vérifie si le lien actuel est un lien de connexion par email
   */
  const isEmailLinkSignInFn = (link: string): boolean => {
    return isSignInWithEmailLink(getAuthInstance(), link);
  };

  /**
   * Finalise la connexion avec le lien email
   */
  const completeEmailLinkSignIn = async (email: string, link: string) => {
    try {
      setError(null);
      setEmailLinkLoading(true);

      await signInWithEmailLink(getAuthInstance(), email, link);

      // Nettoyer l'email stocké
      window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
      // L'état sera mis à jour automatiquement via onAuthStateChanged
    } catch (err) {
      console.error('Erreur lors de la connexion par lien email:', err);
      setError(err as Error);
      throw err;
    } finally {
      setEmailLinkLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        sessionReady,
        signInWithGoogle,
        signOut,
        sendEmailLink,
        completeEmailLinkSignIn,
        isEmailLinkSignIn: isEmailLinkSignInFn,
        emailLinkSent,
        emailLinkLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
