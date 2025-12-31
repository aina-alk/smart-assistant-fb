/**
 * API Route: Ordonnances
 * POST /api/ordonnances - Extraire médicaments depuis conduite à tenir
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { extractOrdonnanceRequestSchema } from '@/types/ordonnance';
import type { ExtractOrdonnanceResponse } from '@/types/ordonnance';
import {
  PRESCRIPTION_EXTRACTION_PROMPT,
  buildPrescriptionExtractionPrompt,
  parsePrescriptionExtractionResponse,
} from '@/lib/prompts/prescription-extraction';

// ============================================================================
// POST - Extraction IA des médicaments
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Vérification authentification
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Vérification API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service IA non configuré', code: 'API_ERROR' },
        { status: 503 }
      );
    }

    // Validation du body
    const body = await request.json();
    const validationResult = extractOrdonnanceRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          code: 'INVALID_REQUEST',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { conduite, contextePatient } = validationResult.data;

    // Construction du prompt
    const userPrompt = buildPrescriptionExtractionPrompt(conduite, contextePatient);

    // Appel Claude API
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0.1, // Faible température pour extraction précise
      system: PRESCRIPTION_EXTRACTION_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Extraction du texte de réponse
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parsing de la réponse
    const extractionResult = parsePrescriptionExtractionResponse(responseText);

    // Construction de la réponse
    const response: ExtractOrdonnanceResponse = {
      medicaments: extractionResult.medicaments,
      notes: extractionResult.notes,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de l'extraction des prescriptions:", error);

    // Gestion erreurs Anthropic
    if (error instanceof Anthropic.APIError) {
      const statusMap: Record<number, number> = {
        429: 429,
        500: 502,
        503: 503,
      };
      const status = statusMap[error.status ?? 500] || 500;
      const code = error.status === 429 ? 'RATE_LIMITED' : 'API_ERROR';

      return NextResponse.json({ error: error.message, code }, { status });
    }

    // Erreur de parsing JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Erreur lors du traitement de la réponse IA', code: 'PARSE_ERROR' },
        { status: 500 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      { error: "Erreur lors de l'extraction des prescriptions", code: 'EXTRACTION_FAILED' },
      { status: 500 }
    );
  }
}
