'use client';

/**
 * Page d'inscription - Formulaire multi-étapes
 * Accessible uniquement si l'utilisateur est authentifié mais n'a pas de document
 */

import { RegistrationGuard } from '@/components/registration/registration-guard';
import { RegistrationForm } from '@/components/registration/registration-form';

export default function InscriptionPage() {
  return (
    <RegistrationGuard requireNoDocument>
      <div className="space-y-6">
        {/* Titre */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Demande d&apos;accès</h1>
          <p className="mt-2 text-muted-foreground">
            Complétez ce formulaire pour demander l&apos;accès à Super Assistant Médical
          </p>
        </div>

        {/* Formulaire */}
        <RegistrationForm />
      </div>
    </RegistrationGuard>
  );
}
