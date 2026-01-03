# [BLOC 1.2] — Patterns de Détection (Regex)

## Contexte

Le module d'anonymisation doit détecter les données sensibles dans le texte médical. Ce bloc définit les expressions régulières et les fonctions de détection pour chaque type de donnée identifié (NIR, téléphone, email, dates, noms, adresses).

## Objectif de ce bloc

Créer le fichier `patterns.ts` contenant toutes les regex de détection et les fonctions utilitaires pour identifier les données sensibles dans un texte médical français.

## Pré-requis

- [ ] Bloc 1.1 terminé (types disponibles)

## Spécifications

### 1. Créer le fichier de patterns

**Fichier** : `src/lib/anonymization/patterns.ts` (NOUVEAU)

### 2. Définir les regex pour chaque type de donnée

#### NIR (Numéro de Sécurité Sociale)

```typescript
/**
 * NIR français : 15 chiffres
 * Format : S AA MM DDD CCC NNN CC
 * - S : Sexe (1 ou 2)
 * - AA : Année de naissance
 * - MM : Mois de naissance (01-12 ou 20+ pour cas spéciaux)
 * - DDD : Département (01-95, 2A, 2B, 97X, 98X, 99)
 * - CCC : Code commune
 * - NNN : Numéro d'ordre
 * - CC : Clé de contrôle
 */
export const NIR_PATTERN = /\b[12][0-9]{2}(0[1-9]|1[0-2]|[2-9][0-9])(0[1-9]|[1-8][0-9]|9[0-9]|2[AB])[0-9]{3}[0-9]{3}[0-9]{2}\b/g;

// Version avec espaces/tirets optionnels
export const NIR_PATTERN_FLEXIBLE = /\b[12][\s.-]?[0-9]{2}[\s.-]?(0[1-9]|1[0-2]|[2-9][0-9])[\s.-]?(0[1-9]|[1-8][0-9]|9[0-9]|2[AB])[\s.-]?[0-9]{3}[\s.-]?[0-9]{3}[\s.-]?[0-9]{2}\b/g;
```

#### Téléphone français

```typescript
/**
 * Numéros de téléphone français
 * Formats acceptés :
 * - 06 12 34 56 78
 * - 0612345678
 * - +33 6 12 34 56 78
 * - 0033612345678
 */
export const PHONE_PATTERN = /(?:(?:\+33|0033|0)[\s.-]?)[1-9](?:[\s.-]?[0-9]{2}){4}/g;
```

#### Email

```typescript
/**
 * Adresses email standard
 */
export const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
```

#### Date de naissance

```typescript
/**
 * Dates au format français
 * Formats : JJ/MM/AAAA, JJ-MM-AAAA, JJ.MM.AAAA
 */
export const BIRTH_DATE_PATTERN = /\b(0[1-9]|[12][0-9]|3[01])[\/\-\.](0[1-9]|1[0-2])[\/\-\.](19[0-9]{2}|20[0-2][0-9])\b/g;

// Format ISO (AAAA-MM-JJ)
export const DATE_ISO_PATTERN = /\b(19[0-9]{2}|20[0-2][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])\b/g;
```

#### Code postal français

```typescript
/**
 * Code postal français (5 chiffres)
 * Exclut les séquences qui font partie d'autres patterns (NIR, téléphone)
 */
export const POSTAL_CODE_PATTERN = /\b(0[1-9]|[1-8][0-9]|9[0-5]|97[1-6]|98[4-9])[0-9]{3}\b/g;
```

#### Adresse postale

```typescript
/**
 * Adresse postale française
 * Détecte : numéro + type de voie + nom de voie
 */
export const ADDRESS_PATTERN = /\b\d{1,4}[\s,]*(rue|avenue|av\.|boulevard|bd\.|allée|impasse|place|chemin|route|passage|square|quai|cours)[\s]+[A-Za-zÀ-ÿ\s\-']{3,50}\b/gi;
```

#### Noms propres (détection contextuelle)

