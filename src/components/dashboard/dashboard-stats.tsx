'use client';

import { Users, Stethoscope, ClipboardList, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatients } from '@/lib/hooks/use-patients';
import { useTaches } from '@/lib/hooks/use-taches';

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof Users;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients({ limit: 1 });
  const { data: tachesData, isLoading: isLoadingTaches } = useTaches({ limit: 1 });

  const pendingTaches =
    tachesData?.taches.filter((t) => t.statut !== 'terminee' && t.statut !== 'annulee').length ?? 0;
  const totalTaches = tachesData?.total ?? 0;
  const tachesEnAttente = totalTaches > 0 ? Math.min(pendingTaches, totalTaches) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Patients"
        value={patientsData?.total ?? 0}
        description="Total patients"
        icon={Users}
        isLoading={isLoadingPatients}
      />
      <StatCard title="Consultations" value="—" description="Ce mois" icon={Stethoscope} />
      <StatCard
        title="Tâches"
        value={tachesEnAttente}
        description="En attente"
        icon={ClipboardList}
        isLoading={isLoadingTaches}
      />
      <StatCard title="RDV Aujourd'hui" value="—" description="Programmés" icon={Calendar} />
    </div>
  );
}
