# [BLOC 1.3] — Service Anonymizer

## Contexte

Les types (bloc 1.1) et les patterns de détection (bloc 1.2) sont en place. Ce bloc implémente le service principal d'anonymisation qui transforme un texte contenant des données sensibles en texte tokenisé.

## Objectif de ce bloc

Créer le service `Anonymizer` qui détecte les données sensibles dans un texte et les remplace par des tokens uniques, tout en conservant un contexte permettant la dé-anonymisation ultérieure.

## Pré-requis

- [ ] Bloc 1.1 terminé (types)
- [ ] Bloc 1.2 terminé (patterns)

## Spécifications

### 1. Créer le service Anonymizer

**Fichier** : `src/lib/anonymization/anonymizer.ts` (NOUVEAU)

### 2. Imports et utilitaires

```typescript
import { v4 as uuidv4 } from 'uuid';
import {
  SensitiveDataType,
  AnonymizationContext,
  AnonymizationEntry,
  AnonymizationResult,
  AnonymizationStats,
  AnonymizerOptions,
  DEFAULT_ANONYMIZER_OPTIONS,
  AnonymizationError,
  AnonymizationErrorCode,
  IAnonymizer,
} from './types';
import {
  detectSensitiveData,
  containsSensitiveData as checkContainsSensitiveData,
  DetectionMatch,
} from './patterns';
```

### 3. Fonction de génération de token

```typescript
/**
 * Génère un token unique pour une donnée sensible
 * Format : [TYPE_xxxxxxxx] où xxxxxxxx est un UUID partiel
 */
function generateToken(type: SensitiveDataType, idLength: number = 8): string {
  const uuid = uuidv4().replace(/-/g, '').substring(0, idLength);
  return `[${type}_${uuid}]`;
}
```

### 4. Implémentation de la classe Anonymizer

```typescript
/**
 * Service d'anonymisation des données sensibles
 * 
 * @example
 * const anonymizer = new Anonymizer();
 * const result = anonymizer.anonymize("Patient M. DUPONT, NIR 185127510812345");
 * // result.anonymizedText = "Patient [NAME_a1b2c3d4], NIR [NIR_e5f6g7h8]"
 * // result.context contient le mapping pour restauration
 */
export class Anonymizer implements IAnonymizer {
  private options: Required<AnonymizerOptions>;

  constructor(options: Partial<AnonymizerOptions> = {}) {
    this.options = { ...DEFAULT_ANONYMIZER_OPTIONS, ...options };
  }

  /**
   * Anonymise un texte en remplaçant les données sensibles par des tokens
   */
  anonymize(
    text: string,
    options?: Partial<AnonymizerOptions>
  ): AnonymizationResult {
    const startTime = performance.now();
    const mergedOptions = { ...this.options, ...options };

    // Validation de l'entrée
    if (typeof text !== 'string') {
      throw new AnonymizationError(
        'Input must be a string',
        AnonymizationErrorCode.INVALID_INPUT
      );
    }

    // Texte vide : retourner tel quel
    if (!text.trim()) {
      return this.createEmptyResult(text, startTime);
    }

    // Détection des données sensibles
    const matches = detectSensitiveData(text, mergedOptions.enabledTypes);

    // Aucune donnée sensible trouvée
    if (matches.length === 0) {
      return this.createEmptyResult(text, startTime);
    }

    // Créer le contexte
    const context = this.createContext();

    // Statistiques par type
    const statsByType: Record<SensitiveDataType, number> = {} as Record<
      SensitiveDataType,
      number
    >;
    for (const type of Object.values(SensitiveDataType)) {
      statsByType[type] = 0;
    }

    // Remplacer les données sensibles par des tokens
    // On parcourt de la fin vers le début pour ne pas décaler les indices
    let anonymizedText = text;
    const sortedMatches = [...matches].sort(
      (a, b) => b.startIndex - a.startIndex
    );

    for (const match of sortedMatches) {
      const token = generateToken(match.type, mergedOptions.tokenIdLength);

      // Créer l'entrée dans le contexte
      const entry: AnonymizationEntry = {
        token,
        originalValue: match.value,
        type: match.type,
        startIndex: match.startIndex,
        endIndex: match.endIndex,
      };

      context.entries.set(token, entry);
      statsByType[match.type]++;

      // Remplacer dans le texte
      anonymizedText =
        anonymizedText.substring(0, match.startIndex) +
        token +
        anonymizedText.substring(match.endIndex);
    }

    // Finaliser les statistiques
    const processingTimeMs = performance.now() - startTime;
    context.stats = {
      totalTokens: matches.length,
      byType: statsByType,
      processingTimeMs,
    };

    return {
      anonymizedText,
      context,
      hasAnonymizedData: true,
    };
  }

  /**
   * Vérifie si un texte contient des données sensibles
   */
  containsSensitiveData(text: string): boolean {
    return checkContainsSensitiveData(text);
  }

  /**
   * Retourne les types de données détectés dans un texte
   */
  detectSensitiveTypes(text: string): SensitiveDataType[] {
    const matches = detectSensitiveData(text, this.options.enabledTypes);
    const types = new Set(matches.map((m) => m.type));
    return Array.from(types);
  }

  /**
   * Placeholder pour deanonymize - implémenté dans bloc 1.4
   */
  deanonymize(): never {
    throw new Error('Use Deanonymizer class for deanonymization');
  }

  /**
   * Crée un résultat vide (aucune anonymisation)
   */
  private createEmptyResult(
    text: string,
    startTime: number
  ): AnonymizationResult {
    const emptyStats: AnonymizationStats = {
      totalTokens: 0,
      byType: Object.values(SensitiveDataType).reduce(
        (acc, type) => ({ ...acc, [type]: 0 }),
        {} as Record<SensitiveDataType, number>
      ),
      processingTimeMs: performance.now() - startTime,
    };

    return {
      anonymizedText: text,
      context: {
        requestId: uuidv4(),
        entries: new Map(),
        createdAt: new Date(),
        stats: emptyStats,
      },
      hasAnonymizedData: false,
    };
  }

  /**
   * Crée un nouveau contexte d'anonymisation
   */
  private createContext(): AnonymizationContext {
    return {
      requestId: uuidv4(),
      entries: new Map(),
      createdAt: new Date(),
      stats: {
        totalTokens: 0,
        byType: {} as Record<SensitiveDataType, number>,
        processingTimeMs: 0,
      },
    };
  }
}
```

