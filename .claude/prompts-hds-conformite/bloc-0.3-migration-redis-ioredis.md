# [BLOC 0.3] — Migration Redis Upstash → ioredis

## Contexte

L'application utilise actuellement `@upstash/redis` et `@upstash/ratelimit` pour le rate-limiting. Ces packages utilisent l'API REST d'Upstash.

Scalingo fournit un Redis standard accessible via TCP (pas d'API REST). Il faut migrer vers un client Redis natif (`ioredis`) et implémenter le rate-limiting manuellement.

## Objectif de ce bloc

Remplacer les dépendances Upstash par `ioredis` et réécrire le module de rate-limiting pour fonctionner avec un Redis standard tout en conservant la même interface publique.

## Pré-requis

- [ ] Bloc 0.2 terminé (scalingo.json avec addon redis)
- [ ] Comprendre le fonctionnement actuel de `src/lib/security/rate-limit.ts`

## Spécifications

### 1. Modifier les dépendances

**Fichier** : `package.json`

**Actions** :
- Supprimer : `@upstash/redis`, `@upstash/ratelimit`
- Ajouter : `ioredis` (client Redis standard pour Node.js)

```bash
pnpm remove @upstash/redis @upstash/ratelimit
pnpm add ioredis
pnpm add -D @types/ioredis
```

### 2. Créer le client Redis

**Fichier** : `src/lib/redis/client.ts` (NOUVEAU)

**Spécifications** :

```typescript
/**
 * Client Redis pour Scalingo
 * Utilise SCALINGO_REDIS_URL ou REDIS_URL
 * Fallback sur UPSTASH_REDIS_REST_URL pour rétrocompatibilité dev
 */
```

**Comportement** :
- Priorité 1 : `SCALINGO_REDIS_URL` (production Scalingo)
- Priorité 2 : `REDIS_URL` (alternative standard)
- Priorité 3 : Construction depuis `UPSTASH_REDIS_REST_URL` (dev/fallback)
- Si aucune variable : retourner `null` (Redis désactivé)

**Interface exportée** :
```typescript
export const redisClient: Redis | null;
export function isRedisConfigured(): boolean;
export async function closeRedis(): Promise<void>;
```

**Gestion des erreurs** :
- Log les erreurs de connexion mais ne crash pas l'app
- Permet le fonctionnement dégradé sans Redis

### 3. Réécrire le rate-limiter

**Fichier** : `src/lib/security/rate-limit.ts` (MODIFIER)

**Algorithme** : Sliding Window avec Redis MULTI/EXEC

**Implémentation du sliding window** :

```
Clé Redis : ratelimit:{type}:{identifier}
Structure : Sorted Set avec timestamp comme score

Pour chaque requête :
1. Supprimer les entrées expirées (score < now - windowMs)
2. Compter les entrées restantes
3. Si count < maxRequests : ajouter nouvelle entrée, retourner success
4. Sinon : retourner failure avec reset time
```

**Opérations Redis** (en transaction MULTI) :
1. `ZREMRANGEBYSCORE key 0 (now - windowMs)` — Purge anciennes entrées
2. `ZCARD key` — Compte les requêtes dans la fenêtre
3. `ZADD key now requestId` — Ajoute la requête (si autorisée)
4. `EXPIRE key windowSeconds` — TTL de sécurité

**Interface publique** (CONSERVER l'existante) :

```typescript
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult>;

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string>;
export function isRateLimitConfigured(): boolean;
```

**Configuration** (CONSERVER depuis config.ts) :

```typescript
// Utiliser RATE_LIMIT_CONFIG existant
import { RATE_LIMIT_CONFIG } from './config';
```

### 4. Créer le fichier d'export

**Fichier** : `src/lib/redis/index.ts` (NOUVEAU)

```typescript
export { redisClient, isRedisConfigured, closeRedis } from './client';
```

## Structure attendue

```
src/lib/
├── redis/                      # NOUVEAU DOSSIER
│   ├── index.ts                # Export
│   └── client.ts               # Client ioredis
├── security/
│   ├── config.ts               # INCHANGÉ
│   └── rate-limit.ts           # MODIFIÉ (nouveau rate-limiter)
```

## Contraintes techniques

- L'interface publique de `checkRateLimit()` DOIT rester identique
- Les autres fichiers qui importent depuis `rate-limit.ts` ne doivent pas être modifiés
- Le rate-limiter doit fonctionner même si Redis est temporairement indisponible
- Utiliser des transactions Redis (MULTI/EXEC) pour l'atomicité

## Mapping des variables d'environnement

| Ancienne (Upstash) | Nouvelle (Scalingo) |
|--------------------|---------------------|
| `UPSTASH_REDIS_REST_URL` | `SCALINGO_REDIS_URL` ou `REDIS_URL` |
| `UPSTASH_REDIS_REST_TOKEN` | Non nécessaire (auth dans l'URL) |

## Validation

Ce bloc est terminé quand :

- [ ] `@upstash/redis` et `@upstash/ratelimit` supprimés de `package.json`
- [ ] `ioredis` ajouté aux dépendances
- [ ] `src/lib/redis/client.ts` créé et fonctionnel
- [ ] `src/lib/security/rate-limit.ts` réécrit avec ioredis
- [ ] L'interface `checkRateLimit()` est identique à l'ancienne
- [ ] `pnpm build` réussit sans erreur
- [ ] Test avec Redis local :
  ```bash
  docker run -d -p 6379:6379 redis:alpine
  REDIS_URL=redis://localhost:6379 pnpm dev
  # Tester une route rate-limitée
  ```

## Tests manuels

```bash
# 1. Démarrer Redis local
docker run -d --name redis-test -p 6379:6379 redis:alpine

# 2. Configurer l'environnement
export REDIS_URL=redis://localhost:6379

# 3. Lancer l'app en dev
pnpm dev

# 4. Tester le rate-limit (endpoint de génération limité à 10 req/min)
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/health
done
# Les 10 premiers doivent retourner 200, les suivants 429

# 5. Nettoyer
docker stop redis-test && docker rm redis-test
```

## Notes importantes

> ⚠️ **Fail-secure** : Ce bloc prépare la migration Redis mais le comportement fail-secure sera implémenté dans le bloc 4.1. Pour l'instant, conserver un fail-open temporaire pour ne pas casser l'existant.

> ℹ️ **ioredis reconnection** : ioredis gère automatiquement la reconnexion en cas de perte de connexion. Configurer `retryStrategy` pour un comportement optimal.

> ℹ️ **Sorted Set** : L'algorithme sliding window avec ZSET est le standard industriel pour le rate-limiting Redis. C'est ce qu'utilisait Upstash en interne.

---
**Prochain bloc** : 0.4 — Variables d'environnement et scripts
