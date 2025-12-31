import type { CCAMCode, CCAMRegroupement } from '@/types/codage';

export const CCAM_CODES: CCAMCode[] = [
  // Audiométrie (ATM)
  {
    code: 'CDQP002',
    libelle: 'Audiométrie tonale et vocale',
    tarif_base: 26.88,
    regroupement: 'ATM',
  },
  { code: 'CDQP010', libelle: 'Audiométrie tonale', tarif_base: 19.2, regroupement: 'ATM' },
  { code: 'CDQP001', libelle: 'Impédancemétrie', tarif_base: 24.32, regroupement: 'ATM' },
  {
    code: 'CDQP003',
    libelle: 'Audiométrie tonale liminaire et supraliminaire',
    tarif_base: 32.68,
    regroupement: 'ATM',
  },
  {
    code: 'CDQP005',
    libelle: 'Audiométrie vocale dans le bruit',
    tarif_base: 19.2,
    regroupement: 'ATM',
  },
  {
    code: 'CDQP007',
    libelle: 'Potentiels évoqués auditifs du tronc cérébral',
    tarif_base: 96.0,
    regroupement: 'ATM',
  },
  {
    code: 'CDQP008',
    libelle: 'Otoémissions acoustiques provoquées',
    tarif_base: 38.4,
    regroupement: 'ATM',
  },

  // Endoscopie (ENS)
  { code: 'GDRP001', libelle: 'Nasofibroscopie', tarif_base: 44.57, regroupement: 'ENS' },
  { code: 'GEQP004', libelle: 'Laryngoscopie indirecte', tarif_base: 28.8, regroupement: 'ENS' },
  {
    code: 'GEQE002',
    libelle: 'Laryngoscopie directe en suspension',
    tarif_base: 112.7,
    regroupement: 'ENS',
  },
  {
    code: 'GDFE001',
    libelle: 'Examen endoscopique des fosses nasales et du rhinopharynx',
    tarif_base: 32.11,
    regroupement: 'ENS',
  },

  // Vidéonystagmographie (VNG)
  { code: 'CDRP002', libelle: 'Vidéonystagmographie', tarif_base: 75.6, regroupement: 'VNG' },
  {
    code: 'CDRP001',
    libelle: 'Électronystagmographie',
    tarif_base: 64.8,
    regroupement: 'VNG',
  },
  {
    code: 'CDRP003',
    libelle: 'Épreuves vestibulaires caloriques et rotatoires',
    tarif_base: 54.0,
    regroupement: 'VNG',
  },

  // Actes techniques courants (ACT)
  { code: 'LAQK001', libelle: 'Ablation bouchon cérumen', tarif_base: 12.35, regroupement: 'ACT' },
  {
    code: 'CALA001',
    libelle: 'Ablation de corps étranger du conduit auditif externe',
    tarif_base: 20.9,
    regroupement: 'ACT',
  },
  {
    code: 'GALA001',
    libelle: 'Ablation de corps étranger des fosses nasales',
    tarif_base: 20.9,
    regroupement: 'ACT',
  },
  {
    code: 'HALA001',
    libelle: "Ablation de corps étranger de l'oropharynx",
    tarif_base: 20.9,
    regroupement: 'ACT',
  },
  {
    code: 'GAJB001',
    libelle: 'Cautérisation de la tache vasculaire de la cloison nasale',
    tarif_base: 27.85,
    regroupement: 'ACT',
  },
  {
    code: 'GAJE001',
    libelle: 'Méchage antérieur des fosses nasales pour épistaxis',
    tarif_base: 33.44,
    regroupement: 'ACT',
  },
  {
    code: 'GAJE002',
    libelle: 'Tamponnement antéropostérieur pour épistaxis',
    tarif_base: 62.7,
    regroupement: 'ACT',
  },

  // Chirurgie ORL courante (CHI)
  {
    code: 'CAMA001',
    libelle: "Pose d'aérateur transtympanique unilatéral",
    tarif_base: 62.7,
    regroupement: 'CHI',
  },
  {
    code: 'CAMA002',
    libelle: "Pose d'aérateurs transtympaniques bilatéraux",
    tarif_base: 94.05,
    regroupement: 'CHI',
  },
  {
    code: 'CAMA003',
    libelle: 'Myringoplastie',
    tarif_base: 167.2,
    regroupement: 'CHI',
  },
  {
    code: 'HAFA007',
    libelle: 'Amygdalectomie',
    tarif_base: 75.08,
    regroupement: 'CHI',
  },
  {
    code: 'GAFA010',
    libelle: 'Adénoïdectomie',
    tarif_base: 50.05,
    regroupement: 'CHI',
  },
  {
    code: 'GAMA010',
    libelle: 'Septoplastie',
    tarif_base: 167.2,
    regroupement: 'CHI',
  },
  {
    code: 'GBFA001',
    libelle: 'Méatotomie moyenne par voie endonasale',
    tarif_base: 167.2,
    regroupement: 'CHI',
  },
];

export function searchCCAMCodes(query: string, limit = 20, regroupement?: string): CCAMCode[] {
  const normalizedQuery = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let filtered = CCAM_CODES.filter((code) => {
    const normalizedCode = code.code.toLowerCase();
    const normalizedLibelle = code.libelle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return normalizedCode.includes(normalizedQuery) || normalizedLibelle.includes(normalizedQuery);
  });

  if (regroupement) {
    filtered = filtered.filter((code) => code.regroupement === regroupement);
  }

  return filtered.slice(0, limit);
}

export function getCCAMByCode(code: string): CCAMCode | undefined {
  return CCAM_CODES.find((c) => c.code === code);
}

export function getCCAMByRegroupement(regroupement: string): CCAMCode[] {
  return CCAM_CODES.filter((c) => c.regroupement === regroupement);
}

export function getAllRegroupements(): CCAMRegroupement[] {
  return [...new Set(CCAM_CODES.map((c) => c.regroupement))];
}
