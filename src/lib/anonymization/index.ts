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
export { SensitiveDataType, AnonymizationErrorCode } from './types';
export type {
  AnonymizationContext,
  AnonymizationEntry,
  AnonymizationResult,
  DeanonymizationResult,
  AnonymizationStats,
  AnonymizerOptions,
  IAnonymizer,
} from './types';
export { DEFAULT_ANONYMIZER_OPTIONS, AnonymizationError } from './types';

// Patterns et détection
export {
  detectSensitiveData,
  containsSensitiveData,
  detectSensitiveTypes,
  validateNIR,
  validatePhone,
  validateDate,
} from './patterns';
export type { DetectionMatch } from './patterns';

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
  const { anonymize: doAnonymize } = await import('./anonymizer');
  const { deanonymize: doDeanonymize } = await import('./deanonymizer');

  const { anonymizedText, context, hasAnonymizedData } = doAnonymize(text);
  const result = await asyncFn(anonymizedText);

  if (!hasAnonymizedData) {
    return result;
  }

  const responseText = extractText(result);
  const { originalText } = doDeanonymize(responseText, context);

  return injectText(result, originalText);
}
