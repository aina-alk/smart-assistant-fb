# [BLOC 0.6c] — Formulaire d'Inscription & Pages Attente

## Contexte

**Projet** : Super Assistant Médical  
**Stack** : Next.js 15 + React 19 + Firebase Auth + Cloud Firestore  
**État actuel** : 
- Backend authorization déployé (Bloc 0.6 ✅)
- Dashboard admin fonctionnel (Bloc 0.6b ✅)
- L'authentification Google fonctionne

**Problème** : Après connexion Google, si l'utilisateur n'a pas de document `users/{uid}`, il n'y a aucun parcours pour soumettre sa demande d'accès.

---

## Objectif de ce bloc

Créer le parcours complet pour les nouveaux utilisateurs :
1. **Détection** : Identifier les utilisateurs authentifiés sans document Firestore
2. **Formulaire** : Collecter les informations via un formulaire multi-étapes
3. **Soumission** : Créer le document `users/{uid}` avec `status: 'pending_call'`
4. **Confirmation** : Afficher une page de confirmation après soumission
5. **Attente** : Page d'attente pour les utilisateurs en cours de validation
6. **Routage intelligent** : Rediriger selon le status de l'utilisateur

---

## Pré-requis

- [x] Bloc 0.6 terminé (backend + Cloud Functions)
- [x] Bloc 0.6b terminé (dashboard admin pour tester)
- [x] Firebase Auth fonctionnel avec Google OAuth

---

## Spécifications

### 1. Logique de Routage Global

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARBRE DE DÉCISION ROUTAGE                     │
└─────────────────────────────────────────────────────────────────┘

                         Utilisateur arrive
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Est authentifié ?    │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │ NON                               │ OUI
              ▼                                   ▼
      ┌───────────────┐                 ┌───────────────────────┐
      │ Page publique │                 │  Document users/{uid} │
      │ ou Login      │                 │  existe ?             │
      └───────────────┘                 └───────────┬───────────┘
                                                    │
                              ┌─────────────────────┴─────────────────────┐
                              │ NON                                       │ OUI
                              ▼                                           ▼
                      ┌───────────────┐                         ┌───────────────────┐
                      │ /inscription  │                         │  Quel status ?    │
                      │ (formulaire)  │                         └─────────┬─────────┘
                      └───────────────┘                                   │
                                                    ┌─────────────────────┼─────────────────────┐
                                                    │                     │                     │
                                                    ▼                     ▼                     ▼
                                            ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
                                            │ pending_*   │       │  approved   │       │  rejected   │
                                            │ in_review   │       └──────┬──────┘       └──────┬──────┘
                                            └──────┬──────┘              │                     │
                                                   │                     │                     │
                                                   ▼                     ▼                     ▼
                                            ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
                                            │ /en-attente │       │ /dashboard  │       │ /demande-   │
                                            │             │       │ (accès app) │       │ refusee     │
                                            └─────────────┘       └─────────────┘       └─────────────┘
