/**
 * Prompts et helpers pour l'extraction de codes CIM-10
 */

import { z } from 'zod';
import type { CIM10ExtractionResult, DiagnosticSuggestion } from '@/types/codage';

export const CIM10_EXTRACTION_PROMPT = `Tu es un expert en codage médical CIM-10, spécialisé en ORL (Oto-Rhino-Laryngologie).

TÂCHE:
Extraire les codes CIM-10 appropriés depuis un diagnostic médical ORL.

RÈGLES:
1. Suggérer 1 diagnostic PRINCIPAL (le plus pertinent cliniquement)
2. Suggérer 0 à 3 diagnostics SECONDAIRES si pertinents
3. Ne suggérer QUE des codes CIM-10 existants et valides
4. Prioriser les codes les plus spécifiques au diagnostic
5. Si le diagnostic est vague, suggérer le code "sans précision" (SAI)
6. Inclure le libellé officiel français pour chaque code
7. Attribuer un score de confiance entre 0 et 1

CODES ORL COURANTS:
- Oreille: H60-H95 (otites, surdités, vertiges, acouphènes)
- Nez/Sinus: J00-J39, R04 (rhinites, sinusites, polypes, épistaxis)
- Gorge: J02-J06, J35-J39, R49 (pharyngites, amygdalites, dysphonie)
- Cou: K11, R59, E04-E06 (glandes salivaires, adénopathies, thyroïde)

FORMAT DE SORTIE (JSON uniquement):
{
  "principal": { "code": "H90.3", "libelle": "Surdité de perception bilatérale", "confiance": 0.95 },
  "secondaires": [
    { "code": "H93.1", "libelle": "Acouphènes", "confiance": 0.85 }
  ],
  "confiance": 0.90,
  "notes": "string optionnel si ambiguïté ou précisions nécessaires"
}

Si aucun code pertinent ne peut être extrait, retourne:
{
  "principal": null,
  "secondaires": [],
  "confiance": 0,
  "notes": "Diagnostic insuffisant pour codage"
}`;

export function buildDiagnosticExtractionPrompt(diagnostic: string, contexte?: string): string {
  let prompt = `DIAGNOSTIC À CODER:\n${diagnostic}`;

  if (contexte) {
    prompt += `\n\nCONTEXTE CLINIQUE:\n${contexte}`;
  }

  prompt += '\n\nExtrais les codes CIM-10 appropriés au format JSON.';

  return prompt;
}

const diagnosticSuggestionResponseSchema = z.object({
  code: z.string(),
  libelle: z.string(),
  confiance: z.number(),
});

const extractionResponseSchema = z.object({
  principal: diagnosticSuggestionResponseSchema.nullable(),
  secondaires: z.array(diagnosticSuggestionResponseSchema),
  confiance: z.number(),
  notes: z.string().optional(),
});

export function parseCIM10ExtractionResponse(responseText: string): CIM10ExtractionResult {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Aucun JSON trouvé dans la réponse');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = extractionResponseSchema.parse(parsed);

  const mapSuggestion = (
    s: z.infer<typeof diagnosticSuggestionResponseSchema>
  ): DiagnosticSuggestion => ({
    code: s.code,
    libelle: s.libelle,
    confiance: s.confiance,
  });

  return {
    principal: validated.principal
      ? { ...mapSuggestion(validated.principal), isPrincipal: true }
      : null,
    secondaires: validated.secondaires.map(mapSuggestion),
    confiance: validated.confiance,
    notes: validated.notes,
  };
}
