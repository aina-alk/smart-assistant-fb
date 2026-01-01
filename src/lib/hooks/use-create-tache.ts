'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tache, TacheCreate } from '@/types/tache';

async function createTache(data: TacheCreate): Promise<Tache> {
  const response = await fetch('/api/taches', {
    method: 'POST',
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
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de la tâche');
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

export function useCreateTache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTache,
    onSuccess: (newTache) => {
      // Invalider la liste des tâches
      queryClient.invalidateQueries({ queryKey: ['taches'] });

      // Ajouter la nouvelle tâche au cache
      queryClient.setQueryData(['tache', newTache.id], newTache);
    },
  });
}
