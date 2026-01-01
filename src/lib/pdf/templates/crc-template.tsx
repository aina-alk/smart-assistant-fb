/**
 * CRC Template - Compte-Rendu de Consultation
 * Template PDF pour les comptes-rendus de consultation ORL
 */

import { Document, Page, View, Text } from '@react-pdf/renderer';
import { baseStyles, crcStyles, sectionStyles } from '../styles';
import {
  PDFHeader,
  PDFFooter,
  PDFTitle,
  PDFSection,
  PDFPatientBox,
  PDFSignature,
  type PraticienInfo,
} from '../components';
import type { CRCGenerated, CRCExamen } from '@/types/generation';
import type { DiagnosticSelection, CodageConsultation } from '@/types/codage';
import type { Style } from '@react-pdf/types';

// ============================================================================
// Types
// ============================================================================

export interface CRCTemplateProps {
  crc: CRCGenerated;
  patient: {
    nom: string;
    prenom?: string;
    dateNaissance?: string;
    age?: number;
    sexe?: 'M' | 'F' | 'male' | 'female';
  };
  praticien?: PraticienInfo;
  date?: Date;
  diagnostics?: DiagnosticSelection;
  codage?: CodageConsultation;
}

// ============================================================================
// Sub-components
// ============================================================================

function ExamenSection({ examen }: { examen: CRCExamen }) {
  const examItems: Array<{ label: string; value: string | null }> = [
    { label: 'Otoscopie droite', value: examen.otoscopie_droite },
    { label: 'Otoscopie gauche', value: examen.otoscopie_gauche },
    { label: 'Rhinoscopie', value: examen.rhinoscopie },
    { label: 'Oropharynx', value: examen.oropharynx },
    { label: 'Palpation cervicale', value: examen.palpation_cervicale },
    { label: 'Autres', value: examen.autres },
  ];

  const filledItems = examItems.filter((item) => item.value);

  if (filledItems.length === 0) {
    return null;
  }

  return (
    <PDFSection title="Examen Clinique">
      {filledItems.map((item, index) => (
        <View key={index} style={crcStyles.examenSection}>
          <Text style={[baseStyles.textBold, baseStyles.textSmall]}>{item.label}</Text>
          <Text style={baseStyles.text}>{item.value}</Text>
        </View>
      ))}
    </PDFSection>
  );
}

function CodageSection({
  diagnostics,
  codage,
}: {
  diagnostics?: DiagnosticSelection;
  codage?: CodageConsultation;
}) {
  if (!diagnostics && !codage) {
    return null;
  }

  return (
    <View style={crcStyles.codageContainer}>
      <Text style={crcStyles.codageTitle}>Codage</Text>

      {/* CIM-10 */}
      {diagnostics && diagnostics.principal && (
        <View style={baseStyles.mb2}>
          <Text style={[baseStyles.textSmall, baseStyles.textBold]}>CIM-10 :</Text>
          <Text style={crcStyles.codageItem}>
            • Principal : {diagnostics.principal.code} — {diagnostics.principal.libelle}
          </Text>
          {diagnostics.secondaires?.map((diag, idx) => (
            <Text key={idx} style={crcStyles.codageItem}>
              • Secondaire : {diag.code} — {diag.libelle}
            </Text>
          ))}
        </View>
      )}

      {/* NGAP/CCAM */}
      {codage && codage.actes && codage.actes.length > 0 && (
        <View>
          <Text style={[baseStyles.textSmall, baseStyles.textBold]}>Actes :</Text>
          {codage.actes.map((acte, idx) => (
            <Text key={idx} style={crcStyles.codageItem}>
              • {acte.code} — {acte.libelle}{' '}
              {acte.tarif_base !== undefined && `(${acte.tarif_base.toFixed(2)} €)`}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Main Template
// ============================================================================

export function CRCTemplate({
  crc,
  patient,
  praticien,
  date,
  diagnostics,
  codage,
}: CRCTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        {/* Header */}
        <PDFHeader praticien={praticien} date={date} />

        {/* Title */}
        <PDFTitle>Compte-Rendu de Consultation</PDFTitle>

        {/* Patient Info */}
        <PDFPatientBox
          nom={patient.nom}
          prenom={patient.prenom}
          dateNaissance={patient.dateNaissance}
          age={patient.age}
          sexe={patient.sexe}
        />

        {/* Motif */}
        <View style={crcStyles.motifSection}>
          <Text style={sectionStyles.title}>Motif de Consultation</Text>
          <Text style={baseStyles.text}>{crc.motif}</Text>
        </View>

        {/* Histoire de la maladie */}
        <PDFSection title="Histoire de la Maladie">
          <Text style={baseStyles.text}>{crc.histoire}</Text>
        </PDFSection>

        {/* Examen clinique */}
        <ExamenSection examen={crc.examen} />

        {/* Examens complémentaires */}
        {crc.examens_complementaires && (
          <PDFSection title="Examens Complémentaires">
            <Text style={baseStyles.text}>{crc.examens_complementaires}</Text>
          </PDFSection>
        )}

        {/* Diagnostic */}
        <PDFSection title="Diagnostic">
          <Text style={[baseStyles.text, baseStyles.textBold as Style]}>{crc.diagnostic}</Text>
        </PDFSection>

        {/* Conduite à tenir */}
        <PDFSection title="Conduite à Tenir">
          <Text style={baseStyles.text}>{crc.conduite}</Text>
        </PDFSection>

        {/* Conclusion */}
        <View style={crcStyles.conclusionSection}>
          <Text style={sectionStyles.title}>Conclusion</Text>
          <Text style={baseStyles.text}>{crc.conclusion}</Text>
        </View>

        {/* Codage */}
        <CodageSection diagnostics={diagnostics} codage={codage} />

        {/* Signature */}
        <PDFSignature praticien={praticien} />

        {/* Footer */}
        <PDFFooter text="Document généré par Super Assistant Médical" />
      </Page>
    </Document>
  );
}
