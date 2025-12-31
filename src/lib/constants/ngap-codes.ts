import type { NGAPCode, NGAPType } from '@/types/codage';

/**
 * Base de données des codes NGAP ORL
 * Total: 83 codes (13 existants + 70 RAG)
 * Source: NGAP_ORL_RAG_v2.csv + codes consultations/majorations
 */
export const NGAP_CODES: NGAPCode[] = [
  // ============================================================================
  // Consultations (codes existants)
  // ============================================================================
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

  // ============================================================================
  // Majorations (codes existants)
  // ============================================================================
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

  // ============================================================================
  // Actes NGAP ORL avec données RAG
  // ============================================================================
  {
    code: 'K10',
    libelle: 'Ponction isolée du sinus maxillaire',
    tarif_base: 19.2,
    type: 'acte',
    coefficient: 10.0,
    cotation: 'K10',
    categorie: 'Actes ORL - Sinus',
    content:
      'Ponction isolée du sinus maxillaire. Acte réalisé par médecin ORL ou généraliste pour drainer un sinus maxillaire infecté ou obstrué. Indications : sinusite maxillaire chronique, empyème sinusien, collection purulente. Peut nécessiter soins infirmiers post-intervention.',
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre III Chap.IV Art.2',
    keywords: ['sinus maxillaire', 'ponction sinusienne', 'sinusite', 'drainage sinus', 'empyème'],
    profession: 'Médecin',
  },
  {
    code: 'K5',
    libelle: "Prélèvement pour examen de laboratoire d'une lésion intrabuccale de l'oropharynx",
    tarif_base: 9.6,
    type: 'acte',
    coefficient: 5.0,
    cotation: 'K5',
    categorie: 'Actes ORL - Pharynx',
    content:
      "Prélèvement pour examen de laboratoire d'une lésion intrabuccale de l'oropharynx. Analyse cytologique ou bactériologique. Indications : tumeur oropharynx, lésion suspecte amygdale, ulcération pharyngée. Résultats transmis au laboratoire.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre III Chap.V Art.6',
    keywords: [
      'oropharynx',
      'prélèvement',
      'biopsie',
      'lésion buccale',
      'tumeur bouche',
      'amygdale',
    ],
    profession: 'Médecin',
  },
  {
    code: 'K10',
    libelle: "Prélèvement pour examen de laboratoire d'une lésion de l'hypopharynx ou du cavum",
    tarif_base: 19.2,
    type: 'acte',
    coefficient: 10.0,
    cotation: 'K10',
    categorie: 'Actes ORL - Pharynx',
    content:
      "Prélèvement pour examen de laboratoire d'une lésion de l'hypopharynx ou du cavum. Analyse d'une lésion du rhinopharynx ou hypopharynx. Indications : cancer du cavum, tumeur rhinopharynx, lésion suspecte hypopharynx.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre III Chap.V Art.6',
    keywords: ['hypopharynx', 'cavum', 'rhinopharynx', 'nasopharynx', 'biopsie', 'cancer cavum'],
    profession: 'Médecin',
  },
  {
    code: 'K5',
    libelle:
      "Diathermo-coagulation d'une leucoplasie, lupus ou tumeur bénigne de la cavité buccale",
    tarif_base: 9.6,
    type: 'acte',
    coefficient: 5.0,
    cotation: 'K5',
    categorie: 'Actes ORL - Bouche',
    content:
      "Diathermo-coagulation d'une leucoplasie, lupus ou tumeur bénigne de la cavité buccale. Traitement par électrocoagulation de lésions buccales bénignes. Indications : leucoplasie buccale, papillome, tumeur bénigne muqueuse buccale.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre III Chap.V Art.6',
    keywords: [
      'leucoplasie',
      'diathermocoagulation',
      'tumeur bénigne',
      'électrocoagulation',
      'papillome',
    ],
    profession: 'Médecin',
  },
  {
    code: 'CAHA001',
    libelle: "Biopsie unilatérale ou bilatérale de la peau de l'oreille externe",
    tarif_base: 0.0,
    type: 'acte',
    cotation: 'CCAM CAHA001',
    categorie: 'Actes ORL - Oreille',
    content:
      "Biopsie unilatérale ou bilatérale de la peau de l'oreille externe. Cité NGAP Art.15.6 comme associable à 50% avec avis consultant. Indications : lésion cutanée suspecte pavillon, carcinome basocellulaire, spinocellulaire, mélanome oreille.",
    conditions: 'Associable 50% avec C2',
    reference_ngap: 'CCAM cité NGAP Art.15.6',
    keywords: [
      'biopsie oreille',
      'peau oreille',
      'lésion pavillon',
      'carcinome oreille',
      'mélanome',
    ],
    profession: 'Médecin',
  },
  {
    code: 'CAHA002',
    libelle: "Biopsie unilatérale ou bilatérale du cartilage de l'oreille externe",
    tarif_base: 0.0,
    type: 'acte',
    cotation: 'CCAM CAHA002',
    categorie: 'Actes ORL - Oreille',
    content:
      "Biopsie unilatérale ou bilatérale du cartilage de l'oreille externe. Cité NGAP Art.15.6 comme associable à 50% avec avis consultant. Indications : chondrite, polychondrite, lésion cartilagineuse suspecte pavillon.",
    conditions: 'Associable 50% avec C2',
    reference_ngap: 'CCAM cité NGAP Art.15.6',
    keywords: ['biopsie cartilage oreille', 'chondrite', 'polychondrite', 'lésion cartilage'],
    profession: 'Médecin',
  },
  {
    code: 'GAHA001',
    libelle: 'Biopsie de la peau du nez et/ou de la muqueuse narinaire',
    tarif_base: 0.0,
    type: 'acte',
    cotation: 'CCAM GAHA001',
    categorie: 'Actes ORL - Nez',
    content:
      'Biopsie de la peau du nez et/ou de la muqueuse narinaire. Cité NGAP Art.15.6 comme associable à 50% avec avis consultant. Indications : lésion cutanée suspecte nez, carcinome nasal, tumeur muqueuse nasale.',
    conditions: 'Associable 50% avec C2',
    reference_ngap: 'CCAM cité NGAP Art.15.6',
    keywords: ['biopsie nez', 'muqueuse nasale', 'lésion nez', 'tumeur nez', 'carcinome nasal'],
    profession: 'Médecin',
  },
  {
    code: 'HAHA002',
    libelle: 'Biopsie de lèvre',
    tarif_base: 0.0,
    type: 'acte',
    cotation: 'CCAM HAHA002',
    categorie: 'Actes ORL - Bouche',
    content:
      'Biopsie de lèvre. Cité NGAP Art.15.6 comme associable à 50% avec avis consultant. Indications : lésion labiale suspecte, carcinome lèvre, chéilite suspecte. Résultats transmis anatomopathologie.',
    conditions: 'Associable 50% avec C2',
    reference_ngap: 'CCAM cité NGAP Art.15.6',
    keywords: ['biopsie lèvre', 'lésion labiale', 'tumeur lèvre', 'carcinome lèvre', 'chéilite'],
    profession: 'Médecin',
  },
  {
    code: 'AMO 20',
    libelle: "Bilan de prévention et d'accompagnement parental",
    tarif_base: 50.0,
    type: 'bilan',
    coefficient: 20.0,
    cotation: 'AMO 20',
    categorie: 'Bilan Orthophonique',
    content:
      "Bilan de prévention et d'accompagnement parental. Réalisé quand rééducation non nécessaire après examen. Conseils prévention et accompagnement famille. Note obligatoire au prescripteur. Ne doit pas être suivi de rééducation.",
    conditions: 'Note obligatoire au prescripteur',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'bilan prévention',
      'accompagnement parental',
      'guidance parentale',
      'prévention langage',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 26',
    libelle: 'Bilan de la déglutition et des fonctions vélo-tubo-tympaniques',
    tarif_base: 65.0,
    type: 'bilan',
    coefficient: 26.0,
    cotation: 'AMO 26',
    categorie: 'Bilan ORL',
    content:
      "Bilan de la déglutition et des fonctions vélo-tubo-tympaniques. Évalue troubles déglutition et dysfonctions trompe d'Eustache. Prescription ORL fréquente. Indications : otite séromuqueuse récidivante, dysfonction tubaire, fente palatine. Coordination ORL pour suivi audiométrique/tympanométrique.",
    conditions: 'Compte-rendu obligatoire. Minoré 30% si renouvellement',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'bilan déglutition',
      'vélo-tubo-tympanique',
      'trompe Eustache',
      'otite séreuse',
      'otite séromuqueuse',
      'dysfonction tubaire',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 34',
    libelle: 'Bilan de la phonation',
    tarif_base: 85.0,
    type: 'bilan',
    coefficient: 34.0,
    cotation: 'AMO 34',
    categorie: 'Bilan ORL',
    content:
      'Bilan de la phonation. Évalue troubles de la voix (dysphonies). Prescription ORL/phoniatre fréquente. Indications : dysphonie fonctionnelle, nodules cordes vocales, paralysie laryngée, forçage vocal, mue, voix professionnelle. Coordination ORL/phoniatre pour laryngoscopie.',
    conditions: 'Compte-rendu obligatoire. Minoré 30% si renouvellement',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'bilan phonation',
      'voix',
      'dysphonie',
      'trouble voix',
      'larynx',
      'cordes vocales',
      'nodule',
      'paralysie laryngée',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 34',
    libelle: "Bilan des fonctions oro-myo-faciales et de l'oralité",
    tarif_base: 85.0,
    type: 'bilan',
    coefficient: 34.0,
    cotation: 'AMO 34',
    categorie: 'Bilan Orthophonique',
    content:
      "Bilan des fonctions oro-myo-faciales et de l'oralité. Évalue mastication, succion, déglutition, ventilation. Indications : déglutition atypique, ventilation buccale, troubles oralité alimentaire, SAOS, dysmorphose. Coordination orthodontiste, ORL, kiné maxillo-facial.",
    conditions: 'Compte-rendu obligatoire. Minoré 30% si renouvellement',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'oro-myo-facial',
      'oralité',
      'mastication',
      'succion',
      'déglutition atypique',
      'ventilation buccale',
      'apnées',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 34',
    libelle:
      "Bilan de la communication et du langage oral et/ou bilan d'aptitudes à l'acquisition du langage écrit",
    tarif_base: 85.0,
    type: 'bilan',
    coefficient: 34.0,
    cotation: 'AMO 34',
    categorie: 'Bilan Orthophonique',
    content:
      "Bilan de la communication et du langage oral et/ou bilan d'aptitudes à l'acquisition du langage écrit. Évalue compétences communication et langage. Indications : retard langage, trouble développement langage, trouble communication.",
    conditions: 'Compte-rendu obligatoire. Minoré 30% si renouvellement',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'bilan langage oral',
      'communication',
      'retard langage',
      'trouble langage',
      'développement langage',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 34',
    libelle: 'Bilan de la communication et du langage écrit',
    tarif_base: 85.0,
    type: 'bilan',
    coefficient: 34.0,
    cotation: 'AMO 34',
    categorie: 'Bilan Orthophonique',
    content:
      'Bilan de la communication et du langage écrit. Évalue compétences lecture et écriture. Indications : dyslexie, dysorthographie, difficultés apprentissage lecture, retard langage écrit.',
    conditions: 'Compte-rendu obligatoire. Minoré 30% si renouvellement',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'bilan langage écrit',
      'dyslexie',
      'dysorthographie',
      'lecture',
      'écriture',
      'apprentissage',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 34',
    libelle: 'Bilan de la cognition mathématique',
    tarif_base: 85.0,
    type: 'bilan',
    coefficient: 34.0,
    cotation: 'AMO 34',
    categorie: 'Bilan Orthophonique',
    content:
      'Bilan de la cognition mathématique. Évalue troubles calcul et raisonnement logico-mathématique. Indications : dyscalculie, troubles raisonnement logique, difficultés mathématiques.',
    conditions: 'Compte-rendu obligatoire. Minoré 30% si renouvellement',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['dyscalculie', 'cognition mathématique', 'raisonnement logique', 'trouble calcul'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 40',
    libelle: "Bilan des troubles d'origine neurologique",
    tarif_base: 100.0,
    type: 'bilan',
    coefficient: 40.0,
    cotation: 'AMO 40',
    categorie: 'Bilan Neurologique',
    content:
      "Bilan des troubles d'origine neurologique. Évalue troubles langage et communication d'origine neurologique. Prescription neurologue/ORL/MPR. Indications : aphasie post-AVC, dysarthrie, traumatisme crânien, tumeur cérébrale. Coordination équipe pluridisciplinaire.",
    conditions: 'Compte-rendu obligatoire. Minoré 30% si renouvellement',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'bilan neurologique',
      'aphasie',
      'dysarthrie',
      'AVC',
      'neurologie',
      'trouble cognitif',
      'traumatisme crânien',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 40',
    libelle: 'Bilan des bégaiements et autres troubles de la fluence',
    tarif_base: 100.0,
    type: 'bilan',
    coefficient: 40.0,
    cotation: 'AMO 40',
    categorie: 'Bilan Orthophonique',
    content:
      'Bilan des bégaiements et autres troubles de la fluence. Évalue bégaiement et bredouillement. Indications : bégaiement développemental, bégaiement acquis, bredouillement, trouble rythme parole.',
    conditions: 'Compte-rendu obligatoire. Minoré 30% si renouvellement',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['bégaiement', 'fluence', 'bredouillement', 'trouble rythme parole', 'disfluence'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 40',
    libelle:
      'Bilan communication et langage dans handicaps moteur/sensoriel, déficiences intellectuelles, paralysies cérébrales, TSA, maladies génétiques, surdité',
    tarif_base: 100.0,
    type: 'bilan',
    coefficient: 40.0,
    cotation: 'AMO 40',
    categorie: 'Bilan Spécialisé',
    content:
      'Bilan communication et langage dans handicaps moteur/sensoriel, déficiences intellectuelles, paralysies cérébrales, TSA, maladies génétiques, surdité. Expertise spécifique requise. Indications : surdité congénitale/acquise, implant cochléaire, autisme, paralysie cérébrale, trisomie 21. Coordination ORL, audioprothésiste, CAMSP/SESSAD.',
    conditions: 'Compte-rendu obligatoire. Minoré 30% si renouvellement',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'surdité',
      'handicap sensoriel',
      'autisme',
      'TSA',
      'déficience intellectuelle',
      'paralysie cérébrale',
      'implant cochléaire',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 11.4',
    libelle:
      "Rééducation des troubles de la voix d'origine organique ou fonctionnelle et des dyskinésies laryngées",
    tarif_base: 28.5,
    type: 'reeducation',
    coefficient: 11.4,
    cotation: 'AMO 11.4',
    categorie: 'Rééducation ORL',
    content:
      "Rééducation des troubles de la voix d'origine organique ou fonctionnelle et des dyskinésies laryngées. Séance 30min minimum. Série 30 séances puis 20. Indications : dysphonie fonctionnelle, nodules cordes vocales, polypes laryngés, paralysie récurrentielle, forçage vocal. Prescription et suivi ORL/phoniatre, bilan laryngoscopique régulier.",
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'rééducation voix',
      'dysphonie',
      'dyskinésie laryngée',
      'nodule corde vocale',
      'paralysie laryngée',
      'forçage vocal',
      'polype',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 12.8',
    libelle: 'Rééducation des dysphagies',
    tarif_base: 32.0,
    type: 'reeducation',
    coefficient: 12.8,
    cotation: 'AMO 12.8',
    categorie: 'Rééducation ORL',
    content:
      'Rééducation des dysphagies. Séance 30min minimum. Série 30 puis 20 séances. Indications : dysphagie post-AVC, post-chirurgie ORL cancer VADS, neurologique, fausses routes, sujet âgé. Coordination ORL, gastro-entérologue, diététicien pour nutrition et textures.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'dysphagie',
      'trouble déglutition',
      'fausse route',
      'rééducation déglutition',
      'cancer ORL',
      'AVC',
      'VADS',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 13.5',
    libelle: "Rééducation des anomalies des fonctions oro-myo-faciales et de l'oralité",
    tarif_base: 33.75,
    type: 'reeducation',
    coefficient: 13.5,
    cotation: 'AMO 13.5',
    categorie: 'Rééducation Orthophonique',
    content:
      "Rééducation des anomalies des fonctions oro-myo-faciales et de l'oralité. Séance 30min minimum. Série 30 puis 20 séances. Indications : déglutition atypique interposition linguale, ventilation buccale chronique, troubles oralité alimentaire. Coordination orthodontiste, ORL, kiné maxillo-facial.",
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'rééducation oro-faciale',
      'oralité',
      'ventilation buccale',
      'déglutition atypique',
      'mastication',
      'interposition linguale',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 13',
    libelle:
      'Éducation et rééducation de la voix dans pathologies tumorales : voix oro-œsophagiennes et/ou trachéo-œsophagiennes, avec ou sans prothèse phonatoire',
    tarif_base: 32.5,
    type: 'reeducation',
    coefficient: 13.0,
    cotation: 'AMO 13',
    categorie: 'Rééducation Carcinologique',
    content:
      'Éducation et rééducation de la voix dans pathologies tumorales : voix oro-œsophagiennes et/ou trachéo-œsophagiennes, avec ou sans prothèse phonatoire. Séance 30min. Série 30 puis 20. Indications : laryngectomie totale (voix œsophagienne/trachéo-œsophagienne), partielle, cancer larynx, adaptation prothèse phonatoire. Coordination chirurgien ORL cancérologue, suivi oncologique.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'laryngectomie',
      'voix œsophagienne',
      'prothèse phonatoire',
      'cancer larynx',
      'rééducation vocale post-cancer',
      'trachéo-œsophagienne',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9.7',
    libelle: "Rééducation des troubles de l'articulation",
    tarif_base: 24.25,
    type: 'reeducation',
    coefficient: 9.7,
    cotation: 'AMO 9.7',
    categorie: 'Rééducation Orthophonique',
    content:
      "Rééducation des troubles de l'articulation. Séance 30min minimum. Série 30 puis 20 séances. Indications : sigmatisme (zozotement), schlintement, troubles articulatoires isolés, déformations phonétiques.",
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'trouble articulation',
      'sigmatisme',
      'zozotement',
      'schlintement',
      'phonétique',
      'articulation',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9.8',
    libelle: 'Rééducation de la déglutition dysfonctionnelle',
    tarif_base: 24.5,
    type: 'reeducation',
    coefficient: 9.8,
    cotation: 'AMO 9.8',
    categorie: 'Rééducation ORL',
    content:
      'Rééducation de la déglutition dysfonctionnelle. Séance 30min minimum. Série 30 puis 20 séances. Indications : déglutition atypique persistante, primaire (infantile), interposition linguale, incompétence labiale. Coordination orthodontiste (traitement ODF), ORL pour bilan ventilatoire.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'déglutition dysfonctionnelle',
      'déglutition atypique',
      'déglutition primaire',
      'interposition linguale',
      'orthodontie',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9.9',
    libelle: 'Rééducation vélo-tubo-tympanique',
    tarif_base: 24.75,
    type: 'reeducation',
    coefficient: 9.9,
    cotation: 'AMO 9.9',
    categorie: 'Rééducation ORL',
    content:
      "Rééducation vélo-tubo-tympanique. Séance 30min minimum. Série 30 puis 20 séances. Indications : dysfonction trompe d'Eustache, otites séromuqueuses récidivantes, après pose ATT, béance tubaire, insuffisance vélaire. Prescription ORL, suivi audiométrique/tympanométrique régulier, coordination pose/retrait ATT.",
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'vélo-tubo-tympanique',
      'trompe Eustache',
      'otite séreuse',
      'otite séromuqueuse',
      'aérateur transtympanique',
      'ATT',
      'dysfonction tubaire',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 11.6',
    libelle:
      'Rééducation des troubles de la communication et du langage écrit (dyslexie, dysorthographie)',
    tarif_base: 29.0,
    type: 'reeducation',
    coefficient: 11.6,
    cotation: 'AMO 11.6',
    categorie: 'Rééducation Orthophonique',
    content:
      'Rééducation des troubles de la communication et du langage écrit (dyslexie, dysorthographie). Séance 30min minimum. Série 30 puis 20 séances. Indications : dyslexie, dysorthographie, troubles apprentissage lecture/écriture.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'dyslexie',
      'dysorthographie',
      'trouble lecture',
      'trouble écriture',
      'apprentissage écrit',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 11.7',
    libelle: 'Rééducation des troubles de la cognition mathématique (dyscalculie)',
    tarif_base: 29.25,
    type: 'reeducation',
    coefficient: 11.7,
    cotation: 'AMO 11.7',
    categorie: 'Rééducation Orthophonique',
    content:
      'Rééducation des troubles de la cognition mathématique (dyscalculie). Séance 30min minimum. Série 30 puis 20 séances. Indications : dyscalculie, troubles raisonnement logico-mathématique.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['dyscalculie', 'trouble calcul', 'raisonnement logique', 'trouble mathématique'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 11.5',
    libelle: "Rééducation des troubles du graphisme et de l'écriture (dysgraphie)",
    tarif_base: 28.75,
    type: 'reeducation',
    coefficient: 11.5,
    cotation: 'AMO 11.5',
    categorie: 'Rééducation Orthophonique',
    content:
      "Rééducation des troubles du graphisme et de l'écriture (dysgraphie). Séance 30min minimum. Série 30 puis 20 séances. Indications : dysgraphie, troubles graphisme, difficultés motricité fine écriture. Coordination possible ergothérapeute.",
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['dysgraphie', 'trouble écriture', 'graphisme', 'motricité fine écriture'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 12.1',
    libelle: 'Rééducation des retards de parole et troubles de la communication et du langage oral',
    tarif_base: 30.25,
    type: 'reeducation',
    coefficient: 12.1,
    cotation: 'AMO 12.1',
    categorie: 'Rééducation Orthophonique',
    content:
      'Rééducation des retards de parole et troubles de la communication et du langage oral. Séance 30min minimum. Série 30 puis 20 séances. Indications : retard parole, retard simple langage, trouble communication orale.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['retard parole', 'retard langage', 'trouble communication', 'trouble langage oral'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 12.6',
    libelle:
      'Rééducation retards de parole et troubles communication/langage oral pour patient 3 à 6 ans inclus',
    tarif_base: 31.5,
    type: 'reeducation',
    coefficient: 12.6,
    cotation: 'AMO 12.6',
    categorie: 'Rééducation Pédiatrique',
    content:
      'Rééducation retards de parole et troubles communication/langage oral pour patient 3 à 6 ans inclus. Cotation majorée jeunes enfants. Séance 30min. Série 30 puis 20. Indications : retard langage jeune enfant, trouble communication maternelle. Coordination pédiatre, ORL, école maternelle.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'retard parole enfant',
      'retard langage petit',
      'trouble communication enfant',
      'maternelle',
      'pédiatrique',
      '3-6 ans',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 12.2',
    libelle: 'Rééducation des troubles de la fluence (bégaiement, bredouillement)',
    tarif_base: 30.5,
    type: 'reeducation',
    coefficient: 12.2,
    cotation: 'AMO 12.2',
    categorie: 'Rééducation Orthophonique',
    content:
      'Rééducation des troubles de la fluence (bégaiement, bredouillement). Séance 30min minimum. Série 30 puis 20 séances. Indications : bégaiement développemental/acquis, bredouillement, trouble rythme/débit parole. Accompagnement familial important.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'bégaiement',
      'bredouillement',
      'fluence',
      'rythme parole',
      'trouble débit',
      'disfluence',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 12',
    libelle:
      'Réadaptation à la communication dans surdités acquises appareillées et/ou éducation à la lecture labiale',
    tarif_base: 30.0,
    type: 'reeducation',
    coefficient: 12.0,
    cotation: 'AMO 12',
    categorie: 'Rééducation ORL Surdité',
    content:
      'Réadaptation à la communication dans surdités acquises appareillées et/ou éducation à la lecture labiale. Séance 30min. Série 30 puis 20. Indications : surdité acquise adulte appareillée, presbyacousie appareillée, apprentissage lecture labiale. Coordination ORL prescripteur et audioprothésiste pour réglage appareils.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'surdité acquise',
      'lecture labiale',
      'appareillage auditif',
      'réadaptation auditive',
      'prothèse auditive',
      'presbyacousie',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 13.8',
    libelle:
      'Éducation/rééducation communication et langage dans handicaps moteur/sensoriel, déficiences intellectuelles (paralysie cérébrale, TSA, maladies génétiques)',
    tarif_base: 34.5,
    type: 'reeducation',
    coefficient: 13.8,
    cotation: 'AMO 13.8',
    categorie: 'Rééducation Handicap',
    content:
      'Éducation/rééducation communication et langage dans handicaps moteur/sensoriel, déficiences intellectuelles (paralysie cérébrale, TSA, maladies génétiques). Séance 30min. Série 50 puis 50. Indications : autisme/TSA, paralysie cérébrale, déficience intellectuelle, syndrome génétique. Coordination équipe pluridisciplinaire, MDPH.',
    conditions: 'AP après 100 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'handicap',
      'autisme',
      'TSA',
      'paralysie cérébrale',
      'déficience intellectuelle',
      'maladie génétique',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 14',
    libelle:
      'Rééducation troubles communication et langage oral dans troubles du neurodéveloppement (dysphasie/TDL)',
    tarif_base: 35.0,
    type: 'reeducation',
    coefficient: 14.0,
    cotation: 'AMO 14',
    categorie: 'Rééducation Neurodéveloppement',
    content:
      'Rééducation troubles communication et langage oral dans troubles du neurodéveloppement (dysphasie/TDL). Séance 30min. Série 50 puis 50. Indications : dysphasie, trouble développemental langage (TDL), TSLO. Coordination neuropédiatre, ORL, suivi long terme.',
    conditions: 'AP après 100 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'dysphasie',
      'trouble neurodéveloppement',
      'TDL',
      'trouble développemental langage',
      'TSLO',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 15.7',
    libelle:
      'Rééducation/maintien/adaptation fonctions communication, langage, troubles cognitivo-linguistiques, fonctions oro-myo-faciales chez patients pathologies neurologiques',
    tarif_base: 39.25,
    type: 'reeducation',
    coefficient: 15.7,
    cotation: 'AMO 15.7',
    categorie: 'Rééducation Neurologique',
    content:
      'Rééducation/maintien/adaptation fonctions communication, langage, troubles cognitivo-linguistiques, fonctions oro-myo-faciales chez patients pathologies neurologiques. Séance 45min. Série 50 puis 50. Indications : aphasie post-AVC, traumatisme crânien, tumeur cérébrale, dysarthrie. Coordination neurologue, MPR, équipe rééducation.',
    conditions: 'AP après 100 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'aphasie',
      'AVC',
      'traumatisme crânien',
      'neurologie',
      'dysarthrie',
      'trouble cognitif',
      'rééducation neurologique',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 15.6',
    libelle:
      'Rééducation/maintien/adaptation fonctions communication chez patients pathologies neuro-dégénératives',
    tarif_base: 39.0,
    type: 'reeducation',
    coefficient: 15.6,
    cotation: 'AMO 15.6',
    categorie: 'Rééducation Neurodégénératif',
    content:
      'Rééducation/maintien/adaptation fonctions communication chez patients pathologies neuro-dégénératives. Séance 45min. Série 50 puis 50. Indications : Parkinson, Alzheimer, SLA, sclérose en plaques, démences. Coordination neurologue, gériatre, soins palliatifs si nécessaire.',
    conditions: 'AP après 100 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'Parkinson',
      'Alzheimer',
      'SLA',
      'sclérose',
      'maladie neurodégénérative',
      'démence',
      'palliatif',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 15.4',
    libelle:
      'Démutisation, rééducation ou conservation communication/langage/parole dans surdités appareillées ou non, y compris implantation cochléaire',
    tarif_base: 38.5,
    type: 'reeducation',
    coefficient: 15.4,
    cotation: 'AMO 15.4',
    categorie: 'Rééducation Surdité',
    content:
      'Démutisation, rééducation ou conservation communication/langage/parole dans surdités appareillées ou non, y compris implantation cochléaire. Séance 45min minimum. Série 50 puis 50. Indications : surdité profonde, implant cochléaire, surdité congénitale, démutisation enfant sourd. Coordination ORL implanteur, audioprothésiste, centre implantation, suivi très long terme.',
    conditions: 'AP après 100 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: [
      'surdité',
      'implant cochléaire',
      'démutisation',
      'appareillage auditif',
      'rééducation auditive',
      'sourd',
      'surdité profonde',
    ],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9',
    libelle: 'Rééducation troubles articulation en groupe',
    tarif_base: 22.5,
    type: 'reeducation',
    coefficient: 9.0,
    cotation: 'AMO 9',
    categorie: 'Rééducation Groupe',
    content:
      'Rééducation troubles articulation en groupe. 2-4 patients maximum. Durée minimum 1h. Série 30 puis 20. Groupes gravité homogène conseillés.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['groupe articulation', 'rééducation collective', 'trouble articulation'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9',
    libelle: 'Rééducation déglutition dysfonctionnelle en groupe',
    tarif_base: 22.5,
    type: 'reeducation',
    coefficient: 9.0,
    cotation: 'AMO 9',
    categorie: 'Rééducation Groupe ORL',
    content:
      'Rééducation déglutition dysfonctionnelle en groupe. 2-4 patients maximum. Durée minimum 1h.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['groupe déglutition', 'rééducation collective', 'déglutition atypique'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9',
    libelle: 'Rééducation vélo-tubo-tympanique en groupe',
    tarif_base: 22.5,
    type: 'reeducation',
    coefficient: 9.0,
    cotation: 'AMO 9',
    categorie: 'Rééducation Groupe ORL',
    content:
      'Rééducation vélo-tubo-tympanique en groupe. 2-4 patients maximum. Durée minimum 1h. Indications : dysfonction tubaire, otites séromuqueuses récidivantes.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['groupe VTT', 'trompe Eustache collective', 'otite séreuse groupe'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9',
    libelle: 'Rééducation dysphagies en groupe',
    tarif_base: 22.5,
    type: 'reeducation',
    coefficient: 9.0,
    cotation: 'AMO 9',
    categorie: 'Rééducation Groupe',
    content: 'Rééducation dysphagies en groupe. 2-4 patients. Durée minimum 1h.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['groupe dysphagie', 'rééducation déglutition collective'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9',
    libelle: 'Rééducation troubles voix et dyskinésies laryngées en groupe',
    tarif_base: 22.5,
    type: 'reeducation',
    coefficient: 9.0,
    cotation: 'AMO 9',
    categorie: 'Rééducation Groupe ORL',
    content:
      'Rééducation troubles voix et dyskinésies laryngées en groupe. 2-4 patients. Durée minimum 1h.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['groupe voix', 'dysphonie collective', 'rééducation vocale groupe'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9',
    libelle: 'Rééducation anomalies fonctions oro-myo-faciales et oralité en groupe',
    tarif_base: 22.5,
    type: 'reeducation',
    coefficient: 9.0,
    cotation: 'AMO 9',
    categorie: 'Rééducation Groupe',
    content:
      'Rééducation anomalies fonctions oro-myo-faciales et oralité en groupe. 2-4 patients. Durée minimum 1h.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['groupe oro-facial', 'oralité collective'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9',
    libelle:
      'Éducation et rééducation voix dans pathologies tumorales (voix œsophagiennes, prothèse phonatoire) en groupe',
    tarif_base: 22.5,
    type: 'reeducation',
    coefficient: 9.0,
    cotation: 'AMO 9',
    categorie: 'Rééducation Groupe Carcinologie',
    content:
      "Éducation et rééducation voix dans pathologies tumorales (voix œsophagiennes, prothèse phonatoire) en groupe. 2-4 patients. Durée minimum 1h. L'effet groupe offre soutien mutuel entre patients laryngectomisés.",
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['groupe laryngectomie', 'voix œsophagienne collective', 'cancer larynx groupe'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9',
    libelle: 'Réadaptation communication surdités acquises et éducation lecture labiale en groupe',
    tarif_base: 22.5,
    type: 'reeducation',
    coefficient: 9.0,
    cotation: 'AMO 9',
    categorie: 'Rééducation Groupe Surdité',
    content:
      'Réadaptation communication surdités acquises et éducation lecture labiale en groupe. 2-4 patients. Durée minimum 1h.',
    conditions: 'AP après 50 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['groupe surdité', 'lecture labiale collective', 'réadaptation auditive groupe'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMO 9',
    libelle:
      'Démutisation et rééducation communication dans surdités appareillées ou implantées cochléaires en groupe',
    tarif_base: 22.5,
    type: 'reeducation',
    coefficient: 9.0,
    cotation: 'AMO 9',
    categorie: 'Rééducation Groupe Surdité',
    content:
      'Démutisation et rééducation communication dans surdités appareillées ou implantées cochléaires en groupe. 2-4 patients. Durée minimum 1h. Série 50 puis 50.',
    conditions: 'AP après 100 séances',
    reference_ngap: 'Titre IV Chap.II Art.2',
    keywords: ['groupe implant cochléaire', 'surdité collective', 'démutisation groupe'],
    profession: 'Orthophoniste',
  },
  {
    code: 'AMK 7.99',
    libelle: 'Rééducation maxillo-faciale en dehors de la paralysie faciale',
    tarif_base: 17.5,
    type: 'reeducation',
    coefficient: 7.99,
    cotation: 'AMK 7.99',
    categorie: 'Rééducation ORL',
    content:
      'Rééducation maxillo-faciale en dehors de la paralysie faciale. Prescription médicale ORL/stomatologue/chirurgien maxillo-facial. Indications : dysfonction ATM, SADAM, bruxisme, limitation ouverture buccale, post-chirurgie maxillo-faciale. Coordination ORL, stomatologue, orthodontiste.',
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XIV Chap.II Art.6',
    keywords: [
      'rééducation maxillo-faciale',
      'ATM',
      'articulation temporo-mandibulaire',
      'SADAM',
      'mâchoire',
      'bruxisme',
    ],
    profession: 'Masseur-kinésithérapeute',
  },
  {
    code: 'AMK 8',
    libelle: "Rééducation vestibulaire et des troubles de l'équilibre",
    tarif_base: 17.52,
    type: 'reeducation',
    coefficient: 8.0,
    cotation: 'AMK 8',
    categorie: 'Rééducation ORL Vestibulaire',
    content:
      "Rééducation vestibulaire et des troubles de l'équilibre. Prescription ORL/neurologue. Indications : VPPB, neuronite vestibulaire, maladie de Ménière, presbyvestibulie, troubles équilibre, cinétose, séquelles labyrinthite. Prescription ORL après bilan vestibulaire (VNG, VHIT), coordination suivi réévaluation.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XIV Chap.II Art.6',
    keywords: [
      'rééducation vestibulaire',
      'vertiges',
      'équilibre',
      'VPPB',
      'neuronite',
      'Ménière',
      'cinétose',
      'presbyvestibulie',
    ],
    profession: 'Masseur-kinésithérapeute',
  },
  {
    code: 'AMK 8.01',
    libelle: 'Rééducation troubles de la déglutition isolés',
    tarif_base: 17.54,
    type: 'reeducation',
    coefficient: 8.01,
    cotation: 'AMK 8.01',
    categorie: 'Rééducation ORL',
    content:
      'Rééducation troubles de la déglutition isolés. Prescription médicale obligatoire. Indications : troubles déglutition origine mécanique/neurologique, dysphagie isolée, fausses routes. Coordination orthophoniste (prise en charge complémentaire), ORL pour bilan étiologique.',
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XIV Chap.II Art.6',
    keywords: [
      'déglutition kiné',
      'trouble déglutition',
      'dysphagie',
      'fausse route',
      'coordination orthophoniste',
    ],
    profession: 'Masseur-kinésithérapeute',
  },
  {
    code: 'AMK 8.49',
    libelle:
      'Rééducation maladies respiratoires avec désencombrement urgent (bronchiolite nourrisson, poussée aiguë pathologie respiratoire chronique)',
    tarif_base: 18.59,
    type: 'reeducation',
    coefficient: 8.49,
    cotation: 'AMK 8.49',
    categorie: 'Rééducation Respiratoire Urgente',
    content:
      "Rééducation maladies respiratoires avec désencombrement urgent (bronchiolite nourrisson, poussée aiguë pathologie respiratoire chronique). Jusqu'à 2 séances/jour. Indications : bronchiolite nourrisson, exacerbation BPCO, encombrement bronchique aigu. Prescription médicale urgente, coordination médecin/pédiatre pour réévaluation.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XIV Chap.II Art.5',
    keywords: [
      'bronchiolite',
      'désencombrement urgent',
      'kiné respiratoire urgence',
      'poussée BPCO',
      'encombrement aigu',
    ],
    profession: 'Masseur-kinésithérapeute',
  },
  {
    code: 'AMK 8.5',
    libelle:
      'Rééducation maladies respiratoires obstructives, restrictives ou mixtes (hors urgence)',
    tarif_base: 18.61,
    type: 'reeducation',
    coefficient: 8.5,
    cotation: 'AMK 8.5',
    categorie: 'Rééducation Respiratoire',
    content:
      'Rééducation maladies respiratoires obstructives, restrictives ou mixtes (hors urgence). Prescription médicale obligatoire. Indications : BPCO, asthme, mucoviscidose (hors forfait spécifique), fibrose pulmonaire, bronchectasies, drainage bronchique chronique.',
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XIV Chap.II Art.5',
    keywords: [
      'kiné respiratoire',
      'BPCO',
      'asthme',
      'mucoviscidose',
      'fibrose pulmonaire',
      'drainage bronchique',
      'bronchectasies',
    ],
    profession: 'Masseur-kinésithérapeute',
  },
  {
    code: 'AMK 8.51',
    libelle: 'Rééducation respiratoire préopératoire ou post-opératoire',
    tarif_base: 18.64,
    type: 'reeducation',
    coefficient: 8.51,
    cotation: 'AMK 8.51',
    categorie: 'Rééducation Respiratoire Péri-opératoire',
    content:
      'Rééducation respiratoire préopératoire ou post-opératoire. Prescription médicale obligatoire. Indications : préparation respiratoire avant chirurgie thoracique/abdominale haute, rééducation post-opératoire désencombrement, prévention complications pulmonaires. Coordination chirurgien, anesthésiste.',
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XIV Chap.II Art.5',
    keywords: [
      'kiné respiratoire préop',
      'kiné postop',
      'chirurgie thoracique',
      'désencombrement postop',
    ],
    profession: 'Masseur-kinésithérapeute',
  },
  {
    code: 'AMK 10',
    libelle: 'Prise en charge kinésithérapique respiratoire patient mucoviscidose',
    tarif_base: 21.9,
    type: 'reeducation',
    coefficient: 10.0,
    cotation: 'AMK 10',
    categorie: 'Rééducation Mucoviscidose',
    content:
      "Prise en charge kinésithérapique respiratoire patient mucoviscidose. Jusqu'à 2 séances/jour si encombrement important (chaque séance cotée AMK 10). Comprend : kiné respiratoire ventilation/désencombrement, réadaptation effort, apprentissage aérosolthérapie, autodrainage, éducation signes alerte. Coordination équipe CRCM.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XIV Chap.II Art.5',
    keywords: [
      'mucoviscidose',
      'kiné respiratoire muco',
      'drainage bronchique',
      'désencombrement muco',
      'CRCM',
      'aérosolthérapie',
    ],
    profession: 'Masseur-kinésithérapeute',
  },
  {
    code: 'AMK 28',
    libelle:
      'Réadaptation respiratoire patients handicap respiratoire chronique, prise en charge individuelle',
    tarif_base: 61.32,
    type: 'reeducation',
    coefficient: 28.0,
    cotation: 'AMK 28',
    categorie: 'Réadaptation Respiratoire',
    content:
      'Réadaptation respiratoire patients handicap respiratoire chronique, prise en charge individuelle. Séance 1h30 environ. Séquence 20 séances selon évolution. Réservé patients ALD BPCO. Comprend : kiné respiratoire, réentraînement exercice sur machine, renforcement musculaire, éducation santé. Conditions HAS respectées. Prescription pneumologue.',
    conditions: 'Réservé ALD BPCO',
    reference_ngap: 'Titre XIV Chap.II Art.5',
    keywords: [
      'réadaptation respiratoire',
      'BPCO sévère',
      'handicap respiratoire',
      'réentrainement effort',
      'ALD',
    ],
    profession: 'Masseur-kinésithérapeute',
  },
  {
    code: 'AMK 20',
    libelle:
      'Réadaptation respiratoire patients handicap respiratoire chronique en groupe 2-4 personnes',
    tarif_base: 43.8,
    type: 'reeducation',
    coefficient: 20.0,
    cotation: 'AMK 20',
    categorie: 'Réadaptation Respiratoire Groupe',
    content:
      'Réadaptation respiratoire patients handicap respiratoire chronique en groupe 2-4 personnes. Séance 1h30 environ. Réservé patients ALD BPCO. Comprend kiné respiratoire individuelle et réentraînement groupe. Prescription pneumologue obligatoire.',
    conditions: 'Réservé ALD BPCO',
    reference_ngap: 'Titre XIV Chap.II Art.5',
    keywords: [
      'réadaptation respiratoire groupe',
      'BPCO groupe',
      'rééducation respiratoire collective',
    ],
    profession: 'Masseur-kinésithérapeute',
  },
  {
    code: 'AMI 3',
    libelle:
      'Pansement de trachéotomie, y compris aspiration et éventuel changement canule ou sonde',
    tarif_base: 9.45,
    type: 'soins',
    coefficient: 3.0,
    cotation: 'AMI 3',
    categorie: 'Soins ORL Trachéotomie',
    content:
      "Pansement de trachéotomie, y compris aspiration et éventuel changement canule ou sonde. Prescription médicale obligatoire. L'acte inclut : pansement péristomique, aspiration trachéale, changement éventuel canule/sonde. Indications : patient trachéotomisé domicile, post-laryngectomie, ventilation long cours. Prescription ORL/pneumologue, coordination surveillance complications.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XVI Partie I Chap.I Art.2',
    keywords: [
      'trachéotomie',
      'pansement trachéo',
      'canule',
      'aspiration trachéale',
      'soins trachéo',
      'laryngectomie',
    ],
    profession: 'Infirmier',
  },
  {
    code: 'AMI 2',
    libelle: "Lavage d'un sinus",
    tarif_base: 6.3,
    type: 'soins',
    coefficient: 2.0,
    cotation: 'AMI 2',
    categorie: 'Soins ORL',
    content:
      "Lavage d'un sinus. Prescription médicale obligatoire. Indications : irrigation sinusienne post-opératoire (après chirurgie sinus), sinusite chronique nécessitant lavages réguliers. Prescription ORL, souvent post-opératoire chirurgie sinusienne.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XVI Partie I Chap.I Art.5',
    keywords: [
      'lavage sinus',
      'irrigation sinusienne',
      'soins sinus',
      'sinusite',
      'post-opératoire sinus',
    ],
    profession: 'Infirmier',
  },
  {
    code: 'AMI 1.5',
    libelle: "Séance d'aérosol",
    tarif_base: 4.72,
    type: 'soins',
    coefficient: 1.5,
    cotation: 'AMI 1.5',
    categorie: 'Soins Respiratoires',
    content:
      "Séance d'aérosol. Prescription médicale obligatoire. Indications : nébulisation bronchodilatateurs, corticoïdes inhalés, mucolytiques, traitement inhalé pathologies ORL et respiratoires (laryngite, bronchite, asthme, BPCO).",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XVI Partie I Chap.I Art.5',
    keywords: [
      'aérosol',
      'nébulisation',
      'traitement inhalé',
      'bronchodilatateur',
      'corticoïde inhalé',
    ],
    profession: 'Infirmier',
  },
  {
    code: 'SFI 2',
    libelle: "Lavage d'un sinus",
    tarif_base: 5.3,
    type: 'soins',
    coefficient: 2.0,
    cotation: 'SFI 2',
    categorie: 'Soins ORL Obstétrique',
    content:
      "Lavage d'un sinus. Prescription médicale obligatoire. Réalisable par sage-femme dans contexte obstétrical. Indications : sinusite pendant grossesse nécessitant lavages.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XVI Partie I Chap.I Art.5',
    keywords: ['lavage sinus sage-femme', 'soins sinus grossesse', 'sinusite grossesse'],
    profession: 'Sage-femme',
  },
  {
    code: 'SFI 1.5',
    libelle: "Séance d'aérosol",
    tarif_base: 3.97,
    type: 'soins',
    coefficient: 1.5,
    cotation: 'SFI 1.5',
    categorie: 'Soins Respiratoires Obstétrique',
    content:
      "Séance d'aérosol. Prescription médicale obligatoire. Réalisable par sage-femme dans contexte obstétrical.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre XVI Partie I Chap.I Art.5',
    keywords: ['aérosol grossesse', 'nébulisation obstétrique', 'traitement inhalé grossesse'],
    profession: 'Sage-femme',
  },
  {
    code: 'K3',
    libelle:
      "Prélèvements aseptiques à différents niveaux des muqueuses ou de la peau, quel qu'en soit le nombre",
    tarif_base: 5.76,
    type: 'acte',
    coefficient: 3.0,
    cotation: 'K3',
    categorie: 'Prélèvements',
    content:
      "Prélèvements aseptiques à différents niveaux des muqueuses ou de la peau, quel qu'en soit le nombre. Pour examen cytologique, bactériologique, parasitologique, mycologique ou virologique (sauf biopsies). Indications ORL : prélèvement nasal, gorge (écouvillon pharyngé), auriculaire, recherche germes ORL. Résultats transmis laboratoire pour orientation traitement antibiotique.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre II Chap.I',
    keywords: [
      'prélèvement muqueuse',
      'prélèvement nez',
      'prélèvement gorge',
      'écouvillon',
      'bactériologie ORL',
    ],
    profession: 'Médecin',
  },
  {
    code: 'K5',
    libelle: 'Prélèvement simple de peau ou de muqueuse pour examen histologique',
    tarif_base: 9.6,
    type: 'acte',
    coefficient: 5.0,
    cotation: 'K5',
    categorie: 'Prélèvements',
    content:
      'Prélèvement simple de peau ou de muqueuse pour examen histologique. Biopsie simple sans suture. Indications : lésion suspecte peau ou muqueuses ORL nécessitant analyse anatomopathologique.',
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre II Chap.I',
    keywords: [
      'biopsie simple',
      'prélèvement histologique',
      'anatomopathologie',
      'lésion suspecte',
    ],
    profession: 'Médecin',
  },
  {
    code: 'K10',
    libelle:
      'Prélèvement de peau suivi de suture pour examen histologique sur parties découvertes de la tête, du cou ou des mains',
    tarif_base: 19.2,
    type: 'acte',
    coefficient: 10.0,
    cotation: 'K10',
    categorie: 'Prélèvements',
    content:
      'Prélèvement de peau suivi de suture pour examen histologique sur parties découvertes de la tête, du cou ou des mains. Biopsie avec suture zones visibles. Indications : lésion suspecte visage, cou, nécessitant biopsie avec suture esthétique.',
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre II Chap.I',
    keywords: ['biopsie tête', 'biopsie cou', 'biopsie visage', 'prélèvement histologique suturé'],
    profession: 'Médecin',
  },
  {
    code: 'K3',
    libelle: "Ponction d'abcès ou de ganglion",
    tarif_base: 5.76,
    type: 'acte',
    coefficient: 3.0,
    cotation: 'K3',
    categorie: 'Ponctions',
    content:
      "Ponction d'abcès ou de ganglion. Ponction à visée diagnostique ou thérapeutique. Indications ORL : ponction adénopathie cervicale, ponction abcès cervical, tuméfaction cervicale à explorer. Résultats transmis laboratoire si analyse cytologique/bactériologique.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre II Chap.I',
    keywords: [
      'ponction ganglion',
      'ponction abcès',
      'adénopathie',
      'tuméfaction cervicale',
      'abcès cervical',
    ],
    profession: 'Médecin',
  },
  {
    code: 'K3',
    libelle: "Ponction d'un tronc veineux de la tête et du cou",
    tarif_base: 5.76,
    type: 'acte',
    coefficient: 3.0,
    cotation: 'K3',
    categorie: 'Ponctions Vasculaires',
    content:
      "Ponction d'un tronc veineux de la tête et du cou. Peut être réalisé par médecin ou infirmier selon contexte. Indications : prélèvement veineux jugulaire, voie veineuse cervicale.",
    conditions: 'Aucun accord préalable',
    reference_ngap: 'Titre II Chap.V',
    keywords: ['ponction veineuse cou', 'prélèvement jugulaire', 'voie veineuse cervicale'],
    profession: 'Médecin ou Infirmier',
  },
  {
    code: 'K1.5',
    libelle: 'Insufflations de trompe (voies respiratoires)',
    tarif_base: 2.88,
    type: 'acte',
    coefficient: 1.5,
    cotation: 'K1.5',
    categorie: 'Cure Thermale ORL',
    content:
      'Insufflations de trompe (voies respiratoires). Maximum 15 séances par cure. Réalisé en station thermale agréée Voies Respiratoires. Indications : dysfonction tubaire, otites séromuqueuses chroniques, catarrhe tubaire. Prescription médicale préalable cure.',
    conditions: 'Maximum 15 séances/cure',
    reference_ngap: 'Titre XV Chap.IV Art.3',
    keywords: ['insufflation trompe Eustache', 'cure thermale ORL', 'dysfonction tubaire'],
    profession: 'Médecin Thermal',
  },
  {
    code: 'K1',
    libelle: 'Douches pharyngiennes (voies respiratoires)',
    tarif_base: 1.92,
    type: 'acte',
    coefficient: 1.0,
    cotation: 'K1',
    categorie: 'Cure Thermale ORL',
    content:
      'Douches pharyngiennes (voies respiratoires). Maximum 18 séances par cure. Réalisé en station thermale agréée Voies Respiratoires. Indications : pharyngite chronique, rhinopharyngite chronique, irritation pharyngée.',
    conditions: 'Maximum 18 séances/cure',
    reference_ngap: 'Titre XV Chap.IV Art.3',
    keywords: [
      'douche pharyngienne',
      'cure thermale gorge',
      'irrigation pharynx',
      'pharyngite chronique',
    ],
    profession: 'Médecin Thermal',
  },
  {
    code: 'K3',
    libelle: 'Méthode de déplacement de Proëtz (voies respiratoires)',
    tarif_base: 5.76,
    type: 'acte',
    coefficient: 3.0,
    cotation: 'K3',
    categorie: 'Cure Thermale ORL',
    content:
      'Méthode de déplacement de Proëtz (voies respiratoires). Maximum 10 séances par cure. Réalisé en station thermale agréée Voies Respiratoires. Indications : sinusite chronique, lavage sinus par méthode Proëtz, congestion sinusienne chronique.',
    conditions: 'Maximum 10 séances/cure',
    reference_ngap: 'Titre XV Chap.IV Art.3',
    keywords: ['Proëtz', 'lavage sinusien', 'cure thermale sinus', 'sinusite chronique'],
    profession: 'Médecin Thermal',
  },
  {
    code: 'TO 90',
    libelle: 'Traitement des dysmorphoses par période de six mois',
    tarif_base: 24.66,
    type: 'acte',
    coefficient: 90.0,
    cotation: 'TO 90',
    categorie: 'Orthopédie Dento-Faciale',
    content:
      'Traitement des dysmorphoses par période de six mois. Traitement avant 16 ans. Plafond 540 TO. Indications lien ORL : dysmorphose maxillo-faciale avec retentissement ventilation, troubles ventilatoires obstructifs liés anomalie maxillaire, apnées obstructives enfant liées rétrognathie. Coordination ORL si troubles ventilatoires.',
    conditions: 'AP obligatoire. Avant 16 ans. Plafond 540 TO',
    reference_ngap: 'Titre III Chap.VI Art.5',
    keywords: [
      'orthodontie',
      'dysmorphose',
      'traitement ODF',
      'appareil dentaire',
      'ventilation',
      'apnées enfant',
    ],
    profession: 'Chirurgien-Dentiste/Stomatologue',
  },
  {
    code: 'TO 100',
    libelle:
      "Disjonction intermaxillaire rapide pour dysmorphose maxillaire en cas d'insuffisance respiratoire confirmée",
    tarif_base: 27.4,
    type: 'acte',
    coefficient: 100.0,
    cotation: 'TO 100',
    categorie: 'Orthopédie Dento-Faciale ORL',
    content:
      "Disjonction intermaxillaire rapide pour dysmorphose maxillaire en cas d'insuffisance respiratoire confirmée. Indication spécifiquement ORL : insuffisance respiratoire confirmée liée hypoplasie maxillaire. L'indication respiratoire doit être documentée. Coordination étroite ORL et/ou pneumologue qui confirme insuffisance respiratoire. Indication typique : SAOS enfant avec étroitesse maxillaire.",
    conditions: 'AP obligatoire. Insuffisance respiratoire confirmée',
    reference_ngap: 'Titre III Chap.VI Art.5',
    keywords: [
      'disjonction maxillaire',
      'insuffisance respiratoire',
      'expansion maxillaire',
      'SARPE',
      'apnées obstructives',
      'SAOS',
    ],
    profession: 'Chirurgien-Dentiste/Stomatologue',
  },
];

/**
 * Recherche de codes NGAP avec support RAG
 * Recherche dans: code, libelle, content, keywords
 */
export function searchNGAPCodes(query: string, limit = 20, type?: NGAPType): NGAPCode[] {
  const normalizedQuery = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let filtered = NGAP_CODES.filter((code) => {
    const normalizedCode = code.code.toLowerCase();
    const normalizedLibelle = code.libelle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const normalizedContent = (code.content || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const normalizedKeywords = (code.keywords || [])
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return (
      normalizedCode.includes(normalizedQuery) ||
      normalizedLibelle.includes(normalizedQuery) ||
      normalizedContent.includes(normalizedQuery) ||
      normalizedKeywords.includes(normalizedQuery)
    );
  });

  if (type) {
    filtered = filtered.filter((code) => code.type === type);
  }

  return filtered.slice(0, limit);
}

/**
 * Retourne tous les codes NGAP correspondant à un code donné
 * Note: Un même code NGAP peut avoir plusieurs actes différents (ex: K10 pour plusieurs procédures)
 */
export function getNGAPByCode(code: string): NGAPCode[] {
  return NGAP_CODES.filter((c) => c.code === code);
}

/**
 * Retourne le premier code NGAP correspondant (pour rétrocompatibilité)
 * @deprecated Utiliser getNGAPByCode() qui retourne tous les matches
 */
export function getNGAPByCodeFirst(code: string): NGAPCode | undefined {
  return NGAP_CODES.find((c) => c.code === code);
}

export function getConsultationCodes(): NGAPCode[] {
  return NGAP_CODES.filter((c) => c.type === 'consultation');
}

export function getMajorationCodes(): NGAPCode[] {
  return NGAP_CODES.filter((c) => c.type === 'majoration');
}

export function getActeCodes(): NGAPCode[] {
  return NGAP_CODES.filter((c) => c.type === 'acte');
}

export function getBilanCodes(): NGAPCode[] {
  return NGAP_CODES.filter((c) => c.type === 'bilan');
}

export function getReeducationCodes(): NGAPCode[] {
  return NGAP_CODES.filter((c) => c.type === 'reeducation');
}

export function getSoinsCodes(): NGAPCode[] {
  return NGAP_CODES.filter((c) => c.type === 'soins');
}

export function getAllTypes(): NGAPType[] {
  return [...new Set(NGAP_CODES.map((c) => c.type))];
}
