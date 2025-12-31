'use client';

import { Loader2, Upload, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranscriptionDisplayStatus } from '@/lib/stores/transcription-store';

interface TranscriptionProgressProps {
  status: Extract<TranscriptionDisplayStatus, 'uploading' | 'queued' | 'processing'>;
  uploadProgress?: number;
  estimatedTimeRemaining?: number | null;
  className?: string;
}

const STATUS_CONFIG = {
  uploading: {
    icon: Upload,
    label: "Envoi de l'audio",
    showProgress: true,
  },
  queued: {
    icon: Clock,
    label: "En file d'attente",
    showProgress: false,
  },
  processing: {
    icon: Loader2,
    label: 'Transcription en cours',
    showProgress: false,
  },
} as const;

export function TranscriptionProgress({
  status,
  uploadProgress = 0,
  estimatedTimeRemaining,
  className,
}: TranscriptionProgressProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const getMessage = () => {
    if (status === 'uploading') {
      return `${config.label}... ${uploadProgress}%`;
    }
    if (status === 'processing' && estimatedTimeRemaining && estimatedTimeRemaining > 0) {
      return `${config.label}... (~${Math.ceil(estimatedTimeRemaining)}s restantes)`;
    }
    return `${config.label}...`;
  };

  return (
    <div
      className={cn('flex flex-col items-center gap-4 py-8', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={cn('h-5 w-5', status !== 'uploading' && 'animate-spin')} />
        <span className="text-sm font-medium">{getMessage()}</span>
      </div>

      <div className="w-full max-w-xs">
        {config.showProgress ? (
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        ) : (
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary/50" />
          </div>
        )}
      </div>
    </div>
  );
}
