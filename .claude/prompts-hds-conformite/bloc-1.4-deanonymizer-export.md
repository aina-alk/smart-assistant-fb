# [BLOC 1.4] — Service Deanonymizer + Export

## Contexte

Le service Anonymizer (bloc 1.3) crée des tokens et un contexte. Ce bloc implémente le service inverse : la dé-anonymisation qui restaure les données originales à partir d'un texte tokenisé et de son contexte.

## Objectif de ce bloc

Créer le service `Deanonymizer` et le fichier d'export principal du module d'anonymisation. Après ce bloc, le module sera complet et prêt à être intégré dans les routes API.

## Pré-requis

- [ ] Bloc 1.3 terminé (Anonymizer)

## Spécifications

### 1. Créer le service Deanonymizer

**Fichier** : `src/lib/anonymization/deanonymizer.ts` (NOUVEAU)

```typescript
import {
  AnonymizationContext,
  DeanonymizationResult,
  AnonymizationError,
  AnonymizationErrorCode,
} from './types';

/**
 * Pattern pour détecter les tokens d'anonymisation
 * Format : [TYPE_xxxxxxxx]
 */
const TOKEN_PATTERN = /\[([A-Z_]+)_([a-f0-9]+)\]/g;

/**
 * Service de dé-anonymisation
 * Restaure les données originales à partir d'un texte tokenisé
 */
export class Deanonymizer {
  /**
   * Restaure le texte original à partir d'un texte anonymisé et de son contexte
   * 
   * @param anonymizedText - Texte contenant des tokens [TYPE_xxx]
   * @param context - Contexte d'anonymisation contenant le mapping token → valeur
   * @returns Texte avec les données originales restaurées
   * 
   * @example
   * const deanonymizer = new Deanonymizer();
   * const result = deanonymizer.deanonymize(
   *   "Patient [NAME_a1b2c3d4], NIR [NIR_e5f6g7h8]",
   *   context
   * );
   * // result.originalText = "Patient M. DUPONT, NIR 185127510812345"
   */
  deanonymize(
    anonymizedText: string,
    context: AnonymizationContext
  ): DeanonymizationResult {
    // Validation des entrées
    if (typeof anonymizedText !== 'string') {
      throw new AnonymizationError(
        'Anonymized text must be a string',
        AnonymizationErrorCode.INVALID_INPUT
      );
    }

    if (!context || !context.entries) {
      throw new AnonymizationError(
        'Valid context with entries is required',
        AnonymizationErrorCode.INVALID_INPUT
      );
    }

    // Si pas de tokens dans le contexte, retourner tel quel
    if (context.entries.size === 0) {
      return {
        originalText: anonymizedText,
        tokensRestored: 0,
        unmatchedTokens: [],
      };
    }

    let restoredText = anonymizedText;
    let tokensRestored = 0;
    const unmatchedTokens: string[] = [];

    // Trouver tous les tokens dans le texte
    const tokenMatches = anonymizedText.matchAll(TOKEN_PATTERN);

    for (const match of tokenMatches) {
      const fullToken = match[0]; // [TYPE_xxxxxxxx]

      // Chercher dans le contexte
      const entry = context.entries.get(fullToken);

      if (entry) {
        // Remplacer le token par la valeur originale
        restoredText = restoredText.replace(fullToken, entry.originalValue);
        tokensRestored++;
      } else {
        // Token non trouvé dans le contexte (anomalie)
        unmatchedTokens.push(fullToken);
      }
    }

    return {
      originalText: restoredText,
      tokensRestored,
      unmatchedTokens,
    };
  }

  /**
   * Vérifie si un texte contient des tokens d'anonymisation
   */
  containsTokens(text: string): boolean {
    TOKEN_PATTERN.lastIndex = 0;
    return TOKEN_PATTERN.test(text);
  }

  /**
   * Extrait tous les tokens d'un texte
   */
  extractTokens(text: string): string[] {
    const tokens: string[] = [];
    TOKEN_PATTERN.lastIndex = 0;
    
    let match: RegExpExecArray | null;
    while ((match = TOKEN_PATTERN.exec(text)) !== null) {
      tokens.push(match[0]);
    }
    
    return tokens;
  }

  /**
   * Valide qu'un contexte peut dé-anonymiser un texte
   * Retourne les tokens manquants s'il y en a
   */
  validateContext(
    anonymizedText: string,
    context: AnonymizationContext
  ): { valid: boolean; missingTokens: string[] } {
    const tokensInText = this.extractTokens(anonymizedText);
    const missingTokens: string[] = [];

    for (const token of tokensInText) {
      if (!context.entries.has(token)) {
        missingTokens.push(token);
      }
    }

    return {
      valid: missingTokens.length === 0,
      missingTokens,
    };
  }
}

/**
 * Instance singleton du dé-anonymiseur
 */
export const deanonymizer = new Deanonymizer();

/**
 * Fonction utilitaire pour dé-anonymiser rapidement
 */
export function deanonymize(
  anonymizedText: string,
  context: AnonymizationContext
): DeanonymizationResult {
  return deanonymizer.deanonymize(anonymizedText, context);
}
```

