'use client';

/**
 * Hook pour récupérer les utilisateurs en temps réel (admin)
 * Attend que l'auth soit prête avec les custom claims avant de faire des requêtes
 */

import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuthInstance, getDbInstance } from '@/lib/firebase/config';
import type { UserData } from '@/hooks/useAuthorization';
import type { UserStatus } from '@/types/user';

interface UseAdminUsersOptions {
  statusFilter?: UserStatus | 'pending' | 'all';
}

interface UseAdminUsersReturn {
  users: UserData[];
  isLoading: boolean;
  error: string | null;
}

// Status considérés comme "en attente d'action"
const PENDING_STATUSES: UserStatus[] = [
  'pending_call',
  'in_review',
  'pending_callback',
  'pending_info',
];

export function useAdminUsers(options: UseAdminUsersOptions = {}): UseAdminUsersReturn {
  const { statusFilter = 'pending' } = options;
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Attendre que l'auth soit prête avec les claims synchronisés
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthInstance(), async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken(true);

          // Synchroniser les claims depuis Firestore si nécessaire
          const syncResponse = await fetch('/api/auth/sync-claims', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          const syncResult = await syncResponse.json();

          // Si les claims ont été mis à jour, récupérer un nouveau token
          if (syncResult.synced) {
            await user.getIdToken(true);
          }

          setAuthReady(true);
        } catch (err) {
          console.error('Erreur sync claims:', err);
          setError("Erreur d'authentification");
          setIsLoading(false);
        }
      } else {
        setAuthReady(false);
        setUsers([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Lancer la query Firestore seulement quand l'auth est prête
  useEffect(() => {
    if (!authReady) return;

    setIsLoading(true);
    setError(null);

    // Construire la query
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

    if (statusFilter === 'pending') {
      constraints.unshift(where('status', 'in', PENDING_STATUSES));
    } else if (statusFilter !== 'all') {
      constraints.unshift(where('status', '==', statusFilter));
    }

    const q = query(collection(getDbInstance(), 'users'), ...constraints);

    // Écouter les changements
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserData[];

        setUsers(usersData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Erreur récupération utilisateurs:', err);
        setError('Erreur lors de la récupération des utilisateurs');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [statusFilter, authReady]);

  return { users, isLoading, error };
}

/**
 * Hook pour récupérer un utilisateur spécifique
 * Utilise une référence document directe (pas collection query)
 */
export function useUserDetail(userId: string | null) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthInstance(), async (authUser) => {
      if (authUser) {
        try {
          const idToken = await authUser.getIdToken(true);

          // Synchroniser les claims depuis Firestore si nécessaire
          const syncResponse = await fetch('/api/auth/sync-claims', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          const syncResult = await syncResponse.json();

          if (syncResult.synced) {
            await authUser.getIdToken(true);
          }

          setAuthReady(true);
        } catch (err) {
          console.error('Erreur sync claims:', err);
          setError("Erreur d'authentification");
          setIsLoading(false);
        }
      } else {
        setAuthReady(false);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady || !userId) {
      if (!userId) {
        setUser(null);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      doc(getDbInstance(), 'users', userId),
      (snapshot) => {
        if (snapshot.exists()) {
          setUser({ id: snapshot.id, ...snapshot.data() } as UserData);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Erreur récupération utilisateur:', err);
        setError('Erreur lors de la récupération');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, authReady]);

  return { user, isLoading, error };
}

/**
 * Hook pour les statistiques calculées côté client
 */
export function useAdminStats() {
  const { users, isLoading, error } = useAdminUsers({ statusFilter: 'all' });

  const stats = users.reduce(
    (acc, user) => {
      switch (user.status) {
        case 'pending_call':
          acc.pendingCall++;
          break;
        case 'in_review':
          acc.inReview++;
          break;
        case 'pending_callback':
          acc.pendingCallback++;
          break;
        case 'pending_info':
          acc.pendingInfo++;
          break;
        case 'approved':
          acc.approved++;
          break;
        case 'rejected':
          acc.rejected++;
          break;
      }
      return acc;
    },
    {
      pendingCall: 0,
      inReview: 0,
      pendingCallback: 0,
      pendingInfo: 0,
      approved: 0,
      rejected: 0,
    }
  );

  return { stats: isLoading ? null : stats, isLoading, error };
}
