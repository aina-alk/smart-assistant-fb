'use client';

/**
 * useTranscription Hook
 *
 * Main hook for real-time medical transcription using AssemblyAI.
 * Combines audio capture and WebSocket streaming into a single,
 * easy-to-use interface.
 *
 * Features:
 * - One-call start/stop interface
 * - Automatic token management
 * - Turn-based transcription with ORL terminology
 * - Real-time audio level for UI
 * - Session duration tracking
 * - Error handling with French messages
 *
 * @example
 * ```tsx
 * const {
 *   start,
 *   stop,
 *   partialTranscript,
 *   turns,
 *   fullTranscript,
 *   isActive,
 *   audioLevel,
 * } = useTranscription();
 *
 * return (
 *   <div>
 *     <button onClick={isActive ? stop : start}>
 *       {isActive ? 'Arrêter' : 'Démarrer'}
 *     </button>
 *     <p>{partialTranscript}</p>
 *     {turns.map(turn => <p key={turn.id}>{turn.text}</p>)}
 *   </div>
 * );
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioCapture } from './use-audio-capture';
import { useAssemblyAIWebSocket } from './use-assemblyai-websocket';
import type {
  TranscriptionTurn,
  TranscriptionError,
  TokenResponse,
  UseTranscriptionReturn,
} from '@/types/transcription';
import { TRANSCRIPTION_ERROR_MESSAGES } from '@/lib/constants/assemblyai';

// ============================================================================
// TYPES
// ============================================================================

interface TranscriptionOptions {
  /** Called when transcription starts successfully */
  onStart?: () => void;
  /** Called when transcription stops */
  onStop?: () => void;
  /** Called when a new turn is completed */
  onTurnComplete?: (turn: TranscriptionTurn) => void;
  /** Called on error */
  onError?: (error: TranscriptionError) => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useTranscription(options: TranscriptionOptions = {}): UseTranscriptionReturn {
  const { onStart, onStop, onTurnComplete, onError } = options;

  // State
  const [turns, setTurns] = useState<TranscriptionTurn[]>([]);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<TranscriptionError | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Refs
  const sessionStartTimeRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Callback refs
  const onStartRef = useRef(onStart);
  const onStopRef = useRef(onStop);
  const onTurnCompleteRef = useRef(onTurnComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onStartRef.current = onStart;
    onStopRef.current = onStop;
    onTurnCompleteRef.current = onTurnComplete;
    onErrorRef.current = onError;
  }, [onStart, onStop, onTurnComplete, onError]);

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
  // WEBSOCKET HANDLERS
  // ============================================================================

  const handleSessionBegin = useCallback(() => {
    sessionStartTimeRef.current = new Date();
    setDuration(0);

    // Start duration counter
    durationIntervalRef.current = setInterval(() => {
      if (sessionStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - sessionStartTimeRef.current.getTime()) / 1000);
        setDuration(elapsed);
      }
    }, 1000);

    onStartRef.current?.();
  }, []);

  const handleTurn = useCallback((turn: TranscriptionTurn, isPartial: boolean) => {
    if (isPartial) {
      setPartialTranscript(turn.text);
    } else {
      // Final turn - add to turns and clear partial
      setPartialTranscript('');
      setTurns((prev) => [...prev, turn]);
      onTurnCompleteRef.current?.(turn);
    }
  }, []);

  const handleTermination = useCallback(() => {
    // Stop duration counter
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    onStopRef.current?.();
  }, []);

  const handleWebSocketError = useCallback((err: TranscriptionError) => {
    setError(err);
    onErrorRef.current?.(err);
  }, []);

  // ============================================================================
  // WEBSOCKET HOOK
  // ============================================================================

  const {
    connect: wsConnect,
    disconnect: wsDisconnect,
    sendAudio,
    status: connectionStatus,
    error: wsError,
  } = useAssemblyAIWebSocket({
    onSessionBegin: handleSessionBegin,
    onTurn: handleTurn,
    onTermination: handleTermination,
    onError: handleWebSocketError,
  });

  // ============================================================================
  // AUDIO CAPTURE HOOK
  // ============================================================================

  const handleAudioData = useCallback(
    (data: ArrayBuffer) => {
      sendAudio(data);
    },
    [sendAudio]
  );

  const {
    startCapture,
    stopCapture,
    pauseCapture,
    resumeCapture,
    status: recordingStatus,
    audioLevel,
    error: audioError,
  } = useAudioCapture({
    onAudioData: handleAudioData,
  });

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const isActive = connectionStatus === 'connected' && recordingStatus === 'recording';

  const fullTranscript = turns.map((t) => t.text).join(' ');

  // Combine errors
  const currentError = error || wsError || audioError;

  // ============================================================================
  // START
  // ============================================================================

  const start = useCallback(async () => {
    if (isStarting || isActive) return;

    try {
      setIsStarting(true);
      setError(null);
      setTurns([]);
      setPartialTranscript('');

      // 1. Fetch token from API
      const response = await fetch('/api/transcription/token', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const err = createError('TOKEN_GENERATION_FAILED');
        setError(err);
        onErrorRef.current?.(err);
        return;
      }

      const { token, websocketUrl } = (await response.json()) as TokenResponse;

      // 2. Start audio capture first
      await startCapture();

      // 3. Connect to WebSocket
      wsConnect(websocketUrl, token);
    } catch (err) {
      const transcriptionError = createError(
        'UNKNOWN_ERROR',
        err instanceof Error ? err : undefined
      );
      setError(transcriptionError);
      onErrorRef.current?.(transcriptionError);
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, isActive, createError, startCapture, wsConnect]);

  // ============================================================================
  // STOP
  // ============================================================================

  const stop = useCallback(() => {
    stopCapture();
    wsDisconnect();

    // Stop duration counter
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    sessionStartTimeRef.current = null;
    setPartialTranscript('');
    onStopRef.current?.();
  }, [stopCapture, wsDisconnect]);

  // ============================================================================
  // PAUSE / RESUME
  // ============================================================================

  const pause = useCallback(() => {
    pauseCapture();
  }, [pauseCapture]);

  const resume = useCallback(() => {
    resumeCapture();
  }, [resumeCapture]);

  // ============================================================================
  // CLEAR
  // ============================================================================

  const clear = useCallback(() => {
    setTurns([]);
    setPartialTranscript('');
    setDuration(0);
    setError(null);
  }, []);

  // ============================================================================
  // CLEANUP ON UNMOUNT
  // ============================================================================

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    start,
    stop,
    pause,
    resume,
    clear,
    partialTranscript,
    turns,
    fullTranscript,
    connectionStatus,
    recordingStatus,
    isActive,
    audioLevel,
    duration,
    error: currentError,
  };
}
