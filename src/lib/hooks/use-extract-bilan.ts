'use client';

import { useMutation } from '@tanstack/react-query';
import type { ExtractBilanRequest, ExtractBilanResponse, ExamenExtrait } from '@/types/bilan';

async function extractBilan(data: ExtractBilanRequest): Promise<ExtractBilanResponse> {
  const response = await fetch('/api/bilans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'extraction des examens");
  }

  return response.json();
}

export interface UseExtractBilanOptions {
  onSuccess?: (data: ExtractBilanResponse) => void;
  onError?: (error: Error) => void;
}

export function useExtractBilan(options?: UseExtractBilanOptions) {
  return useMutation({
    mutationFn: extractBilan,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export type { ExamenExtrait };
