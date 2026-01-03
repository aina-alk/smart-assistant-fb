# [BLOC 2.3] — Intégration Anonymisation Route /api/generation/crc + claude-client

## Contexte

La route `/api/generation/crc` et le client `claude-client.ts` travaillent ensemble pour générer des comptes-rendus de consultation à partir de transcriptions audio. Ce bloc est plus complexe car l'anonymisation doit être intégrée dans le client réutilisable.

## Objectif de ce bloc

1. Modifier `src/lib/api/claude-client.ts` pour intégrer l'anonymisation dans la méthode `generateCRC()`
2. Vérifier que la route `/api/generation/crc` utilise correctement le client modifié

## Pré-requis

- [ ] Bloc 1.4 terminé (module anonymisation)
- [ ] Bloc 2.1 terminé (pattern validé)

## Spécifications

### 1. Fichiers à modifier

1. **Principal** : `src/lib/api/claude-client.ts` — Intégrer l'anonymisation
2. **Secondaire** : `src/app/api/generation/crc/route.ts` — Vérifier l'utilisation

### 2. Modifier claude-client.ts

**Fichier** : `src/lib/api/claude-client.ts`

#### 2.1 Ajouter les imports

```typescript
// En haut du fichier
import { anonymize, deanonymize, AnonymizationContext } from '@/lib/anonymization';
```

#### 2.2 Modifier la méthode generateCRC

D'après l'analyse, la méthode `generateCRC` (lignes ~84-109) ressemble à :

```typescript
// AVANT
async generateCRC(params: GenerateCRCParams): Promise<GenerateCRCResult> {
  const { transcription, patientContext, template } = params;
  
  const userPrompt = this.buildCRCPrompt(transcription, patientContext, template);
  
  const response = await this.client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: CRC_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });
  
  return this.parseCRCResponse(response);
}
```

```typescript
// APRÈS
async generateCRC(params: GenerateCRCParams): Promise<GenerateCRCResult> {
  const { transcription, patientContext, template } = params;
  
  // Construire le prompt
  const userPrompt = this.buildCRCPrompt(transcription, patientContext, template);
  
  // ====== Anonymisation ======
  const { anonymizedText, context, hasAnonymizedData } = anonymize(userPrompt);
  
  if (hasAnonymizedData) {
    console.log(
      `[ClaudeClient.generateCRC] Anonymisation: ${context.stats.totalTokens} tokens`
    );
  }
  // ===========================
  
  // Appeler Anthropic avec le texte anonymisé
  const response = await this.client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: CRC_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: anonymizedText }],
  });
  
  // Extraire le texte de la réponse
  let responseText = response.content[0].type === 'text'
    ? response.content[0].text
    : '';
  
  // ====== Dé-anonymisation ======
  if (hasAnonymizedData) {
    const deanonResult = deanonymize(responseText, context);
    responseText = deanonResult.originalText;
    
    if (deanonResult.unmatchedTokens.length > 0) {
      console.warn(
        `[ClaudeClient.generateCRC] Tokens non restaurés: ${deanonResult.unmatchedTokens.join(', ')}`
      );
    }
    console.log(
      `[ClaudeClient.generateCRC] Dé-anonymisation: ${deanonResult.tokensRestored} tokens`
    );
  }
  // ==============================
  
  return this.parseCRCResponse(responseText);
}
```

#### 2.3 Adapter parseCRCResponse si nécessaire

Si `parseCRCResponse` attend un objet `Message` au lieu d'une string, adapter :

```typescript
// Si la méthode actuelle est :
private parseCRCResponse(response: Anthropic.Message): GenerateCRCResult {
  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  // ... parsing
}

// Modifier pour accepter une string directement :
private parseCRCResponse(text: string): GenerateCRCResult {
  // ... parsing (utiliser text directement)
}
```

### 3. Structure complète de claude-client.ts

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { anonymize, deanonymize } from '@/lib/anonymization';

// Types existants
interface GenerateCRCParams {
  transcription: string;
  patientContext?: {
    age?: number;
    sexe?: string;
    antecedents?: string;
  };
  template?: string;
}

interface GenerateCRCResult {
  crc: string;
  sections: {
    motif?: string;
    histoire?: string;
    examen?: string;
    conclusion?: string;
    conduite?: string;
  };
  metadata: {
    processingTimeMs: number;
    tokensUsed: number;
    anonymizationStats?: {
      tokensCreated: number;
      tokensRestored: number;
    };
  };
}

const CRC_SYSTEM_PROMPT = `...`; // Existant