```

---

### 2. Formulaire d'Inscription Multi-étapes

#### Structure du Formulaire

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  🏥 Super Assistant Médical                                      │
│                                                                  │
│  Demande d'accès                                                 │
│                                                                  │
│  ●───────●───────○                                               │
│  Étape 1   Étape 2   Étape 3                                    │
│  Identité  Profil    Disponibilités                              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Contenu de l'étape courante]                                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [← Précédent]                              [Suivant →]         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Étape 1 : Identité

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  📋 Vos informations personnelles                                │
│                                                                  │
│  Nom complet *                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Dr Sophie Martin                         (pré-rempli Google)││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Email *                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ dr.martin@gmail.com                      (pré-rempli, readonly)│
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Téléphone professionnel *                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 06 12 34 56 78                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│  ℹ️ Numéro sur lequel nous vous contacterons                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Champs** :
| Champ | Type | Validation | Pré-rempli |
|-------|------|------------|------------|
| displayName | text | required, min 2 chars | Oui (Google) |
| email | email | required, readonly | Oui (Google) |
| phone | tel | required, format FR | Non |

---

#### Étape 2 : Profil Professionnel

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  🏥 Votre profil professionnel                                   │
│                                                                  │
│  Vous êtes : *                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ○ Médecin                                                  ││
│  │  ○ Secrétaire médical(e)                                    ││
│  │  ○ Technicien(ne) de santé                                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [SI MÉDECIN SÉLECTIONNÉ]                                       │
│                                                                  │
│  Numéro RPPS *                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 10001234567                                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│  ℹ️ 11 chiffres, vérifiable sur annuaire.sante.fr               │
│                                                                  │
│  Spécialité *                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ORL                                                       ▼ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Secteur conventionnel *                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ○ Secteur 1                                                ││
│  │  ○ Secteur 2                                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Numéro ADELI (optionnel)                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [SI SECRÉTAIRE SÉLECTIONNÉ]                                    │
│                                                                  │
│  Nom du médecin ou cabinet référent *                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Cabinet Dr Martin                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [SI TECHNICIEN SÉLECTIONNÉ]                                    │
│                                                                  │
│  Spécialisation *                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Audioprothésiste                                          ▼ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Champs conditionnels** :

| Rôle | Champs requis |
|------|---------------|
| Médecin | rpps (11 chiffres), specialty (select), sector (1 ou 2), adeli (optionnel) |
| Secrétaire | supervisorName (text) |
| Technicien | specialization (select) |

**Options Spécialités Médecin** :
- ORL
- Médecine générale
- Chirurgie
- Pédiatrie
- Dermatologie
- Cardiologie
- Autre

**Options Spécialisation Technicien** :
- Audioprothésiste
- Orthophoniste
- Manipulateur radio
- Autre

---

#### Étape 3 : Disponibilités & Commentaire

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  📅 Vos disponibilités pour être rappelé(e)                      │
│                                                                  │
│  Sélectionnez vos créneaux préférés : *                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ☑ Matin (9h - 12h)                                         ││
│  │  ☐ Midi (12h - 14h)                                         ││
│  │  ☑ Après-midi (14h - 18h)                                   ││
│  │  ☐ Soir (18h - 20h)                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│  ℹ️ Sélectionnez au moins un créneau                             │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  💬 Commentaire (optionnel)                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Décrivez brièvement votre activité ou vos attentes...       ││
│  │                                                              ││
│  │                                                              ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│  250 caractères max                                              │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ☑ J'accepte d'être contacté(e) par téléphone pour un          │
│    entretien de présentation. *                                 │
│                                                                  │
│  ☑ J'ai lu et j'accepte les conditions générales               │
│    d'utilisation et la politique de confidentialité. *          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Champs** :
| Champ | Type | Validation |
|-------|------|------------|
| callbackSlots | checkbox[] | min 1 sélectionné |
| callbackNote | textarea | max 250 chars, optionnel |
| acceptContact | checkbox | required |
| acceptTerms | checkbox | required |

---

### 3. Page de Confirmation `/demande-envoyee`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                           ✅                                     │
│                                                                  │
│              Demande envoyée avec succès !                       │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Merci pour votre demande d'accès à Super Assistant Médical.    │
│                                                                  │
│  📞 Prochaine étape                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Un membre de notre équipe vous contactera                  ││
│  │  sous 48 heures ouvrées au :                                ││
│  │                                                              ││
│  │         📱 06 12 34 56 78                                    ││
│  │                                                              ││
│  │  Créneaux sélectionnés : Matin, Après-midi                  ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  📧 Un email de confirmation a été envoyé à :                    │
│     dr.martin@gmail.com                                         │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  💡 En attendant, vous pouvez :                                  │
│  • Consulter notre FAQ                                          │
│  • Découvrir nos fonctionnalités                                │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│                    [Se déconnecter]                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4. Page d'Attente `/en-attente`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                           ⏳                                     │
│                                                                  │
│              Votre demande est en cours                          │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Bonjour Dr Martin,                                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Status : 🟡 En cours d'évaluation                          ││
│  │                                                              ││
│  │  Votre demande est actuellement examinée par notre          ││
│  │  équipe. Vous serez notifié(e) par email dès qu'une         ││
│  │  décision sera prise.                                       ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  📋 Récapitulatif de votre demande                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Profil      : Médecin ORL                                   ││
│  │ N° RPPS     : 10001234567                                   ││
│  │ Téléphone   : 06 12 34 56 78                                ││
│  │ Soumise le  : 29/12/2024 à 14:32                            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ❓ Une question ?                                               │
│  Contactez-nous : support@superassistant.fr                     │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│                    [Se déconnecter]                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Comportement** :
- Listener Firestore sur `users/{uid}` pour détecter changement de status
- Si status → `approved` : afficher message + bouton "Accéder au dashboard"
- Si status → `rejected` : rediriger vers `/demande-refusee`

---

### 5. Page Demande Refusée `/demande-refusee`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                           ❌                                     │
│                                                                  │
│              Demande non retenue                                 │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Bonjour,                                                       │
│                                                                  │
│  Nous avons examiné votre demande d'accès à Super Assistant     │
│  Médical et ne sommes malheureusement pas en mesure d'y         │
│  donner une suite favorable.                                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Motif : Notre solution est actuellement réservée aux       ││
│  │  professionnels de santé exerçant en France avec un         ││
│  │  numéro RPPS valide.                                        ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Si vous pensez qu'il s'agit d'une erreur ou si votre          │
│  situation évolue, n'hésitez pas à nous contacter.             │
│                                                                  │
│  📧 support@superassistant.fr                                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│                    [Se déconnecter]                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. Composants à Créer

#### 6.1 AuthorizationRouter (Composant principal de routage)

```typescript
// src/components/auth/authorization-router.tsx

