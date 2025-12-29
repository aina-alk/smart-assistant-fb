/**
 * Middleware Next.js - Protection des routes par authentification
 */

import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'session';

// Routes publiques (ne nécessitent pas d'authentification)
const PUBLIC_PATHS = ['/login', '/api/auth'];

// Fichiers statiques et assets Next.js à ignorer
const IGNORED_PATHS = ['/_next', '/favicon.ico', '/api/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les fichiers statiques et assets Next.js
  if (
    IGNORED_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.includes('.') // fichiers avec extension (.js, .css, .png, etc.)
  ) {
    return NextResponse.next();
  }

  // Vérifier la présence du cookie de session
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  // Si pas de session et tentative d'accès à une route protégée
  if (!sessionCookie && !PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si session existe et tentative d'accès à /login, rediriger vers /
  if (sessionCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - api/auth (routes d'authentification)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
