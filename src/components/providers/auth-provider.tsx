/**
 * AuthProvider - Gère l'état d'authentification global
 */

'use client';

import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/config';
import type { AuthContextType, AuthUser } from '@/types/auth';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });

          // Créer le cookie de session côté serveur
          try {
            const idToken = await firebaseUser.getIdToken();
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            });
          } catch (err) {
            console.error('Erreur lors de la création de la session:', err);
          }
        } else {
          setUser(null);
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
      await signInWithPopup(auth, googleProvider);
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
      await firebaseSignOut(auth);

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

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
