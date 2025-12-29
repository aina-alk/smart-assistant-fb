'use client';

/**
 * Guard pour les pages d'inscription
 * Vérifie que l'utilisateur est authentifié mais n'a pas encore de document
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthorizationStatus } from '@/lib/hooks/use-authorization-status';
import { Skeleton } from '@/components/ui/skeleton';

interface RegistrationGuardProps {
  children: React.ReactNode;
  /** Autoriser seulement les utilisateurs sans document */
  requireNoDocument?: boolean;
  /** Autoriser seulement les utilisateurs en attente */
  requirePending?: boolean;
  /** Autoriser seulement les utilisateurs rejetés */
  requireRejected?: boolean;
}

export function RegistrationGuard({
  children,
  requireNoDocument = false,
  requirePending = false,
  requireRejected = false,
}: RegistrationGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, isLoading, redirectTo } = useAuthorizationStatus(pathname);

  useEffect(() => {
    if (isLoading) return;

    // Vérifier les conditions spécifiques
    if (requireNoDocument && state !== 'no_document') {
      if (redirectTo) {
        router.replace(redirectTo);
      }
      return;
    }

    if (requirePending && state !== 'pending') {
      if (redirectTo) {
        router.replace(redirectTo);
      }
      return;
    }

    if (requireRejected && state !== 'rejected') {
      if (redirectTo) {
        router.replace(redirectTo);
      }
      return;
    }

    // Redirection générale si nécessaire
    if (redirectTo && !requireNoDocument && !requirePending && !requireRejected) {
      router.replace(redirectTo);
    }
  }, [state, isLoading, redirectTo, router, requireNoDocument, requirePending, requireRejected]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // Vérifier l'accès
  if (requireNoDocument && state !== 'no_document') {
    return null;
  }

  if (requirePending && state !== 'pending') {
    return null;
  }

  if (requireRejected && state !== 'rejected') {
    return null;
  }

  return <>{children}</>;
}
