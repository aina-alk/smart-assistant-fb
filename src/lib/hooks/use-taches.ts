'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  Tache,
  TacheSearchResult,
  TacheStatut,
  TachePriorite,
  TacheCategorie,
} from '@/types/tache';

interface UseTachesParams {
  statut?: TacheStatut;
  priorite?: TachePriorite;
  categorie?: TacheCategorie;
  patientId?: string;
  consultationId?: string;
  echeanceAvant?: string;
  echeanceApres?: string;
  limit?: number;
  pageToken?: string;
}

async function fetchTaches(params: UseTachesParams): Promise<TacheSearchResult> {
  const searchParams = new URLSearchParams();

  if (params.limit) {
    searchParams.set('_count', params.limit.toString());
  }
  if (params.pageToken) {
    searchParams.set('_page_token', params.pageToken);
  }
  if (params.statut) {
    searchParams.set('statut', params.statut);
  }
  if (params.priorite) {
    searchParams.set('priorite', params.priorite);
  }
  if (params.categorie) {
    searchParams.set('categorie', params.categorie);
  }
  if (params.patientId) {
    searchParams.set('patient', params.patientId);
  }
  if (params.consultationId) {
    searchParams.set('consultation', params.consultationId);
  }
  if (params.echeanceAvant) {
    searchParams.set('echeance_avant', params.echeanceAvant);
  }
  if (params.echeanceApres) {
    searchParams.set('echeance_apres', params.echeanceApres);
  }

  const url = `/api/taches${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des tâches');
  }

  const data = await response.json();

  // Convertir les dates string en Date
  const taches: Tache[] = data.taches.map(
    (
      t: Tache & {
        echeance?: string;
        rappel?: string;
        createdAt: string;
        updatedAt: string;
        completedAt?: string;
      }
    ) => ({
      ...t,
      echeance: t.echeance ? new Date(t.echeance) : undefined,
      rappel: t.rappel ? new Date(t.rappel) : undefined,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
    })
  );

  return {
    taches,
    total: data.total,
    nextPageToken: data.nextPageToken,
  };
}

export function useTaches(params: UseTachesParams = {}) {
  return useQuery({
    queryKey: ['taches', params],
    queryFn: () => fetchTaches(params),
  });
}
