'use client';

import { useQuery } from '@tanstack/react-query';
import type { Patient } from '@/types';

async function fetchPatient(id: string): Promise<Patient> {
  const response = await fetch(`/api/patients/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Patient non trouvé');
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération du patient');
  }

  const data = await response.json();

  // Convertir les dates string en Date
  return {
    ...data.patient,
    dateNaissance: new Date(data.patient.dateNaissance),
    createdAt: new Date(data.patient.createdAt),
    updatedAt: new Date(data.patient.updatedAt),
  };
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchPatient(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      // Ne pas retry si patient non trouvé
      if (error instanceof Error && error.message === 'Patient non trouvé') {
        return false;
      }
      return failureCount < 3;
    },
  });
}
