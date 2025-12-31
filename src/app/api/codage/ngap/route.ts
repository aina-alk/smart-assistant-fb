import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { searchNGAPCodes, NGAP_CODES } from '@/lib/constants/ngap-codes';
import type { NGAPSearchResponse } from '@/types/codage';

const searchParamsSchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  type: z.enum(['consultation', 'majoration']).optional(),
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
      type: searchParams.get('type') || undefined,
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

    const { q, limit, type } = validationResult.data;

    let codes = q ? searchNGAPCodes(q, limit) : NGAP_CODES.slice(0, limit);

    if (type) {
      codes = codes.filter((c) => c.type === type);
    }

    const response: NGAPSearchResponse = {
      codes,
      total: codes.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la recherche NGAP:', error);
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
  }
}
