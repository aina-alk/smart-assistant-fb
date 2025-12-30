/**
 * Settings Page - Paramètres utilisateur (placeholder)
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthorization } from '@/hooks/useAuthorization';
import { User, Shield, Bell, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { userData } = useAuthorization();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">Gérez vos préférences et votre profil</p>
      </div>

      {/* Profile section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Profil</CardTitle>
          </div>
          <CardDescription>Informations de votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom</p>
              <p className="text-sm">{userData?.displayName || user?.displayName || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Spécialité</p>
              <p className="text-sm">{userData?.medecinData?.specialty || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <p className="text-sm">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  Approuvé
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Sécurité</CardTitle>
          </div>
          <CardDescription>Paramètres de sécurité de votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            Gérer l&apos;authentification
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">Connecté via Google OAuth</p>
        </CardContent>
      </Card>

      {/* Notifications section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Gérez vos préférences de notification</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les paramètres de notification seront disponibles prochainement.
          </p>
        </CardContent>
      </Card>

      {/* Appearance section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Apparence</CardTitle>
          </div>
          <CardDescription>Personnalisez l&apos;interface</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les options d&apos;apparence seront disponibles prochainement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
