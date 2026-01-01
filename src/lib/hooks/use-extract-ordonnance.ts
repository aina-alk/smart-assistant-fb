'use client';

import { useMutation } from '@tanstack/react-query';
import type {
  ExtractOrdonnanceRequest,
  ExtractOrdonnanceResponse,
  MedicamentExtrait,
} from '@/types/ordonnance';

async function extractOrdonnance(
  data: ExtractOrdonnanceRequest
): Promise<ExtractOrdonnanceResponse> {
  const response = await fetch('/api/ordonnances', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'extraction des médicaments");
  }

  return response.json();
}

export interface UseExtractOrdonnanceOptions {
  onSuccess?: (data: ExtractOrdonnanceResponse) => void;
  onError?: (error: Error) => void;
}

export function useExtractOrdonnance(options?: UseExtractOrdonnanceOptions) {
  return useMutation({
    mutationFn: extractOrdonnance,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export type { MedicamentExtrait };
