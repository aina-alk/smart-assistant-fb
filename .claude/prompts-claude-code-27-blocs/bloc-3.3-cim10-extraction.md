# [BLOC 3.3] — Extraction Diagnostics CIM-10

**Bloc** : 3.3 / 27  
**Durée estimée** : 35 min  
**Dépendances** : Bloc 3.2 terminé

---

## Contexte

La génération CRC fonctionne (bloc 3.2). Nous devons maintenant ajouter l'extraction automatique des codes diagnostics CIM-10 depuis le CRC.

---

## Objectif de ce bloc

Créer le système d'extraction et suggestion de codes CIM-10 pertinents basés sur le diagnostic du CRC.

---

## Pré-requis

- [ ] Bloc 3.2 terminé
- [ ] CRC généré disponible

---

## Spécifications

### Ce qui doit être créé

1. **Base CIM-10 ORL** (`lib/constants/cim10-codes.ts`) :
   - Liste des codes CIM-10 courants en ORL
   - Structure : code, libellé, catégorie
   - ~200 codes les plus fréquents

2. **Prompt extraction** (`lib/prompts/diagnostic-extraction.ts`) :
   - System prompt pour extraction CIM-10
   - Template avec contexte CRC

3. **API Route** (`app/api/codage/cim10/route.ts`) :
   - GET : recherche codes par terme
   - POST : suggestion codes depuis CRC

4. **Composant Sélection** (`components/consultation/diagnostic-selector.tsx`) :
   - Affiche suggestions IA
   - Recherche manuelle
   - Sélection principal vs secondaires

---

## Structure Code CIM-10

```typescript
interface CIM10Code {
  code: string;           // Ex: "H90.3"
  libelle: string;        // Ex: "Surdité de perception bilatérale"
  libelle_court: string;  // Ex: "Surdité perception bilat."
  categorie: string;      // Ex: "Maladies de l'oreille"
  frequence?: number;     // Score usage (pour tri)
}

interface DiagnosticSelection {
  principal: CIM10Code;
  secondaires: CIM10Code[];
}
```

---

## Codes CIM-10 ORL Courants

```typescript
const CIM10_ORL: CIM10Code[] = [
  // Oreille (H60-H95)
  { code: 'H60.9', libelle: 'Otite externe, sans précision', categorie: 'Oreille' },
  { code: 'H65.9', libelle: 'Otite moyenne non suppurée, sans précision', categorie: 'Oreille' },
  { code: 'H66.9', libelle: 'Otite moyenne suppurée, sans précision', categorie: 'Oreille' },
  { code: 'H72.9', libelle: 'Perforation du tympan, sans précision', categorie: 'Oreille' },
  { code: 'H80.0', libelle: 'Otospongiose de la fenêtre ovale', categorie: 'Oreille' },
  { code: 'H81.0', libelle: 'Maladie de Ménière', categorie: 'Oreille' },
  { code: 'H81.1', libelle: 'Vertige paroxystique bénin', categorie: 'Oreille' },
  { code: 'H83.3', libelle: 'Effets du bruit sur l\'oreille interne', categorie: 'Oreille' },
  { code: 'H90.3', libelle: 'Surdité de perception bilatérale', categorie: 'Oreille' },
  { code: 'H90.5', libelle: 'Surdité de perception, sans précision', categorie: 'Oreille' },
  { code: 'H91.1', libelle: 'Presbyacousie', categorie: 'Oreille' },
  { code: 'H93.1', libelle: 'Acouphènes', categorie: 'Oreille' },
  
  // Nez et sinus (J00-J39)
  { code: 'J00', libelle: 'Rhinopharyngite aiguë (rhume)', categorie: 'Nez' },
  { code: 'J01.9', libelle: 'Sinusite aiguë, sans précision', categorie: 'Nez' },
  { code: 'J30.1', libelle: 'Rhinite allergique due au pollen', categorie: 'Nez' },
  { code: 'J30.4', libelle: 'Rhinite allergique, sans précision', categorie: 'Nez' },
  { code: 'J31.0', libelle: 'Rhinite chronique', categorie: 'Nez' },
  { code: 'J32.9', libelle: 'Sinusite chronique, sans précision', categorie: 'Nez' },
  { code: 'J33.0', libelle: 'Polype des fosses nasales', categorie: 'Nez' },
  { code: 'J34.2', libelle: 'Déviation de la cloison nasale', categorie: 'Nez' },
  { code: 'J34.3', libelle: 'Hypertrophie des cornets', categorie: 'Nez' },
  { code: 'R04.0', libelle: 'Épistaxis', categorie: 'Nez' },
  
  // Gorge (J02-J06, J35-J39)
  { code: 'J02.9', libelle: 'Pharyngite aiguë, sans précision', categorie: 'Gorge' },
  { code: 'J03.9', libelle: 'Amygdalite aiguë, sans précision', categorie: 'Gorge' },
  { code: 'J06.9', libelle: 'Infection aiguë des voies respiratoires supérieures', categorie: 'Gorge' },
  { code: 'J35.0', libelle: 'Amygdalite chronique', categorie: 'Gorge' },
  { code: 'J35.1', libelle: 'Hypertrophie des amygdales', categorie: 'Gorge' },
  { code: 'J35.2', libelle: 'Hypertrophie des végétations adénoïdes', categorie: 'Gorge' },
  { code: 'J35.3', libelle: 'Hypertrophie des amygdales avec hypertrophie des végétations', categorie: 'Gorge' },
  { code: 'J37.0', libelle: 'Laryngite chronique', categorie: 'Gorge' },
  { code: 'J38.0', libelle: 'Paralysie des cordes vocales', categorie: 'Gorge' },
  { code: 'J38.1', libelle: 'Polype des cordes vocales', categorie: 'Gorge' },
  { code: 'J38.2', libelle: 'Nodules des cordes vocales', categorie: 'Gorge' },
  { code: 'R49.0', libelle: 'Dysphonie', categorie: 'Gorge' },
  
  // ... plus de codes à ajouter
];
```

