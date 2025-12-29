/**
 * API Route pour gérer les sessions Firebase
 * POST /api/auth/session - Créer une session (cookie httpOnly)
 * DELETE /api/auth/session - Supprimer une session (logout)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session';
const FIVE_DAYS_IN_MS = 60 * 60 * 24 * 5 * 1000;

/**
 * POST - Créer un cookie de session après login
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken manquant ou invalide' }, { status: 400 });
    }

    // Créer le cookie de session via Firebase Admin
    const sessionCookie = await createSessionCookie(idToken, FIVE_DAYS_IN_MS);

    // Définir le cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: FIVE_DAYS_IN_MS / 1000, // en secondes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer le cookie de session (logout)
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la session' },
      { status: 500 }
    );
  }
}
