/**
 * Base de données des examens ORL courants
 * Utilisée pour la suggestion et la sélection d'examens complémentaires
 */

import type { CategorieExamen } from '@/types/bilan';

// ============================================================================
// Types
// ============================================================================

export interface ExamenORL {
  code: string;
  libelle: string;
  categorie: CategorieExamen;
  description: string;
  indicationsTypes: string[];
}

// ============================================================================
// Examens Imagerie (6)
// ============================================================================

export const EXAMENS_IMAGERIE: ExamenORL[] = [
  {
    code: 'IRM-CAI',
    libelle: 'IRM des conduits auditifs internes',
    categorie: 'imagerie',
    description: 'IRM cérébrale avec séquences centrées sur les CAI et APC',
    indicationsTypes: [
      'surdité asymétrique',
      'acouphène unilatéral',
      'suspicion de schwannome vestibulaire',
      'vertiges atypiques',
    ],
  },
  {
    code: 'IRM-ROCHERS',
    libelle: 'IRM des rochers',
    categorie: 'imagerie',
    description: 'IRM haute résolution des os temporaux',
    indicationsTypes: [
      'cholestéatome',
      'otite chronique',
      'paralysie faciale',
      'pathologie oreille moyenne',
    ],
  },
  {
    code: 'TDM-ROCHERS',
    libelle: 'TDM des rochers',
    categorie: 'imagerie',
    description: 'Scanner haute résolution des os temporaux sans injection',
    indicationsTypes: [
      'otospongiose',
      'cholestéatome',
      'malformation oreille',
      'bilan pré-implant cochléaire',
      'fracture rocher',
    ],
  },
  {
    code: 'TDM-SINUS',
    libelle: 'TDM des sinus',
    categorie: 'imagerie',
    description: 'Scanner des sinus de la face sans injection',
    indicationsTypes: [
      'sinusite chronique',
      'polypose nasosinusienne',
      'bilan pré-chirurgical sinus',
      'sinusite compliquée',
    ],
  },
  {
    code: 'RADIO-CAVUM',
    libelle: 'Radiographie du cavum',
    categorie: 'imagerie',
    description: 'Radiographie de profil du cavum',
    indicationsTypes: ['hypertrophie adénoïdes', 'obstruction nasale enfant', 'ronflements enfant'],
  },
  {
    code: 'PANO-DENTAIRE',
    libelle: 'Panoramique dentaire',
    categorie: 'imagerie',
    description: 'Orthopantomogramme',
    indicationsTypes: [
      'foyer infectieux dentaire',
      'sinusite maxillaire',
      'douleur faciale atypique',
    ],
  },
];

// ============================================================================
// Examens Biologie (5)
// ============================================================================

export const EXAMENS_BIOLOGIE: ExamenORL[] = [
  {
    code: 'NFS',
    libelle: 'Numération Formule Sanguine',
    categorie: 'biologie',
    description: 'Hémogramme complet',
    indicationsTypes: ['infection', 'bilan pré-opératoire', 'anémie', 'syndrome inflammatoire'],
  },
  {
    code: 'CRP',
    libelle: 'Protéine C-Réactive',
    categorie: 'biologie',
    description: 'Marqueur inflammatoire',
    indicationsTypes: ['infection ORL', 'sinusite aiguë', 'otite moyenne aiguë', 'angine'],
  },
  {
    code: 'TSH',
    libelle: 'TSH (Thyréostimuline)',
    categorie: 'biologie',
    description: 'Bilan thyroïdien de base',
    indicationsTypes: ['nodule thyroïdien', 'goitre', 'dysphonie', 'acouphènes'],
  },
  {
    code: 'GLYCEMIE',
    libelle: 'Glycémie à jeun',
    categorie: 'biologie',
    description: 'Dosage glucose sanguin',
    indicationsTypes: ['vertiges', 'surdité brusque', 'bilan métabolique', 'neuropathie'],
  },
  {
    code: 'HEMOSTASE',
    libelle: 'Bilan hémostase',
    categorie: 'biologie',
    description: 'TP, TCA, fibrinogène',
    indicationsTypes: ['bilan pré-opératoire', 'épistaxis récidivante', 'saignement anormal'],
  },
];

// ============================================================================
// Explorations Fonctionnelles (6)
// ============================================================================

export const EXAMENS_EXPLORATION: ExamenORL[] = [
  {
    code: 'PEA',
    libelle: 'Potentiels Évoqués Auditifs',
    categorie: 'exploration',
    description: 'PEA du tronc cérébral',
    indicationsTypes: [
      'surdité de perception',
      'neurinome acoustique',
      'surdité enfant',
      'surdité rétrocochléaire',
    ],
  },
  {
    code: 'VNG',
    libelle: 'Vidéonystagmographie',
    categorie: 'exploration',
    description: 'Exploration vestibulaire complète',
    indicationsTypes: ['vertiges', 'instabilité', 'maladie de Ménière', 'bilan vestibulaire'],
  },
  {
    code: 'ENG',
    libelle: 'Électronystagmographie',
    categorie: 'exploration',
    description: 'Enregistrement des nystagmus',
    indicationsTypes: ['vertiges', 'syndrome vestibulaire', 'névrite vestibulaire'],
  },
  {
    code: 'VHIT',
    libelle: 'Video Head Impulse Test',
    categorie: 'exploration',
    description: 'Test impulsionnel céphalique vidéo',
    indicationsTypes: [
      'vertige aigu',
      'névrite vestibulaire',
      'déficit vestibulaire',
      'VPPB atypique',
    ],
  },
  {
    code: 'PSG',
    libelle: 'Polysomnographie',
    categorie: 'exploration',
    description: 'Enregistrement du sommeil',
    indicationsTypes: ['SAOS', 'ronflements', 'apnées du sommeil', 'somnolence diurne'],
  },
  {
    code: 'FIBRO-DEG',
    libelle: 'Fibroscopie de déglutition',
    categorie: 'exploration',
    description: 'Exploration fonctionnelle de la déglutition',
    indicationsTypes: ['dysphagie', 'fausses routes', 'troubles déglutition', 'paralysie laryngée'],
  },
];

// ============================================================================
// Tous les examens
// ============================================================================

export const TOUS_EXAMENS_ORL: ExamenORL[] = [
  ...EXAMENS_IMAGERIE,
  ...EXAMENS_BIOLOGIE,
  ...EXAMENS_EXPLORATION,
];

// ============================================================================
// Fonctions de recherche
// ============================================================================

export function getExamenByCode(code: string): ExamenORL | undefined {
  return TOUS_EXAMENS_ORL.find((e) => e.code === code);
}

export function getExamensByCategorie(categorie: CategorieExamen): ExamenORL[] {
  return TOUS_EXAMENS_ORL.filter((e) => e.categorie === categorie);
}

export function searchExamens(query: string): ExamenORL[] {
  const lowerQuery = query.toLowerCase();
  return TOUS_EXAMENS_ORL.filter(
    (e) =>
      e.code.toLowerCase().includes(lowerQuery) ||
      e.libelle.toLowerCase().includes(lowerQuery) ||
      e.description.toLowerCase().includes(lowerQuery) ||
      e.indicationsTypes.some((i) => i.toLowerCase().includes(lowerQuery))
  );
}

export function getExamensForIndication(indication: string): ExamenORL[] {
  const lowerIndication = indication.toLowerCase();
  return TOUS_EXAMENS_ORL.filter((e) =>
    e.indicationsTypes.some((i) => i.toLowerCase().includes(lowerIndication))
  );
}