```typescript
/**
 * Patterns de contexte pour les noms propres
 * Détecte les noms après des marqueurs comme "M.", "Mme", "Patient", "Dr"
 */
export const NAME_CONTEXT_PATTERNS = [
  // Civilités suivies d'un nom
  /(?:M\.|Mr\.|Mme|Mlle|Madame|Monsieur|Dr\.?|Docteur|Patient|Patiente)[\s]+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:[\s\-][A-ZÀ-Ÿ][a-zà-ÿ]+)*)/g,
  
  // "Nom :" ou "Prénom :" suivi d'une valeur
  /(?:Nom|Prénom|Nom de famille|Nom de naissance)[\s]*:[\s]*([A-ZÀ-Ÿ][a-zà-ÿ]+(?:[\s\-][A-ZÀ-Ÿ][a-zà-ÿ]+)*)/gi,
  
  // Nom de famille en majuscules (convention française)
  /\b([A-ZÀ-Ÿ]{2,}(?:[\s\-][A-ZÀ-Ÿ]{2,})*)\b/g,
];
```

### 3. Créer l'interface de configuration des patterns

```typescript
import { SensitiveDataType } from './types';

/**
 * Configuration d'un pattern de détection
 */
export interface PatternConfig {
  type: SensitiveDataType;
  patterns: RegExp[];
  priority: number;  // Plus bas = plus prioritaire (pour résoudre les conflits)
  validator?: (match: string) => boolean;  // Validation supplémentaire
}

/**
 * Configuration complète des patterns
 */
export const PATTERN_CONFIGS: PatternConfig[] = [
  {
    type: SensitiveDataType.NIR,
    patterns: [NIR_PATTERN, NIR_PATTERN_FLEXIBLE],
    priority: 1,
    validator: validateNIR,
  },
  {
    type: SensitiveDataType.PHONE,
    patterns: [PHONE_PATTERN],
    priority: 2,
    validator: validatePhone,
  },
  {
    type: SensitiveDataType.EMAIL,
    patterns: [EMAIL_PATTERN],
    priority: 3,
  },
  {
    type: SensitiveDataType.BIRTH_DATE,
    patterns: [BIRTH_DATE_PATTERN, DATE_ISO_PATTERN],
    priority: 4,
    validator: validateDate,
  },
  {
    type: SensitiveDataType.POSTAL_CODE,
    patterns: [POSTAL_CODE_PATTERN],
    priority: 6,
  },
  {
    type: SensitiveDataType.ADDRESS,
    patterns: [ADDRESS_PATTERN],
    priority: 5,
  },
  {
    type: SensitiveDataType.NAME,
    patterns: NAME_CONTEXT_PATTERNS,
    priority: 7,  // Priorité basse car plus de faux positifs
  },
];
```

### 4. Créer les fonctions de validation

```typescript
/**
 * Valide un NIR avec la clé de contrôle
 */
export function validateNIR(nir: string): boolean {
  // Nettoyer le NIR (enlever espaces et tirets)
  const cleaned = nir.replace(/[\s.-]/g, '');
  
  if (cleaned.length !== 15) return false;
  
  // Gérer la Corse (2A, 2B)
  let numericNIR = cleaned;
  if (cleaned.includes('A')) {
    numericNIR = cleaned.replace('A', '0');
  } else if (cleaned.includes('B')) {
    numericNIR = cleaned.replace('B', '0');
  }
  
  // Calcul de la clé
  const nirWithoutKey = numericNIR.substring(0, 13);
  const key = parseInt(numericNIR.substring(13, 15), 10);
  const calculatedKey = 97 - (parseInt(nirWithoutKey, 10) % 97);
  
  return key === calculatedKey;
}

/**
 * Valide un numéro de téléphone français
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.-]/g, '');
  // Doit avoir 10 chiffres (format national) ou 11-12 (format international)
  return /^(?:(?:\+33|0033)?\d{9}|0\d{9})$/.test(cleaned);
}

/**
 * Valide une date (vérifie que c'est une date réelle)
 */
export function validateDate(dateStr: string): boolean {
  // Essayer de parser la date
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length !== 3) return false;
  
  let day: number, month: number, year: number;
  
  // Détecter le format (JJ/MM/AAAA ou AAAA-MM-JJ)
  if (parts[0].length === 4) {
    // Format ISO
    [year, month, day] = parts.map(Number);
  } else {
    // Format français
    [day, month, year] = parts.map(Number);
  }
  
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}
```

### 5. Créer les fonctions utilitaires de détection

