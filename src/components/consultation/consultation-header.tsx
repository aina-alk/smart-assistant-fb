'use client';

import { useCallback, useState } from 'react';
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
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/use-auth';
import type { Consultation, ConsultationStatut } from '@/types/consultation';
import type { Patient } from '@/types/patient';
import { isConsultationEditable } from '@/types/consultation';
import { getPatientFullName, getPatientAge } from '@/types/patient';

// ============================================================================
// Types
// ============================================================================

interface ConsultationHeaderProps {
  consultation: Consultation;
  patient?: Patient | null;
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
  patient,
  className,
  backHref,
  onEdit,
}: ConsultationHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadPDF = useCallback(async () => {
    if (!consultation.crc || !patient) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/documents/${consultation.id}/pdf?type=crc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crc: consultation.crc,
          patient: {
            nom: patient.nom,
            prenom: patient.prenom,
            dateNaissance: patient.dateNaissance.toISOString(),
            age: getPatientAge(patient),
            sexe: patient.sexe,
          },
          praticien: user?.displayName
            ? {
                nom: user.displayName,
                specialite: 'ORL',
              }
            : undefined,
          date: consultation.date.toISOString(),
          diagnostics: consultation.diagnostics,
          codage: consultation.codage,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Nom du fichier : CRC_NOM_Prenom_date.pdf
      const patientName = getPatientFullName(patient).replace(/\s+/g, '_');
      const dateStr = consultation.date.toISOString().split('T')[0];
      link.download = `CRC_${patientName}_${dateStr}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [consultation, patient, user]);

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
  const canDownloadPDF = !!consultation.crc && !!patient;

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
        {canDownloadPDF && (
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF
          </Button>
        )}
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
