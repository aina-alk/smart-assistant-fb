'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  code?: string;
  onRetry?: () => void;
  showBack?: boolean;
  showHome?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    container: 'py-6',
    icon: 'h-8 w-8',
    iconWrapper: 'h-12 w-12',
    title: 'text-sm font-medium',
    message: 'text-xs',
    code: 'text-xs',
  },
  md: {
    container: 'py-12',
    icon: 'h-10 w-10',
    iconWrapper: 'h-16 w-16',
    title: 'text-lg font-medium',
    message: 'text-sm',
    code: 'text-xs',
  },
  lg: {
    container: 'py-16',
    icon: 'h-12 w-12',
    iconWrapper: 'h-20 w-20',
    title: 'text-xl font-semibold',
    message: 'text-base',
    code: 'text-sm',
  },
};

export function ErrorDisplay({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les données. Veuillez vérifier votre connexion et réessayer.',
  code,
  onRetry,
  showBack = true,
  showHome = false,
  className,
  size = 'md',
}: ErrorDisplayProps) {
  const router = useRouter();
  const styles = sizeStyles[size];

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/medecin');
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        styles.container,
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={cn(
          'mb-4 flex items-center justify-center rounded-full bg-destructive/10',
          styles.iconWrapper
        )}
      >
        <AlertTriangle className={cn('text-destructive', styles.icon)} />
      </div>

      <h3 className={cn('text-foreground', styles.title)}>{title}</h3>

      <p className={cn('mt-2 max-w-md text-muted-foreground', styles.message)}>{message}</p>

      {code && (
        <p className={cn('mt-2 font-mono text-muted-foreground/60', styles.code)}>Code: {code}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} size={size === 'sm' ? 'sm' : 'default'}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        )}

        {showBack && (
          <Button variant="outline" onClick={handleBack} size={size === 'sm' ? 'sm' : 'default'}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        )}

        {showHome && (
          <Button variant="ghost" onClick={handleHome} size={size === 'sm' ? 'sm' : 'default'}>
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Button>
        )}
      </div>
    </div>
  );
}

// Predefined error types for common scenarios
export const errorMessages = {
  network: {
    title: 'Connexion impossible',
    message:
      'Vérifiez votre connexion internet et réessayez. Si le problème persiste, contactez le support.',
    code: 'NETWORK_ERROR',
  },
  notFound: {
    title: 'Ressource introuvable',
    message: "L'élément que vous recherchez n'existe pas ou a été supprimé.",
    code: 'NOT_FOUND',
  },
  unauthorized: {
    title: 'Accès non autorisé',
    message: "Vous n'avez pas les droits nécessaires pour accéder à cette ressource.",
    code: 'UNAUTHORIZED',
  },
  server: {
    title: 'Erreur serveur',
    message: 'Un problème technique est survenu. Notre équipe a été notifiée.',
    code: 'SERVER_ERROR',
  },
  validation: {
    title: 'Données invalides',
    message: 'Veuillez vérifier les informations saisies et réessayer.',
    code: 'VALIDATION_ERROR',
  },
  timeout: {
    title: 'Délai dépassé',
    message: "L'opération a pris trop de temps. Veuillez réessayer.",
    code: 'TIMEOUT',
  },
} as const;

// Convenience component for predefined error types
interface ErrorPresetProps {
  type: keyof typeof errorMessages;
  onRetry?: () => void;
  showBack?: boolean;
  showHome?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ErrorPreset({
  type,
  onRetry,
  showBack,
  showHome,
  className,
  size,
}: ErrorPresetProps) {
  const config = errorMessages[type];
  return (
    <ErrorDisplay
      title={config.title}
      message={config.message}
      code={config.code}
      onRetry={onRetry}
      showBack={showBack}
      showHome={showHome}
      className={className}
      size={size}
    />
  );
}
