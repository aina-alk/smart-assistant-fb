'use client';

/**
 * UserDetailView - Vue détaillée d'un utilisateur avec actions
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from './status-badge';
import { StatusSelect } from './status-select';
import { StatusHistory } from './status-history';
import { RejectModal } from './reject-modal';
import { useAdminActions } from '@/hooks/useAuthorization';
import type { UserData } from '@/hooks/useAuthorization';
import type { UserStatus } from '@/types/user';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface UserDetailViewProps {
  user: UserData;
  onSuccess?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  medecin: 'Médecin',
  secretaire: 'Secrétaire',
  technicien: 'Technicien',
};

const CALLBACK_SLOT_LABELS: Record<string, string> = {
  morning: 'Matin (9h-12h)',
  afternoon: 'Après-midi (14h-18h)',
  evening: 'Soir (18h-20h)',
};

export function UserDetailView({ user, onSuccess }: UserDetailViewProps) {
  const [interviewNotes, setInterviewNotes] = useState(user.interviewNotes || '');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { approveUser, rejectUser, updateUserStatus, isLoading } = useAdminActions();

  const createdAt = user.createdAt?.toDate?.();
  const isFinalStatus = ['approved', 'rejected', 'suspended'].includes(user.status);

  const handleApprove = async () => {
    try {
      await approveUser(user.id);
      toast.success(`${user.displayName} a été approuvé avec succès`);
      onSuccess?.();
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
      console.error(error);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectUser(user.id, reason);
      toast.success('Demande rejetée');
      setShowRejectModal(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Erreur lors du rejet');
      console.error(error);
    }
  };

  const handleStatusChange = async (newStatus: UserStatus) => {
    try {
      await updateUserStatus(user.id, newStatus);
      toast.success(`Status mis à jour: ${newStatus}`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec nom et status */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <User className="h-6 w-6 text-gray-400" />
            {user.displayName}
          </h1>
          <p className="text-gray-500 mt-1">{user.email}</p>
        </div>
        <StatusBadge status={user.status} className="text-sm" />
      </div>

      <Separator />

      {/* Informations personnelles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Email</Label>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Téléphone</Label>
              <p className="text-sm font-medium flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {user.phone || 'Non renseigné'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Créneaux disponibles</Label>
              <p className="text-sm">
                {user.callbackSlots?.map((s) => CALLBACK_SLOT_LABELS[s] || s).join(', ') ||
                  'Non renseigné'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Inscrit le</Label>
              <p className="text-sm flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {createdAt ? format(createdAt, 'dd MMMM yyyy à HH:mm', { locale: fr }) : 'N/A'}
              </p>
            </div>
          </div>
          {user.callbackNote && (
            <div>
              <Label className="text-xs text-gray-500">Commentaire</Label>
              <p className="text-sm italic text-gray-600">&quot;{user.callbackNote}&quot;</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profil professionnel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Profil professionnel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Rôle demandé</Label>
              <p className="text-sm font-medium">{ROLE_LABELS[user.role] || user.role}</p>
            </div>

            {user.role === 'medecin' && user.medecinData && (
              <>
                <div>
                  <Label className="text-xs text-gray-500">Spécialité</Label>
                  <p className="text-sm">{user.medecinData.specialty || 'Non renseignée'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">N° RPPS</Label>
                  <p className="text-sm font-mono">{user.medecinData.rpps || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Secteur</Label>
                  <p className="text-sm">
                    {user.medecinData.sector
                      ? `Secteur ${user.medecinData.sector}`
                      : 'Non renseigné'}
                  </p>
                </div>
              </>
            )}

            {user.role === 'secretaire' && user.secretaireData && (
              <>
                <div>
                  <Label className="text-xs text-gray-500">Médecin référent</Label>
                  <p className="text-sm">{user.secretaireData.supervisorName || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Service</Label>
                  <p className="text-sm">{user.secretaireData.service || 'Non renseigné'}</p>
                </div>
              </>
            )}

            {user.role === 'technicien' && user.technicienData && (
              <div>
                <Label className="text-xs text-gray-500">Spécialisation</Label>
                <p className="text-sm">{user.technicienData.specialization || 'Non renseignée'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes d'entretien */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes d&apos;entretien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={interviewNotes}
            onChange={(e) => setInterviewNotes(e.target.value)}
            placeholder="Ajouter des notes sur l'entretien téléphonique..."
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            disabled={isFinalStatus}
          />
          {user.adminNotes && user.adminNotes.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-xs text-gray-500">Notes précédentes</Label>
              {user.adminNotes.map((note, i) => (
                <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                  <p className="text-gray-600">{note.note}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {note.timestamp} par {note.by}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historique des status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusHistory history={user.statusHistory || []} />
        </CardContent>
      </Card>

      {/* Actions */}
      {!isFinalStatus && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Changement de status intermédiaire */}
            <div className="flex items-center gap-4">
              <Label className="text-sm text-gray-600">Changer le status :</Label>
              <StatusSelect
                currentStatus={user.status}
                onChange={handleStatusChange}
                disabled={isLoading}
              />
            </div>

            <Separator />

            {/* Boutons finaux */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handleApprove}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approuver
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectModal(true)}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de rejet */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        userName={user.displayName}
        isLoading={isLoading}
      />
    </div>
  );
}
