# CLAUDE.md — Super Assistant Médical

> Configuration pour Claude Code — Mise en conformité HDS

## 🎯 Contexte du Projet

Application médicale pour ORL (oto-rhino-laryngologie) permettant aux médecins de :
- Générer des comptes-rendus de consultation (CRC) via transcription vocale + IA
- Créer des comptes-rendus opératoires (CRO)
- Gérer les ordonnances et bilans
- Stocker les données patients en conformité FHIR

### Objectif Actuel : Conformité HDS

Migration vers un hébergement certifié HDS (Hébergeur de Données de Santé) avec :
- **Anonymisation** des données avant envoi aux services non-HDS (Anthropic, AssemblyAI)
- **Audit nominatif** de tous les accès FHIR
- **Fail-secure** sur le rate-limiting
- **Migration** Vercel → Scalingo HDS

---

## 📁 Structure du Projet

```
smart-assistant-fb/
├── src/
│   ├── app/
│   │   ├── api/                    # Routes API Next.js
│   │   │   ├── ordonnances/        # Génération ordonnances (Anthropic)
│   │   │   ├── bilans/             # Génération bilans (Anthropic)
│   │   │   ├── generation/crc/     # Génération CRC (Anthropic)
│   │   │   ├── codage/suggest/     # Suggestion codes CCAM (Anthropic)
│   │   │   └── transcription/      # Transcription audio (AssemblyAI)
│   │   └── (pages)/                # Pages React
│   ├── components/                 # Composants React
│   ├── lib/
│   │   ├── api/                    # Clients API
│   │   │   ├── fhir-client.ts      # Client GCP Healthcare FHIR
│   │   │   ├── claude-client.ts    # Client Anthropic
│   │   │   └── auth-helpers.ts     # Helpers authentification
│   │   ├── security/               # Sécurité
│   │   │   ├── rate-limit.ts       # Rate limiting Redis
│   │   │   └── config.ts           # Configuration CSP
│   │   ├── anonymization/          # 🆕 Module anonymisation HDS
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── patterns.ts
│   │   │   ├── anonymizer.ts
│   │   │   ├── deanonymizer.ts
│   │   │   └── helpers.ts
│   │   ├── audit/                  # 🆕 Module audit FHIR
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── fhir-audit.ts
│   │   └── redis/                  # 🆕 Client Redis natif
│   │       ├── index.ts
│   │       └── client.ts
│   └── types/                      # Types TypeScript
├── docs/                           # Documentation
├── scripts/                        # Scripts utilitaires
├── Dockerfile                      # 🆕 Build Scalingo
├── scalingo.json                   # 🆕 Config Scalingo
└── Procfile                        # 🆕 Process Scalingo
```

---

## 🛠 Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js | 15.x |
| Runtime | React | 19.x |
| Language | TypeScript | 5.x |
| Auth | Firebase Auth | 13.x |
| Database | GCP Healthcare FHIR | R4 |
| Cache | Redis (ioredis) | — |
| IA Text | Anthropic Claude | claude-sonnet-4-20250514 |
| IA Audio | AssemblyAI | — |
| Hosting | Scalingo (HDS) | — |

---

## 📐 Conventions de Code

### TypeScript

```typescript
// ✅ Imports organisés : externes, puis internes, puis types
import { NextRequest, NextResponse } from 'next/server';
import { anonymize, deanonymize } from '@/lib/anonymization';
import type { PatientContext } from '@/types/generation';

// ✅ Types explicites pour les fonctions publiques
export async function POST(request: NextRequest): Promise<NextResponse> {
  // ...
}

// ✅ Interfaces préfixées avec I pour les contrats
export interface IAnonymizer {
  anonymize(text: string): AnonymizationResult;
}

// ✅ Enums en PascalCase
export enum SensitiveDataType {
  NIR = 'NIR',
  PHONE = 'PHONE',
}
```

### Fichiers et Dossiers

```
# Fichiers
kebab-case.ts           # Fichiers TypeScript
PascalCase.tsx          # Composants React
SCREAMING_SNAKE.md      # Documentation spéciale (CLAUDE.md, README.md)

# Dossiers
kebab-case/             # Dossiers de modules
```

### Gestion des Erreurs

