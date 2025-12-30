/**
 * Dashboard Page - Smart redirector vers /{role}
 * Redirige automatiquement vers le dashboard du rôle de l'utilisateur
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthorizationStatus } from '@/lib/hooks/use-authorization-status';

export default function DashboardRedirector() {
  const router = useRouter();
  const { redirectTo, isLoading } = useAuthorizationStatus('/dashboard');

  useEffect(() => {
    if (!isLoading && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isLoading, redirectTo, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirection...</p>
      </div>
    </div>
  );
}
