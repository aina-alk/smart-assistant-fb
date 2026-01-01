# CLAUDE.md — Selav

## Contexte Projet

**Application** : Selav — Assistant IA pour chirurgiens ORL
**Objectif** : Automatiser la documentation médicale (CRC, CRO, ordonnances, codage)
**Cible** : Chirurgiens ORL (puis extensible autres spécialités)
**Phase** : MVP 1.0 — Consultation Core

### Proposition de Valeur

> "Dictez pendant que vous examinez. L'IA rédige pendant que vous passez au patient suivant."

---

## Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js (App Router) | 15.x |
| UI Library | React | 19.x |
| Langage | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui | latest |
| Data Fetching | TanStack Query | 5.x |
| Forms | React Hook Form | 7.x |
| Validation | Zod | 3.x |
| State | Zustand | 5.x |
| Auth | Firebase Auth | 10.x |
| Patients Data | Google Healthcare API (FHIR R4) | v1 |
| Analytics | BigQuery | - |
| Transcription | AssemblyAI | - |
| IA Génération | Claude API | claude-sonnet-4-20250514 |
| Hébergement | Vercel | - |

---

## Architecture Projet

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Routes publiques (login)
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/            # Routes protégées
│   │   ├── layout.tsx          # Sidebar + AuthGuard
│   │   ├── page.tsx            # Dashboard
│   │   ├── patients/           # Gestion patients
│   │   ├── consultation/       # Workflow consultation
│   │   ├── tasks/              # Gestion tâches
│   │   └── settings/           # Paramètres
│   ├── api/                    # Route Handlers
│   │   ├── patients/           # CRUD Patient FHIR
│   │   ├── consultations/      # Encounters FHIR
│   │   ├── transcription/      # WebSocket AssemblyAI
│   │   ├── codage/             # NGAP/CCAM/CIM-10
│   │   └── documents/          # PDF génération
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── auth/                   # Firebase Auth components
│   │   ├── auth-provider.tsx   # Context Firebase
│   │   ├── auth-guard.tsx      # Protection routes
│   │   ├── login-button.tsx    # Google Sign-in
│   │   └── user-menu.tsx       # Menu utilisateur
│   ├── layout/                 # Sidebar, Header, NavLinks
│   ├── patients/               # Composants patients
│   ├── consultation/           # Dictée, CRC, Transcription
│   ├── ordonnance/             # Génération ordonnances
│   └── shared/                 # Composants partagés
├── lib/
│   ├── firebase/               # Configuration Firebase
│   │   ├── client.ts           # SDK Client (browser)
│   │   ├── admin.ts            # Admin SDK (server)
│   │   └── auth.ts             # Helpers auth
│   ├── api/                    # Clients API externes
│   │   ├── fhir-client.ts      # Google Healthcare API
│   │   ├── bigquery-client.ts
│   │   ├── assemblyai-client.ts
│   │   └── claude-client.ts
│   ├── hooks/                  # Custom hooks
│   │   ├── use-auth.ts         # Firebase Auth
│   │   ├── use-patient.ts
│   │   ├── use-transcription.ts
│   │   └── use-codage.ts
│   ├── stores/                 # Zustand stores
│   │   ├── auth-store.ts
│   │   └── consultation-store.ts
│   ├── validations/            # Zod schemas
│   ├── prompts/                # Prompts Claude (CRC, CRO)
│   └── constants/              # Codes NGAP, CCAM, CIM-10
└── types/                      # Types TypeScript
    ├── fhir.ts                 # Types FHIR R4
    ├── auth.ts                 # Types Firebase Auth
    └── consultation.ts         # Types métier