interface AuthorizationRouterProps {
  children: React.ReactNode;
}

// Logique :
// 1. Vérifie si l'utilisateur est authentifié
// 2. Si oui, récupère le document users/{uid}
// 3. Redirige selon le status ou l'absence de document
```

#### 6.2 RegistrationForm (Formulaire multi-étapes)

```typescript
// src/components/registration/registration-form.tsx

interface RegistrationFormProps {
  user: FirebaseUser;  // User Firebase Auth pour pré-remplir
  onSubmit: (data: RegistrationData) => Promise<void>;
}

// Gère les 3 étapes
// Validation à chaque étape
// Soumission finale
```

#### 6.3 StepIndicator (Indicateur d'étapes)

```typescript
// src/components/registration/step-indicator.tsx

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

// Affiche ●───────●───────○
```

#### 6.4 RoleSelector (Sélecteur de rôle)

```typescript
// src/components/registration/role-selector.tsx

interface RoleSelectorProps {
  value: Role | null;
  onChange: (role: Role) => void;
}

// Cards cliquables pour Médecin / Secrétaire / Technicien
```

#### 6.5 MedecinFields (Champs spécifiques médecin)

```typescript
// src/components/registration/medecin-fields.tsx

interface MedecinFieldsProps {
  data: MedecinData;
  onChange: (data: MedecinData) => void;
  errors: Record<string, string>;
}

// RPPS, spécialité, secteur, ADELI
```

#### 6.6 SecretaireFields (Champs spécifiques secrétaire)

```typescript
// src/components/registration/secretaire-fields.tsx

interface SecretaireFieldsProps {
  data: SecretaireData;
  onChange: (data: SecretaireData) => void;
  errors: Record<string, string>;
}

// Nom du superviseur/cabinet
```

#### 6.7 TechnicienFields (Champs spécifiques technicien)

```typescript
// src/components/registration/technicien-fields.tsx

interface TechnicienFieldsProps {
  data: TechnicienData;
  onChange: (data: TechnicienData) => void;
  errors: Record<string, string>;
}

// Spécialisation
```

#### 6.8 CallbackSlotsSelector (Sélecteur créneaux)

```typescript
// src/components/registration/callback-slots-selector.tsx

interface CallbackSlotsSelectorProps {
  value: string[];
  onChange: (slots: string[]) => void;
}

// Checkboxes pour les créneaux
```

#### 6.9 WaitingStatus (Affichage status attente)

```typescript
// src/components/registration/waiting-status.tsx

interface WaitingStatusProps {
  status: UserStatus;
  user: User;
}

// Affiche le status avec icône et message approprié
```

---

### 7. Hooks à Créer

#### 7.1 useRegistration

```typescript
// src/lib/hooks/use-registration.ts

interface UseRegistrationReturn {
  currentStep: number;
  formData: RegistrationData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  
  setStep: (step: number) => void;
  updateFormData: (data: Partial<RegistrationData>) => void;
  validateStep: () => boolean;
  nextStep: () => void;
  prevStep: () => void;
  submit: () => Promise<void>;
}

// Gestion complète du formulaire multi-étapes
```

#### 7.2 useUserDocument

```typescript
// src/lib/hooks/use-user-document.ts

