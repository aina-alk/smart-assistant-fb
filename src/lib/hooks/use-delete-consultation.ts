'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

async function deleteConsultation(id: string): Promise<void> {
  const response = await fetch(`/api/consultations/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Consultation non trouvée');
    }
    if (response.status === 400) {
      throw new Error('Impossible de supprimer une consultation terminée');
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de la consultation');
  }
}

export function useDeleteConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConsultation,
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.removeQueries({ queryKey: ['consultation', deletedId] });
    },
  });
}
