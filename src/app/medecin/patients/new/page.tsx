'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientForm } from '@/components/patients';
import { useCreatePatient } from '@/lib/hooks/use-create-patient';
import { toast } from 'sonner';
import type { PatientFormData } from '@/lib/validations/patient';

export default function NewPatientPage() {
  const router = useRouter();
  const createPatient = useCreatePatient();

  const handleSubmit = async (data: PatientFormData) => {
    try {
      const result = await createPatient.mutateAsync(data);
      toast.success(`Patient ${result.patient.prenom} ${result.patient.nom} créé avec succès`);
      router.push('/medecin/patients');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du patient');
    }
  };

  const handleCancel = () => {
    router.push('/medecin/patients');
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
          <h2 className="text-2xl font-bold tracking-tight">Nouveau patient</h2>
          <p className="text-muted-foreground">Créer un nouveau dossier patient</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du patient</CardTitle>
          <CardDescription>
            Renseignez les informations du patient. Les champs marqués d&apos;un * sont
            obligatoires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createPatient.isPending}
            submitLabel="Créer le patient"
          />
        </CardContent>
      </Card>
    </div>
  );
}
