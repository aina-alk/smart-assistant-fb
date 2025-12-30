/**
 * Patients Page - Liste des patients (placeholder)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patients</h2>
          <p className="text-muted-foreground">Gérez votre liste de patients</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau patient
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher un patient..." className="pl-10" disabled />
      </div>

      {/* Empty state */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Aucun patient</CardTitle>
          <CardDescription>
            La liste des patients sera disponible après intégration avec Google Healthcare API
            (FHIR).
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
