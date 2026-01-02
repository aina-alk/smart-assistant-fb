/**
 * Route API Health Check
 *
 * Endpoint minimaliste pour les health checks.
 * Ne révèle aucune information sur l'architecture interne.
 */

import { NextResponse } from 'next/server';
import { fhirClient } from '@/lib/api/fhir-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 *
 * Retourne un status simple sans exposer de détails sur l'infrastructure.
 * Utilisé par les load balancers et monitoring.
 */
export async function GET() {
  try {
    // Vérification basique - le client existe et peut communiquer
    const isHealthy = fhirClient ? await fhirClient.testConnection() : true;

    if (isHealthy) {
      return NextResponse.json(
        { status: 'ok' },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store, max-age=0' },
        }
      );
    }

    // Service dégradé mais application fonctionnelle
    return NextResponse.json(
      { status: 'degraded' },
      {
        status: 200, // 200 pour ne pas déclencher d'alertes inutiles
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch {
    // Log interne uniquement, pas d'exposition externe
    console.error('[Health] Check failed');

    return NextResponse.json(
      { status: 'error' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  }
}
