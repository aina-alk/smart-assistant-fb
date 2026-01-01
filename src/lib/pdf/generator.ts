/**
 * PDF Generator - Server-side PDF generation
 * Utilise @react-pdf/renderer pour générer des PDFs côté serveur
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { CRCTemplate, type CRCTemplateProps } from './templates/crc-template';
import { OrdonnanceTemplate, type OrdonnanceTemplateProps } from './templates/ordonnance-template';
import { BilanTemplate, type BilanTemplateProps } from './templates/bilan-template';
import type { PraticienInfo } from './components';

// ============================================================================
// Types
// ============================================================================

export type DocumentType = 'crc' | 'ordonnance' | 'bilan';

export interface GeneratePDFOptions {
  type: DocumentType;
  data: CRCTemplateProps | OrdonnanceTemplateProps | BilanTemplateProps;
}

export interface PDFGenerationResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

// ============================================================================
// Generator Functions
// ============================================================================

/**
 * Génère un PDF de CRC (Compte-Rendu de Consultation)
 */
export async function generateCRCPDF(props: CRCTemplateProps): Promise<PDFGenerationResult> {
  const buffer = await renderToBuffer(CRCTemplate(props));

  const patientName = props.patient.prenom
    ? `${props.patient.nom}_${props.patient.prenom}`
    : props.patient.nom;

  const dateStr = formatDateForFilename(props.date || new Date());

  return {
    buffer,
    filename: `CRC_${patientName}_${dateStr}.pdf`,
    contentType: 'application/pdf',
  };
}

/**
 * Génère un PDF d'ordonnance
 */
export async function generateOrdonnancePDF(
  props: OrdonnanceTemplateProps
): Promise<PDFGenerationResult> {
  const buffer = await renderToBuffer(OrdonnanceTemplate(props));

  const patientName = props.patient.prenom
    ? `${props.patient.nom}_${props.patient.prenom}`
    : props.patient.nom;

  const dateStr = formatDateForFilename(props.date || new Date());

  return {
    buffer,
    filename: `Ordonnance_${patientName}_${dateStr}.pdf`,
    contentType: 'application/pdf',
  };
}

/**
 * Génère un PDF de bilan (prescription d'examens)
 */
export async function generateBilanPDF(props: BilanTemplateProps): Promise<PDFGenerationResult> {
  const buffer = await renderToBuffer(BilanTemplate(props));

  const patientName = props.patient.prenom
    ? `${props.patient.nom}_${props.patient.prenom}`
    : props.patient.nom;

  const dateStr = formatDateForFilename(props.date || new Date());

  return {
    buffer,
    filename: `Bilan_${patientName}_${dateStr}.pdf`,
    contentType: 'application/pdf',
  };
}

/**
 * Génère un PDF selon le type de document
 */
export async function generatePDF(options: GeneratePDFOptions): Promise<PDFGenerationResult> {
  switch (options.type) {
    case 'crc':
      return generateCRCPDF(options.data as CRCTemplateProps);
    case 'ordonnance':
      return generateOrdonnancePDF(options.data as OrdonnanceTemplateProps);
    case 'bilan':
      return generateBilanPDF(options.data as BilanTemplateProps);
    default:
      throw new Error(`Type de document non supporté: ${options.type}`);
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Formate une date pour un nom de fichier (YYYY-MM-DD)
 */
function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Sanitize un nom pour l'utiliser dans un filename
 */
export function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars
    .replace(/_+/g, '_') // Collapse multiple underscores
    .replace(/^_|_$/g, ''); // Trim underscores
}

// ============================================================================
// Re-exports
// ============================================================================

export type { PraticienInfo };
export type { CRCTemplateProps, OrdonnanceTemplateProps, BilanTemplateProps };
