/**
 * API Route : Codage CIM-10
 * GET /api/codage/cim10 - Recherche de codes CIM-10
 * POST /api/codage/cim10 - Extraction IA de diagnostics
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { searchCIM10Codes, getCIM10ByCode } from '@/lib/constants/cim10-codes';
import {
  CIM10_EXTRACTION_PROMPT,
  buildDiagnosticExtractionPrompt,
  parseCIM10ExtractionResponse,
} from '@/lib/prompts/diagnostic-extraction';
import type { CIM10Category, CIM10SearchResponse, CIM10ExtractResponse } from '@/types/codage';

// ============================================================================
// Validation Schemas
// ============================================================================

const searchParamsSchema = z.object({
  q: z.string().min(2, 'La recherche doit contenir au moins 2 caractères'),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  categorie: z.enum(['Oreille', 'Nez', 'Gorge', 'Cou', 'Général']).optional() as z.ZodOptional<
    z.ZodEnum<[CIM10Category, ...CIM10Category[]]>
  >,
});

const extractRequestSchema = z.object({
  diagnostic: z.string().min(3, 'Le diagnostic doit contenir au moins 3 caractères'),
  contexte: z.string().optional(),
});

// ============================================================================
// GET - Recherche de codes CIM-10
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const params = {
      q: searchParams.get('q') || '',
      limit: searchParams.get('limit') || undefined,
      categorie: searchParams.get('categorie') || undefined,
    };

    const validationResult = searchParamsSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Paramètres invalides',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { q, limit, categorie } = validationResult.data;
    const codes = searchCIM10Codes(q, limit, categorie);

    const response: CIM10SearchResponse = {
      codes,
      total: codes.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la recherche CIM-10:', error);
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
  }
}

// ============================================================================
// POST - Extraction IA de diagnostics CIM-10
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service IA non configuré', code: 'API_ERROR' },
        { status: 503 }
      );
    }

    const body = await request.json();

    const validationResult = extractRequestSchema.safeParse(body);
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

    const { diagnostic, contexte } = validationResult.data;
    const userPrompt = buildDiagnosticExtractionPrompt(diagnostic, contexte);

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      temperature: 0.2,
      system: CIM10_EXTRACTION_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    const suggestions = parseCIM10ExtractionResponse(responseText);

    // Enrichir et filtrer les suggestions avec les données complètes des codes
    if (suggestions.principal) {
      const fullCode = getCIM10ByCode(suggestions.principal.code);
      if (fullCode) {
        suggestions.principal.libelle = fullCode.libelle;
      } else {
        // Code non trouvé dans le référentiel local, on le supprime
        console.warn(`Code CIM-10 principal invalide ignoré: ${suggestions.principal.code}`);
        suggestions.principal = null;
      }
    }

    suggestions.secondaires = suggestions.secondaires
      .map((s) => {
        const fullCode = getCIM10ByCode(s.code);
        if (fullCode) {
          return { ...s, libelle: fullCode.libelle };
        }
        console.warn(`Code CIM-10 secondaire invalide ignoré: ${s.code}`);
        return null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const response: CIM10ExtractResponse = {
      suggestions,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de l'extraction CIM-10:", error);

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

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Erreur lors du traitement de la réponse IA', code: 'PARSE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de l'extraction des diagnostics", code: 'EXTRACTION_FAILED' },
      { status: 500 }
    );
  }
}
