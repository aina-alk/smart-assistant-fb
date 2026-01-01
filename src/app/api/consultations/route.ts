/**
 * API Route : Consultations
 * GET /api/consultations - Lister les consultations (avec pagination et filtres)
 * POST /api/consultations - Créer une nouvelle consultation
 */

import { NextRequest, NextResponse } from 'next/server';
import { fhirClient, FHIRError } from '@/lib/api/fhir-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { consultationFormSchema } from '@/lib/validations/consultation';
import { consultationToFHIR, fhirToConsultation } from '@/types/consultation';
import type { Encounter, Practitioner } from '@/types/fhir';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * S'assure que le Practitioner existe dans le FHIR store.
 * Le crée avec les informations Firebase si inexistant.
 */
async function ensurePractitionerExists(user: DecodedIdToken): Promise<void> {
  if (!fhirClient) return;

  const practitionerId = user.uid;

  try {
    // Essayer de lire le Practitioner existant
    await fhirClient.read<Practitioner>('Practitioner', practitionerId);
  } catch (error) {
    // Si 404 (n'existe pas), le créer
    if (error instanceof FHIRError && error.statusCode === 404) {
      // Extraire nom et prénom depuis displayName ou email
      const displayName = user.name || user.email?.split('@')[0] || 'Praticien';
      const nameParts = displayName.split(' ');
      const given = nameParts.slice(0, -1).join(' ') || displayName;
      const family = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

      const practitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: practitionerId,
        active: true,
        name: [
          {
            use: 'official',
            text: displayName,
            family: family || undefined,
            given: given ? [given] : undefined,
          },
        ],
        telecom: user.email
          ? [
              {
                system: 'email',
                value: user.email,
                use: 'work',
              },
            ]
          : undefined,
      };

      // Utiliser PUT pour créer avec l'ID spécifié
      await fhirClient.update<Practitioner>('Practitioner', practitionerId, practitioner);
      console.warn(`Practitioner créé: ${practitionerId}`);
    } else {
      // Autre erreur, la propager
      throw error;
    }
  }
}

/**
 * GET - Lister les consultations avec pagination et filtres
 * Query params:
 *   - _count: nombre de résultats par page (défaut: 20)
 *   - _page_token: token pour la page suivante
 *   - patient: ID du patient pour filtrer
 *   - status: statut FHIR pour filtrer (planned, in-progress, finished, cancelled)
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

    // Récupérer les paramètres
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('_count') || '20';
    const pageToken = searchParams.get('_page_token');
    const patientId = searchParams.get('patient');
    const status = searchParams.get('status');

    // Construire les paramètres de recherche FHIR
    const params: Record<string, string> = {
      _count: count,
      _sort: '-date', // Tri par date décroissante
      class: 'AMB', // Seulement les consultations ambulatoires
    };

    if (pageToken) {
      params._page_token = pageToken;
    }

    if (patientId) {
      params.subject = `Patient/${patientId}`;
    }

    if (status) {
      params.status = status;
    }

    // Rechercher les encounters
    const bundle = await fhirClient.search<Encounter>('Encounter', params);

    // Convertir les résultats en format application
    const consultations = bundle.entry?.map((entry) => fhirToConsultation(entry.resource!)) || [];

    // Extraire le token pour la page suivante
    const nextLink = bundle.link?.find((link) => link.relation === 'next');
    const nextPageToken = nextLink
      ? new URL(nextLink.url).searchParams.get('_page_token')
      : undefined;

    return NextResponse.json({
      consultations,
      total: bundle.total || consultations.length,
      nextPageToken,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des consultations:', error);

    if (error instanceof FHIRError) {
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des consultations' },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer une nouvelle consultation
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

    // S'assurer que le Practitioner existe (le créer si nécessaire)
    await ensurePractitionerExists(authResult.user);

    // Parser et valider le body
    const body = await request.json();

    // Convertir la date si c'est une string
    if (body.date && typeof body.date === 'string') {
      body.date = new Date(body.date);
    }

    const validationResult = consultationFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const consultationData = validationResult.data;

    // Convertir en format FHIR
    const fhirEncounter = consultationToFHIR({
      patientId: consultationData.patientId,
      praticienId: consultationData.praticienId,
      date: consultationData.date,
      motif: consultationData.motif,
      statut: consultationData.statut,
      transcription: consultationData.transcription || undefined,
      crc: consultationData.crc,
      diagnostics: consultationData.diagnostics,
      codage: consultationData.codage,
      documents: consultationData.documents,
    });

    // Créer l'encounter dans FHIR
    const createdEncounter = await fhirClient.create<Encounter>('Encounter', fhirEncounter);

    // Convertir en format application
    const consultation = fhirToConsultation(createdEncounter);

    return NextResponse.json({ consultation }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la consultation:', error);

    if (error instanceof FHIRError) {
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la consultation' },
      { status: 500 }
    );
  }
}
