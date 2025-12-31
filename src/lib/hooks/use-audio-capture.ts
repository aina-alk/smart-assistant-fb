'use client';

/**
 * useAudioCapture Hook
 *
 * Captures audio from the user's microphone using Web Audio API
 * and AudioWorklet for high-performance, low-latency processing.
 *
 * Features:
 * - Microphone permission handling
 * - Real-time PCM16 audio streaming
 * - Audio level monitoring for UI
 * - Pause/resume support
 * - Automatic cleanup
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  RecordingStatus,
  TranscriptionError,
  UseAudioCaptureReturn,
} from '@/types/transcription';
import { TRANSCRIPTION_ERROR_MESSAGES } from '@/lib/constants/assemblyai';

// ============================================================================
// TYPES
// ============================================================================

interface AudioCaptureOptions {
  /** Callback when audio data is available */
  onAudioData?: (data: ArrayBuffer) => void;
  /** Callback when audio level changes */
  onLevelChange?: (level: number) => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAudioCapture(options: AudioCaptureOptions = {}): UseAudioCaptureReturn {
  const { onAudioData, onLevelChange } = options;

  // State
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<TranscriptionError | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Refs for audio resources (not state to avoid re-renders)
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Callback refs (to avoid stale closures)
  const onAudioDataRef = useRef(onAudioData);
  const onLevelChangeRef = useRef(onLevelChange);

  // Update callback refs
  useEffect(() => {
    onAudioDataRef.current = onAudioData;
    onLevelChangeRef.current = onLevelChange;
  }, [onAudioData, onLevelChange]);

  // ============================================================================
  // ERROR HELPER
  // ============================================================================

  const createError = useCallback(
    (code: TranscriptionError['code'], originalError?: Error): TranscriptionError => ({
      code,
      message: TRANSCRIPTION_ERROR_MESSAGES[code] || TRANSCRIPTION_ERROR_MESSAGES.UNKNOWN_ERROR,
      originalError,
      timestamp: new Date(),
    }),
    []
  );

  // ============================================================================
  // CLEANUP
  // ============================================================================

  const cleanup = useCallback(() => {
    // Stop worklet
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ type: 'stop' });
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    // Stop source
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    // Stop media stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // ============================================================================
  // START CAPTURE
  // ============================================================================

  const startCapture = useCallback(async () => {
    try {
      setError(null);
      setStatus('requesting_permission');

      // 1. Request microphone access
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: { ideal: 16000 },
          },
        });
        setHasPermission(true);
        mediaStreamRef.current = stream;
      } catch (err) {
        setHasPermission(false);
        const errorCode =
          err instanceof DOMException && err.name === 'NotFoundError'
            ? 'MICROPHONE_NOT_FOUND'
            : 'MICROPHONE_PERMISSION_DENIED';
        const transcriptionError = createError(errorCode, err instanceof Error ? err : undefined);
        setError(transcriptionError);
        setStatus('error');
        return;
      }

      // 2. Create audio context
      try {
        audioContextRef.current = new AudioContext({
          sampleRate: 48000, // Browser's preferred rate, will downsample in worklet
        });
      } catch (err) {
        cleanup();
        const transcriptionError = createError(
          'AUDIO_CONTEXT_ERROR',
          err instanceof Error ? err : undefined
        );
        setError(transcriptionError);
        setStatus('error');
        return;
      }

      const audioContext = audioContextRef.current;

      // 3. Load AudioWorklet module
      try {
        await audioContext.audioWorklet.addModule('/audio-worklet-processor.js');
      } catch (err) {
        cleanup();
        const transcriptionError = createError(
          'AUDIO_CONTEXT_ERROR',
          err instanceof Error ? err : undefined
        );
        setError(transcriptionError);
        setStatus('error');
        return;
      }

      // 4. Create source from media stream
      sourceNodeRef.current = audioContext.createMediaStreamSource(stream);

      // 5. Create worklet node
      workletNodeRef.current = new AudioWorkletNode(audioContext, 'pcm16-audio-processor');

      // 6. Handle messages from worklet
      workletNodeRef.current.port.onmessage = (event) => {
        const { type, buffer, level } = event.data;

        if (type === 'audio' && buffer) {
          onAudioDataRef.current?.(buffer);
        } else if (type === 'level' && typeof level === 'number') {
          setAudioLevel(level);
          onLevelChangeRef.current?.(level);
        }
      };

      // 7. Connect the audio graph
      sourceNodeRef.current.connect(workletNodeRef.current);
      // Don't connect to destination (we don't want to play the audio back)

      // 8. Resume context if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      setStatus('recording');
    } catch (err) {
      cleanup();
      const transcriptionError = createError(
        'UNKNOWN_ERROR',
        err instanceof Error ? err : undefined
      );
      setError(transcriptionError);
      setStatus('error');
    }
  }, [cleanup, createError]);

  // ============================================================================
  // STOP CAPTURE
  // ============================================================================

  const stopCapture = useCallback(() => {
    cleanup();
    setStatus('idle');
  }, [cleanup]);

  // ============================================================================
  // PAUSE CAPTURE
  // ============================================================================

  const pauseCapture = useCallback(() => {
    if (status !== 'recording') return;

    workletNodeRef.current?.port.postMessage({ type: 'pause' });
    setStatus('paused');
  }, [status]);

  // ============================================================================
  // RESUME CAPTURE
  // ============================================================================

  const resumeCapture = useCallback(() => {
    if (status !== 'paused') return;

    workletNodeRef.current?.port.postMessage({ type: 'resume' });
    setStatus('recording');
  }, [status]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    startCapture,
    stopCapture,
    pauseCapture,
    resumeCapture,
    status,
    audioLevel,
    error,
    hasPermission,
  };
}
