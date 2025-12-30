'use client';

/**
 * Sélecteur de rôle avec cards cliquables
 */

import { cn } from '@/lib/utils';
import { Stethoscope, ClipboardCheck, Wrench, Shield } from 'lucide-react';
import type { RegistrationRole } from '@/types/registration';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/types/registration';

interface RoleSelectorProps {
  value: RegistrationRole | null;
  onChange: (role: RegistrationRole) => void;
  error?: string;
}

const ROLE_ICONS: Record<RegistrationRole, React.ReactNode> = {
  medecin: <Stethoscope className="h-6 w-6" />,
  secretaire: <ClipboardCheck className="h-6 w-6" />,
  technicien: <Wrench className="h-6 w-6" />,
  admin: <Shield className="h-6 w-6" />,
};

const ROLES: RegistrationRole[] = ['medecin', 'secretaire', 'technicien', 'admin'];

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {ROLES.map((role) => {
          const isSelected = value === role;

          return (
            <button
              key={role}
              type="button"
              onClick={() => onChange(role)}
              className={cn(
                'flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all',
                'hover:border-primary/50 hover:bg-primary/5',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground/20 bg-background'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {ROLE_ICONS[role]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{ROLE_LABELS[role]}</span>
                  {isSelected && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      Sélectionné
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
