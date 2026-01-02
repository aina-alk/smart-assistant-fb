/**
 * API Route : Patients
 * GET /api/patients - Lister les patients (avec pagination)
 * POST /api/patients - Créer un nouveau patient
 */

import { NextRequest, NextResponse } from 'next/server';
import { fhirClient, FHIRError } from '@/lib/api/fhir-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { patientFormSchema } from '@/lib/validations/patient';
import { patientToFHIR, fhirToPatient } from '@/types/patient';
import type { Patient as FHIRPatient } from '@/types/fhir';

/**
 * GET - Lister les patients avec pagination
 * Query params:
 *   - _count: nombre de résultats par page (défaut: 20)
 *   - _page_token: token pour la page suivante
 */
export async function GET(request: NextRequest) {
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

    // Récupérer les paramètres de pagination
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('_count') || '20';
    const pageToken = searchParams.get('_page_token');

    // Construire les paramètres de recherche FHIR
    const params: Record<string, string> = {
      _count: count,
      _sort: '-_lastUpdated', // Tri par date de mise à jour décroissante
    };

    if (pageToken) {
      params._page_token = pageToken;
    }

    // Rechercher les patients
    const bundle = await fhirClient.search<FHIRPatient>('Patient', params);

    // Convertir les résultats en format application
    const patients = bundle.entry?.map((entry) => fhirToPatient(entry.resource!)) || [];

    // Extraire le token pour la page suivante
    const nextLink = bundle.link?.find((link) => link.relation === 'next');
    const nextPageToken = nextLink
      ? new URL(nextLink.url).searchParams.get('_page_token')
      : undefined;

    return NextResponse.json({
      patients,
      total: bundle.total || patients.length,
      nextPageToken,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);

    if (error instanceof FHIRError) {
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    // Erreur d'authentification Google Cloud
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (
      errorMessage.includes('Could not load the default credentials') ||
      errorMessage.includes('Unable to detect a Project Id')
    ) {
      return NextResponse.json(
        { error: 'Service FHIR non configuré: credentials Google Cloud manquantes' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des patients' },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer un nouveau patient
 */
export async function POST(request: NextRequest) {
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

    // Parser et valider le body
    const body = await request.json();

    // Convertir la date de naissance si c'est une string
    if (body.dateNaissance && typeof body.dateNaissance === 'string') {
      body.dateNaissance = new Date(body.dateNaissance);
    }

    const validationResult = patientFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const patientData = validationResult.data;

    // Convertir en format FHIR
    const fhirPatient = patientToFHIR({
      nom: patientData.nom,
      prenom: patientData.prenom,
      dateNaissance: patientData.dateNaissance,
      sexe: patientData.sexe,
      telephone: patientData.telephone || undefined,
      email: patientData.email || undefined,
      adresse: patientData.adresse || undefined,
      codePostal: patientData.codePostal || undefined,
      ville: patientData.ville || undefined,
      nir: patientData.nir || undefined,
      mutuelleNom: patientData.mutuelleNom || undefined,
      mutuelleNumero: patientData.mutuelleNumero || undefined,
    });

    // Créer le patient dans FHIR
    const createdFhirPatient = await fhirClient.create<FHIRPatient>('Patient', fhirPatient);

    // Convertir en format application
    const patient = fhirToPatient(createdFhirPatient);

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du patient:', error);

    if (error instanceof FHIRError) {
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json({ error: 'Erreur lors de la création du patient' }, { status: 500 });
  }
}
