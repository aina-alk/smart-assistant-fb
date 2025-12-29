'use client';

/**
 * Étape 3 : Disponibilités & Consentement
 * Créneaux de rappel, commentaire optionnel, checkboxes d'acceptation
 */

import { Calendar, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CallbackSlotsSelector } from './callback-slots-selector';
import type { CallbackSlot, RegistrationFormData } from '@/types/registration';

interface StepAvailabilityProps {
  callbackSlots: CallbackSlot[];
  callbackNote: string;
  acceptContact: boolean;
  acceptTerms: boolean;
  errors: Record<string, string>;
  onToggleSlot: (slot: CallbackSlot) => void;
  onUpdate: <K extends keyof RegistrationFormData>(
    field: K,
    value: RegistrationFormData[K]
  ) => void;
}

export function StepAvailability({
  callbackSlots,
  callbackNote,
  acceptContact,
  acceptTerms,
  errors,
  onToggleSlot,
  onUpdate,
}: StepAvailabilityProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Vos disponibilités pour être rappelé(e)</h2>
          <p className="text-sm text-muted-foreground">
            Nous vous contacterons pour un bref entretien téléphonique
          </p>
        </div>
      </div>

      {/* Créneaux */}
      <div className="space-y-2">
        <Label>
          Sélectionnez vos créneaux préférés : <span className="text-destructive">*</span>
        </Label>
        <CallbackSlotsSelector
          value={callbackSlots}
          onChange={onToggleSlot}
          error={errors.callbackSlots}
        />
        {!errors.callbackSlots && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            Sélectionnez au moins un créneau
          </p>
        )}
      </div>

      {/* Commentaire */}
      <div className="space-y-2">
        <Label htmlFor="callbackNote">Commentaire (optionnel)</Label>
        <Textarea
          id="callbackNote"
          value={callbackNote}
          onChange={(e) => onUpdate('callbackNote', e.target.value)}
          placeholder="Décrivez brièvement votre activité ou vos attentes..."
          maxLength={250}
          rows={3}
          className={errors.callbackNote ? 'border-destructive' : ''}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{errors.callbackNote || ''}</span>
          <span>{callbackNote.length}/250</span>
        </div>
      </div>

      {/* Consentements */}
      <div className="space-y-4 pt-4 border-t">
        {/* Acceptation contact */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptContact"
            checked={acceptContact}
            onCheckedChange={(checked) => onUpdate('acceptContact', checked === true)}
            className={errors.acceptContact ? 'border-destructive' : ''}
          />
          <div className="space-y-1">
            <Label htmlFor="acceptContact" className="cursor-pointer leading-relaxed">
              J&apos;accepte d&apos;être contacté(e) par téléphone pour un entretien de
              présentation. <span className="text-destructive">*</span>
            </Label>
            {errors.acceptContact && (
              <p className="text-sm text-destructive">{errors.acceptContact}</p>
            )}
          </div>
        </div>

        {/* Acceptation CGU */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptTerms"
            checked={acceptTerms}
            onCheckedChange={(checked) => onUpdate('acceptTerms', checked === true)}
            className={errors.acceptTerms ? 'border-destructive' : ''}
          />
          <div className="space-y-1">
            <Label htmlFor="acceptTerms" className="cursor-pointer leading-relaxed">
              J&apos;ai lu et j&apos;accepte les{' '}
              <a href="/cgu" target="_blank" className="text-primary underline hover:no-underline">
                conditions générales d&apos;utilisation
              </a>{' '}
              et la{' '}
              <a
                href="/confidentialite"
                target="_blank"
                className="text-primary underline hover:no-underline"
              >
                politique de confidentialité
              </a>
              . <span className="text-destructive">*</span>
            </Label>
            {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
