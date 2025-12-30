/**
 * API Route : Patient individuel
 * GET /api/patients/[id] - Récupérer un patient par ID
 * PUT /api/patients/[id] - Mettre à jour un patient
 * DELETE /api/patients/[id] - Supprimer un patient
 */

import { NextRequest, NextResponse } from 'next/server';
import { fhirClient, FHIRError } from '@/lib/api/fhir-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { patientUpdateApiSchema } from '@/lib/validations/patient';
import { patientToFHIR, fhirToPatient } from '@/types/patient';
import type { Patient as FHIRPatient } from '@/types/fhir';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET - Récupérer un patient par son ID
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
      return NextResponse.json({ error: 'ID patient requis' }, { status: 400 });
    }

    // Récupérer le patient depuis FHIR
    const fhirPatient = await fhirClient.read<FHIRPatient>('Patient', id);

    // Convertir en format application
    const patient = fhirToPatient(fhirPatient);

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Erreur lors de la récupération du patient:', error);

    if (error instanceof FHIRError) {
      if (error.statusCode === 404) {
        return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération du patient' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Mettre à jour un patient
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
      return NextResponse.json({ error: 'ID patient requis' }, { status: 400 });
    }

    // Parser et valider le body
    const body = await request.json();

    // Convertir la date de naissance si c'est une string
    if (body.dateNaissance && typeof body.dateNaissance === 'string') {
      body.dateNaissance = new Date(body.dateNaissance);
    }

    const validationResult = patientUpdateApiSchema.safeParse(body);
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

    // Récupérer le patient existant
    const existingFhirPatient = await fhirClient.read<FHIRPatient>('Patient', id);
    const existingPatient = fhirToPatient(existingFhirPatient);

    // Fusionner les données existantes avec les mises à jour
    const updatedPatientData = {
      ...existingPatient,
      ...updateData,
      // Convertir les champs vides en undefined
      telephone: updateData.telephone || existingPatient.telephone,
      email: updateData.email || existingPatient.email,
      adresse: updateData.adresse || existingPatient.adresse,
      codePostal: updateData.codePostal || existingPatient.codePostal,
      ville: updateData.ville || existingPatient.ville,
      nir: updateData.nir || existingPatient.nir,
      mutuelleNom: updateData.mutuelleNom || existingPatient.mutuelleNom,
      mutuelleNumero: updateData.mutuelleNumero || existingPatient.mutuelleNumero,
    };

    // Convertir en format FHIR
    const fhirPatient = patientToFHIR(updatedPatientData, id);

    // Mettre à jour dans FHIR
    const updatedFhirPatient = await fhirClient.update<FHIRPatient>('Patient', id, fhirPatient);

    // Convertir en format application
    const patient = fhirToPatient(updatedFhirPatient);

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du patient:', error);

    if (error instanceof FHIRError) {
      if (error.statusCode === 404) {
        return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du patient' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer un patient
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
      return NextResponse.json({ error: 'ID patient requis' }, { status: 400 });
    }

    // Supprimer le patient dans FHIR
    await fhirClient.delete('Patient', id);

    return NextResponse.json({ success: true, message: 'Patient supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du patient:', error);

    if (error instanceof FHIRError) {
      if (error.statusCode === 404) {
        return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression du patient' },
      { status: 500 }
    );
  }
}
