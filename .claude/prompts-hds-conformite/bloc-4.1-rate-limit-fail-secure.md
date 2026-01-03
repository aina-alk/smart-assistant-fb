# [BLOC 4.1] — Rate-Limit Fail-Secure

## Contexte

Le rate-limiter actuel a un comportement "fail-open" : si Redis est indisponible, toutes les requêtes sont autorisées. C'est une faille de sécurité car un attaquant pourrait provoquer une panne Redis pour contourner les limites.

Ce bloc implémente le comportement "fail-secure" : si Redis est indisponible, les requêtes sont bloquées par défaut.

## Objectif de ce bloc

Modifier le rate-limiter (migré vers ioredis au bloc 0.3) pour :
1. Bloquer les requêtes en cas d'erreur Redis
2. Ajouter une configuration via variable d'environnement
3. Ajouter des logs appropriés pour le monitoring

## Pré-requis

- [ ] Bloc 0.3 terminé (migration vers ioredis)

## Spécifications

### 1. Fichier à modifier

**Fichier** : `src/lib/security/rate-limit.ts`

### 2. Localisation du code problématique

Le bloc `catch` actuel (lignes ~161-169) retourne `success: true` :

```typescript
// AVANT - VULNÉRABLE
} catch (error) {
  console.error('[RateLimit] Redis error:', error);
  return {
    success: true,  // ❌ FAILLE : autorise toutes les requêtes
    limit: config.maxRequests,
    remaining: config.maxRequests,
    reset: Date.now() + config.windowMs,
  };
}
```

### 3. Correction avec fail-secure

```typescript
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { RATE_LIMIT_CONFIG } from './config';

// ==================== Configuration ====================

/**
 * Mode fail-secure : bloque les requêtes si Redis est indisponible
 * Activé par défaut en production, configurable via env
 */
const FAIL_SECURE_ENABLED = process.env.RATE_LIMIT_FAIL_SECURE !== 'false';

/**
 * Durée du blocage en cas d'erreur Redis (ms)
 */
const FAIL_SECURE_RETRY_AFTER = 60_000; // 1 minute

// ==================== Types ====================

export type RateLimitType = 'api' | 'generation' | 'transcription' | 'codage';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  /** Indique si le résultat vient du mode fail-secure */
  failSecure?: boolean;
  /** Message d'erreur si applicable */
  error?: string;
}

// ==================== Client Redis ====================

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const redisUrl = process.env.SCALINGO_REDIS_URL || process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.warn('[RateLimit] Aucune URL Redis configurée');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop après 3 essais
        return Math.min(times * 100, 1000); // Backoff exponentiel
      },
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on('error', (err) => {
      console.error('[RateLimit] Redis connection error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('[RateLimit] Redis connected');
    });

    return redisClient;
  } catch (error) {
    console.error('[RateLimit] Failed to create Redis client:', error);
    return null;
  }
}

// ==================== Rate Limiter ====================

/**
 * Vérifie et applique le rate limiting pour un identifiant
 * 
 * @param identifier - Identifiant unique (userId, IP, etc.)
 * @param type - Type de rate limit à appliquer
 * @returns Résultat du rate limiting
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIG[type];
  const key = `ratelimit:${type}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const client = getRedisClient();

  // ====== Cas 1 : Redis non configuré ======
  if (!client) {
    if (FAIL_SECURE_ENABLED) {
      console.warn('[RateLimit] Redis non configuré - mode fail-secure activé');
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: now + FAIL_SECURE_RETRY_AFTER,
        failSecure: true,
        error: 'REDIS_NOT_CONFIGURED',
      };
    }
    // En dev, on peut désactiver le fail-secure
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: now + config.windowMs,
    };
  }

  try {
    // Sliding window avec MULTI/EXEC pour atomicité
    const requestId = uuidv4();

    const pipeline = client.multi();
    
    // 1. Supprimer les entrées expirées
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // 2. Compter les requêtes dans la fenêtre
    pipeline.zcard(key);
    
    // 3. Ajouter la nouvelle requête (sera ignorée si limite atteinte)
    pipeline.zadd(key, now.toString(), requestId);
    
    // 4. Définir l'expiration de la clé
    pipeline.pexpire(key, config.windowMs);

    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Pipeline execution returned null');
    }

    // Extraire le count (résultat de ZCARD, index 1)
    const countResult = results[1];
    const count = typeof countResult?.[1] === 'number' ? countResult[1] : 0;

    // Vérifier si la limite est dépassée
    if (count > config.maxRequests) {
      // Supprimer la requête qu'on vient d'ajouter (limite dépassée)
      await client.zrem(key, requestId);

      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: now + config.windowMs,
      };
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      reset: now + config.windowMs,
    };

  } catch (error) {
    // ====== FAIL-SECURE : Bloquer en cas d'erreur ======
    console.error('[RateLimit] Redis error - fail-secure triggered:', error);

    if (FAIL_SECURE_ENABLED) {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: now + FAIL_SECURE_RETRY_AFTER,
        failSecure: true,
        error: 'REDIS_ERROR',
      };
    }

    // Fallback désactivé (dev uniquement)
    console.warn('[RateLimit] Fail-secure désactivé - requête autorisée malgré erreur');
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: now + config.windowMs,
    };
  }
}

