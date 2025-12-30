'use client';

/**
 * Étape 2 : Profil professionnel
 * Sélection du rôle et champs spécifiques selon le rôle
 */

import { Building2 } from 'lucide-react';
import { RoleSelector } from './role-selector';
import { MedecinFields } from './medecin-fields';
import { SecretaireFields } from './secretaire-fields';
import { TechnicienFields } from './technicien-fields';
import { AdminFields } from './admin-fields';
import type {
  RegistrationRole,
  MedecinRegistrationData,
  SecretaireRegistrationData,
  TechnicienRegistrationData,
  AdminRegistrationData,
} from '@/types/registration';

interface StepProfileProps {
  role: RegistrationRole | null;
  medecinData: MedecinRegistrationData | null;
  secretaireData: SecretaireRegistrationData | null;
  technicienData: TechnicienRegistrationData | null;
  adminData: AdminRegistrationData | null;
  errors: Record<string, string>;
  onRoleChange: (role: RegistrationRole) => void;
  onMedecinUpdate: (data: Partial<MedecinRegistrationData>) => void;
  onSecretaireUpdate: (data: Partial<SecretaireRegistrationData>) => void;
  onTechnicienUpdate: (data: Partial<TechnicienRegistrationData>) => void;
  onAdminUpdate: (data: Partial<AdminRegistrationData>) => void;
}

export function StepProfile({
  role,
  medecinData,
  secretaireData,
  technicienData,
  adminData,
  errors,
  onRoleChange,
  onMedecinUpdate,
  onSecretaireUpdate,
  onTechnicienUpdate,
  onAdminUpdate,
}: StepProfileProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Votre profil professionnel</h2>
          <p className="text-sm text-muted-foreground">
            Sélectionnez votre rôle et complétez les informations
          </p>
        </div>
      </div>

      {/* Sélecteur de rôle */}
      <div className="space-y-2">
        <span className="text-sm font-medium">
          Vous êtes : <span className="text-destructive">*</span>
        </span>
        <RoleSelector value={role} onChange={onRoleChange} error={errors.role} />
      </div>

      {/* Champs spécifiques au rôle */}
      {role === 'medecin' && (
        <MedecinFields data={medecinData} errors={errors} onUpdate={onMedecinUpdate} />
      )}

      {role === 'secretaire' && (
        <SecretaireFields data={secretaireData} errors={errors} onUpdate={onSecretaireUpdate} />
      )}

      {role === 'technicien' && (
        <TechnicienFields data={technicienData} errors={errors} onUpdate={onTechnicienUpdate} />
      )}

      {role === 'admin' && (
        <AdminFields data={adminData} errors={errors} onUpdate={onAdminUpdate} />
      )}
    </div>
  );
}
