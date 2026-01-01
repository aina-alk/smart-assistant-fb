/**
 * API Route: Bilans d'une consultation
 * GET /api/bilans/[consultationId] - Récupérer les bilans d'une consultation
 * POST /api/bilans/[consultationId] - Créer un bilan pour une consultation
 * PUT /api/bilans/[consultationId] - Mettre à jour un bilan
 * DELETE /api/bilans/[consultationId]?bilanId=xxx - Supprimer un bilan
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fhirClient, FHIRError } from '@/lib/api/fhir-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { consultationToFHIR, fhirToConsultation } from '@/types/consultation';
import { createBilanRequestSchema, examenPrescritCreateSchema } from '@/types/bilan';
import type { Encounter } from '@/types/fhir';
import type { BilanPrescription, ExamenPrescrit } from '@/types/bilan';

type RouteContext = { params: Promise<{ id: string }> };

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `bil-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateExamenId(): string {
  return `exa-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// GET - Récupérer les bilans d'une consultation
// ============================================================================

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    if (!fhirClient) {
      return NextResponse.json({ error: 'Service FHIR non configuré' }, { status: 503 });
    }

    const { id: consultationId } = await params;

    if (!consultationId) {
      return NextResponse.json({ error: 'ID consultation requis' }, { status: 400 });
    }

    // Récupérer la consultation
    const fhirEncounter = await fhirClient.read<Encounter>('Encounter', consultationId);
    const consultation = fhirToConsultation(fhirEncounter);

    return NextResponse.json({
      bilans: consultation.bilans || [],
      consultationId,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des bilans:', error);

    if (error instanceof FHIRError) {
      if (error.statusCode === 404) {
        return NextResponse.json({ error: 'Consultation non trouvée' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des bilans' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Créer un bilan pour une consultation
// ============================================================================

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    if (!fhirClient) {
      return NextResponse.json({ error: 'Service FHIR non configuré' }, { status: 503 });
    }

    const { id: consultationId } = await params;

    if (!consultationId) {
      return NextResponse.json({ error: 'ID consultation requis' }, { status: 400 });
    }

    // Valider le body
    const body = await request.json();
    const validationResult = createBilanRequestSchema.safeParse({
      ...body,
      consultationId,
    });

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

    const { examens, contexte_clinique } = validationResult.data;

    // Récupérer la consultation existante
    const fhirEncounter = await fhirClient.read<Encounter>('Encounter', consultationId);
    const consultation = fhirToConsultation(fhirEncounter);

    // Vérifier que la consultation est modifiable
    if (consultation.statut === 'termine' || consultation.statut === 'annule') {
      return NextResponse.json(
        { error: 'Cette consultation ne peut plus être modifiée' },
        { status: 400 }
      );
    }

    // Créer le nouveau bilan
    const now = new Date();
    const newBilan: BilanPrescription = {
      id: generateId(),
      consultationId,
      patientId: consultation.patientId,
      date: now,
      examens: examens.map(
        (e): ExamenPrescrit => ({
          code: e.code || generateExamenId(),
          libelle: e.libelle,
          categorie: e.categorie,
          indication: e.indication,
          urgent: e.urgent,
          commentaire: e.commentaire,
        })
      ),
      contexte_clinique,
      createdAt: now,
      updatedAt: now,
    };

    // Ajouter le bilan à la consultation
    const updatedBilans = [...(consultation.bilans || []), newBilan];

    // Mettre à jour la consultation
    const updatedConsultation = {
      ...consultation,
      bilans: updatedBilans,
    };

    const updatedEncounter = consultationToFHIR(updatedConsultation, consultationId);
    await fhirClient.update<Encounter>('Encounter', consultationId, updatedEncounter);

    return NextResponse.json({ bilan: newBilan }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du bilan:', error);

    if (error instanceof FHIRError) {
      if (error.statusCode === 404) {
        return NextResponse.json({ error: 'Consultation non trouvée' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json({ error: 'Erreur lors de la création du bilan' }, { status: 500 });
  }
}

// ============================================================================
// PUT - Mettre à jour un bilan
// ============================================================================

const updateBilanSchema = z.object({
  bilanId: z.string().min(1, "L'ID du bilan est requis"),
  examens: z.array(examenPrescritCreateSchema).optional(),
  contexte_clinique: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    if (!fhirClient) {
      return NextResponse.json({ error: 'Service FHIR non configuré' }, { status: 503 });
    }

    const { id: consultationId } = await params;

    if (!consultationId) {
      return NextResponse.json({ error: 'ID consultation requis' }, { status: 400 });
    }

    // Valider le body
    const body = await request.json();
    const validationResult = updateBilanSchema.safeParse(body);

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

    const { bilanId, examens, contexte_clinique } = validationResult.data;

    // Récupérer la consultation
    const fhirEncounter = await fhirClient.read<Encounter>('Encounter', consultationId);
    const consultation = fhirToConsultation(fhirEncounter);

    // Vérifier que la consultation est modifiable
    if (consultation.statut === 'termine' || consultation.statut === 'annule') {
      return NextResponse.json(
        { error: 'Cette consultation ne peut plus être modifiée' },
        { status: 400 }
      );
    }

    // Trouver le bilan à mettre à jour
    const bilanIndex = (consultation.bilans || []).findIndex((b) => b.id === bilanId);

    if (bilanIndex === -1) {
      return NextResponse.json({ error: 'Bilan non trouvé' }, { status: 404 });
    }

    // Mettre à jour le bilan
    const existingBilan = consultation.bilans![bilanIndex];
    const updatedBilan: BilanPrescription = {
      ...existingBilan,
      examens: examens
        ? examens.map(
            (e): ExamenPrescrit => ({
              code: e.code || generateExamenId(),
              libelle: e.libelle,
              categorie: e.categorie,
              indication: e.indication,
              urgent: e.urgent,
              commentaire: e.commentaire,
            })
          )
        : existingBilan.examens,
      contexte_clinique:
        contexte_clinique !== undefined ? contexte_clinique : existingBilan.contexte_clinique,
      updatedAt: new Date(),
    };

    // Mettre à jour le tableau de bilans
    const updatedBilans = [...consultation.bilans!];
    updatedBilans[bilanIndex] = updatedBilan;

    // Mettre à jour la consultation
    const updatedConsultation = {
      ...consultation,
      bilans: updatedBilans,
    };

    const updatedEncounter = consultationToFHIR(updatedConsultation, consultationId);
    await fhirClient.update<Encounter>('Encounter', consultationId, updatedEncounter);

    return NextResponse.json({ bilan: updatedBilan });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bilan:', error);

    if (error instanceof FHIRError) {
      if (error.statusCode === 404) {
        return NextResponse.json({ error: 'Consultation non trouvée' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json({ error: 'Erreur lors de la mise à jour du bilan' }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Supprimer un bilan
// ============================================================================

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    if (!fhirClient) {
      return NextResponse.json({ error: 'Service FHIR non configuré' }, { status: 503 });
    }

    const { id: consultationId } = await params;
    const { searchParams } = new URL(request.url);
    const bilanId = searchParams.get('bilanId');

    if (!consultationId) {
      return NextResponse.json({ error: 'ID consultation requis' }, { status: 400 });
    }

    if (!bilanId) {
      return NextResponse.json({ error: 'ID bilan requis' }, { status: 400 });
    }

    // Récupérer la consultation
    const fhirEncounter = await fhirClient.read<Encounter>('Encounter', consultationId);
    const consultation = fhirToConsultation(fhirEncounter);

    // Vérifier que la consultation est modifiable
    if (consultation.statut === 'termine' || consultation.statut === 'annule') {
      return NextResponse.json(
        { error: 'Cette consultation ne peut plus être modifiée' },
        { status: 400 }
      );
    }

    // Vérifier que le bilan existe
    const bilanExists = (consultation.bilans || []).some((b) => b.id === bilanId);

    if (!bilanExists) {
      return NextResponse.json({ error: 'Bilan non trouvé' }, { status: 404 });
    }

    // Supprimer le bilan
    const updatedBilans = (consultation.bilans || []).filter((b) => b.id !== bilanId);

    // Mettre à jour la consultation
    const updatedConsultation = {
      ...consultation,
      bilans: updatedBilans,
    };

    const updatedEncounter = consultationToFHIR(updatedConsultation, consultationId);
    await fhirClient.update<Encounter>('Encounter', consultationId, updatedEncounter);

    return NextResponse.json({ success: true, message: 'Bilan supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du bilan:', error);

    if (error instanceof FHIRError) {
      if (error.statusCode === 404) {
        return NextResponse.json({ error: 'Consultation non trouvée' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json({ error: 'Erreur lors de la suppression du bilan' }, { status: 500 });
  }
}