// ==================== Helpers ====================

/**
 * Génère les headers HTTP de rate limiting
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (!result.success) {
    headers['Retry-After'] = Math.ceil((result.reset - Date.now()) / 1000).toString();
  }

  if (result.failSecure) {
    headers['X-RateLimit-FailSecure'] = 'true';
  }

  return headers;
}

/**
 * Vérifie si le rate limiting est configuré
 */
export function isRateLimitConfigured(): boolean {
  return !!(process.env.SCALINGO_REDIS_URL || process.env.REDIS_URL);
}

/**
 * Ferme la connexion Redis (pour cleanup)
 */
export async function closeRateLimit(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
```

### 4. Mettre à jour la configuration

**Fichier** : `src/lib/security/config.ts`

Vérifier que `RATE_LIMIT_CONFIG` est bien défini :

```typescript
export const RATE_LIMIT_CONFIG = {
  api: {
    maxRequests: 100,
    windowMs: 60_000, // 1 minute
  },
  generation: {
    maxRequests: 10,
    windowMs: 60_000,
  },
  transcription: {
    maxRequests: 5,
    windowMs: 60_000,
  },
  codage: {
    maxRequests: 20,
    windowMs: 60_000,
  },
};
```

### 5. Mettre à jour les routes pour gérer le fail-secure

Les routes doivent retourner un message approprié en cas de fail-secure :

```typescript
// Dans une route API
const rateLimitResult = await checkRateLimit(authResult.userId, 'api');

if (!rateLimitResult.success) {
  const message = rateLimitResult.failSecure
    ? 'Service temporairement indisponible. Réessayez dans quelques instants.'
    : 'Trop de requêtes. Veuillez patienter.';

  return NextResponse.json(
    { error: message, code: rateLimitResult.error },
    { status: rateLimitResult.failSecure ? 503 : 429, headers: getRateLimitHeaders(rateLimitResult) }
  );
}
```

## Validation

Ce bloc est terminé quand :

- [ ] Le bloc `catch` retourne `success: false` par défaut
- [ ] Le flag `failSecure` est inclus dans le résultat
- [ ] La variable `RATE_LIMIT_FAIL_SECURE` contrôle le comportement
- [ ] Les headers incluent `X-RateLimit-FailSecure` si applicable
- [ ] `pnpm build` réussit
- [ ] Tests manuels validés

## Tests manuels

```bash
# Test 1 : Comportement normal avec Redis
pnpm dev
curl http://localhost:3000/api/health
# Attendu : 200 OK avec headers X-RateLimit-*

# Test 2 : Comportement sans Redis (fail-secure)
# Stopper Redis local et définir RATE_LIMIT_FAIL_SECURE=true
docker stop redis-test
RATE_LIMIT_FAIL_SECURE=true pnpm dev
curl http://localhost:3000/api/protected-route
# Attendu : 503 Service Unavailable avec X-RateLimit-FailSecure: true

# Test 3 : Comportement sans Redis (fail-secure désactivé - dev)
RATE_LIMIT_FAIL_SECURE=false pnpm dev
curl http://localhost:3000/api/protected-route
# Attendu : 200 OK (rate limiting ignoré)
```

## Notes importantes

> ⚠️ **Production** : `RATE_LIMIT_FAIL_SECURE` doit être `true` en production. C'est la configuration par défaut.

> ℹ️ **503 vs 429** : En fail-secure, retourner 503 (Service Unavailable) plutôt que 429 (Too Many Requests) car ce n'est pas un vrai rate-limit.

> ℹ️ **Monitoring** : Surveiller les logs `[RateLimit] Redis error - fail-secure triggered` pour détecter les problèmes Redis.

---
**Prochain bloc** : 4.2 — Documentation CSP
