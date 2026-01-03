'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAudioRecorder } from '@/lib/hooks/use-audio-recorder';
import { AudioControls } from './audio-controls';
import { formatTime } from '@/types/audio';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onTranscribe?: (blob: Blob) => Promise<void>;
  className?: string;
}

export function AudioRecorder({ onTranscribe, className }: AudioRecorderProps) {
  const hasAutoTranscribedRef = useRef(false);

  const {
    status,
    duration,
    audioLevel,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  } = useAudioRecorder();

  // Auto-transcription : envoyer automatiquement à l'arrêt de l'enregistrement
  useEffect(() => {
    if (status === 'stopped' && audioBlob && onTranscribe && !hasAutoTranscribedRef.current) {
      hasAutoTranscribedRef.current = true;
      onTranscribe(audioBlob);
    }
    // Reset le flag quand on revient à idle
    if (status === 'idle') {
      hasAutoTranscribedRef.current = false;
    }
  }, [status, audioBlob, onTranscribe]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Dictée vocale</span>
          {(status === 'recording' || status === 'paused') && (
            <span className="font-mono text-base font-normal text-muted-foreground">
              {formatTime(duration)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error.message}
          </div>
        )}

        <AudioControls
          status={status}
          audioLevel={audioLevel}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onPauseRecording={pauseRecording}
          onResumeRecording={resumeRecording}
          onReset={reset}
        />

        {status === 'idle' && (
          <p className="text-center text-xs text-muted-foreground">
            Cliquez pour démarrer l&apos;enregistrement. Maximum 10 minutes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
