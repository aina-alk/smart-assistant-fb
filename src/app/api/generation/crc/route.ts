/**
 * API Route : Génération CRC (standalone)
 * POST /api/generation/crc - Génère un CRC depuis une transcription
 *
 * Endpoint standalone pour générer un compte-rendu de consultation
 * sans nécessiter d'ID de consultation existante.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { claudeClient, ClaudeError } from '@/lib/api/claude-client';
import { generateCRCRequestSchema } from '@/lib/validations/crc';

/**
 * POST - Génère un CRC à partir d'une transcription
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    if (!claudeClient) {
      return NextResponse.json(
        { error: 'Service de génération non configuré', code: 'API_ERROR' },
        { status: 503 }
      );
    }

    const body = await request.json();

    const validationResult = generateCRCRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          code: 'INVALID_TRANSCRIPTION',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { transcription, patientContext } = validationResult.data;

    const result = await claudeClient.generateCRC({
      transcription,
      patientContext,
    });

    return NextResponse.json({
      crc: result.crc,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Erreur lors de la génération du CRC:', error);

    if (error instanceof ClaudeError) {
      const statusMap: Record<number, number> = {
        429: 429,
        500: 502,
        503: 503,
      };
      const status = statusMap[error.statusCode] || 500;
      const code = error.statusCode === 429 ? 'RATE_LIMITED' : 'API_ERROR';

      return NextResponse.json({ error: error.message, code }, { status });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Erreur lors du traitement de la réponse', code: 'PARSE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la génération du compte-rendu', code: 'GENERATION_FAILED' },
      { status: 500 }
    );
  }
}
