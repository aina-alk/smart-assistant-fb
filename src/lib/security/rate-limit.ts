/**
 * Rate Limiting avec Redis natif (ioredis)
 *
 * Protège les endpoints contre les abus et attaques DDoS.
 * Utilise un sliding window avec ZSET pour un contrôle précis.
 * Compatible Scalingo HDS avec ioredis natif.
 */

import { getRedisClient, isRedisConfigured } from '@/lib/redis';
import { RATE_LIMIT_CONFIG, type RateLimitType } from './config';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Vérifie si une requête est autorisée selon le rate limit
 *
 * Utilise un sliding window avec Redis ZSET pour un contrôle précis.
 * En cas d'erreur Redis, le comportement dépend de RATE_LIMIT_FAIL_SECURE:
 * - true: bloque les requêtes (sécurité maximale)
 * - false: autorise les requêtes (disponibilité maximale)
 *
 * @param identifier - Identifiant unique (IP, userId, etc.)
 * @param type - Type de rate limit à appliquer
 * @returns Résultat avec success, limit, remaining, reset
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIG[type];
  const { maxRequests, windowMs } = config;
  const windowSeconds = Math.ceil(windowMs / 1000);
  const failSecure = process.env.RATE_LIMIT_FAIL_SECURE === 'true';

  // Si Redis n'est pas configuré
  if (!isRedisConfigured()) {
    if (failSecure) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: Date.now() + windowMs,
      };
    }
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: Date.now() + windowMs,
    };
  }

  const client = getRedisClient();
  if (!client) {
    if (failSecure) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: Date.now() + windowMs,
      };
    }
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: Date.now() + windowMs,
    };
  }

  const key = `ratelimit:${type}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  const requestId = generateRequestId();

  try {
    // Nettoyer les entrées expirées
    await client.zremrangebyscore(key, 0, windowStart);

    // Compter les requêtes dans la fenêtre
    const currentCount = await client.zcard(key);

    if (currentCount >= maxRequests) {
      // Rate limit atteint
      const oldestEntry = await client.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime =
        oldestEntry.length >= 2 ? parseInt(oldestEntry[1], 10) + windowMs : now + windowMs;

      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: resetTime,
      };
    }

    // Ajouter cette requête
    await client.zadd(key, now, requestId);
    await client.expire(key, windowSeconds);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - currentCount - 1,
      reset: now + windowMs,
    };
  } catch (error) {
    console.error('[RateLimit] Redis error:', error);

    // Fail-secure: bloquer en cas d'erreur Redis
    if (failSecure) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: Date.now() + windowMs,
      };
    }

    // Fail-open: autoriser en cas d'erreur Redis
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: Date.now() + windowMs,
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
    'Retry-After':
      result.remaining <= 0 ? Math.ceil((result.reset - Date.now()) / 1000).toString() : '0',
  };
}

/**
 * Vérifie si le rate limiting est configuré
 */
export function isRateLimitConfigured(): boolean {
  return isRedisConfigured();
}

export { type RateLimitType } from './config';
