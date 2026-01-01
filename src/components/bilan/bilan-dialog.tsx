'use client';

import { useState, useCallback, forwardRef } from 'react';
import {
  FileSearch,
  Printer,
  X,
  Save,
  Loader2,
  AlertTriangle,
  TestTube,
  Radio,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BilanEditor } from './bilan-editor';
import type { ExamenExtrait, BilanPrescription, CategorieExamen } from '@/types/bilan';
import type { Patient } from '@/types/patient';
import { getPatientFullName, getPatientAge } from '@/types/patient';

// ============================================================================
// Types
// ============================================================================

interface BilanDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (examens: ExamenExtrait[], contexte_clinique: string) => Promise<void>;
  consultationId: string;
  patient?: Patient | null;
  praticien?: {
    nom: string;
    specialite?: string;
  };
  crc?: string;
  diagnostic?: string;
  initialExamens?: ExamenExtrait[];
  initialContexte?: string;
}

interface BilanPreviewProps {
  examens: ExamenExtrait[];
  patient?: Patient | null;
  praticien?: {
    nom: string;
    specialite?: string;
  };
  date?: Date;
  contexte_clinique?: string;
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const CATEGORIE_ICONS: Record<CategorieExamen, typeof Radio> = {
  imagerie: Radio,
  biologie: TestTube,
  exploration: Activity,
  autre: FileSearch,
};

const CATEGORIE_LABELS: Record<CategorieExamen, string> = {
  imagerie: 'Imagerie',
  biologie: 'Biologie',
  exploration: 'Explorations fonctionnelles',
  autre: 'Autre',
};

// ============================================================================
// Print-Ready Bilan Document
// ============================================================================

export const BilanPreviewDocument = forwardRef<HTMLDivElement, BilanPreviewProps>(
  function BilanPreviewDocument(
    { examens, patient, praticien, date, contexte_clinique, className },
    ref
  ) {
    const formattedDate = date
      ? new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(date)
      : new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date());

    // Grouper les examens par catégorie
    const groupedExamens = examens.reduce(
      (acc, examen) => {
        if (!acc[examen.categorie]) {
          acc[examen.categorie] = [];
        }
        acc[examen.categorie].push(examen);
        return acc;
      },
      {} as Record<CategorieExamen, ExamenExtrait[]>
    );

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
            <FileSearch className="h-5 w-5 print:hidden" />
            Prescription d&apos;Examens Complémentaires
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

        {/* Contexte clinique */}
        {contexte_clinique && (
          <div className="mb-6 p-4 border rounded-md">
            <p className="font-medium mb-2">Contexte clinique :</p>
            <p className="whitespace-pre-wrap">{contexte_clinique}</p>
          </div>
        )}

        {/* Examens par catégorie */}
        <div className="space-y-6 my-8">
          {Object.entries(groupedExamens).map(([categorie, catExamens]) => {
            const Icon = CATEGORIE_ICONS[categorie as CategorieExamen];
            return (
              <div key={categorie}>
                <h2 className="font-bold text-base mb-3 flex items-center gap-2 uppercase">
                  <Icon className="h-4 w-4 print:hidden" />
                  {CATEGORIE_LABELS[categorie as CategorieExamen]}
                </h2>
                <div className="space-y-3 pl-4">
                  {catExamens.map((examen, index) => (
                    <div key={examen.code} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <span className="font-bold">{index + 1}.</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold">{examen.code}</p>
                            <span className="text-muted-foreground">—</span>
                            <p>{examen.libelle}</p>
                            {examen.urgent && (
                              <Badge
                                variant="destructive"
                                className="text-xs gap-1 print:border print:border-red-500 print:bg-transparent print:text-red-500"
                              >
                                <AlertTriangle className="h-3 w-3" />
                                URGENT
                              </Badge>
                            )}
                          </div>
                          {examen.indication && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Indication : {examen.indication}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
// Main Dialog Component
// ============================================================================

export function BilanDialog({
  open,
  onClose,
  onSave,
  patient,
  praticien,
  crc,
  diagnostic,
  initialExamens = [],
  initialContexte = '',
}: BilanDialogProps) {
  const [examens, setExamens] = useState<ExamenExtrait[]>(initialExamens);
  const [contexte] = useState(initialContexte);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const handleSave = useCallback(async () => {
    if (examens.length === 0) return;

    setIsSaving(true);
    try {
      const contexteToSave =
        contexte || examens.map((e) => `${e.code}: ${e.indication || e.libelle}`).join('\n');
      await onSave(examens, contexteToSave);

      setSavedCount((prev) => prev + 1);
      setExamens([]);
      setShowPreview(false);

      toast.success('Bilan enregistré', {
        description: 'Vous pouvez créer une autre prescription',
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    } finally {
      setIsSaving(false);
    }
  }, [examens, contexte, onSave]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  // Preview mode
  if (showPreview) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
          <DialogHeader className="print:hidden">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5" />
                Aperçu du bilan
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="border rounded-lg overflow-hidden print:border-none">
            <BilanPreviewDocument
              examens={examens}
              patient={patient}
              praticien={praticien}
              contexte_clinique={contexte}
            />
          </div>

          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Retour à l&apos;édition
            </Button>
            <Button onClick={handleSave} disabled={isSaving || examens.length === 0}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer le bilan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Edit mode
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            Nouvelle prescription d&apos;examens
            {savedCount > 0 && (
              <Badge variant="secondary" className="ml-2 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {savedCount} enregistré{savedCount > 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient info */}
          {patient && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">
                <span className="font-medium">Patient :</span> {getPatientFullName(patient)},{' '}
                {getPatientAge(patient)} ans
              </p>
            </div>
          )}

          {/* Bilan editor */}
          <BilanEditor
            examens={examens}
            onExamensChange={setExamens}
            crc={crc}
            diagnostic={diagnostic}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Fermer
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowPreview(true)}
            disabled={examens.length === 0}
          >
            <FileSearch className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          <Button onClick={handleSave} disabled={isSaving || examens.length === 0}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Preview Dialog (for viewing existing bilans)
// ============================================================================

interface BilanViewDialogProps {
  open: boolean;
  onClose: () => void;
  bilan: BilanPrescription;
  patient?: Patient | null;
  praticien?: {
    nom: string;
    specialite?: string;
  };
}

export function BilanViewDialog({
  open,
  onClose,
  bilan,
  patient,
  praticien,
}: BilanViewDialogProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Bilan du{' '}
              {new Intl.DateTimeFormat('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(bilan.date))}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="border rounded-lg overflow-hidden print:border-none">
          <BilanPreviewDocument
            examens={bilan.examens}
            patient={patient}
            praticien={praticien}
            date={new Date(bilan.date)}
            contexte_clinique={bilan.contexte_clinique}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
