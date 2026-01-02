/**
 * Middleware Next.js — Sécurité & Authentification
 *
 * Ce middleware gère :
 * - Protection des routes par authentification
 * - Headers de sécurité (CSP, CORS)
 * - Rate limiting (si Upstash configuré)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  ALLOWED_ORIGINS,
  generateCSP,
  SECURITY_HEADERS,
  PUBLIC_PATHS,
  IGNORED_PATHS,
} from '@/lib/security/config';
import { checkRateLimit, getRateLimitHeaders, type RateLimitType } from '@/lib/security/rate-limit';

const SESSION_COOKIE_NAME = 'session';

/**
 * Vérifie si l'origine est autorisée pour CORS
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests
  return (ALLOWED_ORIGINS as readonly string[]).includes(origin);
}

/**
 * Applique les headers de sécurité à la response
 */
function applySecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const isDev = process.env.NODE_ENV === 'development';
  const origin = request.headers.get('origin');

  // CSP - Content Security Policy
  const csp = generateCSP({ isDev });
  response.headers.set('Content-Security-Policy', csp);

  // Headers de sécurité standards
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CORS - Seulement si origine autorisée
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================================================
  // 1. IGNORER LES FICHIERS STATIQUES
  // ========================================================================
  if (
    (IGNORED_PATHS as readonly string[]).some((path) => pathname.startsWith(path)) ||
    pathname.includes('.') // fichiers avec extension (.js, .css, .png, etc.)
  ) {
    return NextResponse.next();
  }

  // ========================================================================
  // 2. PREFLIGHT CORS (OPTIONS)
  // ========================================================================
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    if (origin && isAllowedOrigin(origin)) {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
      response.headers.set('Access-Control-Max-Age', '86400'); // 24h cache
      return response;
    }
    return new NextResponse(null, { status: 403 });
  }

  // ========================================================================
  // 3. RATE LIMITING (API routes uniquement)
  // ========================================================================
  if (pathname.startsWith('/api/')) {
    // Endpoints auth internes exemptés du rate limiting
    // Ces endpoints sont appelés fréquemment pour la gestion de session
    const authExemptedPaths = ['/api/auth/session', '/api/auth/sync-claims', '/api/auth/me'];
    const isAuthExempted = authExemptedPaths.some((p) => pathname.startsWith(p));

    // Déterminer le type de rate limit selon l'endpoint
    let rateLimitType: RateLimitType = 'api';
    if (pathname.startsWith('/api/generation') || pathname.startsWith('/api/documents')) {
      rateLimitType = 'generation';
    } else if (pathname.startsWith('/api/transcription')) {
      rateLimitType = 'transcription';
    } else if (pathname.startsWith('/api/auth') && !isAuthExempted) {
      // Rate limit auth uniquement pour les endpoints de login (email-link, etc.)
      rateLimitType = 'auth';
    }

    // Identifier par IP (ou userId si disponible)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anonymous';
    const identifier = `${ip}:${rateLimitType}`;

    const rateLimitResult = await checkRateLimit(identifier, rateLimitType);

    if (!rateLimitResult.success) {
      const response = NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { status: 429 }
      );
      // Ajouter headers rate limit
      Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return applySecurityHeaders(response, request);
    }
  }

  // ========================================================================
  // 4. VÉRIFICATION D'AUTHENTIFICATION
  // ========================================================================
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const isPublicPath = (PUBLIC_PATHS as readonly string[]).some(
    (path) => pathname === path || (path !== '/' && pathname.startsWith(path))
  );

  // Rediriger vers login si pas de session sur route protégée
  if (!sessionCookie && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    return applySecurityHeaders(response, request);
  }

  // Rediriger vers home si session existe et tentative d'accès à /login
  if (sessionCookie && pathname === '/login') {
    const response = NextResponse.redirect(new URL('/', request.url));
    return applySecurityHeaders(response, request);
  }

  // ========================================================================
  // 5. APPLIQUER LES HEADERS DE SÉCURITÉ
  // ========================================================================
  const response = NextResponse.next();
  return applySecurityHeaders(response, request);
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
