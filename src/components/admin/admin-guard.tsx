'use client';

/**
 * AdminGuard - Protège les routes admin
 * Vérifie que l'utilisateur est authentifié, admin et approuvé
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Loader2, ShieldX } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isLoading: authorizationLoading, isAdmin, isApproved } = useAuthorization();

  const isLoading = authLoading || authorizationLoading;
  const canAccess = user && isAdmin && isApproved;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Vérification des droits...</p>
        </div>
      </div>
    );
  }

  // Non-admin or not approved
  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <ShieldX className="h-16 w-16 text-red-400 mx-auto" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Accès non autorisé</h1>
          <p className="mt-2 text-gray-500">
            Vous n&apos;avez pas les droits administrateur pour accéder à cette page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