---

## Prompt Extraction CIM-10

```typescript
const CIM10_EXTRACTION_PROMPT = `Tu es un expert en codage médical CIM-10.

TÂCHE:
Extraire les codes CIM-10 appropriés depuis un diagnostic médical ORL.

RÈGLES:
1. Suggérer 1 diagnostic PRINCIPAL (le plus pertinent)
2. Suggérer 0 à 3 diagnostics SECONDAIRES si pertinents
3. Ne suggérer QUE des codes existants dans la CIM-10
4. Prioriser les codes les plus spécifiques
5. Si le diagnostic est vague, suggérer le code "sans précision"

FORMAT DE SORTIE (JSON):
{
  "principal": { "code": "H90.3", "libelle": "Surdité de perception bilatérale" },
  "secondaires": [
    { "code": "H93.1", "libelle": "Acouphènes" }
  ],
  "confiance": 0.85,
  "notes": "string optionnel si ambiguïté"
}
`;
```

---

## Structure attendue

```
src/
├── app/
│   └── api/
│       └── codage/
│           └── cim10/
│               └── route.ts
├── components/
│   └── consultation/
│       └── diagnostic-selector.tsx
├── lib/
│   ├── constants/
│   │   └── cim10-codes.ts
│   └── prompts/
│       └── diagnostic-extraction.ts
└── types/
    └── codage.ts             # Ajouter types CIM-10
```

---

## Design Composant

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  DIAGNOSTICS CIM-10                                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Suggestions IA :                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ★ H90.3 - Surdité de perception bilatérale   [Principal]│   │
│  │   H93.1 - Acouphènes                         [ Ajouter ]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Sélectionnés :                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔴 H90.3 - Surdité de perception bilatérale (Principal) │   │
│  │ 🔵 H93.1 - Acouphènes                        [Retirer]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔍 Rechercher un code CIM-10...                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Base CIM-10 ORL créée (~200 codes)
- [ ] `GET /api/codage/cim10?q=surdite` retourne des résultats
- [ ] `POST /api/codage/cim10` avec diagnostic extrait des codes
- [ ] Composant affiche suggestions IA
- [ ] Recherche manuelle fonctionne
- [ ] Sélection principal/secondaires fonctionne
- [ ] Les codes sélectionnés sont validés

---

## Notes importantes

> ⚠️ La base CIM-10 locale sert pour la recherche rapide. Claude suggère les codes mais on valide qu'ils existent dans notre base.

> Si Claude suggère un code invalide, l'ignorer et logger pour amélioration.

> Penser à la latéralité : certains codes ont des variantes gauche/droite.

---

## Prochain bloc

**[BLOC 3.4]** — Suggestion Codage NGAP/CCAM
