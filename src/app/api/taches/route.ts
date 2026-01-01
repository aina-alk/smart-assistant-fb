/**
 * API Route : Tâches
 * GET /api/taches - Lister les tâches (avec pagination et filtres)
 * POST /api/taches - Créer une nouvelle tâche
 */

import { NextRequest, NextResponse } from 'next/server';
import { fhirClient, FHIRError } from '@/lib/api/fhir-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { tacheFormSchema, tacheSearchSchema } from '@/lib/validations/tache';
import { tacheToFHIR, fhirToTache, type FHIRTask } from '@/types/tache';

/**
 * GET - Lister les tâches avec pagination et filtres
 * Query params:
 *   - _count: nombre de résultats par page (défaut: 20)
 *   - _page_token: token pour la page suivante
 *   - statut: statut de la tâche (a_faire, en_cours, terminee, annulee)
 *   - priorite: priorité de la tâche (basse, normale, haute, urgente)
 *   - categorie: catégorie de la tâche
 *   - patient: ID du patient pour filtrer
 *   - consultation: ID de la consultation pour filtrer
 *   - echeance_avant: date limite avant (YYYY-MM-DD)
 *   - echeance_apres: date limite après (YYYY-MM-DD)
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
    const statut = searchParams.get('statut');
    const priorite = searchParams.get('priorite');
    const categorie = searchParams.get('categorie');
    const patientId = searchParams.get('patient');
    const consultationId = searchParams.get('consultation');
    const echeanceAvant = searchParams.get('echeance_avant');
    const echeanceApres = searchParams.get('echeance_apres');

    // Valider les paramètres de recherche
    const searchValidation = tacheSearchSchema.safeParse({
      statut: statut || undefined,
      priorite: priorite || undefined,
      categorie: categorie || undefined,
      patientId: patientId || undefined,
      consultationId: consultationId || undefined,
      echeanceAvant: echeanceAvant || undefined,
      echeanceApres: echeanceApres || undefined,
      limit: count ? parseInt(count, 10) : undefined,
      pageToken: pageToken || undefined,
    });

    if (!searchValidation.success) {
      return NextResponse.json(
        {
          error: 'Paramètres de recherche invalides',
          details: searchValidation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Construire les paramètres de recherche FHIR
    const params: Record<string, string> = {
      _count: count,
      _sort: '-authored-on', // Tri par date de création décroissante
    };

    if (pageToken) {
      params._page_token = pageToken;
    }

    // Mapping statut application → FHIR
    if (statut) {
      const statutToFhir: Record<string, string> = {
        a_faire: 'requested',
        en_cours: 'in-progress',
        terminee: 'completed',
        annulee: 'cancelled',
      };
      params.status = statutToFhir[statut] || statut;
    }

    // Mapping priorité application → FHIR
    if (priorite) {
      const prioriteToFhir: Record<string, string> = {
        basse: 'routine',
        normale: 'routine',
        haute: 'urgent',
        urgente: 'stat',
      };
      params.priority = prioriteToFhir[priorite] || priorite;
    }

    if (patientId) {
      params['subject'] = `Patient/${patientId}`;
    }

    if (consultationId) {
      params['encounter'] = `Encounter/${consultationId}`;
    }

    // Rechercher les tasks
    const bundle = await fhirClient.search<FHIRTask>('Task', params);

    // Convertir les résultats en format application
    let taches = bundle.entry?.map((entry) => fhirToTache(entry.resource!)) || [];

    // Filtres supplémentaires côté application (pour les filtres non supportés par FHIR)
    if (categorie) {
      taches = taches.filter((t) => t.categorie === categorie);
    }

    if (echeanceAvant) {
      const dateAvant = new Date(echeanceAvant);
      taches = taches.filter((t) => t.echeance && t.echeance <= dateAvant);
    }

    if (echeanceApres) {
      const dateApres = new Date(echeanceApres);
      taches = taches.filter((t) => t.echeance && t.echeance >= dateApres);
    }

    // Extraire le token pour la page suivante
    const nextLink = bundle.link?.find((link) => link.relation === 'next');
    const nextPageToken = nextLink
      ? new URL(nextLink.url).searchParams.get('_page_token')
      : undefined;

    return NextResponse.json({
      taches,
      total: bundle.total || taches.length,
      nextPageToken,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);

    if (error instanceof FHIRError) {
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tâches' },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer une nouvelle tâche
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

    // Convertir les dates si ce sont des strings
    if (body.echeance && typeof body.echeance === 'string') {
      body.echeance = new Date(body.echeance);
    }
    if (body.rappel && typeof body.rappel === 'string') {
      body.rappel = new Date(body.rappel);
    }

    const validationResult = tacheFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const tacheData = validationResult.data;

    // Convertir en format FHIR
    const fhirTask = tacheToFHIR({
      titre: tacheData.titre,
      description: tacheData.description || undefined,
      priorite: tacheData.priorite,
      statut: tacheData.statut,
      categorie: tacheData.categorie,
      echeance: tacheData.echeance,
      rappel: tacheData.rappel,
      patientId: tacheData.patientId,
      consultationId: tacheData.consultationId,
    });

    // Créer la task dans FHIR
    const createdTask = await fhirClient.create<FHIRTask>('Task', fhirTask);

    // Convertir en format application
    const tache = fhirToTache(createdTask);

    return NextResponse.json({ tache }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);

    if (error instanceof FHIRError) {
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json({ error: 'Erreur lors de la création de la tâche' }, { status: 500 });
  }
}