interface UseUserDocumentReturn {
  userDoc: User | null;
  exists: boolean;
  isLoading: boolean;
  error: Error | null;
}

// Récupère le document users/{uid} avec listener temps réel
```

#### 7.3 useAuthorizationStatus

```typescript
// src/lib/hooks/use-authorization-status.ts

type AuthorizationState = 
  | 'loading'
  | 'unauthenticated'
  | 'no_document'      // → /inscription
  | 'pending'          // → /en-attente
  | 'approved'         // → /dashboard
  | 'rejected';        // → /demande-refusee

interface UseAuthorizationStatusReturn {
  state: AuthorizationState;
  user: FirebaseUser | null;
  userDoc: User | null;
  isLoading: boolean;
}

// Combine Firebase Auth + Firestore pour déterminer l'état
```

---

### 8. Service de Création Document

```typescript
// src/lib/firebase/registration.ts

interface CreateUserDocumentParams {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: Role;
  callbackSlots: string[];
  callbackNote: string | null;
  medecinData?: MedecinData;
  secretaireData?: SecretaireData;
  technicienData?: TechnicienData;
}

export async function createUserDocument(params: CreateUserDocumentParams): Promise<void> {
  const userRef = doc(db, 'users', params.uid);
  
  await setDoc(userRef, {
    email: params.email,
    displayName: params.displayName,
    phone: params.phone,
    photoURL: null,
    
    role: params.role,
    status: 'pending_call',
    
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    
    callbackSlots: params.callbackSlots,
    callbackNote: params.callbackNote,
    interviewScheduledAt: null,
    interviewCompletedAt: null,
    interviewNotes: null,
    interviewedBy: null,
    
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    
    statusHistory: [{
      status: 'pending_call',
      changedAt: new Date(),
      changedBy: 'system',
      note: 'Demande initiale',
    }],
    
    structureId: null,
    structureName: null,
    
    medecinData: params.medecinData || null,
    secretaireData: params.secretaireData || null,
    technicienData: params.technicienData || null,
    adminData: null,
  });
}
```

---

## Structure Attendue

```
src/
├── app/
│   ├── (auth)/                           # Routes publiques/auth
│   │   ├── login/
│   │   │   └── page.tsx                  # Page de connexion
│   │   └── layout.tsx
│   │
│   ├── (registration)/                   # Routes inscription
│   │   ├── inscription/
│   │   │   └── page.tsx                  # Formulaire multi-étapes
│   │   ├── demande-envoyee/
│   │   │   └── page.tsx                  # Confirmation
│   │   ├── en-attente/
│   │   │   └── page.tsx                  # Page attente
│   │   ├── demande-refusee/
│   │   │   └── page.tsx                  # Page rejet
│   │   └── layout.tsx                    # Layout avec logo simple
│   │
│   ├── (protected)/                      # Routes protégées (approved)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx                    # Avec AuthorizationRouter
│   │
│   └── layout.tsx                        # Root layout
│
├── components/
│   ├── auth/
│   │   └── authorization-router.tsx      # Routage selon status
│   │
│   └── registration/
│       ├── registration-form.tsx         # Formulaire principal
│       ├── step-indicator.tsx            # Indicateur étapes
│       ├── step-identity.tsx             # Étape 1
│       ├── step-profile.tsx              # Étape 2
│       ├── step-availability.tsx         # Étape 3
│       ├── role-selector.tsx             # Sélection rôle
│       ├── medecin-fields.tsx            # Champs médecin
│       ├── secretaire-fields.tsx         # Champs secrétaire
│       ├── technicien-fields.tsx         # Champs technicien
│       ├── callback-slots-selector.tsx   # Sélection créneaux
│       └── waiting-status.tsx            # Affichage attente
│
├── lib/
│   ├── hooks/
│   │   ├── use-registration.ts           # Hook formulaire
│   │   ├── use-user-document.ts          # Hook document user
│   │   └── use-authorization-status.ts   # Hook status global
│   │
│   ├── firebase/
│   │   └── registration.ts               # Création document
│   │
│   └── validations/
│       └── registration.ts               # Schémas validation (zod)
│
└── types/
    └── registration.ts                   # Types formulaire
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Route `/inscription` accessible uniquement si authentifié sans document
- [ ] Formulaire 3 étapes fonctionnel avec navigation
- [ ] Étape 1 pré-remplie avec données Google
- [ ] Étape 2 affiche les bons champs selon le rôle sélectionné
- [ ] Validation RPPS (11 chiffres) pour les médecins
- [ ] Étape 3 requiert au moins 1 créneau + acceptation des conditions
- [ ] Soumission crée le document `users/{uid}` avec `status: 'pending_call'`
- [ ] Redirection vers `/demande-envoyee` après soumission
- [ ] Page `/demande-envoyee` affiche le récap correct
- [ ] Page `/en-attente` affiche le status et écoute les changements
- [ ] Transition automatique vers dashboard si status → approved
- [ ] Page `/demande-refusee` affiche le motif si présent
- [ ] Utilisateur approved redirigé vers dashboard
- [ ] Utilisateur non authentifié redirigé vers login

