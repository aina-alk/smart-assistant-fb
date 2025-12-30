'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { Patient, PatientSearchResult } from '@/types';

interface UsePatientSearchParams {
  query?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  nir?: string;
  telephone?: string;
  limit?: number;
  pageToken?: string;
}

async function searchPatients(params: UsePatientSearchParams): Promise<PatientSearchResult> {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set('query', params.query);
  if (params.nom) searchParams.set('nom', params.nom);
  if (params.prenom) searchParams.set('prenom', params.prenom);
  if (params.dateNaissance) searchParams.set('dateNaissance', params.dateNaissance);
  if (params.nir) searchParams.set('nir', params.nir);
  if (params.telephone) searchParams.set('telephone', params.telephone);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.pageToken) searchParams.set('pageToken', params.pageToken);

  const url = `/api/patients/search?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la recherche de patients');
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

/**
 * Hook pour utiliser le debounce
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook de recherche de patients avec debounce
 */
export function usePatientSearch(
  query: string,
  options: Omit<UsePatientSearchParams, 'query'> = {}
) {
  const debouncedQuery = useDebounce(query, 300);

  const searchParams: UsePatientSearchParams = {
    ...options,
    query: debouncedQuery,
  };

  return useQuery({
    queryKey: ['patients', 'search', searchParams],
    queryFn: () => searchPatients(searchParams),
    enabled: debouncedQuery.length >= 2,
  });
}

/**
 * Hook de recherche avancée de patients
 */
export function usePatientAdvancedSearch(params: UsePatientSearchParams) {
  return useQuery({
    queryKey: ['patients', 'search', params],
    queryFn: () => searchPatients(params),
    enabled: Object.values(params).some((v) => v !== undefined && v !== ''),
  });
}
