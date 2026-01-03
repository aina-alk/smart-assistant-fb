# PROGRESS-HDS.md — Tableau de Bord Conformité HDS

> **Objectif** : Migration vers hébergement certifié HDS avec anonymisation, audit nominatif et fail-secure
> **Dernière mise à jour** : 2 janvier 2025 — Session initiale

---

## Vue d'Ensemble

```
┌────────────────────────────────────────────────────────────────────────┐
│                    CONFORMITÉ HDS — 20 BLOCS                           │
├────────────────────────────────────────────────────────────────────────┤
│  Bloc 0 : Infrastructure Scalingo        ███░░░░░░░░░  1/4   (25%)    │
│  Bloc 1 : Module Anonymisation           ░░░░░░░░░░░░  0/4   (0%)     │
│  Bloc 2 : Intégration Routes API         ░░░░░░░░░░░░  0/5   (0%)     │
│  Bloc 3 : Audit FHIR Nominatif           ░░░░░░░░░░░░  0/3   (0%)     │
│  Bloc 4 : Sécurité                       ░░░░░░░░░░░░  0/2   (0%)     │
│  Bloc 5 : Documentation                  ░░░░░░░░░░░░  0/2   (0%)     │
├────────────────────────────────────────────────────────────────────────┤
│  TOTAL                                   █░░░░░░░░░░░  1/20  (5%)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Détail des Blocs

### Bloc 0 : Infrastructure Scalingo (~2h)

| #   | Bloc                           | Description                     | Status     | Fichiers créés                 |
| --- | ------------------------------ | ------------------------------- | ---------- | ------------------------------ |
| 0.1 | `nextjs-standalone-dockerfile` | Dockerfile multi-stage optimisé | ✅ Fait   | `Dockerfile`, `.dockerignore`  |
| 0.2 | `config-scalingo`              | scalingo.json + Procfile        | ⬜ À faire | `scalingo.json`, `Procfile`    |
| 0.3 | `migration-redis-ioredis`      | Upstash → ioredis natif         | ⬜ À faire | `src/lib/redis/`               |
| 0.4 | `env-variables-scripts`        | Variables env + scripts npm     | ⬜ À faire | `.env.example`, `package.json` |

**Dépendances** : Aucune (peut démarrer en parallèle)
**Livrable** : Build Docker fonctionnel, déployable sur Scalingo

---

### Bloc 1 : Module Anonymisation (~2.5h)

| #   | Bloc                  | Description                       | Status     | Fichiers créés                                      |
| --- | --------------------- | --------------------------------- | ---------- | --------------------------------------------------- |
| 1.1 | `types-anonymisation` | Types et interfaces TypeScript    | ⬜ À faire | `src/lib/anonymization/types.ts`                    |
| 1.2 | `patterns-detection`  | Regex NIR, téléphone, email, etc. | ⬜ À faire | `src/lib/anonymization/patterns.ts`                 |
| 1.3 | `service-anonymizer`  | Classe Anonymizer principale      | ⬜ À faire | `src/lib/anonymization/anonymizer.ts`               |
| 1.4 | `deanonymizer-export` | Deanonymizer + index.ts           | ⬜ À faire | `src/lib/anonymization/deanonymizer.ts`, `index.ts` |

**Dépendances** : Aucune (bloc fondation)
**Livrable** : Module `@/lib/anonymization` exportant `anonymize()` et `deanonymize()`

---

### Bloc 2 : Intégration Routes API (~2h)

| #   | Bloc                   | Description                             | Status     | Fichiers créés                        |
| --- | ---------------------- | --------------------------------------- | ---------- | ------------------------------------- |
| 2.1 | `route-ordonnances`    | Anonymisation route ordonnances         | ⬜ À faire | `src/app/api/ordonnances/route.ts`    |
| 2.2 | `route-bilans`         | Anonymisation route bilans              | ⬜ À faire | `src/app/api/bilans/route.ts`         |
| 2.3 | `route-generation-crc` | Anonymisation route CRC + claude-client | ⬜ À faire | `src/app/api/generation/crc/route.ts` |
| 2.4 | `route-codage-suggest` | Anonymisation route codage              | ⬜ À faire | `src/app/api/codage/suggest/route.ts` |
| 2.5 | `route-transcription`  | Anonymisation route transcription       | ⬜ À faire | `src/app/api/transcription/route.ts`  |

**Dépendances** : Bloc 1 (anonymisation) doit être terminé
**Livrable** : Toutes les routes API utilisent anonymize/deanonymize

---

### Bloc 3 : Audit FHIR Nominatif (~1.5h)

| #   | Bloc                   | Description                  | Status     | Fichiers créés                            |
| --- | ---------------------- | ---------------------------- | ---------- | ----------------------------------------- |
| 3.1 | `types-audit`          | Types et service d'audit     | ⬜ À faire | `src/lib/audit/types.ts`, `fhir-audit.ts` |
| 3.2 | `fhir-client-audit`    | Wrapper FHIRClient audité    | ⬜ À faire | `src/lib/api/fhir-client.ts` (modifié)    |
| 3.3 | `auth-helpers-enrichi` | userId + userEmail dans auth | ⬜ À faire | `src/lib/api/auth-helpers.ts` (modifié)   |

**Dépendances** : Aucune technique, mais logiquement après bloc 2
**Livrable** : Toutes opérations FHIR loggent userId/userEmail

---

### Bloc 4 : Sécurité (~1h)

| #   | Bloc                     | Description                     | Status     | Fichiers créés                   |
| --- | ------------------------ | ------------------------------- | ---------- | -------------------------------- |
| 4.1 | `rate-limit-fail-secure` | Rate-limit bloque si Redis down | ⬜ À faire | `src/lib/security/rate-limit.ts` |
| 4.2 | `documentation-csp`      | Documentation CSP existante     | ⬜ À faire | `docs/security-csp.md`           |

**Dépendances** : 4.1 dépend de 0.3 (migration Redis)
**Livrable** : `RATE_LIMIT_FAIL_SECURE=true` respecté

---

### Bloc 5 : Documentation & Finalisation (~1h)

| #   | Bloc                           | Description                      | Status     | Fichiers créés                              |
| --- | ------------------------------ | -------------------------------- | ---------- | ------------------------------------------- |
| 5.1 | `documentation-pra-pca`        | Plan Reprise/Continuité Activité | ⬜ À faire | `docs/pra-pca.md`                           |
| 5.2 | `readme-checklist-deploiement` | README + checklist finale        | ⬜ À faire | `README.md`, `docs/deployment-checklist.md` |

**Dépendances** : Tous les autres blocs
**Livrable** : Documentation complète pour certification HDS

---

## Ordre d'Exécution Optimal

```
┌─────────────────────────────────────────────────────────────────────┐
│   PHASE 1 : FONDATIONS (parallélisable)                             │
│   ┌─────────────┐          ┌─────────────┐                          │
│   │  Bloc 1.x   │          │  Bloc 0.x   │                          │
│   │ Anonymisa.  │          │ Infrastruc. │                          │
│   └──────┬──────┘          └──────┬──────┘                          │
│          │                        │                                 │
│   PHASE 2 : INTÉGRATION           │                                 │
│   ┌──────▼──────┐          ┌──────▼──────┐                          │
│   │  Bloc 2.x   │          │  Bloc 4.1   │                          │
│   │  Routes API │          │ Rate-limit  │                          │
│   └──────┬──────┘          └──────┬──────┘                          │
│          │                        │                                 │
│   PHASE 3 : AUDIT                 │                                 │
│   ┌──────▼────────────────────────▼──────┐                          │
│   │           Bloc 3.x                   │                          │
│   │         Audit FHIR                   │                          │
│   └──────────────────┬───────────────────┘                          │
│                      │                                              │
│   PHASE 4 : DOCUMENTATION                                           │
│   ┌──────────────────▼───────────────────┐                          │
│   │   Bloc 4.2 + 5.1 + 5.2               │                          │
│   │   Docs finales                       │                          │
│   └──────────────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## État Actuel du Projet

