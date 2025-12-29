'use client';

/**
 * RejectModal - Modal pour saisir la raison du rejet
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
  isLoading?: boolean;
}

export function RejectModal({ isOpen, onClose, onConfirm, userName, isLoading }: RejectModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Rejeter la demande</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de rejeter la demande de <strong>{userName}</strong>. Cette
            action est définitive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du rejet *</Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez pourquoi cette demande est rejetée..."
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Cette raison sera communiquée à l&apos;utilisateur par email.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? 'Rejet en cours...' : 'Confirmer le rejet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
