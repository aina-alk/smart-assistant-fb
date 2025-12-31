'use client';

import { useState, useCallback } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Pill,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MedicamentForm } from './medicament-form';
import type { MedicamentExtrait, MedicamentCreate } from '@/types/ordonnance';

// ============================================================================
// Types
// ============================================================================

interface OrdonnanceEditorProps {
  medicaments: MedicamentExtrait[];
  onMedicamentsChange: (medicaments: MedicamentExtrait[]) => void;
  conduite?: string;
  className?: string;
  readOnly?: boolean;
}

// ============================================================================
// Medicament Row Component
// ============================================================================

function MedicamentRow({
  medicament,
  index,
  onRemove,
  readOnly,
}: {
  medicament: MedicamentExtrait;
  index: number;
  onRemove: () => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{medicament.nom}</span>
          <Badge variant="outline" className="text-xs">
            {medicament.forme}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{medicament.posologie}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Durée : {medicament.duree}</span>
          {medicament.quantite && <span>Qté : {medicament.quantite}</span>}
        </div>
        {medicament.instructions && (
          <p className="text-xs text-muted-foreground italic mt-1">{medicament.instructions}</p>
        )}
      </div>
      {!readOnly && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyMedicaments() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Pill className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground">Aucun médicament</p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        Ajoutez des médicaments manuellement ou extrayez-les depuis la conduite à tenir
      </p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function OrdonnanceEditor({
  medicaments,
  onMedicamentsChange,
  conduite,
  className,
  readOnly = false,
}: OrdonnanceEditorProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [conduiteText, setConduiteText] = useState(conduite || '');

  // Handler pour l'extraction IA
  const handleExtract = useCallback(async () => {
    if (!conduiteText.trim()) {
      setExtractError('Veuillez saisir une conduite à tenir');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      const response = await fetch('/api/ordonnances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conduite: conduiteText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'extraction");
      }

      const data = await response.json();

      if (data.medicaments && data.medicaments.length > 0) {
        // Fusionner avec les médicaments existants
        onMedicamentsChange([...medicaments, ...data.medicaments]);
      } else if (data.notes) {
        setExtractError(data.notes);
      } else {
        setExtractError('Aucun médicament trouvé dans la conduite à tenir');
      }
    } catch (error) {
      setExtractError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsExtracting(false);
    }
  }, [conduiteText, medicaments, onMedicamentsChange]);

  // Handler pour ajouter un médicament manuellement
  const handleAddMedicament = useCallback(
    (data: MedicamentCreate) => {
      const newMedicament: MedicamentExtrait = {
        nom: data.nom,
        forme: data.forme,
        posologie: data.posologie,
        duree: data.duree,
        quantite: data.quantite,
        instructions: data.instructions,
      };
      onMedicamentsChange([...medicaments, newMedicament]);
      setIsAddFormOpen(false);
    },
    [medicaments, onMedicamentsChange]
  );

  // Handler pour supprimer un médicament
  const handleRemoveMedicament = useCallback(
    (index: number) => {
      const updated = medicaments.filter((_, i) => i !== index);
      onMedicamentsChange(updated);
    },
    [medicaments, onMedicamentsChange]
  );

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Ordonnance
            {medicaments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {medicaments.length} médicament{medicaments.length > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Section extraction IA */}
        {!readOnly && (
          <Collapsible defaultOpen={medicaments.length === 0}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between" size="sm">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Extraction automatique
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <Textarea
                placeholder="Collez ou saisissez la conduite à tenir pour en extraire les médicaments..."
                value={conduiteText}
                onChange={(e) => setConduiteText(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {extractError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {extractError}
                </div>
              )}
              <Button
                onClick={handleExtract}
                disabled={isExtracting || !conduiteText.trim()}
                className="w-full"
                variant="secondary"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extraction en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Extraire les médicaments
                  </>
                )}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        )}

        {!readOnly && medicaments.length > 0 && <Separator />}

        {/* Liste des médicaments */}
        {medicaments.length > 0 ? (
          <div className="space-y-2">
            {medicaments.map((medicament, index) => (
              <MedicamentRow
                key={`${medicament.nom}-${index}`}
                medicament={medicament}
                index={index}
                onRemove={() => handleRemoveMedicament(index)}
                readOnly={readOnly}
              />
            ))}
          </div>
        ) : (
          <EmptyMedicaments />
        )}

        {/* Bouton ajout manuel */}
        {!readOnly && (
          <>
            <Separator />
            <Collapsible open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  {isAddFormOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Fermer
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un médicament manuellement
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <MedicamentForm
                  onSubmit={handleAddMedicament}
                  onCancel={() => setIsAddFormOpen(false)}
                  submitLabel="Ajouter"
                />
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </CardContent>
    </Card>
  );
}
