/**
 * Types FHIR R4
 * Définitions des ressources et structures de données FHIR
 */

/**
 * Base resource interface
 * Tous les types de ressources FHIR étendent cette interface
 */
export interface FHIRResource {
  id?: string;
  resourceType: string;
  meta?: Meta;
  implicitRules?: string;
  language?: string;
}

/**
 * Metadata about a resource
 */
export interface Meta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: Coding[];
  tag?: Coding[];
}

/**
 * Bundle of resources
 * Utilisé pour les opérations batch/transaction et les résultats de recherche
 */
export interface Bundle<T extends FHIRResource = FHIRResource> {
  resourceType: 'Bundle';
  id?: string;
  meta?: Meta;
  type:
    | 'document'
    | 'message'
    | 'transaction'
    | 'transaction-response'
    | 'batch'
    | 'batch-response'
    | 'history'
    | 'searchset'
    | 'collection';
  total?: number;
  link?: BundleLink[];
  entry?: BundleEntry<T>[];
}

/**
 * Bundle link (pagination)
 */
export interface BundleLink {
  relation: string;
  url: string;
}

/**
 * Bundle entry
 */
export interface BundleEntry<T extends FHIRResource = FHIRResource> {
  fullUrl?: string;
  resource?: T;
  search?: {
    mode?: 'match' | 'include' | 'outcome';
    score?: number;
  };
  request?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
  };
  response?: {
    status: string;
    location?: string;
    etag?: string;
    lastModified?: string;
    outcome?: OperationOutcome;
  };
}

/**
 * OperationOutcome - Information about the success/failure of an operation
 */
export interface OperationOutcome extends FHIRResource {
  resourceType: 'OperationOutcome';
  issue: OperationOutcomeIssue[];
}

export interface OperationOutcomeIssue {
  severity: 'fatal' | 'error' | 'warning' | 'information';
  code: string;
  details?: CodeableConcept;
  diagnostics?: string;
  location?: string[];
  expression?: string[];
}

/**
 * Reference to another resource
 */
export interface Reference {
  reference?: string; // e.g., "Patient/123"
  type?: string; // e.g., "Patient"
  identifier?: Identifier;
  display?: string;
}

/**
 * Identifier - Business identifier
 */
export interface Identifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: CodeableConcept;
  system?: string; // URI
  value?: string;
  period?: Period;
  assigner?: Reference;
}

/**
 * HumanName - Name of a person
 */
export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string; // Full name as a single string
  family?: string; // Nom de famille
  given?: string[]; // Prénoms
  prefix?: string[]; // Dr, Mr, Mrs, etc.
  suffix?: string[]; // Jr, Sr, etc.
  period?: Period;
}

/**
 * ContactPoint - Phone, email, etc.
 */
export interface ContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number; // Ordre de préférence (1 = highest)
  period?: Period;
}

/**
 * Address - Physical address
 */
export interface Address {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string; // Full address as a single string
  line?: string[]; // Lignes d'adresse (rue, numéro, etc.)
  city?: string;
  district?: string; // Quartier, arrondissement
  state?: string; // État, région, département
  postalCode?: string;
  country?: string;
  period?: Period;
}

/**
 * CodeableConcept - Concept codé avec un ou plusieurs codes
 */
export interface CodeableConcept {
  coding?: Coding[];
  text?: string; // Texte libre décrivant le concept
}

/**
 * Coding - Code d'un système de codage spécifique
 */
export interface Coding {
  system?: string; // URI du système de codage (SNOMED CT, LOINC, etc.)
  version?: string;
  code?: string; // Le code lui-même
  display?: string; // Représentation lisible
  userSelected?: boolean;
}

/**
 * Period - Time range with start and end
 */
export interface Period {
  start?: string; // ISO 8601 datetime
  end?: string; // ISO 8601 datetime
}

/**
 * Annotation - Text node with author and time
 */
export interface Annotation {
  authorReference?: Reference;
  authorString?: string;
  time?: string; // ISO 8601 datetime
  text: string; // Markdown
}

/**
 * Attachment - Content in a format (image, document, etc.)
 */
export interface Attachment {
  contentType?: string; // MIME type
  language?: string;
  data?: string; // Base64 encoded data
  url?: string; // URI where data can be found
  size?: number; // Bytes
  hash?: string; // SHA-1 hash (base64)
  title?: string;
  creation?: string; // ISO 8601 datetime
}

