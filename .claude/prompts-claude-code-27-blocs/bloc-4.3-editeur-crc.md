# [BLOC 4.3] — Éditeur CRC avec Sections

**Bloc** : 4.3 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Bloc 4.2 terminé

---

## Contexte

La page consultation est créée (bloc 4.2). Nous devons maintenant améliorer l'éditeur CRC pour permettre une édition section par section.

---

## Objectif de ce bloc

Créer un éditeur CRC professionnel avec sections repliables/dépliables, édition inline, et aperçu.

---

## Pré-requis

- [ ] Bloc 4.2 terminé
- [ ] CRC généré disponible

---

## Spécifications

### Ce qui doit être créé

1. **Éditeur CRC** (`components/consultation/crc-editor.tsx`) :
   - Sections repliables
   - Édition inline par section
   - Indicateur modifications

2. **Section CRC** (`components/consultation/crc-section.tsx`) :
   - Titre + contenu
   - Mode lecture / édition
   - Actions (éditer, réinitialiser)

3. **Aperçu CRC** (`components/consultation/crc-preview.tsx`) :
   - Vue document final
   - Format impression

---

## Design Éditeur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COMPTE-RENDU DE CONSULTATION                          [ 👁 Aperçu ]       │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ▼ MOTIF DE CONSULTATION                                           ✏️     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Hypoacousie bilatérale progressive                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ▼ HISTOIRE DE LA MALADIE                                          ✏️     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Patient de 58 ans consultant pour une baisse d'audition            │   │
│  │ bilatérale progressive depuis 6 mois, plus marquée à droite.       │   │
│  │ Il rapporte des acouphènes à type de sifflement intermittent.      │   │
│  │ Pas de vertige ni d'otorrhée. [Édition en cours...]                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ▶ EXAMEN CLINIQUE                                                 ✏️     │
│    (cliquer pour déplier)                                                  │
│                                                                             │
│  ▶ EXAMENS COMPLÉMENTAIRES                                         ✏️     │
│                                                                             │
│  ▼ DIAGNOSTIC                                                      ✏️     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Surdité de perception bilatérale, prédominant sur les fréquences   │   │
│  │ aiguës, compatible avec une presbyacousie.                         │   │
│  │ Acouphènes bilatéraux associés.                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ▼ CONDUITE À TENIR                                                ✏️     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ • Bilan IRM des conduits auditifs internes                         │   │
│  │ • Consultation appareillage auditif si IRM normale                 │   │
│  │ • Contrôle dans 3 mois avec résultats                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ▼ CONCLUSION                                                      ✏️     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Presbyacousie bilatérale. Bilan IRM prescrit pour éliminer         │   │
│  │ pathologie rétrocochléaire. Orientation vers audioprothésiste      │   │
│  │ envisagée selon résultats.                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                            Dernière modification: 14:32    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Sections CRC

| Section | Champ CRC | Obligatoire |
|---------|-----------|-------------|
| Motif | `motif` | ✅ |
| Histoire de la maladie | `histoire` | ✅ |
| Examen clinique | `examen.*` | ✅ |
| Examens complémentaires | `examens_complementaires` | ❌ |
| Diagnostic | `diagnostic` | ✅ |
| Conduite à tenir | `conduite` | ✅ |
| Conclusion | `conclusion` | ✅ |

---

## Interface Composant

```typescript
interface CRCEditorProps {
  crc: CRCGenerated;
  onChange: (crc: CRCGenerated) => void;
  readOnly?: boolean;
}

interface CRCSectionProps {
  title: string;
  content: string;
  onChange: (content: string) => void;
  expanded?: boolean;
  onToggle?: () => void;
  readOnly?: boolean;
}
```

---

## Structure attendue

```
src/
└── components/
    └── consultation/
        ├── crc-editor.tsx
        ├── crc-section.tsx
        ├── crc-preview.tsx
        └── crc-examen-section.tsx    # Section spéciale pour examen
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Toutes les sections s'affichent
- [ ] Sections repliables/dépliables
- [ ] Édition inline par section
- [ ] Auto-save sur modification
- [ ] Aperçu document fonctionne
- [ ] Section Examen affiche les sous-sections
- [ ] Indicateur "modifié" si changement

---

## Notes importantes

> ⚠️ L'examen clinique a des sous-sections (otoscopie droite, gauche, etc.) à afficher de manière structurée.

> L'aperçu doit ressembler au format PDF final.

> Penser à la validation : ne pas permettre de terminer si sections obligatoires vides.

---

## Prochain bloc

**[BLOC 4.4]** — Page Détail Consultation
