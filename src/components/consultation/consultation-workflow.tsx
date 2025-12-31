'use client';

import { useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Save, Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StepIndicator } from './step-indicator';
import { PatientSelector, PatientBadge } from './patient-selector';
import { DictationPanel } from './dictation-panel';
import { CRCEditor, CRCPreview } from './crc-editor';
import { DiagnosticSelector } from './diagnostic-selector';
import { CodagePanel } from './codage-panel';
import {
  useConsultationStore,
  STEP_ORDER,
  STEP_LABELS,
  type ConsultationStep,
} from '@/lib/stores/consultation-store';
import { useCreateConsultation } from '@/lib/hooks/use-create-consultation';
import { useUpdateConsultation } from '@/lib/hooks/use-update-consultation';
import { useAuth } from '@/lib/hooks/use-auth';
import type { CRCGenerated } from '@/types/generation';
import type { DiagnosticSelection, CodageConsultation } from '@/types/codage';

// ============================================================================
// Types
// ============================================================================

interface ConsultationWorkflowProps {
  className?: string;
  onComplete?: (consultationId: string) => void;
  onCreatePatient?: () => void;
}

// ============================================================================
// Auto-save Hook
// ============================================================================

function useAutoSave(interval: number = 30000) {
  const { user } = useAuth();
  const consultationId = useConsultationStore((s) => s.consultationId);
  const hasUnsavedChanges = useConsultationStore((s) => s.hasUnsavedChanges);
  const patient = useConsultationStore((s) => s.patient);
  const transcription = useConsultationStore((s) => s.transcription);
  const crc = useConsultationStore((s) => s.crc);
  const diagnostics = useConsultationStore((s) => s.diagnostics);
  const codage = useConsultationStore((s) => s.codage);
  const motif = useConsultationStore((s) => s.motif);
  const setIsSaving = useConsultationStore((s) => s.setIsSaving);
  const markAsSaved = useConsultationStore((s) => s.markAsSaved);

  const { mutateAsync: createConsultation } = useCreateConsultation();
  const { mutateAsync: updateConsultation } = useUpdateConsultation();

  const saveRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(async () => {
    if (!hasUnsavedChanges || !patient || !user?.uid) return;

    setIsSaving(true);

    try {
      const consultationData = {
        patientId: patient.id,
        praticienId: user.uid,
        date: new Date(),
        motif: motif || crc?.motif || 'Consultation',
        transcription: transcription || undefined,
        crc: crc ?? undefined,
        diagnostics: diagnostics ?? undefined,
        codage: codage ?? undefined,
        statut: 'en_cours' as const,
      };

      if (consultationId) {
        await updateConsultation({
          id: consultationId,
          data: consultationData,
        });
      } else {
        await createConsultation(consultationData);
      }

      markAsSaved();
    } catch (error) {
      console.error('Erreur sauvegarde auto:', error);
      toast.error('Erreur lors de la sauvegarde automatique');
    } finally {
      setIsSaving(false);
    }
  }, [
    hasUnsavedChanges,
    patient,
    user?.uid,
    consultationId,
    motif,
    transcription,
    crc,
    diagnostics,
    codage,
    setIsSaving,
    markAsSaved,
    createConsultation,
    updateConsultation,
  ]);

  useEffect(() => {
    if (saveRef.current) {
      clearInterval(saveRef.current);
    }

    if (hasUnsavedChanges && patient) {
      saveRef.current = setInterval(save, interval);
    }

    return () => {
      if (saveRef.current) {
        clearInterval(saveRef.current);
      }
    };
  }, [hasUnsavedChanges, patient, save, interval]);

  return { save };
}

// ============================================================================
// Step Content Components
// ============================================================================

function StepPatient({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Sélection du patient</h2>
        <p className="text-muted-foreground">
          Recherchez et sélectionnez le patient pour cette consultation
        </p>
      </div>
      <PatientSelector onCreateNew={onCreateNew} />
    </div>
  );
}

function StepDictation() {
  const setTranscription = useConsultationStore((s) => s.setTranscription);
  const setIsGeneratingCRC = useConsultationStore((s) => s.setIsGeneratingCRC);
  const setCRC = useConsultationStore((s) => s.setCRC);
  const nextStep = useConsultationStore((s) => s.nextStep);
  const patient = useConsultationStore((s) => s.patient);

  const handleTranscriptionComplete = useCallback(
    (text: string) => {
      setTranscription(text);
    },
    [setTranscription]
  );

  const handleGenerateCRC = useCallback(
    async (text: string) => {
      setIsGeneratingCRC(true);

      try {
        const response = await fetch('/api/generation/crc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcription: text,
            patientContext: patient
              ? {
                  age: patient.dateNaissance
                    ? Math.floor(
                        (Date.now() - new Date(patient.dateNaissance).getTime()) /
                          (365.25 * 24 * 60 * 60 * 1000)
                      )
                    : undefined,
                  sexe: patient.sexe,
                }
              : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la génération du CRC');
        }

        const data = await response.json();
        setCRC(data.crc as CRCGenerated);
        nextStep();
        toast.success('Compte-rendu généré avec succès');
      } catch (error) {
        console.error('Erreur génération CRC:', error);
        toast.error('Erreur lors de la génération du compte-rendu');
      } finally {
        setIsGeneratingCRC(false);
      }
    },
    [patient, setIsGeneratingCRC, setCRC, nextStep]
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Dictée de la consultation</h2>
        <p className="text-muted-foreground">
          Enregistrez votre consultation vocale pour la transcrire automatiquement
        </p>
      </div>
      <DictationPanel
        onTranscriptionComplete={handleTranscriptionComplete}
        onGenerateCRC={handleGenerateCRC}
      />
    </div>
  );
}