### Fichiers existants (à modifier)

```
src/lib/
├── api/
│   ├── fhir-client.ts        ← À wrapper pour audit (bloc 3.2)
│   ├── claude-client.ts      ← À modifier pour anonymisation (bloc 2.3)
│   ├── auth-helpers.ts       ← À enrichir avec userEmail (bloc 3.3)
│   └── assemblyai-client.ts  ← Référence pour bloc 2.5
├── security/                  ← À créer
│   └── rate-limit.ts         ← À créer (bloc 4.1)
├── anonymization/             ← À créer (bloc 1.x)
├── audit/                     ← À créer (bloc 3.x)
└── redis/                     ← À créer (bloc 0.3)
```

### Routes API existantes

```
src/app/api/
-├── ordonnances/route.ts       ← Existe ? À vérifier
    ├── bilans/route.ts            ← Existe ? À vérifier
    ├── generation/crc/route.ts    ← Existe, à modifier
    ├── codage/suggest/route.ts    ← Existe, à modifier
    └── transcription/route.ts     ← Existe ? À vérifier
    ├── health/route.ts            ✅ Health check
├── auth/
│   ├── session/route.ts                   ✅ Session Firebase
│   └── sync-claims/route.ts               ✅ Sync custom claims
├── admin/
│   ├── stats/route.ts                     ✅ Stats admin
│   └── users/[userId]/                    ✅ Approve/reject/status
├── patients/
│   ├── route.ts                           ✅ CRUD patients (FHIR)
│   ├── search/route.ts                    ✅ Search patients
│   └── [id]/route.ts                      ✅ Patient by ID
├── transcription/
│   ├── route.ts                           ✅ EXISTE → Bloc 2.5 (anonymisation)
│   └── [id]/route.ts                      ✅ Status transcription
├── consultations/
│   └── [id]/generate/route.ts             ✅ EXISTE → Bloc 2.3 (anciennement /api/generation/crc)
└── codage/
    ├── suggest/route.ts                   ✅ EXISTE → Bloc 2.4 (anonymisation)
    ├── cim10/route.ts                     ✅ Codes CIM-10
    ├── ccam/route.ts                      ✅ Codes CCAM
    └── ngap/route.ts                      ✅ Codes NGAP

⚠️  Routes MANQUANTES (à créer) :
├── ordonnances/route.ts                   ❌ Bloc 2.1 → création
└── bilans/route.ts                        ❌ Bloc 2.2 → création
```

