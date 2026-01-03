# [BLOC 2.4] — Intégration Anonymisation Route /api/codage/suggest

## Contexte

La route `/api/codage/suggest` envoie le texte complet du CRC à Anthropic pour suggérer les codes CCAM appropriés. Le CRC peut contenir des données patient identifiantes.

## Objectif de ce bloc

Intégrer le module d'anonymisation dans la route `/api/codage/suggest` en suivant le pattern établi.

## Pré-requis

- [ ] Bloc 1.4 terminé (module anonymisation)

## Spécifications

### 1. Fichier à modifier

**Fichier** : `src/app/api/codage/suggest/route.ts`

### 2. Localisation du code (lignes ~48-58)

```typescript
// AVANT
const userPrompt = `Compte-rendu de consultation ORL:\n${crc}\n\nSuggère les codes CCAM appropriés.`;

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  system: CODAGE_SUGGEST_PROMPT,
  messages: [{ role: 'user', content: userPrompt }],
});
```

### 3. Modifications à apporter

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { anonymize, deanonymize } from '@/lib/anonymization';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';

const CODAGE_SUGGEST_PROMPT = `Tu es un assistant de codage médical spécialisé en ORL.
Analyse le compte-rendu fourni et suggère les codes CCAM appropriés.
Retourne un JSON avec la structure:
{
  "suggestions": [
    {"code": "CCAM_CODE", "libelle": "Description", "justification": "Pourquoi ce code"}
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    // Auth
    const authResult = await verifyMedecinAccess(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(authResult.userId, 'codage');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Body
    const { crc } = await request.json();

    if (!crc || typeof crc !== 'string') {
      return NextResponse.json(
        { error: 'Le compte-rendu (crc) est requis' },
        { status: 400 }
      );
    }

    // Construire le prompt
    const userPrompt = `Compte-rendu de consultation ORL:\n${crc}\n\nSuggère les codes CCAM appropriés.`;

    // ====== Anonymisation ======
    const { anonymizedText, context, hasAnonymizedData } = anonymize(userPrompt);

    if (hasAnonymizedData) {
      console.log(
        `[Codage/Suggest] Anonymisation: ${context.stats.totalTokens} tokens`
      );
    }
    // ===========================

    // Appeler Anthropic
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: CODAGE_SUGGEST_PROMPT,
      messages: [{ role: 'user', content: anonymizedText }],
    });

    let responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // ====== Dé-anonymisation ======
    // Note: Pour le codage, la réponse est du JSON avec des codes CCAM,
    // donc peu probable qu'elle contienne des tokens. Mais on dé-anonymise
    // quand même par sécurité (le champ "justification" pourrait reprendre
    // des éléments du CRC).
    if (hasAnonymizedData) {
      const deanonResult = deanonymize(responseText, context);
      responseText = deanonResult.originalText;
      
      if (deanonResult.tokensRestored > 0) {
        console.log(
          `[Codage/Suggest] Dé-anonymisation: ${deanonResult.tokensRestored} tokens`
        );
      }
    }
    // ==============================

    // Parser la réponse JSON
    let suggestions;
    try {
      const parsed = JSON.parse(responseText);
      suggestions = parsed.suggestions || [];
    } catch {
      // Si le parsing échoue, retourner le texte brut
      console.warn('[Codage/Suggest] Réponse non-JSON:', responseText);
      suggestions = [];
    }

    return NextResponse.json({
      success: true,
      suggestions,
    });

  } catch (error) {
    console.error('[Codage/Suggest] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suggestion de codes' },
      { status: 500 }
    );
  }
}
```

## Validation

Ce bloc est terminé quand :

- [ ] Import `anonymize, deanonymize` ajouté
- [ ] Le CRC est anonymisé avant envoi
- [ ] La réponse est dé-anonymisée
- [ ] `pnpm build` réussit
- [ ] Test manuel validé

## Test manuel

```bash
curl -X POST http://localhost:3000/api/codage/suggest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "crc": "Patient M. DUPONT Jean, 45 ans (NIR 185034512312345), consulte pour otite moyenne aiguë de l'\''oreille droite. Examen: tympan bombé, hyperhémié. Audiométrie normale à gauche, perte de 30dB à droite."
  }'

# Vérifier les logs et la réponse
```

## Notes importantes

> ℹ️ **Réponse JSON** : La réponse d'Anthropic pour le codage est du JSON structuré. Les tokens peuvent apparaître dans le champ "justification" qui peut citer le CRC.

> ℹ️ **Pattern identique** : Même pattern que les blocs précédents.

---
**Prochain bloc** : 2.5 — Route /api/transcription (métadonnées)
