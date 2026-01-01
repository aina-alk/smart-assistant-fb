'use client';

import { useState } from 'react';
import {
  MoreVertical,
  Pencil,
  Trash2,
  User,
  Calendar,
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Tache, TachePriorite } from '@/types/tache';
import { getTacheCategorieLabel } from '@/types/tache';

interface TacheCardProps {
  tache: Tache;
  patientName?: string;
  onComplete?: (id: string) => void;
  onEdit?: (tache: Tache) => void;
  onDelete?: (id: string) => void;
  onPatientClick?: (patientId: string) => void;
}

const prioriteConfig: Record<
  TachePriorite,
  { color: string; bgColor: string; icon: typeof AlertTriangle }
> = {
  urgente: { color: 'text-red-500', bgColor: 'bg-red-50 border-red-200', icon: AlertTriangle },
  haute: { color: 'text-orange-500', bgColor: 'bg-orange-50 border-orange-200', icon: ArrowUp },
  normale: { color: 'text-yellow-500', bgColor: 'bg-yellow-50 border-yellow-200', icon: Minus },
  basse: { color: 'text-green-500', bgColor: 'bg-green-50 border-green-200', icon: ArrowDown },
};

function formatEcheance(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const echeanceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (echeanceDate.getTime() === today.getTime()) {
    return "Aujourd'hui";
  }
  if (echeanceDate.getTime() === tomorrow.getTime()) {
    return 'Demain';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function TacheCard({
  tache,
  patientName,
  onComplete,
  onEdit,
  onDelete,
  onPatientClick,
}: TacheCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const config = prioriteConfig[tache.priorite];
  const PrioriteIcon = config.icon;
  const isCompleted = tache.statut === 'terminee';
  const isCancelled = tache.statut === 'annulee';
  const isDisabled = isCompleted || isCancelled;

  const handleComplete = async () => {
    if (isDisabled || isCompleting) return;
    setIsCompleting(true);
    try {
      await onComplete?.(tache.id);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 transition-colors',
        isDisabled ? 'bg-muted/50 opacity-60' : config.bgColor
      )}
    >
      <Checkbox
        checked={isCompleted}
        disabled={isDisabled || isCompleting}
        onCheckedChange={handleComplete}
        className="mt-1"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <PrioriteIcon className={cn('h-4 w-4 shrink-0', config.color)} />
          <span className={cn('font-medium', isCompleted && 'line-through text-muted-foreground')}>
            {tache.titre}
          </span>
          {tache.echeance && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatEcheance(tache.echeance)}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          {tache.patientId && (
            <button
              onClick={() => onPatientClick?.(tache.patientId!)}
              className="flex items-center gap-1 hover:text-primary hover:underline"
            >
              <User className="h-3 w-3" />
              {patientName || 'Patient lié'}
            </button>
          )}
          <span>Catégorie: {getTacheCategorieLabel(tache.categorie)}</span>
        </div>

        {tache.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{tache.description}</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit?.(tache)} disabled={isDisabled}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete?.(tache.id)}
            disabled={isCompleted}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
