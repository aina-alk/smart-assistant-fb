/**
 * DashboardGuard - Protège l'accès au dashboard
 * Seuls les médecins approuvés peuvent accéder
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthorization } from '@/hooks/useAuthorization';

interface DashboardGuardProps {
  children: React.ReactNode;
}

export function DashboardGuard({ children }: DashboardGuardProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    isLoading: authzLoading,
    isMedecin,
    isApproved,
    isPending,
    isRejected,
  } = useAuthorization();

  const isLoading = authLoading || authzLoading;

  useEffect(() => {
    if (isLoading) return;

    // Non authentifié → login
    if (!user) {
      router.replace('/login?redirect=/dashboard');
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

    // Non médecin ou non approuvé → accès refusé (retour login)
    if (!isMedecin || !isApproved) {
      router.replace('/login');
      return;
    }
  }, [isLoading, user, isMedecin, isApproved, isPending, isRejected, router]);

  // État de chargement
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

  // Conditions non remplies (redirection en cours)
  if (!user || !isMedecin || !isApproved) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirection...</p>
        </div>
      </div>
    );
  }

  // Accès autorisé
  return <>{children}</>;
}
