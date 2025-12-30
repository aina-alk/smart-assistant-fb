'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientHeader, PatientInfo, PatientTabs } from '@/components/patients';
import { usePatient } from '@/lib/hooks/use-patient';

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export default function PatientPage({ params }: PatientPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: patient, isLoading, isError, error, refetch } = usePatient(id);

  const handleEdit = () => {
    router.push(`/dashboard/patients/${id}/edit`);
  };

  // Loading state
  if (isLoading) {
    return <PatientPageSkeleton />;
  }

  // Error state
  if (isError) {
    const isNotFound = error instanceof Error && error.message === 'Patient non trouvé';

    if (isNotFound) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Patient non trouvé</CardTitle>
              <CardDescription>
                Le patient demandé n&apos;existe pas ou a été supprimé.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => router.push('/dashboard/patients')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Une erreur est survenue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/patients')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PatientHeader patient={patient} onEdit={handleEdit} />
      <PatientInfo patient={patient} />
      <PatientTabs patient={patient} />
    </div>
  );
}

function PatientPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Info card skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