```typescript
// ✅ Erreurs typées avec codes
export class AnonymizationError extends Error {
  constructor(
    message: string,
    public code: AnonymizationErrorCode,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AnonymizationError';
  }
}

// ✅ Try-catch avec logging
try {
  const result = await riskyOperation();
} catch (error) {
  console.error('[Module] Operation failed:', error);
  throw new CustomError('Operation failed', ErrorCode.OPERATION_FAILED);
}
```

### Logging

```typescript
// Format : [Module] Message avec contexte
console.log('[Anonymization] Tokens created:', count);
console.warn('[RateLimit] Redis unavailable, using fail-secure');
console.error('[FHIR] Request failed:', { resourceType, error });
```

---

## 🔐 Patterns de Sécurité HDS

### Pattern 1 : Anonymisation avant appel IA

```typescript
import { anonymize, deanonymize } from '@/lib/anonymization';

// AVANT envoi à Anthropic/AssemblyAI
const { anonymizedText, context } = anonymize(patientData);

// Appel au service non-HDS avec données anonymisées
const aiResponse = await anthropic.messages.create({
  messages: [{ role: 'user', content: anonymizedText }],
});

// APRÈS réception, restaurer les données
const { originalText } = deanonymize(aiResponse.text, context);
```

### Pattern 2 : Audit FHIR nominatif

```typescript
import { createAuditedFHIRClient } from '@/lib/audit';

// Créer un client audité avec le contexte utilisateur
const fhirClient = createAuditedFHIRClient({
  userId: authResult.uid,
  userEmail: authResult.email,
  ipAddress: request.headers.get('x-forwarded-for'),
  userAgent: request.headers.get('user-agent'),
});

// Toutes les opérations sont automatiquement loggées
await fhirClient.create('Patient', patientData);
```

### Pattern 3 : Rate-limit fail-secure

```typescript
import { checkRateLimit } from '@/lib/security/rate-limit';

const rateLimitResult = await checkRateLimit(identifier, 'api');

// En cas d'erreur Redis, success = false (fail-secure)
if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded or service unavailable' },
    { status: 429 }
  );
}
```

### Pattern 4 : Vérification auth enrichie

```typescript
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';

const authResult = await verifyMedecinAccess(request);
if (!authResult.authorized) {
  return NextResponse.json({ error: authResult.error }, { status: 401 });
}

// authResult contient maintenant userId et userEmail pour l'audit
console.log('[API] Request from:', authResult.userEmail);
```

---

## 📋 Blocs de Travail

Les prompts d'implémentation sont dans `/prompts-hds-conformite/` :

| Bloc | Fichier | Description |
|------|---------|-------------|
| 0.1 | `bloc-0.1-nextjs-standalone-dockerfile.md` | Dockerfile Scalingo |
| 0.2 | `bloc-0.2-config-scalingo.md` | scalingo.json, Procfile |
| 0.3 | `bloc-0.3-migration-redis-ioredis.md` | Migration Upstash → ioredis |
| 0.4 | `bloc-0.4-env-variables-scripts.md` | Variables env et scripts |
| 1.1 | `bloc-1.1-types-anonymisation.md` | Types anonymisation |
| 1.2 | `bloc-1.2-patterns-detection.md` | Regex de détection |
| 1.3 | `bloc-1.3-service-anonymizer.md` | Service Anonymizer |
| 1.4 | `bloc-1.4-deanonymizer-export.md` | Deanonymizer + exports |
| 2.1 | `bloc-2.1-route-ordonnances.md` | Route /api/ordonnances |
| 2.2 | `bloc-2.2-route-bilans.md` | Route /api/bilans |
| 2.3 | `bloc-2.3-route-generation-crc.md` | Route /api/generation/crc |
| 2.4 | `bloc-2.4-route-codage-suggest.md` | Route /api/codage/suggest |
| 2.5 | `bloc-2.5-route-transcription.md` | Route /api/transcription |
| 3.1 | `bloc-3.1-types-audit.md` | Types audit FHIR |
| 3.2 | `bloc-3.2-fhir-client-audit.md` | Wrapper FHIR audité |
| 3.3 | `bloc-3.3-auth-helpers-enrichi.md` | Auth helpers enrichis |
| 4.1 | `bloc-4.1-rate-limit-fail-secure.md` | Rate-limit fail-secure |
| 4.2 | `bloc-4.2-documentation-csp.md` | Documentation CSP |
| 5.1 | `bloc-5.1-documentation-pra-pca.md` | PRA/PCA |
| 5.2 | `bloc-5.2-readme-checklist-deploiement.md` | README et checklist |

