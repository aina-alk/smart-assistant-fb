/**
 * AssemblyAI Configuration Constants
 *
 * Specialized for ORL (Otorhinolaryngology) medical dictation
 * French language with medical terminology optimization
 */

import type { AssemblyAIConnectionParams, TranscriptionConfig } from '@/types/transcription';

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * AssemblyAI Streaming WebSocket endpoint (v3)
 * Supports Universal Streaming with turn detection
 */
export const ASSEMBLYAI_WEBSOCKET_BASE_URL = 'wss://streaming.assemblyai.com/v3/ws';

/**
 * AssemblyAI REST API base URL (for token generation)
 */
export const ASSEMBLYAI_API_BASE_URL = 'https://api.assemblyai.com/v2';

// ============================================================================
// AUDIO CONFIGURATION
// ============================================================================

/**
 * Audio sample rate in Hz
 * 16kHz is optimal for speech recognition
 */
export const AUDIO_SAMPLE_RATE = 16000;

/**
 * Number of audio channels (mono for speech)
 */
export const AUDIO_CHANNELS = 1;

/**
 * Bits per sample for PCM16
 */
export const AUDIO_BITS_PER_SAMPLE = 16;

/**
 * Audio chunk size in samples (50ms at 16kHz)
 * Smaller chunks = lower latency, larger = better efficiency
 */
export const AUDIO_CHUNK_SIZE = 800; // 50ms * 16000Hz / 1000

/**
 * Audio buffer size for AudioWorklet
 */
export const AUDIO_BUFFER_SIZE = 4096;

// ============================================================================
// ORL MEDICAL TERMINOLOGY (KEYTERMS)
// ============================================================================

/**
 * ORL-specific medical terms for improved transcription accuracy
 * Organized by category for maintainability
 */
export const ORL_KEYTERMS = {
  /**
   * Examens et procédures diagnostiques
   */
  examens: [
    'otoscopie',
    'rhinoscopie',
    'nasofibroscopie',
    'audiométrie',
    'tympanométrie',
    'vidéonystagmographie',
    'potentiels évoqués auditifs',
    'impédancemétrie',
    'otoémissions acoustiques',
    'scanner',
    'TDM',
    'IRM',
    'biopsie',
    'panendoscopie',
    'laryngoscopie',
    'microlaryngoscopie',
    'fibroscopie',
    'stroboscopie',
  ],

  /**
   * Pathologies de l'oreille
   */
  pathologiesOreille: [
    'otite moyenne aiguë',
    'otite séromuqueuse',
    'otite externe',
    'cholestéatome',
    'otospongiose',
    'perforation tympanique',
    'acouphènes',
    'hypoacousie',
    'surdité',
    'presbyacousie',
    'surdité brusque',
    'labyrinthite',
    'maladie de Ménière',
    "neurinome de l'acoustique",
    'vertiges',
    'vertige positionnel paroxystique bénin',
    'VPPB',
  ],

  /**
   * Pathologies naso-sinusiennes
   */
  pathologiesNez: [
    'sinusite',
    'rhinosinusite',
    'polypose nasosinusienne',
    'déviation septale',
    'rhinite allergique',
    'rhinite chronique',
    'épistaxis',
    'rhinorrhée',
    'obstruction nasale',
    'hypertrophie des cornets',
    'anosmie',
    'hyposmie',
  ],

  /**
   * Pathologies pharyngo-laryngées
   */
  pathologiesPharynx: [
    'amygdalite',
    'angine',
    'pharyngite',
    'laryngite',
    'dysphonie',
    'aphonie',
    'dysphagie',
    'odynophagie',
    'reflux pharyngo-laryngé',
    'paralysie laryngée',
    'nodules des cordes vocales',
    'polype vocal',
    'œdème de Reinke',
    'cancer du larynx',
    "cancer de l'oropharynx",
    "cancer de l'hypopharynx",
    'ronflements',
    'apnée du sommeil',
    'SAOS',
  ],

  /**
   * Chirurgies ORL
   */
  chirurgies: [
    'paracentèse',
    'aérateur transtympanique',
    'ATT',
    'yoyo',
    'tympanoplastie',
    'mastoïdectomie',
    'ossiculoplastie',
    'stapédotomie',
    'implant cochléaire',
    'septoplastie',
    'rhinoplastie',
    'turbinoplastie',
    'méatotomie',
    'ethmoïdectomie',
    'sphénoïdotomie',
    'FESS',
    'amygdalectomie',
    'adénoïdectomie',
    'uvulopalatopharyngoplastie',
    'thyroïdectomie',
    'parotidectomie',
    'sous-maxillectomie',
    'curage ganglionnaire',
    'laryngectomie',
    'cordectomie',
    'microchirurgie laryngée',
  ],

  /**
   * Anatomie ORL
   */
  anatomie: [
    'tympan',
    'conduit auditif externe',
    'CAE',
    'oreille moyenne',
    'oreille interne',
    'cochlée',
    'vestibule',
    'osselets',
    'marteau',
    'enclume',
    'étrier',
    "trompe d'Eustache",
    'fosses nasales',
    'sinus maxillaire',
    'sinus frontal',
    'sinus ethmoïdal',
    'sinus sphénoïdal',
    'cornet inférieur',
    'cornet moyen',
    'septum nasal',
    'cavum',
    'rhinopharynx',
    'oropharynx',
    'hypopharynx',
    'larynx',
    'cordes vocales',
    'épiglotte',
    'glandes salivaires',
    'parotide',
    'sous-maxillaire',
    'thyroïde',
    'ganglions cervicaux',
    'adénopathie',
  ],

  /**
   * Traitements et médicaments
   */
  traitements: [
    'corticoïdes',
    'antibiotiques',
    'antihistaminiques',
    'décongestionnants',
    'lavage nasal',
    'aérosol',
    'gouttes auriculaires',
    'prothèse auditive',
    'appareillage auditif',
    'rééducation vestibulaire',
    'orthophonie',
  ],

  /**
   * Abréviations médicales courantes
   */
  abreviations: [
    'ORL',
    'CAT',
    'NFS',
    'CRP',
    'VS',
    'TDM',
    'IRM',
    'PEA',
    'OEA',
    'VNG',
    'ATT',
    'VPPB',
    'SAOS',
    'RGO',
    'FESS',
  ],

  /**
   * Termes de consultation
   */
  consultation: [
    'motif de consultation',
    'antécédents',
    'examen clinique',
    'examen otologique',
    'examen rhinologique',
    'examen pharyngé',
    'examen cervical',
    'conclusion',
    'diagnostic',
    'conduite à tenir',
    'ordonnance',
    'prescription',
    'contrôle',
    'surveillance',
    'avis spécialisé',
  ],
} as const;

