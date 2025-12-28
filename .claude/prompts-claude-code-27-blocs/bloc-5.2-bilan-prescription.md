# [BLOC 5.2] — Génération Bilan / Prescription d'examens

**Bloc** : 5.2 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Bloc 5.1 terminé

---

## Contexte

L'ordonnance fonctionne (bloc 5.1). Nous devons maintenant permettre la prescription d'examens complémentaires (imagerie, biologie, etc.).

---

## Objectif de ce bloc

Créer le système de génération de bilans et prescriptions d'examens depuis le CRC.

---

## Pré-requis

- [ ] Bloc 5.1 terminé
- [ ] Consultation avec CRC disponible

---

## Spécifications

### Ce qui doit être créé

1. **Types Bilan** (`types/bilan.ts`) :
   - `ExamenPrescrit`
   - `BilanPrescription`

2. **Base Examens ORL** (`lib/constants/examens-orl.ts`) :
   - Imagerie (IRM, TDM, radios)
   - Biologie
   - Explorations fonctionnelles

3. **Prompt extraction** (`lib/prompts/bilan-extraction.ts`) :
   - Extraire examens mentionnés dans CRC

4. **API Route** :
   - `POST /api/consultations/[id]/bilan` : génère bilan

5. **Composants** :
   - `BilanForm` : formulaire prescription
   - `BilanDialog` : modal de création
   - `ExamenSelector` : sélection avec recherche

---

## Types

```typescript
interface ExamenPrescrit {
  code: string;             // Ex: "IRM-CAI"
  libelle: string;          // Ex: "IRM des conduits auditifs internes"
  categorie: 'imagerie' | 'biologie' | 'exploration' | 'autre';
  indication: string;       // Ex: "Recherche neurinome de l'acoustique"
  urgent: boolean;
  commentaire?: string;
}

interface BilanPrescription {
  id: string;
  consultationId: string;
  patientId: string;
  date: Date;
  examens: ExamenPrescrit[];
  contexte_clinique: string;
  createdAt: Date;
}
```

---

## Base Examens ORL

```typescript
const EXAMENS_ORL = {
  imagerie: [
    { code: 'IRM-CAI', libelle: 'IRM des conduits auditifs internes', indication: 'Surdité unilatérale, acouphènes unilatéraux' },
    { code: 'IRM-ROCHERS', libelle: 'IRM des rochers', indication: 'Pathologie oreille moyenne/interne' },
    { code: 'TDM-ROCHERS', libelle: 'Scanner des rochers', indication: 'Cholestéatome, otospongiose' },
    { code: 'TDM-SINUS', libelle: 'Scanner des sinus', indication: 'Sinusite chronique, polypose' },
    { code: 'RADIO-CAVUM', libelle: 'Radio du cavum', indication: 'Hypertrophie végétations' },
    { code: 'PANO-DENT', libelle: 'Panoramique dentaire', indication: 'Recherche foyer infectieux' },
  ],
  biologie: [
    { code: 'NFS', libelle: 'Numération formule sanguine', indication: 'Bilan infectieux' },
    { code: 'CRP', libelle: 'Protéine C réactive', indication: 'Syndrome inflammatoire' },
    { code: 'TSH', libelle: 'TSH', indication: 'Dysthyroïdie' },
    { code: 'GLYCEMIE', libelle: 'Glycémie à jeun', indication: 'Diabète' },
    { code: 'BILAN-HEMOSTASE', libelle: 'Bilan d\'hémostase', indication: 'Préopératoire' },
  ],
  exploration: [
    { code: 'PEA', libelle: 'Potentiels évoqués auditifs', indication: 'Surdité de perception' },
    { code: 'VNG', libelle: 'Vidéonystagmographie', indication: 'Vertiges' },
    { code: 'ENG', libelle: 'Électronystagmographie', indication: 'Exploration vestibulaire' },
    { code: 'VHIT', libelle: 'Video Head Impulse Test', indication: 'Déficit vestibulaire' },
    { code: 'POLYSOM', libelle: 'Polysomnographie', indication: 'Apnées du sommeil' },
    { code: 'FIBRO-DEGLUT', libelle: 'Fibroscopie de déglutition', indication: 'Troubles de la déglutition' },
  ],
};
```

---

## Design Formulaire

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRESCRIPTION D'EXAMENS                                         [ ✕ Fermer]│
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  Patient: DUPONT Jean                         Date: 28/12/2024             │
│                                                                             │
│  EXAMENS PRESCRITS                                        [ + Ajouter ]    │
│  ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🩻 IMAGERIE                                                         │   │
│  │                                                                     │   │
│  │ ☑ IRM des conduits auditifs internes                    [🗑️]      │   │
│  │   Indication: Recherche neurinome de l'acoustique                  │   │
│  │   ☐ Urgent                                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🔬 BIOLOGIE                                                         │   │
│  │                                                                     │   │
│  │ (Aucun examen biologique prescrit)                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Contexte clinique:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Surdité de perception bilatérale avec acouphènes. Bilan pour       │   │
│  │ éliminer pathologie rétrocochléaire.                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                            [ Annuler ]   [ Générer la prescription ]       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Structure attendue

```
src/
├── app/
│   └── api/
│       └── consultations/
│           └── [id]/
│               └── bilan/
│                   └── route.ts
├── components/
│   └── documents/
│       ├── bilan-form.tsx
│       ├── bilan-dialog.tsx
│       └── examen-selector.tsx
├── lib/
│   ├── constants/
│   │   └── examens-orl.ts
│   └── prompts/
│       └── bilan-extraction.ts
└── types/
    └── bilan.ts
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Bouton "Bilan" ouvre le dialog
- [ ] Extraction IA propose des examens depuis CRC
- [ ] Sélection par catégorie (imagerie, bio, explo)
- [ ] Recherche dans la liste d'examens
- [ ] Toggle urgent par examen
- [ ] Contexte clinique éditable
- [ ] Bilan enregistré dans FHIR (ServiceRequest)

---

## Notes importantes

> ⚠️ Le PDF sera généré au bloc 5.3.

> Stocker comme FHIR ServiceRequest pour chaque examen.

> L'indication est pré-remplie mais modifiable.

---

## Prochain bloc

**[BLOC 5.3]** — Export PDF (CRC, Ordonnance, Bilan)
