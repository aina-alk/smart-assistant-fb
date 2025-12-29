'use client';

/**
 * Page d'attente - Demande en cours de traitement
 * Écoute les changements de status en temps réel
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/hooks/use-auth';
import { useUserDocument } from '@/lib/hooks/use-user-document';
import { WaitingStatus } from '@/components/registration/waiting-status';
import { Clock, LogOut, ArrowRight, Mail, Phone, User, Calendar } from 'lucide-react';
import { ROLE_LABELS } from '@/types/registration';
import { formatPhone } from '@/lib/validations/registration';

export default function EnAttentePage() {
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

  // Rediriger si approuvé
  useEffect(() => {
    if (userDoc?.status === 'approved') {
      // Petit délai pour montrer le status avant de rediriger
      const timer = setTimeout(() => {
        router.replace('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [userDoc?.status, router]);

  // Rediriger si rejeté
  useEffect(() => {
    if (userDoc?.status === 'rejected') {
      router.replace('/demande-refusee');
    }
  }, [userDoc?.status, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Pas de document
  if (!userDoc) {
    return null;
  }

  const isApproved = userDoc.status === 'approved';
  const createdAt = userDoc.createdAt?.toDate?.() || new Date();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-10 w-10 text-amber-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Votre demande est en cours</h1>
        <p className="mt-2 text-muted-foreground">Bonjour {userDoc.displayName},</p>
      </div>

      {/* Status actuel */}
      <WaitingStatus status={userDoc.status} />

      {/* Bouton accès dashboard si approuvé */}
      {isApproved && (
        <Button onClick={handleGoToDashboard} className="w-full gap-2">
          Accéder au dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}

      {/* Récapitulatif */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-semibold mb-4">Récapitulatif de votre demande</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Profil :</span>
              <span className="font-medium">
                {ROLE_LABELS[userDoc.role as keyof typeof ROLE_LABELS] || userDoc.role}
                {userDoc.medecinData?.specialty && ` - ${userDoc.medecinData.specialty}`}
              </span>
            </div>

            {userDoc.medecinData?.rpps && (
              <div className="flex items-center gap-3 text-sm">
                <span className="w-4" />
                <span className="text-muted-foreground">N° RPPS :</span>
                <span className="font-medium">{userDoc.medecinData.rpps}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Téléphone :</span>
              <span className="font-medium">{formatPhone(userDoc.phone)}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email :</span>
              <span className="font-medium">{userDoc.email}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Soumise le :</span>
              <span className="font-medium">
                {createdAt.toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}{' '}
                à{' '}
                {createdAt.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact support */}
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Une question ? Contactez-nous :</p>
          <a
            href="mailto:support@superassistant.fr"
            className="text-primary hover:underline text-sm font-medium"
          >
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
