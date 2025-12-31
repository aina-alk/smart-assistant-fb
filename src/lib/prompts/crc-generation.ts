/**
 * Helpers pour la génération de Compte-Rendu de Consultation
 */

import type { PatientContext, CRCGenerated } from '@/types/generation';
import { crcGeneratedSchema } from '@/types/generation';

/**
 * Construit le prompt utilisateur pour la génération de CRC
 */
export function buildCRCPrompt(transcription: string, patientContext?: PatientContext): string {
  const contextParts: string[] = [];

  if (patientContext?.age) {
    contextParts.push(`Âge: ${patientContext.age} ans`);
  }

  if (patientContext?.sexe) {
    const sexeLabel = patientContext.sexe === 'M' ? 'Homme' : 'Femme';
    contextParts.push(`Sexe: ${sexeLabel}`);
  }

  if (patientContext?.antecedents) {
    contextParts.push(`Antécédents connus: ${patientContext.antecedents}`);
  }

  const contextSection =
    contextParts.length > 0 ? `CONTEXTE PATIENT:\n${contextParts.join('\n')}\n\n` : '';

  return `${contextSection}DICTÉE MÉDICALE À TRANSFORMER EN COMPTE-RENDU:

${transcription}

Génère le compte-rendu de consultation au format JSON.`;
}

/**
 * Parse et valide la réponse JSON de Claude
 * @throws Error si le JSON est invalide ou ne correspond pas au schema
 */
export function parseCRCResponse(responseText: string): CRCGenerated {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Aucun JSON trouvé dans la réponse');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = crcGeneratedSchema.parse(parsed);

  return validated;
}

/**
 * Extrait le JSON progressivement d'un stream (pour affichage temps réel)
 * Retourne null si le JSON n'est pas encore complet
 */
export function tryParsePartialCRC(partialText: string): Partial<CRCGenerated> | null {
  try {
    const jsonMatch = partialText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch {
    return null;
  }
}
