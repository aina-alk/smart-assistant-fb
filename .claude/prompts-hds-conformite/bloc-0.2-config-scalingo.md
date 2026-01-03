# [BLOC 0.2] — Configuration Scalingo (scalingo.json, Procfile)

## Contexte

Suite à la création du Dockerfile (bloc 0.1), il faut configurer les fichiers spécifiques à Scalingo pour le déploiement. Scalingo est un PaaS français certifié HDS (Hébergeur de Données de Santé).

## Objectif de ce bloc

Créer les fichiers de configuration Scalingo : `scalingo.json` pour la définition de l'application et `Procfile` pour le processus de démarrage. Configurer l'addon Redis nécessaire au rate-limiting.

## Pré-requis

- [ ] Bloc 0.1 terminé (Dockerfile créé)
- [ ] Compte Scalingo créé (sera utilisé au déploiement)

## Spécifications

### 1. Créer `scalingo.json`

**Fichier** : `scalingo.json` (à la racine)

**Structure** :

```json
{
  "$schema": "https://raw.githubusercontent.com/Scalingo/scalingo.json/master/schema.json",
  "name": "selav-medical",
  "description": "Super Assistant Médical - Application certifiée HDS",
  "repository": "https://github.com/aina-alk/smart-assistant-fb",
  "stack": "scalingo-22",
  "addons": ["redis"],
  "env": {
    "NODE_ENV": {
      "value": "production"
    },
    "RATE_LIMIT_FAIL_SECURE": {
      "description": "Active le mode fail-secure pour le rate limiting",
      "value": "true"
    }
  },
  "formation": {
    "web": {
      "amount": 1,
      "size": "S"
    }
  },
  "scripts": {
    "postdeploy": "echo 'Deployment completed successfully'"
  }
}
```

**Explications** :
- `stack: scalingo-22` : Ubuntu 22.04 LTS
- `addons: ["redis"]` : Provisionne automatiquement un Redis managé
- `formation.web.size: "S"` : Container Small (512MB RAM, suffisant pour Next.js)

### 2. Créer `Procfile`

**Fichier** : `Procfile` (à la racine, sans extension)

**Contenu** :

```
web: node server.js
```

**Note** : Le `server.js` est généré par Next.js standalone dans `.next/standalone/`. Le Dockerfile le copie à la racine du container.

### 3. Créer `.slugignore`

**Fichier** : `.slugignore` (à la racine)

Ce fichier indique à Scalingo les fichiers à ignorer lors du build (similaire à `.dockerignore` mais pour le buildpack).

**Contenu** :

```
# Documentation
*.md
!README.md
docs/

# Tests
__tests__/
*.test.ts
*.spec.ts

# Development
.claude/
.cursor/
.husky/

# IDE
.vscode/
.idea/

# Git
.git/
.gitignore

# Fichiers locaux
.env.local
.env.development
```

### 4. Mettre à jour `package.json`

**Fichier** : `package.json`

**Modifications** : Ajouter les scripts pour Scalingo

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "node .next/standalone/server.js",
    "start:scalingo": "node server.js",
    "lint": "next lint",
    "format": "prettier --write ."
  }
}
```

**Note** : `start:scalingo` utilise `server.js` car le Dockerfile copie le standalone à la racine.

## Structure attendue

```
smart-assistant-fb/
├── Dockerfile              # Créé bloc 0.1
├── .dockerignore           # Créé bloc 0.1
├── scalingo.json           # NOUVEAU
├── Procfile                # NOUVEAU
├── .slugignore             # NOUVEAU
├── package.json            # MODIFIÉ
└── next.config.ts          # Modifié bloc 0.1
```

## Contraintes techniques

- Le nom de l'app dans `scalingo.json` doit être unique sur Scalingo
- Le Procfile doit contenir exactement `web:` comme type de process
- L'addon Redis sera auto-provisionné au premier déploiement

## Variables d'environnement Scalingo

Après déploiement, Scalingo injectera automatiquement :

| Variable | Description |
|----------|-------------|
| `PORT` | Port d'écoute (auto) |
| `SCALINGO_REDIS_URL` | URL de connexion Redis (auto via addon) |

Les autres variables (Firebase, Anthropic, etc.) devront être configurées manuellement dans le dashboard Scalingo.

## Validation

Ce bloc est terminé quand :

- [ ] `scalingo.json` existe avec la configuration correcte
- [ ] `Procfile` existe avec `web: node server.js`
- [ ] `.slugignore` existe avec les exclusions appropriées
- [ ] `package.json` contient le script `start:scalingo`
- [ ] Validation JSON : `cat scalingo.json | jq .` (pas d'erreur)

## Notes importantes

> ⚠️ **Addon Redis** : L'addon Redis de Scalingo utilise une URL standard Redis (`redis://...`), pas l'API REST d'Upstash. Le bloc 0.3 gérera la migration du client Redis.

> ℹ️ **Région** : Scalingo héberge en France (Paris/Strasbourg). La certification HDS couvre ces datacenters.

> ℹ️ **Scaling** : Pour commencer, 1 container "S" suffit. Tu pourras scaler horizontalement plus tard via le dashboard ou `scalingo.json`.

---
**Prochain bloc** : 0.3 — Migration Redis Upstash → ioredis
