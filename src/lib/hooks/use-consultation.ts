'use client';

import { useQuery } from '@tanstack/react-query';
import type { Consultation } from '@/types';

async function fetchConsultation(id: string): Promise<Consultation> {
  const response = await fetch(`/api/consultations/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Consultation non trouvée');
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de la consultation');
  }

  const data = await response.json();

  // Convertir les dates string en Date
  return {
    ...data.consultation,
    date: new Date(data.consultation.date),
    createdAt: new Date(data.consultation.createdAt),
    updatedAt: new Date(data.consultation.updatedAt),
  };
}

export function useConsultation(id: string) {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: () => fetchConsultation(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      // Ne pas retry si consultation non trouvée
      if (error instanceof Error && error.message === 'Consultation non trouvée') {
        return false;
      }
      return failureCount < 3;
    },
  });
}
