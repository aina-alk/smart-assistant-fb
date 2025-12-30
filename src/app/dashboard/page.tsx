/**
 * Dashboard Home Page - Vue d'ensemble pour médecin approuvé
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Stethoscope, ClipboardList, Calendar } from 'lucide-react';

const stats = [
  {
    title: 'Patients',
    value: '—',
    description: 'Total patients',
    icon: Users,
  },
  {
    title: 'Consultations',
    value: '—',
    description: 'Ce mois',
    icon: Stethoscope,
  },
  {
    title: 'Tâches',
    value: '—',
    description: 'En attente',
    icon: ClipboardList,
  },
  {
    title: "RDV Aujourd'hui",
    value: '—',
    description: 'Programmés',
    icon: Calendar,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bienvenue</h2>
        <p className="text-muted-foreground">Voici un aperçu de votre activité.</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Les raccourcis seront disponibles prochainement.
            </p>
          </CardContent>
        </Card>

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
