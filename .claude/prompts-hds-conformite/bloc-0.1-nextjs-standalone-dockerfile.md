# [BLOC 0.1] — Configuration Next.js Standalone + Dockerfile

## Contexte

Application médicale "Super Assistant Médical" en Next.js 15 actuellement déployée sur Vercel. Migration vers Scalingo (hébergeur certifié HDS) pour conformité réglementaire française sur les données de santé.

Scalingo utilise Docker pour le déploiement. Next.js doit être configuré en mode "standalone" pour générer un serveur Node.js autonome compatible Docker.

## Objectif de ce bloc

Configurer Next.js en mode standalone et créer le Dockerfile optimisé pour Scalingo. L'image doit être minimale, sécurisée (user non-root), et compatible avec l'infrastructure Scalingo.

## Pré-requis

- [ ] Accès au repository smart-assistant-fb
- [ ] Aucune dépendance sur d'autres blocs

## Spécifications

### 1. Modifier `next.config.ts`

Ajouter la configuration `output: 'standalone'` pour générer un serveur autonome.

**Fichier** : `next.config.ts`

**Modification** : Ajouter `output: 'standalone'` dans l'objet de configuration existant.

**Comportement attendu** :
- `pnpm build` génère un dossier `.next/standalone` avec un `server.js`
- Le dossier contient toutes les dépendances nécessaires (node_modules optimisés)
- Les fichiers statiques restent dans `.next/static`

### 2. Créer le Dockerfile

**Fichier** : `Dockerfile` (à la racine du projet)

**Spécifications du Dockerfile** :

| Stage | Base Image | Objectif |
|-------|------------|----------|
| builder | `node:20-alpine` | Installer deps + build Next.js |
| runner | `node:20-alpine` | Image de production minimale |

**Étapes du stage builder** :
1. Activer pnpm via corepack
2. Copier `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`
3. Copier `functions/package.json` (workspace pnpm)
4. Installer les dépendances avec `--frozen-lockfile`
5. Copier tout le code source
6. Exécuter `pnpm build`

**Étapes du stage runner** :
1. Définir `NODE_ENV=production`
2. Créer un groupe `nodejs` (gid 1001) et user `nextjs` (uid 1001)
3. Copier depuis builder :
   - `/app/public` → `./public`
   - `/app/.next/standalone` → `./`
   - `/app/.next/static` → `./.next/static`
4. Changer le propriétaire des fichiers vers `nextjs`
5. Passer en user `nextjs` (non-root)
6. Exposer le port via variable `$PORT` (Scalingo injecte cette variable)
7. CMD : `node server.js`

### 3. Créer le fichier `.dockerignore`

**Fichier** : `.dockerignore` (à la racine)

**Contenu** : Exclure les fichiers inutiles pour réduire le contexte de build :
- `node_modules`
- `.next` (sera rebuilt)
- `.git`
- `*.md` (sauf README)
- `.env*` (les secrets sont injectés par Scalingo)
- Fichiers de développement (`.eslintcache`, etc.)

## Structure attendue

```
smart-assistant-fb/
├── Dockerfile              # NOUVEAU
├── .dockerignore           # NOUVEAU
├── next.config.ts          # MODIFIÉ (ajout output: 'standalone')
└── ... (reste inchangé)
```

## Contraintes techniques

- Image finale < 500MB
- Temps de build < 5 minutes
- User non-root obligatoire (sécurité)
- Compatible avec Scalingo stack `scalingo-22`
- Le port doit utiliser `process.env.PORT` (pas de port hardcodé)

## Validation

Ce bloc est terminé quand :

- [ ] `next.config.ts` contient `output: 'standalone'`
- [ ] `pnpm build` génère `.next/standalone/server.js`
- [ ] `Dockerfile` existe et respecte le multi-stage build
- [ ] `.dockerignore` existe avec les exclusions appropriées
- [ ] Build Docker local réussit : `docker build -t selav-test .`
- [ ] Container démarre : `docker run -p 3000:3000 -e PORT=3000 selav-test`
- [ ] L'app répond sur `http://localhost:3000`

## Commandes de test

```bash
# Test 1 : Build Next.js standalone
pnpm build
ls -la .next/standalone/

# Test 2 : Build Docker
docker build -t selav-medical .

# Test 3 : Run container
docker run --rm -p 3000:3000 -e PORT=3000 selav-medical

# Test 4 : Vérifier que l'app répond
curl http://localhost:3000/api/health
```

## Notes importantes

> ⚠️ **Ne pas committer les secrets** : Les variables d'environnement (API keys, credentials) seront configurées dans Scalingo, pas dans le Dockerfile.

> ⚠️ **pnpm workspace** : Le projet utilise pnpm workspaces avec le dossier `functions/`. Le Dockerfile doit copier `functions/package.json` avant l'install pour que pnpm résolve correctement les dépendances.

> ℹ️ **Port dynamique** : Scalingo injecte la variable `PORT`. Le `server.js` généré par Next.js standalone respecte automatiquement `process.env.PORT`.

---
**Prochain bloc** : 0.2 — Configuration Scalingo (scalingo.json, Procfile)
