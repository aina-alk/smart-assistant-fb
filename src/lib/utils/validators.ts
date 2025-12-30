/**
 * Validateurs français - NIR et téléphone
 */

// ============================================================================
// Validation NIR (Numéro de Sécurité Sociale)
// ============================================================================

/**
 * Valide un NIR français (15 chiffres avec clé de contrôle)
 *
 * Format du NIR :
 * - Position 1 : Sexe (1 = homme, 2 = femme)
 * - Positions 2-3 : Année de naissance
 * - Positions 4-5 : Mois de naissance
 * - Positions 6-7 : Département de naissance (2A/2B pour Corse)
 * - Positions 8-10 : Commune de naissance
 * - Positions 11-13 : Numéro d'ordre
 * - Positions 14-15 : Clé de contrôle
 *
 * @param nir - Le NIR à valider (15 chiffres)
 * @returns true si le NIR est valide
 */
export function validateNIR(nir: string): boolean {
  // Retirer les espaces
  const cleanNir = nir.replace(/\s/g, '');

  // Vérifier le format de base (15 caractères)
  if (cleanNir.length !== 15) {
    return false;
  }

  // Gérer le cas de la Corse (2A et 2B)
  let nirForCalculation = cleanNir;

  // Remplacer 2A par 19 et 2B par 18 pour le calcul
  if (cleanNir.substring(5, 7) === '2A') {
    nirForCalculation = cleanNir.substring(0, 5) + '19' + cleanNir.substring(7);
  } else if (cleanNir.substring(5, 7) === '2B') {
    nirForCalculation = cleanNir.substring(0, 5) + '18' + cleanNir.substring(7);
  }

  // Vérifier que le NIR ne contient que des chiffres après transformation
  if (!/^[12][0-9]{14}$/.test(nirForCalculation)) {
    return false;
  }

  // Calcul de la clé de contrôle
  try {
    const numero = BigInt(nirForCalculation.substring(0, 13));
    const cle = parseInt(nirForCalculation.substring(13, 15), 10);
    const cleCalculee = 97 - Number(numero % 97n);

    return cle === cleCalculee;
  } catch {
    return false;
  }
}

/**
 * Formate un NIR pour l'affichage (avec espaces)
 * Format : X XX XX XX XXX XXX XX
 *
 * @param nir - Le NIR brut (15 chiffres)
 * @returns Le NIR formaté avec espaces
 */
export function formatNIR(nir: string): string {
  const cleanNir = nir.replace(/\s/g, '');

  if (cleanNir.length !== 15) {
    return nir; // Retourner tel quel si format invalide
  }

  return `${cleanNir[0]} ${cleanNir.substring(1, 3)} ${cleanNir.substring(3, 5)} ${cleanNir.substring(5, 7)} ${cleanNir.substring(7, 10)} ${cleanNir.substring(10, 13)} ${cleanNir.substring(13, 15)}`;
}

/**
 * Nettoie un NIR (retire espaces et tirets)
 *
 * @param nir - Le NIR avec potentiels espaces/tirets
 * @returns Le NIR nettoyé (15 caractères)
 */
export function cleanNIR(nir: string): string {
  return nir.replace(/[\s\-]/g, '');
}

// ============================================================================
// Validation Téléphone Français
// ============================================================================

/**
 * Valide un numéro de téléphone français (format national)
 * Accepte uniquement le format 0X XX XX XX XX (10 chiffres commençant par 0)
 *
 * @param phone - Le numéro de téléphone à valider
 * @returns true si le téléphone est valide
 */
export function validateFrenchPhone(phone: string): boolean {
  // Retirer espaces, tirets et points
  const cleanPhone = phone.replace(/[\s\-\.]/g, '');

  // Format français : 10 chiffres commençant par 0
  // Le deuxième chiffre doit être entre 1 et 9 (pas 00)
  return /^0[1-9][0-9]{8}$/.test(cleanPhone);
}

/**
 * Formate un téléphone français pour l'affichage
 * Format : 0X XX XX XX XX
 *
 * @param phone - Le téléphone brut
 * @returns Le téléphone formaté avec espaces
 */
export function formatFrenchPhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-\.]/g, '');

  if (cleanPhone.length !== 10) {
    return phone; // Retourner tel quel si format invalide
  }

  return `${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 4)} ${cleanPhone.substring(4, 6)} ${cleanPhone.substring(6, 8)} ${cleanPhone.substring(8, 10)}`;
}

/**
 * Nettoie un numéro de téléphone (retire espaces, tirets, points)
 *
 * @param phone - Le téléphone avec potentiels caractères
 * @returns Le téléphone nettoyé
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-\.]/g, '');
}

// ============================================================================
// Validation Code Postal Français
// ============================================================================

/**
 * Valide un code postal français (5 chiffres)
 *
 * @param postalCode - Le code postal à valider
 * @returns true si le code postal est valide
 */
export function validateFrenchPostalCode(postalCode: string): boolean {
  return /^[0-9]{5}$/.test(postalCode);
}

// ============================================================================
// Validation Email
// ============================================================================

/**
 * Valide une adresse email
 *
 * @param email - L'email à valider
 * @returns true si l'email est valide
 */
export function validateEmail(email: string): boolean {
  // Regex simple mais efficace pour la plupart des cas
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
