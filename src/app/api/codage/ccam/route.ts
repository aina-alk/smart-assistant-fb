import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { searchCCAMCodes, CCAM_CODES } from '@/lib/constants/ccam-codes';
import type { CCAMSearchResponse, CCAMRegroupement } from '@/types/codage';

const searchParamsSchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  regroupement: z
    .enum([
      // Legacy
      'ATM',
      'ENS',
      'VNG',
      'ACT',
      'CHI',
      // Nouveaux regroupements ORL
      'AUD',
      'VES',
      'ORE',
      'NEZ',
      'LAR',
      'CER',
      'THY',
      'SAL',
      'TRA',
      'DIV',
    ])
    .optional() as z.ZodOptional<z.ZodEnum<[CCAMRegroupement, ...CCAMRegroupement[]]>>,
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const params = {
      q: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') || undefined,
      regroupement: searchParams.get('regroupement') || undefined,
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

    const { q, limit, regroupement } = validationResult.data;

    let codes = q ? searchCCAMCodes(q, limit, regroupement) : CCAM_CODES.slice(0, limit);

    if (regroupement && !q) {
      codes = codes.filter((c) => c.regroupement === regroupement);
    }

    const response: CCAMSearchResponse = {
      codes,
      total: codes.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la recherche CCAM:', error);
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
  }
}
