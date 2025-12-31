/**
 * Types Consultation - Format application et mapping FHIR Encounter
 */

import type { Encounter, Reference, Coding } from './fhir';
import type { CRCGenerated } from './generation';
import type { DiagnosticSelection, CodageConsultation } from './codage';

// ============================================================================
// Types Application
// ============================================================================

/**
 * Statut de la consultation
 */
export type ConsultationStatut = 'brouillon' | 'en_cours' | 'termine' | 'annule';

/**
 * Consultation au format application (simplifié pour l'UI)
 */
export interface Consultation {
  id: string;
  patientId: string;
  praticienId: string;
  date: Date;
  motif: string;

  // Contenu médical
  transcription?: string;
  crc?: CRCGenerated;
  diagnostics?: DiagnosticSelection;
  codage?: CodageConsultation;

  // Statut
  statut: ConsultationStatut;

  // Documents liés (IDs de DocumentReference)
  documents?: string[];

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Consultation pour création (sans id ni métadonnées)
 */
export type ConsultationCreate = Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Consultation pour mise à jour (tous les champs optionnels sauf id)
 */
export type ConsultationUpdate = Partial<Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Résultat de recherche consultations
 */
export interface ConsultationSearchResult {
  consultations: Consultation[];
  total: number;
  nextPageToken?: string;
}

// ============================================================================
// Constantes FHIR
// ============================================================================

/** Système pour la classe d'encounter (ambulatoire) */
export const ENCOUNTER_CLASS_SYSTEM = 'http://terminology.hl7.org/CodeSystem/v3-ActCode';

/** Code ambulatoire */
export const ENCOUNTER_CLASS_AMB: Coding = {
  system: ENCOUNTER_CLASS_SYSTEM,
  code: 'AMB',
  display: 'ambulatory',
};

/** Système pour les extensions custom */
export const EXTENSION_BASE_URL = 'https://super-assistant-medical.fr/fhir/StructureDefinition';

/** URLs des extensions */
export const EXTENSION_URLS = {
  transcription: `${EXTENSION_BASE_URL}/consultation-transcription`,
  crc: `${EXTENSION_BASE_URL}/consultation-crc`,
  diagnostics: `${EXTENSION_BASE_URL}/consultation-diagnostics`,
  codage: `${EXTENSION_BASE_URL}/consultation-codage`,
  documents: `${EXTENSION_BASE_URL}/consultation-documents`,
} as const;

// ============================================================================
// Mapping Statut ↔ FHIR
// ============================================================================

/** Map statut application → FHIR Encounter status */
const STATUT_TO_FHIR: Record<ConsultationStatut, Encounter['status']> = {
  brouillon: 'planned',
  en_cours: 'in-progress',
  termine: 'finished',
  annule: 'cancelled',
};

/** Map FHIR Encounter status → statut application */
const FHIR_TO_STATUT: Record<string, ConsultationStatut> = {
  planned: 'brouillon',
  arrived: 'en_cours',
  triaged: 'en_cours',
  'in-progress': 'en_cours',
  onleave: 'en_cours',
  finished: 'termine',
  cancelled: 'annule',
  'entered-in-error': 'annule',
  unknown: 'brouillon',
};

// ============================================================================
// Mapping Consultation ↔ FHIR Encounter
// ============================================================================

/**
 * Interface pour les extensions FHIR
 */
interface FHIRExtension {
  url: string;
  valueString?: string;
}

/**
 * Type Encounter étendu avec extensions
 */
type EncounterWithExtensions = Encounter & {
  extension?: FHIRExtension[];
};

/**
 * Convertit une Consultation application vers le format FHIR Encounter
 */
export function consultationToFHIR(
  consultation: Consultation | ConsultationCreate,
  id?: string
): EncounterWithExtensions {
  const encounter: EncounterWithExtensions = {
    resourceType: 'Encounter',
    status: STATUT_TO_FHIR[consultation.statut],
    class: ENCOUNTER_CLASS_AMB,
  };

  // ID (si existant)
  if ('id' in consultation && consultation.id) {
    encounter.id = consultation.id;
  } else if (id) {
    encounter.id = id;
  }

  // Références Patient et Praticien
  encounter.subject = {
    reference: `Patient/${consultation.patientId}`,
  };

  encounter.participant = [
    {
      individual: {
        reference: `Practitioner/${consultation.praticienId}`,
      },
    },
  ];

  // Période (date de consultation)
  const dateString = formatDateToFHIR(consultation.date);
  encounter.period = {
    start: dateString,
    end: consultation.statut === 'termine' ? dateString : undefined,
  };

  // Motif de consultation
  if (consultation.motif) {
    encounter.reasonCode = [
      {
        text: consultation.motif,
      },
    ];
  }

  // Extensions pour les données complexes
  const extensions: FHIRExtension[] = [];

  if (consultation.transcription) {
    extensions.push({
      url: EXTENSION_URLS.transcription,
      valueString: consultation.transcription,
    });
  }

  if (consultation.crc) {
    extensions.push({
      url: EXTENSION_URLS.crc,
      valueString: JSON.stringify(consultation.crc),
    });
  }

  if (consultation.diagnostics) {
    extensions.push({
      url: EXTENSION_URLS.diagnostics,
      valueString: JSON.stringify(consultation.diagnostics),
    });
  }

  if (consultation.codage) {
    extensions.push({
      url: EXTENSION_URLS.codage,
      valueString: JSON.stringify(consultation.codage),
    });
  }

  if (consultation.documents && consultation.documents.length > 0) {
    extensions.push({
      url: EXTENSION_URLS.documents,
      valueString: JSON.stringify(consultation.documents),
    });
  }

  if (extensions.length > 0) {
    encounter.extension = extensions;
  }

  return encounter;
}

/**
 * Convertit un Encounter FHIR vers le format Consultation application
 */
export function fhirToConsultation(encounter: EncounterWithExtensions): Consultation {
  // Statut
  const statut = FHIR_TO_STATUT[encounter.status] || 'brouillon';

  // Patient ID
  const patientId = extractIdFromReference(encounter.subject);

  // Praticien ID
  const praticienId = extractIdFromReference(encounter.participant?.[0]?.individual);

  // Date
  const date = encounter.period?.start ? new Date(encounter.period.start) : new Date();

  // Motif
  const motif = encounter.reasonCode?.[0]?.text || '';

  // Extensions
  const extensionMap = new Map<string, string>();
  encounter.extension?.forEach((ext) => {
    if (ext.valueString) {
      extensionMap.set(ext.url, ext.valueString);
    }
  });

  const transcription = extensionMap.get(EXTENSION_URLS.transcription);

  let crc: CRCGenerated | undefined;
  const crcJson = extensionMap.get(EXTENSION_URLS.crc);
  if (crcJson) {
    try {
      crc = JSON.parse(crcJson) as CRCGenerated;
    } catch {
      console.warn('Erreur parsing CRC JSON:', crcJson);
    }
  }

  let diagnostics: DiagnosticSelection | undefined;
  const diagnosticsJson = extensionMap.get(EXTENSION_URLS.diagnostics);
  if (diagnosticsJson) {
    try {
      diagnostics = JSON.parse(diagnosticsJson) as DiagnosticSelection;
    } catch {
      console.warn('Erreur parsing diagnostics JSON:', diagnosticsJson);
    }
  }

  let codage: CodageConsultation | undefined;
  const codageJson = extensionMap.get(EXTENSION_URLS.codage);
  if (codageJson) {
    try {
      codage = JSON.parse(codageJson) as CodageConsultation;
    } catch {
      console.warn('Erreur parsing codage JSON:', codageJson);
    }
  }

  let documents: string[] | undefined;
  const documentsJson = extensionMap.get(EXTENSION_URLS.documents);
  if (documentsJson) {
    try {
      documents = JSON.parse(documentsJson) as string[];
    } catch {
      console.warn('Erreur parsing documents JSON:', documentsJson);
    }
  }

  // Métadonnées
  const lastUpdated = encounter.meta?.lastUpdated;
  const updatedAt = lastUpdated ? new Date(lastUpdated) : new Date();
  const createdAt = updatedAt; // FHIR ne stocke pas la date de création séparément

  return {
    id: encounter.id || '',
    patientId,
    praticienId,
    date,
    motif,
    transcription,
    crc,
    diagnostics,
    codage,
    statut,
    documents,
    createdAt,
    updatedAt,
  };
}

// ============================================================================
// Utilitaires
// ============================================================================

/**
 * Formate une Date en format FHIR (ISO 8601)
 */
function formatDateToFHIR(date: Date): string {
  return date.toISOString();
}

/**
 * Extrait l'ID d'une référence FHIR (e.g., "Patient/123" → "123")
 */
function extractIdFromReference(ref: Reference | undefined): string {
  if (!ref?.reference) return '';
  const parts = ref.reference.split('/');
  return parts[parts.length - 1] || '';
}

/**
 * Retourne un résumé de la consultation
 */
export function getConsultationSummary(consultation: Consultation): string {
  const dateStr = consultation.date.toLocaleDateString('fr-FR');
  return `${consultation.motif} - ${dateStr}`;
}

/**
 * Vérifie si la consultation est modifiable
 */
export function isConsultationEditable(consultation: Consultation): boolean {
  return consultation.statut !== 'termine' && consultation.statut !== 'annule';
}
