'use client';

import { useState } from 'react';
import { Plus, CheckSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { TacheCard } from '@/components/taches/tache-card';
import { TacheDialog } from '@/components/taches/tache-dialog';
import { useTaches } from '@/lib/hooks/use-taches';
import { useCreateTache } from '@/lib/hooks/use-create-tache';
import { useUpdateTache } from '@/lib/hooks/use-update-tache';
import { useCompleteTache } from '@/lib/hooks/use-complete-tache';
import { useDeleteTache } from '@/lib/hooks/use-delete-tache';
import type { Patient } from '@/types/patient';
import type { Tache } from '@/types/tache';
import type { TacheFormData } from '@/lib/validations/tache';

interface PatientTasksProps {
  patient: Patient;
}

function TasksSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PatientTasks({ patient }: PatientTasksProps) {
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTache, setEditingTache] = useState<Tache>();

  const { data, isLoading, isError } = useTaches({ patientId: patient.id });
  const createTache = useCreateTache();
  const updateTache = useUpdateTache();
  const completeTache = useCompleteTache();
  const deleteTache = useDeleteTache();

  const taches = data?.taches || [];
  const activeTaches = taches.filter((t) => t.statut !== 'terminee' && t.statut !== 'annulee');
  const completedTaches = taches.filter((t) => t.statut === 'terminee' || t.statut === 'annulee');

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim() || createTache.isPending) return;

    await createTache.mutateAsync({
      titre: quickAddTitle.trim(),
      priorite: 'normale',
      statut: 'a_faire',
      categorie: 'suivi',
      patientId: patient.id,
    });
    setQuickAddTitle('');
  };

  const handleCreate = () => {
    setEditingTache(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (tache: Tache) => {
    setEditingTache(tache);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: TacheFormData) => {
    if (editingTache) {
      await updateTache.mutateAsync({
        id: editingTache.id,
        data: { ...data, patientId: patient.id },
      });
    } else {
      await createTache.mutateAsync({
        ...data,
        patientId: patient.id,
      });
    }
    setDialogOpen(false);
    setEditingTache(undefined);
  };

  const handleComplete = async (id: string) => {
    await completeTache.mutateAsync(id);
  };

  const handleDelete = async (id: string) => {
    await deleteTache.mutateAsync(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tâches du patient</h3>
        <Button onClick={handleCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <div className="relative flex-1">
          <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            placeholder="Ajouter une tâche rapidement..."
            className="pl-9"
            disabled={createTache.isPending}
          />
        </div>
        <Button
          type="submit"
          disabled={!quickAddTitle.trim() || createTache.isPending}
          size="default"
        >
          {createTache.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ajouter'}
        </Button>
      </form>

      {isLoading && <TasksSkeleton />}

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">Erreur lors du chargement des tâches</p>
        </div>
      )}

      {!isLoading && !isError && taches.length > 0 && (
        <div className="space-y-4">
          {activeTaches.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                À faire ({activeTaches.length})
              </p>
              <div className="space-y-2">
                {activeTaches.map((tache) => (
                  <TacheCard
                    key={tache.id}
                    tache={tache}
                    onComplete={handleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTaches.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Terminées ({completedTaches.length})
              </p>
              <div className="space-y-2">
                {completedTaches.map((tache) => (
                  <TacheCard
                    key={tache.id}
                    tache={tache}
                    onComplete={handleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && !isError && taches.length === 0 && (
        <div className="rounded-lg border border-dashed">
          <EmptyState
            icon={CheckSquare}
            title="Aucune tâche"
            description="Ce patient n'a pas encore de tâche associée."
            action={{
              label: '+ Créer une tâche',
              onClick: handleCreate,
            }}
          />
        </div>
      )}

      <TacheDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tache={editingTache}
        defaultPatientId={patient.id}
        patientLocked
        onSubmit={handleSubmit}
        isSubmitting={createTache.isPending || updateTache.isPending}
      />
    </div>
  );
}
