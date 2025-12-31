'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Consultation, ConsultationCreate } from '@/types';

async function createConsultation(data: ConsultationCreate): Promise<Consultation> {
  const response = await fetch('/api/consultations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      date: data.date.toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de la consultation');
  }

  const result = await response.json();

  // Convertir les dates string en Date
  return {
    ...result.consultation,
    date: new Date(result.consultation.date),
    createdAt: new Date(result.consultation.createdAt),
    updatedAt: new Date(result.consultation.updatedAt),
  };
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConsultation,
    onSuccess: (newConsultation) => {
      // Invalider la liste des consultations
      queryClient.invalidateQueries({ queryKey: ['consultations'] });

      // Ajouter la nouvelle consultation au cache
      queryClient.setQueryData(['consultation', newConsultation.id], newConsultation);
    },
  });
}
