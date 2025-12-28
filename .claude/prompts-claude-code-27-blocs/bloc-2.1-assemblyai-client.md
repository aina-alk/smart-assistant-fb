# [BLOC 2.1] — Client AssemblyAI + WebSocket

**Bloc** : 2.1 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Bloc 1 terminé

---

## Contexte

Le module Patient est complet (bloc 1). Nous commençons maintenant le module de transcription vocale qui permettra aux praticiens de dicter leurs comptes-rendus.

---

## Objectif de ce bloc

Créer le client AssemblyAI pour la transcription temps réel via WebSocket, avec gestion de session et récupération des transcriptions.

---

## Pré-requis

- [ ] Bloc 1 terminé
- [ ] Compte AssemblyAI créé
- [ ] API Key AssemblyAI configurée

---

## Spécifications

### Ce qui doit être créé

1. **Client AssemblyAI** (`lib/api/assemblyai-client.ts`) :
   - Obtention token temporaire pour WebSocket
   - Configuration transcription (langue FR, etc.)

2. **API Route Token** (`app/api/transcription/token/route.ts`) :
   - Génère un token temporaire pour le client
   - Protégée par authentification

3. **Types Transcription** (`types/transcription.ts`) :
   - `TranscriptionSession`
   - `TranscriptionResult` (partial et final)
   - `TranscriptionConfig`

4. **Hook WebSocket** (`lib/hooks/use-assemblyai-realtime.ts`) :
   - Connexion WebSocket
   - Envoi audio
   - Réception transcriptions
   - Gestion reconnexion

---

## Configuration AssemblyAI

```typescript
const config = {
  language_code: 'fr',              // Français
  sample_rate: 16000,               // 16kHz
  encoding: 'pcm_s16le',            // PCM 16-bit
  word_boost: [                     // Vocabulaire médical ORL
    'otoscopie',
    'rhinoscopie',
    'audiométrie',
    'tympan',
    'acouphènes',
    // ... autres termes
  ],
};
```

---

## Interface Hook

```typescript
interface UseAssemblyAIRealtimeReturn {
  // État
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  
  // Transcription
  partialTranscript: string;        // Texte en cours (non finalisé)
  finalTranscript: string;          // Texte finalisé complet
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  reset: () => void;                // Remet à zéro les transcripts
}
```

---

## Flow WebSocket

```
┌─────────────┐     POST /token      ┌─────────────┐
│   Client    │─────────────────────▶│   API Route │
│   (React)   │◀─────────────────────│   Next.js   │
└──────┬──────┘    { token }         └──────┬──────┘
       │                                    │
       │                                    │ GET token
       │                                    ▼
       │                             ┌─────────────┐
       │                             │ AssemblyAI  │
       │                             │     API     │
       │                             └─────────────┘
       │
       │ WebSocket wss://api.assemblyai.com/v2/realtime/ws
       │
       ▼
┌─────────────┐
│ AssemblyAI  │
│  Realtime   │
│  WebSocket  │
└─────────────┘
       │
       │ Messages JSON :
       │ - SessionBegins
       │ - PartialTranscript
       │ - FinalTranscript
       │ - SessionTerminated
       ▼
```

---

## Structure attendue

```
src/
├── app/
│   └── api/
│       └── transcription/
│           └── token/
│               └── route.ts
├── lib/
│   ├── api/
│   │   └── assemblyai-client.ts
│   └── hooks/
│       └── use-assemblyai-realtime.ts
└── types/
    └── transcription.ts
```

---

## Vocabulaire médical ORL (word_boost)

```typescript
const ORL_VOCABULARY = [
  // Anatomie
  'tympan', 'pavillon', 'conduit auditif', 'cochlée', 'vestibule',
  'sinus', 'fosses nasales', 'cornet', 'cloison nasale', 'septum',
  'pharynx', 'larynx', 'amygdales', 'végétations', 'luette',
  
  // Examens
  'otoscopie', 'rhinoscopie', 'nasofibroscopie', 'audiométrie',
  'impédancemétrie', 'tympanométrie', 'PEA', 'vidéonystagmographie',
  
  // Pathologies
  'otite', 'cholestéatome', 'otospongiose', 'presbyacousie',
  'acouphènes', 'vertiges', 'Ménière', 'neurinome',
  'rhinite', 'sinusite', 'polypose', 'déviation septale',
  'angine', 'pharyngite', 'laryngite', 'dysphonie',
  
  // Traitements
  'paracentèse', 'aérateur', 'tympanoplastie', 'mastoïdectomie',
  'septoplastie', 'turbinoplastie', 'méatotomie',
  'amygdalectomie', 'adénoïdectomie',
];
```

---

## Validation

Ce bloc est terminé quand :

- [ ] `POST /api/transcription/token` retourne un token valide
- [ ] Le hook se connecte au WebSocket AssemblyAI
- [ ] L'envoi d'audio (simulé) ne génère pas d'erreur
- [ ] Les messages PartialTranscript sont reçus
- [ ] Les messages FinalTranscript sont reçus et accumulés
- [ ] La déconnexion fonctionne proprement
- [ ] La reconnexion automatique fonctionne après perte de connexion
- [ ] Les erreurs sont gérées et exposées

---

## Notes importantes

> ⚠️ AssemblyAI Real-time attend de l'audio en base64. Le hook sendAudio doit encoder l'ArrayBuffer en base64.

> Le token temporaire a une durée limitée. Gérer l'expiration.

> En cas d'erreur WebSocket, tenter une reconnexion automatique (max 3 essais).

---

## Prochain bloc

**[BLOC 2.2]** — Composant Enregistrement Audio
