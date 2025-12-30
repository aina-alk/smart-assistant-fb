'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientForm } from '@/components/patients';
import { usePatient } from '@/lib/hooks/use-patient';
import { useUpdatePatient } from '@/lib/hooks/use-update-patient';
import { toast } from 'sonner';
import type { PatientFormData } from '@/lib/validations/patient';

interface EditPatientPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPatientPage({ params }: EditPatientPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: patient, isLoading, isError, error, refetch } = usePatient(id);
  const updatePatient = useUpdatePatient();

  const handleSubmit = async (data: PatientFormData) => {
    try {
      await updatePatient.mutateAsync({ id, data });
      toast.success('Patient modifié avec succès');
      router.push(`/dashboard/patients/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la modification');
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/patients/${id}`);
  };

  // Loading state
  if (isLoading) {
    return <EditPatientPageSkeleton />;
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

  // Préparer les valeurs par défaut pour le formulaire
  const defaultValues: Partial<PatientFormData> = {
    nom: patient.nom,
    prenom: patient.prenom,
    dateNaissance: patient.dateNaissance,
    sexe: patient.sexe,
    telephone: patient.telephone || '',
    email: patient.email || '',
    adresse: patient.adresse || '',
    codePostal: patient.codePostal || '',
    ville: patient.ville || '',
    nir: patient.nir || '',
    mutuelleNom: patient.mutuelleNom || '',
    mutuelleNumero: patient.mutuelleNumero || '',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Retour</span>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Modifier le patient</h2>
          <p className="text-muted-foreground">
            {patient.prenom} {patient.nom}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du patient</CardTitle>
          <CardDescription>
            Modifiez les informations du patient. Les champs marqués d&apos;un * sont obligatoires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updatePatient.isPending}
            submitLabel="Enregistrer les modifications"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function EditPatientPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Form skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
