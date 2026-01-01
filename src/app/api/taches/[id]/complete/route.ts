/**
 * API Route : Complétion de tâche
 * POST /api/taches/[id]/complete - Marquer une tâche comme terminée
 */

import { NextRequest, NextResponse } from 'next/server';
import { fhirClient, FHIRError } from '@/lib/api/fhir-client';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { tacheToFHIR, fhirToTache, isTacheEditable, type FHIRTask } from '@/types/tache';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST - Marquer une tâche comme terminée
 */
export async function POST(_request: NextRequest, { params }: RouteContext) {
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

    // Mettre à jour le statut et la date de complétion
    const completedTacheData = {
      ...existingTache,
      statut: 'terminee' as const,
      completedAt: new Date(),
    };

    // Convertir en format FHIR
    const fhirTask = tacheToFHIR(completedTacheData, id);

    // Mettre à jour dans FHIR
    const updatedTask = await fhirClient.update<FHIRTask>('Task', id, fhirTask);

    // Convertir en format application
    const tache = fhirToTache(updatedTask);

    return NextResponse.json({ tache });
  } catch (error) {
    console.error('Erreur lors de la complétion de la tâche:', error);

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
      { error: 'Erreur lors de la complétion de la tâche' },
      { status: 500 }
    );
  }
}
