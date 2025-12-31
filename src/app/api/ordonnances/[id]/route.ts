/**
 * API Route: Ordonnances d'une consultation
 * GET /api/ordonnances/[consultationId] - Récupérer les ordonnances d'une consultation
 * POST /api/ordonnances/[consultationId] - Créer une ordonnance pour une consultation
 * PUT /api/ordonnances/[consultationId] - Mettre à jour une ordonnance
 * DELETE /api/ordonnances/[consultationId]?ordonnanceId=xxx - Supprimer une ordonnance
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fhirClient, FHIRError } from '@/lib/api/fhir-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { consultationToFHIR, fhirToConsultation } from '@/types/consultation';
import { createOrdonnanceRequestSchema, medicamentCreateSchema } from '@/types/ordonnance';
import type { Encounter } from '@/types/fhir';
import type { Ordonnance, Medicament } from '@/types/ordonnance';

type RouteContext = { params: Promise<{ id: string }> };

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `ord-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateMedicamentId(): string {
  return `med-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// GET - Récupérer les ordonnances d'une consultation
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
      ordonnances: consultation.ordonnances || [],
      consultationId,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ordonnances:', error);

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
      { error: 'Erreur lors de la récupération des ordonnances' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Créer une ordonnance pour une consultation
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
    const validationResult = createOrdonnanceRequestSchema.safeParse({
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

    const { medicaments, commentaire } = validationResult.data;

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

    // Créer la nouvelle ordonnance
    const now = new Date();
    const newOrdonnance: Ordonnance = {
      id: generateId(),
      consultationId,
      patientId: consultation.patientId,
      date: now,
      medicaments: medicaments.map((m) => ({
        ...m,
        id: generateMedicamentId(),
      })),
      commentaire,
      createdAt: now,
      updatedAt: now,
    };

    // Ajouter l'ordonnance à la consultation
    const updatedOrdonnances = [...(consultation.ordonnances || []), newOrdonnance];

    // Mettre à jour la consultation
    const updatedConsultation = {
      ...consultation,
      ordonnances: updatedOrdonnances,
    };

    const updatedEncounter = consultationToFHIR(updatedConsultation, consultationId);
    await fhirClient.update<Encounter>('Encounter', consultationId, updatedEncounter);

    return NextResponse.json({ ordonnance: newOrdonnance }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'ordonnance:", error);

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
      { error: "Erreur lors de la création de l'ordonnance" },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Mettre à jour une ordonnance
// ============================================================================

const updateOrdonnanceSchema = z.object({
  ordonnanceId: z.string().min(1, "L'ID de l'ordonnance est requis"),
  medicaments: z.array(medicamentCreateSchema).optional(),
  commentaire: z.string().optional(),
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
    const validationResult = updateOrdonnanceSchema.safeParse(body);

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

    const { ordonnanceId, medicaments, commentaire } = validationResult.data;

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

    // Trouver l'ordonnance à mettre à jour
    const ordonnanceIndex = (consultation.ordonnances || []).findIndex(
      (o) => o.id === ordonnanceId
    );

    if (ordonnanceIndex === -1) {
      return NextResponse.json({ error: 'Ordonnance non trouvée' }, { status: 404 });
    }

    // Mettre à jour l'ordonnance
    const existingOrdonnance = consultation.ordonnances![ordonnanceIndex];
    const updatedOrdonnance: Ordonnance = {
      ...existingOrdonnance,
      medicaments: medicaments
        ? medicaments.map(
            (m): Medicament => ({
              ...m,
              id: generateMedicamentId(),
            })
          )
        : existingOrdonnance.medicaments,
      commentaire: commentaire !== undefined ? commentaire : existingOrdonnance.commentaire,
      updatedAt: new Date(),
    };

    // Mettre à jour le tableau d'ordonnances
    const updatedOrdonnances = [...consultation.ordonnances!];
    updatedOrdonnances[ordonnanceIndex] = updatedOrdonnance;

    // Mettre à jour la consultation
    const updatedConsultation = {
      ...consultation,
      ordonnances: updatedOrdonnances,
    };

    const updatedEncounter = consultationToFHIR(updatedConsultation, consultationId);
    await fhirClient.update<Encounter>('Encounter', consultationId, updatedEncounter);

    return NextResponse.json({ ordonnance: updatedOrdonnance });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordonnance:", error);

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
      { error: "Erreur lors de la mise à jour de l'ordonnance" },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Supprimer une ordonnance
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
    const ordonnanceId = searchParams.get('ordonnanceId');

    if (!consultationId) {
      return NextResponse.json({ error: 'ID consultation requis' }, { status: 400 });
    }

    if (!ordonnanceId) {
      return NextResponse.json({ error: 'ID ordonnance requis' }, { status: 400 });
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

    // Vérifier que l'ordonnance existe
    const ordonnanceExists = (consultation.ordonnances || []).some((o) => o.id === ordonnanceId);

    if (!ordonnanceExists) {
      return NextResponse.json({ error: 'Ordonnance non trouvée' }, { status: 404 });
    }

    // Supprimer l'ordonnance
    const updatedOrdonnances = (consultation.ordonnances || []).filter(
      (o) => o.id !== ordonnanceId
    );

    // Mettre à jour la consultation
    const updatedConsultation = {
      ...consultation,
      ordonnances: updatedOrdonnances,
    };

    const updatedEncounter = consultationToFHIR(updatedConsultation, consultationId);
    await fhirClient.update<Encounter>('Encounter', consultationId, updatedEncounter);

    return NextResponse.json({ success: true, message: 'Ordonnance supprimée' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'ordonnance:", error);

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
      { error: "Erreur lors de la suppression de l'ordonnance" },
      { status: 500 }
    );
  }
}
