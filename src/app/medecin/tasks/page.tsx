'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TacheList } from '@/components/taches/tache-list';
import { TacheFilters } from '@/components/taches/tache-filters';
import { TacheDialog } from '@/components/taches/tache-dialog';
import { useTaches } from '@/lib/hooks/use-taches';
import { usePatients } from '@/lib/hooks/use-patients';
import { useCreateTache } from '@/lib/hooks/use-create-tache';
import { useUpdateTache } from '@/lib/hooks/use-update-tache';
import { useCompleteTache } from '@/lib/hooks/use-complete-tache';
import { useDeleteTache } from '@/lib/hooks/use-delete-tache';
import { getPatientFullName } from '@/types/patient';
import type { Tache, TacheStatut, TachePriorite, TacheCategorie } from '@/types/tache';
import type { TacheFormData } from '@/lib/validations/tache';

export default function TasksPage() {
  const router = useRouter();
  const [statutFilter, setStatutFilter] = useState<TacheStatut>();
  const [prioriteFilter, setPrioriteFilter] = useState<TachePriorite>();
  const [categorieFilter, setCategorieFilter] = useState<TacheCategorie>();
  const [patientFilter, setPatientFilter] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTache, setEditingTache] = useState<Tache>();

  const { data, isLoading } = useTaches({
    statut: statutFilter,
    priorite: prioriteFilter,
    categorie: categorieFilter,
    patientId: patientFilter,
  });

  const { data: patientsData } = usePatients({ limit: 100 });

  const createTache = useCreateTache();
  const updateTache = useUpdateTache();
  const completeTache = useCompleteTache();
  const deleteTache = useDeleteTache();

  const taches = data?.taches || [];

  // Map patient ID -> nom complet pour affichage
  const patientsMap = useMemo(() => {
    const map = new Map<string, string>();
    patientsData?.patients.forEach((p) => {
      map.set(p.id, getPatientFullName(p));
    });
    return map;
  }, [patientsData?.patients]);

  // Liste des patients pour le filtre
  const patientOptions = useMemo(() => {
    return (
      patientsData?.patients.map((p) => ({
        id: p.id,
        name: getPatientFullName(p),
      })) || []
    );
  }, [patientsData?.patients]);

  // Statistiques rapides
  const stats = {
    aFaire: taches.filter((t) => t.statut === 'a_faire').length,
    enCours: taches.filter((t) => t.statut === 'en_cours').length,
    terminees: taches.filter((t) => t.statut === 'terminee').length,
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

      {/* Filters */}
      <TacheFilters
        statut={statutFilter}
        priorite={prioriteFilter}
        categorie={categorieFilter}
        patientId={patientFilter}
        patients={patientOptions}
        onStatutChange={setStatutFilter}
        onPrioriteChange={setPrioriteFilter}
        onCategorieChange={setCategorieFilter}
        onPatientChange={setPatientFilter}
      />

      {/* List */}
      <TacheList
        taches={taches}
        patientsMap={patientsMap}
        isLoading={isLoading}
        onComplete={handleComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPatientClick={(patientId) => router.push(`/medecin/patients/${patientId}`)}
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
