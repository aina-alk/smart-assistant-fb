# [BLOC 5.2] — README Migration + Checklist Déploiement

## Contexte

Dernier bloc du projet de mise en conformité HDS. Ce bloc crée la documentation finale : mise à jour du README avec les informations de conformité et création d'une checklist de déploiement complète.

## Objectif de ce bloc

1. Mettre à jour le README.md avec les informations de conformité HDS
2. Créer une checklist de déploiement pas-à-pas pour Scalingo
3. Documenter les changements apportés par cette mise en conformité

## Pré-requis

- [ ] Tous les blocs précédents terminés (0.x à 5.1)

## Spécifications

### 1. Mettre à jour le README.md

**Fichier** : `README.md` (MODIFIER)

Ajouter les sections suivantes au README existant :

```markdown
## 🏥 Conformité HDS

Cette application est conçue pour être conforme aux exigences HDS (Hébergeur de Données de Santé) françaises.

### Architecture de sécurité

```
┌─────────────────────────────────────────────────────────────────┐
│                        ZONE HDS                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Scalingo   │    │   Redis     │    │  GCP Healthcare     │  │
│  │  (App)      │◄──►│  (Cache)    │    │  FHIR (Données)     │  │
│  └──────┬──────┘    └─────────────┘    └──────────▲──────────┘  │
│         │                                         │              │
└─────────┼─────────────────────────────────────────┼──────────────┘
          │                                         │
          │  ┌─────────────────────────────────┐   │
          │  │      Couche Anonymisation       │   │
          │  │  (tokenisation des données)     │   │
          │  └───────────────┬─────────────────┘   │
          │                  │                     │
          ▼                  ▼                     │
┌─────────────────┐  ┌─────────────────┐          │
│   Anthropic     │  │   AssemblyAI    │          │
│   (non-HDS)     │  │   (non-HDS)     │          │
│   Données       │  │   Données       │          │
│   anonymisées   │  │   anonymisées   │          │
└─────────────────┘  └─────────────────┘          │
                                                   │
                    Firebase Auth ─────────────────┘
                    (Authentification)
```

### Mesures de conformité implémentées

| Mesure | Description | Fichiers |
|--------|-------------|----------|
| **Anonymisation** | Tokenisation NIR, téléphone, email, noms avant envoi IA | `src/lib/anonymization/` |
| **Audit nominatif** | Logs de toutes les opérations FHIR avec user_id | `src/lib/audit/` |
| **Fail-secure** | Blocage des requêtes en cas de panne Redis | `src/lib/security/rate-limit.ts` |
| **Hébergement HDS** | Scalingo + GCP europe-west1 | `scalingo.json` |

### Documentation conformité

- [Plan de Reprise/Continuité d'Activité](./docs/pra-pca.md)
- [Configuration Scalingo](./docs/scalingo-setup.md)
- [Playbook FHIR](./docs/fhir-playbook.md)

---

## 🚀 Déploiement

### Prérequis

- Compte Scalingo avec accès HDS
- Projet GCP avec Healthcare API activée
- Projet Firebase configuré
- Clés API : Anthropic, AssemblyAI, Resend

### Déploiement rapide

```bash
# 1. Cloner le repository
git clone https://github.com/[org]/smart-assistant-fb.git
cd smart-assistant-fb

# 2. Vérifier les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# 3. Vérifier la configuration
pnpm check-env

# 4. Déployer sur Scalingo
scalingo create selav-medical
scalingo addons-add redis redis-starter-512
# Configurer les variables (voir docs/scalingo-setup.md)
git push scalingo main
```

Pour un guide détaillé, voir [docs/scalingo-setup.md](./docs/scalingo-setup.md).
```

### 2. Créer la checklist de déploiement

**Fichier** : `docs/deployment-checklist.md` (NOUVEAU)

