// Types globaux de l'application

export type User = {
  id: string;
  email: string;
  displayName?: string;
  role: 'doctor' | 'admin';
  createdAt: Date;
};

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

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

  // Resources
  Patient,
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
