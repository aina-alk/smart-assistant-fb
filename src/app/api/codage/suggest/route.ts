import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { getNGAPByCode } from '@/lib/constants/ngap-codes';
import { getCCAMByCode } from '@/lib/constants/ccam-codes';
import {
  CODAGE_SUGGESTION_PROMPT,
  buildCodageSuggestionPrompt,
  parseCodageSuggestionResponse,
} from '@/lib/prompts/codage-suggestion';
import type { CodageSuggestResponse } from '@/types/codage';

const suggestRequestSchema = z.object({
  crc: z.string().min(10, 'Le CRC doit contenir au moins 10 caractères'),
  diagnostics: z.array(z.string()).optional(),
});

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

    const validationResult = suggestRequestSchema.safeParse(body);
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

    const { crc, diagnostics } = validationResult.data;
    const userPrompt = buildCodageSuggestionPrompt(crc, diagnostics);

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      temperature: 0.2,
      system: CODAGE_SUGGESTION_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    const suggestions = parseCodageSuggestionResponse(responseText);

    suggestions.actes = suggestions.actes
      .map((acte) => {
        if (acte.type === 'NGAP') {
          const matches = getNGAPByCode(acte.code);
          if (matches.length > 0) {
            // Prendre le premier match pour l'enrichissement des données
            const fullCode = matches[0];
            return { ...acte, libelle: fullCode.libelle, tarif_base: fullCode.tarif_base };
          }
        } else {
          const fullCode = getCCAMByCode(acte.code);
          if (fullCode) {
            return { ...acte, libelle: fullCode.libelle, tarif_base: fullCode.tarif_base };
          }
        }
        return acte;
      })
      .filter((acte) => {
        const exists =
          acte.type === 'NGAP' ? getNGAPByCode(acte.code).length > 0 : getCCAMByCode(acte.code);
        if (!exists) {
          console.warn(`Code ${acte.type} invalide ignoré: ${acte.code}`);
        }
        return exists;
      });

    const response: CodageSuggestResponse = {
      suggestions,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la suggestion de codage:', error);

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
      { error: 'Erreur lors de la suggestion de codage', code: 'SUGGESTION_FAILED' },
      { status: 500 }
    );
  }
}
