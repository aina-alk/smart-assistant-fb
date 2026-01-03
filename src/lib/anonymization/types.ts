/**
 * Types et Interfaces du Module d'Anonymisation
 *
 * Pour la conformité HDS, les données de santé identifiantes ne doivent pas être
 * envoyées à des services non certifiés (Anthropic, AssemblyAI). Ce module définit
 * les types qui structurent l'anonymisation par tokenisation.
 *
 * @security Le contexte d'anonymisation contient les données originales.
 * Il ne doit JAMAIS être loggé, sérialisé, ou envoyé à un service externe.
 */

// ===== ENUMS =====

/**
 * Types de données sensibles détectées et anonymisées
 */
export enum SensitiveDataType {
  NIR = 'NIR', // Numéro de sécurité sociale (15 chiffres)
  PHONE = 'PHONE', // Numéro de téléphone français
  EMAIL = 'EMAIL', // Adresse email
  BIRTH_DATE = 'BIRTH_DATE', // Date de naissance
  NAME = 'NAME', // Nom propre (prénom, nom de famille)
  ADDRESS = 'ADDRESS', // Adresse postale
  POSTAL_CODE = 'POSTAL_CODE', // Code postal
}

/**
 * Codes d'erreur d'anonymisation
 */
export enum AnonymizationErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  PATTERN_CONFLICT = 'PATTERN_CONFLICT',
  CONTEXT_EXPIRED = 'CONTEXT_EXPIRED',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  DEANONYMIZATION_FAILED = 'DEANONYMIZATION_FAILED',
}

// ===== INTERFACES =====

/**
 * Entrée dans le mapping d'anonymisation
 * Stocke la correspondance entre un token et sa valeur originale
 */
export interface AnonymizationEntry {
  /** Token généré (ex: [NIR_a1b2c3d4]) */
  token: string;
  /** Valeur originale */
  originalValue: string;
  /** Type de donnée */
  type: SensitiveDataType;
  /** Position de début dans le texte original */
  startIndex: number;
  /** Position de fin dans le texte original */
  endIndex: number;
}

/**
 * Statistiques d'une opération d'anonymisation
 */
export interface AnonymizationStats {
  /** Nombre total de tokens créés */
  totalTokens: number;
  /** Décompte par type de donnée */
  byType: Record<SensitiveDataType, number>;
  /** Temps de traitement en ms */
  processingTimeMs: number;
}

/**
 * Contexte d'une opération d'anonymisation
 * Contient tout le nécessaire pour la dé-anonymisation
 *
 * @security Ce contexte contient les données originales sensibles.
 * Ne JAMAIS logger, sérialiser ou persister ce contexte.
 */
export interface AnonymizationContext {
  /** Identifiant unique de la requête (UUID v4) */
  requestId: string;
  /** Mapping token → entrée d'anonymisation */
  entries: Map<string, AnonymizationEntry>;
  /** Timestamp de création (pour expiration éventuelle) */
  createdAt: Date;
  /** Statistiques de l'opération */
  stats: AnonymizationStats;
}

/**
 * Résultat d'une opération d'anonymisation
 */
export interface AnonymizationResult {
  /** Texte avec les données sensibles remplacées par des tokens */
  anonymizedText: string;
  /** Contexte pour la dé-anonymisation ultérieure */
  context: AnonymizationContext;
  /** Indique si des données ont été anonymisées */
  hasAnonymizedData: boolean;
}

/**
 * Résultat d'une opération de dé-anonymisation
 */
export interface DeanonymizationResult {
  /** Texte original restauré */
  originalText: string;
  /** Nombre de tokens remplacés */
  tokensRestored: number;
  /** Tokens non trouvés dans le contexte (anomalie) */
  unmatchedTokens: string[];
}

/**
 * Options de configuration pour l'anonymiseur
 */
export interface AnonymizerOptions {
  /** Types de données à détecter (par défaut: tous) */
  enabledTypes?: SensitiveDataType[];
  /** Préfixe personnalisé pour les tokens (défaut: type en majuscules) */
  tokenPrefix?: string;
  /** Longueur de l'ID unique dans le token (défaut: 8) */
  tokenIdLength?: number;
  /** Active le mode strict (erreur si pattern ambigu) */
  strictMode?: boolean;
}

// ===== CONSTANTES =====

/**
 * Configuration par défaut
 */
export const DEFAULT_ANONYMIZER_OPTIONS: Required<AnonymizerOptions> = {
  enabledTypes: Object.values(SensitiveDataType),
  tokenPrefix: '',
  tokenIdLength: 8,
  strictMode: false,
};

// ===== CLASSES =====

/**
 * Erreur lors de l'anonymisation
 */
export class AnonymizationError extends Error {
  constructor(
    message: string,
    public code: AnonymizationErrorCode,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AnonymizationError';
  }
}

// ===== INTERFACES SERVICE =====

/**
 * Interface du service d'anonymisation
 * Contrat que l'implémentation devra respecter
 */
export interface IAnonymizer {
  /**
   * Anonymise un texte en remplaçant les données sensibles par des tokens
   */
  anonymize(text: string, options?: Partial<AnonymizerOptions>): AnonymizationResult;

  /**
   * Restaure le texte original à partir d'un texte anonymisé et de son contexte
   */
  deanonymize(anonymizedText: string, context: AnonymizationContext): DeanonymizationResult;

  /**
   * Vérifie si un texte contient des données sensibles
   */
  containsSensitiveData(text: string): boolean;

  /**
   * Retourne les types de données détectés dans un texte
   */
  detectSensitiveTypes(text: string): SensitiveDataType[];
}
