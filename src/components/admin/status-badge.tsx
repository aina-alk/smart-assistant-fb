/**
 * StatusBadge - Badge coloré selon le status utilisateur
 */

import { cn } from '@/lib/utils';
import type { UserStatus } from '@/types/user';

interface StatusBadgeProps {
  status: UserStatus;
  className?: string;
}

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; icon: string }> = {
  pending_call: {
    label: 'À rappeler',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: '🔴',
  },
  in_review: {
    label: 'En cours',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: '🟡',
  },
  pending_callback: {
    label: 'Rappel prévu',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: '🟠',
  },
  pending_info: {
    label: 'Infos manquantes',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '🟣',
  },
  approved: {
    label: 'Approuvé',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: '🟢',
  },
  rejected: {
    label: 'Rejeté',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: '⚫',
  },
  suspended: {
    label: 'Suspendu',
    color: 'bg-gray-100 text-gray-500 border-gray-200',
    icon: '⏸️',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_call;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.color,
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

export function getStatusLabel(status: UserStatus): string {
  return STATUS_CONFIG[status]?.label || status;
}
