/**
 * Prompts et helpers pour l'extraction de prescriptions d'examens
 */

import { z } from 'zod';
import type { ExtractionBilanResult, ExamenExtrait } from '@/types/bilan';

export const BILAN_EXTRACTION_PROMPT = `Tu es un assistant médical expert en ORL.

TÂCHE:
Extraire les examens complémentaires à prescrire depuis un compte-rendu de consultation (CRC).

RÈGLES:
1. Extraire UNIQUEMENT les examens explicitement mentionnés ou clairement indiqués
2. Déduire les examens pertinents selon le diagnostic et la clinique
3. Ne JAMAIS inventer d'examens non justifiés par le contexte
4. Indiquer si un examen est urgent (suspicion pathologie grave, délai court)
5. Fournir l'indication clinique pour chaque examen

EXAMENS ORL DISPONIBLES:

IMAGERIE:
- IRM-CAI: IRM des conduits auditifs internes (surdité asymétrique, acouphène unilatéral, schwannome)
- IRM-ROCHERS: IRM des rochers (cholestéatome, otite chronique, paralysie faciale)
- TDM-ROCHERS: TDM des rochers (otospongiose, cholestéatome, malformation)
- TDM-SINUS: TDM des sinus (sinusite chronique, polypose, bilan pré-op)
- RADIO-CAVUM: Radio du cavum (hypertrophie adénoïdes enfant)
- PANO-DENTAIRE: Panoramique dentaire (foyer infectieux, sinusite maxillaire)

BIOLOGIE:
- NFS: Numération Formule Sanguine (infection, bilan pré-op)
- CRP: Protéine C-Réactive (syndrome inflammatoire)
- TSH: Thyréostimuline (nodule thyroïde, dysphonie)
- GLYCEMIE: Glycémie à jeun (vertiges, surdité brusque)
- HEMOSTASE: Bilan hémostase (épistaxis, bilan pré-op)

EXPLORATIONS FONCTIONNELLES:
- PEA: Potentiels Évoqués Auditifs (surdité de perception, neurinome)
- VNG: Vidéonystagmographie (vertiges, bilan vestibulaire)
- ENG: Électronystagmographie (syndrome vestibulaire)
- VHIT: Video Head Impulse Test (vertige aigu, névrite vestibulaire)
- PSG: Polysomnographie (SAOS, ronflements, apnées)
- FIBRO-DEG: Fibroscopie de déglutition (dysphagie, fausses routes)

FORMAT DE SORTIE (JSON uniquement):
{
  "examens": [
    {
      "code": "IRM-CAI",
      "libelle": "IRM des conduits auditifs internes",
      "categorie": "imagerie",
      "indication": "Surdité de perception unilatérale droite à explorer",
      "urgent": false
    }
  ],
  "contexte_clinique": "Résumé du contexte clinique justifiant les examens",
  "notes": "string optionnel si ambiguïté ou précisions nécessaires"
}

CATÉGORIES VALIDES: "imagerie", "biologie", "exploration", "autre"

Si aucun examen n'est indiqué, retourne:
{
  "examens": [],
  "contexte_clinique": "",
  "notes": "Aucun examen complémentaire nécessaire selon le CRC"
}`;

export function buildBilanExtractionPrompt(crc: string, diagnostic?: string): string {
  let prompt = `COMPTE-RENDU DE CONSULTATION:\n${crc}`;

  if (diagnostic) {
    prompt += `\n\nDIAGNOSTIC RETENU:\n${diagnostic}`;
  }

  prompt += '\n\nExtrais les examens complémentaires à prescrire au format JSON.';

  return prompt;
}

const examenExtraitResponseSchema = z.object({
  code: z.string(),
  libelle: z.string(),
  categorie: z.enum(['imagerie', 'biologie', 'exploration', 'autre']),
  indication: z.string(),
  urgent: z.boolean(),
});

const extractionResponseSchema = z.object({
  examens: z.array(examenExtraitResponseSchema),
  contexte_clinique: z.string(),
  notes: z.string().optional(),
});

export function parseBilanExtractionResponse(responseText: string): ExtractionBilanResult {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Aucun JSON trouvé dans la réponse');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = extractionResponseSchema.parse(parsed);

  const examens: ExamenExtrait[] = validated.examens.map((e) => ({
    code: e.code,
    libelle: e.libelle,
    categorie: e.categorie,
    indication: e.indication,
    urgent: e.urgent,
  }));

  return {
    examens,
    contexte_clinique: validated.contexte_clinique,
    notes: validated.notes,
  };
}
