/**
 * Tasks Page - Gestion des tâches (placeholder)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const taskCategories = [
  {
    title: 'À faire',
    count: 0,
    icon: Clock,
    color: 'text-yellow-500',
  },
  {
    title: 'En cours',
    count: 0,
    icon: AlertCircle,
    color: 'text-blue-500',
  },
  {
    title: 'Terminées',
    count: 0,
    icon: CheckCircle2,
    color: 'text-green-500',
  },
];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tâches</h2>
          <p className="text-muted-foreground">Gérez vos tâches et rappels</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Task categories */}
      <div className="grid gap-4 md:grid-cols-3">
        {taskCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{category.title}</CardTitle>
              <category.icon className={`h-4 w-4 ${category.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{category.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Aucune tâche</CardTitle>
          <CardDescription>
            Le système de tâches sera disponible après intégration avec BigQuery.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Cette fonctionnalité sera implémentée dans un prochain bloc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
