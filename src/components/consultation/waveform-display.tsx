'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface WaveformDisplayProps {
  data: number[];
  progress?: number;
  className?: string;
  onClick?: (progress: number) => void;
}

export function WaveformDisplay({ data, progress = 0, className, onClick }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / data.length;
    const barGap = 2;

    ctx.clearRect(0, 0, width, height);

    data.forEach((value, index) => {
      const barHeight = Math.max(value * height * 0.8, 2);
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      const progressIndex = Math.floor(progress * data.length);

      ctx.fillStyle =
        index < progressIndex ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)';
      ctx.fillRect(x + barGap / 2, y, barWidth - barGap, barHeight);
    });
  }, [data, progress]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onClick || data.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = x / rect.width;
    onClick(Math.max(0, Math.min(1, clickProgress)));
  };

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'flex h-16 items-center justify-center rounded-md bg-muted/50 text-sm text-muted-foreground',
          className
        )}
      >
        Aucun audio enregistré
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn('h-16 w-full cursor-pointer rounded-md bg-muted/30', className)}
      onClick={handleClick}
    />
  );
}
