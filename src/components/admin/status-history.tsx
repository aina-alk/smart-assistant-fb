/**
 * StatusHistory - Timeline de l'historique des changements de status
 */

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StatusBadge } from './status-badge';
import type { UserStatus } from '@/types/user';

interface StatusHistoryEntry {
  status: UserStatus;
  changedAt: { toDate: () => Date } | Date;
  changedBy: string;
  note?: string | null;
}

interface StatusHistoryProps {
  history: StatusHistoryEntry[];
}

export function StatusHistory({ history }: StatusHistoryProps) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-gray-500 italic">Aucun historique disponible</p>;
  }

  // Trier par date décroissante
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = 'toDate' in a.changedAt ? a.changedAt.toDate() : a.changedAt;
    const dateB = 'toDate' in b.changedAt ? b.changedAt.toDate() : b.changedAt;
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-3">
      {sortedHistory.map((entry, index) => {
        const date = 'toDate' in entry.changedAt ? entry.changedAt.toDate() : entry.changedAt;

        return (
          <div key={index} className="flex items-start gap-3 pl-4 border-l-2 border-gray-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">
                  {format(date, 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </span>
                <span className="text-xs text-gray-400">
                  — {entry.changedBy === 'system' ? 'Système' : entry.changedBy}
                </span>
              </div>
              <StatusBadge status={entry.status} className="mb-1" />
              {entry.note && (
                <p className="text-sm text-gray-600 mt-1 italic">&quot;{entry.note}&quot;</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
