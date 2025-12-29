'use client';

/**
 * Composant d'affichage du status d'attente
 * Affiche le status avec icône et message approprié
 */

import { cn } from '@/lib/utils';
import { Clock, Phone, Search, FileQuestion, CheckCircle } from 'lucide-react';
import type { UserStatus } from '@/types/user';

interface WaitingStatusProps {
  status: UserStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  UserStatus,
  {
    icon: React.ReactNode;
    label: string;
    description: string;
    color: string;
  }
> = {
  pending_call: {
    icon: <Phone className="h-5 w-5" />,
    label: 'En attente de rappel',
    description: 'Un membre de notre équipe vous contactera prochainement pour un bref entretien.',
    color: 'text-amber-600 bg-amber-100',
  },
  in_review: {
    icon: <Search className="h-5 w-5" />,
    label: "En cours d'évaluation",
    description: 'Votre demande est actuellement examinée par notre équipe.',
    color: 'text-blue-600 bg-blue-100',
  },
  pending_callback: {
    icon: <Clock className="h-5 w-5" />,
    label: 'En attente de rappel',
    description: "Nous n'avons pas pu vous joindre. Nous vous rappellerons prochainement.",
    color: 'text-orange-600 bg-orange-100',
  },
  pending_info: {
    icon: <FileQuestion className="h-5 w-5" />,
    label: 'Informations complémentaires requises',
    description: "Nous avons besoin d'informations supplémentaires. Consultez votre email.",
    color: 'text-purple-600 bg-purple-100',
  },
  approved: {
    icon: <CheckCircle className="h-5 w-5" />,
    label: 'Demande approuvée',
    description: 'Félicitations ! Votre demande a été approuvée. Vous pouvez accéder au dashboard.',
    color: 'text-green-600 bg-green-100',
  },
  rejected: {
    icon: <Clock className="h-5 w-5" />,
    label: 'Demande non retenue',
    description: "Votre demande n'a pas été retenue.",
    color: 'text-red-600 bg-red-100',
  },
  suspended: {
    icon: <Clock className="h-5 w-5" />,
    label: 'Compte suspendu',
    description: "Votre compte a été suspendu. Contactez le support pour plus d'informations.",
    color: 'text-gray-600 bg-gray-100',
  },
};

export function WaitingStatus({ status, className }: WaitingStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_call;

  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            config.color
          )}
        >
          {config.icon}
        </div>
        <div>
          <p className="font-semibold">{config.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>
    </div>
  );
}
