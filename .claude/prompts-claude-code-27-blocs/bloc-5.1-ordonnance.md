# [BLOC 5.1] — Génération Ordonnance

**Bloc** : 5.1 / 27  
**Durée estimée** : 35 min  
**Dépendances** : Bloc 4 terminé

---

## Contexte

Le module consultation est complet (bloc 4). Nous devons maintenant permettre la génération de documents, en commençant par les ordonnances.

---

## Objectif de ce bloc

Créer le système de génération d'ordonnances avec extraction IA des médicaments depuis le CRC et formulaire d'édition.

---

## Pré-requis

- [ ] Bloc 4 terminé
- [ ] CRC avec "conduite à tenir" disponible

---

## Spécifications

### Ce qui doit être créé

1. **Prompt extraction médicaments** (`lib/prompts/prescription-extraction.ts`) :
   - Analyse "conduite à tenir" du CRC
   - Extrait médicaments, posologie, durée

2. **Types Ordonnance** (`types/ordonnance.ts`) :
   - `Medicament`
   - `Ordonnance`
   - `OrdonnanceFormData`

3. **API Route** (`app/api/ordonnances/route.ts`) :
   - POST : extraction + génération
   - GET : liste par consultation

4. **Composant Éditeur** (`components/documents/ordonnance-editor.tsx`) :
   - Liste médicaments éditable
   - Ajout/suppression/modification
   - Aperçu ordonnance

5. **Dialog Ordonnance** (`components/documents/ordonnance-dialog.tsx`) :
   - Modal de création depuis consultation

---

## Types Ordonnance

```typescript
interface Medicament {
  nom: string;              // Ex: "AUGMENTIN 1g"
  forme: string;            // Ex: "comprimé"
  posologie: string;        // Ex: "1 comprimé matin et soir"
  duree: string;            // Ex: "7 jours"
  quantite?: number;        // Ex: 14 (pour dispensation)
  instructions?: string;    // Ex: "À prendre pendant les repas"
}

interface Ordonnance {
  id: string;
  consultationId: string;
  patientId: string;
  date: Date;
  medicaments: Medicament[];
  commentaire?: string;
  createdAt: Date;
}
```

---

## Prompt Extraction

```typescript
const PRESCRIPTION_EXTRACTION_PROMPT = `Tu es un assistant médical expert en pharmacologie.

TÂCHE:
Extraire les prescriptions médicamenteuses depuis un texte médical.

RÈGLES:
1. Extraire uniquement les médicaments explicitement mentionnés
2. Déduire la posologie si non précisée (dose usuelle)
3. Ne jamais inventer de médicaments non mentionnés
4. Signaler si informations incomplètes

FORMAT DE SORTIE (JSON):
{
  "medicaments": [
    {
      "nom": "AUGMENTIN 1g",
      "forme": "comprimé",
      "posologie": "1 comprimé matin et soir",
      "duree": "7 jours",
      "quantite": 14,
      "instructions": "À prendre pendant les repas"
    }
  ],
  "notes": "string optionnel si ambiguïté"
}
`;
```

---

## Design Éditeur Ordonnance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ORDONNANCE                                              [ + Ajouter ]      │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ AUGMENTIN 1g comprimé                                       [🗑️]   │   │
│  │ 1 comprimé matin et soir pendant 7 jours                           │   │
│  │ Quantité: 14 | À prendre pendant les repas                         │   │
│  │                                                         [✏️ Éditer]│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ NASONEX 50µg spray nasal                                    [🗑️]   │   │
│  │ 2 pulvérisations dans chaque narine le matin pendant 1 mois        │   │
│  │ Quantité: 1 flacon                                                 │   │
│  │                                                         [✏️ Éditer]│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Commentaire pour le pharmacien:                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                              [ Annuler ]  [ Générer PDF ]                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Structure attendue

```
src/
├── app/
│   └── api/
│       └── ordonnances/
│           ├── route.ts
│           └── [id]/
│               └── route.ts
├── components/
│   └── documents/
│       ├── ordonnance-editor.tsx
│       ├── ordonnance-dialog.tsx
│       └── medicament-form.tsx
├── lib/
│   └── prompts/
│       └── prescription-extraction.ts
└── types/
    └── ordonnance.ts
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Extraction médicaments depuis CRC fonctionne
- [ ] Dialog s'ouvre avec médicaments pré-remplis
- [ ] Ajout/modification/suppression médicaments
- [ ] Formulaire médicament valide les champs
- [ ] Ordonnance sauvegardée en base
- [ ] Bouton "Générer PDF" prêt (PDF au bloc 5.3)

---

## Notes importantes

> ⚠️ L'IA suggère mais le praticien valide — toujours permettre l'édition.

> La quantité à délivrer doit être calculée automatiquement si possible.

> Ne pas oublier les médicaments hors AMM ou préparations magistrales (champ libre).

---

## Prochain bloc

**[BLOC 5.2]** — Génération Bilan / Prescription Examens
