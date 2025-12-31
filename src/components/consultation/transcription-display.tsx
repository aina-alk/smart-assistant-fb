'use client';

import { useState, useEffect, useRef } from 'react';
import { Pencil, Save, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TranscriptionProgress } from './transcription-progress';
import { cn } from '@/lib/utils';
import type { TranscriptionDisplayStatus } from '@/lib/stores/transcription-store';
import type { Utterance } from '@/types/transcription';

interface TranscriptionDisplayProps {
  status: TranscriptionDisplayStatus;
  text: string | null;
  confidence?: number | null;
  utterances?: Utterance[];
  uploadProgress?: number;
  estimatedTimeRemaining?: number | null;
  error?: string | null;
  isEditing?: boolean;
  editedText?: string | null;
  onStartEdit?: () => void;
  onSaveEdit?: (text: string) => void;
  onCancelEdit?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

export function TranscriptionDisplay({
  status,
  text,
  confidence,
  uploadProgress,
  estimatedTimeRemaining,
  error,
  isEditing = false,
  editedText,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRetry,
  onCancel,
  className,
}: TranscriptionDisplayProps) {
  const [localEditedText, setLocalEditedText] = useState(editedText ?? text ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  useEffect(() => {
    setLocalEditedText(editedText ?? text ?? '');
  }, [editedText, text]);

  const handleSave = () => {
    onSaveEdit?.(localEditedText);
  };

  if (status === 'idle') {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="py-8">
          <p className="text-center text-sm text-muted-foreground">
            Aucune transcription. Enregistrez une dictée pour commencer.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'uploading' || status === 'queued' || status === 'processing') {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Transcription</CardTitle>
        </CardHeader>
        <CardContent>
          <TranscriptionProgress
            status={status}
            uploadProgress={uploadProgress}
            estimatedTimeRemaining={estimatedTimeRemaining}
          />
          {onCancel && (
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Annuler
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className={cn('w-full border-destructive/50', className)}>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-center text-sm text-destructive">
              {error ?? 'Une erreur est survenue lors de la transcription.'}
            </p>
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const wordCount = text ? countWords(text) : 0;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Transcription</CardTitle>
          {!isEditing && onStartEdit && (
            <Button variant="ghost" size="sm" onClick={onStartEdit} className="gap-2">
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Textarea
              ref={textareaRef}
              value={localEditedText}
              onChange={(e) => setLocalEditedText(e.target.value)}
              className="min-h-[200px] resize-y"
              aria-label="Texte de la transcription"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCancelEdit} className="gap-2">
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-md bg-muted/30 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{text ?? 'Aucun texte'}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>📝 {wordCount} mots</span>
              {confidence && <span>🎯 Confiance : {Math.round(confidence * 100)}%</span>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
