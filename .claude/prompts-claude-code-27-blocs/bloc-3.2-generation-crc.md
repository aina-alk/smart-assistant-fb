# [BLOC 3.2] — Génération CRC Structuré

**Bloc** : 3.2 / 27  
**Durée estimée** : 35 min  
**Dépendances** : Bloc 3.1 terminé

---

## Contexte

Le client Claude est prêt (bloc 3.1). Nous devons maintenant créer l'API endpoint et la logique de génération complète avec validation et parsing.

---

## Objectif de ce bloc

Créer l'endpoint API de génération CRC qui reçoit une transcription et retourne un CRC structuré, validé et prêt à être affiché.

---

## Pré-requis

- [ ] Bloc 3.1 terminé
- [ ] Client Claude fonctionnel

---

## Spécifications

### Ce qui doit être créé

1. **API Route** (`app/api/consultations/[id]/generate/route.ts`) :
   - POST : génère le CRC depuis transcription
   - Validation entrée
   - Appel Claude
   - Validation sortie (Zod)
   - Sauvegarde dans FHIR

2. **Parser CRC** (`lib/prompts/crc-parser.ts`) :
   - Parse le JSON retourné par Claude
   - Nettoie et formate les textes
   - Valide avec Zod
   - Gère les erreurs de parsing

3. **Schéma Zod CRC** (`lib/validations/crc.ts`) :
   - Validation stricte du format CRC
   - Messages d'erreur explicites

4. **Types CRC** (`types/crc.ts`) :
   - Types détaillés pour le CRC

---

## Endpoint API

```typescript
// POST /api/consultations/[id]/generate
// Body: { transcription: string }
// Response: { crc: CRCGenerated, raw_response?: string }

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Vérifier auth
  // 2. Récupérer consultation existante
  // 3. Valider transcription (non vide, min 50 caractères)
  // 4. Appeler Claude
  // 5. Parser et valider réponse
  // 6. Mettre à jour consultation avec CRC
  // 7. Retourner CRC
}
```

---

## Schéma Zod CRC

```typescript
const crcSchema = z.object({
  motif: z.string().min(10, "Motif trop court"),
  histoire: z.string().min(20, "Histoire trop courte"),
  examen: z.object({
    otoscopie_droite: z.string().nullable(),
    otoscopie_gauche: z.string().nullable(),
    rhinoscopie: z.string().nullable(),
    oropharynx: z.string().nullable(),
    palpation_cervicale: z.string().nullable(),
    autres: z.string().nullable(),
  }),
  examens_complementaires: z.string().nullable(),
  diagnostic: z.string().min(5, "Diagnostic manquant"),
  conduite: z.string().min(10, "Conduite à tenir manquante"),
  conclusion: z.string().min(10, "Conclusion manquante"),
});
```

---

## Gestion des erreurs de parsing

```typescript
function parseCRCResponse(response: string): CRCGenerated {
  try {
    // Essayer de parser le JSON directement
    const parsed = JSON.parse(response);
    return crcSchema.parse(parsed);
  } catch (e) {
    // Si échec, essayer d'extraire le JSON du texte
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return crcSchema.parse(parsed);
    }
    throw new Error('Impossible de parser la réponse Claude');
  }
}
```

---

## Structure attendue

```
src/
├── app/
│   └── api/
│       └── consultations/
│           └── [id]/
│               └── generate/
│                   └── route.ts
├── lib/
│   ├── prompts/
│   │   └── crc-parser.ts
│   └── validations/
│       └── crc.ts
└── types/
    └── crc.ts
```

---

## Flow de génération

```
┌─────────────┐     POST /generate      ┌─────────────┐
│   Client    │────────────────────────▶│  API Route  │
│             │  { transcription }      │             │
└─────────────┘                         └──────┬──────┘
                                               │
                                               │ 1. Valider
                                               │ 2. Récupérer patient
                                               ▼
                                        ┌─────────────┐
                                        │   Claude    │
                                        │   API       │
                                        └──────┬──────┘
                                               │
                                               │ JSON CRC
                                               ▼
                                        ┌─────────────┐
                                        │   Parser    │
                                        │   + Zod     │
                                        └──────┬──────┘
                                               │
                                               │ CRC validé
                                               ▼
                                        ┌─────────────┐
                                        │   FHIR      │
                                        │   Update    │
                                        └──────┬──────┘
                                               │
                                               │ CRC stocké
                                               ▼
                                        ┌─────────────┐
◀───────────────────────────────────────│  Response   │
      { crc: CRCGenerated }             │             │
                                        └─────────────┘
```

---

## Validation

Ce bloc est terminé quand :

- [ ] `POST /api/consultations/[id]/generate` fonctionne
- [ ] Validation entrée rejette transcription < 50 chars
- [ ] Claude génère un CRC valide
- [ ] Le parsing gère les réponses mal formatées
- [ ] Zod valide la structure du CRC
- [ ] La consultation est mise à jour dans FHIR
- [ ] Les erreurs retournent des messages explicites
- [ ] Temps total < 30 secondes

---

## Notes importantes

> ⚠️ Toujours valider avec Zod le résultat de Claude — les LLM peuvent parfois retourner du JSON invalide ou incomplet.

> Stocker aussi la réponse brute de Claude pour debug (`raw_response`).

> Si Claude ne trouve pas assez d'informations, il doit mettre "[À compléter]" plutôt qu'inventer.

---

## Prochain bloc

**[BLOC 3.3]** — Extraction Diagnostics CIM-10
