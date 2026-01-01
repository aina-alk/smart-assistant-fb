'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { TacheStatut, TachePriorite, TacheCategorie } from '@/types/tache';

// Value spéciale pour représenter "Toutes" (car Radix UI interdit value="")
const ALL_VALUE = '__all__';

interface TacheFiltersProps {
  statut?: TacheStatut;
  priorite?: TachePriorite;
  categorie?: TacheCategorie;
  onStatutChange: (statut: TacheStatut | undefined) => void;
  onPrioriteChange: (priorite: TachePriorite | undefined) => void;
  onCategorieChange: (categorie: TacheCategorie | undefined) => void;
}

const statutOptions: { value: TacheStatut; label: string }[] = [
  { value: 'a_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'terminee', label: 'Terminées' },
  { value: 'annulee', label: 'Annulées' },
];

const prioriteOptions: { value: TachePriorite; label: string }[] = [
  { value: 'urgente', label: 'Urgente' },
  { value: 'haute', label: 'Haute' },
  { value: 'normale', label: 'Normale' },
  { value: 'basse', label: 'Basse' },
];

const categorieOptions: { value: TacheCategorie; label: string }[] = [
  { value: 'rappel', label: 'Rappel' },
  { value: 'suivi', label: 'Suivi' },
  { value: 'administratif', label: 'Administratif' },
  { value: 'medical', label: 'Médical' },
  { value: 'autre', label: 'Autre' },
];

export function TacheFilters({
  statut,
  priorite,
  categorie,
  onStatutChange,
  onPrioriteChange,
  onCategorieChange,
}: TacheFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-2">
        {statutOptions.map((option) => (
          <Button
            key={option.value}
            variant={statut === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatutChange(statut === option.value ? undefined : option.value)}
            className={cn(statut === option.value && 'ring-2 ring-offset-1')}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="h-6 w-px bg-border hidden sm:block" />

      <Select
        value={priorite || ALL_VALUE}
        onValueChange={(value) =>
          onPrioriteChange(value === ALL_VALUE ? undefined : (value as TachePriorite))
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Priorité" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Toutes</SelectItem>
          {prioriteOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={categorie || ALL_VALUE}
        onValueChange={(value) =>
          onCategorieChange(value === ALL_VALUE ? undefined : (value as TacheCategorie))
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Toutes</SelectItem>
          {categorieOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