### Correspondance Plan → Réalité

| Bloc Plan | Route prévue          | Route réelle                       | Action      |
| --------- | --------------------- | ---------------------------------- | ----------- |
| 2.1       | `/api/ordonnances`    | N'existe pas                       | **Créer**   |
| 2.2       | `/api/bilans`         | N'existe pas                       | **Créer**   |
| 2.3       | `/api/generation/crc` | `/api/consultations/[id]/generate` | **Adapter** |
| 2.4       | `/api/codage/suggest` | `/api/codage/suggest`              | ✅ Exact    |
| 2.5       | `/api/transcription`  | `/api/transcription`               | ✅ Exact    |

---

## Journal de Progression

### 2 janvier 2025 — Session 1

- [x] Lecture et analyse du plan INDEX.md
- [x] Création de PROGRESS-HDS.md (ce fichier)

### 3 janvier 2025 — Session 2

- [x] **Bloc 0.1** : Configuration Next.js standalone + Dockerfile
  - Ajout `output: 'standalone'` dans `next.config.ts`
  - Création `Dockerfile` multi-stage (builder + runner)
  - Création `.dockerignore` avec exclusions appropriées
  - **Bonus** : Lazy init Firebase Admin (`src/lib/firebase/admin.ts`)
  - **Bonus** : Lazy init Firebase Client (`src/lib/firebase/config.ts`)
  - Build Docker : ✅ 324MB | TypeScript ✅ | ESLint ✅
- [ ] **Prochain bloc** : 0.2 (Config Scalingo) ou 1.1 (Types anonymisation)

---

## Validation Finale

Une fois tous les blocs terminés :

- [ ] `pnpm build` réussit sans erreur
- [ ] `pnpm tsc --noEmit` sans erreur TypeScript
- [ ] Tests manuels des fonctionnalités critiques
- [ ] Docker build et run fonctionnels
- [ ] Déploiement Scalingo réussi
- [ ] Checklist `docs/deployment-checklist.md` complétée

---

## Notes de Session

> Espace pour notes importantes découvertes pendant l'implémentation

### Observations initiales

1. Le projet utilise déjà Firebase Auth — l'enrichissement auth-helpers devra extraire userEmail du token
2. FHIR client existe (`fhir-client.ts`) — audit = wrapper autour
3. Pas de module Redis actuellement — migration Upstash → ioredis native
4. Pas de Dockerfile — création from scratch

### Risques identifiés

- Taille du contexte d'anonymisation (doit rester en mémoire, jamais persister)
- Patterns regex doivent couvrir formats français (NIR, téléphones 06/07, etc.)
- Rate-limit fail-secure peut bloquer en prod si Redis instable

---

_Fichier de suivi — Conformité HDS Super Assistant Médical_
