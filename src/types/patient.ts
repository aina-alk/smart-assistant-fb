/**
 * Types Patient - Format application et mapping FHIR
 */

import type { Patient as FHIRPatient, Identifier, HumanName, ContactPoint, Address } from './fhir';

// ============================================================================
// Types Application
// ============================================================================

/**
 * Patient au format application (simplifié pour l'UI)
 */
export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  sexe: 'M' | 'F';

  // Contact
  telephone?: string;
  email?: string;

  // Adresse
  adresse?: string;
  codePostal?: string;
  ville?: string;

  // Sécurité sociale
  nir?: string; // Numéro sécu (15 chiffres)

  // Mutuelle
  mutuelleNom?: string;
  mutuelleNumero?: string;

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Patient pour création (sans id ni métadonnées)
 */
export type PatientCreate = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Patient pour mise à jour (tous les champs optionnels sauf id)
 */
export type PatientUpdate = Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Résultat de recherche patient
 */
export interface PatientSearchResult {
  patients: Patient[];
  total: number;
  nextPageToken?: string;
}

// ============================================================================
// Constantes FHIR
// ============================================================================

/** Système d'identification NIR (numéro de sécurité sociale français) */
export const NIR_SYSTEM = 'urn:oid:1.2.250.1.213.1.4.8';

/** Système d'identification mutuelle */
export const MUTUELLE_SYSTEM = 'urn:oid:1.2.250.1.213.1.4.9';

// ============================================================================
// Mapping Patient ↔ FHIR
// ============================================================================

/**
 * Convertit un Patient application vers le format FHIR
 */
export function patientToFHIR(patient: Patient | PatientCreate, id?: string): FHIRPatient {
  const fhirPatient: FHIRPatient = {
    resourceType: 'Patient',
    active: true,
  };

  // ID (si existant)
  if ('id' in patient && patient.id) {
    fhirPatient.id = patient.id;
  } else if (id) {
    fhirPatient.id = id;
  }

  // Nom
  const name: HumanName = {
    use: 'official',
    family: patient.nom,
    given: [patient.prenom],
  };
  fhirPatient.name = [name];

  // Date de naissance
  fhirPatient.birthDate = formatDateToFHIR(patient.dateNaissance);

  // Sexe
  fhirPatient.gender = patient.sexe === 'M' ? 'male' : 'female';

  // Identifiants (NIR, mutuelle)
  const identifiers: Identifier[] = [];

  if (patient.nir) {
    identifiers.push({
      use: 'official',
      system: NIR_SYSTEM,
      value: patient.nir,
    });
  }

  if (patient.mutuelleNumero) {
    identifiers.push({
      use: 'secondary',
      system: MUTUELLE_SYSTEM,
      value: patient.mutuelleNumero,
      assigner: patient.mutuelleNom ? { display: patient.mutuelleNom } : undefined,
    });
  }

  if (identifiers.length > 0) {
    fhirPatient.identifier = identifiers;
  }

  // Contact (téléphone, email)
  const telecoms: ContactPoint[] = [];

  if (patient.telephone) {
    telecoms.push({
      system: 'phone',
      value: patient.telephone,
      use: 'mobile',
    });
  }

  if (patient.email) {
    telecoms.push({
      system: 'email',
      value: patient.email,
      use: 'home',
    });
  }

  if (telecoms.length > 0) {
    fhirPatient.telecom = telecoms;
  }

  // Adresse
  if (patient.adresse || patient.codePostal || patient.ville) {
    const address: Address = {
      use: 'home',
      type: 'physical',
    };

    if (patient.adresse) {
      address.line = [patient.adresse];
    }
    if (patient.codePostal) {
      address.postalCode = patient.codePostal;
    }
    if (patient.ville) {
      address.city = patient.ville;
    }
    address.country = 'FR';

    fhirPatient.address = [address];
  }

  return fhirPatient;
}

/**
 * Convertit un Patient FHIR vers le format application
 */
export function fhirToPatient(fhirPatient: FHIRPatient): Patient {
  // Nom
  const officialName = fhirPatient.name?.find((n) => n.use === 'official') || fhirPatient.name?.[0];
  const nom = officialName?.family || '';
  const prenom = officialName?.given?.[0] || '';

  // Date de naissance
  const dateNaissance = fhirPatient.birthDate
    ? new Date(fhirPatient.birthDate)
    : new Date('1900-01-01');

  // Sexe
  const sexe: 'M' | 'F' = fhirPatient.gender === 'male' ? 'M' : 'F';

  // NIR
  const nirIdentifier = fhirPatient.identifier?.find((id) => id.system === NIR_SYSTEM);
  const nir = nirIdentifier?.value;

  // Mutuelle
  const mutuelleIdentifier = fhirPatient.identifier?.find((id) => id.system === MUTUELLE_SYSTEM);
  const mutuelleNumero = mutuelleIdentifier?.value;
  const mutuelleNom = mutuelleIdentifier?.assigner?.display;

  // Contact
  const phoneContact = fhirPatient.telecom?.find((t) => t.system === 'phone');
  const emailContact = fhirPatient.telecom?.find((t) => t.system === 'email');
  const telephone = phoneContact?.value;
  const email = emailContact?.value;

  // Adresse
  const homeAddress =
    fhirPatient.address?.find((a) => a.use === 'home') || fhirPatient.address?.[0];
  const adresse = homeAddress?.line?.[0];
  const codePostal = homeAddress?.postalCode;
  const ville = homeAddress?.city;

  // Métadonnées
  const lastUpdated = fhirPatient.meta?.lastUpdated;
  const updatedAt = lastUpdated ? new Date(lastUpdated) : new Date();
  const createdAt = updatedAt; // FHIR ne stocke pas la date de création séparément

  return {
    id: fhirPatient.id || '',
    nom,
    prenom,
    dateNaissance,
    sexe,
    telephone,
    email,
    adresse,
    codePostal,
    ville,
    nir,
    mutuelleNom,
    mutuelleNumero,
    createdAt,
    updatedAt,
  };
}

// ============================================================================
// Utilitaires
// ============================================================================

/**
 * Formate une Date en format FHIR (YYYY-MM-DD)
 */
function formatDateToFHIR(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Retourne le nom complet du patient
 */
export function getPatientFullName(patient: Patient): string {
  return `${patient.prenom} ${patient.nom}`.trim();
}

/**
 * Retourne l'âge du patient
 */
export function getPatientAge(patient: Patient): number {
  const today = new Date();
  const birthDate = new Date(patient.dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
