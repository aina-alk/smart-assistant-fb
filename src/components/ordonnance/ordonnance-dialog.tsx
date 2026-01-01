'use client';

import { useState, useCallback, forwardRef } from 'react';
import { FileText, Printer, X, Save, Loader2, Pill, CheckCircle2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OrdonnanceEditor } from './ordonnance-editor';
import type { MedicamentExtrait, Ordonnance } from '@/types/ordonnance';
import type { Patient } from '@/types/patient';
import { getPatientFullName, getPatientAge } from '@/types/patient';

// ============================================================================
// Types
// ============================================================================

interface OrdonnanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (medicaments: MedicamentExtrait[], commentaire?: string) => Promise<void>;
  consultationId: string;
  patient?: Patient | null;
  praticien?: {
    nom: string;
    specialite?: string;
  };
  conduite?: string;
  initialMedicaments?: MedicamentExtrait[];
  initialCommentaire?: string;
}

interface OrdonnancePreviewProps {
  medicaments: MedicamentExtrait[];
  patient?: Patient | null;
  praticien?: {
    nom: string;
    specialite?: string;
  };
  date?: Date;
  commentaire?: string;
  className?: string;
}

// ============================================================================
// Print-Ready Ordonnance Document
// ============================================================================

export const OrdonnancePreviewDocument = forwardRef<HTMLDivElement, OrdonnancePreviewProps>(
  function OrdonnancePreviewDocument(
    { medicaments, patient, praticien, date, commentaire, className },
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
            <Pill className="h-5 w-5 print:hidden" />
            Ordonnance
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

        {/* Medications */}
        <div className="space-y-6 my-8">
          {medicaments.map((medicament, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start gap-3">
                <span className="font-bold text-lg">{index + 1}.</span>
                <div className="flex-1">
                  <p className="font-bold uppercase">{medicament.nom}</p>
                  <p className="text-muted-foreground">{medicament.forme}</p>
                  <p className="mt-2">{medicament.posologie}</p>
                  <p className="text-sm text-muted-foreground">
                    Durée : {medicament.duree}
                    {medicament.quantite && ` — Quantité : ${medicament.quantite}`}
                  </p>
                  {medicament.instructions && (
                    <p className="mt-1 text-sm italic text-muted-foreground">
                      {medicament.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Commentaire */}
        {commentaire && (
          <div className="mt-6 p-4 border rounded-md">
            <p className="font-medium mb-2">Commentaire :</p>
            <p className="whitespace-pre-wrap">{commentaire}</p>
          </div>
        )}

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

export function OrdonnanceDialog({
  open,
  onClose,
  onSave,
  patient,
  praticien,
  conduite,
  initialMedicaments = [],
  initialCommentaire = '',
}: OrdonnanceDialogProps) {
  const [medicaments, setMedicaments] = useState<MedicamentExtrait[]>(initialMedicaments);
  const [commentaire, setCommentaire] = useState(initialCommentaire);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const handleSave = useCallback(async () => {
    if (medicaments.length === 0) return;

    setIsSaving(true);
    try {
      await onSave(medicaments, commentaire || undefined);

      setSavedCount((prev) => prev + 1);
      setMedicaments([]);
      setCommentaire('');
      setShowPreview(false);

      toast.success('Ordonnance enregistrée', {
        description: 'Vous pouvez créer une autre ordonnance',
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    } finally {
      setIsSaving(false);
    }
  }, [medicaments, commentaire, onSave]);

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
                <FileText className="h-5 w-5" />
                Aperçu de l&apos;ordonnance
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
            <OrdonnancePreviewDocument
              medicaments={medicaments}
              patient={patient}
              praticien={praticien}
              commentaire={commentaire}
            />
          </div>

          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Retour à l&apos;édition
            </Button>
            <Button onClick={handleSave} disabled={isSaving || medicaments.length === 0}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer l&apos;ordonnance
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
            <Pill className="h-5 w-5 text-primary" />
            Nouvelle ordonnance
            {savedCount > 0 && (
              <Badge variant="secondary" className="ml-2 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {savedCount} enregistrée{savedCount > 1 ? 's' : ''}
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

          {/* Ordonnance editor */}
          <OrdonnanceEditor
            medicaments={medicaments}
            onMedicamentsChange={setMedicaments}
            conduite={conduite}
          />

          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
            <Textarea
              id="commentaire"
              placeholder="Instructions particulières, recommandations..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Fermer
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowPreview(true)}
            disabled={medicaments.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          <Button onClick={handleSave} disabled={isSaving || medicaments.length === 0}>
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
// Preview Dialog (for viewing existing ordonnances)
// ============================================================================

interface OrdonnanceViewDialogProps {
  open: boolean;
  onClose: () => void;
  ordonnance: Ordonnance;
  patient?: Patient | null;
  praticien?: {
    nom: string;
    specialite?: string;
  };
}

export function OrdonnanceViewDialog({
  open,
  onClose,
  ordonnance,
  patient,
  praticien,
}: OrdonnanceViewDialogProps) {
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
              Ordonnance du{' '}
              {new Intl.DateTimeFormat('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(ordonnance.date))}
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
          <OrdonnancePreviewDocument
            medicaments={ordonnance.medicaments}
            patient={patient}
            praticien={praticien}
            date={new Date(ordonnance.date)}
            commentaire={ordonnance.commentaire}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
