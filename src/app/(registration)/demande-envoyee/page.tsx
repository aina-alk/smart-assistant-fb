'use client';

/**
 * Page de confirmation - Demande envoyée
 * Affichée juste après la soumission du formulaire
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import { useUserDocument } from '@/lib/hooks/use-user-document';
import { CheckCircle, Phone, Mail, LogOut } from 'lucide-react';
import { CALLBACK_SLOTS } from '@/types/registration';
import { formatPhone } from '@/lib/validations/registration';

export default function DemandeEnvoyeePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { userDoc, isLoading } = useUserDocument(user?.uid);
  const [justSubmitted, setJustSubmitted] = useState(true);

  // Si l'utilisateur revient sur cette page plus tard, rediriger vers en-attente
  useEffect(() => {
    const timer = setTimeout(() => {
      setJustSubmitted(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !justSubmitted && userDoc) {
      router.replace('/en-attente');
    }
  }, [isLoading, justSubmitted, userDoc, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Récupérer les labels des créneaux sélectionnés
  const selectedSlotsLabels = userDoc?.callbackSlots
    ?.map((slot) => {
      const found = CALLBACK_SLOTS.find((s) => s.value === slot);
      return found?.label || slot;
    })
    .join(', ');

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Icône de succès */}
      <div className="text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Demande envoyée avec succès !</h1>
        <p className="mt-2 text-muted-foreground">
          Merci pour votre demande d&apos;accès à Super Assistant Médical.
        </p>
      </div>

      {/* Prochaine étape */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Prochaine étape</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Un membre de notre équipe vous contactera sous 48 heures ouvrées au :
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-lg font-semibold">
              {userDoc?.phone ? formatPhone(userDoc.phone) : '...'}
            </p>
            {selectedSlotsLabels && (
              <p className="text-sm text-muted-foreground mt-1">
                Créneaux sélectionnés : {selectedSlotsLabels}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email de confirmation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Un email de confirmation a été envoyé à :
              </p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
