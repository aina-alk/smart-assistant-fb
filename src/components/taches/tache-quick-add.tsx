'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TacheQuickAddProps {
  onAdd: (titre: string) => Promise<void>;
  isLoading?: boolean;
}

export function TacheQuickAdd({ onAdd, isLoading = false }: TacheQuickAddProps) {
  const [titre, setTitre] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || isLoading) return;

    await onAdd(titre.trim());
    setTitre('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ajouter une tâche rapidement..."
          className="pl-9"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={!titre.trim() || isLoading} size="sm">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ajouter'}
      </Button>
    </form>
  );
}
