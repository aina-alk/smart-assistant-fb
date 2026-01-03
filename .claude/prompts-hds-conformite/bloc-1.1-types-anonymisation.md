# [BLOC 1.1] — Types et Interfaces du Module d'Anonymisation

## Contexte

Pour la conformité HDS, les données de santé identifiantes ne doivent pas être envoyées à des services non certifiés (Anthropic, AssemblyAI). Un module d'anonymisation va tokeniser les données sensibles avant envoi et les restaurer après réception de la réponse.

Ce bloc définit les types TypeScript qui structureront tout le module d'anonymisation.

## Objectif de ce bloc

Créer les types, interfaces et enums qui définiront le contrat du module d'anonymisation. Ces types seront utilisés par les blocs suivants (1.2, 1.3, 1.4).

## Pré-requis

- [ ] Aucune dépendance sur d'autres blocs
- [ ] Peut être exécuté en parallèle du Bloc 0

## Spécifications

### 1. Créer le dossier et fichier de types

**Fichier** : `src/lib/anonymization/types.ts` (NOUVEAU)

### 2. Définir les types de données sensibles

```typescript
/**
 * Types de données sensibles détectées et anonymisées
 */
export enum SensitiveDataType {
  NIR = 'NIR',                    // Numéro de sécurité sociale (15 chiffres)
  PHONE = 'PHONE',                // Numéro de téléphone français
  EMAIL = 'EMAIL',                // Adresse email
  BIRTH_DATE = 'BIRTH_DATE',      // Date de naissance
  NAME = 'NAME',                  // Nom propre (prénom, nom de famille)
  ADDRESS = 'ADDRESS',            // Adresse postale
  POSTAL_CODE = 'POSTAL_CODE',    // Code postal
}
```

### 3. Définir l'interface de mapping token ↔ valeur

```typescript
/**
 * Entrée dans le mapping d'anonymisation
 * Stocke la correspondance entre un token et sa valeur originale
 */
export interface AnonymizationEntry {
  token: string;                  // Token généré (ex: [NIR_a1b2c3d4])
  originalValue: string;          // Valeur originale
  type: SensitiveDataType;        // Type de donnée
  startIndex: number;             // Position de début dans le texte original
  endIndex: number;               // Position de fin dans le texte original
}
```

### 4. Définir le contexte d'anonymisation

```typescript
/**
 * Contexte d'une opération d'anonymisation
 * Contient tout le nécessaire pour la dé-anonymisation
 */
export interface AnonymizationContext {
  /** Identifiant unique de la requête (UUID v4) */
  requestId: string;
  
  /** Mapping token → entrée d'anonymisation */
  entries: Map<string, AnonymizationEntry>;
  
  /** Timestamp de création (pour expiration éventuelle) */
  createdAt: Date;
  
  /** Statistiques de l'opération */
  stats: AnonymizationStats;
}
```

### 5. Définir les statistiques

```typescript
/**
 * Statistiques d'une opération d'anonymisation
 */
export interface AnonymizationStats {
  /** Nombre total de tokens créés */
  totalTokens: number;
  
  /** Décompte par type de donnée */
  byType: Record<SensitiveDataType, number>;
  
  /** Temps de traitement en ms */
  processingTimeMs: number;
}
```

### 6. Définir les résultats des opérations

```typescript
/**
 * Résultat d'une opération d'anonymisation
 */
export interface AnonymizationResult {
  /** Texte avec les données sensibles remplacées par des tokens */
  anonymizedText: string;
  
  /** Contexte pour la dé-anonymisation ultérieure */
  context: AnonymizationContext;
  
  /** Indique si des données ont été anonymisées */
  hasAnonymizedData: boolean;
}

/**
 * Résultat d'une opération de dé-anonymisation
 */
export interface DeanonymizationResult {
  /** Texte original restauré */
  originalText: string;
  
  /** Nombre de tokens remplacés */
  tokensRestored: number;
  
  /** Tokens non trouvés dans le contexte (anomalie) */
  unmatchedTokens: string[];
}
```

### 7. Définir les options de configuration

```typescript
/**
 * Options de configuration pour l'anonymiseur
 */
export interface AnonymizerOptions {
  /** Types de données à détecter (par défaut: tous) */
  enabledTypes?: SensitiveDataType[];
  
  /** Préfixe personnalisé pour les tokens (défaut: type en majuscules) */
  tokenPrefix?: string;
  
  /** Longueur de l'ID unique dans le token (défaut: 8) */
  tokenIdLength?: number;
  
  /** Active le mode strict (erreur si pattern ambigu) */
  strictMode?: boolean;
}

/**
 * Configuration par défaut
 */
export const DEFAULT_ANONYMIZER_OPTIONS: Required<AnonymizerOptions> = {
  enabledTypes: Object.values(SensitiveDataType),
  tokenPrefix: '',
  tokenIdLength: 8,
  strictMode: false,
};
```

### 8. Définir les erreurs personnalisées

```typescript
/**
 * Erreur lors de l'anonymisation
 */
export class AnonymizationError extends Error {
  constructor(
    message: string,
    public code: AnonymizationErrorCode,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AnonymizationError';
  }
}

/**
 * Codes d'erreur d'anonymisation
 */
export enum AnonymizationErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  PATTERN_CONFLICT = 'PATTERN_CONFLICT',
  CONTEXT_EXPIRED = 'CONTEXT_EXPIRED',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  DEANONYMIZATION_FAILED = 'DEANONYMIZATION_FAILED',
}
```

### 9. Définir l'interface du service

```typescript
/**
 * Interface du service d'anonymisation
 * Contrat que l'implémentation devra respecter
 */
export interface IAnonymizer {
  /**
   * Anonymise un texte en remplaçant les données sensibles par des tokens
   */
  anonymize(text: string, options?: Partial<AnonymizerOptions>): AnonymizationResult;
  
  /**
   * Restaure le texte original à partir d'un texte anonymisé et de son contexte
   */
  deanonymize(anonymizedText: string, context: AnonymizationContext): DeanonymizationResult;
  
  /**
   * Vérifie si un texte contient des données sensibles
   */
  containsSensitiveData(text: string): boolean;
  
  /**
   * Retourne les types de données détectés dans un texte
   */
  detectSensitiveTypes(text: string): SensitiveDataType[];
}
```

## Structure attendue

```
src/lib/
└── anonymization/
    └── types.ts                # NOUVEAU - Ce bloc
```

## Validation

Ce bloc est terminé quand :

- [ ] `src/lib/anonymization/types.ts` créé
- [ ] Tous les types, interfaces et enums sont définis
- [ ] Le fichier compile sans erreur TypeScript : `pnpm tsc --noEmit`
- [ ] Les exports sont corrects

## Test de compilation

```bash
# Vérifier que les types compilent
pnpm tsc --noEmit

# Ou vérifier juste le fichier
npx tsc src/lib/anonymization/types.ts --noEmit --skipLibCheck
```

## Notes importantes

> ℹ️ **Mapping en mémoire** : Le `Map<string, AnonymizationEntry>` n'est JAMAIS persisté. Il existe uniquement pendant la durée de la requête HTTP.

> ℹ️ **UUID dans les tokens** : Les tokens utilisent des UUID v4 partiels (8 caractères) pour éviter toute collision et empêcher la prédiction.

> ⚠️ **Sécurité** : Le contexte d'anonymisation contient les données originales. Il ne doit JAMAIS être loggé, sérialisé, ou envoyé à un service externe.

---
**Prochain bloc** : 1.2 — Patterns de détection (regex)
