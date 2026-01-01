/**
 * PDF Section Component
 * Section réutilisable avec titre et contenu
 */

import { View, Text } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { sectionStyles, baseStyles, combineStyles } from '../styles';

// ============================================================================
// Types
// ============================================================================

export interface PDFSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: Style;
  showDivider?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function PDFSection({ title, children, style, showDivider = false }: PDFSectionProps) {
  return (
    <View style={combineStyles(sectionStyles.container, style)}>
      {title && <Text style={sectionStyles.title}>{title}</Text>}
      <View style={sectionStyles.content}>{children}</View>
      {showDivider && <View style={sectionStyles.divider} />}
    </View>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

export function PDFDivider() {
  return <View style={sectionStyles.divider} />;
}

// ============================================================================
// Patient Info Box
// ============================================================================

import { patientStyles } from '../styles';

export interface PDFPatientBoxProps {
  nom: string;
  prenom?: string;
  dateNaissance?: string;
  age?: number;
  sexe?: 'M' | 'F' | 'male' | 'female' | string;
}

export function PDFPatientBox({ nom, prenom, dateNaissance, age, sexe }: PDFPatientBoxProps) {
  const sexeLabel = getSexeLabel(sexe);
  const fullName = prenom ? `${prenom} ${nom}` : nom;

  return (
    <View style={patientStyles.container}>
      <Text style={patientStyles.label}>Patient</Text>
      <Text style={patientStyles.name}>{fullName}</Text>
      <Text style={patientStyles.details}>
        {age !== undefined && `${age} ans`}
        {sexeLabel && age !== undefined && ' — '}
        {sexeLabel}
        {dateNaissance &&
          ` (né${sexe === 'F' || sexe === 'female' ? 'e' : ''} le ${formatBirthDate(dateNaissance)})`}
      </Text>
    </View>
  );
}

function getSexeLabel(sexe?: string): string {
  if (!sexe) return '';
  switch (sexe.toLowerCase()) {
    case 'm':
    case 'male':
      return 'Homme';
    case 'f':
    case 'female':
      return 'Femme';
    default:
      return '';
  }
}

function formatBirthDate(date: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

// ============================================================================
// Document Title
// ============================================================================

import { titleStyles } from '../styles';

export interface PDFTitleProps {
  children: string;
}

export function PDFTitle({ children }: PDFTitleProps) {
  return (
    <View style={titleStyles.container}>
      <Text style={titleStyles.text}>{children}</Text>
      <View style={titleStyles.underline} />
    </View>
  );
}

// ============================================================================
// Signature Block
// ============================================================================

import { signatureStyles } from '../styles';
import type { PraticienInfo } from './header';

export interface PDFSignatureProps {
  praticien?: PraticienInfo;
  showLine?: boolean;
}

export function PDFSignature({ praticien, showLine = true }: PDFSignatureProps) {
  return (
    <View style={signatureStyles.container}>
      {praticien && (
        <>
          <Text style={signatureStyles.praticienName}>{praticien.nom}</Text>
          {praticien.specialite && (
            <Text style={signatureStyles.praticienSpecialite}>{praticien.specialite}</Text>
          )}
        </>
      )}
      {showLine && <View style={signatureStyles.signatureLine} />}
    </View>
  );
}

// ============================================================================
// Text Components
// ============================================================================

export interface PDFTextProps {
  children: React.ReactNode;
  style?: Style;
}

export function PDFText({ children, style }: PDFTextProps) {
  return <Text style={combineStyles(baseStyles.text, style)}>{children}</Text>;
}

export function PDFTextMuted({ children, style }: PDFTextProps) {
  return (
    <Text style={combineStyles(baseStyles.text, baseStyles.textMuted, style)}>{children}</Text>
  );
}

export function PDFTextBold({ children, style }: PDFTextProps) {
  return <Text style={combineStyles(baseStyles.text, baseStyles.textBold, style)}>{children}</Text>;
}
