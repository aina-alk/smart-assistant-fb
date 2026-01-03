/**
 * API Route : Transcription
 * POST /api/transcription - Upload audio et démarrer transcription
 */

import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for FormData parsing (Edge runtime has issues with multipart)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { assemblyAIClient, AssemblyAIError } from '@/lib/api/assemblyai-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { ASSEMBLYAI_LIMITS, SUPPORTED_AUDIO_TYPES } from '@/lib/constants/assemblyai';
import { parseMultipartFormData, createBlobFromParsedFile } from '@/lib/utils/multipart-parser';
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

    // 2. Vérifier que le client AssemblyAI est configuré (initialisation lazy)
    const client = assemblyAIClient.instance;
    if (!client) {
      // Diagnostic: vérifier l'état de la variable d'environnement
      const envKeyExists = !!process.env.ASSEMBLYAI_API_KEY;
      const envKeyLength = process.env.ASSEMBLYAI_API_KEY?.length ?? 0;
      console.error('[Transcription] AssemblyAI not configured:', {
        envKeyExists,
        envKeyLength,
        nodeEnv: process.env.NODE_ENV,
      });

      return NextResponse.json(
        {
          error: 'Service de transcription non configuré',
          code: 'TRANSCRIPTION_FAILED',
          debug: { envKeyExists, envKeyLength },
        },
        { status: 503 }
      );
    }

    // 3. Diagnostic complet de la requête
    const contentType = request.headers.get('content-type') || '';
    const contentLength = request.headers.get('content-length') || '0';

    console.error('[Transcription] Request diagnostics:', {
      contentType: contentType.substring(0, 100),
      contentLength,
      method: request.method,
      url: request.url,
    });

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

    // 4. Parser le FormData avec parser manuel direct
    // Note: Le parser natif Next.js 15 en mode standalone échoue systématiquement
    // On utilise donc directement notre parser multipart manuel qui est plus fiable
    let audioFile: Blob | null = null;

    try {
      // Lire le body UNE SEULE FOIS en raw bytes
      const rawBody = await request.arrayBuffer();
      console.error('[Transcription] Raw body received, size:', rawBody.byteLength);

      if (rawBody.byteLength === 0) {
        return NextResponse.json(
          {
            error: 'Corps de requête vide.',
            code: 'INVALID_AUDIO',
          },
          { status: 400 }
        );
      }

      // Parser manuellement le multipart/form-data
      const parsed = parseMultipartFormData(rawBody, contentType);
      const audioFromParser = parsed.files.get('audio');

      if (audioFromParser) {
        audioFile = createBlobFromParsedFile(audioFromParser);
        console.error('[Transcription] Audio extracted successfully, size:', audioFile.size);
      }
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      console.error('[Transcription] Multipart parsing failed:', errorMessage);

      return NextResponse.json(
        {
          error: 'Erreur de parsing du fichier audio.',
          code: 'INVALID_AUDIO',
          debug: {
            contentType: contentType.substring(0, 80),
            contentLength,
            parseError: errorMessage,
          },
        },
        { status: 400 }
      );
    }

    if (!audioFile) {
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
    const transcriptId = await client.uploadAndTranscribe(arrayBuffer);

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
