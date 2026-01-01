'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tache, TacheUpdate } from '@/types/tache';

interface UpdateTacheParams {
  id: string;
  data: TacheUpdate;
}

async function updateTache({ id, data }: UpdateTacheParams): Promise<Tache> {
  const response = await fetch(`/api/taches/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      echeance: data.echeance?.toISOString(),
      rappel: data.rappel?.toISOString(),
    }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Tâche non trouvée');
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de la tâche');
  }

  const result = await response.json();

  // Convertir les dates string en Date
  return {
    ...result.tache,
    echeance: result.tache.echeance ? new Date(result.tache.echeance) : undefined,
    rappel: result.tache.rappel ? new Date(result.tache.rappel) : undefined,
    createdAt: new Date(result.tache.createdAt),
    updatedAt: new Date(result.tache.updatedAt),
    completedAt: result.tache.completedAt ? new Date(result.tache.completedAt) : undefined,
  };
}

export function useUpdateTache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTache,
    onSuccess: (updatedTache) => {
      // Invalider la liste des tâches
      queryClient.invalidateQueries({ queryKey: ['taches'] });

      // Mettre à jour le cache de la tâche individuelle
      queryClient.setQueryData(['tache', updatedTache.id], updatedTache);
    },
  });
}
