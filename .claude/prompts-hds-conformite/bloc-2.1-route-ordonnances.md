# [BLOC 2.1] — Intégration Anonymisation Route /api/ordonnances

## Contexte

La route `/api/ordonnances` envoie des données médicales (conduite thérapeutique, contexte patient) à l'API Anthropic pour extraction des prescriptions. Ces données contiennent potentiellement des informations identifiantes qui ne doivent pas quitter l'infrastructure HDS.

## Objectif de ce bloc

Intégrer le module d'anonymisation dans la route `/api/ordonnances` pour tokeniser les données sensibles avant l'appel à Anthropic et restaurer les valeurs originales dans la réponse.

## Pré-requis

- [ ] Bloc 1.4 terminé (module anonymisation complet)

## Spécifications

### 1. Fichier à modifier

**Fichier** : `src/app/api/ordonnances/route.ts`

### 2. Localisation du code à modifier

D'après l'analyse du codebase, les lignes 52-65 contiennent l'appel à Anthropic :

```typescript
// AVANT (lignes ~52-65)
const userPrompt = `Conduite thérapeutique:\n${conduite}\n\nContexte patient:\n${contextePatient}`;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2048,
  system: PRESCRIPTION_EXTRACTION_PROMPT,
  messages: [{ role: 'user', content: userPrompt }],
});
```

### 3. Modifications à apporter

#### 3.1 Ajouter l'import du module d'anonymisation

```typescript
// En haut du fichier, ajouter :
import { anonymize, deanonymize } from '@/lib/anonymization';
```

#### 3.2 Wrapper l'appel Anthropic avec anonymisation

```typescript
// APRÈS (remplacer les lignes 52-65)

// Construire le prompt
const userPrompt = `Conduite thérapeutique:\n${conduite}\n\nContexte patient:\n${contextePatient}`;

// Anonymiser avant envoi à Anthropic
const { anonymizedText, context, hasAnonymizedData } = anonymize(userPrompt);

if (hasAnonymizedData) {
  console.log(`[Ordonnances] Anonymisation: ${context.stats.totalTokens} tokens créés`);
}

// Appeler Anthropic avec le texte anonymisé
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2048,
  system: PRESCRIPTION_EXTRACTION_PROMPT,
  messages: [{ role: 'user', content: anonymizedText }],
});

// Extraire la réponse
let responseText = message.content[0].type === 'text' 
  ? message.content[0].text 
  : '';

// Dé-anonymiser la réponse si nécessaire
if (hasAnonymizedData) {
  const { originalText, tokensRestored, unmatchedTokens } = deanonymize(responseText, context);
  responseText = originalText;
  
  if (unmatchedTokens.length > 0) {
    console.warn(`[Ordonnances] Tokens non restaurés: ${unmatchedTokens.join(', ')}`);
  }
  console.log(`[Ordonnances] Dé-anonymisation: ${tokensRestored} tokens restaurés`);
}
```

### 4. Structure complète de la route modifiée

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { anonymize, deanonymize } from '@/lib/anonymization';
import { verifyMedecinAccess } from '@/lib/api/auth-helpers';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';

const PRESCRIPTION_EXTRACTION_PROMPT = `...`; // Existant, ne pas modifier

