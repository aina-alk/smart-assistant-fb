# [BLOC 0.4] — Variables d'Environnement et Scripts

## Contexte

Après la migration vers Scalingo et ioredis, il faut mettre à jour la documentation des variables d'environnement et créer des scripts utilitaires pour faciliter le déploiement et la maintenance.

## Objectif de ce bloc

Mettre à jour `.env.example` pour refléter les nouvelles variables Scalingo, créer des scripts de déploiement, et documenter la configuration requise.

## Pré-requis

- [ ] Bloc 0.3 terminé (migration Redis)

## Spécifications

### 1. Mettre à jour `.env.example`

**Fichier** : `.env.example`

**Nouveau contenu** :

```bash
# ============================================================================
# CONFIGURATION SUPER ASSISTANT MÉDICAL
# ============================================================================

# ----------------------------------------------------------------------------
# Firebase (Client - Public)
# ----------------------------------------------------------------------------
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ----------------------------------------------------------------------------
# Firebase Admin (Server - Secret)
# ----------------------------------------------------------------------------
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# ----------------------------------------------------------------------------
# Google Cloud Healthcare FHIR (Certifié HDS)
# ----------------------------------------------------------------------------
GOOGLE_CLOUD_PROJECT=
HEALTHCARE_DATASET_ID=
HEALTHCARE_FHIR_STORE_ID=
HEALTHCARE_LOCATION=europe-west1

# Google Cloud Credentials (pour Scalingo - une des deux options)
# Option 1: JSON complet du service account (recommandé)
GOOGLE_APPLICATION_CREDENTIALS_JSON=

# Option 2: Credentials séparées
# GOOGLE_CLOUD_CLIENT_EMAIL=
# GOOGLE_CLOUD_PRIVATE_KEY=

# ----------------------------------------------------------------------------
# Services IA
# ----------------------------------------------------------------------------
ASSEMBLYAI_API_KEY=
ANTHROPIC_API_KEY=

# ----------------------------------------------------------------------------
# Email (Resend)
# ----------------------------------------------------------------------------
RESEND_API_KEY=

# ----------------------------------------------------------------------------
# Redis (Rate Limiting)
# ----------------------------------------------------------------------------
# Scalingo (auto-injecté par l'addon)
# SCALINGO_REDIS_URL=redis://...

# Développement local
REDIS_URL=redis://localhost:6379

# Legacy Upstash (rétrocompatibilité dev uniquement)
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=

# ----------------------------------------------------------------------------
# Sécurité
# ----------------------------------------------------------------------------
# Active le mode fail-secure pour le rate limiting
# En production, doit être "true"
RATE_LIMIT_FAIL_SECURE=false

# ----------------------------------------------------------------------------
# Application
# ----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Créer le fichier de configuration Scalingo

**Fichier** : `docs/scalingo-setup.md` (NOUVEAU)

**Contenu** : Guide de configuration des variables dans Scalingo

```markdown
# Configuration Scalingo - Super Assistant Médical

## Variables à configurer dans le dashboard Scalingo

### 1. Firebase (obligatoire)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY` (⚠️ Échapper les \n)

### 2. Google Cloud Healthcare (obligatoire)
- `GOOGLE_CLOUD_PROJECT`
- `HEALTHCARE_DATASET_ID`
- `HEALTHCARE_FHIR_STORE_ID`
- `HEALTHCARE_LOCATION` = `europe-west1`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` (JSON complet du service account)

### 3. Services IA (obligatoire)
- `ANTHROPIC_API_KEY`
- `ASSEMBLYAI_API_KEY`

### 4. Email (obligatoire)
- `RESEND_API_KEY`

### 5. Sécurité (obligatoire)
- `RATE_LIMIT_FAIL_SECURE` = `true`

### Variables auto-injectées par Scalingo
- `PORT` (ne pas configurer)
- `SCALINGO_REDIS_URL` (via addon Redis)

## Commandes CLI Scalingo

# Configurer une variable
scalingo -a selav-medical env-set ANTHROPIC_API_KEY=sk-ant-...

# Voir toutes les variables
scalingo -a selav-medical env

# Configurer plusieurs variables
scalingo -a selav-medical env-set \
  ANTHROPIC_API_KEY=sk-ant-... \
  ASSEMBLYAI_API_KEY=... \
  RESEND_API_KEY=re_...
```

### 3. Créer des scripts utilitaires

**Fichier** : `scripts/deploy-scalingo.sh` (NOUVEAU)

