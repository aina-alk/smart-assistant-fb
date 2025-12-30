'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';
import type { AdminRegistrationData } from '@/types/registration';

interface AdminFieldsProps {
  data: AdminRegistrationData | null;
  errors: Record<string, string>;
  onUpdate: (data: Partial<AdminRegistrationData>) => void;
}

export function AdminFields({ data, errors, onUpdate }: AdminFieldsProps) {
  if (!data) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* Nom de l'organisation */}
      <div className="space-y-2">
        <Label htmlFor="organizationName">
          Nom de l&apos;organisation <span className="text-destructive">*</span>
        </Label>
        <Input
          id="organizationName"
          type="text"
          value={data.organizationName}
          onChange={(e) => onUpdate({ organizationName: e.target.value })}
          placeholder="Cabinet Médical du Centre, Clinique XYZ..."
          className={errors['adminData.organizationName'] ? 'border-destructive' : ''}
        />
        {errors['adminData.organizationName'] ? (
          <p className="text-sm text-destructive">{errors['adminData.organizationName']}</p>
        ) : (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            Cabinet, clinique ou structure médicale
          </p>
        )}
      </div>

      {/* Fonction/Poste */}
      <div className="space-y-2">
        <Label htmlFor="position">
          Votre fonction <span className="text-destructive">*</span>
        </Label>
        <Input
          id="position"
          type="text"
          value={data.position}
          onChange={(e) => onUpdate({ position: e.target.value })}
          placeholder="Directeur, Responsable administratif, Gestionnaire..."
          className={errors['adminData.position'] ? 'border-destructive' : ''}
        />
        {errors['adminData.position'] && (
          <p className="text-sm text-destructive">{errors['adminData.position']}</p>
        )}
      </div>

      {/* Motif de la demande */}
      <div className="space-y-2">
        <Label htmlFor="requestReason">
          Motif de votre demande <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="requestReason"
          value={data.requestReason}
          onChange={(e) => onUpdate({ requestReason: e.target.value })}
          placeholder="Expliquez pourquoi vous souhaitez devenir administrateur de cette structure..."
          rows={4}
          className={errors['adminData.requestReason'] ? 'border-destructive' : ''}
        />
        {errors['adminData.requestReason'] ? (
          <p className="text-sm text-destructive">{errors['adminData.requestReason']}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {data.requestReason.length}/500 caractères (minimum 10)
          </p>
        )}
      </div>
    </div>
  );
}