```markdown
# Checklist de Déploiement — Super Assistant Médical

## Pré-déploiement

### Comptes et accès

- [ ] Compte Scalingo créé et vérifié
- [ ] Projet GCP créé avec Healthcare API activée
- [ ] Dataset FHIR créé dans europe-west1
- [ ] FHIR store créé et configuré
- [ ] Projet Firebase créé
- [ ] Service account GCP avec rôles Healthcare FHIR
- [ ] Compte Anthropic avec clé API
- [ ] Compte AssemblyAI avec clé API
- [ ] Compte Resend avec domaine vérifié

### Code source

- [ ] Repository cloné
- [ ] Branche main à jour
- [ ] `pnpm install` exécuté sans erreur
- [ ] `pnpm build` réussit localement
- [ ] `pnpm tsc --noEmit` sans erreur TypeScript

---

## Déploiement Scalingo

### Étape 1 : Création de l'application

```bash
# Se connecter à Scalingo
scalingo login

# Créer l'application
scalingo create selav-medical --region osc-fr1

# Vérifier la création
scalingo -a selav-medical apps-info
```

- [ ] Application créée sur Scalingo
- [ ] Région osc-fr1 (France) confirmée

### Étape 2 : Addon Redis

```bash
# Ajouter Redis
scalingo -a selav-medical addons-add redis redis-starter-512

# Vérifier l'addon
scalingo -a selav-medical addons
```

- [ ] Addon Redis provisionné
- [ ] Variable SCALINGO_REDIS_URL disponible

### Étape 3 : Variables d'environnement

```bash
# Firebase (client)
scalingo -a selav-medical env-set \
  NEXT_PUBLIC_FIREBASE_API_KEY="..." \
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..." \
  NEXT_PUBLIC_FIREBASE_PROJECT_ID="..." \
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..." \
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..." \
  NEXT_PUBLIC_FIREBASE_APP_ID="..."

# Firebase (admin)
scalingo -a selav-medical env-set \
  FIREBASE_ADMIN_PROJECT_ID="..." \
  FIREBASE_ADMIN_CLIENT_EMAIL="..." \
  FIREBASE_ADMIN_PRIVATE_KEY="..."

# GCP Healthcare
scalingo -a selav-medical env-set \
  GOOGLE_CLOUD_PROJECT="..." \
  HEALTHCARE_DATASET_ID="..." \
  HEALTHCARE_FHIR_STORE_ID="..." \
  HEALTHCARE_LOCATION="europe-west1" \
  GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'

# Services IA
scalingo -a selav-medical env-set \
  ANTHROPIC_API_KEY="sk-ant-..." \
  ASSEMBLYAI_API_KEY="..."

# Email
scalingo -a selav-medical env-set \
  RESEND_API_KEY="re_..."

# Sécurité
scalingo -a selav-medical env-set \
  RATE_LIMIT_FAIL_SECURE="true" \
  NODE_ENV="production"
```

- [ ] Variables Firebase configurées
- [ ] Variables GCP configurées
- [ ] Variables services IA configurées
- [ ] Variable Resend configurée
- [ ] RATE_LIMIT_FAIL_SECURE=true

### Étape 4 : Déploiement

```bash
# Ajouter le remote Scalingo
git remote add scalingo git@ssh.osc-fr1.scalingo.com:selav-medical.git

# Déployer
git push scalingo main
```

- [ ] Remote Git ajouté
- [ ] Push réussi
- [ ] Build Docker réussi (vérifier logs)
- [ ] Application démarrée

### Étape 5 : Vérification

```bash
# Vérifier les logs
scalingo -a selav-medical logs --lines 100

# Tester l'endpoint health
curl https://selav-medical.osc-fr1.scalingo.io/api/health
```

- [ ] Logs sans erreur critique
- [ ] Endpoint /api/health répond 200
- [ ] Page d'accueil accessible
- [ ] Authentification Firebase fonctionne

---

## Tests post-déploiement

### Fonctionnels

- [ ] Connexion utilisateur (Firebase Auth)
- [ ] Création d'un patient (FHIR)
- [ ] Génération d'un CRC (Anthropic + anonymisation)
- [ ] Transcription audio (AssemblyAI + anonymisation)
- [ ] Envoi d'email (Resend)

### Sécurité

- [ ] Rate-limiting actif (tester avec requêtes multiples)
- [ ] Logs d'audit FHIR présents (vérifier Cloud Logging)
- [ ] HTTPS uniquement (pas de HTTP)
- [ ] Headers de sécurité présents (CSP, etc.)

### Performance

- [ ] Temps de réponse API < 2s
- [ ] Temps de génération CRC < 30s
- [ ] Temps de transcription acceptable

---

## Configuration DNS (si domaine personnalisé)

```bash
# Ajouter le domaine
scalingo -a selav-medical domains-add app.example.com

