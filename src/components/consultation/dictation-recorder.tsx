'use client';

import { useCallback } from 'react';
import { Mic, Pause, Play, Square, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useTranscription } from '@/lib/hooks/use-transcription';
import type { TranscriptionTurn } from '@/types/transcription';

interface DictationRecorderProps {
  onTranscriptionUpdate?: (text: string) => void;
  onTranscriptionComplete?: (fullText: string, turns: TranscriptionTurn[]) => void;
  disabled?: boolean;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function DictationRecorder({
  onTranscriptionUpdate,
  onTranscriptionComplete,
  disabled = false,
  className,
}: DictationRecorderProps) {
  const {
    start,
    stop,
    pause,
    resume,
    partialTranscript: _partialTranscript,
    turns,
    fullTranscript,
    connectionStatus,
    recordingStatus,
    isActive: _isActive,
    audioLevel,
    duration,
    error,
  } = useTranscription({
    onTurnComplete: (turn) => {
      onTranscriptionUpdate?.(turn.text);
    },
    onStop: () => {
      onTranscriptionComplete?.(fullTranscript, turns);
    },
  });

  const handleStart = useCallback(async () => {
    await start();
  }, [start]);

  const handleStop = useCallback(() => {
    stop();
    onTranscriptionComplete?.(fullTranscript, turns);
  }, [stop, onTranscriptionComplete, fullTranscript, turns]);

  const isConnecting = connectionStatus === 'connecting' || connectionStatus === 'reconnecting';
  const isRecording = recordingStatus === 'recording';
  const isPaused = recordingStatus === 'paused';
  const isRequesting = recordingStatus === 'requesting_permission';
  const hasError = error !== null;

  if (hasError) {
    return (
      <Card className={cn('border-destructive', className)}>
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          <Button onClick={handleStart} variant="outline" className="w-full">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isRecording || isPaused) {
    return (
      <Card className={cn('border-primary', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-3 w-3 rounded-full',
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                )}
              />
              <span className="text-sm font-medium text-muted-foreground">
                {isRecording ? 'Enregistrement' : 'En pause'}
              </span>
            </div>
            <span className="text-2xl font-mono font-semibold tabular-nums">
              {formatDuration(duration)}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Mic className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Niveau audio</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-75',
                  audioLevel > 0.7
                    ? 'bg-red-500'
                    : audioLevel > 0.4
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                )}
                style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            {isRecording ? (
              <Button onClick={pause} variant="outline" className="flex-1">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button onClick={resume} variant="outline" className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                Reprendre
              </Button>
            )}
            <Button onClick={handleStop} variant="destructive" className="flex-1">
              <Square className="mr-2 h-4 w-4" />
              Terminer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <Button
          onClick={handleStart}
          disabled={disabled || isConnecting || isRequesting}
          className="w-full h-14 text-lg"
          size="lg"
        >
          {isConnecting || isRequesting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isRequesting ? 'Autorisation micro...' : 'Connexion...'}
            </>
          ) : (
            <>
              <Mic className="mr-2 h-5 w-5" />
              Démarrer la dictée
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