### 5. Créer l'instance singleton

```typescript
/**
 * Instance singleton de l'anonymiseur
 * Utilisable directement dans les routes API
 */
export const anonymizer = new Anonymizer();

/**
 * Fonction utilitaire pour anonymiser rapidement
 */
export function anonymize(
  text: string,
  options?: Partial<AnonymizerOptions>
): AnonymizationResult {
  return anonymizer.anonymize(text, options);
}
```

### 6. Ajouter la dépendance uuid

**Fichier** : `package.json`

```bash
pnpm add uuid
pnpm add -D @types/uuid
```

## Structure attendue

```
src/lib/
└── anonymization/
    ├── types.ts                # Bloc 1.1
    ├── patterns.ts             # Bloc 1.2
    └── anonymizer.ts           # NOUVEAU - Ce bloc
```

## Interface publique exportée

```typescript
// Classes
export { Anonymizer } from './anonymizer';

// Instance singleton
export { anonymizer, anonymize } from './anonymizer';

// Types (ré-exportés)
export { AnonymizationResult, AnonymizationContext } from './types';
```

## Validation

Ce bloc est terminé quand :

- [ ] `src/lib/anonymization/anonymizer.ts` créé
- [ ] Dépendance `uuid` ajoutée
- [ ] La classe `Anonymizer` implémente l'interface `IAnonymizer`
- [ ] Le singleton `anonymizer` est exporté
- [ ] Le fichier compile sans erreur : `pnpm tsc --noEmit`
- [ ] Les tests manuels passent

## Tests manuels

```typescript
import { anonymizer, anonymize } from './anonymizer';

// Test 1: Texte avec NIR
const result1 = anonymize(
  "Patient M. DUPONT Jean, NIR 1 85 12 75 108 123 45, né le 15/03/1985"
);
console.log('Anonymisé:', result1.anonymizedText);
console.log('Tokens créés:', result1.context.stats.totalTokens);
console.log('Par type:', result1.context.stats.byType);
// Attendu: Le texte contient des tokens [NIR_xxx], [NAME_xxx], [BIRTH_DATE_xxx]

// Test 2: Texte sans données sensibles
const result2 = anonymize("Le patient présente une otite moyenne aiguë");
console.log('hasAnonymizedData:', result2.hasAnonymizedData);
// Attendu: false

// Test 3: Texte avec email et téléphone
const result3 = anonymize(
  "Contact: jean.dupont@email.com, tél: 06 12 34 56 78"
);
console.log('Anonymisé:', result3.anonymizedText);
// Attendu: [EMAIL_xxx], [PHONE_xxx]

// Test 4: Vérification du contexte
const result4 = anonymize("NIR: 185127510812345");
const entry = result4.context.entries.values().next().value;
console.log('Token:', entry.token);
console.log('Valeur originale:', entry.originalValue);
// Attendu: le token et "185127510812345"

// Test 5: Performance
const longText = "Patient M. DUPONT, NIR 185127510812345. ".repeat(100);
const start = performance.now();
const result5 = anonymize(longText);
console.log('Temps (ms):', performance.now() - start);
console.log('Tokens:', result5.context.stats.totalTokens);
// Attendu: < 100ms pour 100 répétitions
```

## Exemple d'utilisation dans une route API

```typescript
// src/app/api/ordonnances/route.ts (exemple - implémenté bloc 2.1)
import { anonymize } from '@/lib/anonymization';

export async function POST(request: NextRequest) {
  const { conduite, contextePatient } = await request.json();
  
  // Anonymiser avant envoi à Anthropic
  const { anonymizedText, context } = anonymize(
    `${conduite}\n\nContexte: ${contextePatient}`
  );
  
  // Appeler Anthropic avec le texte anonymisé
  const response = await anthropic.messages.create({
    messages: [{ role: 'user', content: anonymizedText }],
    // ...
  });
  
  // Dé-anonymiser la réponse (bloc 1.4)
  // const originalResponse = deanonymize(response.text, context);
}
```

## Notes importantes

> ⚠️ **Contexte en mémoire** : Le `context` contient les données originales et ne doit JAMAIS être loggé, persisté, ou envoyé à un service externe.

> ⚠️ **Thread-safety** : Le singleton `anonymizer` est stateless (pas de propriétés mutables) et donc thread-safe.

> ℹ️ **Ordre de remplacement** : Les remplacements sont faits de la fin vers le début du texte pour éviter de décaler les indices.

> ℹ️ **UUID partiel** : On utilise 8 caractères d'UUID (32^8 = 1 trillion de possibilités) ce qui est suffisant pour éviter les collisions dans une requête.

---
**Prochain bloc** : 1.4 — Service Deanonymizer + Export
