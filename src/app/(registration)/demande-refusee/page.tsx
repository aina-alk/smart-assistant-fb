'use client';

/**
 * Page de refus - Demande non retenue
 * Affiche le motif de refus si disponible
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/hooks/use-auth';
import { useUserDocument } from '@/lib/hooks/use-user-document';
import { XCircle, LogOut, Mail } from 'lucide-react';

export default function DemandeRefuseePage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { userDoc, exists, isLoading } = useUserDocument(user?.uid);

  // Rediriger si pas authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Rediriger si pas de document (vers inscription)
  useEffect(() => {
    if (!isLoading && user && !exists) {
      router.replace('/inscription');
    }
  }, [isLoading, user, exists, router]);

  // Rediriger si pas rejeté
  useEffect(() => {
    if (userDoc && userDoc.status !== 'rejected') {
      if (userDoc.status === 'approved') {
        router.replace('/dashboard');
      } else {
        router.replace('/en-attente');
      }
    }
  }, [userDoc, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Pas le bon status
  if (!userDoc || userDoc.status !== 'rejected') {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Demande non retenue</h1>
      </div>

      {/* Message */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Nous avons examiné votre demande d&apos;accès à Super Assistant Médical et ne sommes
            malheureusement pas en mesure d&apos;y donner une suite favorable.
          </p>

          {/* Motif de refus */}
          {userDoc.rejectionReason && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Motif :</p>
              <p className="text-sm text-muted-foreground">{userDoc.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recours */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur ou si votre situation évolue,
            n&apos;hésitez pas à nous contacter :
          </p>
          <a
            href="mailto:support@superassistant.fr"
            className="flex items-center gap-2 mt-3 text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            support@superassistant.fr
          </a>
        </CardContent>
      </Card>

      {/* Déconnexion */}
      <Button variant="outline" onClick={handleSignOut} className="w-full gap-2">
        <LogOut className="h-4 w-4" />
        Se déconnecter
      </Button>
    </div>
  );
}
