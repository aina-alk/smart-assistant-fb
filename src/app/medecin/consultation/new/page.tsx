'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConsultationWorkflow } from '@/components/consultation/consultation-workflow';
import { useConsultationStore } from '@/lib/stores/consultation-store';
import { usePatient } from '@/lib/hooks/use-patient';

export default function NewConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get('patientId');

  const reset = useConsultationStore((s) => s.reset);
  const setPatient = useConsultationStore((s) => s.setPatient);
  const goToStep = useConsultationStore((s) => s.goToStep);

  const { data: preselectedPatient } = usePatient(patientIdFromUrl ?? '');
  const hasInitialized = useRef(false);

  // Reset store on mount for fresh consultation
  useEffect(() => {
    reset();
    hasInitialized.current = false;
  }, [reset]);

  // Auto-select patient from URL and go to dictation step
  useEffect(() => {
    if (preselectedPatient && !hasInitialized.current) {
      hasInitialized.current = true;
      setPatient(preselectedPatient);
      goToStep('dictation');
    }
  }, [preselectedPatient, setPatient, goToStep]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouvelle consultation</h1>
          <p className="text-muted-foreground">Suivez les étapes pour compléter la consultation</p>
        </div>
      </div>

      {/* Workflow */}
      <ConsultationWorkflow onComplete={handleComplete} onCreatePatient={handleCreatePatient} />
    </div>
  );
}
