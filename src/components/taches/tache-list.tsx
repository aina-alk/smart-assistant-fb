'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { TacheCard } from './tache-card';
import type { Tache, TachePriorite } from '@/types/tache';

interface TacheListProps {
  taches: Tache[];
  isLoading?: boolean;
  onComplete?: (id: string) => void;
  onEdit?: (tache: Tache) => void;
  onDelete?: (id: string) => void;
  onPatientClick?: (patientId: string) => void;
}

const prioriteOrder: TachePriorite[] = ['urgente', 'haute', 'normale', 'basse'];

const prioriteLabels: Record<TachePriorite, string> = {
  urgente: 'Urgentes',
  haute: 'Haute priorité',
  normale: 'Priorité normale',
  basse: 'Basse priorité',
};

function groupByPriorite(taches: Tache[]): Map<TachePriorite, Tache[]> {
  const groups = new Map<TachePriorite, Tache[]>();
  prioriteOrder.forEach((p) => groups.set(p, []));

  taches.forEach((tache) => {
    const group = groups.get(tache.priorite);
    if (group) {
      group.push(tache);
    }
  });

  return groups;
}

export function TacheList({
  taches,
  isLoading = false,
  onComplete,
  onEdit,
  onDelete,
  onPatientClick,
}: TacheListProps) {
  if (isLoading) {
    return <TacheListSkeleton />;
  }

  if (taches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">Aucune tâche</p>
        <p className="text-sm text-muted-foreground">
          Créez votre première tâche avec le bouton ci-dessus
        </p>
      </div>
    );
  }

  const activeTaches = taches.filter((t) => t.statut !== 'terminee' && t.statut !== 'annulee');
  const completedTaches = taches.filter((t) => t.statut === 'terminee' || t.statut === 'annulee');

  const groupedActive = groupByPriorite(activeTaches);

  return (
    <div className="space-y-6">
      {prioriteOrder.map((priorite) => {
        const groupTaches = groupedActive.get(priorite) || [];
        if (groupTaches.length === 0) return null;

        return (
          <div key={priorite}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {prioriteLabels[priorite]} ({groupTaches.length})
            </h3>
            <div className="space-y-2">
              {groupTaches.map((tache) => (
                <TacheCard
                  key={tache.id}
                  tache={tache}
                  onComplete={onComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPatientClick={onPatientClick}
                />
              ))}
            </div>
          </div>
        );
      })}

      {completedTaches.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Terminées ({completedTaches.length})
          </h3>
          <div className="space-y-2">
            {completedTaches.map((tache) => (
              <TacheCard
                key={tache.id}
                tache={tache}
                onComplete={onComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                onPatientClick={onPatientClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TacheListSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
