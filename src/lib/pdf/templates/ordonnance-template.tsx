/**
 * Ordonnance Template - Prescription médicamenteuse
 * Template PDF pour les ordonnances médicales
 */

import { Document, Page, View, Text } from '@react-pdf/renderer';
import { baseStyles, medicamentStyles, sectionStyles, combineStyles } from '../styles';
import {
  PDFHeader,
  PDFFooter,
  PDFTitle,
  PDFPatientBox,
  PDFSignature,
  type PraticienInfo,
} from '../components';
import type { Medicament } from '@/types/ordonnance';

// ============================================================================
// Types
// ============================================================================

export interface OrdonnanceTemplateProps {
  medicaments: Medicament[];
  patient: {
    nom: string;
    prenom?: string;
    dateNaissance?: string;
    age?: number;
    sexe?: 'M' | 'F' | 'male' | 'female';
  };
  praticien?: PraticienInfo;
  date?: Date;
  commentaire?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

function MedicamentRow({
  medicament,
  index,
  isLast,
}: {
  medicament: Medicament;
  index: number;
  isLast: boolean;
}) {
  return (
    <View style={combineStyles(medicamentStyles.container, isLast && medicamentStyles.lastItem)}>
      <View style={baseStyles.row}>
        <Text style={medicamentStyles.number}>{index + 1}.</Text>
        <View style={baseStyles.flex1}>
          {/* Nom et forme */}
          <Text style={medicamentStyles.name}>
            {medicament.nom} {medicament.forme && `— ${medicament.forme}`}
          </Text>

          {/* Posologie */}
          <Text style={medicamentStyles.posologie}>{medicament.posologie}</Text>

          {/* Durée et quantité */}
          <Text style={medicamentStyles.details}>
            Durée : {medicament.duree}
            {medicament.quantite && ` — Quantité : ${medicament.quantite}`}
          </Text>

          {/* Instructions */}
          {medicament.instructions && (
            <Text style={medicamentStyles.substitution}>{medicament.instructions}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Main Template
// ============================================================================

export function OrdonnanceTemplate({
  medicaments,
  patient,
  praticien,
  date,
  commentaire,
}: OrdonnanceTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        {/* Header */}
        <PDFHeader praticien={praticien} date={date} />

        {/* Title */}
        <PDFTitle>Ordonnance</PDFTitle>

        {/* Patient Info */}
        <PDFPatientBox
          nom={patient.nom}
          prenom={patient.prenom}
          dateNaissance={patient.dateNaissance}
          age={patient.age}
          sexe={patient.sexe}
        />

        {/* Médicaments */}
        <View style={baseStyles.mb6}>
          {medicaments.map((medicament, index) => (
            <MedicamentRow
              key={medicament.id}
              medicament={medicament}
              index={index}
              isLast={index === medicaments.length - 1}
            />
          ))}
        </View>

        {/* Commentaire */}
        {commentaire && (
          <View style={[sectionStyles.container, baseStyles.mt4]}>
            <Text style={sectionStyles.title}>Commentaire</Text>
            <Text style={baseStyles.text}>{commentaire}</Text>
          </View>
        )}

        {/* Signature */}
        <PDFSignature praticien={praticien} />

        {/* Footer */}
        <PDFFooter text="Document généré par Selav" />
      </Page>
    </Document>
  );
}
