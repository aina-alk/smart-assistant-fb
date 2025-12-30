/**
 * API Route : Recherche de patients
 * GET /api/patients/search - Rechercher des patients avec critères
 */

import { NextRequest, NextResponse } from 'next/server';
import { fhirClient, FHIRError } from '@/lib/api/fhir-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { patientSearchSchema } from '@/lib/validations/patient';
import { fhirToPatient, NIR_SYSTEM } from '@/types/patient';
import type { Patient as FHIRPatient } from '@/types/fhir';

/**
 * GET - Rechercher des patients
 * Query params:
 *   - query: recherche générale (nom ou prénom)
 *   - nom: filtrer par nom de famille
 *   - prenom: filtrer par prénom
 *   - dateNaissance: filtrer par date de naissance (YYYY-MM-DD)
 *   - nir: filtrer par numéro de sécurité sociale
 *   - telephone: filtrer par téléphone
 *   - limit: nombre de résultats (défaut: 20, max: 100)
 *   - pageToken: token pour pagination
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

    // Récupérer et valider les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const rawParams = {
      query: searchParams.get('query') || undefined,
      nom: searchParams.get('nom') || undefined,
      prenom: searchParams.get('prenom') || undefined,
      dateNaissance: searchParams.get('dateNaissance') || undefined,
      nir: searchParams.get('nir') || undefined,
      telephone: searchParams.get('telephone') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
      pageToken: searchParams.get('pageToken') || undefined,
    };

    const validationResult = patientSearchSchema.safeParse(rawParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Paramètres de recherche invalides',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const params = validationResult.data;

    // Construire les paramètres de recherche FHIR
    const fhirParams: Record<string, string> = {
      _count: params.limit.toString(),
      _sort: '-_lastUpdated',
    };

    // Recherche générale par nom
    if (params.query) {
      // FHIR supporte la recherche partielle avec :contains
      fhirParams.name = params.query;
    }

    // Recherche par nom de famille
    if (params.nom) {
      fhirParams.family = params.nom;
    }

    // Recherche par prénom
    if (params.prenom) {
      fhirParams.given = params.prenom;
    }

    // Recherche par date de naissance
    if (params.dateNaissance) {
      fhirParams.birthdate = params.dateNaissance;
    }

    // Recherche par NIR
    if (params.nir) {
      fhirParams.identifier = `${NIR_SYSTEM}|${params.nir}`;
    }

    // Recherche par téléphone
    if (params.telephone) {
      fhirParams.telecom = params.telephone;
    }

    // Token de pagination
    if (params.pageToken) {
      fhirParams._page_token = params.pageToken;
    }

    // Effectuer la recherche FHIR
    const bundle = await fhirClient.search<FHIRPatient>('Patient', fhirParams);

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
    console.error('Erreur lors de la recherche de patients:', error);

    if (error instanceof FHIRError) {
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json({ error: 'Erreur lors de la recherche de patients' }, { status: 500 });
  }
}
