'use client';

import { cn } from '@/lib/utils';
import { formatTime } from '@/types/audio';

interface AudioTimelineProps {
  currentTime: number;
  duration: number;
  className?: string;
  onSeek?: (time: number) => void;
  disabled?: boolean;
}

export function AudioTimeline({
  currentTime,
  duration,
  className,
  onSeek,
  disabled = false,
}: AudioTimelineProps) {
  // Guard against non-finite duration
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeCurrentTime = Number.isFinite(currentTime) ? currentTime : 0;
  const progress = safeDuration > 0 ? (safeCurrentTime / safeDuration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !onSeek || safeDuration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = x / rect.width;
    const seekTime = clickProgress * safeDuration;
    onSeek(Math.max(0, Math.min(safeDuration, seekTime)));
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-muted',
          !disabled && 'cursor-pointer'
        )}
        onClick={handleClick}
      >
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        {!disabled && safeDuration > 0 && (
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-sm"
            style={{ left: `${progress}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
