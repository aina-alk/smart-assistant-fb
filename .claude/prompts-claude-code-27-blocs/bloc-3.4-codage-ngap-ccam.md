# [BLOC 3.4] — Suggestion Codage NGAP/CCAM

**Bloc** : 3.4 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Bloc 3.3 terminé

---

## Contexte

L'extraction CIM-10 fonctionne (bloc 3.3). Nous devons maintenant suggérer les actes à facturer (NGAP pour consultations, CCAM si actes techniques).

---

## Objectif de ce bloc

Créer le système de suggestion de codage tarifaire NGAP/CCAM basé sur le contenu du CRC.

---

## Pré-requis

- [ ] Bloc 3.3 terminé
- [ ] CRC avec diagnostics disponible

---

## Spécifications

### Ce qui doit être créé

1. **Base NGAP Consultation** (`lib/constants/ngap-codes.ts`) :
   - Codes consultation ORL
   - Tarifs secteur 1 et base remboursement

2. **Base CCAM ORL** (`lib/constants/ccam-codes.ts`) :
   - Actes techniques ORL courants
   - Tarifs et modificateurs

3. **Prompt suggestion** (`lib/prompts/codage-suggestion.ts`) :
   - Analyse CRC pour détecter actes
   - Règles d'association

4. **API Routes** :
   - `GET /api/codage/ngap` : liste codes NGAP
   - `GET /api/codage/ccam` : liste codes CCAM
   - `POST /api/codage/suggest` : suggestion depuis CRC

5. **Composant Panel** (`components/consultation/codage-panel.tsx`) :
   - Affiche suggestions
   - Calcul automatique total
   - Gestion dépassement secteur 2

---

## Codes NGAP Consultation

```typescript
interface NGAPCode {
  code: string;           // Ex: "CS"
  libelle: string;        // Ex: "Consultation spécialiste"
  tarif_base: number;     // Tarif secteur 1
  coefficient?: number;   // Pour les actes à coefficient
}

const NGAP_CODES: NGAPCode[] = [
  { code: 'C', libelle: 'Consultation généraliste', tarif_base: 26.50 },
  { code: 'CS', libelle: 'Consultation spécialiste', tarif_base: 30.00 },
  { code: 'APC', libelle: 'Avis ponctuel de consultant', tarif_base: 55.00 },
  { code: 'COE', libelle: 'Consultation très complexe ORL', tarif_base: 69.12 },
  // Majorations
  { code: 'MPC', libelle: 'Majoration pour coordination', tarif_base: 5.00 },
  { code: 'MCS', libelle: 'Majoration spécialiste', tarif_base: 5.00 },
];
```

---

## Codes CCAM ORL Courants (Consultation)

```typescript
interface CCAMCode {
  code: string;           // Ex: "CDQP002"
  libelle: string;
  tarif_base: number;
  modificateurs?: string[]; // Ex: ["F", "7"]
  regroupement: string;    // Ex: "ATM" (audiométrie)
}

const CCAM_CONSULTATION: CCAMCode[] = [
  // Audiométrie
  { code: 'CDQP002', libelle: 'Audiométrie tonale et vocale', tarif_base: 26.88, regroupement: 'ATM' },
  { code: 'CDQP010', libelle: 'Audiométrie tonale', tarif_base: 19.20, regroupement: 'ATM' },
  
  // Impédancemétrie
  { code: 'CDQP001', libelle: 'Impédancemétrie', tarif_base: 24.32, regroupement: 'ATM' },
  
  // Endoscopie
  { code: 'GDRP001', libelle: 'Nasofibroscopie', tarif_base: 44.57, regroupement: 'ENS' },
  { code: 'GEQP004', libelle: 'Laryngoscopie indirecte', tarif_base: 28.80, regroupement: 'ENS' },
  
  // Autres
  { code: 'CDRP002', libelle: 'Vidéonystagmographie', tarif_base: 75.60, regroupement: 'VNG' },
  { code: 'LAQK001', libelle: 'Ablation bouchon cérumen', tarif_base: 12.35, regroupement: 'ACT' },
];
```

---

## Règles de suggestion

| Contenu CRC | Code suggéré |
|-------------|--------------|
| Consultation standard | CS (30€) |
| Consultation > 30 min, pathologie complexe | COE (69.12€) |
| Patient adressé pour avis | APC (55€) |
| Mention audiométrie/audition | CS + CDQP002 |
| Mention nasofibroscopie | CS + GDRP001 |
| Mention impédancemétrie | CS + CDQP001 |

---

## Design Composant

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  CODAGE ACTES                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Actes suggérés :                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ CS    - Consultation spécialiste           30,00 €    │   │
│  │ ☑ CDQP002 - Audiométrie tonale et vocale    26,88 €    │   │
│  │ ☐ CDQP001 - Impédancemétrie                 24,32 €    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔍 Ajouter un acte...                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  Secteur 2 - Dépassement :                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Dépassement honoraires :              [ 30,00 € ]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                            Total base :      56,88 €    │   │
│  │                            Dépassement :     30,00 €    │   │
│  │                            ─────────────────────────    │   │
│  │                            TOTAL :           86,88 €    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Structure attendue

```
src/
├── app/
│   └── api/
│       └── codage/
│           ├── ngap/
│           │   └── route.ts
│           ├── ccam/
│           │   └── route.ts
│           └── suggest/
│               └── route.ts
├── components/
│   └── consultation/
│       └── codage-panel.tsx
├── lib/
│   ├── constants/
│   │   ├── ngap-codes.ts
│   │   └── ccam-codes.ts
│   └── prompts/
│       └── codage-suggestion.ts
└── types/
    └── codage.ts           # Types complets
```

---

## Types Codage

```typescript
interface ActeFacturable {
  type: 'NGAP' | 'CCAM';
  code: string;
  libelle: string;
  tarif_base: number;
  modificateurs?: string[];
  coefficient?: number;
}

interface CodageConsultation {
  actes: ActeFacturable[];
  total_base: number;
  depassement: number;
  total_honoraires: number;
}
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Bases NGAP et CCAM créées
- [ ] `GET /api/codage/ngap` retourne la liste
- [ ] `GET /api/codage/ccam?q=audio` retourne des résultats
- [ ] `POST /api/codage/suggest` suggère des actes depuis CRC
- [ ] Composant affiche les suggestions
- [ ] Sélection/désélection des actes
- [ ] Calcul total automatique
- [ ] Gestion dépassement secteur 2
- [ ] Recherche et ajout manuel d'actes

---

## Notes importantes

> ⚠️ Le praticien peut toujours modifier les suggestions — l'IA assiste mais ne décide pas.

> Le dépassement est saisi manuellement (variable selon praticien et acte).

> Pour une V1, on ne gère pas les règles d'association complexes (100%, 50%, etc.) — ce sera pour le bloc opératoire.

---

## Prochain bloc

**[BLOC 4.1]** — Types + API Consultation (FHIR Encounter)
