/**
 * Bilan Template - Prescription d'examens complémentaires
 * Template PDF pour les bilans / prescriptions d'examens
 */

import { Document, Page, View, Text } from '@react-pdf/renderer';
import { baseStyles, examenStyles, sectionStyles, combineStyles } from '../styles';
import {
  PDFHeader,
  PDFFooter,
  PDFTitle,
  PDFSection,
  PDFPatientBox,
  PDFSignature,
  type PraticienInfo,
} from '../components';
import type { ExamenExtrait, CategorieExamen } from '@/types/bilan';

// ============================================================================
// Types
// ============================================================================

export interface BilanTemplateProps {
  examens: ExamenExtrait[];
  patient: {
    nom: string;
    prenom?: string;
    dateNaissance?: string;
    age?: number;
    sexe?: 'M' | 'F' | 'male' | 'female';
  };
  praticien?: PraticienInfo;
  date?: Date;
  contexte_clinique?: string;
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORIE_LABELS: Record<CategorieExamen, string> = {
  imagerie: 'Imagerie',
  biologie: 'Biologie',
  exploration: 'Explorations Fonctionnelles',
  autre: 'Autre',
};

const CATEGORIE_ORDER: CategorieExamen[] = ['imagerie', 'biologie', 'exploration', 'autre'];

// ============================================================================
// Sub-components
// ============================================================================

function ExamenRow({
  examen,
  index,
  isLast,
}: {
  examen: ExamenExtrait;
  index: number;
  isLast: boolean;
}) {
  return (
    <View style={combineStyles(examenStyles.container, isLast && examenStyles.lastItem)}>
      <View style={examenStyles.row}>
        <Text style={examenStyles.number}>{index + 1}.</Text>
        <View style={baseStyles.flex1}>
          {/* Code et libellé */}
          <View style={[baseStyles.row, { flexWrap: 'wrap' }]}>
            <Text style={examenStyles.code}>{examen.code}</Text>
            <Text style={baseStyles.textMuted}> — </Text>
            <Text style={examenStyles.libelle}>{examen.libelle}</Text>
            {examen.urgent && <Text style={examenStyles.urgentBadge}>URGENT</Text>}
          </View>

          {/* Indication */}
          {examen.indication && (
            <Text style={examenStyles.indication}>Indication : {examen.indication}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function CategorySection({
  categorie,
  examens,
}: {
  categorie: CategorieExamen;
  examens: ExamenExtrait[];
}) {
  if (examens.length === 0) return null;

  return (
    <View style={baseStyles.mb4}>
      <Text style={examenStyles.categoryTitle}>{CATEGORIE_LABELS[categorie]}</Text>
      {examens.map((examen, index) => (
        <ExamenRow
          key={examen.code}
          examen={examen}
          index={index}
          isLast={index === examens.length - 1}
        />
      ))}
    </View>
  );
}

// ============================================================================
// Main Template
// ============================================================================

export function BilanTemplate({
  examens,
  patient,
  praticien,
  date,
  contexte_clinique,
}: BilanTemplateProps) {
  // Grouper les examens par catégorie
  const groupedExamens = CATEGORIE_ORDER.reduce(
    (acc, categorie) => {
      acc[categorie] = examens.filter((e) => e.categorie === categorie);
      return acc;
    },
    {} as Record<CategorieExamen, ExamenExtrait[]>
  );

  // Vérifier s'il y a des examens urgents
  const hasUrgent = examens.some((e) => e.urgent);

  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        {/* Header */}
        <PDFHeader praticien={praticien} date={date} />

        {/* Title */}
        <PDFTitle>Prescription d&apos;Examens Complémentaires</PDFTitle>

        {/* Patient Info */}
        <PDFPatientBox
          nom={patient.nom}
          prenom={patient.prenom}
          dateNaissance={patient.dateNaissance}
          age={patient.age}
          sexe={patient.sexe}
        />

        {/* Avertissement urgent */}
        {hasUrgent && (
          <View
            style={[
              baseStyles.p3,
              baseStyles.mb4,
              baseStyles.rounded,
              { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#dc2626' },
            ]}
          >
            <Text style={[baseStyles.textBold, { color: '#dc2626' }]}>
              Attention : Cette prescription contient des examens urgents
            </Text>
          </View>
        )}

        {/* Contexte clinique */}
        {contexte_clinique && (
          <PDFSection title="Contexte Clinique">
            <Text style={baseStyles.text}>{contexte_clinique}</Text>
          </PDFSection>
        )}

        {/* Examens par catégorie */}
        <View style={baseStyles.mb6}>
          {CATEGORIE_ORDER.map((categorie) => (
            <CategorySection
              key={categorie}
              categorie={categorie}
              examens={groupedExamens[categorie]}
            />
          ))}
        </View>

        {/* Récapitulatif */}
        <View
          style={[sectionStyles.container, baseStyles.p3, baseStyles.border, baseStyles.rounded]}
        >
          <Text style={[baseStyles.textSmall, baseStyles.textMuted]}>
            Total : {examens.length} examen{examens.length > 1 ? 's' : ''} prescrit
            {examens.length > 1 ? 's' : ''}
            {hasUrgent &&
              ` (dont ${examens.filter((e) => e.urgent).length} urgent${examens.filter((e) => e.urgent).length > 1 ? 's' : ''})`}
          </Text>
        </View>

        {/* Signature */}
        <PDFSignature praticien={praticien} />

        {/* Footer */}
        <PDFFooter text="Document généré par Super Assistant Médical" />
      </Page>
    </Document>
  );
}