# Configurer le SSL
scalingo -a selav-medical domains-ssl app.example.com
```

- [ ] Domaine personnalisé ajouté
- [ ] Certificat SSL actif
- [ ] Redirection HTTP → HTTPS

---

## Monitoring

### Scalingo

- [ ] Alertes configurées (CPU, mémoire, erreurs)
- [ ] Logs accessibles
- [ ] Métriques visibles

### GCP

- [ ] Cloud Logging configuré
- [ ] Alertes Healthcare API configurées

### Externe (optionnel)

- [ ] UptimeRobot ou équivalent configuré
- [ ] Alertes email/SMS en cas de downtime

---

## Post-déploiement

- [ ] Tester la procédure de restauration (PRA)
- [ ] Documenter les credentials dans un gestionnaire de secrets
- [ ] Communiquer l'URL aux utilisateurs
- [ ] Planifier la première revue de sécurité

---

## Contacts support

| Service | Contact |
|---------|---------|
| Scalingo | support@scalingo.com |
| GCP | Console GCP > Support |
| Firebase | Console Firebase > Support |
| Anthropic | support@anthropic.com |
| AssemblyAI | support@assemblyai.com |

---

**Checklist complétée le** : _______________

**Par** : _______________
```

### 3. Créer le CHANGELOG de conformité

**Fichier** : `docs/CHANGELOG-conformite-hds.md` (NOUVEAU)

```markdown
# Changelog — Mise en conformité HDS

## [1.0.0] - [DATE]

### Ajouté

#### Module d'anonymisation (`src/lib/anonymization/`)
- Détection automatique des données sensibles (NIR, téléphone, email, dates, noms, adresses)
- Tokenisation avant envoi aux services non-HDS (Anthropic, AssemblyAI)
- Dé-anonymisation automatique des réponses IA
- Patterns regex optimisés pour les formats français

#### Audit FHIR nominatif (`src/lib/audit/`)
- Logging de toutes les opérations FHIR avec user_id et email
- Intégration avec GCP Cloud Audit Logs
- Traçabilité complète des accès aux données de santé

#### Infrastructure Scalingo
- Migration Vercel → Scalingo (hébergeur HDS)
- Dockerfile multi-stage optimisé
- Configuration Redis natif (remplacement Upstash)

### Modifié

#### Routes API
- `src/app/api/ordonnances/route.ts` : Intégration anonymisation
- `src/app/api/bilans/route.ts` : Intégration anonymisation
- `src/app/api/generation/crc/route.ts` : Intégration anonymisation
- `src/app/api/codage/suggest/route.ts` : Intégration anonymisation
- `src/app/api/transcription/route.ts` : Métadonnées anonymisées

#### Sécurité
- `src/lib/security/rate-limit.ts` : Mode fail-secure (bloque en cas d'erreur Redis)
- `src/lib/api/auth-helpers.ts` : Enrichissement avec userId et userEmail

#### Client FHIR
- `src/lib/api/fhir-client.ts` : Wrapper d'audit sur toutes les opérations

### Documentation

- `docs/pra-pca.md` : Plan de Reprise/Continuité d'Activité
- `docs/scalingo-setup.md` : Guide de configuration Scalingo
- `docs/deployment-checklist.md` : Checklist de déploiement
- `docs/CHANGELOG-conformite-hds.md` : Ce fichier

### Dépendances

#### Ajoutées
- `ioredis` : Client Redis natif
- `uuid` : Génération de tokens uniques

#### Supprimées
- `@upstash/redis` : Remplacé par ioredis
- `@upstash/ratelimit` : Implémentation custom

### Configuration

#### Nouvelles variables d'environnement
- `SCALINGO_REDIS_URL` : URL Redis Scalingo (auto-injectée)
- `RATE_LIMIT_FAIL_SECURE` : Active le mode fail-secure

#### Variables supprimées
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

---

## Conformité atteinte

| Exigence HDS | Implémentation | Status |
|--------------|----------------|--------|
| Hébergement France/UE | Scalingo osc-fr1 + GCP europe-west1 | ✅ |
| Chiffrement transit | TLS 1.3 | ✅ |
| Chiffrement repos | AES-256 (GCP, Scalingo) | ✅ |
| Traçabilité accès | Audit logs nominatifs | ✅ |
| Anonymisation exports | Module anonymisation | ✅ |
| PRA/PCA | Documentation formelle | ✅ |
| Contrôle d'accès | Firebase Auth + autorisations | ✅ |
```

