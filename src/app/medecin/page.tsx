/**
 * Medecin Dashboard Page - Vue d'ensemble pour médecin
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TachesWidget } from '@/components/dashboard/taches-widget';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';

export default function MedecinDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bienvenue</h2>
        <p className="text-muted-foreground">Voici un aperçu de votre activité.</p>
      </div>

      {/* Stats grid */}
      <DashboardStats />

      {/* Main content grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Taches Widget */}
        <TachesWidget />

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières consultations et actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Aucune activité récente.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
