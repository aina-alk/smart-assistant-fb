/**
 * Route API Health Check
 * Vérifie la connexion au FHIR Store et l'état de l'application
 */

import { NextResponse } from 'next/server';
import { fhirClient } from '@/lib/api/fhir-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Vérifie l'état de l'application et la connexion FHIR
 */
export async function GET() {
  try {
    // Vérifier si le client FHIR est configuré
    if (!fhirClient) {
      return NextResponse.json(
        {
          status: 'warning',
          message: 'FHIR client not configured',
          details: 'Missing required environment variables for FHIR connection',
          fhir: 'not_configured',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Tester la connexion au FHIR Store
    const fhirConnected = await fhirClient.testConnection();

    if (fhirConnected) {
      return NextResponse.json(
        {
          status: 'ok',
          message: 'Application is healthy',
          fhir: 'connected',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: 'error',
          message: 'FHIR connection failed',
          fhir: 'disconnected',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    // Gérer les erreurs inattendues
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        fhir: 'error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
