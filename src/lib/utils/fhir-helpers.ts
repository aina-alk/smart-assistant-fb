/**
 * Utilitaires FHIR
 * Fonctions helper pour manipuler et formater les structures de données FHIR
 */

import type {
  HumanName,
  Address,
  ContactPoint,
  Reference,
  CodeableConcept,
  Identifier,
} from '@/types/fhir';

/**
 * Formate un HumanName FHIR en string lisible
 * @param name - Nom FHIR à formater
 * @returns String formaté (ex: "Dr Jean Dupont")
 */
export function formatHumanName(name: HumanName | undefined): string {
  if (!name) return '';

  // Si le nom complet est fourni, l'utiliser directement
  if (name.text) return name.text;

  const parts: string[] = [];

  // Ajouter les préfixes (Dr, Mr, Mrs, etc.)
  if (name.prefix?.length) {
    parts.push(...name.prefix);
  }

  // Ajouter les prénoms
  if (name.given?.length) {
    parts.push(...name.given);
  }

  // Ajouter le nom de famille
  if (name.family) {
    parts.push(name.family);
  }

  // Ajouter les suffixes (Jr, Sr, etc.)
  if (name.suffix?.length) {
    parts.push(...name.suffix);
  }

  return parts.join(' ').trim();
}

/**
 * Formate un tableau de HumanName et retourne le nom principal
 * @param names - Tableau de noms FHIR
 * @returns Le nom official ou usual, sinon le premier nom disponible
 */
export function formatPrimaryName(names: HumanName[] | undefined): string {
  if (!names || names.length === 0) return '';

  // Chercher le nom "official" en priorité
  const officialName = names.find((n) => n.use === 'official');
  if (officialName) return formatHumanName(officialName);

  // Sinon chercher le nom "usual"
  const usualName = names.find((n) => n.use === 'usual');
  if (usualName) return formatHumanName(usualName);

  // Sinon prendre le premier nom
  return formatHumanName(names[0]);
}

/**
 * Formate une adresse FHIR en string lisible
 * @param address - Adresse FHIR à formater
 * @returns String formaté (ex: "123 rue de la Paix, 75001 Paris, France")
 */
export function formatAddress(address: Address | undefined): string {
  if (!address) return '';

  // Si l'adresse complète est fournie, l'utiliser directement
  if (address.text) return address.text;

  const parts: string[] = [];

  // Ajouter les lignes d'adresse
  if (address.line?.length) {
    parts.push(...address.line);
  }

  // Créer la ligne ville/code postal
  const cityLine: string[] = [];
  if (address.postalCode) cityLine.push(address.postalCode);
  if (address.city) cityLine.push(address.city);
  if (cityLine.length > 0) {
    parts.push(cityLine.join(' '));
  }

  // Ajouter le district/état si présent
  if (address.district) parts.push(address.district);
  if (address.state) parts.push(address.state);

  // Ajouter le pays
  if (address.country) parts.push(address.country);

  return parts.join(', ').trim();
}

/**
 * Formate un tableau d'adresses et retourne l'adresse principale
 * @param addresses - Tableau d'adresses FHIR
 * @returns L'adresse home ou work, sinon la première adresse disponible
 */
export function formatPrimaryAddress(addresses: Address[] | undefined): string {
  if (!addresses || addresses.length === 0) return '';

  // Chercher l'adresse "home" en priorité
  const homeAddress = addresses.find((a) => a.use === 'home');
  if (homeAddress) return formatAddress(homeAddress);

  // Sinon chercher l'adresse "work"
  const workAddress = addresses.find((a) => a.use === 'work');
  if (workAddress) return formatAddress(workAddress);

  // Sinon prendre la première adresse
  return formatAddress(addresses[0]);
}

/**
 * Extrait les numéros de téléphone d'un tableau de ContactPoint
 * @param telecom - Tableau de contacts FHIR
 * @returns String avec le numéro principal
 */
export function formatPhone(telecom: ContactPoint[] | undefined): string {
  if (!telecom || telecom.length === 0) return '';

  // Filtrer uniquement les téléphones (system = phone ou sms)
  const phones = telecom.filter((t) => t.system === 'phone' || t.system === 'sms');

  if (phones.length === 0) return '';

  // Chercher le numéro mobile en priorité (use = mobile)
  const mobile = phones.find((p) => p.use === 'mobile');
  if (mobile?.value) return mobile.value;

  // Sinon chercher un numéro avec use = "home" ou "work"
  const primary = phones.find((p) => p.use === 'home' || p.use === 'work');
  if (primary?.value) return primary.value;

  // Sinon retourner le premier numéro
  return phones[0]?.value || '';
}

