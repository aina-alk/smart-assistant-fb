'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowUp, Calendar, ChevronRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTaches } from '@/lib/hooks/use-taches';
import { useCompleteTache } from '@/lib/hooks/use-complete-tache';
import { cn } from '@/lib/utils';
import type { TachePriorite } from '@/types/tache';

const prioriteConfig: Record<TachePriorite, { color: string; icon: typeof AlertTriangle }> = {
  urgente: { color: 'text-red-500', icon: AlertTriangle },
  haute: { color: 'text-orange-500', icon: ArrowUp },
  normale: { color: 'text-yellow-500', icon: Clock },
  basse: { color: 'text-green-500', icon: Clock },
};

function formatEcheance(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateOnly.getTime() === today.getTime()) {
    return "Aujourd'hui";
  }
  if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'Demain';
  }
  if (dateOnly < today) {
    return 'En retard';
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function TachesWidget() {
  const { data, isLoading } = useTaches({
    limit: 5,
  });
  const completeTache = useCompleteTache();

  const urgentTaches = (data?.taches || [])
    .filter((t) => t.statut !== 'terminee' && t.statut !== 'annulee')
    .filter((t) => t.priorite === 'urgente' || t.priorite === 'haute')
    .slice(0, 4);

  const handleComplete = async (id: string) => {
    await completeTache.mutateAsync(id);
  };

  if (isLoading) {
    return <TachesWidgetSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Tâches urgentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/medecin/tasks">
            Voir tout
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {urgentTaches.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Aucune tâche urgente</p>
        ) : (
          <div className="space-y-3">
            {urgentTaches.map((tache) => {
              const config = prioriteConfig[tache.priorite];
              const Icon = config.icon;
              const isOverdue = tache.echeance && new Date(tache.echeance) < new Date();

              return (
                <div
                  key={tache.id}
                  className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <button
                    onClick={() => handleComplete(tache.id)}
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      'hover:bg-primary hover:border-primary hover:text-primary-foreground'
                    )}
                    disabled={completeTache.isPending}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-4 w-4 shrink-0', config.color)} />
                      <span className="font-medium text-sm truncate">{tache.titre}</span>
                    </div>
                    {tache.echeance && (
                      <div
                        className={cn(
                          'flex items-center gap-1 text-xs mt-1',
                          isOverdue ? 'text-red-500' : 'text-muted-foreground'
                        )}
                      >
                        <Calendar className="h-3 w-3" />
                        {formatEcheance(tache.echeance)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TachesWidgetSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-20" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
