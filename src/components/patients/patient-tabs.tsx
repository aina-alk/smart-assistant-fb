'use client';

import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PatientTimeline } from './patient-timeline';
import { PatientTasks } from './patient-tasks';
import { useConsultations } from '@/lib/hooks/use-consultations';
import { useTaches } from '@/lib/hooks/use-taches';
import type { Patient } from '@/types';

interface PatientTabsProps {
  patient: Patient;
}

export function PatientTabs({ patient }: PatientTabsProps) {
  const { data: consultationsData } = useConsultations({ patientId: patient.id });
  const { data: tachesData } = useTaches({ patientId: patient.id });

  // Calculer le nombre total d'éléments dans la timeline
  // (consultations + ordonnances + bilans)
  const timelineItemsCount = useMemo(() => {
    if (!consultationsData?.consultations) return 0;

    let count = consultationsData.consultations.length;

    consultationsData.consultations.forEach((consultation) => {
      count += consultation.ordonnances?.length ?? 0;
      count += consultation.bilans?.length ?? 0;
    });

    return count;
  }, [consultationsData?.consultations]);

  const activeTachesCount =
    tachesData?.taches?.filter((t) => t.statut !== 'terminee' && t.statut !== 'annulee').length ??
    0;

  return (
    <Tabs defaultValue="timeline" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="timeline" className="flex items-center gap-2">
          Timeline
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            {timelineItemsCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          Tâches
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            {activeTachesCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          Documents
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            0
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="timeline" className="mt-6">
        <PatientTimeline patient={patient} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-6">
        <PatientTasks patient={patient} />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">Bientôt disponible</p>
          <p className="text-sm text-muted-foreground">
            Les documents générés seront affichés ici dans une prochaine version.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
