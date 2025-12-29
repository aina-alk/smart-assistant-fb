'use client';

/**
 * UserRequestCard - Carte résumée d'une demande d'inscription
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { User, Phone, Clock, ArrowRight } from 'lucide-react';
import type { UserData } from '@/hooks/useAuthorization';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserRequestCardProps {
  user: UserData;
  onClick: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  medecin: 'Médecin',
  secretaire: 'Secrétaire',
  technicien: 'Technicien',
};

const CALLBACK_SLOT_LABELS: Record<string, string> = {
  morning: 'Matin',
  afternoon: 'Après-midi',
  evening: 'Soir',
};

export function UserRequestCard({ user, onClick }: UserRequestCardProps) {
  const createdAt = user.createdAt?.toDate?.();
  const timeAgo = createdAt
    ? formatDistanceToNow(createdAt, { addSuffix: true, locale: fr })
    : null;

  const callbackSlots = user.callbackSlots
    ?.map((slot) => CALLBACK_SLOT_LABELS[slot] || slot)
    .join(', ');

  const professionalInfo = (() => {
    if (user.role === 'medecin' && user.medecinData) {
      const { specialty, rpps, sector } = user.medecinData;
      return [specialty, rpps ? `RPPS: ${rpps}` : null, sector ? `S${sector}` : null]
        .filter(Boolean)
        .join(' • ');
    }
    if (user.role === 'secretaire' && user.secretaireData) {
      return user.secretaireData.supervisorName || user.secretaireData.service || null;
    }
    if (user.role === 'technicien' && user.technicienData) {
      return user.technicienData.specialization || null;
    }
    return null;
  })();

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Nom et rôle */}
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <h3 className="font-medium text-gray-900 truncate">{user.displayName}</h3>
            </div>

            {/* Rôle et infos professionnelles */}
            <p className="text-sm text-gray-600 mb-2">
              {ROLE_LABELS[user.role] || user.role}
              {professionalInfo && <span className="text-gray-400"> • {professionalInfo}</span>}
            </p>

            {/* Téléphone et créneaux */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {user.phone}
                </span>
              )}
              {callbackSlots && (
                <span className="text-xs text-gray-400">Créneaux: {callbackSlots}</span>
              )}
            </div>

            {/* Date et status */}
            <div className="flex items-center gap-3 mt-3">
              {timeAgo && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
              )}
              <StatusBadge status={user.status} />
            </div>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
