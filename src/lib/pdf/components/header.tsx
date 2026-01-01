/**
 * PDF Header Component
 * En-tête avec informations praticien et date
 */

import { View, Text } from '@react-pdf/renderer';
import { headerStyles, baseStyles } from '../styles';

// ============================================================================
// Types
// ============================================================================

export interface PraticienInfo {
  nom: string;
  specialite?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  rpps?: string;
}

export interface PDFHeaderProps {
  praticien?: PraticienInfo;
  date?: Date;
  showDate?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function PDFHeader({ praticien, date, showDate = true }: PDFHeaderProps) {
  const formattedDate = formatDate(date || new Date());

  return (
    <View style={[baseStyles.rowBetween, headerStyles.container]}>
      {/* Praticien Info */}
      <View style={baseStyles.flex1}>
        {praticien ? (
          <>
            <Text style={headerStyles.praticienName}>{praticien.nom}</Text>
            {praticien.specialite && (
              <Text style={headerStyles.praticienSpecialite}>{praticien.specialite}</Text>
            )}
            {praticien.adresse && (
              <Text style={headerStyles.praticienContact}>{praticien.adresse}</Text>
            )}
            {praticien.telephone && (
              <Text style={headerStyles.praticienContact}>Tél: {praticien.telephone}</Text>
            )}
            {praticien.rpps && (
              <Text style={headerStyles.praticienContact}>RPPS: {praticien.rpps}</Text>
            )}
          </>
        ) : (
          <Text style={headerStyles.praticienName}>Cabinet Médical</Text>
        )}
      </View>

      {/* Date */}
      {showDate && (
        <View style={headerStyles.dateContainer}>
          <Text style={headerStyles.date}>{formattedDate}</Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
