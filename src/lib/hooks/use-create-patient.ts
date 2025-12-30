'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Patient } from '@/types';
import type { PatientFormData } from '@/lib/validations/patient';

interface CreatePatientResponse {
  patient: Patient;
}

async function createPatient(data: PatientFormData): Promise<CreatePatientResponse> {
  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      dateNaissance: data.dateNaissance.toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création du patient');
  }

  const result = await response.json();

  // Convertir les dates string en Date
  return {
    patient: {
      ...result.patient,
      dateNaissance: new Date(result.patient.dateNaissance),
      createdAt: new Date(result.patient.createdAt),
      updatedAt: new Date(result.patient.updatedAt),
    },
  };
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      // Invalider le cache des patients pour forcer un refresh
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
