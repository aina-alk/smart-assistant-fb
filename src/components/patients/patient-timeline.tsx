'use client';

import { useRouter } from 'next/navigation';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import type { Patient } from '@/types';

interface PatientTimelineProps {
  patient: Patient;
}

export function PatientTimeline({ patient }: PatientTimelineProps) {
  const router = useRouter();

  const handleNewConsultation = () => {
    // Rediriger vers la page de nouvelle consultation avec le patient pré-sélectionné
    router.push(`/dashboard/consultation/new?patientId=${patient.id}`);
  };

  // Pour l'instant, afficher un empty state (les consultations seront ajoutées plus tard)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Historique</h3>
        <Button onClick={handleNewConsultation}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle consultation
        </Button>
      </div>

      {/* Empty state */}
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
    </div>
  );
}