function StepCRC() {
  const crc = useConsultationStore((s) => s.crc);
  const diagnostics = useConsultationStore((s) => s.diagnostics);
  const setDiagnostics = useConsultationStore((s) => s.setDiagnostics);
  const isGeneratingCRC = useConsultationStore((s) => s.isGeneratingCRC);

  const handleDiagnosticsChange = useCallback(
    (selection: DiagnosticSelection) => {
      setDiagnostics(selection);
    },
    [setDiagnostics]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Compte-Rendu de Consultation</h2>
        <p className="text-muted-foreground">
          Vérifiez et modifiez le compte-rendu généré, puis validez les diagnostics
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CRCEditor isGenerating={isGeneratingCRC} />
        <DiagnosticSelector
          onSelectionChange={handleDiagnosticsChange}
          initialSelection={diagnostics ?? undefined}
          diagnosticText={crc?.diagnostic}
        />
      </div>
    </div>
  );
}

function StepCodage() {
  const crc = useConsultationStore((s) => s.crc);
  const diagnostics = useConsultationStore((s) => s.diagnostics);
  const codage = useConsultationStore((s) => s.codage);
  const setCodage = useConsultationStore((s) => s.setCodage);

  const handleCodageChange = useCallback(
    (newCodage: CodageConsultation) => {
      setCodage(newCodage);
    },
    [setCodage]
  );

  // Build CRC text for suggestions
  const crcText = crc
    ? [crc.motif, crc.histoire, crc.diagnostic, crc.conduite, crc.conclusion]
        .filter(Boolean)
        .join('\n\n')
    : undefined;

  // Build diagnostics list for suggestions
  const diagnosticCodes = diagnostics
    ? ([diagnostics.principal?.code, ...diagnostics.secondaires.map((d) => d.code)].filter(
        Boolean
      ) as string[])
    : undefined;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Codage des Actes</h2>
        <p className="text-muted-foreground">
          Sélectionnez les actes NGAP et CCAM à facturer pour cette consultation
        </p>
      </div>

      <CodagePanel
        onCodageChange={handleCodageChange}
        initialCodage={codage ?? undefined}
        crcText={crcText}
        diagnostics={diagnosticCodes}
      />
    </div>
  );
}