```

---

## Ressources FHIR

### Entités Principales

| Ressource | Usage | Stockage |
|-----------|-------|----------|
| Patient | Données administratives patient | FHIR Store |
| Encounter | Consultation/Intervention | FHIR Store |
| DocumentReference | Lien vers CRC/CRO PDF | FHIR Store |
| Condition | Diagnostics CIM-10 | FHIR Store |
| MedicationRequest | Ordonnances | FHIR Store |
| Task | Tâches praticien | BigQuery |
| Practitioner | Données praticien | BigQuery |

### Structure Patient FHIR

```typescript
interface Patient {
  resourceType: 'Patient';
  id: string;
  identifier: Array<{
    system: 'urn:oid:1.2.250.1.213.1.4.8'; // NIR
    value: string;
  }>;
  name: Array<{
    use: 'official';
    family: string;
    given: string[];
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string; // YYYY-MM-DD
  telecom: Array<{
    system: 'phone' | 'email';
    value: string;
  }>;
}
```

### Opérations FHIR Courantes

```typescript
// CRUD
POST /fhir/R4/Patient
GET /fhir/R4/Patient/{id}
PUT /fhir/R4/Patient/{id}
DELETE /fhir/R4/Patient/{id}

// Search
GET /fhir/R4/Patient?name=Martin
GET /fhir/R4/Patient?birthdate=1985-03-15
GET /fhir/R4/Encounter?subject=Patient/{id}
```

---

## Services Externes

### Firebase Auth

```typescript
// Client (browser)
import { auth, googleProvider, signInWithPopup } from '@/lib/firebase/client';

// Server (API routes)
import { adminAuth, verifyIdToken } from '@/lib/firebase/admin';

// Vérification token dans API route
const decodedToken = await verifyIdToken(token);
const userId = decodedToken.uid;
```

### AssemblyAI (Transcription)

- WebSocket streaming pour transcription temps réel
- Langue : français (fr)
- Latence cible : < 2s
- Précision cible : > 95%

### Claude API (Génération)

- Modèle : claude-sonnet-4-20250514
- Contexte : Prompts ORL spécialisés dans `/lib/prompts/`
- Outputs : CRC structuré, codage CIM-10, suggestions NGAP/CCAM

---

## Variables d'Environnement

```bash
# Firebase Client (exposées au browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (secrets server)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Google Cloud
GOOGLE_CLOUD_PROJECT=
GOOGLE_APPLICATION_CREDENTIALS=
HEALTHCARE_DATASET_ID=
HEALTHCARE_FHIR_STORE_ID=
HEALTHCARE_LOCATION=europe-west1
BIGQUERY_DATASET_ID=

# Services IA
ASSEMBLYAI_API_KEY=
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Standards de Code

### TypeScript

- Mode strict activé, éviter `any`
- Utiliser Zod pour validation données externes
- Types explicites pour fonctions publiques
- Interfaces pour objets, types pour unions/primitives

### Imports

```typescript
// Ordre des imports
1. React/Next.js
2. Bibliothèques externes
3. @/lib/* (utilitaires)
4. @/components/* (composants)
5. @/types/* (types)
6. Imports relatifs (./*)

// Utiliser alias @/
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
```

### Composants

```typescript
// Composants Server par défaut (RSC)
// "use client" uniquement si nécessaire (hooks, événements)

// Nommage
components/patients/patient-card.tsx     // kebab-case fichiers
export function PatientCard() {}         // PascalCase composants

// Props
interface PatientCardProps {
  patient: Patient;
  onSelect?: (id: string) => void;
}
```

### API Routes

```typescript
// Pattern standard
export async function GET(request: NextRequest) {
  // 1. Vérifier auth
  const token = request.headers.get('authorization')?.substring(7);
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const decodedToken = await verifyIdToken(token);

  // 2. Validation input
  const { searchParams } = new URL(request.url);
  const validated = schema.safeParse(Object.fromEntries(searchParams));

  // 3. Logique métier
  const data = await fetchData(validated.data);

  // 4. Retour
  return NextResponse.json(data);
}
```

---

## Règles Métier

### Codage NGAP Consultation

| Condition | Code | Tarif |
|-----------|------|-------|
| Consultation spécialiste | CS | 30,00 € |
| Consultation complexe (> 30 min) | COE | 69,12 € |
| Avis ponctuel consultant | APC | 55,00 € |

### Association CCAM

| Position | Tarif |
|----------|-------|
| Acte principal | 100% |
| 2ème acte | 50% |
| 3ème+ | 50% (sauf exceptions) |

### Validation Patient

| Champ | Règle |
|-------|-------|
| Nom/Prénom | 2-100 caractères, lettres/tirets/espaces |
| DDN | Date passée, > 1900 |
| NIR | 15 chiffres, clé valide |
| Téléphone | Format FR (10 chiffres, 0...) |

---

## Structure CRC

```markdown
## Compte-Rendu de Consultation

### Motif de Consultation
[Raison de la visite]

### Antécédents
[Antécédents pertinents]

### Examen Clinique
[Résultats examen ORL]

### Examens Complémentaires
[Résultats audiométrie, imagerie, etc.]

### Conclusion
[Diagnostic et synthèse]

### Conduite à Tenir
[Traitement, suivi]

### Codage
- CIM-10 : [code] — [libellé]
- NGAP/CCAM : [codes]
```

---

## Commandes Développement

```bash
# Installation
pnpm install

# Développement
pnpm dev

# Build
pnpm build

# Lint + Type check
pnpm lint
pnpm typecheck

# Tests
pnpm test

# Firebase local
firebase emulators:start --only auth
```

---

## Workflows Critiques

### 1. Dictée → CRC

```
Micro → AssemblyAI WebSocket → Transcription temps réel
                ↓
Transcription → Claude API → CRC structuré
                ↓
CRC → Codage auto (CIM-10, NGAP/CCAM)
                ↓
Validation praticien → FHIR Store (Encounter, DocumentReference)
```

### 2. Authentification

```
Client → Firebase SDK → Google OAuth
              ↓
Firebase → ID Token (JWT)
              ↓
API Route → Admin SDK → Verify Token
              ↓
Authorized → Google Healthcare API
```

---

## Performance

| Métrique | Cible |
|----------|-------|
| TTFB | < 200ms |
| LCP | < 2.5s |
| Latence API (p95) | < 500ms |
| Transcription | < 2s |
| Génération CRC | < 30s |

---

## Sécurité

- **Tokens** : ID Token Firebase (httpOnly si SSR)
- **Secrets** : Variables d'environnement, jamais en dur
- **FHIR** : Authentification Service Account avec IAM
- **Données médicales** : Anonymisation en logs, pas de PHI en clair
- **Session** : Refresh automatique Firebase SDK

---

## Conformité

| Exigence | Statut MVP |
|----------|------------|
| RGPD | Base légale : exécution contrat de soin |
| Stockage EU | Google europe-west1 |
| HDS | Phase 2 (migration hébergeur certifié) |
| Audit | Logs actions sur données patient |

---

## Références

- [PRD v2.2](.claude/prd-super-assistant-medical-v2.2.md)
- [Cahier des Charges v1.1](.claude/cahier-des-charges-technique-v1.1.md)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Google Healthcare API](https://cloud.google.com/healthcare-api/docs/concepts/fhir)
- [FHIR R4](https://hl7.org/fhir/R4/)
