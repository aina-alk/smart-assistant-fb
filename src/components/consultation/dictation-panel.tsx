'use client';

import { useCallback, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TranscriptionDisplay } from './transcription-display';
import { useTranscriptionStore } from '@/lib/stores/transcription-store';
import { useTranscription } from '@/lib/hooks/use-transcription';

interface DictationPanelProps {
  /** Called when user clicks "Generate report" with the full transcript */
  onComplete?: (transcript: string) => void;
  /** Disable all interactions */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function DictationPanel({ onComplete, disabled = false, className }: DictationPanelProps) {
  // Global store for transcript state
  const {
    fullTranscript,
    partialTranscript,
    wordCount,
    duration,
    isEditing,
    addTurn,
    setPartialTranscript,
    updateFullTranscript,
    setEditing,
    setDuration,
    reset,
  } = useTranscriptionStore();

  // Hook for transcription session control
  const {
    start,
    stop,
    pause,
    resume,
    connectionStatus,
    recordingStatus,
    audioLevel,
    duration: sessionDuration,
    error,
  } = useTranscription({
    onTurnComplete: (turn) => {
      addTurn(turn);
    },
  });

  // Sync duration from hook to store
  useEffect(() => {
    setDuration(sessionDuration);
  }, [sessionDuration, setDuration]);

  // Handle transcription updates from the hook
  const handleTranscriptionUpdate = useCallback(
    (text: string) => {
      setPartialTranscript(text);
    },
    [setPartialTranscript]
  );

  // Handle edit from display component
  const handleEdit = useCallback(
    (text: string) => {
      updateFullTranscript(text);
      setEditing(false);
    },
    [updateFullTranscript, setEditing]
  );

  // Handle generate report
  const handleGenerateReport = useCallback(() => {
    // Combine final transcript with any remaining partial
    const completeTranscript = partialTranscript
      ? `${fullTranscript} ${partialTranscript}`.trim()
      : fullTranscript;

    onComplete?.(completeTranscript);
  }, [fullTranscript, partialTranscript, onComplete]);

  // Handle reset
  const handleReset = useCallback(() => {
    stop();
    reset();
  }, [stop, reset]);

  const hasContent = fullTranscript.length > 0 || partialTranscript.length > 0;
  const isRecording = recordingStatus === 'recording';
  const isPaused = recordingStatus === 'paused';
  const isActive = isRecording || isPaused;

  // Create custom recorder props that use the hook functions
  const recorderProps = {
    onTranscriptionUpdate: handleTranscriptionUpdate,
    disabled: disabled || isEditing,
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Transcription Display */}
      <TranscriptionDisplay
        finalText={fullTranscript}
        partialText={partialTranscript}
        editable={!isActive}
        onEdit={handleEdit}
        wordCount={wordCount}
        duration={duration}
      />

      {/* Dictation Recorder - Custom implementation using shared hook */}
      <DictationRecorderInternal
        start={start}
        stop={stop}
        pause={pause}
        resume={resume}
        connectionStatus={connectionStatus}
        recordingStatus={recordingStatus}
        audioLevel={audioLevel}
        duration={sessionDuration}
        error={error}
        disabled={recorderProps.disabled}
      />

      {/* Action buttons */}
      <div className="flex gap-3">
        {hasContent && !isActive && (
          <>
            <Button onClick={handleGenerateReport} disabled={disabled} className="flex-1" size="lg">
              <FileText className="mr-2 h-5 w-5" />
              Générer le compte-rendu
            </Button>
            <Button onClick={handleReset} variant="outline" disabled={disabled}>
              Effacer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// Internal recorder component that uses passed-in hook values
interface DictationRecorderInternalProps {
  start: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  connectionStatus: string;
  recordingStatus: string;
  audioLevel: number;
  duration: number;
  error: { message: string } | null;
  disabled?: boolean;
}

import { Mic, Pause, Play, Square, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function DictationRecorderInternal({
  start,
  stop,
  pause,
  resume,
  connectionStatus,
  recordingStatus,
  audioLevel,
  duration,
  error,
  disabled = false,
}: DictationRecorderInternalProps) {
  const isConnecting = connectionStatus === 'connecting' || connectionStatus === 'reconnecting';
  const isRecording = recordingStatus === 'recording';
  const isPaused = recordingStatus === 'paused';
  const isRequesting = recordingStatus === 'requesting_permission';
  const hasError = error !== null;

  if (hasError) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          <Button onClick={start} variant="outline" className="w-full">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isRecording || isPaused) {
    return (
      <Card className="border-primary">
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
            <Button onClick={stop} variant="destructive" className="flex-1">
              <Square className="mr-2 h-4 w-4" />
              Terminer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Button
          onClick={start}
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
