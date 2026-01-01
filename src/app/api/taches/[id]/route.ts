/**
 * API Route : Tâche individuelle
 * GET /api/taches/[id] - Récupérer une tâche par ID
 * PUT /api/taches/[id] - Mettre à jour une tâche
 * DELETE /api/taches/[id] - Supprimer une tâche
 */

import { NextRequest, NextResponse } from 'next/server';
import { fhirClient, FHIRError } from '@/lib/api/fhir-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { tacheUpdateApiSchema } from '@/lib/validations/tache';
import { tacheToFHIR, fhirToTache, isTacheEditable, type FHIRTask } from '@/types/tache';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET - Récupérer une tâche par son ID
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
      return NextResponse.json({ error: 'ID tâche requis' }, { status: 400 });
    }

    // Récupérer la task depuis FHIR
    const fhirTask = await fhirClient.read<FHIRTask>('Task', id);

    // Convertir en format application
    const tache = fhirToTache(fhirTask);

    return NextResponse.json({ tache });
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche:', error);

    if (error instanceof FHIRError) {
      if (error.statusCode === 404) {
        return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la tâche' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Mettre à jour une tâche
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
      return NextResponse.json({ error: 'ID tâche requis' }, { status: 400 });
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

    const validationResult = tacheUpdateApiSchema.safeParse(body);
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

    // Récupérer la tâche existante
    const existingTask = await fhirClient.read<FHIRTask>('Task', id);
    const existingTache = fhirToTache(existingTask);

    // Vérifier que la tâche est modifiable
    if (!isTacheEditable(existingTache)) {
      return NextResponse.json(
        { error: 'Cette tâche ne peut plus être modifiée' },
        { status: 400 }
      );
    }

    // Fusionner les données existantes avec les mises à jour
    const updatedTacheData = {
      ...existingTache,
      ...updateData,
    };

    // Convertir en format FHIR
    const fhirTask = tacheToFHIR(updatedTacheData, id);

    // Mettre à jour dans FHIR
    const updatedTask = await fhirClient.update<FHIRTask>('Task', id, fhirTask);

    // Convertir en format application
    const tache = fhirToTache(updatedTask);

    return NextResponse.json({ tache });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);

    if (error instanceof FHIRError) {
      if (error.statusCode === 404) {
        return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la tâche' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer une tâche
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
      return NextResponse.json({ error: 'ID tâche requis' }, { status: 400 });
    }

    // Vérifier que la tâche existe
    const existingTask = await fhirClient.read<FHIRTask>('Task', id);
    const existingTache = fhirToTache(existingTask);

    // Vérifier que la tâche est supprimable (pas terminée)
    if (existingTache.statut === 'terminee') {
      return NextResponse.json(
        { error: 'Une tâche terminée ne peut pas être supprimée' },
        { status: 400 }
      );
    }

    // Supprimer la task dans FHIR
    await fhirClient.delete('Task', id);

    return NextResponse.json({ success: true, message: 'Tâche supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);

    if (error instanceof FHIRError) {
      if (error.statusCode === 404) {
        return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message, details: error.outcome },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la tâche' },
      { status: 500 }
    );
  }
}