```bash
#!/bin/bash
# Script de déploiement Scalingo

set -e

APP_NAME="selav-medical"

echo "🚀 Déploiement de $APP_NAME sur Scalingo"

# Vérifier que scalingo CLI est installé
if ! command -v scalingo &> /dev/null; then
    echo "❌ Scalingo CLI non installé. Installer avec:"
    echo "   curl -O https://cli-dl.scalingo.com/install && bash install"
    exit 1
fi

# Vérifier la connexion
echo "📋 Vérification de la connexion Scalingo..."
scalingo -a $APP_NAME apps-info || {
    echo "❌ Impossible de se connecter à l'app $APP_NAME"
    echo "   Vérifier: scalingo login"
    exit 1
}

# Déployer
echo "📦 Déploiement en cours..."
git push scalingo main

echo "✅ Déploiement terminé!"
echo "🔗 URL: https://$APP_NAME.osc-fr1.scalingo.io"
```

**Fichier** : `scripts/check-env.sh` (NOUVEAU)

```bash
#!/bin/bash
# Vérifie que toutes les variables d'environnement requises sont définies

REQUIRED_VARS=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "FIREBASE_ADMIN_PROJECT_ID"
    "FIREBASE_ADMIN_CLIENT_EMAIL"
    "FIREBASE_ADMIN_PRIVATE_KEY"
    "GOOGLE_CLOUD_PROJECT"
    "HEALTHCARE_DATASET_ID"
    "HEALTHCARE_FHIR_STORE_ID"
    "HEALTHCARE_LOCATION"
    "ANTHROPIC_API_KEY"
    "ASSEMBLYAI_API_KEY"
    "RESEND_API_KEY"
)

echo "🔍 Vérification des variables d'environnement..."

MISSING=0

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo "❌ $VAR manquante"
        MISSING=$((MISSING + 1))
    else
        echo "✅ $VAR configurée"
    fi
done

# Vérifier Redis (au moins une des options)
if [ -z "$SCALINGO_REDIS_URL" ] && [ -z "$REDIS_URL" ]; then
    echo "⚠️  Aucune URL Redis configurée (SCALINGO_REDIS_URL ou REDIS_URL)"
    echo "   Le rate-limiting sera désactivé"
fi

if [ $MISSING -gt 0 ]; then
    echo ""
    echo "❌ $MISSING variable(s) manquante(s)"
    exit 1
else
    echo ""
    echo "✅ Toutes les variables requises sont configurées"
fi
```

### 4. Mettre à jour `package.json` avec les scripts

**Fichier** : `package.json`

**Ajouter dans `scripts`** :

```json
{
  "scripts": {
    "check-env": "bash scripts/check-env.sh",
    "deploy": "bash scripts/deploy-scalingo.sh",
    "docker:build": "docker build -t selav-medical .",
    "docker:run": "docker run --rm -p 3000:3000 --env-file .env.local -e PORT=3000 selav-medical"
  }
}
```

## Structure attendue

```
smart-assistant-fb/
├── .env.example                    # MODIFIÉ
├── scripts/                        # NOUVEAU DOSSIER
│   ├── deploy-scalingo.sh          # NOUVEAU
│   └── check-env.sh                # NOUVEAU
├── docs/
│   ├── fhir-playbook.md            # Existant
│   └── scalingo-setup.md           # NOUVEAU
└── package.json                    # MODIFIÉ (scripts ajoutés)
```

## Validation

Ce bloc est terminé quand :

- [ ] `.env.example` mis à jour avec toutes les variables documentées
- [ ] `docs/scalingo-setup.md` créé avec le guide de configuration
- [ ] `scripts/deploy-scalingo.sh` créé et exécutable (`chmod +x`)
- [ ] `scripts/check-env.sh` créé et exécutable
- [ ] `package.json` contient les nouveaux scripts
- [ ] Test du script de vérification :
  ```bash
  source .env.local && pnpm check-env
  ```

## Notes importantes

> ⚠️ **FIREBASE_ADMIN_PRIVATE_KEY** : Cette variable contient des retours à la ligne (`\n`). Dans Scalingo, il faut soit :
> - Échapper les `\n` en `\\n`
> - Ou encoder en base64 et décoder dans le code

> ℹ️ **GOOGLE_APPLICATION_CREDENTIALS_JSON** : C'est le contenu JSON complet du fichier service account. Sur Scalingo, coller le JSON minifié sur une seule ligne.

> ℹ️ **Rétrocompatibilité** : Les variables Upstash sont conservées en commentaire pour le développement local si besoin.

---
**Prochain bloc** : 1.1 — Types et interfaces du module d'anonymisation
