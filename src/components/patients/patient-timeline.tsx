'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  Calendar,
  Stethoscope,
  ChevronRight,
  ChevronDown,
  Trash2,
  Loader2,
  Pill,
  TestTube,
  AlertTriangle,
} from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OrdonnanceViewDialog } from '@/components/ordonnance/ordonnance-dialog';
import { BilanViewDialog } from '@/components/bilan/bilan-dialog';
import { useConsultations } from '@/lib/hooks/use-consultations';
import {
  type Patient,
  type Consultation,
  type ConsultationStatut,
  isConsultationEditable,
} from '@/types';
import type { Ordonnance } from '@/types/ordonnance';
import type { BilanPrescription } from '@/types/bilan';

// ============================================================================
// Types pour la timeline unifiée
// ============================================================================

interface ConsultationWithPrescriptions {
  consultation: Consultation;
  ordonnances: Ordonnance[];
  bilans: BilanPrescription[];
}

interface PatientTimelineProps {
  patient: Patient;
}

interface PreviewState {
  type: 'ordonnance' | 'bilan' | null;
  ordonnance: Ordonnance | null;
  bilan: BilanPrescription | null;
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

// ============================================================================
// Ordonnance Inline Item (nested in consultation)
// ============================================================================

function OrdonnanceInlineItem({
  ordonnance,
  onClick,
}: {
  ordonnance: Ordonnance;
  onClick: () => void;
}) {
  const medicamentCount = ordonnance.medicaments.length;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
        <Pill className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Ordonnance</p>
          <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300">
            {medicamentCount} médicament{medicamentCount > 1 ? 's' : ''}
          </Badge>
        </div>
        {ordonnance.medicaments.length > 0 && (
          <p className="text-xs text-muted-foreground truncate">
            {ordonnance.medicaments[0].nom}
            {ordonnance.medicaments.length > 1 && ` +${ordonnance.medicaments.length - 1}`}
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

// ============================================================================
// Bilan Inline Item (nested in consultation)
// ============================================================================

function BilanInlineItem({ bilan, onClick }: { bilan: BilanPrescription; onClick: () => void }) {
  const examenCount = bilan.examens.length;
  const hasUrgent = bilan.examens.some((e) => e.urgent);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
        <TestTube className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Bilan / Examens</p>
          <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">
            {examenCount} examen{examenCount > 1 ? 's' : ''}
          </Badge>
          {hasUrgent && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" />
              Urgent
            </Badge>
          )}
        </div>
        {bilan.examens.length > 0 && (
          <p className="text-xs text-muted-foreground truncate">
            {bilan.examens[0].code}
            {bilan.examens.length > 1 && ` +${bilan.examens.length - 1}`}
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

// ============================================================================
// Timeline Skeleton
// ============================================================================

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

// ============================================================================
// Consultation Card with Prescriptions (nested ordonnances/bilans)
// ============================================================================

function ConsultationCardWithPrescriptions({
  item,
  onViewConsultation,
  onDeleteConsultation,
  onViewOrdonnance,
  onViewBilan,
}: {
  item: ConsultationWithPrescriptions;
  onViewConsultation: (consultation: Consultation) => void;
  onDeleteConsultation: (id: string) => Promise<void>;
  onViewOrdonnance: (ordonnance: Ordonnance) => void;
  onViewBilan: (bilan: BilanPrescription) => void;
}) {
  const hasPrescriptions = item.ordonnances.length > 0 || item.bilans.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  if (!hasPrescriptions) {
    return (
      <ConsultationCard
        consultation={item.consultation}
        onClick={() => onViewConsultation(item.consultation)}
        onDelete={onDeleteConsultation}
      />
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardContent
            className="flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/50"
            onClick={(e) => {
              // Si on clique sur le bouton supprimer, ne pas toggle
              if ((e.target as HTMLElement).closest('button[data-delete]')) {
                return;
              }
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{item.consultation.motif || 'Consultation'}</p>
                <Badge
                  variant={STATUT_CONFIG[item.consultation.statut].variant}
                  className="shrink-0"
                >
                  {STATUT_CONFIG[item.consultation.statut].label}
                </Badge>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {item.ordonnances.length + item.bilans.length} prescription
                  {item.ordonnances.length + item.bilans.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {item.consultation.date.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                {item.consultation.diagnostics?.principal && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="truncate">{item.consultation.diagnostics.principal.code}</span>
                  </>
                )}
              </div>
            </div>

            {/* Delete button for non-termine consultations */}
            {item.consultation.statut !== 'termine' && (
              <DeleteConsultationButton
                consultationId={item.consultation.id}
                onDelete={onDeleteConsultation}
              />
            )}

            {/* Expand/collapse indicator */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewConsultation(item.consultation);
                }}
              >
                Voir
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t bg-muted/30 px-4 py-2 space-y-1">
            {item.ordonnances.map((ordonnance) => (
              <OrdonnanceInlineItem
                key={ordonnance.id}
                ordonnance={ordonnance}
                onClick={() => onViewOrdonnance(ordonnance)}
              />
            ))}
            {item.bilans.map((bilan) => (
              <BilanInlineItem key={bilan.id} bilan={bilan} onClick={() => onViewBilan(bilan)} />
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ============================================================================
// Delete Consultation Button (extracted for reuse)
// ============================================================================

function DeleteConsultationButton({
  consultationId,
  onDelete,
}: {
  consultationId: string;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(consultationId);
    } finally {
      setIsDeleting(false);
      setDialogOpen(false);
    }
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          data-delete
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
            Cette action est irréversible. La consultation sera définitivement supprimée du dossier
            FHIR.
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
  );
}

// ============================================================================
// Main Timeline Component
// ============================================================================

export function PatientTimeline({ patient }: PatientTimelineProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useConsultations({ patientId: patient.id });

  // State for preview dialogs
  const [previewState, setPreviewState] = useState<PreviewState>({
    type: null,
    ordonnance: null,
    bilan: null,
  });

  // Group consultations with their prescriptions
  const consultationsWithPrescriptions = useMemo<ConsultationWithPrescriptions[]>(() => {
    if (!data?.consultations) return [];

    return data.consultations
      .map((consultation) => ({
        consultation,
        ordonnances: consultation.ordonnances ?? [],
        bilans: consultation.bilans ?? [],
      }))
      .sort((a, b) => b.consultation.date.getTime() - a.consultation.date.getTime());
  }, [data?.consultations]);

  const handleNewConsultation = useCallback(() => {
    router.push(`/medecin/consultation/new?patientId=${patient.id}`);
  }, [router, patient.id]);

  const handleViewConsultation = useCallback(
    (consultation: Consultation) => {
      if (isConsultationEditable(consultation)) {
        router.push(
          `/medecin/consultation/new?consultationId=${consultation.id}&patientId=${patient.id}`
        );
      } else {
        router.push(`/medecin/consultation/${consultation.id}`);
      }
    },
    [router, patient.id]
  );

  const handleDeleteConsultation = useCallback(
    async (consultationId: string) => {
      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }
      await refetch();
    },
    [refetch]
  );

  const handleViewOrdonnance = useCallback((ordonnance: Ordonnance) => {
    setPreviewState({ type: 'ordonnance', ordonnance, bilan: null });
  }, []);

  const handleViewBilan = useCallback((bilan: BilanPrescription) => {
    setPreviewState({ type: 'bilan', ordonnance: null, bilan });
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewState({ type: null, ordonnance: null, bilan: null });
  }, []);

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

      {!isLoading && !isError && consultationsWithPrescriptions.length > 0 && (
        <div className="space-y-3">
          {consultationsWithPrescriptions.map((item) => (
            <ConsultationCardWithPrescriptions
              key={item.consultation.id}
              item={item}
              onViewConsultation={handleViewConsultation}
              onDeleteConsultation={handleDeleteConsultation}
              onViewOrdonnance={handleViewOrdonnance}
              onViewBilan={handleViewBilan}
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && consultationsWithPrescriptions.length === 0 && (
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

      {/* Preview Dialogs */}
      {previewState.type === 'ordonnance' && previewState.ordonnance && (
        <OrdonnanceViewDialog
          open={true}
          onClose={handleClosePreview}
          ordonnance={previewState.ordonnance}
          patient={patient}
        />
      )}

      {previewState.type === 'bilan' && previewState.bilan && (
        <BilanViewDialog
          open={true}
          onClose={handleClosePreview}
          bilan={previewState.bilan}
          patient={patient}
        />
      )}
    </div>
  );
}
