'use client';

import { useQuery } from '@tanstack/react-query';
import type { Patient, PatientSearchResult } from '@/types';

interface UsePatientsParams {
  page?: number;
  limit?: number;
  pageToken?: string;
}

async function fetchPatients(params: UsePatientsParams): Promise<PatientSearchResult> {
  const searchParams = new URLSearchParams();

  if (params.limit) {
    searchParams.set('_count', params.limit.toString());
  }
  if (params.pageToken) {
    searchParams.set('_page_token', params.pageToken);
  }

  const url = `/api/patients${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des patients');
  }

  const data = await response.json();

  // Convertir les dates string en Date
  const patients: Patient[] = data.patients.map((p: Patient) => ({
    ...p,
    dateNaissance: new Date(p.dateNaissance),
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));

  return {
    patients,
    total: data.total,
    nextPageToken: data.nextPageToken,
  };
}

export function usePatients(params: UsePatientsParams = {}) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => fetchPatients(params),
  });
}
