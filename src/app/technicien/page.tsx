/**
 * Technicien Dashboard Page - Placeholder
 */

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, FileText, Wrench, ClipboardList } from 'lucide-react';

const plannedFeatures = [
  {
    title: 'Examens',
    description: 'Gestion des examens et résultats',
    icon: FileText,
  },
  {
    title: 'Équipements',
    description: 'Maintenance et suivi du matériel',
    icon: Wrench,
  },
  {
    title: 'Tâches',
    description: 'Suivi des tâches techniques',
    icon: ClipboardList,
  },
];

export default function TechnicienDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Espace Technicien</h2>
        <p className="text-muted-foreground">Bienvenue dans votre espace de travail</p>
      </div>

      {/* En construction */}
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Construction className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">En construction</CardTitle>
          <CardDescription className="text-base">
            Cette section est en cours de développement et sera disponible prochainement.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Fonctionnalités prévues */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Fonctionnalités prévues</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {plannedFeatures.map((feature) => (
            <Card key={feature.title} className="opacity-60">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4 text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
