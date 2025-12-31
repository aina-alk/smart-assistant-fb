'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useTranscriptionStore } from '@/lib/stores/transcription-store';
import type { StartTranscriptionResponse, GetTranscriptionResponse } from '@/types/transcription';

const POLLING_CONFIG = {
  initialDelay: 1000,
  interval: 3000,
  maxAttempts: 100,
  timeout: 300000,
};

export function useTranscriptionUpload() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  const {
    status,
    uploadProgress,
    transcriptId,
    text,
    confidence,
    utterances,
    audioDuration,
    processingStartedAt,
    error,
    isEditing,
    editedText,
    setStatus,
    setUploadProgress,
    setTranscriptId,
    startProcessing: _startProcessing,
    setResult,
    setError,
    setAudioDuration,
    startEditing,
    saveEdit,
    cancelEdit,
    reset,
  } = useTranscriptionStore();

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const pollStatus = useCallback(
    async (id: string, signal: AbortSignal) => {
      try {
        const response = await fetch(`/api/transcription/${id}`, { signal });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur de récupération');
        }

        const data: GetTranscriptionResponse = await response.json();
        setResult(data.result);

        if (data.result.status === 'completed' || data.result.status === 'error') {
          stopPolling();
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Polling error:', err);
      }
    },
    [setResult, stopPolling]
  );

  const startPolling = useCallback(
    (id: string, signal: AbortSignal) => {
      setTimeout(() => {
        if (signal.aborted) return;

        pollStatus(id, signal);

        pollingIntervalRef.current = setInterval(() => {
          pollCountRef.current += 1;

          if (pollCountRef.current >= POLLING_CONFIG.maxAttempts) {
            stopPolling();
            setError("Délai d'attente dépassé. Veuillez réessayer.");
            return;
          }

          pollStatus(id, signal);
        }, POLLING_CONFIG.interval);
      }, POLLING_CONFIG.initialDelay);
    },
    [pollStatus, setError, stopPolling]
  );

  const upload = useCallback(
    async (audioBlob: Blob, duration?: number) => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      if (duration) {
        setAudioDuration(duration);
      }

      try {
        setStatus('uploading');
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('audio', audioBlob);

        const response = await fetch('/api/transcription', {
          method: 'POST',
          body: formData,
          signal,
        });

        setUploadProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur d'upload");
        }

        const data: StartTranscriptionResponse = await response.json();
        setTranscriptId(data.transcriptId);
        setStatus('queued');

        startPolling(data.transcriptId, signal);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          reset();
          return;
        }

        setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
      }
    },
    [setStatus, setUploadProgress, setTranscriptId, setError, setAudioDuration, startPolling, reset]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    stopPolling();
    reset();
  }, [stopPolling, reset]);

  const estimatedTimeRemaining = (() => {
    if (!processingStartedAt || !audioDuration) return null;
    const elapsed = (Date.now() - processingStartedAt.getTime()) / 1000;
    const estimatedTotal = audioDuration * 0.2;
    return Math.max(0, estimatedTotal - elapsed);
  })();

  return {
    status,
    uploadProgress,
    transcriptId,
    text,
    confidence,
    utterances,
    audioDuration,
    processingStartedAt,
    estimatedTimeRemaining,
    error,
    isEditing,
    editedText,
    upload,
    cancel,
    reset,
    startEditing,
    saveEdit,
    cancelEdit,
  };
}
