'use client';

/**
 * Context d'autorisation - Fournit l'état d'autorisation à toute l'app
 */

import { createContext, useContext, ReactNode } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';
import type { CustomClaims, UserData } from '@/types/user';

interface AuthorizationContextType {
  isLoading: boolean;
  error: string | null;
  userData: UserData | null;
  claims: CustomClaims | null;
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  isAdmin: boolean;
  isMedecin: boolean;
  refreshClaims: () => Promise<void>;
}

const AuthorizationContext = createContext<AuthorizationContextType | null>(null);

interface AuthorizationProviderProps {
  children: ReactNode;
}

export function AuthorizationProvider({ children }: AuthorizationProviderProps) {
  const authorization = useAuthorization();

  return (
    <AuthorizationContext.Provider value={authorization}>{children}</AuthorizationContext.Provider>
  );
}

export function useAuthorizationContext(): AuthorizationContextType {
  const context = useContext(AuthorizationContext);
  if (!context) {
    throw new Error('useAuthorizationContext must be used within AuthorizationProvider');
  }
  return context;
}

/**
 * Hook de garde pour les routes protégées
 */
export function useRequireApproval() {
  const { isLoading, isApproved, isPending, isRejected, userData } = useAuthorizationContext();

  return {
    isLoading,
    isApproved,
    isPending,
    isRejected,
    userData,
    canAccess: isApproved,
  };
}

/**
 * Hook de garde pour les routes admin
 */
export function useRequireAdmin() {
  const { isLoading, isApproved, isAdmin, userData } = useAuthorizationContext();

  return {
    isLoading,
    isAdmin,
    userData,
    canAccess: isApproved && isAdmin,
  };
}
