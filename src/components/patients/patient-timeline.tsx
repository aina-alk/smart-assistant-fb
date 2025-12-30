'use client';

import { useRouter } from 'next/navigation';
import { Plus, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <CalendarPlus className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">Aucune consultation</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Ce patient n&apos;a pas encore de consultation enregistrée.
        </p>
        <Button variant="outline" onClick={handleNewConsultation}>
          <Plus className="mr-2 h-4 w-4" />
          Créer la première consultation
        </Button>
      </div>
    </div>
  );
}
