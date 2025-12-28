# [BLOC 2.2] — Composant Enregistrement Audio

**Bloc** : 2.2 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Bloc 2.1 terminé

---

## Contexte

Le client AssemblyAI est prêt (bloc 2.1). Nous devons maintenant créer le composant d'interface pour capturer l'audio du microphone et l'envoyer en streaming.

---

## Objectif de ce bloc

Créer le composant DictationRecorder qui capture l'audio du microphone, l'envoie à AssemblyAI, et affiche les contrôles d'enregistrement.

---

## Pré-requis

- [ ] Bloc 2.1 terminé
- [ ] Hook useAssemblyAIRealtime disponible

---

## Spécifications

### Ce qui doit être créé

1. **Hook Audio** (`lib/hooks/use-audio-recorder.ts`) :
   - Accès microphone (getUserMedia)
   - Capture audio en chunks
   - Conversion au format requis (PCM 16kHz)

2. **Composant Recorder** (`components/consultation/dictation-recorder.tsx`) :
   - Bouton Start/Stop
   - Indicateur visuel enregistrement
   - Timer durée
   - Indicateur niveau audio (optionnel)
   - Gestion permission micro

3. **Store Dictation** (`lib/stores/dictation-store.ts`) :
   - État enregistrement (idle, recording, paused)
   - Durée enregistrement
   - Erreurs

---

## Interface Composant

```typescript
interface DictationRecorderProps {
  onTranscriptionUpdate?: (text: string) => void;
  onTranscriptionComplete?: (text: string) => void;
  disabled?: boolean;
}
```

---

## États du Recorder

| État | Affichage | Actions disponibles |
|------|-----------|---------------------|
| `idle` | Bouton "Démarrer" | Start |
| `requesting` | "Autorisation micro..." | - |
| `recording` | Timer + animation | Stop, Pause |
| `paused` | Timer (figé) | Resume, Stop |
| `error` | Message erreur | Retry |

---

## Design Composant

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  État IDLE:                                                │
│  ┌─────────────────────────────────────┐                   │
│  │                                     │                   │
│  │       🎤  Démarrer la dictée        │                   │
│  │                                     │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  État RECORDING:                                           │
│  ┌─────────────────────────────────────┐                   │
│  │  ●  Enregistrement en cours         │                   │
│  │     02:34                           │                   │
│  │                                     │                   │
│  │  [ ⏸ Pause ]     [ ⏹ Terminer ]    │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  État ERROR:                                               │
│  ┌─────────────────────────────────────┐                   │
│  │  ⚠️  Microphone non accessible      │                   │
│  │                                     │                   │
│  │      [ Réessayer ]                  │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Audio

```typescript
const audioConfig = {
  sampleRate: 16000,          // 16kHz requis par AssemblyAI
  channelCount: 1,            // Mono
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};
```

---

## Structure attendue

```
src/
├── components/
│   └── consultation/
│       └── dictation-recorder.tsx
└── lib/
    ├── hooks/
    │   └── use-audio-recorder.ts
    └── stores/
        └── dictation-store.ts
```

---

## Flow Enregistrement

```
┌─────────────┐     getUserMedia      ┌─────────────┐
│    User     │──────────────────────▶│  Microphone │
│   clicks    │                       │             │
│   Start     │                       └──────┬──────┘
└─────────────┘                              │
                                             │ Audio Stream
                                             ▼
                                    ┌─────────────────┐
                                    │ AudioWorklet /  │
                                    │ ScriptProcessor │
                                    └────────┬────────┘
                                             │
                                             │ PCM chunks (every 100ms)
                                             ▼
                                    ┌─────────────────┐
                                    │ useAssemblyAI   │
                                    │ sendAudio()     │
                                    └────────┬────────┘
                                             │
                                             │ WebSocket
                                             ▼
                                    ┌─────────────────┐
                                    │   AssemblyAI    │
                                    │    Realtime     │
                                    └─────────────────┘
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Clic "Démarrer" demande permission microphone
- [ ] Permission accordée → enregistrement démarre
- [ ] Permission refusée → message erreur
- [ ] Timer s'incrémente pendant enregistrement
- [ ] Indicateur visuel (point rouge) pendant enregistrement
- [ ] Pause arrête l'envoi (mais garde la connexion)
- [ ] Stop termine l'enregistrement et déconnecte
- [ ] L'audio est bien envoyé à AssemblyAI (vérifier logs)

---

## Notes importantes

> ⚠️ Utiliser AudioWorklet si supporté (moderne), sinon ScriptProcessorNode (legacy).

> L'audio doit être converti en PCM 16-bit à 16kHz avant envoi.

> Envoyer des chunks toutes les 100-250ms pour un bon équilibre latence/efficacité.

> Tester sur différents navigateurs (Chrome, Firefox, Safari).

---

## Prochain bloc

**[BLOC 2.3]** — Affichage Transcription Temps Réel
