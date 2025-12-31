'use client';

import { useQuery } from '@tanstack/react-query';
import type { Consultation, ConsultationSearchResult, ConsultationStatut } from '@/types';

interface UseConsultationsParams {
  patientId?: string;
  status?: ConsultationStatut;
  limit?: number;
  pageToken?: string;
}

/** Map statut application → statut FHIR */
const STATUT_TO_FHIR: Record<ConsultationStatut, string> = {
  brouillon: 'planned',
  en_cours: 'in-progress',
  termine: 'finished',
  annule: 'cancelled',
};

async function fetchConsultations(
  params: UseConsultationsParams
): Promise<ConsultationSearchResult> {
  const searchParams = new URLSearchParams();

  if (params.limit) {
    searchParams.set('_count', params.limit.toString());
  }
  if (params.pageToken) {
    searchParams.set('_page_token', params.pageToken);
  }
  if (params.patientId) {
    searchParams.set('patient', params.patientId);
  }
  if (params.status) {
    searchParams.set('status', STATUT_TO_FHIR[params.status]);
  }

  const url = `/api/consultations${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des consultations');
  }

  const data = await response.json();

  // Convertir les dates string en Date
  const consultations: Consultation[] = data.consultations.map((c: Consultation) => ({
    ...c,
    date: new Date(c.date),
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  }));

  return {
    consultations,
    total: data.total,
    nextPageToken: data.nextPageToken,
  };
}

export function useConsultations(params: UseConsultationsParams = {}) {
  return useQuery({
    queryKey: ['consultations', params],
    queryFn: () => fetchConsultations(params),
  });
}
