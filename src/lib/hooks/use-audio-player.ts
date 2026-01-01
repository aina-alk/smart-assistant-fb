'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useAudioStore } from '@/lib/stores/audio-store';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { audioBlob, currentTime, isPlaying, setCurrentTime, setIsPlaying, setDuration } =
    useAudioStore();

  useEffect(() => {
    if (!audioBlob) {
      setIsReady(false);
      return;
    }

    const audio = new Audio();
    const url = URL.createObjectURL(audioBlob);
    audio.src = url;
    audioRef.current = audio;

    const handleCanPlay = () => {
      // Audio is ready to play - use canplay event instead of loadedmetadata
      // because blob audio (WebM) often reports Infinity duration until buffered
      setIsReady(true);
    };

    const handleLoadedMetadata = () => {
      // Update duration if finite (may not be for blob audio)
      const duration = audio.duration;
      if (Number.isFinite(duration) && duration > 0) {
        setDuration(duration);
      }
    };

    const handleDurationChange = () => {
      // Fallback: update duration when it becomes available
      const duration = audio.duration;
      if (Number.isFinite(duration) && duration > 0) {
        setDuration(duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      URL.revokeObjectURL(url);
    };
  }, [audioBlob, setCurrentTime, setIsPlaying, setDuration]);

  const play = useCallback(() => {
    if (audioRef.current && isReady) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isReady, setIsPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [setIsPlaying]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [setIsPlaying, setCurrentTime]);

  const seek = useCallback(
    (time: number) => {
      if (audioRef.current && isReady) {
        const duration = audioRef.current.duration;
        // Guard against non-finite duration (Infinity, NaN)
        if (!Number.isFinite(duration) || duration <= 0) {
          return;
        }
        // Guard against non-finite time input
        if (!Number.isFinite(time)) {
          return;
        }
        const clampedTime = Math.max(0, Math.min(time, duration));
        audioRef.current.currentTime = clampedTime;
        setCurrentTime(clampedTime);
      }
    },
    [isReady, setCurrentTime]
  );

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  return {
    isPlaying,
    currentTime,
    isReady,
    play,
    pause,
    stop,
    seek,
    setPlaybackRate,
  };
}