### 2. Créer le fichier d'export principal

**Fichier** : `src/lib/anonymization/index.ts` (NOUVEAU)

```typescript
/**
 * Module d'anonymisation des données de santé
 * 
 * Ce module permet de :
 * - Détecter les données sensibles (NIR, téléphone, email, dates, noms, adresses)
 * - Les remplacer par des tokens uniques avant envoi à des services externes
 * - Restaurer les données originales après réception de la réponse
 * 
 * @example
 * import { anonymize, deanonymize } from '@/lib/anonymization';
 * 
 * // Avant envoi à l'API externe
 * const { anonymizedText, context } = anonymize(texteAvecDonneesSensibles);
 * 
 * // Envoi à l'API externe...
 * const response = await externalAPI(anonymizedText);
 * 
 * // Après réception de la réponse
 * const { originalText } = deanonymize(response.text, context);
 */

// Types
export {
  SensitiveDataType,
  AnonymizationContext,
  AnonymizationEntry,
  AnonymizationResult,
  DeanonymizationResult,
  AnonymizationStats,
  AnonymizerOptions,
  DEFAULT_ANONYMIZER_OPTIONS,
  AnonymizationError,
  AnonymizationErrorCode,
  IAnonymizer,
} from './types';

// Patterns et détection
export {
  detectSensitiveData,
  containsSensitiveData,
  DetectionMatch,
  validateNIR,
  validatePhone,
  validateDate,
} from './patterns';

// Services
export { Anonymizer, anonymizer, anonymize } from './anonymizer';
export { Deanonymizer, deanonymizer, deanonymize } from './deanonymizer';

/**
 * Fonction combinée pour anonymiser et dé-anonymiser
 * Utile pour wrapper une fonction async
 */
export async function withAnonymization<T>(
  text: string,
  asyncFn: (anonymizedText: string) => Promise<T>,
  extractText: (result: T) => string,
  injectText: (result: T, restoredText: string) => T
): Promise<T> {
  const { anonymize } = await import('./anonymizer');
  const { deanonymize } = await import('./deanonymizer');

  // Anonymiser
  const { anonymizedText, context, hasAnonymizedData } = anonymize(text);

  // Exécuter la fonction avec le texte anonymisé
  const result = await asyncFn(anonymizedText);

  // Si pas d'anonymisation, retourner tel quel
  if (!hasAnonymizedData) {
    return result;
  }

  // Extraire le texte de la réponse
  const responseText = extractText(result);

  // Dé-anonymiser
  const { originalText } = deanonymize(responseText, context);

  // Réinjecter le texte restauré
  return injectText(result, originalText);
}
```

### 3. Vérifier les exports TypeScript

**Fichier** : `tsconfig.json`

Vérifier que le path alias `@/lib/anonymization` fonctionne (normalement déjà configuré).

## Structure attendue

```
src/lib/
└── anonymization/
    ├── index.ts                # NOUVEAU - Export principal
    ├── types.ts                # Bloc 1.1
    ├── patterns.ts             # Bloc 1.2
    ├── anonymizer.ts           # Bloc 1.3
    └── deanonymizer.ts         # NOUVEAU - Ce bloc
```

## Interface publique du module

Après ce bloc, le module expose :

| Export | Type | Description |
|--------|------|-------------|
| `anonymize(text)` | Function | Anonymise un texte |
| `deanonymize(text, context)` | Function | Restaure un texte |
| `anonymizer` | Singleton | Instance d'Anonymizer |
| `deanonymizer` | Singleton | Instance de Deanonymizer |
| `Anonymizer` | Class | Classe d'anonymisation |
| `Deanonymizer` | Class | Classe de dé-anonymisation |
| `detectSensitiveData(text)` | Function | Détecte les données sensibles |
| `containsSensitiveData(text)` | Function | Check rapide |
| `withAnonymization()` | Function | Wrapper async |
| `SensitiveDataType` | Enum | Types de données |
| `AnonymizationContext` | Interface | Contexte de mapping |
| `AnonymizationResult` | Interface | Résultat d'anonymisation |
| `DeanonymizationResult` | Interface | Résultat de dé-anonymisation |

