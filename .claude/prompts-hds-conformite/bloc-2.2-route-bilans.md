# [BLOC 2.2] — Intégration Anonymisation Route /api/bilans

## Contexte

La route `/api/bilans` envoie des données médicales (CRC, diagnostic) à l'API Anthropic pour génération de bilans et demandes d'examens complémentaires. Le pattern d'intégration est identique au bloc 2.1.

## Objectif de ce bloc

Intégrer le module d'anonymisation dans la route `/api/bilans` en suivant le même pattern que `/api/ordonnances`.

## Pré-requis

- [ ] Bloc 1.4 terminé (module anonymisation)
- [ ] Bloc 2.1 terminé (pattern validé)

## Spécifications

### 1. Fichier à modifier

**Fichier** : `src/app/api/bilans/route.ts`

### 2. Localisation du code à modifier

D'après l'analyse, les lignes 52-65 contiennent l'appel Anthropic avec `crc` et `diagnostic`.

### 3. Modifications à apporter

#### 3.1 Ajouter l'import

```typescript
// En haut du fichier
import { anonymize, deanonymize } from '@/lib/anonymization';
```

#### 3.2 Pattern d'intégration

```typescript
// Construire le prompt avec le CRC et diagnostic
const userPrompt = `Compte-rendu de consultation:\n${crc}\n\nDiagnostic:\n${diagnostic}`;

// Anonymiser avant envoi
const { anonymizedText, context, hasAnonymizedData } = anonymize(userPrompt);

if (hasAnonymizedData) {
  console.log(
    `[Bilans] Anonymisation: ${context.stats.totalTokens} tokens ` +
    `(NIR: ${context.stats.byType.NIR}, NOM: ${context.stats.byType.NAME})`
  );
}

// Appeler Anthropic avec le texte anonymisé
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2048,
  system: BILAN_GENERATION_PROMPT,
  messages: [{ role: 'user', content: anonymizedText }],
});

// Extraire et dé-anonymiser la réponse
let responseText = message.content[0].type === 'text'
  ? message.content[0].text
  : '';

if (hasAnonymizedData) {
  const deanonResult = deanonymize(responseText, context);
  responseText = deanonResult.originalText;
  
  if (deanonResult.unmatchedTokens.length > 0) {
    console.warn(`[Bilans] Tokens non restaurés: ${deanonResult.unmatchedTokens.join(', ')}`);
  }
  console.log(`[Bilans] Dé-anonymisation: ${deanonResult.tokensRestored} tokens restaurés`);
}
```

### 4. Structure complète attendue

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { anonymize, deanonymize } from '@/lib/anonymization';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';

const BILAN_GENERATION_PROMPT = `...`; // Existant

export async function POST(request: NextRequest) {
  try {
    // Auth et rate limiting (existant)
    const authResult = await verifyMedecinAccess(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const rateLimitResult = await checkRateLimit(authResult.userId, 'generation');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Extraction du body
    const { crc, diagnostic, typeBilan } = await request.json();

    if (!crc || !diagnostic) {
      return NextResponse.json(
        { error: 'Le CRC et le diagnostic sont requis' },
        { status: 400 }
      );
    }

    // Construire le prompt
    const userPrompt = `Compte-rendu de consultation:\n${crc}\n\nDiagnostic:\n${diagnostic}\n\nType de bilan demandé: ${typeBilan || 'général'}`;

    // ====== Anonymisation ======
    const { anonymizedText, context, hasAnonymizedData } = anonymize(userPrompt);

    if (hasAnonymizedData) {
      console.log(
        `[Bilans] Anonymisation: ${context.stats.totalTokens} tokens`
      );
    }
    // ===========================

    // Appeler Anthropic
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: BILAN_GENERATION_PROMPT,
      messages: [{ role: 'user', content: anonymizedText }],
    });

    let responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // ====== Dé-anonymisation ======
    if (hasAnonymizedData) {
      const deanonResult = deanonymize(responseText, context);
      responseText = deanonResult.originalText;
      console.log(`[Bilans] Dé-anonymisation: ${deanonResult.tokensRestored} tokens`);
    }
    // ==============================

    return NextResponse.json({
      success: true,
      bilan: responseText,
    });

  } catch (error) {
    console.error('[Bilans] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du bilan' },
      { status: 500 }
    );
  }
}
```

## Validation

Ce bloc est terminé quand :

- [ ] Import `anonymize, deanonymize` ajouté
- [ ] Prompt anonymisé avant envoi Anthropic
- [ ] Réponse dé-anonymisée après réception
- [ ] `pnpm build` réussit
- [ ] Test manuel validé

## Test manuel

```bash
curl -X POST http://localhost:3000/api/bilans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "crc": "Patient M. MARTIN Pierre, 45 ans, consulte pour hypoacousie progressive bilatérale...",
    "diagnostic": "Presbyacousie bilatérale modérée",
    "typeBilan": "audiologique"
  }'
```

## Notes importantes

> ℹ️ **Pattern identique** : Ce bloc suit exactement le même pattern que le bloc 2.1. La seule différence est le nom des variables et les logs.

---
**Prochain bloc** : 2.3 — Route /api/generation/crc + claude-client
