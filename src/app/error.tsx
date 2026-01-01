'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Une erreur est survenue</h1>

        <p className="mt-4 max-w-md text-muted-foreground">
          L&apos;application a rencontré un problème inattendu. Essayez de recharger la page ou
          retournez à l&apos;accueil.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-4 max-w-lg rounded-md bg-muted p-4">
            <p className="font-mono text-xs text-muted-foreground break-all">{error.message}</p>
          </div>
        )}

        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">Code: {error.digest}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>

          <Button variant="outline" asChild>
            <a href="/medecin">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </a>
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/60">
          Si le problème persiste, contactez le support technique.
        </p>
      </div>
    </div>
  );
}
