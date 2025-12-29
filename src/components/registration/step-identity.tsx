'use client';

/**
 * Étape 1 : Identité
 * Collecte nom, email (readonly), téléphone
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardList, Info } from 'lucide-react';
import type { RegistrationFormData } from '@/types/registration';

interface StepIdentityProps {
  data: Pick<RegistrationFormData, 'displayName' | 'email' | 'phone'>;
  errors: Record<string, string>;
  onUpdate: <K extends keyof RegistrationFormData>(
    field: K,
    value: RegistrationFormData[K]
  ) => void;
}

export function StepIdentity({ data, errors, onUpdate }: StepIdentityProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Vos informations personnelles</h2>
          <p className="text-sm text-muted-foreground">
            Ces informations nous permettront de vous identifier
          </p>
        </div>
      </div>

      {/* Champs */}
      <div className="space-y-4">
        {/* Nom complet */}
        <div className="space-y-2">
          <Label htmlFor="displayName">
            Nom complet <span className="text-destructive">*</span>
          </Label>
          <Input
            id="displayName"
            type="text"
            value={data.displayName}
            onChange={(e) => onUpdate('displayName', e.target.value)}
            placeholder="Dr Sophie Martin"
            className={errors.displayName ? 'border-destructive' : ''}
          />
          {errors.displayName && <p className="text-sm text-destructive">{errors.displayName}</p>}
        </div>

        {/* Email (readonly) */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            readOnly
            disabled
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            Email lié à votre compte Google
          </p>
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Téléphone professionnel <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onUpdate('phone', e.target.value)}
            placeholder="06 12 34 56 78"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone ? (
            <p className="text-sm text-destructive">{errors.phone}</p>
          ) : (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Numéro sur lequel nous vous contacterons
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
