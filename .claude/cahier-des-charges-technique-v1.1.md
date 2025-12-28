# Cahier des Charges Technique

## Super Assistant Médical Chirurgien

| Métadonnée | Valeur |
|------------|--------|
| **Version** | 1.1 |
| **Date** | 28 décembre 2024 |
| **Phase** | 3 — Spécifications Techniques |
| **PRD associé** | v2.2 |
| **Scope** | MVP 1.0 → MVP 3.0 |
| **Changelog** | v1.1 : Migration Auth.js → Firebase Authentication |

---

## Table des Matières

1. [Spécifications Fonctionnelles](#1-spécifications-fonctionnelles)
2. [Architecture Technique](#2-architecture-technique)
3. [Modèle de Données](#3-modèle-de-données)
4. [Design API](#4-design-api)
5. [Spécifications UI/UX](#5-spécifications-uiux)
6. [Sécurité & Conformité](#6-sécurité--conformité)
7. [Services Tiers](#7-services-tiers)
8. [Performance & Scalabilité](#8-performance--scalabilité)

---

## 1. Spécifications Fonctionnelles

### 1.1 Matrice des Fonctionnalités MVP 1.0

| ID | Fonctionnalité | Module | Priorité | Description | Critères d'acceptation |
|----|----------------|--------|----------|-------------|------------------------|
| F01 | Création patient | Patient | P0 | Créer une fiche patient avec données administratives | Patient créé, ID unique généré, données validées |
| F02 | Recherche patient | Patient | P0 | Rechercher par nom, prénom, DDN, téléphone | Résultats < 200ms, pertinence ranking |
| F03 | Historique patient | Patient | P0 | Timeline des consultations et interventions | Ordre chronologique, filtres par type |
| F04 | Gestion tâches | Patient | P0 | CRUD tâches avec assignation | Tâche créée, assignée, statut modifiable |
| F05 | Enregistrement audio | Consultation | P0 | Capturer dictée microphone | Audio capturé, qualité > 16kHz, streaming |
| F06 | Transcription live | Consultation | P0 | Convertir audio en texte temps réel | Latence < 2s, précision > 95% |
| F07 | Génération CRC | Consultation | P0 | Structurer transcription en CRC médical | CRC conforme HAS, sections complètes |
| F08 | Codage CIM-10 | Consultation | P0 | Suggérer diagnostics codés | 3-5 suggestions pertinentes |
| F09 | Codage NGAP/CCAM | Consultation | P0 | Suggérer actes à facturer | Codes valides, tarifs corrects |
| F10 | Génération ordonnance | Consultation | P0 | Créer ordonnance depuis CRC | Format conforme, médicaments validés |
| F11 | Génération bilan | Consultation | P0 | Créer prescription examens | Format conforme, examens codés |
| F12 | Export PDF | Consultation | P0 | Générer documents PDF signables | PDF/A, impression, téléchargement |
| F13 | Authentification | Global | P0 | Login sécurisé praticien | Firebase Auth (Google OAuth), session persistante |
| F14 | Dashboard | Global | P0 | Vue d'ensemble journée | Patients du jour, tâches, alertes |

### 1.2 User Stories Détaillées

#### US-01 : Création Patient

```
En tant que praticien,
Je veux créer une fiche patient rapidement,
Afin de commencer la consultation sans délai.

Critères d'acceptation :
- [ ] Formulaire avec champs obligatoires (nom, prénom, DDN, sexe)
- [ ] Champs optionnels (téléphone, email, NIR, mutuelle)
- [ ] Validation format NIR (15 chiffres)
- [ ] Validation format téléphone (FR)
- [ ] Détection doublons potentiels avant création
- [ ] ID patient unique auto-généré
- [ ] Redirection vers fiche patient après création
```

#### US-02 : Dictée et Génération CRC

```
En tant que praticien,
Je veux dicter mon compte-rendu pendant l'examen,
Afin de ne pas retaper l'information après le patient.

Critères d'acceptation :
- [ ] Bouton "Démarrer dictée" visible et accessible
- [ ] Indicateur visuel d'enregistrement en cours
- [ ] Transcription affichée en temps réel (< 2s latence)
- [ ] Bouton "Arrêter" pour terminer l'enregistrement
- [ ] Bouton "Générer CRC" après transcription
- [ ] CRC structuré avec toutes les sections ORL
- [ ] Diagnostics CIM-10 suggérés automatiquement
- [ ] Codage NGAP/CCAM suggéré automatiquement
- [ ] Possibilité d'éditer chaque section
- [ ] Sauvegarde automatique toutes les 30s
```

#### US-03 : Génération Ordonnance

```
En tant que praticien,
Je veux générer une ordonnance depuis le CRC,
Afin d'éviter de ressaisir les prescriptions.

Critères d'acceptation :
- [ ] Extraction automatique des médicaments du CRC
- [ ] Interface d'édition des lignes d'ordonnance
- [ ] Autocomplétion médicaments (base BDPM)
- [ ] Champs : médicament, posologie, durée, quantité
- [ ] Validation interactions médicamenteuses (warning)
- [ ] Aperçu avant impression
- [ ] Export PDF format ordonnance sécurisée
- [ ] Historique ordonnances patient accessible
```

#### US-04 : Gestion des Tâches

```
En tant que praticien,
Je veux créer des tâches liées à mes patients,
Afin de ne rien oublier dans le suivi.

Critères d'acceptation :
- [ ] Types de tâches : rappel, résultat, RDV, courrier, facturation
- [ ] Assignation à soi-même ou autre utilisateur
- [ ] Priorité : urgent, normal, basse
- [ ] Date d'échéance avec rappel
- [ ] Lien vers patient et/ou consultation
- [ ] Statuts : à faire, en cours, terminé, annulé
- [ ] Vue liste filtrée par statut/priorité/échéance
- [ ] Notification si tâche urgente non traitée
```

### 1.3 Règles Métier

#### RM-01 : Codage NGAP Consultation

| Condition | Code applicable | Tarif base |
|-----------|-----------------|------------|
| Consultation spécialiste standard | CS | 30,00 € |
| Consultation très complexe (> 30 min, pathologie lourde) | COE | 69,12 € |
| Avis ponctuel de consultant (adressé par confrère) | APC | 55,00 € |
| Consultation + acte technique | CS + CCAM | Cumul |

#### RM-02 : Association Actes CCAM

| Règle | Application |
|-------|-------------|
| Acte principal | 100% du tarif |
| 2ème acte | 50% du tarif |
| 3ème acte et suivants | 50% du tarif (sauf exceptions) |
| Modificateur bilatéral (F) | Majoration selon acte |
| Modificateur urgence (7) | +25% à +50% |

#### RM-03 : Validation Patient

| Champ | Règle | Message erreur |
|-------|-------|----------------|
| Nom | 2-100 caractères, lettres/tirets/espaces | "Nom invalide" |
| Prénom | 2-100 caractères, lettres/tirets/espaces | "Prénom invalide" |
| DDN | Date passée, > 1900, < aujourd'hui | "Date de naissance invalide" |
| NIR | 15 chiffres, clé valide | "Numéro de sécurité sociale invalide" |
| Téléphone | Format FR (10 chiffres, commence par 0) | "Téléphone invalide" |
| Email | Format email valide | "Email invalide" |

#### RM-04 : Génération Documents

| Document | Données obligatoires | Validation |
|----------|---------------------|------------|
| CRC | Patient, date, praticien, motif, examen, conclusion | Toutes sections non vides |
| Ordonnance | Patient, date, praticien, ≥1 médicament | Au moins 1 ligne valide |
| Bilan | Patient, date, praticien, ≥1 examen | Au moins 1 examen |

### 1.4 Cas Limites

| Cas | Comportement attendu | Priorité |
|-----|---------------------|----------|
| Perte connexion pendant dictée | Sauvegarde locale, sync au retour | P0 |
| Transcription échoue | Retry 3x, puis message erreur + audio conservé | P0 |
| Patient doublon détecté | Afficher existant, proposer fusion ou création | P1 |
| Médicament inconnu | Permettre saisie libre avec warning | P1 |
| Session expirée pendant édition | Sauvegarde auto, reconnexion silencieuse | P0 |
| Codage CCAM invalide | Bloquer avec explication, suggérer alternative | P1 |
| PDF génération échoue | Retry, puis proposer HTML en fallback | P2 |

---

## 2. Architecture Technique

### 2.1 Stack Technologique

| Couche | Technologie | Version | Justification |
|--------|-------------|---------|---------------|
| **Framework** | Next.js | 15.x | App Router, RSC, Server Actions, Edge |
| **Runtime** | React | 19.x | Concurrent features, Suspense |
| **Langage** | TypeScript | 5.x | Type safety, DX |
| **Styling** | Tailwind CSS | 4.x | Utility-first, performance |
| **UI Components** | shadcn/ui | latest | Accessible, customizable |
| **Data Fetching** | TanStack Query | 5.x | Cache, mutations, optimistic |
| **Forms** | React Hook Form | 7.x | Performance, validation |
| **Validation** | Zod | 3.x | Schema validation, inférence TS |
| **State** | Zustand | 5.x | Simple, performant |
| **Auth** | Firebase Auth | 10.x | Google OAuth, Admin SDK, cohérence GCP |
| **Patients Data** | Google Healthcare API | v1 | FHIR R4, compliance |
| **Analytics** | BigQuery | - | SQL, embeddings, RAG |
| **Transcription** | AssemblyAI | - | Temps réel, français |
| **IA Génération** | Claude API | claude-sonnet-4-20250514 | Qualité, contexte long |
| **Hébergement** | Vercel | - | Edge, serverless |
| **Cloud** | Google Cloud | - | Healthcare, BigQuery |

### 2.2 Schéma d'Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ARCHITECTURE v1.1                                   │
└─────────────────────────────────────────────────────────────────────────────┘

                                    UTILISATEUR
                                         │
                                         │ HTTPS
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              VERCEL EDGE                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         NEXT.JS 15 APP                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │    Pages     │  │  Components  │  │    Hooks     │              │   │
│  │  │   (RSC)      │  │  (Client)    │  │              │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                              │                                       │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │                    API ROUTES / SERVER ACTIONS                │  │   │
│  │  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │  │   │
│  │  │  │/patient│  │/consult│  │/transcr│  │/genera │            │  │   │
│  │  │  └────────┘  └────────┘  └────────┘  └────────┘            │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
         │                          │                          │
         │         ┌────────────────┴────────────────┐         │
         │         │                                 │         │
         ▼         ▼                                 ▼         ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   FIREBASE AUTH     │    │    ASSEMBLYAI       │    │    ANTHROPIC        │
│                     │    │                     │    │                     │
│  ┌───────────────┐  │    │  ┌───────────────┐  │    │  ┌───────────────┐  │
│  │ Google OAuth  │  │    │  │ Real-time     │  │    │  │ Claude API    │  │
│  │ 2.0           │  │    │  │ Transcription │  │    │  │ (Sonnet)      │  │
│  │               │  │    │  │               │  │    │  │               │  │
│  │ • Sign-in     │  │    │  │ WebSocket     │  │    │  │ • CRC Gen     │  │
│  │ • ID Token    │  │    │  │ Audio Stream  │  │    │  │ • Codage      │  │
│  │ • Admin SDK   │  │    │  └───────────────┘  │    │  │ • Ordo        │  │
│  └───────────────┘  │    │                     │    │  └───────────────┘  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
         │
         │ Token verification
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GOOGLE CLOUD                                       │
│                                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │ Healthcare    │  │ BigQuery      │  │ Cloud Storage │                   │
│  │ API (FHIR)    │  │               │  │               │                   │
│  │               │  │ • Analytics   │  │ • Audio files │                   │
│  │ • Patient     │  │ • Embeddings  │  │ • PDFs        │                   │
│  │ • Encounter   │  │ • Logs        │  │               │                   │
│  │ • Document    │  │               │  │               │                   │
│  │ • Task        │  │               │  │               │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Flux d'Authentification Firebase

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FLUX AUTHENTIFICATION FIREBASE                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐                ┌──────────────┐                ┌──────────────┐
│          │   1. Click     │              │   2. OAuth     │              │
│  CLIENT  │──────────────►│ FIREBASE     │──────────────►│   GOOGLE     │
│  (React) │   Sign-in     │ AUTH SDK     │   Redirect     │   OAuth 2.0  │
│          │◄──────────────│              │◄──────────────│              │
└──────────┘   4. ID Token │              │   3. Auth Code │              │
      │                     └──────────────┘                └──────────────┘
      │
      │ 5. ID Token (header)
      ▼
┌──────────────┐                ┌──────────────┐
│              │   6. Verify   │              │
│  NEXT.JS     │──────────────►│ FIREBASE     │
│  API ROUTE   │   ID Token    │ ADMIN SDK    │
│              │◄──────────────│              │
└──────────────┘   7. User     └──────────────┘
      │               Info
      │
      │ 8. Authorized request
      ▼
┌──────────────┐
│              │
│  GOOGLE      │
│  HEALTHCARE  │
│  API         │
│              │
└──────────────┘
```

### 2.4 Structure du Projet

```
super-assistant-medical/
├── .cursor/
│   └── mcp.json                    # Configuration MCP servers
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Routes publiques auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/            # Routes protégées
│   │   │   ├── layout.tsx          # Layout avec sidebar + auth guard
│   │   │   ├── page.tsx            # Dashboard home
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx        # Liste patients
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # Création patient
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Fiche patient
│   │   │   │       ├── consultations/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── tasks/
│   │   │   │           └── page.tsx
│   │   │   ├── consultation/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # Nouvelle consultation
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Détail consultation
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx        # Liste tâches
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/                    # Route Handlers
│   │   │   ├── patients/
│   │   │   │   ├── route.ts        # GET list, POST create
│   │   │   │   ├── search/
│   │   │   │   │   └── route.ts    # GET search
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts    # GET, PUT, DELETE
│   │   │   ├── consultations/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── generate/
│   │   │   │       │   └── route.ts    # POST generate CRC
│   │   │   │       └── documents/
│   │   │   │           └── route.ts    # GET/POST documents
│   │   │   ├── transcription/
│   │   │   │   └── route.ts        # WebSocket proxy
│   │   │   ├── codage/
│   │   │   │   ├── ngap/
│   │   │   │   │   └── route.ts
│   │   │   │   └── ccam/
│   │   │   │       └── route.ts
│   │   │   └── tasks/
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   ├── globals.css
│   │   └── layout.tsx              # Root layout
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   └── ...
│   │   ├── auth/                   # Composants Firebase Auth
│   │   │   ├── auth-provider.tsx   # FirebaseProvider + contexte
│   │   │   ├── auth-guard.tsx      # Protection routes
│   │   │   ├── login-button.tsx    # Bouton Google Sign-in
│   │   │   └── user-menu.tsx       # Menu utilisateur connecté
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── nav-links.tsx
│   │   ├── patients/
│   │   │   └── ...
│   │   ├── consultation/
│   │   │   └── ...
│   │   ├── ordonnance/
│   │   │   └── ...
│   │   ├── tasks/
│   │   │   └── ...
│   │   └── shared/
│   │       └── ...
│   ├── lib/
│   │   ├── firebase/               # Configuration Firebase
│   │   │   ├── client.ts           # Firebase client SDK (browser)
│   │   │   ├── admin.ts            # Firebase Admin SDK (server)
│   │   │   └── auth.ts             # Helpers auth
│   │   ├── api/                    # API clients
│   │   │   ├── fhir-client.ts      # Google Healthcare API
│   │   │   ├── bigquery-client.ts
│   │   │   ├── assemblyai-client.ts
│   │   │   ├── claude-client.ts
│   │   │   └── pdf-generator.ts
│   │   ├── hooks/
│   │   │   ├── use-auth.ts         # Hook Firebase Auth
│   │   │   ├── use-patient.ts
│   │   │   ├── use-patients.ts
│   │   │   ├── use-consultation.ts
│   │   │   ├── use-transcription.ts
│   │   │   ├── use-tasks.ts
│   │   │   └── use-codage.ts
│   │   ├── stores/                 # Zustand stores
│   │   │   ├── auth-store.ts       # État auth Firebase
│   │   │   ├── consultation-store.ts
│   │   │   └── ui-store.ts
│   │   ├── validations/            # Zod schemas
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── auth-utils.ts       # Utilitaires token Firebase
│   │   │   └── ...
│   │   ├── prompts/                # Prompts Claude
│   │   │   └── ...
│   │   └── constants/
│   │       └── ...
│   └── types/
│       ├── auth.ts                 # Types Firebase Auth
│       └── ...
├── public/
│   └── ...
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 2.5 Flux de Données

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUX DICTÉE → CRC                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    Audio     ┌──────────────┐   Texte    ┌──────────────┐
│          │   Stream     │              │  Stream    │              │
│ MICRO    │─────────────►│ ASSEMBLYAI   │───────────►│   STATE      │
│ (Client) │  WebSocket   │  Real-time   │            │  (Zustand)   │
│          │              │              │            │              │
└──────────┘              └──────────────┘            └──────┬───────┘
                                                             │
                                                             │ Transcription
                                                             │ complète
                                                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              GÉNÉRATION IA                                │
│                                                                          │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                │
│  │ TRANSCRIPTION│────►│   CLAUDE    │────►│    CRC      │                │
│  │    BRUTE    │     │   SONNET    │     │  STRUCTURÉ  │                │
│  └─────────────┘     │             │     │             │                │
│                      │ • Structure │     │ • Motif     │                │
│                      │ • Sections  │     │ • Histoire  │                │
│                      │ • Codage    │     │ • Examen    │                │
│                      │ • Diagnos.  │     │ • Diagnost. │                │
│                      └─────────────┘     │ • Conduite  │                │
│                                          │ • Codage    │                │
│                                          └──────┬──────┘                │
└─────────────────────────────────────────────────┼────────────────────────┘
                                                  │
                          ┌───────────────────────┼───────────────────────┐
                          │                       │                       │
                          ▼                       ▼                       ▼
                   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
                   │ DIAGNOSTIC  │         │   CODAGE    │         │ ORDONNANCE  │
                   │   CIM-10    │         │  NGAP/CCAM  │         │             │
                   └─────────────┘         └─────────────┘         └─────────────┘
                          │                       │                       │
                          └───────────────────────┼───────────────────────┘
                                                  │
                                                  ▼
                                          ┌─────────────┐
                                          │    FHIR     │
                                          │   STORE     │
                                          │             │
                                          │ • Encounter │
                                          │ • Document  │
                                          │ • Condition │
                                          │ • MedRequest│
                                          └─────────────┘
```

---

## 3. Modèle de Données

### 3.1 Entités FHIR

#### Patient

```typescript
// types/patient.ts
interface Patient {
  id: string;                          // UUID FHIR
  resourceType: 'Patient';
  
  // Identifiants
  identifier: Array<{
    system: string;                    // "urn:oid:1.2.250.1.213.1.4.8" (NIR)
    value: string;
  }>;
  
  // Nom
  name: Array<{
    use: 'official';
    family: string;
    given: string[];
  }>;
  
  // Administratif
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;                   // YYYY-MM-DD
  
  // Contact
  telecom: Array<{
    system: 'phone' | 'email';
    value: string;
    use: 'mobile' | 'home' | 'work';
  }>;
  
  // Adresse
  address?: Array<{
    use: 'home';
    line: string[];
    city: string;
    postalCode: string;
    country: string;
  }>;
  
  // Métadonnées
  meta: {
    lastUpdated: string;               // ISO 8601
    versionId: string;
  };
}
```

#### Encounter (Consultation)

```typescript
// types/consultation.ts
interface Encounter {
  id: string;
  resourceType: 'Encounter';
  
  status: 'planned' | 'in-progress' | 'finished' | 'cancelled';
  class: {
    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode';
    code: 'AMB';                       // Ambulatory
  };
  
  subject: {
    reference: string;                 // "Patient/{id}"
  };
  
  period: {
    start: string;                     // ISO 8601
    end?: string;
  };
  
  reasonCode: Array<{
    coding: Array<{
      system: string;                  // CIM-10 system
      code: string;
      display: string;
    }>;
    text: string;                      // Motif en clair
  }>;
  
  diagnosis?: Array<{
    condition: {
      reference: string;               // "Condition/{id}"
    };
    rank: number;
  }>;
  
  // Extension : transcription
  extension?: Array<{
    url: 'urn:transcription';
    valueString: string;
  }>;
}
```

### 3.2 Modèle BigQuery

```sql
-- Practitioner (hors données patients)
CREATE TABLE practitioners (
  id STRING NOT NULL,
  firebase_uid STRING NOT NULL,        -- Lien avec Firebase Auth
  rpps STRING,
  adeli STRING,
  email STRING NOT NULL,
  name STRING NOT NULL,
  specialty STRING,
  sector INTEGER,                      -- 1 ou 2
  phone STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id)
);

-- Task
CREATE TABLE tasks (
  id STRING NOT NULL,
  practitioner_id STRING NOT NULL,
  patient_fhir_id STRING,
  consultation_fhir_id STRING,
  type STRING NOT NULL,                -- 'rappel', 'resultat', 'rdv', 'courrier', 'facturation'
  priority STRING NOT NULL,            -- 'urgent', 'normal', 'basse'
  title STRING NOT NULL,
  description STRING,
  due_date DATE,
  status STRING NOT NULL,              -- 'todo', 'in_progress', 'done', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id)
);

-- Analytics / Logs
CREATE TABLE consultation_logs (
  id STRING NOT NULL,
  practitioner_id STRING NOT NULL,
  patient_fhir_id STRING NOT NULL,
  encounter_fhir_id STRING NOT NULL,
  action STRING NOT NULL,              -- 'created', 'transcribed', 'generated', 'validated'
  duration_ms INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id)
);
```

---

## 4. Design API

### 4.1 Endpoints REST

| Méthode | Route | Description | Auth | Input | Output |
|---------|-------|-------------|------|-------|--------|
| **Patients** |
| GET | /api/patients | Liste patients | Firebase Token | ?search, ?limit, ?offset | Patient[] |
| POST | /api/patients | Créer patient | Firebase Token | PatientInput | Patient |
| GET | /api/patients/[id] | Détail patient | Firebase Token | - | Patient |
| PUT | /api/patients/[id] | Modifier patient | Firebase Token | PatientInput | Patient |
| DELETE | /api/patients/[id] | Supprimer patient | Firebase Token | - | void |
| GET | /api/patients/search | Recherche rapide | Firebase Token | ?q | Patient[] |
| **Consultations** |
| POST | /api/consultations | Créer consultation | Firebase Token | ConsultationInput | Consultation |
| GET | /api/consultations/[id] | Détail consultation | Firebase Token | - | Consultation |
| PUT | /api/consultations/[id] | Modifier consultation | Firebase Token | ConsultationInput | Consultation |
| POST | /api/consultations/[id]/generate | Générer CRC | Firebase Token | { transcript } | CRC |
| **Transcription** |
| POST | /api/transcription/token | Obtenir token AssemblyAI | Firebase Token | - | { token } |
| **Documents** |
| POST | /api/documents/ordonnance | Générer ordonnance | Firebase Token | OrdonnanceInput | PDF |
| POST | /api/documents/bilan | Générer bilan | Firebase Token | BilanInput | PDF |
| GET | /api/documents/[id] | Télécharger document | Firebase Token | - | PDF |
| **Tâches** |
| GET | /api/tasks | Liste tâches | Firebase Token | ?status, ?priority | Task[] |
| POST | /api/tasks | Créer tâche | Firebase Token | TaskInput | Task |
| PUT | /api/tasks/[id] | Modifier tâche | Firebase Token | TaskInput | Task |
| DELETE | /api/tasks/[id] | Supprimer tâche | Firebase Token | - | void |
| **Codage** |
| GET | /api/codage/ngap | Recherche codes NGAP | Firebase Token | ?q | NGAPCode[] |
| GET | /api/codage/ccam | Recherche codes CCAM | Firebase Token | ?q | CCAMCode[] |
| GET | /api/codage/cim10 | Recherche codes CIM-10 | Firebase Token | ?q | CIM10Code[] |

### 4.2 Authentification Firebase

```typescript
// lib/firebase/admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialisation Admin SDK (côté serveur)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = getAuth();

// Middleware vérification token
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Token invalide');
  }
}
```

```typescript
// Exemple API Route protégée
// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  // Extraire le token du header Authorization
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Vérifier le token Firebase
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Récupérer les patients...
    const patients = await getPatients(userId);
    
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }
}
```

### 4.3 Gestion des Erreurs

| Code | Signification | Cas d'usage |
|------|---------------|-------------|
| 400 | Bad Request | Validation échouée, données invalides |
| 401 | Unauthorized | Token Firebase manquant ou invalide |
| 403 | Forbidden | Accès refusé à la ressource |
| 404 | Not Found | Patient/Consultation non trouvé |
| 409 | Conflict | Doublon détecté |
| 422 | Unprocessable | Données valides mais traitement impossible |
| 429 | Too Many Requests | Rate limiting |
| 500 | Server Error | Erreur interne |
| 503 | Service Unavailable | Service externe indisponible |

---

## 5. Spécifications UI/UX

### 5.1 Parcours Utilisateur Principal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PARCOURS CONSULTATION COMPLÈTE                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│         │     │         │     │         │     │         │     │         │
│ LOGIN   │────►│DASHBOARD│────►│ PATIENT │────►│ DICTÉE  │────►│  CRC    │
│Firebase │     │         │     │ Fiche   │     │         │     │         │
│         │     │         │     │         │     │         │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
  Google          Stats +        Création       Transcription    Génération
  OAuth           Tâches         ou sélection   temps réel       IA Claude
                                                                     │
                                                                     ▼
                                                              ┌─────────┐
                                                              │         │
                                                              │ EXPORT  │
                                                              │  PDF    │
                                                              │         │
                                                              └─────────┘
```

### 5.2 Liste des Écrans

| Écran | URL | Objectif | Éléments clés | États |
|-------|-----|----------|---------------|-------|
| Login | /login | Authentification | Logo, bouton Google, loading | Default, Loading, Error |
| Dashboard | / | Vue d'ensemble | Stats, patients du jour, tâches urgentes | Loading, Loaded |
| Liste patients | /patients | Gestion patients | Recherche, table, pagination | Empty, Loaded, Error |
| Fiche patient | /patients/[id] | Détail patient | Header, timeline, tabs | Loading, Loaded, 404 |
| Nouvelle consultation | /consultation/new | Démarrer dictée | Sélection patient, recorder | Ready, Recording, Error |
| Détail consultation | /consultation/[id] | Édition CRC | Sections éditables, preview | Draft, Generating, Validated |
| Liste tâches | /tasks | Gestion tâches | Filtres, liste cards | Empty, Loaded |
| Paramètres | /settings | Configuration | Profil, préférences | Loaded |

### 5.3 Composants Réutilisables

| Composant | Usage | Props principales |
|-----------|-------|-------------------|
| Button | CTAs, actions | variant, size, loading, disabled |
| Card | Conteneurs | title, children, actions |
| Input | Saisies | label, error, placeholder |
| Select | Sélections | options, value, onChange |
| Table | Listes données | columns, data, pagination |
| Dialog | Modales | open, onClose, title |
| Badge | Statuts, tags | variant (success/warning/error) |
| Avatar | Utilisateur | src, fallback |
| Skeleton | Loading states | variant (text/circle/rect) |
| EmptyState | États vides | icon, title, action |

### 5.4 Design Tokens

```css
:root {
/* Couleurs */
--color-primary: #2563eb;           /* Blue 600 */
--color-primary-hover: #1d4ed8;     /* Blue 700 */
--color-primary-light: #dbeafe;     /* Blue 100 */
--color-secondary: #64748b;         /* Slate 500 */
--color-success: #22c55e;           /* Green 500 */
--color-warning: #f59e0b;           /* Amber 500 */
--color-error: #ef4444;             /* Red 500 */
--color-background: #ffffff;
--color-surface: #f8fafc;           /* Slate 50 */
--color-border: #e2e8f0;            /* Slate 200 */
--color-text: #0f172a;              /* Slate 900 */
--color-text-muted: #64748b;        /* Slate 500 */

/* Typographie */
--font-family: 'Inter', system-ui, sans-serif;
--font-size-xs: 0.75rem;            /* 12px */
--font-size-sm: 0.875rem;           /* 14px */
--font-size-base: 1rem;             /* 16px */
--font-size-lg: 1.125rem;           /* 18px */
--font-size-xl: 1.25rem;            /* 20px */
--font-size-2xl: 1.5rem;            /* 24px */
--font-size-3xl: 1.875rem;          /* 30px */

/* Espacements */
--spacing-1: 0.25rem;               /* 4px */
--spacing-2: 0.5rem;                /* 8px */
--spacing-3: 0.75rem;               /* 12px */
--spacing-4: 1rem;                  /* 16px */
--spacing-6: 1.5rem;                /* 24px */
--spacing-8: 2rem;                  /* 32px */
--spacing-12: 3rem;                 /* 48px */
--spacing-16: 4rem;                 /* 64px */

/* Bordures */
--radius-sm: 0.25rem;               /* 4px */
--radius-md: 0.375rem;              /* 6px */
--radius-lg: 0.5rem;                /* 8px */
--radius-xl: 0.75rem;               /* 12px */
--radius-full: 9999px;

/* Ombres */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

/* Transitions */
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
}
```

---

## 6. Sécurité & Conformité

### 6.1 Authentification & Autorisation

| Aspect | Implémentation |
|--------|----------------|
| **Provider** | Firebase Authentication avec Google OAuth 2.0 |
| **Token** | ID Token Firebase (JWT) avec refresh automatique |
| **Vérification** | Firebase Admin SDK côté serveur |
| **Session** | Persistance locale (localStorage + cookies) |
| **Durée token** | 1 heure (refresh automatique par Firebase SDK) |
| **Stockage token** | Géré par Firebase SDK (IndexedDB) |
| **RBAC** | Praticien (full), Secrétaire (limité) - MVP 3.0 |

### 6.2 Flux d'Authentification Détaillé

```typescript
// 1. Configuration Firebase Client
// lib/firebase/client.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 2. Connexion Google
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// 3. Obtenir le token pour les API calls
export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Non connecté');
  return user.getIdToken();
}
```

### 6.3 Protection des Données

| Mesure | Description |
|--------|-------------|
| Chiffrement transit | TLS 1.3 obligatoire |
| Chiffrement repos | AES-256 (Google Cloud default) |
| Anonymisation | IDs patients sans données directement identifiantes en logs |
| Audit trail | Logs de toutes les actions sur données patient |
| Retention | 10 ans (obligation légale médicale) |

### 6.4 Conformité RGPD

| Exigence | Implémentation |
|----------|----------------|
| Base légale | Exécution contrat de soin |
| Consentement | Non requis (obligation légale) |
| Droits patient | Export données, rectification, limitation |
| Registre traitements | Documenté |
| DPO | À désigner avant production |
| Sous-traitants | Google Cloud (DPA signé), Firebase (DPA), Vercel (DPA), AssemblyAI, Anthropic |

### 6.5 Conformité HDS (Phase 2)

| Exigence | Statut MVP | Action V2 |
|----------|------------|-----------|
| Hébergement certifié | Non (Vercel) | Migration vers hébergeur HDS |
| Localisation données | EU (Google europe-west1) | France |
| Audit sécurité | Non | PASSI |
| PRA/PCA | Basique | Documenté et testé |

---

## 7. Services Tiers

### 7.1 Configuration Requise

| Service | Compte | Configuration | Documentation |
|---------|--------|---------------|---------------|
| **Firebase** | Firebase Console | Auth enabled, Google Provider | [firebase.google.com/docs](https://firebase.google.com/docs/auth) |
| **Google Cloud** | GCP Console | Healthcare API, BigQuery, Storage, IAM | [cloud.google.com/docs](https://cloud.google.com/healthcare-api/docs) |
| **AssemblyAI** | Dashboard | API Key, Real-time enabled | [docs.assemblyai.com](https://docs.assemblyai.com) |
| **Anthropic** | Console | API Key, claude-sonnet-4-20250514 | [docs.anthropic.com](https://docs.anthropic.com) |
| **Vercel** | Dashboard | Projet Next.js, variables env | [vercel.com/docs](https://vercel.com/docs) |

### 7.2 Variables d'Environnement

```env
# Firebase (Client - exposées au browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server - SECRETS)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=                 # Avec les \n escapés

# Google Cloud
GOOGLE_CLOUD_PROJECT=super-assistant-medical
GOOGLE_APPLICATION_CREDENTIALS=       # Path to service account JSON
HEALTHCARE_DATASET_ID=medical-data
HEALTHCARE_FHIR_STORE_ID=patients-fhir
HEALTHCARE_LOCATION=europe-west1
BIGQUERY_DATASET_ID=analytics

# AssemblyAI
ASSEMBLYAI_API_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://app.superassistant.fr
NODE_ENV=production
```

### 7.3 Coûts Détaillés

| Service | Unité | Prix unitaire | Usage MVP | Coût MVP |
|---------|-------|---------------|-----------|----------|
| **Firebase Auth** | MAU | 0 € (< 50k) | 50 users | 0 € |
| **AssemblyAI** | heure audio | 0,20 € | 100h/mois | 20 € |
| **Claude API** | 1M tokens input | 3 € | 5M/mois | 15 € |
| **Claude API** | 1M tokens output | 15 € | 1M/mois | 15 € |
| **Google Healthcare** | 1000 ops | 0,01 € | 500k/mois | 5 € |
| **BigQuery** | TB traité | 5 € | 10 GB/mois | < 1 € |
| **Cloud Storage** | GB/mois | 0,02 € | 50 GB | 1 € |
| **Vercel** | - | 0 € (Hobby) | - | 0 € |
| **Total MVP** | | | | **~55 €/mois** |

---

## 8. Performance & Scalabilité

### 8.1 Objectifs de Performance

| Métrique | Cible | Mesure |
|----------|-------|--------|
| TTFB (Time to First Byte) | < 200ms | Vercel Analytics |
| LCP (Largest Contentful Paint) | < 2.5s | Core Web Vitals |
| FID (First Input Delay) | < 100ms | Core Web Vitals |
| CLS (Cumulative Layout Shift) | < 0.1 | Core Web Vitals |
| API Response (p95) | < 500ms | Custom monitoring |
| Firebase Auth (sign-in) | < 3s | Custom monitoring |
| Transcription latency | < 2s | AssemblyAI metrics |
| CRC generation time | < 30s | Custom monitoring |

### 8.2 Stratégies d'Optimisation

| Domaine | Stratégie |
|---------|-----------|
| **Frontend** | RSC, Code splitting, Image optimization, Edge caching |
| **Auth** | Firebase SDK persistence, silent token refresh |
| **API** | Edge runtime, Response streaming, Connection pooling |
| **Data** | TanStack Query cache, Optimistic updates, Pagination |
| **Transcription** | WebSocket streaming, Audio compression |
| **IA** | Prompt caching, Streaming responses |

### 8.3 Scalabilité

| Phase | Users | Architecture |
|-------|-------|--------------|
| MVP | 10-50 | Vercel Hobby, Firebase free tier, single region |
| Beta | 50-200 | Vercel Pro, edge functions |
| Production | 200-1000 | Vercel Enterprise, multi-region |
| Scale | 1000+ | Migration infra dédiée HDS, Firebase Blaze plan |

---

## Annexe : Checklist Pré-Développement

### Comptes & Accès

**Firebase**
- [ ] Projet Firebase créé
- [ ] Firebase Authentication activé
- [ ] Google Sign-in Provider configuré
- [ ] Domaines autorisés ajoutés (localhost, domaine production)
- [ ] Configuration client récupérée (firebaseConfig)
- [ ] Service Account créé pour Admin SDK
- [ ] Clé privée Service Account téléchargée

**Google Cloud**
- [ ] Compte Google Cloud créé
- [ ] Projet GCP créé (`super-assistant-medical`)
- [ ] Healthcare API activée
- [ ] BigQuery API activée
- [ ] Service Account créé avec rôles appropriés
- [ ] FHIR Store créé (`patients-fhir`)

**Autres Services**
- [ ] Compte AssemblyAI créé
- [ ] API Key AssemblyAI générée
- [ ] Real-time transcription activée
- [ ] Compte Anthropic créé
- [ ] API Key Anthropic générée
- [ ] Compte Vercel créé
- [ ] Projet Vercel lié au repo Git

### Environnement Local

- [ ] Node.js 20+ installé
- [ ] pnpm installé
- [ ] Git configuré
- [ ] VS Code / Cursor avec extensions
- [ ] Variables .env.local configurées
- [ ] Google Cloud SDK installé
- [ ] Firebase CLI installé (`npm install -g firebase-tools`)
- [ ] Service account JSON téléchargé

### Repository

- [ ] Repo Git créé
- [ ] Branch protection configurée
- [ ] CI/CD Vercel configuré
- [ ] Variables env Vercel configurées (dont Firebase secrets)

---

## Changelog

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | 28/12/2024 | Version initiale avec Auth.js |
| 1.1 | 28/12/2024 | Migration Auth.js → Firebase Authentication |

---

*Document généré le 28 décembre 2024 — Cahier des Charges Technique v1.1*
