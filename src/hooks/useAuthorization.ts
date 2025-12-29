'use client';

/**
 * Hook d'autorisation - Gère les droits et statuts utilisateur
 */

import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, getIdTokenResult, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { CustomClaims, UserRole, UserStatus } from '@/types/user';

// Type pour les données utilisateur Firestore
interface UserData {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  callbackSlots?: string[];
  callbackNote?: string;
  interviewNotes?: string;
  medecinData?: {
    rpps?: string;
    specialty?: string;
    sector?: number;
  } | null;
  secretaireData?: {
    supervisorName?: string;
    service?: string;
  } | null;
  technicienData?: {
    specialization?: string;
  } | null;
  createdAt?: { toDate: () => Date };
  updatedAt?: { toDate: () => Date };
  approvedAt?: { toDate: () => Date } | null;
  rejectedAt?: { toDate: () => Date } | null;
  rejectionReason?: string | null;
  statusHistory?: Array<{
    status: UserStatus;
    changedAt: { toDate: () => Date };
    changedBy: string;
    note?: string | null;
  }>;
  adminNotes?: Array<{
    note: string;
    timestamp: string;
    by: string;
  }>;
  structureId?: string | null;
}

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

export type { UserData };

export function useAuthorization(): AuthorizationState {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [claims, setClaims] = useState<CustomClaims | null>(null);

  // Écouter l'état d'authentification Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setUserData(null);
        setClaims(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Récupérer les Custom Claims
  const refreshClaims = useCallback(async () => {
    if (!firebaseUser) {
      setClaims(null);
      return;
    }

    try {
      const tokenResult = await getIdTokenResult(firebaseUser, true);
      setClaims({
        role: (tokenResult.claims.role as UserRole) || null,
        status: (tokenResult.claims.status as UserStatus) || null,
        structureId: (tokenResult.claims.structureId as string) || null,
      });
    } catch (err) {
      console.error('Erreur récupération claims:', err);
      setError('Erreur de récupération des droits');
    }
  }, [firebaseUser]);

  // Écouter les changements du document utilisateur
  useEffect(() => {
    if (!firebaseUser) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Récupérer les claims initiaux
    refreshClaims();

    // Écouter le document Firestore
    const unsubscribe = onSnapshot(
      doc(db, 'users', firebaseUser.uid),
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
  }, [firebaseUser, refreshClaims]);

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
 * Utilise les API routes Next.js au lieu des Cloud Functions
 */
export function useAdminActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveUser = useCallback(async (userId: string, structureId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structureId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur approbation');
      }

      return data;
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
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur rejet');
      }

      return data;
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
        const response = await fetch(`/api/admin/users/${userId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newStatus, note }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur mise à jour');
        }

        return data;
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
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur stats');
      }

      return data;
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