export async function POST(request: NextRequest) {
  try {
    // Vérification auth (existant)
    const authResult = await verifyMedecinAccess(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Rate limiting (existant)
    const rateLimitResult = await checkRateLimit(authResult.userId, 'generation');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Extraction du body (existant)
    const { conduite, contextePatient } = await request.json();

    if (!conduite) {
      return NextResponse.json(
        { error: 'La conduite thérapeutique est requise' },
        { status: 400 }
      );
    }

    // Construire le prompt
    const userPrompt = `Conduite thérapeutique:\n${conduite}\n\nContexte patient:\n${contextePatient || 'Non fourni'}`;

    // ====== NOUVEAU : Anonymisation ======
    const { anonymizedText, context, hasAnonymizedData } = anonymize(userPrompt);

    if (hasAnonymizedData) {
      console.log(
        `[Ordonnances] Anonymisation: ${context.stats.totalTokens} tokens ` +
        `(NIR: ${context.stats.byType.NIR}, TEL: ${context.stats.byType.PHONE}, ` +
        `EMAIL: ${context.stats.byType.EMAIL}, NOM: ${context.stats.byType.NAME})`
      );
    }
    // ====================================

    // Appeler Anthropic avec le texte ANONYMISÉ
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: PRESCRIPTION_EXTRACTION_PROMPT,
      messages: [{ role: 'user', content: anonymizedText }], // <-- anonymizedText
    });

    // Extraire la réponse
    let responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // ====== NOUVEAU : Dé-anonymisation ======
    if (hasAnonymizedData) {
      const deanonResult = deanonymize(responseText, context);
      responseText = deanonResult.originalText;

      if (deanonResult.unmatchedTokens.length > 0) {
        console.warn(
          `[Ordonnances] Tokens non restaurés: ${deanonResult.unmatchedTokens.join(', ')}`
        );
      }
      console.log(`[Ordonnances] Dé-anonymisation: ${deanonResult.tokensRestored} tokens restaurés`);
    }
    // ========================================

    // Parser la réponse JSON (existant)
    const prescriptions = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      prescriptions,
      // Debug (à retirer en prod)
      _debug: process.env.NODE_ENV === 'development' ? {
        anonymized: hasAnonymizedData,
        tokensCreated: context.stats.totalTokens,
      } : undefined,
    });

  } catch (error) {
    console.error('[Ordonnances] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'extraction des prescriptions' },
      { status: 500 }
    );
  }
}
```

## Validation

Ce bloc est terminé quand :

- [ ] Import `anonymize, deanonymize` ajouté en haut du fichier
- [ ] Le prompt est anonymisé avant l'appel Anthropic
- [ ] La réponse est dé-anonymisée après réception
- [ ] Les logs de debug sont en place
- [ ] `pnpm build` réussit sans erreur
- [ ] Test manuel avec données sensibles

## Test manuel

```bash
# 1. Démarrer l'app en dev
pnpm dev

# 2. Appeler l'API avec des données sensibles
curl -X POST http://localhost:3000/api/ordonnances \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "conduite": "Amoxicilline 1g x3/j pendant 7 jours pour M. DUPONT Jean (NIR 185127510812345)",
    "contextePatient": "Patient de 38 ans, né le 15/03/1985, tél: 06 12 34 56 78"
  }'

# 3. Vérifier les logs du serveur
# Attendu: "[Ordonnances] Anonymisation: X tokens créés"
# Attendu: "[Ordonnances] Dé-anonymisation: X tokens restaurés"

# 4. Vérifier que la réponse contient les données originales (pas les tokens)
```

## Points de vérification sécurité

| Vérification | Attendu |
|--------------|---------|
| Le texte envoyé à Anthropic contient-il le NIR ? | ❌ Non (token [NIR_xxx]) |
| Le texte envoyé à Anthropic contient-il le téléphone ? | ❌ Non (token [PHONE_xxx]) |
| La réponse finale contient-elle les données originales ? | ✅ Oui (restaurées) |
| Le contexte est-il loggé ? | ❌ Non (jamais loggé) |
| Le contexte est-il persisté ? | ❌ Non (en mémoire uniquement) |

## Notes importantes

> ⚠️ **Ne pas logger le contexte** : Le `context` contient les mappings token ↔ valeur originale. Ne JAMAIS le logger ou le persister.

> ℹ️ **Debug en dev** : Le champ `_debug` dans la réponse est uniquement présent en développement pour faciliter les tests.

> ℹ️ **Performance** : L'anonymisation/dé-anonymisation ajoute ~1-5ms au temps de traitement total.

---
**Prochain bloc** : 2.2 — Route /api/bilans