/**
 * Quantity - Measured amount
 */
export interface Quantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string; // Human-readable unit
  system?: string; // URI (UCUM, etc.)
  code?: string; // Coded form of unit
}

/**
 * Range - Set of values bounded by low and high
 */
export interface Range {
  low?: Quantity;
  high?: Quantity;
}

/**
 * Ratio - Relationship between two quantities
 */
export interface Ratio {
  numerator?: Quantity;
  denominator?: Quantity;
}

/**
 * Patient Resource
 */
export interface Patient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string; // YYYY-MM-DD
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: Address[];
  maritalStatus?: CodeableConcept;
  multipleBirthBoolean?: boolean;
  multipleBirthInteger?: number;
  photo?: Attachment[];
  contact?: PatientContact[];
  communication?: PatientCommunication[];
  generalPractitioner?: Reference[];
  managingOrganization?: Reference;
  link?: PatientLink[];
}

export interface PatientContact {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  organization?: Reference;
  period?: Period;
}

export interface PatientCommunication {
  language: CodeableConcept;
  preferred?: boolean;
}

export interface PatientLink {
  other: Reference;
  type: 'replaced-by' | 'replaces' | 'refer' | 'seealso';
}

/**
 * Practitioner Resource
 */
export interface Practitioner extends FHIRResource {
  resourceType: 'Practitioner';
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  address?: Address[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  photo?: Attachment[];
  qualification?: PractitionerQualification[];
  communication?: CodeableConcept[];
}

export interface PractitionerQualification {
  identifier?: Identifier[];
  code: CodeableConcept;
  period?: Period;
  issuer?: Reference;
}

/**
 * Encounter Resource
 */
export interface Encounter extends FHIRResource {
  resourceType: 'Encounter';
  identifier?: Identifier[];
  status:
    | 'planned'
    | 'arrived'
    | 'triaged'
    | 'in-progress'
    | 'onleave'
    | 'finished'
    | 'cancelled'
    | 'entered-in-error'
    | 'unknown';
  statusHistory?: EncounterStatusHistory[];
  class: Coding;
  classHistory?: EncounterClassHistory[];
  type?: CodeableConcept[];
  serviceType?: CodeableConcept;
  priority?: CodeableConcept;
  subject?: Reference;
  episodeOfCare?: Reference[];
  basedOn?: Reference[];
  participant?: EncounterParticipant[];
  appointment?: Reference[];
  period?: Period;
  length?: Quantity;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  diagnosis?: EncounterDiagnosis[];
  account?: Reference[];
  hospitalization?: EncounterHospitalization;
  location?: EncounterLocation[];
  serviceProvider?: Reference;
  partOf?: Reference;
}

export interface EncounterStatusHistory {
  status: string;
  period: Period;
}

export interface EncounterClassHistory {
  class: Coding;
  period: Period;
}

export interface EncounterParticipant {
  type?: CodeableConcept[];
  period?: Period;
  individual?: Reference;
}

export interface EncounterDiagnosis {
  condition: Reference;
  use?: CodeableConcept;
  rank?: number;
}

export interface EncounterHospitalization {
  preAdmissionIdentifier?: Identifier;
  origin?: Reference;
  admitSource?: CodeableConcept;
  reAdmission?: CodeableConcept;
  dietPreference?: CodeableConcept[];
  specialCourtesy?: CodeableConcept[];
  specialArrangement?: CodeableConcept[];
  destination?: Reference;
  dischargeDisposition?: CodeableConcept;
}

export interface EncounterLocation {
  location: Reference;
  status?: 'planned' | 'active' | 'reserved' | 'completed';
  physicalType?: CodeableConcept;
  period?: Period;
}

/**
 * Observation Resource
 */
export interface Observation extends FHIRResource {
  resourceType: 'Observation';
  identifier?: Identifier[];
  basedOn?: Reference[];
  partOf?: Reference[];
  status:
    | 'registered'
    | 'preliminary'
    | 'final'
    | 'amended'
    | 'corrected'
    | 'cancelled'
    | 'entered-in-error'
    | 'unknown';
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference;
  focus?: Reference[];
  encounter?: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  issued?: string;
  performer?: Reference[];
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueDateTime?: string;
  valuePeriod?: Period;
  dataAbsentReason?: CodeableConcept;
  interpretation?: CodeableConcept[];
  note?: Annotation[];
  bodySite?: CodeableConcept;
  method?: CodeableConcept;
  specimen?: Reference;
  device?: Reference;
  referenceRange?: ObservationReferenceRange[];
  hasMember?: Reference[];
  derivedFrom?: Reference[];
  component?: ObservationComponent[];
}

export interface ObservationReferenceRange {
  low?: Quantity;
  high?: Quantity;
  type?: CodeableConcept;
  appliesTo?: CodeableConcept[];
  age?: Range;
  text?: string;
}

export interface ObservationComponent {
  code: CodeableConcept;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueDateTime?: string;
  valuePeriod?: Period;
  dataAbsentReason?: CodeableConcept;
  interpretation?: CodeableConcept[];
  referenceRange?: ObservationReferenceRange[];
}

/**
 * Condition Resource (Diagnosis)
 */
export interface Condition extends FHIRResource {
  resourceType: 'Condition';
  identifier?: Identifier[];
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  category?: CodeableConcept[];
  severity?: CodeableConcept;
  code?: CodeableConcept;
  bodySite?: CodeableConcept[];
  subject: Reference;
  encounter?: Reference;
  onsetDateTime?: string;
  onsetAge?: Quantity;
  onsetPeriod?: Period;
  onsetRange?: Range;
  onsetString?: string;
  abatementDateTime?: string;
  abatementAge?: Quantity;
  abatementPeriod?: Period;
  abatementRange?: Range;
  abatementString?: string;
  recordedDate?: string;
  recorder?: Reference;
  asserter?: Reference;
  stage?: ConditionStage[];
  evidence?: ConditionEvidence[];
  note?: Annotation[];
}

export interface ConditionStage {
  summary?: CodeableConcept;
  assessment?: Reference[];
  type?: CodeableConcept;
}

export interface ConditionEvidence {
  code?: CodeableConcept[];
  detail?: Reference[];
}

/**
 * Procedure Resource
 */
export interface Procedure extends FHIRResource {
  resourceType: 'Procedure';
  identifier?: Identifier[];
  instantiatesCanonical?: string[];
  instantiatesUri?: string[];
  basedOn?: Reference[];
  partOf?: Reference[];
  status:
    | 'preparation'
    | 'in-progress'
    | 'not-done'
    | 'on-hold'
    | 'stopped'
    | 'completed'
    | 'entered-in-error'
    | 'unknown';
  statusReason?: CodeableConcept;
  category?: CodeableConcept;
  code?: CodeableConcept;
  subject: Reference;
  encounter?: Reference;
  performedDateTime?: string;
  performedPeriod?: Period;
  performedString?: string;
  performedAge?: Quantity;
  performedRange?: Range;
  recorder?: Reference;
  asserter?: Reference;
  performer?: ProcedurePerformer[];
  location?: Reference;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  bodySite?: CodeableConcept[];
  outcome?: CodeableConcept;
  report?: Reference[];
  complication?: CodeableConcept[];
  complicationDetail?: Reference[];
  followUp?: CodeableConcept[];
  note?: Annotation[];
  focalDevice?: ProcedureFocalDevice[];
  usedReference?: Reference[];
  usedCode?: CodeableConcept[];
}

export interface ProcedurePerformer {
  function?: CodeableConcept;
  actor: Reference;
  onBehalfOf?: Reference;
}

export interface ProcedureFocalDevice {
  action?: CodeableConcept;
  manipulated: Reference;
}

/**
 * DiagnosticReport Resource
 */
export interface DiagnosticReport extends FHIRResource {
  resourceType: 'DiagnosticReport';
  identifier?: Identifier[];
  basedOn?: Reference[];
  status:
    | 'registered'
    | 'partial'
    | 'preliminary'
    | 'final'
    | 'amended'
    | 'corrected'
    | 'appended'
    | 'cancelled'
    | 'entered-in-error'
    | 'unknown';
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference;
  encounter?: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  issued?: string;
  performer?: Reference[];
  resultsInterpreter?: Reference[];
  specimen?: Reference[];
  result?: Reference[];
  imagingStudy?: Reference[];
  media?: DiagnosticReportMedia[];
  conclusion?: string;
  conclusionCode?: CodeableConcept[];
  presentedForm?: Attachment[];
}

export interface DiagnosticReportMedia {
  comment?: string;
  link: Reference;
}
