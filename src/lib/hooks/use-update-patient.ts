'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Patient } from '@/types';
import type { PatientUpdateApiData } from '@/lib/validations/patient';

interface UpdatePatientParams {
  id: string;
  data: PatientUpdateApiData;
}

interface UpdatePatientResponse {
  patient: Patient;
}

async function updatePatient({ id, data }: UpdatePatientParams): Promise<UpdatePatientResponse> {
  const response = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      dateNaissance: data.dateNaissance?.toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour du patient');
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

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePatient,
    onSuccess: (data) => {
      // Mettre à jour le cache du patient
      queryClient.setQueryData(['patient', data.patient.id], data.patient);
      // Invalider la liste des patients
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
