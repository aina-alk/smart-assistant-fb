# [BLOC 4.2] — Page Nouvelle Consultation (Workflow complet)

**Bloc** : 4.2 / 27  
**Durée estimée** : 40 min  
**Dépendances** : Bloc 4.1 terminé

---

## Contexte

L'API consultations est prête (bloc 4.1). Nous devons maintenant créer la page principale de consultation qui intègre tous les composants.

---

## Objectif de ce bloc

Créer la page de nouvelle consultation avec le workflow complet : sélection patient → dictée → génération CRC → codage → validation.

---

## Pré-requis

- [ ] Bloc 4.1 terminé
- [ ] Tous les composants des blocs 2 et 3 disponibles

---

## Spécifications

### Ce qui doit être créé

1. **Page Consultation** (`app/(dashboard)/consultation/new/page.tsx`) :
   - Workflow en étapes
   - Intégration de tous les composants
   - Gestion des états

2. **Composant Workflow** (`components/consultation/consultation-workflow.tsx`) :
   - Orchestration des étapes
   - Navigation entre étapes
   - Sauvegarde automatique

3. **Sélecteur Patient** (`components/consultation/patient-selector.tsx`) :
   - Recherche rapide patient
   - Création rapide si nouveau
   - Affichage infos patient sélectionné

4. **Store Consultation** (`lib/stores/consultation-store.ts`) :
   - État global de la consultation en cours
   - Actions pour chaque étape

---

## Workflow / Étapes

| Étape | Nom | Composants | Actions |
|-------|-----|------------|---------|
| 1 | Patient | PatientSelector | Sélectionner ou créer patient |
| 2 | Dictée | DictationPanel | Enregistrer et transcrire |
| 3 | CRC | CRCEditor + DiagnosticSelector | Générer et éditer CRC |
| 4 | Codage | CodagePanel | Valider les actes |
| 5 | Validation | Récapitulatif | Finaliser et exporter |

---

## Design Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Retour                    Nouvelle Consultation                    💾 Auto│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │●Patient │─│ Dictée  │─│   CRC   │─│ Codage  │─│ Valider │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PATIENT SÉLECTIONNÉ:                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 👤 DUPONT Jean  •  58 ans  •  M  •  06 12 34 56 78     [Changer]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌──────────────────────────────────┐ ┌────────────────────────────────┐   │
│  │                                  │ │                                │   │
│  │      TRANSCRIPTION               │ │       CRC GÉNÉRÉ               │   │
│  │                                  │ │                                │   │
│  │  [Zone transcription temps réel] │ │  [Sections CRC éditables]      │   │
│  │                                  │ │                                │   │
│  │                                  │ │                                │   │
│  │  ┌────────────────────────────┐  │ │                                │   │
│  │  │ 🎤 ●REC  02:34  [Arrêter] │  │ │                                │   │
│  │  └────────────────────────────┘  │ │                                │   │
│  │                                  │ │  [Générer CRC]                 │   │
│  └──────────────────────────────────┘ └────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  DIAGNOSTICS        │  CODAGE ACTES                                 │   │
│  │  H90.3 Surdité...   │  CS 30€ + CDQP002 26.88€ = 56.88€ + 30€ dép. │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                             │
│  │💊Ordonnance│ │🔬 Bilan    │ │✉️ Courrier │                             │
│  └────────────┘ └────────────┘ └────────────┘                             │
│                                                                             │
│                         [ Enregistrer brouillon ]  [ Valider et terminer ] │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Store Consultation

```typescript
interface ConsultationState {
  // Données
  patientId: string | null;
  patient: Patient | null;
  consultationId: string | null;
  
  // Contenu
  transcription: string;
  crc: CRCGenerated | null;
  diagnostics: DiagnosticSelection | null;
  codage: CodageConsultation | null;
  
  // UI
  currentStep: number;
  isGenerating: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Actions
  setPatient: (patient: Patient) => void;
  setTranscription: (text: string) => void;
  setCRC: (crc: CRCGenerated) => void;
  setDiagnostics: (diag: DiagnosticSelection) => void;
  setCodage: (codage: CodageConsultation) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  save: () => Promise<void>;
}
```

---

## Structure attendue

```
src/
├── app/
│   └── (dashboard)/
│       └── consultation/
│           └── new/
│               └── page.tsx
├── components/
│   └── consultation/
│       ├── consultation-workflow.tsx
│       ├── patient-selector.tsx
│       └── step-indicator.tsx
└── lib/
    └── stores/
        └── consultation-store.ts
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Page /consultation/new s'affiche
- [ ] Sélection patient fonctionne
- [ ] Dictée + transcription temps réel
- [ ] Bouton "Générer CRC" appelle l'API
- [ ] CRC s'affiche et est éditable
- [ ] Diagnostics et codage suggérés
- [ ] Sauvegarde brouillon fonctionne
- [ ] "Valider" termine la consultation
- [ ] Redirection vers fiche patient après validation

---

## Notes importantes

> ⚠️ La sauvegarde automatique (auto-save) toutes les 30 secondes protège contre la perte de données.

> Le workflow n'est pas strictement linéaire : l'utilisateur peut revenir en arrière et modifier.

> Sur mobile, adapter le layout en colonnes empilées plutôt que côte à côte.

---

## Prochain bloc

**[BLOC 4.3]** — Éditeur CRC avec Sections
