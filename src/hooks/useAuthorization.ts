'use client';

/**
 * Hook d'autorisation - Gère les droits et statuts utilisateur
 */

import { useCallback, useEffect, useState } from 'react';
import { getIdTokenResult } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '@/contexts/AuthContext';
import { db, functions } from '@/lib/firebase/config';
import type { CustomClaims, UserData, UserRole, UserStatus } from '@/types/user';

interface AuthorizationState {
  // État de chargement
  isLoading: boolean;
  error: string | null;

  // Données utilisateur
  userData: UserData | null;
  claims: CustomClaims | null;

  // Helpers de statut
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  isAdmin: boolean;
  isMedecin: boolean;

  // Actions
  refreshClaims: () => Promise<void>;
}

export function useAuthorization(): AuthorizationState {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [claims, setClaims] = useState<CustomClaims | null>(null);

  // Récupérer les Custom Claims
  const refreshClaims = useCallback(async () => {
    if (!user) {
      setClaims(null);
      return;
    }

    try {
      const tokenResult = await getIdTokenResult(user, true);
      setClaims({
        role: (tokenResult.claims.role as UserRole) || 'medecin',
        status: (tokenResult.claims.status as UserStatus) || 'pending_call',
        structureId: (tokenResult.claims.structureId as string) || null,
      });
    } catch (err) {
      console.error('Erreur récupération claims:', err);
      setError('Erreur de récupération des droits');
    }
  }, [user]);

  // Écouter les changements du document utilisateur
  useEffect(() => {
    if (!user) {
      setUserData(null);
      setClaims(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Récupérer les claims initiaux
    refreshClaims();

    // Écouter le document Firestore
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setUserData({ id: snapshot.id, ...snapshot.data() } as UserData);
        } else {
          setUserData(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Erreur écoute utilisateur:', err);
        setError('Erreur de synchronisation');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, refreshClaims]);

  // Rafraîchir les claims quand le statut change
  useEffect(() => {
    if (userData?.status && claims?.status !== userData.status) {
      refreshClaims();
    }
  }, [userData?.status, claims?.status, refreshClaims]);

  // Helpers calculés
  const status = claims?.status || userData?.status;
  const role = claims?.role || userData?.role;

  return {
    isLoading,
    error,
    userData,
    claims,
    isApproved: status === 'approved',
    isPending: ['pending_call', 'in_review', 'pending_callback', 'pending_info'].includes(
      status || ''
    ),
    isRejected: status === 'rejected',
    isAdmin: role === 'admin',
    isMedecin: role === 'medecin',
    refreshClaims,
  };
}

/**
 * Hook pour les actions admin
 */
export function useAdminActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveUser = useCallback(async (userId: string, structureId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fn = httpsCallable(functions, 'approveUser');
      const result = await fn({ userId, structureId });
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur approbation';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectUser = useCallback(async (userId: string, reason?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fn = httpsCallable(functions, 'rejectUser');
      const result = await fn({ userId, reason });
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur rejet';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(
    async (userId: string, newStatus: UserStatus, note?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const fn = httpsCallable(functions, 'updateUserStatus');
        const result = await fn({ userId, newStatus, note });
        return result.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur mise à jour';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getAdminStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fn = httpsCallable(functions, 'getAdminStats');
      const result = await fn({});
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur stats';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    approveUser,
    rejectUser,
    updateUserStatus,
    getAdminStats,
  };
}
