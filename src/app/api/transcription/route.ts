/**
 * API Route : Transcription
 * POST /api/transcription - Upload audio et démarrer transcription
 */

import { NextRequest, NextResponse } from 'next/server';
import { assemblyAIClient, AssemblyAIError } from '@/lib/api/assemblyai-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { ASSEMBLYAI_LIMITS, SUPPORTED_AUDIO_TYPES } from '@/lib/constants/assemblyai';
import type { StartTranscriptionResponse, TranscriptionErrorResponse } from '@/types/transcription';

/**
 * POST - Upload audio et démarrer la transcription
 * Body: FormData avec champ 'audio' (Blob)
 * Response: { transcriptId: string, message: string }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<StartTranscriptionResponse | TranscriptionErrorResponse>> {
  try {
    // 1. Vérifier l'authentification
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // 2. Vérifier que le client AssemblyAI est configuré
    if (!assemblyAIClient) {
      return NextResponse.json(
        { error: 'Service de transcription non configuré', code: 'TRANSCRIPTION_FAILED' },
        { status: 503 }
      );
    }

    // 3. Vérifier le Content-Type avant de parser
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      console.error('[Transcription] Invalid Content-Type:', contentType);
      return NextResponse.json(
        {
          error: `Content-Type invalide: ${contentType || 'absent'}. Attendu: multipart/form-data.`,
          code: 'INVALID_AUDIO',
        },
        { status: 400 }
      );
    }

    // 4. Parser le FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error('[Transcription] FormData parse error:', parseError);
      return NextResponse.json(
        {
          error: 'Erreur de parsing FormData. Vérifiez que le fichier audio est valide.',
          code: 'INVALID_AUDIO',
        },
        { status: 400 }
      );
    }

    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'Fichier audio manquant. Champ "audio" requis.', code: 'INVALID_AUDIO' },
        { status: 400 }
      );
    }

    // 5. Valider la taille du fichier
    if (audioFile.size > ASSEMBLYAI_LIMITS.RECOMMENDED_MAX_SIZE_BYTES) {
      const maxSizeMB = ASSEMBLYAI_LIMITS.RECOMMENDED_MAX_SIZE_BYTES / (1024 * 1024);
      return NextResponse.json(
        {
          error: `Fichier trop volumineux. Maximum ${maxSizeMB} MB.`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    if (audioFile.size === 0) {
      return NextResponse.json(
        { error: 'Fichier audio vide.', code: 'INVALID_AUDIO' },
        { status: 400 }
      );
    }

    // 6. Valider le type MIME (si disponible)
    const mimeType = audioFile.type;
    if (
      mimeType &&
      !SUPPORTED_AUDIO_TYPES.some((type) => mimeType.startsWith(type.split(';')[0]))
    ) {
      return NextResponse.json(
        {
          error: `Format audio non supporté: ${mimeType}. Formats acceptés: webm, mp4, mp3, wav, flac, ogg.`,
          code: 'INVALID_AUDIO',
        },
        { status: 400 }
      );
    }

    // 7. Convertir le Blob en Buffer pour l'upload
    const arrayBuffer = await audioFile.arrayBuffer();

    // 8. Upload et démarrer la transcription
    const transcriptId = await assemblyAIClient.uploadAndTranscribe(arrayBuffer);

    // 9. Retourner l'ID pour polling
    return NextResponse.json(
      {
        transcriptId,
        message:
          'Transcription démarrée. Utilisez GET /api/transcription/{id} pour suivre la progression.',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Erreur lors du démarrage de la transcription:', error);

    if (error instanceof AssemblyAIError) {
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
        error: 'Erreur lors du démarrage de la transcription',
        code: 'TRANSCRIPTION_FAILED',
      },
      { status: 500 }
    );
  }
}
