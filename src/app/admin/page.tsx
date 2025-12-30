/**
 * Admin Dashboard Page - Vue d'ensemble administration
 */

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserCheck,
  BarChart3,
  Database,
  Settings,
  Users,
  Activity,
  ArrowRight,
} from 'lucide-react';

const stats = [
  {
    title: 'Demandes en attente',
    value: '—',
    description: 'À traiter',
    icon: UserCheck,
  },
  {
    title: 'Utilisateurs',
    value: '—',
    description: 'Total approuvés',
    icon: Users,
  },
  {
    title: 'Activité',
    value: '—',
    description: 'Cette semaine',
    icon: Activity,
  },
];

const sections = [
  {
    title: "Demandes d'accès",
    description: "Gérer les demandes d'inscription des praticiens",
    href: '/admin/demandes',
    icon: UserCheck,
    available: true,
  },
  {
    title: 'Analytiques',
    description: "Statistiques et rapports d'utilisation",
    href: '/admin/analytiques',
    icon: BarChart3,
    available: false,
  },
  {
    title: 'Ressources',
    description: 'Gestion des ressources et données',
    href: '/admin/ressources',
    icon: Database,
    available: false,
  },
  {
    title: 'Paramètres',
    description: 'Configuration du système',
    href: '/admin/settings',
    icon: Settings,
    available: false,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Administration</h2>
        <p className="text-muted-foreground">
          Gérez les utilisateurs et la configuration du système
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Section links */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Sections</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title} className={!section.available ? 'opacity-60' : undefined}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {section.available ? (
                  <Button asChild className="w-full">
                    <Link href={section.href}>
                      Accéder
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Bientôt disponible
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
