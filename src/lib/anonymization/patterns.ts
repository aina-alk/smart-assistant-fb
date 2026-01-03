/**
 * Patterns de Détection (Regex)
 *
 * Expressions régulières pour détecter les données sensibles dans les textes médicaux.
 * Utilisées par le service Anonymizer pour la tokenisation.
 *
 * @see types.ts pour les types de données sensibles
 */

import { SensitiveDataType } from './types';

// ===== REGEX PATTERNS =====

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
 *
 * NOTE: Use non-capturing groups (?:...) to avoid match[1] returning internal groups
 */
export const NIR_PATTERN =
  /\b[12][0-9]{2}(?:0[1-9]|1[0-2]|[2-9][0-9])(?:0[1-9]|[1-8][0-9]|9[0-9]|2[AB])[0-9]{3}[0-9]{3}[0-9]{2}\b/g;

/** NIR avec espaces/tirets optionnels */
export const NIR_PATTERN_FLEXIBLE =
  /\b[12][\s.-]?[0-9]{2}[\s.-]?(?:0[1-9]|1[0-2]|[2-9][0-9])[\s.-]?(?:0[1-9]|[1-8][0-9]|9[0-9]|2[AB])[\s.-]?[0-9]{3}[\s.-]?[0-9]{3}[\s.-]?[0-9]{2}\b/g;

/**
 * Numéros de téléphone français
 * Formats acceptés :
 * - 06 12 34 56 78
 * - 0612345678
 * - +33 6 12 34 56 78
 * - 0033612345678
 */
export const PHONE_PATTERN = /(?:(?:\+33|0033|0)[\s.-]?)[1-9](?:[\s.-]?[0-9]{2}){4}/g;

/**
 * Adresses email standard
 */
export const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Dates au format français
 * Formats : JJ/MM/AAAA, JJ-MM-AAAA, JJ.MM.AAAA
 *
 * NOTE: Use non-capturing groups (?:...) to avoid match[1] returning day/month/year
 */
export const BIRTH_DATE_PATTERN =
  /\b(?:0[1-9]|[12][0-9]|3[01])[/\-.](?:0[1-9]|1[0-2])[/\-.](?:19[0-9]{2}|20[0-2][0-9])\b/g;

/** Format ISO (AAAA-MM-JJ) */
export const DATE_ISO_PATTERN =
  /\b(?:19[0-9]{2}|20[0-2][0-9])-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])\b/g;

/**
 * Code postal français (5 chiffres)
 * Exclut les séquences qui font partie d'autres patterns (NIR, téléphone)
 *
 * NOTE: Use non-capturing groups (?:...) to return full postal code
 */
export const POSTAL_CODE_PATTERN = /\b(?:0[1-9]|[1-8][0-9]|9[0-5]|97[1-6]|98[4-9])[0-9]{3}\b/g;

/**
 * Adresse postale française
 * Détecte : numéro + type de voie + nom de voie
 *
 * NOTE: Use non-capturing group (?:...) for street type to return full address
 */
export const ADDRESS_PATTERN =
  /\b\d{1,4}[\s,]*(?:rue|avenue|av\.|boulevard|bd\.|allée|impasse|place|chemin|route|passage|square|quai|cours)[\s]+[A-Za-zÀ-ÿ\s\-']{3,50}\b/gi;

/**
 * Patterns de contexte pour les noms propres
 * Détecte les noms après des marqueurs comme "M.", "Mme", "Patient", "Dr"
 *
 * NOTE: These patterns intentionally use capturing groups to extract the name
 * after the context marker (e.g., "M. DUPONT" → captures "DUPONT")
 */
export const NAME_CONTEXT_PATTERNS = [
  // Civilités suivies d'un nom (capture le nom après la civilité)
  /(?:M\.|Mr\.|Mme|Mlle|Madame|Monsieur|Dr\.?|Docteur|Patient|Patiente)[\s]+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:[\s-][A-ZÀ-Ÿ][a-zà-ÿ]+)*)/g,

  // "Nom :" ou "Prénom :" suivi d'une valeur (capture la valeur)
  /(?:Nom|Prénom|Nom de famille|Nom de naissance)[\s]*:[\s]*([A-ZÀ-Ÿ][a-zà-ÿ]+(?:[\s-][A-ZÀ-Ÿ][a-zà-ÿ]+)*)/gi,

  // Nom de famille en majuscules (convention française)
  // Requires at least 3 characters to avoid acronyms like "NIR", "TEL"
  /\b([A-ZÀ-Ÿ]{3,}(?:[\s-][A-ZÀ-Ÿ]{2,})*)\b/g,
];

/**
 * Words that should NOT be detected as names
 * Common French medical/technical acronyms and words
 */
