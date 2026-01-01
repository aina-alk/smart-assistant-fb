'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Calendar, Stethoscope, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useConsultations } from '@/lib/hooks/use-consultations';
import type { Patient, Consultation, ConsultationStatut } from '@/types';

interface PatientTimelineProps {
  patient: Patient;
}

const STATUT_CONFIG: Record<
  ConsultationStatut,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  brouillon: { label: 'Brouillon', variant: 'outline' },
  en_cours: { label: 'En cours', variant: 'secondary' },
  termine: { label: 'Terminé', variant: 'default' },
  annule: { label: 'Annulé', variant: 'destructive' },
};

function ConsultationCard({
  consultation,
  onClick,
  onDelete,
}: {
  consultation: Consultation;
  onClick: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const statusConfig = STATUT_CONFIG[consultation.statut];
  const canDelete = consultation.statut !== 'termine';
  const dateFormatted = consultation.date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(consultation.id);
    } finally {
      setIsDeleting(false);
      setDialogOpen(false);
    }
  };

  return (
    <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={onClick}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Stethoscope className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{consultation.motif || 'Consultation'}</p>
            <Badge variant={statusConfig.variant} className="shrink-0">
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{dateFormatted}</span>
            {consultation.diagnostics?.principal && (
              <>
                <span className="mx-1">•</span>
                <span className="truncate">{consultation.diagnostics.principal.code}</span>
              </>
            )}
          </div>
        </div>

        {canDelete && (
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDialogOpen(true);
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette consultation ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. La consultation sera définitivement supprimée du
                  dossier FHIR.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PatientTimeline({ patient }: PatientTimelineProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useConsultations({ patientId: patient.id });

  const handleNewConsultation = () => {
    router.push(`/medecin/consultation/new?patientId=${patient.id}`);
  };

  const handleViewConsultation = (consultationId: string) => {
    router.push(`/medecin/consultation/${consultationId}`);
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    const response = await fetch(`/api/consultations/${consultationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la suppression');
    }
    await refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Historique</h3>
        <Button onClick={handleNewConsultation}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle consultation
        </Button>
      </div>

      {isLoading && <TimelineSkeleton />}

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">Erreur lors du chargement des consultations</p>
        </div>
      )}

      {!isLoading && !isError && data?.consultations && data.consultations.length > 0 && (
        <div className="space-y-3">
          {data.consultations.map((consultation) => (
            <ConsultationCard
              key={consultation.id}
              consultation={consultation}
              onClick={() => handleViewConsultation(consultation.id)}
              onDelete={handleDeleteConsultation}
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && (!data?.consultations || data.consultations.length === 0) && (
        <div className="rounded-lg border border-dashed">
          <EmptyState
            icon={FileText}
            title="Aucune consultation"
            description="Ce patient n'a pas encore de consultation enregistrée."
            action={{
              label: '+ Créer la première consultation',
              onClick: handleNewConsultation,
            }}
          />
        </div>
      )}
    </div>
  );
}
