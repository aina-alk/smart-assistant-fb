'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PatientTimeline } from './patient-timeline';
import type { Patient } from '@/types';

interface PatientTabsProps {
  patient: Patient;
}

export function PatientTabs({ patient }: PatientTabsProps) {
  return (
    <Tabs defaultValue="timeline" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="timeline" className="flex items-center gap-2">
          Timeline
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            0
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          Tâches
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            0
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
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">Bientôt disponible</p>
          <p className="text-sm text-muted-foreground">
            La gestion des tâches sera disponible dans une prochaine version.
          </p>
        </div>
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