function StepValidation({ onComplete }: { onComplete?: (id: string) => void }) {
  const { user } = useAuth();
  const patient = useConsultationStore((s) => s.patient);
  const crc = useConsultationStore((s) => s.crc);
  const diagnostics = useConsultationStore((s) => s.diagnostics);
  const codage = useConsultationStore((s) => s.codage);
  const motif = useConsultationStore((s) => s.motif);
  const transcription = useConsultationStore((s) => s.transcription);
  const consultationId = useConsultationStore((s) => s.consultationId);
  const isSaving = useConsultationStore((s) => s.isSaving);
  const setIsSaving = useConsultationStore((s) => s.setIsSaving);
  const markStepComplete = useConsultationStore((s) => s.markStepComplete);

  const { mutateAsync: createConsultation } = useCreateConsultation();
  const { mutateAsync: updateConsultation } = useUpdateConsultation();

  const handleValidate = useCallback(async () => {
    if (!patient || !user?.uid) return;

    setIsSaving(true);

    try {
      const consultationData = {
        patientId: patient.id,
        praticienId: user.uid,
        date: new Date(),
        motif: motif || crc?.motif || 'Consultation',
        transcription: transcription || undefined,
        crc: crc ?? undefined,
        diagnostics: diagnostics ?? undefined,
        codage: codage ?? undefined,
        statut: 'termine' as const,
      };

      let savedId: string;

      if (consultationId) {
        const result = await updateConsultation({
          id: consultationId,
          data: consultationData,
        });
        savedId = result.id;
      } else {
        const result = await createConsultation(consultationData);
        savedId = result.id;
      }

      markStepComplete('validation');
      toast.success('Consultation validée avec succès');
      onComplete?.(savedId);
    } catch (error) {
      console.error('Erreur validation:', error);
      toast.error('Erreur lors de la validation de la consultation');
    } finally {
      setIsSaving(false);
    }
  }, [
    patient,
    user?.uid,
    motif,
    transcription,
    crc,
    diagnostics,
    codage,
    consultationId,
    setIsSaving,
    markStepComplete,
    createConsultation,
    updateConsultation,
    onComplete,
  ]);

  const formatPrice = (price: number): string => {
    return price.toFixed(2).replace('.', ',') + ' €';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Validation de la Consultation</h2>
        <p className="text-muted-foreground">
          Vérifiez le récapitulatif avant de valider définitivement
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Summary */}
        <div className="space-y-4">
          {/* Patient */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientBadge />
            </CardContent>
          </Card>

          {/* CRC Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Compte-Rendu</CardTitle>
            </CardHeader>
            <CardContent>
              <CRCPreview />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Diagnostics & Codage */}
        <div className="space-y-4">
          {/* Diagnostics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Diagnostics CIM-10</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {diagnostics?.principal && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">Principal:</span>
                  <span className="font-mono text-sm">{diagnostics.principal.code}</span>
                  <span className="text-sm text-muted-foreground truncate">
                    {diagnostics.principal.libelle}
                  </span>
                </div>
              )}
              {diagnostics?.secondaires.map((d) => (
                <div key={d.code} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Secondaire:</span>
                  <span className="font-mono text-sm">{d.code}</span>
                  <span className="text-sm text-muted-foreground truncate">{d.libelle}</span>
                </div>
              ))}
              {!diagnostics?.principal && diagnostics?.secondaires.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Aucun diagnostic</p>
              )}
            </CardContent>
          </Card>

          {/* Codage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Facturation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {codage?.actes.map((a) => (
                <div key={a.code} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-1 bg-muted rounded">
                      {a.type === 'NGAP' ? 'N' : 'C'}
                    </span>
                    <span className="font-medium">{a.code}</span>
                  </div>
                  <span>{formatPrice(a.tarif_base)}</span>
                </div>
              ))}

              {codage && (
                <>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(codage.total_honoraires)}</span>
                  </div>
                </>
              )}

              {!codage?.actes.length && (
                <p className="text-sm text-muted-foreground italic">Aucun acte sélectionné</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validation Button */}
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleValidate} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Validation en cours...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Valider la consultation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Workflow Component
// ============================================================================

export function ConsultationWorkflow({
  className,
  onComplete,
  onCreatePatient,
}: ConsultationWorkflowProps) {
  const currentStep = useConsultationStore((s) => s.currentStep);
  const prevStep = useConsultationStore((s) => s.prevStep);
  const nextStep = useConsultationStore((s) => s.nextStep);
  const canProceedTo = useConsultationStore((s) => s.canProceedTo);
  const isSaving = useConsultationStore((s) => s.isSaving);
  const hasUnsavedChanges = useConsultationStore((s) => s.hasUnsavedChanges);
  const lastSavedAt = useConsultationStore((s) => s.lastSavedAt);

  const { save } = useAutoSave();

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEP_ORDER.length - 1;
  const nextStepKey = STEP_ORDER[currentIndex + 1] as ConsultationStep | undefined;
  const canGoNext = nextStepKey ? canProceedTo(nextStepKey) : false;

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 'patient':
        return <StepPatient onCreateNew={onCreatePatient} />;
      case 'dictation':
        return <StepDictation />;
      case 'crc':
        return <StepCRC />;
      case 'codage':
        return <StepCodage />;
      case 'validation':
        return <StepValidation onComplete={onComplete} />;
      default:
        return null;
    }
  }, [currentStep, onCreatePatient, onComplete]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Indicator */}
      <StepIndicator />

      {/* Save Status */}
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        {isSaving && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Sauvegarde...</span>
          </>
        )}
        {!isSaving && hasUnsavedChanges && (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
            <span>Modifications non sauvegardées</span>
            <Button variant="ghost" size="sm" onClick={save} className="h-7 px-2">
              <Save className="h-3.5 w-3.5 mr-1" />
              Sauvegarder
            </Button>
          </>
        )}
        {!isSaving && !hasUnsavedChanges && lastSavedAt && (
          <>
            <Check className="h-3.5 w-3.5 text-green-500" />
            <span>
              Sauvegardé à{' '}
              {lastSavedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </>
        )}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStepContent()}</div>

      {/* Navigation */}
      {!isLastStep && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={prevStep} disabled={isFirstStep} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            {isFirstStep ? 'Retour' : STEP_LABELS[STEP_ORDER[currentIndex - 1]]}
          </Button>

          <Button onClick={nextStep} disabled={!canGoNext} className="gap-2">
            {nextStepKey ? STEP_LABELS[nextStepKey] : 'Suivant'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
