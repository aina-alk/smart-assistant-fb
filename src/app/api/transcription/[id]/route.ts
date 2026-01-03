/**
 * API Route : Transcription Status
 * GET /api/transcription/{id} - Récupérer le statut et résultat d'une transcription
 */

import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for consistency with main transcription route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { assemblyAIClient, AssemblyAIError } from '@/lib/api/assemblyai-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import type { GetTranscriptionResponse, TranscriptionErrorResponse } from '@/types/transcription';

/**
 * Valide le format d'un ID de transcription AssemblyAI
 * Format attendu: chaîne alphanumérique
 */
function isValidTranscriptId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length < 100;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - Récupérer le statut et résultat d'une transcription
 * Path param: id (transcript ID)
 * Response: { result: TranscriptionResult }
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<GetTranscriptionResponse | TranscriptionErrorResponse>> {
  try {
    // 1. Vérifier l'authentification
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // 2. Vérifier que le client AssemblyAI est configuré (initialisation lazy)
    const client = assemblyAIClient.instance;
    if (!client) {
      return NextResponse.json(
        { error: 'Service de transcription non configuré', code: 'TRANSCRIPTION_FAILED' },
        { status: 503 }
      );
    }

    // 3. Récupérer et valider l'ID
    const { id: transcriptId } = await params;

    if (!transcriptId || !isValidTranscriptId(transcriptId)) {
      return NextResponse.json(
        { error: 'ID de transcription invalide', code: 'TRANSCRIPTION_FAILED' },
        { status: 400 }
      );
    }

    // 4. Récupérer le statut de la transcription
    const result = await client.getTranscript(transcriptId);

    // 5. Retourner le résultat
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération de la transcription:', error);

    if (error instanceof AssemblyAIError) {
      // 404 si transcription non trouvée
      if (error.statusCode === 404) {
        return NextResponse.json(
          { error: 'Transcription non trouvée', code: 'TRANSCRIPTION_FAILED' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: error.message,
          code: 'TRANSCRIPTION_FAILED',
          details: `Status: ${error.statusCode}`,
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération de la transcription',
        code: 'TRANSCRIPTION_FAILED',
      },
      { status: 500 }
    );
  }
}