## Structure attendue

```
smart-assistant-fb/
├── README.md                           # MODIFIÉ
├── docs/
│   ├── fhir-playbook.md                # Existant
│   ├── scalingo-setup.md               # Bloc 0.4
│   ├── pra-pca.md                      # Bloc 5.1
│   ├── deployment-checklist.md         # NOUVEAU
│   └── CHANGELOG-conformite-hds.md     # NOUVEAU
```

## Validation

Ce bloc est terminé quand :

- [ ] README.md mis à jour avec la section conformité HDS
- [ ] `docs/deployment-checklist.md` créé
- [ ] `docs/CHANGELOG-conformite-hds.md` créé
- [ ] Tous les liens internes fonctionnent
- [ ] La documentation est cohérente avec les modifications des blocs précédents

## Notes importantes

> ✅ **Projet terminé** : Ce bloc finalise la mise en conformité HDS. Tous les 20 blocs sont maintenant documentés.

> ⚠️ **Dates et noms** : Remplacer les placeholders [DATE], [NOM], etc. avec les vraies valeurs avant mise en production.

> ℹ️ **Revue** : Faire relire la documentation par un responsable sécurité/conformité avant déploiement.

---

## Récapitulatif du projet

| Bloc | Titre | Fichiers créés/modifiés |
|------|-------|-------------------------|
| 0.1 | Next.js standalone + Dockerfile | `next.config.ts`, `Dockerfile`, `.dockerignore` |
| 0.2 | Config Scalingo | `scalingo.json`, `Procfile`, `.slugignore` |
| 0.3 | Migration Redis | `src/lib/redis/`, `package.json` |
| 0.4 | Env variables | `.env.example`, `scripts/`, `docs/scalingo-setup.md` |
| 1.1 | Types anonymisation | `src/lib/anonymization/types.ts` |
| 1.2 | Patterns détection | `src/lib/anonymization/patterns.ts` |
| 1.3 | Service Anonymizer | `src/lib/anonymization/anonymizer.ts` |
| 1.4 | Deanonymizer + Export | `src/lib/anonymization/deanonymizer.ts`, `index.ts` |
| 2.1 | Route ordonnances | `src/app/api/ordonnances/route.ts` |
| 2.2 | Route bilans | `src/app/api/bilans/route.ts` |
| 2.3 | Route generation/crc | `src/app/api/generation/crc/route.ts`, `claude-client.ts` |
| 2.4 | Route codage/suggest | `src/app/api/codage/suggest/route.ts` |
| 2.5 | Route transcription | `src/app/api/transcription/route.ts` |
| 3.1 | Types audit | `src/lib/audit/types.ts` |
| 3.2 | FHIR client audit | `src/lib/audit/fhir-audit.ts` |
| 3.3 | Auth helpers enrichi | `src/lib/api/auth-helpers.ts` |
| 4.1 | Rate-limit fail-secure | `src/lib/security/rate-limit.ts` |
| 4.2 | Documentation CSP | `src/lib/security/config.ts` (commentaires) |
| 5.1 | PRA/PCA | `docs/pra-pca.md` |
| 5.2 | README + Checklist | `README.md`, `docs/deployment-checklist.md`, `docs/CHANGELOG-conformite-hds.md` |

**Total** : 20 blocs — ~10h de développement estimé
