'use client';

import { ArrowLeft, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/types';
import { getPatientFullName, getPatientAge } from '@/types';

interface PatientHeaderProps {
  patient: Patient;
  onEdit?: () => void;
}

export function PatientHeader({ patient, onEdit }: PatientHeaderProps) {
  const router = useRouter();
  const fullName = getPatientFullName(patient);
  const age = getPatientAge(patient);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/medecin')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Retour à l&apos;accueil</span>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{fullName}</h2>
            <Badge variant="outline">{patient.sexe === 'M' ? 'Homme' : 'Femme'}</Badge>
          </div>
          <p className="text-muted-foreground">{age} ans</p>
        </div>
      </div>
      <Button onClick={onEdit}>
        <Pencil className="mr-2 h-4 w-4" />
        Modifier
      </Button>
    </div>
  );
}
