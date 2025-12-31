/**
 * Validation schemas pour la génération de CRC
 */

import { z } from 'zod';
import { patientContextSchema } from '@/types/generation';

/**
 * Schema pour la requête API de génération CRC
 */
export const generateCRCRequestSchema = z.object({
  transcription: z.string().min(50, 'La transcription doit contenir au moins 50 caractères'),
  patientContext: patientContextSchema.optional(),
});

export type GenerateCRCRequest = z.infer<typeof generateCRCRequestSchema>;