```typescript
/**
 * Détecte toutes les occurrences de données sensibles dans un texte
 */
export interface DetectionMatch {
  type: SensitiveDataType;
  value: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Détecte les données sensibles dans un texte
 */
export function detectSensitiveData(
  text: string,
  enabledTypes: SensitiveDataType[] = Object.values(SensitiveDataType)
): DetectionMatch[] {
  const matches: DetectionMatch[] = [];
  
  for (const config of PATTERN_CONFIGS) {
    // Skip si le type n'est pas activé
    if (!enabledTypes.includes(config.type)) continue;
    
    for (const pattern of config.patterns) {
      // Reset le regex (important pour les regex globales)
      pattern.lastIndex = 0;
      
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const value = match[1] || match[0];  // Groupe capturant ou match complet
        
        // Validation supplémentaire si définie
        if (config.validator && !config.validator(value)) {
          continue;
        }
        
        matches.push({
          type: config.type,
          value,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }
  }
  
  // Trier par position et résoudre les conflits (chevauchements)
  return resolveOverlaps(matches);
}

/**
 * Résout les chevauchements en gardant le match le plus prioritaire
 */
function resolveOverlaps(matches: DetectionMatch[]): DetectionMatch[] {
  if (matches.length <= 1) return matches;
  
  // Trier par position de début
  const sorted = [...matches].sort((a, b) => a.startIndex - b.startIndex);
  
  const result: DetectionMatch[] = [];
  let lastEnd = -1;
  
  for (const match of sorted) {
    // Si pas de chevauchement avec le précédent
    if (match.startIndex >= lastEnd) {
      result.push(match);
      lastEnd = match.endIndex;
    }
    // En cas de chevauchement, on garde le premier (déjà trié par priorité)
  }
  
  return result;
}

/**
 * Vérifie rapidement si un texte contient des données sensibles
 */
export function containsSensitiveData(text: string): boolean {
  for (const config of PATTERN_CONFIGS) {
    for (const pattern of config.patterns) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) {
        return true;
      }
    }
  }
  return false;
}
```

## Structure attendue

```
src/lib/
└── anonymization/
    ├── types.ts                # Bloc 1.1
    └── patterns.ts             # NOUVEAU - Ce bloc
```

## Validation

Ce bloc est terminé quand :

- [ ] `src/lib/anonymization/patterns.ts` créé
- [ ] Toutes les regex sont définies et testées
- [ ] Les fonctions de validation sont implémentées
- [ ] `detectSensitiveData()` fonctionne correctement
- [ ] Le fichier compile sans erreur : `pnpm tsc --noEmit`

## Tests manuels

```typescript
// Tester dans un fichier temporaire ou console
import { detectSensitiveData, containsSensitiveData } from './patterns';

// Test NIR
const text1 = "Le patient M. DUPONT, NIR 1 85 12 75 108 123 45, consulte pour...";
console.log(detectSensitiveData(text1));
// Devrait détecter : NIR, NAME

// Test téléphone
const text2 = "Contact : 06 12 34 56 78 ou +33 6 98 76 54 32";
console.log(detectSensitiveData(text2));
// Devrait détecter : 2 PHONE

// Test email
const text3 = "Email du patient : jean.dupont@gmail.com";
console.log(detectSensitiveData(text3));
// Devrait détecter : EMAIL, NAME

// Test date
const text4 = "Né le 15/03/1985 à Paris";
console.log(detectSensitiveData(text4));
// Devrait détecter : BIRTH_DATE

// Test adresse
const text5 = "Domicile : 42 rue de la Paix, 75002 Paris";
console.log(detectSensitiveData(text5));
// Devrait détecter : ADDRESS, POSTAL_CODE
```

## Notes importantes

> ⚠️ **Faux positifs** : Les regex de noms propres peuvent avoir des faux positifs. Le mode `strictMode` dans les options permettra de les réduire.

> ⚠️ **Performance** : Les regex avec lookbehind/lookahead peuvent être lentes sur de longs textes. Les patterns ont été optimisés pour la performance.

> ℹ️ **Regex globales** : Toujours reset `pattern.lastIndex = 0` avant utilisation car les regex globales conservent leur état.

> ℹ️ **Priorité** : En cas de chevauchement (ex: un code postal dans un NIR), le type avec la priorité la plus haute gagne.

---
**Prochain bloc** : 1.3 — Service Anonymizer
