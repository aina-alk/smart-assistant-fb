'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConsultationWorkflow } from '@/components/consultation/consultation-workflow';
import { useConsultationStore } from '@/lib/stores/consultation-store';

export default function NewConsultationPage() {
  const router = useRouter();
  const reset = useConsultationStore((s) => s.reset);

  // Reset store on mount for fresh consultation
  useEffect(() => {
    reset();
  }, [reset]);

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
