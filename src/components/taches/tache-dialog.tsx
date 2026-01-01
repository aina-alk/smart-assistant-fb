'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TacheForm } from './tache-form';
import type { TacheFormData } from '@/lib/validations/tache';
import type { Tache } from '@/types/tache';

interface TacheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tache?: Tache;
  onSubmit: (data: TacheFormData) => void;
  isSubmitting?: boolean;
}

export function TacheDialog({
  open,
  onOpenChange,
  tache,
  onSubmit,
  isSubmitting = false,
}: TacheDialogProps) {
  const isEditing = Boolean(tache);

  const handleSubmit = (data: TacheFormData) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de la tâche.'
              : 'Créez une nouvelle tâche pour votre suivi.'}
          </DialogDescription>
        </DialogHeader>
        <TacheForm
          defaultValues={tache}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? 'Enregistrer' : 'Créer la tâche'}
        />
      </DialogContent>
    </Dialog>
  );
}
