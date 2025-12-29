'use client';

/**
 * Champs spécifiques pour les médecins
 * RPPS, spécialité, secteur conventionnel, ADELI (optionnel)
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info } from 'lucide-react';
import type { MedecinRegistrationData, MedicalSpecialty } from '@/types/registration';
import { MEDICAL_SPECIALTIES, SECTOR_LABELS } from '@/types/registration';

interface MedecinFieldsProps {
  data: MedecinRegistrationData | null;
  errors: Record<string, string>;
  onUpdate: (data: Partial<MedecinRegistrationData>) => void;
}

export function MedecinFields({ data, errors, onUpdate }: MedecinFieldsProps) {
  if (!data) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* RPPS */}
      <div className="space-y-2">
        <Label htmlFor="rpps">
          Numéro RPPS <span className="text-destructive">*</span>
        </Label>
        <Input
          id="rpps"
          type="text"
          inputMode="numeric"
          value={data.rpps}
          onChange={(e) => onUpdate({ rpps: e.target.value.replace(/\D/g, '').slice(0, 11) })}
          placeholder="10001234567"
          maxLength={11}
          className={errors['medecinData.rpps'] ? 'border-destructive' : ''}
        />
        {errors['medecinData.rpps'] ? (
          <p className="text-sm text-destructive">{errors['medecinData.rpps']}</p>
        ) : (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            11 chiffres, vérifiable sur annuaire.sante.fr
          </p>
        )}
      </div>

      {/* Spécialité */}
      <div className="space-y-2">
        <Label htmlFor="specialty">
          Spécialité <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.specialty}
          onValueChange={(value) => onUpdate({ specialty: value as MedicalSpecialty })}
        >
          <SelectTrigger
            id="specialty"
            className={errors['medecinData.specialty'] ? 'border-destructive' : ''}
          >
            <SelectValue placeholder="Sélectionnez votre spécialité" />
          </SelectTrigger>
          <SelectContent>
            {MEDICAL_SPECIALTIES.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors['medecinData.specialty'] && (
          <p className="text-sm text-destructive">{errors['medecinData.specialty']}</p>
        )}
      </div>

      {/* Secteur conventionnel */}
      <div className="space-y-2">
        <Label>
          Secteur conventionnel <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={data.sector?.toString()}
          onValueChange={(value) => onUpdate({ sector: parseInt(value) as 1 | 2 })}
          className="flex gap-4"
        >
          {([1, 2] as const).map((sector) => (
            <div key={sector} className="flex items-center space-x-2">
              <RadioGroupItem value={sector.toString()} id={`sector-${sector}`} />
              <Label htmlFor={`sector-${sector}`} className="cursor-pointer font-normal">
                {SECTOR_LABELS[sector]}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors['medecinData.sector'] && (
          <p className="text-sm text-destructive">{errors['medecinData.sector']}</p>
        )}
      </div>

      {/* ADELI (optionnel) */}
      <div className="space-y-2">
        <Label htmlFor="adeli">Numéro ADELI (optionnel)</Label>
        <Input
          id="adeli"
          type="text"
          inputMode="numeric"
          value={data.adeli || ''}
          onChange={(e) => onUpdate({ adeli: e.target.value.replace(/\D/g, '').slice(0, 9) })}
          placeholder="123456789"
          maxLength={9}
          className={errors['medecinData.adeli'] ? 'border-destructive' : ''}
        />
        {errors['medecinData.adeli'] && (
          <p className="text-sm text-destructive">{errors['medecinData.adeli']}</p>
        )}
      </div>
    </div>
  );
}
