'use client';

/**
 * StatusSelect - Dropdown pour changer le status intermédiaire
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserStatus } from '@/types/user';

interface StatusSelectProps {
  currentStatus: UserStatus;
  onChange: (status: UserStatus) => void;
  disabled?: boolean;
}

const INTERMEDIATE_STATUSES: { value: UserStatus; label: string }[] = [
  { value: 'pending_call', label: 'À rappeler' },
  { value: 'in_review', label: "En cours d'examen" },
  { value: 'pending_callback', label: 'Rappel prévu' },
  { value: 'pending_info', label: 'Infos manquantes' },
];

export function StatusSelect({ currentStatus, onChange, disabled }: StatusSelectProps) {
  // Ne pas permettre de changer si déjà approuvé/rejeté
  if (['approved', 'rejected', 'suspended'].includes(currentStatus)) {
    return null;
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={onChange as (value: string) => void}
      disabled={disabled}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Changer le status" />
      </SelectTrigger>
      <SelectContent>
        {INTERMEDIATE_STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
