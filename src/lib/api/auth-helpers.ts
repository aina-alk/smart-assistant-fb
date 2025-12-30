/**
 * Helpers d'authentification pour les API routes
 */

import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/firebase/admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthResult {
  success: true;
  user: DecodedIdToken;
}

export interface AuthError {
  success: false;
  error: string;
  status: 401 | 403;
}

/**
 * Vérifie que l'utilisateur est authentifié et a le rôle médecin approuvé
 */
export async function verifyMedecinAccess(): Promise<AuthResult | AuthError> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return { success: false, error: 'Non authentifié', status: 401 };
  }

  const decodedClaims = await verifySessionCookie(sessionCookie);
  if (!decodedClaims) {
    return { success: false, error: 'Session invalide', status: 401 };
  }

  // Vérifier le rôle et le statut
  if (decodedClaims.role !== 'medecin') {
    return { success: false, error: 'Accès réservé aux médecins', status: 403 };
  }

  if (decodedClaims.status !== 'approved') {
    return { success: false, error: 'Compte non approuvé', status: 403 };
  }

  return { success: true, user: decodedClaims as DecodedIdToken };
}

/**
 * Vérifie que l'utilisateur est authentifié (sans vérification de rôle spécifique)
 */
export async function verifyAuthenticated(): Promise<AuthResult | AuthError> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return { success: false, error: 'Non authentifié', status: 401 };
  }

  const decodedClaims = await verifySessionCookie(sessionCookie);
  if (!decodedClaims) {
    return { success: false, error: 'Session invalide', status: 401 };
  }

  return { success: true, user: decodedClaims as DecodedIdToken };
}
