'use client';

import { useCallback, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from './audio-recorder';
import { TranscriptionDisplay } from './transcription-display';
import { useTranscriptionUpload } from '@/lib/hooks/use-transcription-upload';
import { useAudioStore } from '@/lib/stores/audio-store';
import { cn } from '@/lib/utils';

interface DictationPanelProps {
  onTranscriptionComplete?: (text: string) => void;
  onGenerateCRC?: (text: string) => void;
  className?: string;
}

export function DictationPanel({
  onTranscriptionComplete,
  onGenerateCRC,
  className,
}: DictationPanelProps) {
  const audioDuration = useAudioStore((state) => state.duration);

  const {
    status,
    uploadProgress,
    text,
    confidence,
    estimatedTimeRemaining,
    error,
    isEditing,
    editedText,
    upload,
    cancel,
    reset,
    startEditing,
    saveEdit,
    cancelEdit,
  } = useTranscriptionUpload();

  const handleTranscribe = useCallback(
    async (blob: Blob) => {
      await upload(blob, audioDuration);
    },
    [upload, audioDuration]
  );

  const handleSaveEdit = useCallback(
    (newText: string) => {
      saveEdit(newText);
      onTranscriptionComplete?.(newText);
    },
    [saveEdit, onTranscriptionComplete]
  );

  const handleGenerateCRC = useCallback(() => {
    if (text) {
      onGenerateCRC?.(text);
    }
  }, [text, onGenerateCRC]);

  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (prevStatusRef.current !== 'completed' && status === 'completed' && text) {
      onTranscriptionComplete?.(text);
    }
    prevStatusRef.current = status;
  }, [status, text, onTranscriptionComplete]);

  const showTranscription = status !== 'idle';
  const canGenerateCRC = status === 'completed' && text && !isEditing;

  return (
    <div className={cn('space-y-4', className)}>
      <AudioRecorder
        onTranscribe={handleTranscribe}
        className={
          status !== 'idle' && status !== 'completed' ? 'opacity-50 pointer-events-none' : ''
        }
      />

      {showTranscription && (
        <TranscriptionDisplay
          status={status}
          text={text}
          confidence={confidence}
          uploadProgress={uploadProgress}
          estimatedTimeRemaining={estimatedTimeRemaining}
          error={error}
          isEditing={isEditing}
          editedText={editedText}
          onStartEdit={startEditing}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={cancelEdit}
          onRetry={handleRetry}
          onCancel={status !== 'completed' && status !== 'error' ? cancel : undefined}
        />
      )}

      {canGenerateCRC && (
        <Button onClick={handleGenerateCRC} className="w-full gap-2" size="lg">
          <FileText className="h-5 w-5" />
          Générer le compte-rendu de consultation
        </Button>
      )}
    </div>
  );
}
