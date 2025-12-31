import { z } from 'zod';
import type { CodageSuggestionResult, ActeSuggestion } from '@/types/codage';

export const CODAGE_SUGGESTION_PROMPT = `Tu es un expert en codage médical français, spécialisé en tarification ORL.

TÂCHE:
Analyser un compte-rendu de consultation (CRC) ORL et suggérer les actes à facturer (NGAP et CCAM).

RÈGLES DE CODAGE:
1. Toujours suggérer UN code de consultation NGAP :
   - CS (30€) : consultation standard
   - COE (69.12€) : consultation très complexe (>30min, pathologie complexe, bilan complet)
   - APC (55€) : patient adressé pour avis ponctuel
   - CSC (46€) : consultation complexe

2. Ajouter les actes CCAM si mentionnés dans le CRC :
   - Audiométrie : CDQP002 (tonale+vocale), CDQP010 (tonale seule), CDQP001 (impédancemétrie)
   - Endoscopie : GDRP001 (nasofibroscopie), GEQP004 (laryngoscopie)
   - Vestibulaire : CDRP002 (VNG), CDRP001 (ENG)
   - Actes : LAQK001 (bouchon cérumen), GAJE001 (méchage épistaxis)

3. Détection des mots-clés :
   - "audiométrie", "audiogramme", "test auditif" → CDQP002 ou CDQP010
   - "tympanométrie", "impédancemétrie", "réflexe stapédien" → CDQP001
   - "nasofibroscopie", "fibroscopie nasale", "endoscopie nasale" → GDRP001
   - "laryngoscopie", "examen des cordes vocales" → GEQP004
   - "vidéonystagmographie", "VNG", "épreuves vestibulaires" → CDRP002
   - "bouchon de cérumen", "extraction cérumen" → LAQK001

CODES NGAP DISPONIBLES:
- C: Consultation généraliste (26.50€)
- CS: Consultation spécialiste (30.00€)
- APC: Avis ponctuel de consultant (55.00€)
- COE: Consultation très complexe ORL (69.12€)
- CSC: Consultation spécialiste complexe (46.00€)

CODES CCAM ORL COURANTS:
- CDQP002: Audiométrie tonale et vocale (26.88€)
- CDQP010: Audiométrie tonale (19.20€)
- CDQP001: Impédancemétrie (24.32€)
- GDRP001: Nasofibroscopie (44.57€)
- GEQP004: Laryngoscopie indirecte (28.80€)
- CDRP002: Vidéonystagmographie (75.60€)
- LAQK001: Ablation bouchon cérumen (12.35€)

FORMAT DE SORTIE (JSON uniquement):
{
  "actes": [
    { "type": "NGAP", "code": "CS", "libelle": "Consultation spécialiste", "tarif_base": 30.00, "confiance": 0.95, "raison": "Consultation standard ORL" },
    { "type": "CCAM", "code": "CDQP002", "libelle": "Audiométrie tonale et vocale", "tarif_base": 26.88, "confiance": 0.90, "raison": "Audiométrie mentionnée dans le CRC" }
  ],
  "confiance": 0.90,
  "notes": "string optionnel si remarques"
}

IMPORTANT:
- Suggérer UNIQUEMENT les codes justifiés par le contenu du CRC
- Ne PAS suggérer d'actes non réalisés
- La confiance doit refléter la certitude de détection`;

export function buildCodageSuggestionPrompt(crc: string, diagnostics?: string[]): string {
  let prompt = `COMPTE-RENDU DE CONSULTATION À ANALYSER:\n${crc}`;

  if (diagnostics && diagnostics.length > 0) {
    prompt += `\n\nDIAGNOSTICS CIM-10 ASSOCIÉS:\n${diagnostics.join('\n')}`;
  }

  prompt += '\n\nAnalyse ce CRC et suggère les actes NGAP/CCAM à facturer au format JSON.';

  return prompt;
}

const acteSuggestionResponseSchema = z.object({
  type: z.enum(['NGAP', 'CCAM']),
  code: z.string(),
  libelle: z.string(),
  tarif_base: z.number(),
  confiance: z.number(),
  raison: z.string().optional(),
});

const suggestionResponseSchema = z.object({
  actes: z.array(acteSuggestionResponseSchema),
  confiance: z.number(),
  notes: z.string().optional(),
});

export function parseCodageSuggestionResponse(responseText: string): CodageSuggestionResult {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Aucun JSON trouvé dans la réponse');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = suggestionResponseSchema.parse(parsed);

  const mapActe = (a: z.infer<typeof acteSuggestionResponseSchema>): ActeSuggestion => ({
    type: a.type,
    code: a.code,
    libelle: a.libelle,
    tarif_base: a.tarif_base,
    confiance: a.confiance,
    raison: a.raison,
  });

  return {
    actes: validated.actes.map(mapActe),
    confiance: validated.confiance,
    notes: validated.notes,
  };
}
