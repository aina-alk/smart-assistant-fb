'use client';

/**
 * Champs spécifiques pour les techniciens de santé
 * Spécialisation
 */

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TechnicienRegistrationData, TechnicianSpecialization } from '@/types/registration';
import { TECHNICIAN_SPECIALIZATIONS } from '@/types/registration';

interface TechnicienFieldsProps {
  data: TechnicienRegistrationData | null;
  errors: Record<string, string>;
  onUpdate: (data: Partial<TechnicienRegistrationData>) => void;
}

export function TechnicienFields({ data, errors, onUpdate }: TechnicienFieldsProps) {
  if (!data) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* Spécialisation */}
      <div className="space-y-2">
        <Label htmlFor="specialization">
          Spécialisation <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.specialization}
          onValueChange={(value) => onUpdate({ specialization: value as TechnicianSpecialization })}
        >
          <SelectTrigger
            id="specialization"
            className={errors['technicienData.specialization'] ? 'border-destructive' : ''}
          >
            <SelectValue placeholder="Sélectionnez votre spécialisation" />
          </SelectTrigger>
          <SelectContent>
            {TECHNICIAN_SPECIALIZATIONS.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors['technicienData.specialization'] && (
          <p className="text-sm text-destructive">{errors['technicienData.specialization']}</p>
        )}
      </div>
    </div>
  );
}