export const NAME_EXCLUSION_LIST = new Set([
  // Medical acronyms
  'NIR',
  'TEL',
  'FAX',
  'EMAIL',
  'SMS',
  'IRM',
  'TDM',
  'ECG',
  'EEG',
  'EMG',
  'ORL',
  'CHU',
  'SAMU',
  'SMUR',
  'AVC',
  'IDM',
  'HTA',
  'AIT',
  'ACR',
  'AVP',
  // Document types
  'CRC',
  'CRO',
  'CRH',
  'NFS',
  'BES',
  'TSH',
  'PSA',
  'INR',
  'HBA',
  'VGM',
  // Common French words in caps
  'PATIENT',
  'PATIENTE',
  'DOCTEUR',
  'CONSULTATION',
  'ORDONNANCE',
  'BILAN',
  'EXAMEN',
  'DIAGNOSTIC',
  'TRAITEMENT',
  'ANTECEDENTS',
  'ALLERGIES',
  'MOTIF',
  'COMPTE',
  'RENDU',
  'DATE',
  'LIEU',
  'ADRESSE',
  'TELEPHONE',
  // Technical
  'URL',
  'PDF',
  'HTML',
  'JSON',
  'API',
  'HTTPS',
  'HTTP',
]);

/**
 * Validates that a detected name is not a common acronym or technical term
 */
export function validateName(name: string): boolean {
  // Reject if in exclusion list
  if (NAME_EXCLUSION_LIST.has(name.toUpperCase())) {
    return false;
  }

  // Reject single-word names shorter than 3 chars (likely acronyms)
  if (!name.includes(' ') && !name.includes('-') && name.length < 3) {
    return false;
  }

  return true;
}

// ===== INTERFACES =====

/**
 * Configuration d'un pattern de détection
 */
export interface PatternConfig {
  type: SensitiveDataType;
  patterns: RegExp[];
  priority: number; // Plus bas = plus prioritaire (pour résoudre les conflits)
  validator?: (match: string) => boolean; // Validation supplémentaire
}

/**
 * Match détecté dans le texte
 */
export interface DetectionMatch {
  type: SensitiveDataType;
  value: string;
  startIndex: number;
  endIndex: number;
}

// ===== FONCTIONS DE VALIDATION =====

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
  const parts = dateStr.split(/[/\-.]/);
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
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// ===== CONFIGURATION DES PATTERNS =====

/**
 * Configuration complète des patterns
 * Triés par priorité (1 = plus haute priorité)
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
    type: SensitiveDataType.ADDRESS,
    patterns: [ADDRESS_PATTERN],
    priority: 5,
  },
  {
    type: SensitiveDataType.POSTAL_CODE,
    patterns: [POSTAL_CODE_PATTERN],
    priority: 6,
  },
  {
    type: SensitiveDataType.NAME,
    patterns: NAME_CONTEXT_PATTERNS,
    priority: 7, // Priorité basse car plus de faux positifs
    validator: validateName,
  },
];

// ===== FONCTIONS DE DETECTION =====

/**
 * Clone une regex pour éviter les problèmes de lastIndex partagé
 */
function cloneRegex(regex: RegExp): RegExp {
  return new RegExp(regex.source, regex.flags);
}

/**
 * Résout les chevauchements en gardant le match le plus prioritaire
 */
function resolveOverlaps(matches: DetectionMatch[]): DetectionMatch[] {
  if (matches.length <= 1) return matches;

  // Trier par position de début, puis par priorité
  const sorted = [...matches].sort((a, b) => {
    if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
    // En cas d'égalité, utiliser la priorité du type
    const priorityA = PATTERN_CONFIGS.find((c) => c.type === a.type)?.priority ?? 99;
    const priorityB = PATTERN_CONFIGS.find((c) => c.type === b.type)?.priority ?? 99;
    return priorityA - priorityB;
  });

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
      // Cloner la regex pour éviter les problèmes de lastIndex partagé
      const regex = cloneRegex(pattern);

      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const value = match[1] || match[0]; // Groupe capturant ou match complet

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
 * Vérifie rapidement si un texte contient des données sensibles
 */
export function containsSensitiveData(text: string): boolean {
  for (const config of PATTERN_CONFIGS) {
    for (const pattern of config.patterns) {
      const regex = cloneRegex(pattern);
      if (regex.test(text)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Retourne les types de données sensibles détectés dans un texte
 */
export function detectSensitiveTypes(text: string): SensitiveDataType[] {
  const types = new Set<SensitiveDataType>();
  const matches = detectSensitiveData(text);

  for (const match of matches) {
    types.add(match.type);
  }

  return Array.from(types);
}
