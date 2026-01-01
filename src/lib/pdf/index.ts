/**
 * PDF Module - Barrel exports
 */

// Generator
export {
  generatePDF,
  generateCRCPDF,
  generateOrdonnancePDF,
  generateBilanPDF,
  sanitizeFilename,
  type DocumentType,
  type GeneratePDFOptions,
  type PDFGenerationResult,
  type PraticienInfo,
  type CRCTemplateProps,
  type OrdonnanceTemplateProps,
  type BilanTemplateProps,
} from './generator';

// Styles
export { colors, typography, spacing, pageSettings, baseStyles } from './styles';

// Components (for custom templates)
export {
  PDFHeader,
  PDFFooter,
  PDFSection,
  PDFDivider,
  PDFPatientBox,
  PDFTitle,
  PDFSignature,
  PDFText,
  PDFTextMuted,
  PDFTextBold,
} from './components';

// Templates (for direct usage if needed)
export { CRCTemplate, OrdonnanceTemplate, BilanTemplate } from './templates';
