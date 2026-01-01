'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TOUS_EXAMENS_ORL,
  EXAMENS_IMAGERIE,
  EXAMENS_BIOLOGIE,
  EXAMENS_EXPLORATION,
  type ExamenORL,
} from '@/lib/constants/examens-orl';
import { CATEGORIES_EXAMEN, type ExamenExtrait } from '@/types/bilan';

// ============================================================================
// Types
// ============================================================================

interface ExamenSelectorProps {
  selectedExamens: ExamenExtrait[];
  onSelect: (examen: ExamenExtrait) => void;
  onRemove: (code: string) => void;
  className?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

function ExamenCard({
  examen,
  isSelected,
  onToggle,
  indication,
  onIndicationChange,
  urgent,
  onUrgentChange,
}: {
  examen: ExamenORL;
  isSelected: boolean;
  onToggle: () => void;
  indication: string;
  onIndicationChange: (value: string) => void;
  urgent: boolean;
  onUrgentChange: (value: boolean) => void;
}) {
  const [localIndication, setLocalIndication] = useState(indication);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalIndication(indication);
    setHasChanges(false);
  }, [indication]);

  const handleLocalChange = (value: string) => {
    setLocalIndication(value);
    setHasChanges(value !== indication);
  };

  const handleConfirm = () => {
    if (hasChanges) {
      onIndicationChange(localIndication);
      setHasChanges(false);
    }
  };

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        isSelected ? 'bg-primary/5 border-primary' : 'bg-card hover:bg-accent/50'
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          className="mt-0.5"
          id={`examen-${examen.code}`}
        />
        <div className="flex-1 min-w-0 space-y-1">
          <label
            htmlFor={`examen-${examen.code}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="font-medium text-sm">{examen.code}</span>
            <span className="text-sm text-muted-foreground">—</span>
            <span className="text-sm">{examen.libelle}</span>
          </label>
          <p className="text-xs text-muted-foreground">{examen.description}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {examen.indicationsTypes.slice(0, 3).map((ind) => (
              <Badge key={ind} variant="outline" className="text-xs">
                {ind}
              </Badge>
            ))}
            {examen.indicationsTypes.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{examen.indicationsTypes.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 pl-7 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Indication clinique..."
              value={localIndication}
              onChange={(e) => handleLocalChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              className="h-8 text-sm flex-1"
            />
            {hasChanges && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 px-2"
                onClick={handleConfirm}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={urgent} onCheckedChange={(v) => onUrgentChange(!!v)} />
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>Urgent</span>
          </label>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Selected Examens Display
// ============================================================================

function SelectedExamens({
  examens,
  onRemove,
}: {
  examens: ExamenExtrait[];
  onRemove: (code: string) => void;
}) {
  if (examens.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
      {examens.map((examen) => (
        <Badge
          key={examen.code}
          variant={examen.urgent ? 'destructive' : 'secondary'}
          className="pl-2 pr-1 py-1 gap-1"
        >
          <span>{examen.code}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 hover:bg-transparent"
            onClick={() => onRemove(examen.code)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ExamenSelector({
  selectedExamens,
  onSelect,
  onRemove,
  className,
}: ExamenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [indications, setIndications] = useState<Record<string, string>>({});
  const [urgentFlags, setUrgentFlags] = useState<Record<string, boolean>>({});

  // Map des examens sélectionnés par code
  const selectedCodesSet = useMemo(
    () => new Set(selectedExamens.map((e) => e.code)),
    [selectedExamens]
  );

  // Filtrer les examens par recherche
  const filterExamens = (examens: ExamenORL[]) => {
    if (!searchQuery.trim()) return examens;
    const query = searchQuery.toLowerCase();
    return examens.filter(
      (e) =>
        e.code.toLowerCase().includes(query) ||
        e.libelle.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.indicationsTypes.some((i) => i.toLowerCase().includes(query))
    );
  };

  const handleToggle = (examen: ExamenORL) => {
    if (selectedCodesSet.has(examen.code)) {
      onRemove(examen.code);
    } else {
      onSelect({
        code: examen.code,
        libelle: examen.libelle,
        categorie: examen.categorie,
        indication: indications[examen.code] || '',
        urgent: urgentFlags[examen.code] || false,
      });
    }
  };

  const handleIndicationChange = (code: string, indication: string) => {
    setIndications((prev) => ({ ...prev, [code]: indication }));
    const examen = selectedExamens.find((e) => e.code === code);
    if (examen) {
      onSelect({ ...examen, indication });
    }
  };

  const handleUrgentChange = (code: string, urgent: boolean) => {
    setUrgentFlags((prev) => ({ ...prev, [code]: urgent }));
    const examen = selectedExamens.find((e) => e.code === code);
    if (examen) {
      onSelect({ ...examen, urgent });
    }
  };

  const renderExamenList = (examens: ExamenORL[]) => {
    const filtered = filterExamens(examens);
    if (filtered.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-4">Aucun examen trouvé</p>;
    }
    return (
      <div className="space-y-2">
        {filtered.map((examen) => {
          const selected = selectedExamens.find((e) => e.code === examen.code);
          return (
            <ExamenCard
              key={examen.code}
              examen={examen}
              isSelected={selectedCodesSet.has(examen.code)}
              onToggle={() => handleToggle(examen)}
              indication={selected?.indication || indications[examen.code] || ''}
              onIndicationChange={(v) => handleIndicationChange(examen.code, v)}
              urgent={selected?.urgent || urgentFlags[examen.code] || false}
              onUrgentChange={(v) => handleUrgentChange(examen.code, v)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Examens sélectionnés */}
      <SelectedExamens examens={selectedExamens} onRemove={onRemove} />

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un examen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Onglets par catégorie */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all" className="text-xs">
            Tous ({TOUS_EXAMENS_ORL.length})
          </TabsTrigger>
          <TabsTrigger value="imagerie" className="text-xs">
            {CATEGORIES_EXAMEN.imagerie} ({EXAMENS_IMAGERIE.length})
          </TabsTrigger>
          <TabsTrigger value="biologie" className="text-xs">
            {CATEGORIES_EXAMEN.biologie} ({EXAMENS_BIOLOGIE.length})
          </TabsTrigger>
          <TabsTrigger value="exploration" className="text-xs">
            Explor. ({EXAMENS_EXPLORATION.length})
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[300px] mt-3">
          <TabsContent value="all" className="mt-0">
            {renderExamenList(TOUS_EXAMENS_ORL)}
          </TabsContent>
          <TabsContent value="imagerie" className="mt-0">
            {renderExamenList(EXAMENS_IMAGERIE)}
          </TabsContent>
          <TabsContent value="biologie" className="mt-0">
            {renderExamenList(EXAMENS_BIOLOGIE)}
          </TabsContent>
          <TabsContent value="exploration" className="mt-0">
            {renderExamenList(EXAMENS_EXPLORATION)}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