/**
 * Extrait l'email principal d'un tableau de ContactPoint
 * @param telecom - Tableau de contacts FHIR
 * @returns L'email principal ou une chaîne vide
 */
export function formatEmail(telecom: ContactPoint[] | undefined): string {
  if (!telecom || telecom.length === 0) return '';

  // Filtrer uniquement les emails
  const emails = telecom.filter((t) => t.system === 'email');

  if (emails.length === 0) return '';

  // Chercher l'email avec use = "home" ou "work"
  const primary = emails.find((e) => e.use === 'home' || e.use === 'work');
  if (primary?.value) return primary.value;

  // Sinon retourner le premier email
  return emails[0]?.value || '';
}

/**
 * Crée une référence FHIR vers une ressource
 * @param resourceType - Type de ressource (Patient, Practitioner, etc.)
 * @param id - ID de la ressource
 * @param display - Texte d'affichage optionnel
 * @returns Reference FHIR
 */
export function createReference(resourceType: string, id: string, display?: string): Reference {
  return {
    reference: `${resourceType}/${id}`,
    type: resourceType,
    ...(display && { display }),
  };
}

/**
 * Extrait l'ID d'une référence FHIR
 * @param reference - Référence FHIR
 * @returns L'ID extrait ou undefined
 */
export function extractReferenceId(reference: Reference | undefined): string | undefined {
  if (!reference?.reference) return undefined;

  // Format: "ResourceType/id"
  const parts = reference.reference.split('/');
  return parts.length === 2 ? parts[1] : undefined;
}

/**
 * Extrait le type de ressource d'une référence FHIR
 * @param reference - Référence FHIR
 * @returns Le type de ressource ou undefined
 */
export function extractReferenceType(reference: Reference | undefined): string | undefined {
  if (!reference?.reference) return undefined;

  // Format: "ResourceType/id"
  const parts = reference.reference.split('/');
  return parts.length === 2 ? parts[0] : undefined;
}

/**
 * Formate un CodeableConcept en string lisible
 * @param concept - CodeableConcept FHIR
 * @returns Le display du premier coding ou le texte
 */
export function formatCodeableConcept(concept: CodeableConcept | undefined): string {
  if (!concept) return '';

  // Si le texte est fourni, l'utiliser
  if (concept.text) return concept.text;

  // Sinon utiliser le display du premier coding
  if (concept.coding && concept.coding.length > 0) {
    return concept.coding[0].display || concept.coding[0].code || '';
  }

  return '';
}

/**
 * Trouve un identifier spécifique par système
 * @param identifiers - Tableau d'identifiers FHIR
 * @param system - URI du système d'identification
 * @returns L'identifier trouvé ou undefined
 */
export function findIdentifierBySystem(
  identifiers: Identifier[] | undefined,
  system: string
): Identifier | undefined {
  if (!identifiers || identifiers.length === 0) return undefined;
  return identifiers.find((id) => id.system === system);
}

/**
 * Extrait la valeur d'un identifier par système
 * @param identifiers - Tableau d'identifiers FHIR
 * @param system - URI du système d'identification
 * @returns La valeur de l'identifier ou undefined
 */
export function getIdentifierValue(
  identifiers: Identifier[] | undefined,
  system: string
): string | undefined {
  const identifier = findIdentifierBySystem(identifiers, system);
  return identifier?.value;
}

/**
 * Vérifie si une période FHIR est active (contient la date actuelle)
 * @param period - Période FHIR
 * @returns true si la période est active
 */
export function isPeriodActive(period: { start?: string; end?: string } | undefined): boolean {
  if (!period) return false;

  const now = new Date();

  if (period.start) {
    const start = new Date(period.start);
    if (start > now) return false; // Pas encore commencé
  }

  if (period.end) {
    const end = new Date(period.end);
    if (end < now) return false; // Déjà terminé
  }

  return true;
}

/**
 * Calcule l'âge à partir d'une date de naissance
 * @param birthDate - Date de naissance (format YYYY-MM-DD)
 * @returns Âge en années
 */
export function calculateAge(birthDate: string | undefined): number | undefined {
  if (!birthDate) return undefined;

  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
