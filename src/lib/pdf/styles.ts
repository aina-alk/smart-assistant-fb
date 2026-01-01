/**
 * PDF Styles - Styles professionnels pour documents médicaux
 * Utilise @react-pdf/renderer StyleSheet
 */

import { StyleSheet, Font } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';

// ============================================================================
// Fonts Registration (optional - uses default fonts if not available)
// ============================================================================

// Register fonts for better rendering (optional)
Font.register({
  family: 'Open Sans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf',
      fontWeight: 'semibold',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf',
      fontStyle: 'italic',
    },
  ],
});

// ============================================================================
// Color Palette
// ============================================================================

export const colors = {
  // Primary
  primary: '#2563eb', // Blue-600
  primaryDark: '#1d4ed8', // Blue-700

  // Text
  text: '#1f2937', // Gray-800
  textMuted: '#6b7280', // Gray-500
  textLight: '#9ca3af', // Gray-400

  // Background
  background: '#ffffff',
  backgroundMuted: '#f9fafb', // Gray-50
  backgroundAccent: '#eff6ff', // Blue-50

  // Borders
  border: '#e5e7eb', // Gray-200
  borderStrong: '#d1d5db', // Gray-300

  // Status
  urgent: '#dc2626', // Red-600
  success: '#16a34a', // Green-600
  warning: '#ca8a04', // Yellow-600
} as const;

// ============================================================================
// Typography
// ============================================================================

export const typography = {
  fontFamily: 'Open Sans',
  fontSize: {
    xs: 8,
    sm: 9,
    base: 10,
    md: 11,
    lg: 12,
    xl: 14,
    '2xl': 16,
    '3xl': 18,
    '4xl': 24,
  },
  fontWeight: {
    normal: 'normal' as const,
    semibold: 'semibold' as const,
    bold: 'bold' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// Spacing (in points - 1pt = 1/72 inch)
// ============================================================================

export const spacing = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ============================================================================
// Page Settings
// ============================================================================

export const pageSettings = {
  // A4 size in points (210mm x 297mm)
  size: 'A4' as const,
  orientation: 'portrait' as const,

  // Margins
  margin: {
    top: 40,
    right: 40,
    bottom: 60, // Extra space for footer
    left: 40,
  },

  // Header/Footer heights
  headerHeight: 60,
  footerHeight: 40,
} as const;

// ============================================================================
// Base Styles
// ============================================================================

export const baseStyles = StyleSheet.create({
  // Page
  page: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.base,
    color: colors.text,
    backgroundColor: colors.background,
    paddingTop: pageSettings.margin.top,
    paddingRight: pageSettings.margin.right,
    paddingBottom: pageSettings.margin.bottom,
    paddingLeft: pageSettings.margin.left,
    lineHeight: typography.lineHeight.normal,
  },

  // Document structure
  document: {
    width: '100%',
  },

  // Typography
  h1: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing[4],
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },

  h2: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing[2],
    marginTop: spacing[4],
  },

  h3: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing[1.5],
    marginTop: spacing[3],
  },

  text: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.lineHeight.normal,
  },

  textSmall: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },

  textMuted: {
    color: colors.textMuted,
  },

  textBold: {
    fontWeight: typography.fontWeight.bold,
  },

  textItalic: {
    fontStyle: 'italic' as const,
  },

  // Layout
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  rowBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },

  column: {
    flexDirection: 'column' as const,
  },

  flex1: {
    flex: 1,
  },

  // Spacing utilities
  mb1: { marginBottom: spacing[1] },
  mb2: { marginBottom: spacing[2] },
  mb3: { marginBottom: spacing[3] },
  mb4: { marginBottom: spacing[4] },
  mb6: { marginBottom: spacing[6] },
  mb8: { marginBottom: spacing[8] },

  mt2: { marginTop: spacing[2] },
  mt4: { marginTop: spacing[4] },
  mt6: { marginTop: spacing[6] },

  ml2: { marginLeft: spacing[2] },
  mr2: { marginRight: spacing[2] },

  p2: { padding: spacing[2] },
  p3: { padding: spacing[3] },
  p4: { padding: spacing[4] },

  // Borders
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  border: {
    borderWidth: 1,
    borderColor: colors.border,
  },

  rounded: {
    borderRadius: 4,
  },
});

// ============================================================================
// Component-specific Styles
// ============================================================================

export const headerStyles = StyleSheet.create({
  container: {
    marginBottom: spacing[6],
  },

  praticienName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing[0.5],
  },

  praticienSpecialite: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[0.5],
  },

  praticienContact: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },

  dateContainer: {
    alignItems: 'flex-end' as const,
  },

  date: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
});

export const footerStyles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    bottom: 20,
    left: pageSettings.margin.left,
    right: pageSettings.margin.right,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[2],
  },

  text: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textAlign: 'center' as const,
  },

  pageNumber: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right' as const,
  },
});

export const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },

  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing[2],
    textTransform: 'uppercase' as const,
  },

  content: {
    paddingLeft: spacing[2],
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: spacing[3],
  },
});

export const patientStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundMuted,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },

  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[0.5],
  },

  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },

  details: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginTop: spacing[1],
  },
});

export const medicamentStyles = StyleSheet.create({
  container: {
    marginBottom: spacing[3],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  number: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    width: 20,
  },

  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing[0.5],
  },

  posologie: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: spacing[0.5],
  },

  details: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },

  substitution: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic' as const,
    marginTop: spacing[1],
  },
});

export const examenStyles = StyleSheet.create({
  container: {
    marginBottom: spacing[2],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  categoryTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing[2],
    marginTop: spacing[3],
    textTransform: 'uppercase' as const,
  },

  row: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },

  number: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    width: 20,
  },

  code: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },

  libelle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },

  indication: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing[0.5],
  },

  urgentBadge: {
    backgroundColor: colors.urgent,
    color: colors.background,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
    borderRadius: 2,
    marginLeft: spacing[2],
  },
});

export const signatureStyles = StyleSheet.create({
  container: {
    marginTop: spacing[8],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end' as const,
  },

  praticienName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },

  praticienSpecialite: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },

  signatureLine: {
    marginTop: spacing[6],
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});

export const titleStyles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
    alignItems: 'center' as const,
  },

  text: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },

  underline: {
    marginTop: spacing[2],
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
});

// ============================================================================
// CRC Specific Styles
// ============================================================================

export const crcStyles = StyleSheet.create({
  motifSection: {
    backgroundColor: colors.backgroundAccent,
    padding: spacing[3],
    borderRadius: 4,
    marginBottom: spacing[4],
  },

  examenSection: {
    marginBottom: spacing[3],
  },

  conclusionSection: {
    backgroundColor: colors.backgroundMuted,
    padding: spacing[3],
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: spacing[4],
  },

  codageContainer: {
    marginTop: spacing[4],
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },

  codageTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    marginBottom: spacing[2],
    textTransform: 'uppercase' as const,
  },

  codageItem: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing[1],
  },
});

// ============================================================================
// Utility function for combining styles
// ============================================================================

export function combineStyles(...styles: (Style | undefined | null | false)[]): Style {
  return styles
    .filter((style): style is Style => Boolean(style))
    .reduce<Style>((acc, style) => ({ ...acc, ...style }), {});
}
