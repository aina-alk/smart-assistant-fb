'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Consultation, ConsultationUpdate } from '@/types';

interface UpdateConsultationParams {
  id: string;
  data: ConsultationUpdate;
}

async function updateConsultation({ id, data }: UpdateConsultationParams): Promise<Consultation> {
  const response = await fetch(`/api/consultations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      date: data.date?.toISOString(),
    }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Consultation non trouvée');
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de la consultation');
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

export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateConsultation,
    onSuccess: (updatedConsultation) => {
      // Invalider la liste des consultations
      queryClient.invalidateQueries({ queryKey: ['consultations'] });

      // Mettre à jour le cache de la consultation individuelle
      queryClient.setQueryData(['consultation', updatedConsultation.id], updatedConsultation);
    },
  });
}