### Ordre d'exécution recommandé

```
1.1 → 1.2 → 1.3 → 1.4  (Anonymisation - fondation)
  ↓
2.1 → 2.2 → 2.3 → 2.4 → 2.5  (Routes API)
  ↓
0.1 → 0.2 → 0.3 → 0.4  (Infrastructure Scalingo)
  ↓
4.1  (Rate-limit fail-secure)
  ↓
3.1 → 3.2 → 3.3  (Audit FHIR)
  ↓
4.2 → 5.1 → 5.2  (Documentation)
```

---

## 🧪 Commandes Utiles

```bash
# Développement
pnpm dev                    # Lancer en mode dev
pnpm build                  # Build production
pnpm tsc --noEmit           # Vérifier TypeScript

# Tests
pnpm check-env              # Vérifier variables d'environnement
pnpm lint                   # Linter ESLint

# Docker (tests locaux)
pnpm docker:build           # Build image Docker
pnpm docker:run             # Run container local

# Déploiement Scalingo
pnpm deploy                 # Déployer sur Scalingo

# Redis local (pour tests)
docker run -d -p 6379:6379 --name redis-test redis:alpine
export REDIS_URL=redis://localhost:6379
```

---

## 🌍 Variables d'Environnement

### Obligatoires

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# GCP Healthcare FHIR
GOOGLE_CLOUD_PROJECT=
HEALTHCARE_DATASET_ID=
HEALTHCARE_FHIR_STORE_ID=
HEALTHCARE_LOCATION=europe-west1
GOOGLE_APPLICATION_CREDENTIALS_JSON=

# Services IA
ANTHROPIC_API_KEY=
ASSEMBLYAI_API_KEY=

# Email
RESEND_API_KEY=

# Sécurité
RATE_LIMIT_FAIL_SECURE=true
```

### Auto-injectées (Scalingo)

```bash
PORT=                       # Port d'écoute
SCALINGO_REDIS_URL=         # URL Redis (via addon)
```

---

## ⚠️ Points d'Attention

### Données sensibles à anonymiser

| Type | Pattern | Exemple |
|------|---------|---------|
| NIR | 15 chiffres | 1 85 12 75 108 123 45 |
| Téléphone | +33/06... | 06 12 34 56 78 |
| Email | xxx@xxx.xx | patient@email.com |
| Date naissance | JJ/MM/AAAA | 15/03/1985 |
| Nom | Contexte M./Mme | M. DUPONT |
| Adresse | N° + voie | 42 rue de la Paix |

### Ne JAMAIS

- ❌ Logger le contexte d'anonymisation (contient les données originales)
- ❌ Envoyer des données non anonymisées à Anthropic/AssemblyAI
- ❌ Stocker des tokens d'anonymisation (mémoire uniquement)
- ❌ Désactiver le fail-secure en production
- ❌ Créer des opérations FHIR sans audit

### Toujours

- ✅ Anonymiser AVANT tout appel à un service non-HDS
- ✅ Dé-anonymiser APRÈS réception de la réponse IA
- ✅ Inclure userId et userEmail dans les logs d'audit
- ✅ Valider l'authentification sur toutes les routes API
- ✅ Utiliser HTTPS uniquement

---

## 📚 Documentation

- [Plan de Reprise/Continuité](./docs/pra-pca.md)
- [Configuration Scalingo](./docs/scalingo-setup.md)
- [Checklist Déploiement](./docs/deployment-checklist.md)
- [Playbook FHIR](./docs/fhir-playbook.md)

---

## 🔗 Ressources Externes

- [Scalingo Documentation](https://doc.scalingo.com)
- [GCP Healthcare API](https://cloud.google.com/healthcare-api/docs)
- [Référentiel HDS](https://esante.gouv.fr/produits-services/hds)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [Anthropic API](https://docs.anthropic.com)

---

*Dernière mise à jour : Janvier 2025 — Conformité HDS v1.0*
