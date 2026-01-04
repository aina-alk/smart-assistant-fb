/**
 * API Route : Transcription
 * POST /api/transcription - Upload audio et démarrer transcription
 *
 * Accepte JSON avec audio en base64 (évite les problèmes de parsing multipart)
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { assemblyAIClient, AssemblyAIError } from '@/lib/api/assemblyai-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { ASSEMBLYAI_LIMITS, SUPPORTED_AUDIO_TYPES } from '@/lib/constants/assemblyai';
import type { StartTranscriptionResponse, TranscriptionErrorResponse } from '@/types/transcription';

// Schema for base64 audio upload
interface AudioUploadBody {
  audio: string; // base64 encoded audio
  mimeType: string;
  filename?: string;
}

/**
 * POST - Upload audio et démarrer la transcription
 * Body: JSON { audio: base64string, mimeType: string, filename?: string }
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
    const client = assemblyAIClient.instance;
    if (!client) {
      const envKeyExists = !!process.env.ASSEMBLYAI_API_KEY;
      console.error('[Transcription] AssemblyAI not configured:', { envKeyExists });

      return NextResponse.json(
        {
          error: 'Service de transcription non configuré',
          code: 'TRANSCRIPTION_FAILED',
        },
        { status: 503 }
      );
    }

    // 3. Vérifier le Content-Type
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        {
          error: `Content-Type invalide: ${contentType || 'absent'}. Attendu: application/json.`,
          code: 'INVALID_AUDIO',
        },
        { status: 400 }
      );
    }

    // 4. Parser le body JSON
    let body: AudioUploadBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Corps de requête JSON invalide.', code: 'INVALID_AUDIO' },
        { status: 400 }
      );
    }

    // 5. Valider les champs requis
    if (!body.audio || typeof body.audio !== 'string') {
      return NextResponse.json(
        { error: 'Champ "audio" (base64) requis.', code: 'INVALID_AUDIO' },
        { status: 400 }
      );
    }

    if (!body.mimeType || typeof body.mimeType !== 'string') {
      return NextResponse.json(
        { error: 'Champ "mimeType" requis.', code: 'INVALID_AUDIO' },
        { status: 400 }
      );
    }

    // 6. Décoder le base64
    let audioBuffer: ArrayBuffer;
    try {
      const binaryString = atob(body.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      audioBuffer = bytes.buffer;
    } catch {
      return NextResponse.json(
        { error: 'Données audio base64 invalides.', code: 'INVALID_AUDIO' },
        { status: 400 }
      );
    }

    console.error('[Transcription] Audio decoded:', {
      base64Length: body.audio.length,
      decodedSize: audioBuffer.byteLength,
      mimeType: body.mimeType,
    });

    // 7. Valider la taille du fichier
    if (audioBuffer.byteLength > ASSEMBLYAI_LIMITS.RECOMMENDED_MAX_SIZE_BYTES) {
      const maxSizeMB = ASSEMBLYAI_LIMITS.RECOMMENDED_MAX_SIZE_BYTES / (1024 * 1024);
      return NextResponse.json(
        {
          error: `Fichier trop volumineux. Maximum ${maxSizeMB} MB.`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    if (audioBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'Fichier audio vide.', code: 'INVALID_AUDIO' },
        { status: 400 }
      );
    }

    // 8. Valider le type MIME
    const mimeType = body.mimeType;
    if (!SUPPORTED_AUDIO_TYPES.some((type) => mimeType.startsWith(type.split(';')[0]))) {
      return NextResponse.json(
        {
          error: `Format audio non supporté: ${mimeType}. Formats acceptés: webm, mp4, mp3, wav, flac, ogg.`,
          code: 'INVALID_AUDIO',
        },
        { status: 400 }
      );
    }

    // 9. Upload et démarrer la transcription
    const transcriptId = await client.uploadAndTranscribe(audioBuffer);

    // 10. Retourner l'ID pour polling
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
