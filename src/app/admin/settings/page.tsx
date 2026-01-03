/**
 * Admin Settings Page - Placeholder
 * Page de paramètres admin (à venir)
 */

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, Shield, Database, Users } from 'lucide-react';

const settingSections = [
  {
    title: 'Notifications',
    description: 'Configurer les alertes et notifications email',
    icon: Bell,
  },
  {
    title: 'Sécurité',
    description: 'Paramètres de sécurité et audit',
    icon: Shield,
  },
  {
    title: 'Données',
    description: 'Gestion des données et sauvegardes',
    icon: Database,
  },
  {
    title: 'Utilisateurs',
    description: 'Gestion avancée des utilisateurs',
    icon: Users,
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">Configuration du système et préférences</p>
      </div>

      {/* Coming soon notice */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Bientôt disponible</CardTitle>
              <CardDescription>
                Les paramètres administrateur seront disponibles dans une prochaine version.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Preview of future sections */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-muted-foreground">Sections à venir</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {settingSections.map((section) => (
            <Card key={section.title} className="opacity-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <section.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
