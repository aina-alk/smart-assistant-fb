'use client';

/**
 * Champs spécifiques pour les secrétaires médicaux
 * Nom du médecin ou cabinet référent
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import type { SecretaireRegistrationData } from '@/types/registration';

interface SecretaireFieldsProps {
  data: SecretaireRegistrationData | null;
  errors: Record<string, string>;
  onUpdate: (data: Partial<SecretaireRegistrationData>) => void;
}

export function SecretaireFields({ data, errors, onUpdate }: SecretaireFieldsProps) {
  if (!data) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* Nom du médecin/cabinet référent */}
      <div className="space-y-2">
        <Label htmlFor="supervisorName">
          Nom du médecin ou cabinet référent <span className="text-destructive">*</span>
        </Label>
        <Input
          id="supervisorName"
          type="text"
          value={data.supervisorName}
          onChange={(e) => onUpdate({ supervisorName: e.target.value })}
          placeholder="Cabinet Dr Martin / Dr Sophie Martin"
          className={errors['secretaireData.supervisorName'] ? 'border-destructive' : ''}
        />
        {errors['secretaireData.supervisorName'] ? (
          <p className="text-sm text-destructive">{errors['secretaireData.supervisorName']}</p>
        ) : (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            Indiquez le médecin ou le cabinet pour lequel vous travaillez
          </p>
        )}
      </div>
    </div>
  );
}
