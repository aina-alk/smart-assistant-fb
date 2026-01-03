# Configuration Scalingo - Super Assistant Médical

## Variables à configurer dans le dashboard Scalingo

### 1. Firebase (obligatoire)

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

> **Note** : Pour `FIREBASE_ADMIN_PRIVATE_KEY`, échapper les `\n` en `\\n`

### 2. Google Cloud Healthcare (obligatoire)

```
GOOGLE_CLOUD_PROJECT
HEALTHCARE_DATASET_ID
HEALTHCARE_FHIR_STORE_ID
HEALTHCARE_LOCATION=europe-west1
GOOGLE_APPLICATION_CREDENTIALS_JSON
```

> **Note** : `GOOGLE_APPLICATION_CREDENTIALS_JSON` contient le JSON complet du service account (minifié sur une ligne)

### 3. Services IA (obligatoire)

```
ANTHROPIC_API_KEY
ASSEMBLYAI_API_KEY
```

### 4. Email (obligatoire)

```
RESEND_API_KEY
ADMIN_EMAIL=support@selav.fr
```

> **Note** : `ADMIN_EMAIL` reçoit les notifications de nouvelles inscriptions

### 5. Application (obligatoire)

```
NEXT_PUBLIC_APP_URL=https://selav-med-assist.osc-fr1.scalingo.io
NODE_ENV=production
```

### 6. Sécurité (obligatoire)

```
RATE_LIMIT_FAIL_SECURE=true
```

### Variables auto-injectées par Scalingo

Ces variables sont automatiquement configurées :

- `PORT` (ne pas configurer manuellement)
- `SCALINGO_REDIS_URL` (via addon Redis)

## Commandes CLI Scalingo

```bash
# Configurer une variable
scalingo -a selav-med-assist env-set ANTHROPIC_API_KEY=sk-ant-...

# Voir toutes les variables
scalingo -a selav-med-assist env

# Configurer plusieurs variables
scalingo -a selav-med-assist env-set \
  ANTHROPIC_API_KEY=sk-ant-... \
  ASSEMBLYAI_API_KEY=... \
  RESEND_API_KEY=re_...

# Voir les logs
scalingo -a selav-med-assist logs -f

# Redémarrer l'application
scalingo -a selav-med-assist restart
```

## Déploiement

```bash
# Via le script
pnpm deploy

# Manuellement
git push scalingo-deploy main
```

## Vérification post-déploiement

1. Vérifier que l'app démarre : `scalingo -a selav-med-assist logs -f`
2. Tester le health check : `curl https://selav-med-assist.osc-fr1.scalingo.io/api/health`
3. Vérifier Redis : L'app doit logger "Redis connected" au démarrage
