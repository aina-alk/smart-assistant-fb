/**
 * Service Deanonymizer
 *
 * Restaure les données originales à partir d'un texte tokenisé et de son contexte.
 * Inverse du processus d'anonymisation.
 */

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
   */
  deanonymize(anonymizedText: string, context: AnonymizationContext): DeanonymizationResult {
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
    const seenTokens = new Set<string>();

    // Find all tokens in the text
    const tokenMatches = anonymizedText.matchAll(TOKEN_PATTERN);

    for (const match of tokenMatches) {
      const fullToken = match[0];

      // Skip if already processed (avoid counting duplicates)
      if (seenTokens.has(fullToken)) continue;
      seenTokens.add(fullToken);

      const entry = context.entries.get(fullToken);

      if (entry) {
        // Use replaceAll to handle multiple occurrences of the same token
        restoredText = restoredText.replaceAll(fullToken, entry.originalValue);
        tokensRestored++;
      } else {
        unmatchedTokens.push(fullToken);
      }
    }

    return {
      originalText: restoredText,
      tokensRestored,
      unmatchedTokens,
    };
  }

  containsTokens(text: string): boolean {
    const pattern = new RegExp(TOKEN_PATTERN.source, TOKEN_PATTERN.flags);
    return pattern.test(text);
  }

  extractTokens(text: string): string[] {
    const tokens: string[] = [];
    const pattern = new RegExp(TOKEN_PATTERN.source, TOKEN_PATTERN.flags);

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      tokens.push(match[0]);
    }

    return tokens;
  }

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

export const deanonymizer = new Deanonymizer();

export function deanonymize(
  anonymizedText: string,
  context: AnonymizationContext
): DeanonymizationResult {
  return deanonymizer.deanonymize(anonymizedText, context);
}
