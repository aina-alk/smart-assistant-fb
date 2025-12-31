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

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsReady(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
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
        const clampedTime = Math.max(0, Math.min(time, audioRef.current.duration));
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