## Validation

Ce bloc est terminé quand :

- [ ] `src/lib/anonymization/deanonymizer.ts` créé
- [ ] `src/lib/anonymization/index.ts` créé
- [ ] Tous les exports sont accessibles via `@/lib/anonymization`
- [ ] Le module compile sans erreur : `pnpm tsc --noEmit`
- [ ] Les tests end-to-end passent

## Tests end-to-end

```typescript
import { anonymize, deanonymize, containsSensitiveData } from '@/lib/anonymization';

// Test complet : anonymisation + dé-anonymisation
function testRoundTrip() {
  const originalText = `
    Compte-rendu de consultation
    Patient : M. DUPONT Jean
    NIR : 1 85 12 75 108 123 45
    Né le : 15/03/1985
    Téléphone : 06 12 34 56 78
    Email : jean.dupont@email.com
    Adresse : 42 rue de la Paix, 75002 Paris
    
    Motif : Otite moyenne aiguë de l'oreille droite.
    Le patient présente une otalgie depuis 3 jours.
  `;

  console.log('=== Test Round-Trip ===');
  console.log('Contient données sensibles:', containsSensitiveData(originalText));

  // Étape 1 : Anonymiser
  const { anonymizedText, context, hasAnonymizedData } = anonymize(originalText);
  
  console.log('\n--- Texte anonymisé ---');
  console.log(anonymizedText);
  console.log('\nStatistiques:', context.stats);

  // Vérifier que le texte anonymisé ne contient plus les données originales
  console.log('\n--- Vérifications ---');
  console.log('NIR présent dans anonymisé:', anonymizedText.includes('185127510812345'));
  console.log('Email présent dans anonymisé:', anonymizedText.includes('jean.dupont@email.com'));
  // Attendu: false pour les deux

  // Étape 2 : Simuler une réponse d'API avec les tokens
  const apiResponse = `
    Analyse du compte-rendu pour [NAME_${[...context.entries.keys()][0]?.match(/_([a-f0-9]+)/)?.[1] || 'xxx'}]:
    Le patient présente une otite moyenne aiguë nécessitant un traitement antibiotique.
  `;

  // Étape 3 : Dé-anonymiser
  const { originalText: restoredText, tokensRestored, unmatchedTokens } = deanonymize(
    anonymizedText,
    context
  );

  console.log('\n--- Texte restauré ---');
  console.log(restoredText);
  console.log('\nTokens restaurés:', tokensRestored);
  console.log('Tokens non trouvés:', unmatchedTokens);

  // Vérifier que le texte restauré contient les données originales
  console.log('\n--- Vérification finale ---');
  console.log('NIR restauré:', restoredText.includes('1 85 12 75 108 123 45') || restoredText.includes('185127510812345'));
  console.log('Email restauré:', restoredText.includes('jean.dupont@email.com'));
  // Attendu: true pour les deux
}

testRoundTrip();
```

## Exemple d'utilisation avec withAnonymization

```typescript
import { withAnonymization } from '@/lib/anonymization';
import Anthropic from '@anthropic-ai/sdk';

// Utilisation du wrapper async
async function generateWithAnonymization(prompt: string) {
  const anthropic = new Anthropic();

  return withAnonymization(
    prompt,
    // Fonction async à wrapper
    async (anonymizedPrompt) => {
      return anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: anonymizedPrompt }],
      });
    },
    // Extracteur de texte
    (result) => result.content[0].type === 'text' ? result.content[0].text : '',
    // Injecteur de texte restauré
    (result, restoredText) => ({
      ...result,
      content: [{ type: 'text', text: restoredText }],
    })
  );
}
```

## Notes importantes

> ⚠️ **Contexte éphémère** : Le contexte n'est JAMAIS persisté. Si la requête HTTP échoue après anonymisation, les données sont perdues (comportement voulu pour la sécurité).

> ⚠️ **Tokens dans la réponse** : L'API externe (Anthropic) peut inclure les tokens dans sa réponse. La dé-anonymisation les remplacera automatiquement.

> ℹ️ **unmatchedTokens** : Si des tokens sont trouvés dans le texte mais pas dans le contexte, c'est une anomalie (peut-être un contexte corrompu ou une réponse d'un autre appel).

> ℹ️ **Performance** : La dé-anonymisation est O(n) où n est le nombre de tokens. Pour un texte médical typique (<50 tokens), c'est < 1ms.

---
**Prochain bloc** : 2.1 — Route /api/ordonnances
