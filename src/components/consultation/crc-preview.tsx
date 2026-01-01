'use client';

import { forwardRef } from 'react';
import { FileText, Stethoscope, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { CRCGenerated, CRCExamen } from '@/types/generation';
import type { Patient } from '@/types/patient';
import { getPatientFullName, getPatientAge } from '@/types/patient';

// ============================================================================
// Types
// ============================================================================

export interface CRCPreviewProps {
  crc: CRCGenerated;
  patient?: Patient | null;
  praticien?: {
    nom: string;
    specialite?: string;
  };
  dateConsultation?: Date;
  className?: string;
}

export interface CRCPreviewDialogProps extends CRCPreviewProps {
  open: boolean;
  onClose: () => void;
}

// ============================================================================
// Examen Labels
// ============================================================================

const EXAMEN_LABELS: Record<keyof CRCExamen, string> = {
  otoscopie: 'Otoscopie',
  rhinoscopie: 'Rhinoscopie',
  oropharynx: 'Oropharynx',
  palpation_cervicale: 'Palpation cervicale',
  autres: 'Autres',
};

// ============================================================================
// Print-Ready CRC Document
// ============================================================================

export const CRCPreviewDocument = forwardRef<HTMLDivElement, CRCPreviewProps>(
  function CRCPreviewDocument({ crc, patient, praticien, dateConsultation, className }, ref) {
    const formattedDate = dateConsultation
      ? new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(dateConsultation)
      : new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date());

    // Filter filled examen fields
    const filledExamenFields = (
      Object.entries(crc.examen) as [keyof CRCExamen, string | null][]
    ).filter(([, value]) => value && value.trim().length > 0);

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white text-black p-8 max-w-[210mm] mx-auto',
          'print:p-0 print:max-w-none print:m-0',
          'font-serif text-sm leading-relaxed',
          className
        )}
      >
        {/* Header */}
        <header className="mb-8 print:mb-6">
          {praticien && (
            <div className="text-left mb-4">
              <p className="font-bold text-lg">{praticien.nom}</p>
              {praticien.specialite && (
                <p className="text-muted-foreground">{praticien.specialite}</p>
              )}
            </div>
          )}

          <div className="text-right text-sm text-muted-foreground">
            <p>{formattedDate}</p>
          </div>
        </header>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2">
            <FileText className="h-5 w-5 print:hidden" />
            Compte-Rendu de Consultation
          </h1>
          <Separator className="mt-4" />
        </div>

        {/* Patient Info */}
        {patient && (
          <div className="mb-6 p-4 bg-muted/30 rounded-md print:bg-transparent print:border print:border-gray-300">
            <p className="font-semibold">
              Patient : {getPatientFullName(patient)}, {getPatientAge(patient)} ans,{' '}
              {patient.sexe === 'M' ? 'Homme' : 'Femme'}
            </p>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Motif */}
          <section>
            <h2 className="font-bold text-base uppercase mb-2 border-b pb-1">
              Motif de Consultation
            </h2>
            <p className="whitespace-pre-wrap">{crc.motif}</p>
          </section>

          {/* Histoire */}
          <section>
            <h2 className="font-bold text-base uppercase mb-2 border-b pb-1">
              Histoire de la Maladie
            </h2>
            <p className="whitespace-pre-wrap">{crc.histoire}</p>
          </section>

          {/* Examen Clinique */}
          <section>
            <h2 className="font-bold text-base uppercase mb-2 border-b pb-1 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 print:hidden" />
              Examen Clinique ORL
            </h2>
            {filledExamenFields.length > 0 ? (
              <dl className="space-y-2">
                {filledExamenFields.map(([field, value]) => (
                  <div key={field} className="grid grid-cols-[180px_1fr] gap-2">
                    <dt className="font-medium text-muted-foreground">{EXAMEN_LABELS[field]} :</dt>
                    <dd className="whitespace-pre-wrap">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-muted-foreground italic">Non renseigné</p>
            )}
          </section>

          {/* Examens Complémentaires */}
          {crc.examens_complementaires && (
            <section>
              <h2 className="font-bold text-base uppercase mb-2 border-b pb-1">
                Examens Complémentaires
              </h2>
              <p className="whitespace-pre-wrap">{crc.examens_complementaires}</p>
            </section>
          )}

          {/* Diagnostic */}
          <section>
            <h2 className="font-bold text-base uppercase mb-2 border-b pb-1">Diagnostic</h2>
            <p className="whitespace-pre-wrap font-medium">{crc.diagnostic}</p>
          </section>

          {/* Conduite à Tenir */}
          <section>
            <h2 className="font-bold text-base uppercase mb-2 border-b pb-1">Conduite à Tenir</h2>
            <p className="whitespace-pre-wrap">{crc.conduite}</p>
          </section>

          {/* Conclusion */}
          <section>
            <h2 className="font-bold text-base uppercase mb-2 border-b pb-1">Conclusion</h2>
            <p className="whitespace-pre-wrap">{crc.conclusion}</p>
          </section>
        </div>

        {/* Footer / Signature */}
        <footer className="mt-12 pt-8 border-t print:mt-8">
          <div className="text-right">
            {praticien && (
              <>
                <p className="font-medium">{praticien.nom}</p>
                {praticien.specialite && (
                  <p className="text-sm text-muted-foreground">{praticien.specialite}</p>
                )}
              </>
            )}
          </div>
        </footer>
      </div>
    );
  }
);

// ============================================================================
// Preview Dialog Component
// ============================================================================

export function CRCPreviewDialog({
  open,
  onClose,
  crc,
  patient,
  praticien,
  dateConsultation,
}: CRCPreviewDialogProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aperçu du Compte-Rendu
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </DialogHeader>

        <div className="border rounded-lg overflow-hidden print:border-none">
          <CRCPreviewDocument
            crc={crc}
            patient={patient}
            praticien={praticien}
            dateConsultation={dateConsultation}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Compact Preview (for inline display)
// ============================================================================

export function CRCPreviewCompact({ crc, className }: { crc: CRCGenerated; className?: string }) {
  return (
    <div className={cn('space-y-4 text-sm', className)}>
      <div>
        <h4 className="font-medium text-muted-foreground mb-1">Motif</h4>
        <p>{crc.motif}</p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-1">Diagnostic</h4>
        <p>{crc.diagnostic}</p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-1">Conduite à tenir</h4>
        <p>{crc.conduite}</p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-1">Conclusion</h4>
        <p>{crc.conclusion}</p>
      </div>
    </div>
  );
}
