'use client';

import { use, useEffect, useCallback, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useConsultation } from '@/lib/hooks/use-consultation';
import { usePatient } from '@/lib/hooks/use-patient';
import { useConsultationStore } from '@/lib/stores/consultation-store';
import { isConsultationEditable } from '@/types/consultation';
import { CRCEditor } from '@/components/consultation/crc-editor';
import { DiagnosticSelector } from '@/components/consultation/diagnostic-selector';
import { CodagePanel } from '@/components/consultation/codage-panel';

// ============================================================================
// Types
// ============================================================================

interface EditConsultationPageProps {
  params: Promise<{ id: string }>;
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function EditSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Editor sections skeleton */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Error State
// ============================================================================

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Erreur</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">{message}</p>
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
    </div>
  );
}

// ============================================================================
// Not Editable State
// ============================================================================

function NotEditableState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Modification impossible</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Cette consultation ne peut plus être modifiée car elle est terminée ou annulée.
      </p>
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voir la consultation
      </Button>
    </div>
  );
}

// ============================================================================
// Main Edit Page Component
// ============================================================================

export default function EditConsultationPage({ params }: EditConsultationPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Local state
  const [hasLoadedStore, setHasLoadedStore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch consultation
  const {
    data: consultation,
    isLoading: isLoadingConsultation,
    error: consultationError,
    refetch: refetchConsultation,
  } = useConsultation(id);

  // Fetch patient
  const { data: patient } = usePatient(consultation?.patientId ?? '');

  // Store actions
  const loadConsultation = useConsultationStore((s) => s.loadConsultation);
  const crc = useConsultationStore((s) => s.crc);
  const diagnostics = useConsultationStore((s) => s.diagnostics);
  const codage = useConsultationStore((s) => s.codage);
  const hasUnsavedChanges = useConsultationStore((s) => s.hasUnsavedChanges);
  const setPatient = useConsultationStore((s) => s.setPatient);

  // Load consultation into store when data is fetched
  useEffect(() => {
    if (consultation && !hasLoadedStore) {
      loadConsultation(consultation.id, {
        patientId: consultation.patientId,
        transcription: consultation.transcription ?? '',
        crc: consultation.crc ?? null,
        diagnostics: consultation.diagnostics ?? null,
        codage: consultation.codage ?? null,
        motif: consultation.motif ?? '',
      });
      setHasLoadedStore(true);
    }
  }, [consultation, hasLoadedStore, loadConsultation]);

  // Load patient into store
  useEffect(() => {
    if (patient) {
      setPatient(patient);
    }
  }, [patient, setPatient]);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?'
      );
      if (!confirm) return;
    }
    router.push(`/medecin/consultation/${id}`);
  }, [router, id, hasUnsavedChanges]);

  const handleSave = useCallback(async () => {
    if (!consultation) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const response = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crc,
          diagnostics,
          codage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
      }

      setSaveSuccess(true);
      useConsultationStore.getState().markAsSaved();

      // Refetch to sync with server
      await refetchConsultation();

      // Auto-redirect after short delay
      setTimeout(() => {
        router.push(`/medecin/consultation/${id}`);
      }, 1000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  }, [consultation, id, crc, diagnostics, codage, refetchConsultation, router]);

  // Loading state
  if (isLoadingConsultation) {
    return <EditSkeleton />;
  }

  // Error: consultation not found
  if (consultationError?.message === 'Consultation non trouvée') {
    notFound();
  }

  // Error: other errors
  if (consultationError) {
    return (
      <ErrorState
        message={consultationError.message || 'Une erreur est survenue'}
        onBack={() => router.back()}
      />
    );
  }

  // No consultation data
  if (!consultation) {
    return <EditSkeleton />;
  }

  // Check if editable
  if (!isConsultationEditable(consultation)) {
    return <NotEditableState onBack={() => router.push(`/medecin/consultation/${id}`)} />;
  }

  // Format date
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(consultation.date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Modifier la consultation</h1>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-amber-600 border-amber-400">
                  Modifications non enregistrées
                </Badge>
              )}
              {saveSuccess && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enregistré
                </Badge>
              )}
              {saveError && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {saveError}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-start">
          <Button variant="outline" onClick={handleBack} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* CRC Editor */}
      <CRCEditor />

      {/* Diagnostics + Codage */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DiagnosticSelector />
        <CodagePanel />
      </div>

      {/* Sticky save bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t sm:hidden">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleBack} disabled={isSaving}>
            Annuler
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
