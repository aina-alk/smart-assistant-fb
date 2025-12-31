/**
 * Configuration AssemblyAI pour transcription vocale ORL
 */

/**
 * URL de base de l'API AssemblyAI v2
 */
export const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com';

/**
 * Vocabulaire médical ORL pour améliorer la reconnaissance vocale
 * Utilisé avec word_boost pour augmenter la précision sur les termes spécialisés
 */
export const ORL_VOCABULARY = [
  // Anatomie
  'tympan',
  'pavillon',
  'conduit auditif',
  'cochlée',
  'vestibule',
  'sinus',
  'fosses nasales',
  'cornet',
  'cloison nasale',
  'septum',
  'pharynx',
  'larynx',
  'amygdales',
  'végétations',
  'luette',
  'épiglotte',
  'glotte',
  'cordes vocales',
  "trompe d'Eustache",

  // Examens
  'otoscopie',
  'rhinoscopie',
  'nasofibroscopie',
  'audiométrie',
  'impédancemétrie',
  'tympanométrie',
  'PEA',
  'vidéonystagmographie',
  'scanner',
  'IRM',
  'TDM',
  'fibroscopie',
  'laryngoscopie',

  // Pathologies
  'otite',
  'cholestéatome',
  'otospongiose',
  'presbyacousie',
  'acouphènes',
  'vertiges',
  'Ménière',
  'neurinome',
  'VPPB',
  'rhinite',
  'sinusite',
  'polypose',
  'déviation septale',
  'épistaxis',
  'angine',
  'pharyngite',
  'laryngite',
  'dysphonie',
  'dysphagie',
  'apnée du sommeil',
  'SAOS',
  'ronflements',

  // Traitements / Chirurgies
  'paracentèse',
  'aérateur',
  'ATT',
  'tympanoplastie',
  'mastoïdectomie',
  'septoplastie',
  'turbinoplastie',
  'méatotomie',
  'FESS',
  'amygdalectomie',
  'adénoïdectomie',
  'cordectomie',
  'laryngectomie',

  // Médicaments courants
  'corticoïdes',
  'antibiotiques',
  'gouttes auriculaires',
  'spray nasal',
  'antihistaminiques',

  // Abréviations
  'ORL',
  'CAE',
  'CAT',
  'NFS',
  'CRP',
] as const;

/**
 * Configuration par défaut pour la transcription AssemblyAI
 */
export const TRANSCRIPTION_CONFIG = {
  /** Langue française */
  language_code: 'fr',
  /** Modèle universel (meilleur pour multilangue) */
  speech_model: 'universal',
  /** Détection des locuteurs (utile si patient parle) */
  speaker_labels: true,
  /** Formatage automatique du texte */
  format_text: true,
  /** Ponctuation automatique */
  punctuate: true,
  /** Boost élevé pour le vocabulaire médical */
  boost_param: 'high',
} as const;

/**
 * Limites de l'API
 */
export const ASSEMBLYAI_LIMITS = {
  /** Taille maximale de fichier (5 GB selon AssemblyAI) */
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024 * 1024,
  /** Taille recommandée pour upload client (100 MB) */
  RECOMMENDED_MAX_SIZE_BYTES: 100 * 1024 * 1024,
  /** Durée maximale recommandée en secondes (10 min) */
  RECOMMENDED_MAX_DURATION_SECONDS: 600,
  /** Intervalle de polling en ms */
  POLLING_INTERVAL_MS: 3000,
  /** Timeout total pour transcription en ms (5 min) */
  TRANSCRIPTION_TIMEOUT_MS: 300000,
} as const;

/**
 * Types MIME audio supportés par AssemblyAI
 */
export const SUPPORTED_AUDIO_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/ogg',
] as const;
