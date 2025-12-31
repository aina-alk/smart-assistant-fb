// Types globaux de l'application

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

// Export des types Patient
export type { Patient, PatientCreate, PatientUpdate, PatientSearchResult } from './patient';

export {
  NIR_SYSTEM,
  MUTUELLE_SYSTEM,
  patientToFHIR,
  fhirToPatient,
  getPatientFullName,
  getPatientAge,
} from './patient';

// Export des types Transcription
export type {
  TranscriptionStatus,
  TranscriptionErrorCode,
  TranscriptionResult,
  TranscriptionConfig,
  Utterance,
  StartTranscriptionResponse,
  GetTranscriptionResponse,
  TranscriptionErrorResponse,
} from './transcription';

export { TRANSCRIPTION_ERROR_MESSAGES } from './transcription';

// Export des types Generation (CRC)
export type {
  CRCExamen,
  CRCGenerated,
  PatientContext,
  GenerateCRCOptions,
  ClaudeClientOptions,
  GenerateCRCResponse,
  GenerationErrorResponse,
  GenerationErrorCode,
} from './generation';

export {
  crcExamenSchema,
  crcGeneratedSchema,
  patientContextSchema,
  generateCRCOptionsSchema,
  GENERATION_ERROR_MESSAGES,
} from './generation';

// Export des types FHIR
export type {
  // Base types
  FHIRResource,
  Meta,
  Bundle,
  BundleLink,
  BundleEntry,
  OperationOutcome,
  OperationOutcomeIssue,

  // Data types
  Reference,
  Identifier,
  HumanName,
  ContactPoint,
  Address,
  CodeableConcept,
  Coding,
  Period,
  Annotation,
  Attachment,
  Quantity,
  Range,
  Ratio,

  // Resources (FHIR Patient renommé pour éviter conflit avec Patient application)
  Patient as FHIRPatient,
  PatientContact,
  PatientCommunication,
  PatientLink,
  Practitioner,
  PractitionerQualification,
  Encounter,
  EncounterStatusHistory,
  EncounterClassHistory,
  EncounterParticipant,
  EncounterDiagnosis,
  EncounterHospitalization,
  EncounterLocation,
  Observation,
  ObservationReferenceRange,
  ObservationComponent,
  Condition,
  ConditionStage,
  ConditionEvidence,
  Procedure,
  ProcedurePerformer,
  ProcedureFocalDevice,
  DiagnosticReport,
  DiagnosticReportMedia,
} from './fhir';

// Export des types Codage (CIM-10, NGAP, CCAM)
export type {
  // CIM-10
  CIM10Category,
  CIM10Code,
  DiagnosticSuggestion,
  DiagnosticSelection,
  CIM10ExtractionResult,
  CIM10SearchParams,
  CIM10SearchResponse,
  CIM10ExtractRequest,
  CIM10ExtractResponse,
  // NGAP
  NGAPType,
  NGAPCode,
  NGAPSearchResponse,
  // CCAM
  CCAMRegroupement,
  CCAMCode,
  CCAMSearchResponse,
  // Codage Consultation
  ActeType,
  ActeFacturable,
  ActeSuggestion,
  CodageConsultation,
  CodageSuggestionResult,
  CodageSuggestRequest,
  CodageSuggestResponse,
} from './codage';

export {
  // CIM-10 schemas
  cim10CodeSchema,
  diagnosticSuggestionSchema,
  cim10ExtractionResultSchema,
  cim10ExtractRequestSchema,
  // NGAP/CCAM schemas
  ngapCodeSchema,
  ccamCodeSchema,
  acteSuggestionSchema,
  codageSuggestionResultSchema,
  codageSuggestRequestSchema,
} from './codage';
