/**
 * API Route: Generate AssemblyAI Temporary Token
 *
 * POST /api/transcription/token
 *
 * This endpoint generates a temporary authentication token for
 * AssemblyAI WebSocket streaming. The token is short-lived (8 min)
 * and can be safely used in the browser.
 *
 * Security:
 * - Requires authenticated user with 'medecin' role
 * - Token expires in 480 seconds (8 minutes)
 * - API key never leaves the server
 */

import { NextResponse } from 'next/server';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import {
  generateTranscriptionCredentials,
  AssemblyAITokenError,
} from '@/lib/api/assemblyai-client';
import type { TokenResponse, TokenErrorResponse } from '@/types/transcription';

// ============================================================================
// POST - Generate temporary token
// ============================================================================

export async function POST(): Promise<NextResponse<TokenResponse | TokenErrorResponse>> {
  try {
    // 1. Verify authentication and authorization
    const authResult = await verifyMedecinAccess();

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error, code: 'TOKEN_GENERATION_FAILED' },
        { status: authResult.status }
      );
    }

    // 2. Generate credentials
    const { token, websocketUrl, expiresAt } = await generateTranscriptionCredentials({
      expiresInSeconds: 480, // 8 minutes
    });

    // 3. Return token and URL
    const response: TokenResponse = {
      token,
      websocketUrl,
      expiresAt: expiresAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Transcription Token] Error:', error);

    // Handle known errors
    if (error instanceof AssemblyAITokenError) {
      return NextResponse.json(
        {
          error: 'Erreur de génération du token de transcription',
          code: 'TOKEN_GENERATION_FAILED',
        },
        { status: error.statusCode }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        error: 'Erreur interne du serveur',
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS - CORS preflight
// ============================================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
