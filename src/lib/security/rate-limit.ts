/**
 * Rate Limiting avec Upstash Redis
 *
 * Protège les endpoints contre les abus et attaques DDoS.
 * Utilise un sliding window pour un contrôle précis.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RATE_LIMIT_CONFIG } from './config';

// ============================================================================
// CONFIGURATION REDIS
// ============================================================================

/**
 * Client Redis Upstash
 * Initialisé uniquement si les credentials sont disponibles
 */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// ============================================================================
// RATE LIMITERS
// ============================================================================

/**
 * Rate limiter pour les API générales
 * 100 requêtes par minute
 */
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMIT_CONFIG.api.maxRequests,
        `${RATE_LIMIT_CONFIG.api.windowMs}ms`
      ),
      prefix: 'ratelimit:api',
      analytics: true,
    })
  : null;

/**
 * Rate limiter pour la génération IA (coûteux)
 * 10 requêtes par minute
 */
export const generationRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMIT_CONFIG.generation.maxRequests,
        `${RATE_LIMIT_CONFIG.generation.windowMs}ms`
      ),
      prefix: 'ratelimit:generation',
      analytics: true,
    })
  : null;

/**
 * Rate limiter pour la transcription
 * 5 requêtes par minute
 */
export const transcriptionRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMIT_CONFIG.transcription.maxRequests,
        `${RATE_LIMIT_CONFIG.transcription.windowMs}ms`
      ),
      prefix: 'ratelimit:transcription',
      analytics: true,
    })
  : null;

/**
 * Rate limiter pour l'authentification
 * 10 tentatives par 15 minutes
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMIT_CONFIG.auth.maxRequests,
        `${RATE_LIMIT_CONFIG.auth.windowMs}ms`
      ),
      prefix: 'ratelimit:auth',
      analytics: true,
    })
  : null;

// ============================================================================
// HELPERS
// ============================================================================

export type RateLimitType = 'api' | 'generation' | 'transcription' | 'auth';

/**
 * Sélectionne le rate limiter approprié selon le type
 */
function getRateLimiter(type: RateLimitType): Ratelimit | null {
  switch (type) {
    case 'generation':
      return generationRateLimiter;
    case 'transcription':
      return transcriptionRateLimiter;
    case 'auth':
      return authRateLimiter;
    default:
      return apiRateLimiter;
  }
}

/**
 * Résultat du check de rate limiting
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Vérifie si une requête est autorisée selon le rate limit
 *
 * @param identifier - Identifiant unique (IP, userId, etc.)
 * @param type - Type de rate limit à appliquer
 * @returns Résultat avec success, limit, remaining, reset
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(type);

  // Si pas de Redis configuré, autoriser toutes les requêtes
  if (!limiter) {
    const config = RATE_LIMIT_CONFIG[type];
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowMs,
    };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // En cas d'erreur Redis, log et autoriser (fail-open)
    console.error('[RateLimit] Redis error:', error);
    const config = RATE_LIMIT_CONFIG[type];
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowMs,
    };
  }
}

/**
 * Génère les headers HTTP de rate limiting
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

/**
 * Vérifie si Upstash est configuré
 */
export function isRateLimitConfigured(): boolean {
  return redis !== null;
}
