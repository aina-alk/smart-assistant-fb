'use client';

import { Mic, Square, Pause, Play, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RecorderStatus } from '@/types/audio';

interface AudioControlsProps {
  status: RecorderStatus;
  audioLevel: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onReset: () => void;
  className?: string;
}

function AudioLevelIndicator({ level }: { level: number }) {
  const bars = 5;
  const activeBars = Math.ceil(level * bars);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 w-1 rounded-full transition-colors',
            i < activeBars ? 'bg-primary' : 'bg-muted'
          )}
          style={{ height: `${12 + i * 4}px` }}
        />
      ))}
    </div>
  );
}

export function AudioControls({
  status,
  audioLevel,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onReset,
  className,
}: AudioControlsProps) {
  if (status === 'idle') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <Button size="lg" onClick={onStartRecording} className="gap-2">
          <Mic className="h-5 w-5" />
          Démarrer la dictée
        </Button>
      </div>
    );
  }

  if (status === 'requesting_permission') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Demande d&apos;accès au microphone...</p>
      </div>
    );
  }

  if (status === 'recording' || status === 'paused') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className="flex items-center gap-3">
          {status === 'recording' && (
            <>
              <span className="flex h-3 w-3 items-center justify-center">
                <span className="absolute h-3 w-3 animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-red-500" />
              </span>
              <AudioLevelIndicator level={audioLevel} />
            </>
          )}
          {status === 'paused' && (
            <span className="text-sm font-medium text-muted-foreground">En pause</span>
          )}
        </div>
        <div className="flex gap-2">
          {status === 'recording' ? (
            <Button variant="outline" onClick={onPauseRecording} className="gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button variant="outline" onClick={onResumeRecording} className="gap-2">
              <Play className="h-4 w-4" />
              Reprendre
            </Button>
          )}
          <Button variant="destructive" onClick={onStopRecording} className="gap-2">
            <Square className="h-4 w-4" />
            Arrêter
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <p className="text-sm text-destructive">Une erreur est survenue</p>
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return null;
}
