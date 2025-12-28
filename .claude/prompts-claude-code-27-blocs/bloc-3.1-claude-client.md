# [BLOC 3.1] — Client Claude API + Prompts CRC

**Bloc** : 3.1 / 27  
**Durée estimée** : 30 min  
**Dépendances** : Bloc 2 terminé

---

## Contexte

La transcription vocale fonctionne (bloc 2). Nous devons maintenant intégrer Claude pour transformer la transcription brute en compte-rendu médical structuré.

---

## Objectif de ce bloc

Créer le client Anthropic et les prompts système optimisés pour la génération de CRC (Compte-Rendu de Consultation) ORL.

---

## Pré-requis

- [ ] Bloc 2 terminé
- [ ] API Key Anthropic configurée
- [ ] Transcription disponible

---

## Spécifications

### Ce qui doit être créé

1. **Client Claude** (`lib/api/claude-client.ts`) :
   - Initialisation Anthropic SDK
   - Fonction de génération avec streaming
   - Gestion des erreurs et retry

2. **Prompts CRC** (`lib/prompts/crc-generation.ts`) :
   - System prompt médical ORL
   - Template de génération CRC
   - Instructions de formatage

3. **Types Génération** (`types/generation.ts`) :
   - `CRCGenerated`
   - `GenerationOptions`
   - `StreamingCallbacks`

---

## Dépendance à installer

```bash
pnpm add @anthropic-ai/sdk
```

---

## System Prompt Médical

```typescript
const CRC_SYSTEM_PROMPT = `Tu es un assistant médical expert en ORL (Oto-Rhino-Laryngologie), spécialisé dans la rédaction de comptes-rendus de consultation.

RÔLE:
Tu transformes des dictées médicales en comptes-rendus de consultation structurés et professionnels.

RÈGLES:
1. Utiliser un vocabulaire médical précis et approprié
2. Structurer le CRC selon le format standard français
3. Être concis mais complet
4. Ne jamais inventer d'informations non mentionnées dans la dictée
5. Signaler les informations manquantes importantes avec [À compléter]
6. Utiliser le vouvoiement pour le patient ("Le patient présente...")
7. Écrire au présent de l'indicatif

FORMAT DE SORTIE:
Tu dois répondre UNIQUEMENT en JSON valide avec la structure suivante:
{
  "motif": "string - motif de consultation en une phrase",
  "histoire": "string - histoire de la maladie, antécédents pertinents",
  "examen": {
    "otoscopie_droite": "string ou null",
    "otoscopie_gauche": "string ou null", 
    "rhinoscopie": "string ou null",
    "oropharynx": "string ou null",
    "palpation_cervicale": "string ou null",
    "autres": "string ou null"
  },
  "examens_complementaires": "string ou null - examens réalisés/prescrits",
  "diagnostic": "string - diagnostic principal et secondaires",
  "conduite": "string - conduite à tenir, traitement, suivi",
  "conclusion": "string - synthèse en 2-3 phrases"
}

SPÉCIALITÉS ORL COUVERTES:
- Otologie: oreille, audition, vertiges
- Rhinologie: nez, sinus
- Laryngologie: gorge, voix, déglutition
- Cervico-faciale: cou, glandes salivaires
`;
```

---

## Interface Client

```typescript
interface ClaudeClientOptions {
  model?: string;           // Default: claude-sonnet-4-20250514
  maxTokens?: number;       // Default: 4096
  temperature?: number;     // Default: 0.3 (plus déterministe)
}

interface GenerateCRCOptions {
  transcription: string;
  patientContext?: {
    age?: number;
    sexe?: 'M' | 'F';
    antecedents?: string;
  };
  onStream?: (chunk: string) => void;
}

async function generateCRC(options: GenerateCRCOptions): Promise<CRCGenerated>;
```

---

## Structure CRC Généré

```typescript
interface CRCGenerated {
  motif: string;
  histoire: string;
  examen: {
    otoscopie_droite: string | null;
    otoscopie_gauche: string | null;
    rhinoscopie: string | null;
    oropharynx: string | null;
    palpation_cervicale: string | null;
    autres: string | null;
  };
  examens_complementaires: string | null;
  diagnostic: string;
  conduite: string;
  conclusion: string;
}
```

---

## Structure attendue

```
src/
├── lib/
│   ├── api/
│   │   └── claude-client.ts
│   └── prompts/
│       ├── crc-generation.ts
│       └── system-prompts.ts
└── types/
    └── generation.ts
```

---

## Exemple d'utilisation

```typescript
const transcription = `Patient de 58 ans qui consulte pour une baisse 
d'audition bilatérale depuis 6 mois. Acouphènes type sifflement. 
Pas de vertige. Otoscopie: tympans normaux. Audiométrie: surdité 
de perception bilatérale sur les aigus...`;

const crc = await generateCRC({
  transcription,
  patientContext: { age: 58, sexe: 'M' },
  onStream: (chunk) => console.log(chunk),
});

// Résultat: CRCGenerated structuré
```

---

## Validation

Ce bloc est terminé quand :

- [ ] Client Anthropic initialisé correctement
- [ ] Génération CRC depuis transcription test fonctionne
- [ ] Le JSON retourné est valide et parseable
- [ ] Toutes les sections du CRC sont présentes
- [ ] Le streaming fonctionne (callback appelé)
- [ ] Les erreurs API sont gérées (rate limit, etc.)
- [ ] Temps de génération < 30 secondes

---

## Notes importantes

> ⚠️ Utiliser `claude-sonnet-4-20250514` pour le meilleur rapport qualité/coût.

> Temperature basse (0.3) pour des résultats plus déterministes et professionnels.

> Le prompt insiste sur le format JSON pour faciliter le parsing. Ajouter une validation Zod du résultat.

> Implémenter un retry automatique en cas d'erreur 429 (rate limit) ou 500.

---

## Prochain bloc

**[BLOC 3.2]** — Génération CRC Structuré
