/**
 * Prompts et helpers pour l'extraction de prescriptions médicamenteuses
 */

import { z } from 'zod';
import type { ExtractionOrdonnanceResult, MedicamentExtrait } from '@/types/ordonnance';

export const PRESCRIPTION_EXTRACTION_PROMPT = `Tu es un assistant médical expert en pharmacologie ORL.

TÂCHE:
Extraire les prescriptions médicamenteuses depuis un texte médical (conduite à tenir).

RÈGLES:
1. Extraire UNIQUEMENT les médicaments explicitement mentionnés
2. Déduire la posologie si non précisée (dose usuelle adulte)
3. Ne JAMAIS inventer de médicaments non mentionnés
4. Calculer la quantité à délivrer si possible (durée × prises/jour)
5. Signaler si informations incomplètes ou ambiguës

MÉDICAMENTS ORL COURANTS:
- Antibiotiques: AUGMENTIN, ORELOX, ZITHROMAX, OFLOCET
- Corticoïdes: SOLUPRED, MEDROL, CELESTENE
- Antihistaminiques: AERIUS, ZYRTEC, XYZALL
- Sprays nasaux: NASONEX, AVAMYS, RHINOCORT, PIVALONE
- Antalgiques: DOLIPRANE, EFFERALGAN, DAFALGAN
- Anti-inflammatoires: IBUPROFENE, KETOPROFENE

FORMES GALÉNIQUES:
- comprimé, gélule, sachet
- sirop, suspension buvable
- spray nasal, gouttes auriculaires
- collyre, pommade

FORMAT DE SORTIE (JSON uniquement):
{
  "medicaments": [
    {
      "nom": "AUGMENTIN 1g",
      "forme": "comprimé",
      "posologie": "1 comprimé matin et soir",
      "duree": "7 jours",
      "quantite": 14,
      "instructions": "À prendre pendant les repas"
    }
  ],
  "notes": "string optionnel si ambiguïté ou informations manquantes"
}

Si aucun médicament n'est mentionné, retourne:
{
  "medicaments": [],
  "notes": "Aucune prescription médicamenteuse identifiée"
}`;

export function buildPrescriptionExtractionPrompt(
  conduite: string,
  contextePatient?: string
): string {
  let prompt = `CONDUITE À TENIR:\n${conduite}`;

  if (contextePatient) {
    prompt += `\n\nCONTEXTE PATIENT:\n${contextePatient}`;
  }

  prompt += '\n\nExtrais les prescriptions médicamenteuses au format JSON.';

  return prompt;
}

const medicamentExtraitResponseSchema = z.object({
  nom: z.string(),
  forme: z.string(),
  posologie: z.string(),
  duree: z.string(),
  quantite: z.number().optional(),
  instructions: z.string().optional(),
});

const extractionResponseSchema = z.object({
  medicaments: z.array(medicamentExtraitResponseSchema),
  notes: z.string().optional(),
});

export function parsePrescriptionExtractionResponse(
  responseText: string
): ExtractionOrdonnanceResult {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Aucun JSON trouvé dans la réponse');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = extractionResponseSchema.parse(parsed);

  const medicaments: MedicamentExtrait[] = validated.medicaments.map((m) => ({
    nom: m.nom,
    forme: m.forme,
    posologie: m.posologie,
    duree: m.duree,
    quantite: m.quantite,
    instructions: m.instructions,
  }));

  return {
    medicaments,
    notes: validated.notes,
  };
}
