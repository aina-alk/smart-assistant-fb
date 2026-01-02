/**
 * Configuration de sécurité centralisée
 *
 * Ce fichier définit toutes les politiques de sécurité de l'application.
 * Modifier ici pour ajuster CSP, CORS, rate limiting, etc.
 */

// ============================================================================
// ALLOWED ORIGINS (CORS)
// ============================================================================

export const ALLOWED_ORIGINS = [
  'https://selav.fr',
  'https://www.selav.fr',
  // Development
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
] as const;

// ============================================================================
// CONTENT SECURITY POLICY
// ============================================================================

/**
 * CSP Directives pour protéger contre XSS, injection, etc.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],

  'script-src': [
    "'self'",
    "'unsafe-inline'", // Requis pour Next.js RSC
    "'unsafe-eval'", // Requis pour Next.js dev (retiré en prod via headers)
    'https://*.firebaseapp.com',
    'https://*.googleapis.com',
    'https://apis.google.com', // Google Identity Services
    'https://*.gstatic.com', // Google static resources
  ],

  'style-src': ["'self'", "'unsafe-inline'"], // Tailwind inline styles

  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.googleapis.com',
    'https://*.googleusercontent.com',
    'https://storage.googleapis.com',
    'https://firebasestorage.googleapis.com',
  ],

  'font-src': ["'self'", 'data:'],

  'connect-src': [
    "'self'",
    // Firebase
    'https://*.firebaseio.com',
    'https://*.googleapis.com',
    'wss://*.firebaseio.com',
    'https://firebaseinstallations.googleapis.com',
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    // Services IA
    'https://api.assemblyai.com',
    'https://api.anthropic.com',
    // Healthcare API
    'https://healthcare.googleapis.com',
  ],

  'frame-src': [
    "'self'",
    'https://*.firebaseapp.com', // Firebase Auth popup
    'https://accounts.google.com', // Google OAuth popup
    'https://*.google.com', // Google Sign-In iframe
  ],

  'frame-ancestors': ["'none'"], // Clickjacking protection

  'base-uri': ["'self'"],

  'form-action': ["'self'"],

  'object-src': ["'none'"],

  'worker-src': ["'self'", 'blob:'],

  'manifest-src': ["'self'"],

  // Upgrade HTTP to HTTPS
  'upgrade-insecure-requests': [],
} as const;

/**
 * Génère la chaîne CSP à partir des directives
 */
export function generateCSP(options?: { isDev?: boolean }): string {
  // Construire la CSP en filtrant unsafe-eval en production
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => {
      let filteredValues = [...values];

      // En production, retirer unsafe-eval de script-src
      if (!options?.isDev && key === 'script-src') {
        filteredValues = filteredValues.filter((src) => src !== "'unsafe-eval'");
      }

      if (filteredValues.length === 0) return key;
      return `${key} ${filteredValues.join(' ')}`;
    })
    .join('; ');
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

export const SECURITY_HEADERS = {
  // HSTS - Force HTTPS pendant 2 ans
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // Empêche le sniffing MIME
  'X-Content-Type-Options': 'nosniff',

  // Protection clickjacking (renforcé par CSP frame-ancestors)
  'X-Frame-Options': 'DENY',

  // Contrôle les infos envoyées dans Referer
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions API
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',

  // DNS prefetch pour perfs
  'X-DNS-Prefetch-Control': 'on',
} as const;

// ============================================================================
// RATE LIMITING CONFIG
// ============================================================================

export const RATE_LIMIT_CONFIG = {
  // Limites par endpoint
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 req/min pour API générales
  },
  generation: {
    windowMs: 60 * 1000,
    maxRequests: 10, // 10 req/min pour génération IA (coûteux)
  },
  transcription: {
    windowMs: 60 * 1000,
    maxRequests: 5, // 5 req/min pour transcription
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 tentatives auth/15min
  },
} as const;

// ============================================================================
// PUBLIC PATHS (no auth required)
// ============================================================================

export const PUBLIC_PATHS = ['/', '/login', '/api/auth', '/auth/email-link/callback'] as const;

// ============================================================================
// IGNORED PATHS (skip middleware entirely)
// ============================================================================

export const IGNORED_PATHS = ['/_next', '/favicon.ico', '/api/health'] as const;
