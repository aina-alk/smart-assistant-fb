'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  FileEdit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Consultation, ConsultationStatut } from '@/types/consultation';
import { isConsultationEditable } from '@/types/consultation';

// ============================================================================
// Types
// ============================================================================

interface ConsultationHeaderProps {
  consultation: Consultation;
  className?: string;
  backHref?: string;
  onEdit?: () => void;
}

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG: Record<
  ConsultationStatut,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
  }
> = {
  brouillon: {
    label: 'Brouillon',
    variant: 'outline',
    icon: <FileEdit className="h-3 w-3" />,
  },
  en_cours: {
    label: 'En cours',
    variant: 'secondary',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  termine: {
    label: 'Terminée',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  annule: {
    label: 'Annulée',
    variant: 'destructive',
    icon: <XCircle className="h-3 w-3" />,
  },
};

// ============================================================================
// Consultation Header Component
// ============================================================================

export function ConsultationHeader({
  consultation,
  className,
  backHref,
  onEdit,
}: ConsultationHeaderProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  }, [router, backHref]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit();
    } else {
      router.push(`/medecin/consultation/${consultation.id}/edit`);
    }
  }, [router, consultation.id, onEdit]);

  // Format date
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(consultation.date);

  const formattedTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(consultation.date);

  const statusConfig = STATUS_CONFIG[consultation.statut];
  const canEdit = isConsultationEditable(consultation);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* Left side: Back + Title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Consultation</h1>
            <Badge variant={statusConfig.variant} className="gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formattedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 sm:self-start">
        {canEdit && (
          <Button onClick={handleEdit} className="gap-2">
            <Edit2 className="h-4 w-4" />
            Modifier
          </Button>
        )}
      </div>
    </div>
  );
}
