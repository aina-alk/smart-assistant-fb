/**
 * Service Anonymizer
 *
 * Détecte les données sensibles dans un texte et les remplace par des tokens uniques.
 * Le contexte généré permet la restauration ultérieure via Deanonymizer.
 *
 * @security Le contexte contient les données originales.
 * Ne JAMAIS logger, sérialiser ou persister ce contexte.
 */

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
} from './patterns';

/**
 * Génère un token unique pour une donnée sensible
 * Format : [TYPE_xxxxxxxx] où xxxxxxxx est un UUID partiel
 */
function generateToken(type: SensitiveDataType, idLength: number = 8): string {
  const uuid = uuidv4().replace(/-/g, '').substring(0, idLength);
  return `[${type}_${uuid}]`;
}

/**
 * Crée les statistiques vides par type
 */
function createEmptyStatsByType(): Record<SensitiveDataType, number> {
  return Object.values(SensitiveDataType).reduce(
    (acc, type) => ({ ...acc, [type]: 0 }),
    {} as Record<SensitiveDataType, number>
  );
}

/**
 * Service d'anonymisation des données sensibles
 *
 * @example
 * const anonymizer = new Anonymizer();
 * const result = anonymizer.anonymize("Patient M. DUPONT, NIR 185127510812345");
 * // result.anonymizedText = "Patient [NAME_a1b2c3d4], NIR [NIR_e5f6g7h8]"
 */
export class Anonymizer implements IAnonymizer {
  private options: Required<AnonymizerOptions>;

  constructor(options: Partial<AnonymizerOptions> = {}) {
    this.options = { ...DEFAULT_ANONYMIZER_OPTIONS, ...options };
  }

  anonymize(text: string, options?: Partial<AnonymizerOptions>): AnonymizationResult {
    const startTime = performance.now();
    const mergedOptions = { ...this.options, ...options };

    if (typeof text !== 'string') {
      throw new AnonymizationError('Input must be a string', AnonymizationErrorCode.INVALID_INPUT);
    }

    if (!text.trim()) {
      return this.createEmptyResult(text, startTime);
    }

    const matches = detectSensitiveData(text, mergedOptions.enabledTypes);

    if (matches.length === 0) {
      return this.createEmptyResult(text, startTime);
    }

    const context = this.createContext();
    const statsByType = createEmptyStatsByType();

    let anonymizedText = text;
    const sortedMatches = [...matches].sort((a, b) => b.startIndex - a.startIndex);

    for (const match of sortedMatches) {
      const token = generateToken(match.type, mergedOptions.tokenIdLength);

      const entry: AnonymizationEntry = {
        token,
        originalValue: match.value,
        type: match.type,
        startIndex: match.startIndex,
        endIndex: match.endIndex,
      };

      context.entries.set(token, entry);
      statsByType[match.type]++;

      anonymizedText =
        anonymizedText.substring(0, match.startIndex) +
        token +
        anonymizedText.substring(match.endIndex);
    }

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

  containsSensitiveData(text: string): boolean {
    return checkContainsSensitiveData(text);
  }

  detectSensitiveTypes(text: string): SensitiveDataType[] {
    const matches = detectSensitiveData(text, this.options.enabledTypes);
    const types = new Set(matches.map((m) => m.type));
    return Array.from(types);
  }

  deanonymize(): never {
    throw new Error('Use Deanonymizer class for deanonymization');
  }

  private createEmptyResult(text: string, startTime: number): AnonymizationResult {
    const emptyStats: AnonymizationStats = {
      totalTokens: 0,
      byType: createEmptyStatsByType(),
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

  private createContext(): AnonymizationContext {
    return {
      requestId: uuidv4(),
      entries: new Map(),
      createdAt: new Date(),
      stats: {
        totalTokens: 0,
        byType: createEmptyStatsByType(),
        processingTimeMs: 0,
      },
    };
  }
}

export const anonymizer = new Anonymizer();

export function anonymize(text: string, options?: Partial<AnonymizerOptions>): AnonymizationResult {
  return anonymizer.anonymize(text, options);
}
