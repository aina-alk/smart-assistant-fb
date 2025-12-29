'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from 'sonner';
import { LogOut, Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">
                Super Assistant Médical
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Application web pour chirurgiens ORL - génération de CRC via dictée vocale et IA
              </CardDescription>
            </div>
            <Badge variant="secondary" className="h-fit">
              Beta
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {user && (
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{user.displayName || 'Utilisateur'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Déconnexion">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">Fonctionnalités à venir :</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Bientôt
                </Badge>
                Dictée vocale pour compte rendu de consultation
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Bientôt
                </Badge>
                Génération automatique de CRC via IA
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Bientôt
                </Badge>
                Intégration avec dossiers patients FHIR
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
