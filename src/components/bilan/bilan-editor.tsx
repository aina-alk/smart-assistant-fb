'use client';

import { useState, useCallback } from 'react';
import {
  FileSearch,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  TestTube,
  Radio,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExamenSelector } from './examen-selector';
import type { ExamenExtrait, CategorieExamen } from '@/types/bilan';

// ============================================================================
// Types
// ============================================================================

interface BilanEditorProps {
  examens: ExamenExtrait[];
  onExamensChange: (examens: ExamenExtrait[]) => void;
  crc?: string;
  diagnostic?: string;
  className?: string;
  readOnly?: boolean;
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

const CATEGORIE_COLORS: Record<CategorieExamen, string> = {
  imagerie: 'text-blue-500',
  biologie: 'text-green-500',
  exploration: 'text-purple-500',
  autre: 'text-gray-500',
};

// ============================================================================
// Examen Row Component
// ============================================================================

function ExamenRow({
  examen,
  onRemove,
  readOnly,
}: {
  examen: ExamenExtrait;
  onRemove: () => void;
  readOnly?: boolean;
}) {
  const Icon = CATEGORIE_ICONS[examen.categorie];
  const iconColor = CATEGORIE_COLORS[examen.categorie];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted',
          iconColor
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{examen.code}</span>
          <span className="text-sm text-muted-foreground">—</span>
          <span className="text-sm">{examen.libelle}</span>
          {examen.urgent && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" />
              Urgent
            </Badge>
          )}
        </div>
        {examen.indication && <p className="text-sm text-muted-foreground">{examen.indication}</p>}
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

function EmptyExamens() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <FileSearch className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground">Aucun examen prescrit</p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        Ajoutez des examens manuellement ou extrayez-les depuis le CRC
      </p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function BilanEditor({
  examens,
  onExamensChange,
  crc,
  diagnostic,
  className,
  readOnly = false,
}: BilanEditorProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [crcText, setCrcText] = useState(crc || '');

  // Handler pour l'extraction IA
  const handleExtract = useCallback(async () => {
    if (!crcText.trim()) {
      setExtractError('Veuillez saisir un compte-rendu de consultation');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      const response = await fetch('/api/bilans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crc: crcText, diagnostic }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'extraction");
      }

      const data = await response.json();

      if (data.examens && data.examens.length > 0) {
        // Fusionner avec les examens existants (éviter les doublons)
        const existingCodes = new Set(examens.map((e) => e.code));
        const newExamens = data.examens.filter((e: ExamenExtrait) => !existingCodes.has(e.code));
        onExamensChange([...examens, ...newExamens]);
      } else if (data.notes) {
        setExtractError(data.notes);
      } else {
        setExtractError('Aucun examen trouvé dans le compte-rendu');
      }
    } catch (error) {
      setExtractError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsExtracting(false);
    }
  }, [crcText, diagnostic, examens, onExamensChange]);

  // Handler pour ajouter un examen depuis le sélecteur
  const handleSelectExamen = useCallback(
    (examen: ExamenExtrait) => {
      // Éviter les doublons
      if (!examens.some((e) => e.code === examen.code)) {
        onExamensChange([...examens, examen]);
      }
    },
    [examens, onExamensChange]
  );

  // Handler pour supprimer un examen
  const handleRemoveExamen = useCallback(
    (code: string) => {
      onExamensChange(examens.filter((e) => e.code !== code));
    },
    [examens, onExamensChange]
  );

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
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSearch className="h-4 w-4 text-primary" />
            Bilan / Examens complémentaires
            {examens.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {examens.length} examen{examens.length > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Section extraction IA */}
        {!readOnly && (
          <Collapsible defaultOpen={examens.length === 0}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between" size="sm">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Extraction automatique depuis CRC
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <Textarea
                placeholder="Collez ou saisissez le compte-rendu de consultation pour en extraire les examens à prescrire..."
                value={crcText}
                onChange={(e) => setCrcText(e.target.value)}
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
                disabled={isExtracting || !crcText.trim()}
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
                    Extraire les examens
                  </>
                )}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        )}

        {!readOnly && examens.length > 0 && <Separator />}

        {/* Liste des examens par catégorie */}
        {examens.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedExamens).map(([categorie, catExamens]) => (
              <div key={categorie} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground capitalize">
                  {categorie === 'exploration' ? 'Explorations fonctionnelles' : categorie}
                </h4>
                {catExamens.map((examen) => (
                  <ExamenRow
                    key={examen.code}
                    examen={examen}
                    onRemove={() => handleRemoveExamen(examen.code)}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <EmptyExamens />
        )}

        {/* Sélecteur d'examens manuel */}
        {!readOnly && (
          <>
            <Separator />
            <Collapsible open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  {isSelectorOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Fermer le catalogue
                    </>
                  ) : (
                    <>
                      <FileSearch className="h-4 w-4 mr-2" />
                      Ajouter depuis le catalogue ORL
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <ExamenSelector
                  selectedExamens={examens}
                  onSelect={handleSelectExamen}
                  onRemove={handleRemoveExamen}
                />
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </CardContent>
    </Card>
  );
}