export class ClaudeClient {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Génère un compte-rendu de consultation à partir d'une transcription
   * Les données sensibles sont automatiquement anonymisées avant envoi
   */
  async generateCRC(params: GenerateCRCParams): Promise<GenerateCRCResult> {
    const startTime = performance.now();
    const { transcription, patientContext, template } = params;

    // Construire le prompt
    const userPrompt = this.buildCRCPrompt(transcription, patientContext, template);

    // Anonymiser
    const { anonymizedText, context, hasAnonymizedData } = anonymize(userPrompt);

    if (hasAnonymizedData) {
      console.log(
        `[ClaudeClient] Anonymisation: ${context.stats.totalTokens} tokens`
      );
    }

    // Appeler Anthropic
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: CRC_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: anonymizedText }],
    });

    // Extraire le texte
    let responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Statistiques d'anonymisation pour les metadata
    let anonymizationStats: { tokensCreated: number; tokensRestored: number } | undefined;

    // Dé-anonymiser
    if (hasAnonymizedData) {
      const deanonResult = deanonymize(responseText, context);
      responseText = deanonResult.originalText;
      
      anonymizationStats = {
        tokensCreated: context.stats.totalTokens,
        tokensRestored: deanonResult.tokensRestored,
      };

      if (deanonResult.unmatchedTokens.length > 0) {
        console.warn(
          `[ClaudeClient] Tokens non restaurés: ${deanonResult.unmatchedTokens.join(', ')}`
        );
      }
    }

    // Parser la réponse
    const result = this.parseCRCResponse(responseText);

    return {
      ...result,
      metadata: {
        processingTimeMs: performance.now() - startTime,
        tokensUsed: response.usage?.output_tokens || 0,
        anonymizationStats,
      },
    };
  }

  private buildCRCPrompt(
    transcription: string,
    patientContext?: GenerateCRCParams['patientContext'],
    template?: string
  ): string {
    let prompt = `Transcription de la consultation:\n${transcription}`;

    if (patientContext) {
      prompt += `\n\nContexte patient:`;
      if (patientContext.age) prompt += `\n- Âge: ${patientContext.age} ans`;
      if (patientContext.sexe) prompt += `\n- Sexe: ${patientContext.sexe}`;
      if (patientContext.antecedents) prompt += `\n- Antécédents: ${patientContext.antecedents}`;
    }

    if (template) {
      prompt += `\n\nTemplate souhaité: ${template}`;
    }

    return prompt;
  }

  private parseCRCResponse(text: string): Omit<GenerateCRCResult, 'metadata'> {
    // Parser le CRC structuré (implémentation existante)
    // ...
    return {
      crc: text,
      sections: {
        // Extraction des sections si format structuré
      },
    };
  }
}

// Singleton
export const claudeClient = new ClaudeClient();
```

### 4. Vérifier la route /api/generation/crc

**Fichier** : `src/app/api/generation/crc/route.ts`

La route devrait déjà utiliser `claudeClient.generateCRC()`. Vérifier qu'elle n'ajoute pas d'appel Anthropic supplémentaire non protégé.

```typescript
// Vérifier que la route utilise bien le client
import { claudeClient } from '@/lib/api/claude-client';

export async function POST(request: NextRequest) {
  // ...auth, rate-limit...
  
  const { transcription, patientContext } = await request.json();
  
  // ✅ Utilise le client avec anonymisation intégrée
  const result = await claudeClient.generateCRC({
    transcription,
    patientContext,
  });
  
  return NextResponse.json(result);
}
```

## Structure attendue

```
src/lib/api/
├── claude-client.ts            # MODIFIÉ - Anonymisation intégrée
├── fhir-client.ts              # Inchangé (bloc 3)
└── auth-helpers.ts             # Inchangé (bloc 3)

src/app/api/generation/crc/
└── route.ts                    # VÉRIFIER - Utilise claudeClient
```

## Validation

Ce bloc est terminé quand :

- [ ] `claude-client.ts` modifié avec anonymisation dans `generateCRC()`
- [ ] Les metadata incluent `anonymizationStats`
- [ ] La route `/api/generation/crc` utilise le client modifié
- [ ] `pnpm build` réussit
- [ ] Test manuel avec transcription contenant des données sensibles

## Test manuel

```bash
curl -X POST http://localhost:3000/api/generation/crc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "transcription": "Bonjour docteur, je suis Monsieur DUPONT Jean, né le 15 mars 1985. Mon numéro de sécu est le 1 85 03 75 108 123 45. Je viens pour des acouphènes depuis deux semaines...",
    "patientContext": {
      "age": 38,
      "sexe": "M",
      "antecedents": "HTA traitée par Amlodipine"
    }
  }'

# Vérifier dans les logs :
# [ClaudeClient] Anonymisation: X tokens
# [ClaudeClient] Dé-anonymisation: X tokens

# Vérifier que la réponse contient les données originales (pas les tokens)
```

## Notes importantes

> ⚠️ **Client centralisé** : L'anonymisation est maintenant dans le client, pas dans chaque route. Toute route utilisant `claudeClient.generateCRC()` bénéficie automatiquement de l'anonymisation.

> ℹ️ **Metadata** : Les statistiques d'anonymisation sont incluses dans les metadata pour monitoring/debugging.

> ℹ️ **Rétrocompatibilité** : L'interface `GenerateCRCResult` est étendue mais pas modifiée de manière breaking.

---
**Prochain bloc** : 2.4 — Route /api/codage/suggest
