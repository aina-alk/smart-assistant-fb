'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAudioRecorder } from '@/lib/hooks/use-audio-recorder';
import { useAudioPlayer } from '@/lib/hooks/use-audio-player';
import { useWaveform } from '@/lib/hooks/use-waveform';
import { useAudioStore } from '@/lib/stores/audio-store';
import { WaveformDisplay } from './waveform-display';
import { AudioTimeline } from './audio-timeline';
import { AudioControls } from './audio-controls';
import { formatTime } from '@/types/audio';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onTranscribe?: (blob: Blob) => Promise<void>;
  className?: string;
}

export function AudioRecorder({ onTranscribe, className }: AudioRecorderProps) {
  const [isUploading, setIsUploading] = useState(false);

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

  const { isPlaying, currentTime, play, pause, seek } = useAudioPlayer();

  const { waveformData, isAnalyzing, analyzeBlob } = useWaveform();

  const storeStatus = useAudioStore((state) => state.status);

  useEffect(() => {
    if (audioBlob && storeStatus === 'stopped') {
      analyzeBlob(audioBlob);
    }
  }, [audioBlob, storeStatus, analyzeBlob]);

  const handleSeek = useCallback(
    (time: number) => {
      seek(time);
    },
    [seek]
  );

  const handleWaveformClick = useCallback(
    (progress: number) => {
      if (duration > 0) {
        seek(progress * duration);
      }
    },
    [duration, seek]
  );

  const handleTranscribe = useCallback(async () => {
    if (!audioBlob || !onTranscribe) return;

    setIsUploading(true);
    try {
      await onTranscribe(audioBlob);
    } finally {
      setIsUploading(false);
    }
  }, [audioBlob, onTranscribe]);

  const progress = duration > 0 ? currentTime / duration : 0;

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
        {status === 'stopped' && (
          <>
            <WaveformDisplay
              data={waveformData}
              progress={progress}
              onClick={handleWaveformClick}
              className={isAnalyzing ? 'animate-pulse' : ''}
            />
            <AudioTimeline
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              disabled={isPlaying}
            />
          </>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error.message}
          </div>
        )}

        <AudioControls
          status={status}
          isPlaying={isPlaying}
          audioLevel={audioLevel}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onPauseRecording={pauseRecording}
          onResumeRecording={resumeRecording}
          onPlay={play}
          onPause={pause}
          onReset={reset}
          onTranscribe={handleTranscribe}
          isUploading={isUploading}
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
