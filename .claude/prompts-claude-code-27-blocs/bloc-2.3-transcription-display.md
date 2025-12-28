# [BLOC 2.3] — Affichage Transcription Temps Réel

**Bloc** : 2.3 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Blocs 2.1 et 2.2 terminés

---

## Contexte

L'enregistrement audio fonctionne (bloc 2.2). Nous devons maintenant afficher la transcription en temps réel pendant que l'utilisateur dicte.

---

## Objectif de ce bloc

Créer le composant d'affichage de la transcription avec distinction partiel/final, auto-scroll, et possibilité d'édition.

---

## Pré-requis

- [ ] Blocs 2.1 et 2.2 terminés
- [ ] Transcription reçue via WebSocket

---

## Spécifications

### Ce qui doit être créé

1. **Composant Affichage** (`components/consultation/transcription-display.tsx`) :
   - Zone de texte scrollable
   - Texte final en noir
   - Texte partiel en gris/italique
   - Auto-scroll vers le bas
   - Mode édition optionnel

2. **Store Transcription** (`lib/stores/transcription-store.ts`) :
   - finalTranscript (texte validé)
   - partialTranscript (texte en cours)
   - Actions : append, reset, edit

3. **Intégration** avec le recorder :
   - Les deux composants communiquent via le store
   - Composition dans un parent

---

## Interface Composant

```typescript
interface TranscriptionDisplayProps {
  finalText: string;
  partialText: string;
  editable?: boolean;
  onEdit?: (text: string) => void;
  className?: string;
}
```

---

## Design Composant

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  TRANSCRIPTION                                    [ ✏️ Éditer ] │
│  ───────────────────────────────────────────────────────────── │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  Patient de 58 ans qui consulte pour une baisse          │ │
│  │  d'audition progressive bilatérale depuis 6 mois,        │ │
│  │  plus marquée à droite. Il rapporte des acouphènes       │ │
│  │  à type de sifflement intermittent. Pas de vertige.      │ │
│  │                                                           │ │
│  │  L'examen otoscopique retrouve des tympans normaux       │ │
│  │  des deux côtés. L'audiométrie montre une surdité de     │ │
│  │  perception bilatérale prédominant sur les aigus...      │ │
│  │                                                           │ │
│  │  _Je prescris un bilan complémentaire avec IRM..._       │ │  ← Italique gris (partiel)
│  │  ▌                                                        │ │  ← Curseur clignotant
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  📝 352 mots  •  ⏱ 02:34 de dictée                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Comportements

| Action | Résultat |
|--------|----------|
| Nouveau final | Ajouté au texte, partial reset |
| Nouveau partial | Remplace l'ancien partial |
| Clic "Éditer" | Textarea éditable |
| Scroll manuel | Désactive auto-scroll |
| Nouveau texte | Réactive auto-scroll |

---

## Structure attendue

```
src/
├── components/
│   └── consultation/
│       ├── transcription-display.tsx
│       └── dictation-panel.tsx       # Combine recorder + display
└── lib/
    └── stores/
        └── transcription-store.ts
```

---

## Store Transcription

```typescript
interface TranscriptionState {
  finalTranscript: string;
  partialTranscript: string;
  wordCount: number;
  isEditing: boolean;
}

interface TranscriptionActions {
  appendFinal: (text: string) => void;
  setPartial: (text: string) => void;
  reset: () => void;
  setEditing: (editing: boolean) => void;
  updateFinal: (text: string) => void;
}
```

---

## Composant combiné DictationPanel

```tsx
// Ce composant combine le recorder et l'affichage
export function DictationPanel({ onComplete }: { onComplete: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <TranscriptionDisplay />
      <DictationRecorder />
      <Button onClick={() => onComplete(transcript)}>
        Générer le compte-rendu
      </Button>
    </div>
  );
}
```

---

## Validation

Ce bloc est terminé quand :

- [ ] La transcription s'affiche en temps réel
- [ ] Texte final en noir, texte partiel en gris italique
- [ ] Auto-scroll fonctionne
- [ ] Compteur de mots à jour
- [ ] Mode édition permet de corriger le texte
- [ ] Le store conserve la transcription après arrêt
- [ ] Reset vide la transcription
- [ ] Composant DictationPanel intègre les deux

---

## Notes importantes

> ⚠️ Le partial transcript doit être visuellement distinct (gris + italique) pour que l'utilisateur comprenne qu'il peut encore changer.

> L'auto-scroll ne doit pas être intrusif : si l'utilisateur scroll manuellement vers le haut, ne pas le forcer à redescendre.

> Penser à l'accessibilité : aria-live pour annoncer les nouvelles transcriptions.

---

## Prochain bloc

**[BLOC 3.1]** — Client Claude API + Prompts CRC