### Tests Manuels

1. [ ] Se déconnecter, aller sur `/inscription` → redirection login
2. [ ] Se connecter avec nouveau compte Google → redirection `/inscription`
3. [ ] Remplir étape 1, cliquer Suivant → étape 2
4. [ ] Sélectionner "Médecin" → champs RPPS/spécialité apparaissent
5. [ ] Sélectionner "Secrétaire" → champs médecin disparaissent, champ superviseur apparaît
6. [ ] Remplir et soumettre → document créé dans Firestore
7. [ ] Redirection vers `/demande-envoyee` → infos correctes
8. [ ] Rafraîchir la page → redirection `/en-attente`
9. [ ] Via dashboard admin : approuver l'utilisateur
10. [ ] Page `/en-attente` détecte le changement → bouton "Accéder" apparaît
11. [ ] Cliquer → accès au dashboard

---

## Notes Importantes

> 💡 **Validation RPPS** : Côté client, vérifier uniquement le format (11 chiffres). La validation métier se fait par l'admin lors de l'entretien.

> ⚠️ **Sécurité** : Les règles Firestore empêchent déjà un utilisateur de créer un document avec un status autre que `pending_call`. Pas de risque de s'auto-approuver.

> 💡 **UX** : Sauvegarder les données du formulaire dans localStorage pour éviter la perte si refresh accidentel.

> 💡 **Temps réel** : Utiliser `onSnapshot` sur `/en-attente` pour détecter immédiatement quand l'admin approuve.

> 🚫 **Hors-scope** : Upload de justificatifs (carte professionnelle, etc.). À ajouter en V2 si nécessaire.

---

## Dépendances Suggérées

```bash
# Validation de formulaire
npm install zod react-hook-form @hookform/resolvers

# Déjà installé normalement
npm install sonner lucide-react
```

---

## Types à Définir

```typescript
// src/types/registration.ts

export type Role = 'medecin' | 'secretaire' | 'technicien';

export type CallbackSlot = 'morning' | 'noon' | 'afternoon' | 'evening';

export interface RegistrationData {
  // Étape 1
  displayName: string;
  email: string;
  phone: string;
  
  // Étape 2
  role: Role | null;
  medecinData?: {
    rpps: string;
    specialty: string;
    sector: 1 | 2;
    adeli?: string;
  };
  secretaireData?: {
    supervisorName: string;
  };
  technicienData?: {
    specialization: string;
  };
  
  // Étape 3
  callbackSlots: CallbackSlot[];
  callbackNote: string;
  acceptContact: boolean;
  acceptTerms: boolean;
}

export const SPECIALTIES = [
  'ORL',
  'Médecine générale',
  'Chirurgie',
  'Pédiatrie',
  'Dermatologie',
  'Cardiologie',
  'Autre',
] as const;

export const TECHNICIAN_SPECIALIZATIONS = [
  'Audioprothésiste',
  'Orthophoniste',
  'Manipulateur radio',
  'Autre',
] as const;

export const CALLBACK_SLOTS = [
  { value: 'morning', label: 'Matin (9h - 12h)' },
  { value: 'noon', label: 'Midi (12h - 14h)' },
  { value: 'afternoon', label: 'Après-midi (14h - 18h)' },
  { value: 'evening', label: 'Soir (18h - 20h)' },
] as const;
```

---

**Prochain bloc** : [0.7] — Intégration complète et tests end-to-end
