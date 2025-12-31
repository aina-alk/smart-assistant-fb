'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useAudioStore } from '@/lib/stores/audio-store';
import { AUDIO_CONSTRAINTS, getMediaRecorderConfig } from '@/types/audio';

export function useAudioRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);

  const {
    status,
    duration,
    audioLevel,
    audioBlob,
    error,
    setStatus,
    setAudioBlob,
    setDuration,
    addChunk,
    setAudioLevel,
    setError,
    reset,
  } = useAudioStore();

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);

    animationRef.current = requestAnimationFrame(updateAudioLevel);
  }, [setAudioLevel]);

  const stopAudioLevel = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setAudioLevel(0);
  }, [setAudioLevel]);

  const startRecording = useCallback(async () => {
    try {
      setStatus('requesting_permission');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS,
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const config = getMediaRecorderConfig();
      const mediaRecorder = new MediaRecorder(stream, config.mimeType ? config : undefined);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          const timestamp = Date.now() - startTimeRef.current;
          addChunk({ data: event.data, timestamp });
          setDuration(timestamp / 1000);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = config.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        stopAudioLevel();
      };

      mediaRecorder.start(1000);
      setStatus('recording');
      updateAudioLevel();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Recording failed');
      setError(error);
    }
  }, [setStatus, addChunk, setDuration, setAudioBlob, setError, updateAudioLevel, stopAudioLevel]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setStatus('stopped');
    }
    stopAudioLevel();
  }, [setStatus, stopAudioLevel]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setStatus('paused');
      stopAudioLevel();
    }
  }, [setStatus, stopAudioLevel]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('recording');
      updateAudioLevel();
    }
  }, [setStatus, updateAudioLevel]);

  const resetRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    chunksRef.current = [];
    stopAudioLevel();
    reset();
  }, [reset, stopAudioLevel]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    status,
    duration,
    audioLevel,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset: resetRecording,
  };
}
