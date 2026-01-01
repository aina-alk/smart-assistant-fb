'use client';

import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ConsultationWorkflow } from '@/components/consultation/consultation-workflow';
import { useConsultationStore, type ConsultationStep } from '@/lib/stores/consultation-store';
import { usePatient } from '@/lib/hooks/use-patient';
import { useConsultation } from '@/lib/hooks/use-consultation';
import type { Consultation } from '@/types';

function determineStartStep(consultation: Consultation): ConsultationStep {
  if (!consultation.transcription || consultation.transcription.length < 50) {
    return 'dictation';
  }
  if (!consultation.crc) {
    return 'dictation';
  }
  if (!consultation.codage?.actes?.length) {
    return 'codage';
  }
  return 'validation';
}

export default function NewConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get('patientId');
  const consultationIdFromUrl = searchParams.get('consultationId');
  const isResuming = !!consultationIdFromUrl;

  const reset = useConsultationStore((s) => s.reset);
  const setPatient = useConsultationStore((s) => s.setPatient);
  const goToStep = useConsultationStore((s) => s.goToStep);
  const loadConsultation = useConsultationStore((s) => s.loadConsultation);
  const markStepComplete = useConsultationStore((s) => s.markStepComplete);

  const { data: preselectedPatient } = usePatient(patientIdFromUrl ?? '');
  const { data: existingConsultation, isLoading: isLoadingConsultation } = useConsultation(
    consultationIdFromUrl ?? ''
  );

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isResuming) {
      reset();
      hasInitialized.current = false;
    }
  }, [reset, isResuming]);

  useEffect(() => {
    if (isResuming && existingConsultation && !hasInitialized.current) {
      hasInitialized.current = true;

      loadConsultation(existingConsultation.id, {
        patientId: existingConsultation.patientId,
        transcription: existingConsultation.transcription ?? '',
        crc: existingConsultation.crc ?? null,
        diagnostics: existingConsultation.diagnostics ?? null,
        codage: existingConsultation.codage ?? null,
        motif: existingConsultation.motif ?? '',
      });

      if (existingConsultation.patientId) {
        markStepComplete('patient');
      }
      if (existingConsultation.transcription && existingConsultation.transcription.length > 50) {
        markStepComplete('dictation');
      }
      if (existingConsultation.crc) {
        markStepComplete('crc');
      }
      if (existingConsultation.codage?.actes?.length) {
        markStepComplete('codage');
      }

      const startStep = determineStartStep(existingConsultation);
      goToStep(startStep);
    }
  }, [isResuming, existingConsultation, loadConsultation, markStepComplete, goToStep]);

  useEffect(() => {
    if (isResuming && existingConsultation && preselectedPatient && hasInitialized.current) {
      setPatient(preselectedPatient);
    }
  }, [isResuming, existingConsultation, preselectedPatient, setPatient]);

  useEffect(() => {
    if (!isResuming && preselectedPatient && !hasInitialized.current) {
      hasInitialized.current = true;
      setPatient(preselectedPatient);
      goToStep('dictation');
    }
  }, [isResuming, preselectedPatient, setPatient, goToStep]);

  const pageTitle = useMemo(() => {
    return isResuming ? 'Reprendre la consultation' : 'Nouvelle consultation';
  }, [isResuming]);

  const pageSubtitle = useMemo(() => {
    return isResuming
      ? 'Continuez là où vous vous êtes arrêté'
      : 'Suivez les étapes pour compléter la consultation';
  }, [isResuming]);

  const handleComplete = useCallback(
    (consultationId: string) => {
      router.push(`/medecin/consultation/${consultationId}`);
    },
    [router]
  );

  const handleCreatePatient = useCallback(() => {
    // Open patient creation in new tab or modal
    // For now, redirect to patients page with create param
    router.push('/medecin/patients?action=create');
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (isResuming && isLoadingConsultation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageSubtitle}</p>
        </div>
      </div>

      <ConsultationWorkflow onComplete={handleComplete} onCreatePatient={handleCreatePatient} />
    </div>
  );
}
