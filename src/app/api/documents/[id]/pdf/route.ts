/**
 * API Route - PDF Document Generation
 * GET /api/documents/[id]/pdf?type=crc|ordonnance|bilan
 *
 * Génère et retourne un PDF pour un document médical
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCRCPDF, generateOrdonnancePDF, generateBilanPDF } from '@/lib/pdf';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import type { CRCGenerated } from '@/types/generation';
import type { DiagnosticSelection, CodageConsultation } from '@/types/codage';
import type { Medicament } from '@/types/ordonnance';
import type { ExamenExtrait } from '@/types/bilan';

// ============================================================================
// Types & Validation
// ============================================================================

const querySchema = z.object({
  type: z.enum(['crc', 'ordonnance', 'bilan']),
});

// Schema pour les données POST (génération directe sans consultation)
const crcDataSchema = z.object({
  crc: z.object({
    motif: z.string(),
    histoire: z.string(),
    examen: z.object({
      otoscopie: z.string().nullable(),
      rhinoscopie: z.string().nullable(),
      oropharynx: z.string().nullable(),
      palpation_cervicale: z.string().nullable(),
      autres: z.string().nullable(),
    }),
    examens_complementaires: z.string().nullable(),
    diagnostic: z.string(),
    conduite: z.string(),
    conclusion: z.string(),
  }),
  patient: z.object({
    nom: z.string(),
    prenom: z.string().optional(),
    dateNaissance: z.string().optional(),
    age: z.number().optional(),
    sexe: z.enum(['M', 'F', 'male', 'female']).optional(),
  }),
  praticien: z
    .object({
      nom: z.string(),
      specialite: z.string().optional(),
      adresse: z.string().optional(),
      telephone: z.string().optional(),
      email: z.string().optional(),
      rpps: z.string().optional(),
    })
    .optional(),
  date: z.string().optional(),
  diagnostics: z
    .object({
      principal: z
        .object({
          code: z.string(),
          libelle: z.string(),
        })
        .optional(),
      secondaires: z
        .array(
          z.object({
            code: z.string(),
            libelle: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
  codage: z
    .object({
      actes: z
        .array(
          z.object({
            code: z.string(),
            libelle: z.string(),
            tarif: z.number().optional(),
          })
        )
        .optional(),
    })
    .optional(),
});

const ordonnanceDataSchema = z.object({
  medicaments: z.array(
    z.object({
      id: z.string(),
      nom: z.string(),
      forme: z.string(),
      posologie: z.string(),
      duree: z.string(),
      quantite: z.number().optional(),
      instructions: z.string().optional(),
    })
  ),
  patient: z.object({
    nom: z.string(),
    prenom: z.string().optional(),
    dateNaissance: z.string().optional(),
    age: z.number().optional(),
    sexe: z.enum(['M', 'F', 'male', 'female']).optional(),
  }),
  praticien: z
    .object({
      nom: z.string(),
      specialite: z.string().optional(),
      adresse: z.string().optional(),
      telephone: z.string().optional(),
      email: z.string().optional(),
      rpps: z.string().optional(),
    })
    .optional(),
  date: z.string().optional(),
  commentaire: z.string().optional(),
});

const bilanDataSchema = z.object({
  examens: z.array(
    z.object({
      code: z.string(),
      libelle: z.string(),
      categorie: z.enum(['imagerie', 'biologie', 'exploration', 'autre']),
      indication: z.string(),
      urgent: z.boolean(),
    })
  ),
  patient: z.object({
    nom: z.string(),
    prenom: z.string().optional(),
    dateNaissance: z.string().optional(),
    age: z.number().optional(),
    sexe: z.enum(['M', 'F', 'male', 'female']).optional(),
  }),
  praticien: z
    .object({
      nom: z.string(),
      specialite: z.string().optional(),
      adresse: z.string().optional(),
      telephone: z.string().optional(),
      email: z.string().optional(),
      rpps: z.string().optional(),
    })
    .optional(),
  date: z.string().optional(),
  contexte_clinique: z.string().optional(),
});

// ============================================================================
// Route Handlers
// ============================================================================

/**
 * POST /api/documents/[id]/pdf?type=crc|ordonnance|bilan
 * Génère un PDF à partir des données fournies dans le body
 *
 * Note: [id] est utilisé pour référence future (stockage DocumentReference)
 * Pour l'instant, la génération est stateless
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');

    const queryResult = querySchema.safeParse({ type: typeParam });
    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: 'Type de document invalide',
          details: 'Le paramètre type doit être crc, ordonnance ou bilan',
        },
        { status: 400 }
      );
    }

    const { type } = queryResult.data;
    const body = await request.json();

    // Générer le PDF selon le type
    let result;

    switch (type) {
      case 'crc': {
        const dataResult = crcDataSchema.safeParse(body);
        if (!dataResult.success) {
          return NextResponse.json(
            { error: 'Données CRC invalides', details: dataResult.error.errors },
            { status: 400 }
          );
        }
        const data = dataResult.data;
        result = await generateCRCPDF({
          crc: data.crc as CRCGenerated,
          patient: data.patient,
          praticien: data.praticien,
          date: data.date ? new Date(data.date) : undefined,
          diagnostics: data.diagnostics as DiagnosticSelection | undefined,
          codage: data.codage as CodageConsultation | undefined,
        });
        break;
      }

      case 'ordonnance': {
        const dataResult = ordonnanceDataSchema.safeParse(body);
        if (!dataResult.success) {
          return NextResponse.json(
            { error: 'Données ordonnance invalides', details: dataResult.error.errors },
            { status: 400 }
          );
        }
        const data = dataResult.data;
        result = await generateOrdonnancePDF({
          medicaments: data.medicaments as Medicament[],
          patient: data.patient,
          praticien: data.praticien,
          date: data.date ? new Date(data.date) : undefined,
          commentaire: data.commentaire,
        });
        break;
      }

      case 'bilan': {
        const dataResult = bilanDataSchema.safeParse(body);
        if (!dataResult.success) {
          return NextResponse.json(
            { error: 'Données bilan invalides', details: dataResult.error.errors },
            { status: 400 }
          );
        }
        const data = dataResult.data;
        result = await generateBilanPDF({
          examens: data.examens as ExamenExtrait[],
          patient: data.patient,
          praticien: data.praticien,
          date: data.date ? new Date(data.date) : undefined,
          contexte_clinique: data.contexte_clinique,
        });
        break;
      }
    }

    // Retourner le PDF (convert Buffer to Uint8Array for NextResponse compatibility)
    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(result.filename)}"`,
        'Content-Length': result.buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération du PDF',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/[id]/pdf?type=crc|ordonnance|bilan
 * Récupère un PDF déjà généré (future implémentation avec stockage)
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Vérifier l'authentification
  const authResult = await verifyMedecinAccess();
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  // Pour l'instant, retourner une erreur car nous n'avons pas encore de stockage
  return NextResponse.json(
    {
      error: 'Non implémenté',
      details: `La récupération du document ${id} sera disponible dans une version future`,
    },
    { status: 501 }
  );
}
