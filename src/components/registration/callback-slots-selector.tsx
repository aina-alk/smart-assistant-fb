'use client';

/**
 * Sélecteur de créneaux de rappel
 * Permet de sélectionner un ou plusieurs créneaux
 */

import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import type { CallbackSlot } from '@/types/registration';
import { CALLBACK_SLOTS } from '@/types/registration';

interface CallbackSlotsSelectorProps {
  value: CallbackSlot[];
  onChange: (slot: CallbackSlot) => void;
  error?: string;
}

export function CallbackSlotsSelector({ value, onChange, error }: CallbackSlotsSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {CALLBACK_SLOTS.map((slot) => {
          const isSelected = value.includes(slot.value);

          return (
            <label
              key={slot.value}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all',
                'hover:border-primary/50 hover:bg-primary/5',
                isSelected ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onChange(slot.value)}
                className="data-[state=checked]:bg-primary"
              />
              <span className={cn('text-sm', isSelected && 'font-medium')}>{slot.label}</span>
            </label>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
