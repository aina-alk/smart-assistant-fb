'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TacheList } from '@/components/taches/tache-list';
import { TacheFilters } from '@/components/taches/tache-filters';
import { TacheQuickAdd } from '@/components/taches/tache-quick-add';
import { TacheDialog } from '@/components/taches/tache-dialog';
import { useTaches } from '@/lib/hooks/use-taches';
import { useCreateTache } from '@/lib/hooks/use-create-tache';
import { useUpdateTache } from '@/lib/hooks/use-update-tache';
import { useCompleteTache } from '@/lib/hooks/use-complete-tache';
import { useDeleteTache } from '@/lib/hooks/use-delete-tache';
import type { Tache, TacheStatut, TachePriorite, TacheCategorie } from '@/types/tache';
import type { TacheFormData } from '@/lib/validations/tache';

export default function TasksPage() {
  const [statutFilter, setStatutFilter] = useState<TacheStatut>();
  const [prioriteFilter, setPrioriteFilter] = useState<TachePriorite>();
  const [categorieFilter, setCategorieFilter] = useState<TacheCategorie>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTache, setEditingTache] = useState<Tache>();

  const { data, isLoading } = useTaches({
    statut: statutFilter,
    priorite: prioriteFilter,
    categorie: categorieFilter,
  });

  const createTache = useCreateTache();
  const updateTache = useUpdateTache();
  const completeTache = useCompleteTache();
  const deleteTache = useDeleteTache();

  const taches = data?.taches || [];

  // Statistiques rapides
  const stats = {
    aFaire: taches.filter((t) => t.statut === 'a_faire').length,
    enCours: taches.filter((t) => t.statut === 'en_cours').length,
    terminees: taches.filter((t) => t.statut === 'terminee').length,
  };

  const handleQuickAdd = async (titre: string) => {
    await createTache.mutateAsync({
      titre,
      priorite: 'normale',
      statut: 'a_faire',
      categorie: 'autre',
    });
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
        data,
      });
    } else {
      await createTache.mutateAsync(data);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tâches</h2>
          <p className="text-muted-foreground">Gérez vos tâches et rappels</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À faire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.aFaire}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.enCours}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.terminees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add */}
      <TacheQuickAdd onAdd={handleQuickAdd} isLoading={createTache.isPending} />

      {/* Filters */}
      <TacheFilters
        statut={statutFilter}
        priorite={prioriteFilter}
        categorie={categorieFilter}
        onStatutChange={setStatutFilter}
        onPrioriteChange={setPrioriteFilter}
        onCategorieChange={setCategorieFilter}
      />

      {/* List */}
      <TacheList
        taches={taches}
        isLoading={isLoading}
        onComplete={handleComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Dialog */}
      <TacheDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tache={editingTache}
        onSubmit={handleSubmit}
        isSubmitting={createTache.isPending || updateTache.isPending}
      />
    </div>
  );
}
