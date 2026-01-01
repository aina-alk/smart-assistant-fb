/**
 * Toast helpers - Utilitaires pour notifications standardisées
 *
 * Utilise sonner pour des toasts cohérents à travers l'application
 */

import { toast } from 'sonner';

/** Durées standard pour les toasts */
const DURATION = {
  short: 3000,
  default: 4000,
  long: 6000,
} as const;

/**
 * Toast de succès avec message par défaut
 */
export function showSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: DURATION.default,
  });
}

/**
 * Toast d'erreur avec message et description optionnelle
 */
export function showError(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: DURATION.long,
  });
}

/**
 * Toast d'information neutre
 */
export function showInfo(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: DURATION.default,
  });
}

/**
 * Toast d'avertissement
 */
export function showWarning(message: string, description?: string) {
  toast.warning(message, {
    description,
    duration: DURATION.long,
  });
}

/**
 * Toast avec action - utile pour undo ou confirmation
 */
export function showWithAction(
  message: string,
  actionLabel: string,
  onAction: () => void,
  options?: { description?: string; onDismiss?: () => void }
) {
  toast(message, {
    description: options?.description,
    duration: DURATION.long,
    action: {
      label: actionLabel,
      onClick: onAction,
    },
    onDismiss: options?.onDismiss,
  });
}

/**
 * Toast de chargement avec promise - affiche loading/success/error automatiquement
 */
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    duration: DURATION.default,
  });
}

/** Messages d'erreur communs réutilisables */
export const errorMessages = {
  network: 'Erreur de connexion. Vérifiez votre connexion internet.',
  server: 'Erreur serveur. Veuillez réessayer.',
  unauthorized: "Vous n'êtes pas autorisé à effectuer cette action.",
  notFound: 'Ressource introuvable.',
  validation: 'Données invalides. Vérifiez votre saisie.',
  generic: 'Une erreur est survenue. Veuillez réessayer.',
} as const;

/** Messages de succès communs réutilisables */
export const successMessages = {
  saved: 'Enregistré avec succès',
  created: 'Créé avec succès',
  updated: 'Modifié avec succès',
  deleted: 'Supprimé avec succès',
  copied: 'Copié dans le presse-papiers',
} as const;