/**
 * Flatten all keyterms into a single array
 */
export const ALL_ORL_KEYTERMS: string[] = Object.values(ORL_KEYTERMS).flat();

// ============================================================================
// DEFAULT CONNECTION PARAMETERS
// ============================================================================

/**
 * Default AssemblyAI connection parameters optimized for medical dictation
 */
export const DEFAULT_CONNECTION_PARAMS: AssemblyAIConnectionParams = {
  sample_rate: AUDIO_SAMPLE_RATE,
  format_turns: true,
  end_of_turn_confidence_threshold: 0.6,
  min_end_of_turn_silence_when_confident: 200,
  max_turn_silence: 2600,
  keyterms_prompt: ALL_ORL_KEYTERMS,
  language: 'fr',
};

/**
 * Default transcription configuration
 */
export const DEFAULT_TRANSCRIPTION_CONFIG: TranscriptionConfig = {
  connectionParams: DEFAULT_CONNECTION_PARAMS,
  tokenExpirySeconds: 480, // 8 minutes
  autoReconnect: true,
  maxReconnectAttempts: 3,
  saveAudioLocally: false,
};

// ============================================================================
// ERROR MESSAGES (FRENCH)
// ============================================================================

/**
 * User-friendly error messages in French
 */
export const TRANSCRIPTION_ERROR_MESSAGES: Record<string, string> = {
  MICROPHONE_PERMISSION_DENIED:
    "Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.",
  MICROPHONE_NOT_FOUND: 'Aucun microphone détecté. Veuillez connecter un microphone et réessayer.',
  AUDIO_CONTEXT_ERROR: "Erreur d'initialisation audio. Veuillez rafraîchir la page.",
  WEBSOCKET_CONNECTION_FAILED:
    'Impossible de se connecter au service de transcription. Vérifiez votre connexion internet.',
  WEBSOCKET_CLOSED_UNEXPECTEDLY: 'Connexion au service interrompue. Reconnexion en cours...',
  TOKEN_GENERATION_FAILED: "Erreur d'authentification. Veuillez vous reconnecter.",
  TOKEN_EXPIRED: 'Session expirée. Veuillez redémarrer la transcription.',
  ASSEMBLYAI_ERROR: 'Erreur du service de transcription.',
  NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion internet.',
  UNKNOWN_ERROR: 'Une erreur inattendue est survenue.',
};

// ============================================================================
// WEBSOCKET READY STATES (for type safety)
// ============================================================================

export const WebSocketReadyState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const;

export type WebSocketReadyState = (typeof WebSocketReadyState)[keyof typeof WebSocketReadyState];
