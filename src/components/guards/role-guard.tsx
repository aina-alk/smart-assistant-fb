/**
 * RoleGuard - Protection d'accès par rôle
 * Unifie la logique des anciens DashboardGuard et AdminGuard
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthorization } from '@/hooks/useAuthorization';
import type { UserRole } from '@/types/user';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    isLoading: authzLoading,
    userData,
    isApproved,
    isPending,
    isRejected,
  } = useAuthorization();

  const isLoading = authLoading || authzLoading;
  const userRole = userData?.role;
  const hasAllowedRole = userRole ? allowedRoles.includes(userRole) : false;

  useEffect(() => {
    if (isLoading) return;

    // Non authentifié → login
    if (!user) {
      router.replace('/login');
      return;
    }

    // En attente → page d'attente
    if (isPending) {
      router.replace('/en-attente');
      return;
    }

    // Rejeté → page de refus
    if (isRejected) {
      router.replace('/demande-refusee');
      return;
    }

    // Pas le bon rôle ou non approuvé → accès refusé
    if (!hasAllowedRole || !isApproved) {
      router.replace('/login');
      return;
    }
  }, [isLoading, user, hasAllowedRole, isApproved, isPending, isRejected, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasAllowedRole || !isApproved) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
