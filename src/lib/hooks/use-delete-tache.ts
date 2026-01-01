'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

async function deleteTache(id: string): Promise<void> {
  const response = await fetch(`/api/taches/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Tâche non trouvée');
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de la tâche');
  }
}

export function useDeleteTache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTache,
    onSuccess: (_data, deletedId) => {
      // Invalider la liste des tâches
      queryClient.invalidateQueries({ queryKey: ['taches'] });

      // Supprimer la tâche du cache
      queryClient.removeQueries({ queryKey: ['tache', deletedId] });
    },
  });
}
