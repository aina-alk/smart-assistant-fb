/**
 * Hook central de routage d'autorisation
 * Détermine l'état de l'utilisateur pour le routage intelligent
 */

'use client';

import { useMemo } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useUserDocument } from '@/lib/hooks/use-user-document';
import type { AuthorizationState } from '@/types/registration';
import type { User, UserStatus } from '@/types/user';

interface UseAuthorizationStatusReturn {
  /** État d'autorisation pour le routage */
  state: AuthorizationState;
  /** Utilisateur Firebase Auth (uid, email, displayName) */
  authUser: ReturnType<typeof useAuth>['user'];
  /** Document Firestore de l'utilisateur */
  userDoc: User | null;
  /** Document Firestore existe */
  hasDocument: boolean;
  /** Chargement en cours (auth ou document) */
  isLoading: boolean;
  /** URL de redirection recommandée */
  redirectTo: string | null;
}

/**
 * Statuts considérés comme "en attente"
 */
const PENDING_STATUSES: UserStatus[] = [
  'pending_call',
  'in_review',
  'pending_callback',
  'pending_info',
];

/**
 * Mappe un UserStatus vers un AuthorizationState
 */
function mapStatusToState(status: UserStatus): AuthorizationState {
  if (PENDING_STATUSES.includes(status)) {
    return 'pending';
  }
  if (status === 'approved') {
    return 'approved';
  }
  if (status === 'rejected') {
    return 'rejected';
  }
  if (status === 'suspended') {
    return 'suspended';
  }
  // Fallback
  return 'pending';
}

/**
 * Détermine l'URL de redirection selon l'état
 */
function getRedirectUrl(state: AuthorizationState, currentPath: string): string | null {
  const publicPaths = ['/login', '/auth'];
  const registrationPaths = ['/inscription', '/demande-envoyee', '/en-attente', '/demande-refusee'];

  // Si loading, pas de redirection
  if (state === 'loading') {
    return null;
  }

  // Non authentifié : vers login (sauf si déjà sur page publique)
  if (state === 'unauthenticated') {
    if (publicPaths.some((p) => currentPath.startsWith(p))) {
      return null;
    }
    return '/login';
  }

  // Pas de document : vers inscription
  if (state === 'no_document') {
    if (currentPath === '/inscription') {
      return null;
    }
    return '/inscription';
  }

  // En attente : vers page d'attente
  if (state === 'pending') {
    if (currentPath === '/en-attente' || currentPath === '/demande-envoyee') {
      return null;
    }
    return '/en-attente';
  }

  // Rejeté : vers page de refus
  if (state === 'rejected') {
    if (currentPath === '/demande-refusee') {
      return null;
    }
    return '/demande-refusee';
  }

  // Suspendu : vers page de suspension
  if (state === 'suspended') {
    if (currentPath === '/compte-suspendu') {
      return null;
    }
    return '/compte-suspendu';
  }

  // Approuvé : vers dashboard (si sur page inscription/attente)
  if (state === 'approved') {
    if (registrationPaths.some((p) => currentPath.startsWith(p))) {
      return '/dashboard';
    }
    // Si déjà sur une page protégée ou publique, pas de redirection
    return null;
  }

  return null;
}

/**
 * Hook central qui combine l'auth Firebase et le document Firestore
 * pour déterminer l'état d'autorisation et la redirection appropriée
 */
export function useAuthorizationStatus(currentPath: string = '/'): UseAuthorizationStatusReturn {
  const { user: authUser, loading: authLoading } = useAuth();
  const { userDoc, exists: hasDocument, isLoading: docLoading } = useUserDocument(authUser?.uid);

  // Calculer l'état d'autorisation
  const state = useMemo<AuthorizationState>(() => {
    // Chargement auth
    if (authLoading) {
      return 'loading';
    }

    // Non authentifié
    if (!authUser) {
      return 'unauthenticated';
    }

    // Chargement document
    if (docLoading) {
      return 'loading';
    }

    // Pas de document
    if (!hasDocument || !userDoc) {
      return 'no_document';
    }

    // Mapper le status
    return mapStatusToState(userDoc.status);
  }, [authLoading, authUser, docLoading, hasDocument, userDoc]);

  // Calculer la redirection
  const redirectTo = useMemo(() => {
    return getRedirectUrl(state, currentPath);
  }, [state, currentPath]);

  return {
    state,
    authUser,
    userDoc,
    hasDocument,
    isLoading: authLoading || (!!authUser && docLoading),
    redirectTo,
  };
}

/**
 * Hook simplifié pour vérifier si l'utilisateur peut accéder à une route protégée
 */
export function useCanAccessProtected(): {
  canAccess: boolean;
  isLoading: boolean;
  reason: AuthorizationState;
} {
  const { state, isLoading } = useAuthorizationStatus();

  return {
    canAccess: state === 'approved',
    isLoading,
    reason: state,
  };
}
