/**
 * Hook pour récupérer le document utilisateur avec listener temps réel
 * Écoute les changements sur users/{uid} pour détecter les mises à jour de status
 */

'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, type DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User } from '@/types/user';

interface UseUserDocumentOptions {
  /** Si false, ne pas s'abonner aux changements */
  enabled?: boolean;
}

interface UseUserDocumentReturn {
  /** Document utilisateur ou null si inexistant */
  userDoc: User | null;
  /** Le document existe dans Firestore */
  exists: boolean;
  /** Chargement en cours */
  isLoading: boolean;
  /** Erreur éventuelle */
  error: Error | null;
}

/**
 * Hook pour écouter en temps réel le document users/{uid}
 * Permet de détecter immédiatement quand un admin change le status
 */
export function useUserDocument(
  uid: string | null | undefined,
  options: UseUserDocumentOptions = {}
): UseUserDocumentReturn {
  const { enabled = true } = options;

  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [exists, setExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state if no uid or disabled
    if (!uid || !enabled) {
      setUserDoc(null);
      setExists(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Créer le listener temps réel
    const userRef = doc(db, 'users', uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as User;
          setUserDoc(data);
          setExists(true);
        } else {
          setUserDoc(null);
          setExists(false);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error(`Erreur listener users/${uid}:`, err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    // Cleanup
    return () => unsubscribe();
  }, [uid, enabled]);

  return {
    userDoc,
    exists,
    isLoading,
    error,
  };
}
