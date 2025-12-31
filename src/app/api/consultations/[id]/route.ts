/**
 * API Route : Consultation individuelle
 * GET /api/consultations/[id] - Récupérer une consultation par ID
 * PUT /api/consultations/[id] - Mettre à jour une consultation
 * DELETE /api/consultations/[id] - Supprimer une consultation
 */

import { NextRequest, NextResponse } from 'next/server';
import { fhirClient, FHIRError } from '@/lib/api/fhir-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { consultationUpdateApiSchema } from '@/lib/validations/consultation';
import { consultationToFHIR, fhirToConsultation } from '@/types/consultation';
import type { Encounter } from '@/types/fhir';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET - Récupérer une consultation par son ID
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Vérifier que le client FHIR est configuré
    if (!fhirClient) {
      return NextResponse.json({ error: 'Service FHIR non configuré' }, { status: 503 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID consultation requis' }, { status: 400 });
    }

    // Récupérer l'encounter depuis FHIR
    const fhirEncounter = await fhirClient.read<Encounter>('Encounter', id);

    // Convertir en format application
    const consultation = fhirToConsultation(fhirEncounter);

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error('Erreur lors de la récupération de la consultation:', error);

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
      { error: 'Erreur lors de la récupération de la consultation' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Mettre à jour une consultation
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Vérifier que le client FHIR est configuré
    if (!fhirClient) {
      return NextResponse.json({ error: 'Service FHIR non configuré' }, { status: 503 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID consultation requis' }, { status: 400 });
    }

    // Parser et valider le body
    const body = await request.json();

    // Convertir la date si c'est une string
    if (body.date && typeof body.date === 'string') {
      body.date = new Date(body.date);
    }

    const validationResult = consultationUpdateApiSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Récupérer la consultation existante
    const existingEncounter = await fhirClient.read<Encounter>('Encounter', id);
    const existingConsultation = fhirToConsultation(existingEncounter);

    // Vérifier que la consultation est modifiable
    if (existingConsultation.statut === 'termine' || existingConsultation.statut === 'annule') {
      return NextResponse.json(
        { error: 'Cette consultation ne peut plus être modifiée' },
        { status: 400 }
      );
    }

    // Fusionner les données existantes avec les mises à jour
    const updatedConsultationData = {
      ...existingConsultation,
      ...updateData,
      // Préserver les champs non modifiables
      patientId: existingConsultation.patientId,
    };

    // Convertir en format FHIR
    const fhirEncounter = consultationToFHIR(updatedConsultationData, id);

    // Mettre à jour dans FHIR
    const updatedEncounter = await fhirClient.update<Encounter>('Encounter', id, fhirEncounter);

    // Convertir en format application
    const consultation = fhirToConsultation(updatedEncounter);

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la consultation:', error);

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
      { error: 'Erreur lors de la mise à jour de la consultation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer une consultation
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyMedecinAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Vérifier que le client FHIR est configuré
    if (!fhirClient) {
      return NextResponse.json({ error: 'Service FHIR non configuré' }, { status: 503 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID consultation requis' }, { status: 400 });
    }

    // Vérifier que la consultation existe et est supprimable
    const existingEncounter = await fhirClient.read<Encounter>('Encounter', id);
    const existingConsultation = fhirToConsultation(existingEncounter);

    if (existingConsultation.statut === 'termine') {
      return NextResponse.json(
        { error: 'Une consultation terminée ne peut pas être supprimée' },
        { status: 400 }
      );
    }

    // Supprimer l'encounter dans FHIR
    await fhirClient.delete('Encounter', id);

    return NextResponse.json({ success: true, message: 'Consultation supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la consultation:', error);

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
      { error: 'Erreur lors de la suppression de la consultation' },
      { status: 500 }
    );
  }
}
