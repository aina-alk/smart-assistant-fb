import type { NGAPCode } from '@/types/codage';

export const NGAP_CODES: NGAPCode[] = [
  // Consultations
  { code: 'C', libelle: 'Consultation généraliste', tarif_base: 26.5, type: 'consultation' },
  { code: 'CS', libelle: 'Consultation spécialiste', tarif_base: 30.0, type: 'consultation' },
  { code: 'APC', libelle: 'Avis ponctuel de consultant', tarif_base: 55.0, type: 'consultation' },
  {
    code: 'COE',
    libelle: 'Consultation très complexe ORL',
    tarif_base: 69.12,
    type: 'consultation',
  },
  {
    code: 'CSC',
    libelle: 'Consultation spécialiste complexe',
    tarif_base: 46.0,
    type: 'consultation',
  },
  { code: 'AVS', libelle: 'Avis de spécialiste', tarif_base: 55.0, type: 'consultation' },

  // Majorations
  { code: 'MPC', libelle: 'Majoration pour coordination', tarif_base: 5.0, type: 'majoration' },
  { code: 'MCS', libelle: 'Majoration spécialiste', tarif_base: 5.0, type: 'majoration' },
  {
    code: 'MCG',
    libelle: 'Majoration coordination généraliste',
    tarif_base: 3.0,
    type: 'majoration',
  },
  { code: 'MN', libelle: 'Majoration nuit (20h-0h, 6h-8h)', tarif_base: 35.0, type: 'majoration' },
  {
    code: 'MM',
    libelle: 'Majoration milieu de nuit (0h-6h)',
    tarif_base: 40.0,
    type: 'majoration',
  },
  { code: 'F', libelle: 'Majoration dimanche et férié', tarif_base: 19.06, type: 'majoration' },
  { code: 'U', libelle: 'Majoration urgence', tarif_base: 22.6, type: 'majoration' },
];

export function searchNGAPCodes(query: string, limit = 20): NGAPCode[] {
  const normalizedQuery = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const filtered = NGAP_CODES.filter((code) => {
    const normalizedCode = code.code.toLowerCase();
    const normalizedLibelle = code.libelle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return normalizedCode.includes(normalizedQuery) || normalizedLibelle.includes(normalizedQuery);
  });

  return filtered.slice(0, limit);
}

export function getNGAPByCode(code: string): NGAPCode | undefined {
  return NGAP_CODES.find((c) => c.code === code);
}

export function getConsultationCodes(): NGAPCode[] {
  return NGAP_CODES.filter((c) => c.type === 'consultation');
}

export function getMajorationCodes(): NGAPCode[] {
  return NGAP_CODES.filter((c) => c.type === 'majoration');
}
