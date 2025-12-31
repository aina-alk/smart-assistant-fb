'use client';

/**
 * useAssemblyAIWebSocket Hook
 *
 * Manages the WebSocket connection to AssemblyAI's streaming API.
 * Handles connection lifecycle, message parsing, and reconnection.
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Type-safe message handling
 * - Connection state management
 * - Graceful disconnection
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  TranscriptionConnectionStatus,
  TranscriptionError,
  TranscriptionTurn,
  AssemblyAIMessage,
  UseAssemblyAIWebSocketReturn,
} from '@/types/transcription';
import { TRANSCRIPTION_ERROR_MESSAGES, WebSocketReadyState } from '@/lib/constants/assemblyai';

// ============================================================================
// TYPES
// ============================================================================

interface WebSocketOptions {
  /** Callback when session begins */
  onSessionBegin?: (sessionId: string, expiresAt: Date) => void;
  /** Callback when a transcription turn is received */
  onTurn?: (turn: TranscriptionTurn, isPartial: boolean) => void;
  /** Callback when session terminates */
  onTermination?: (audioDuration: number, sessionDuration: number) => void;
  /** Callback on error */
  onError?: (error: TranscriptionError) => void;
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Max reconnection attempts (default: 3) */
  maxReconnectAttempts?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RECONNECT_BASE_DELAY = 1000; // 1 second
const RECONNECT_MAX_DELAY = 10000; // 10 seconds

// ============================================================================
// HOOK
// ============================================================================

export function useAssemblyAIWebSocket(
  options: WebSocketOptions = {}
): UseAssemblyAIWebSocketReturn {
  const {
    onSessionBegin,
    onTurn,
    onTermination,
    onError,
    autoReconnect = true,
    maxReconnectAttempts = 3,
  } = options;

  // State
  const [status, setStatus] = useState<TranscriptionConnectionStatus>('disconnected');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<TranscriptionError | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const websocketUrlRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const turnCounterRef = useRef(0);

  // Callback refs to avoid stale closures
  const onSessionBeginRef = useRef(onSessionBegin);
  const onTurnRef = useRef(onTurn);
  const onTerminationRef = useRef(onTermination);
  const onErrorRef = useRef(onError);

  // Ref for connectInternal to break circular dependency
  const connectInternalRef = useRef<(url: string, token: string) => void>(() => {});

  useEffect(() => {
    onSessionBeginRef.current = onSessionBegin;
    onTurnRef.current = onTurn;
    onTerminationRef.current = onTermination;
    onErrorRef.current = onError;
  }, [onSessionBegin, onTurn, onTermination, onError]);

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
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      // Remove listeners before closing to avoid triggering onclose
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;

      if (
        wsRef.current.readyState === WebSocketReadyState.OPEN ||
        wsRef.current.readyState === WebSocketReadyState.CONNECTING
      ) {
        // Send termination message if connected
        if (wsRef.current.readyState === WebSocketReadyState.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({ type: 'Terminate' }));
          } catch {
            // Ignore send errors during cleanup
          }
        }
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    setSessionId(null);
    turnCounterRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // ============================================================================
  // RECONNECT
  // ============================================================================

  const attemptReconnect = useCallback(() => {
    if (!autoReconnect) return;
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      const err = createError('WEBSOCKET_CONNECTION_FAILED');
      setError(err);
      setStatus('error');
      onErrorRef.current?.(err);
      return;
    }

    reconnectAttemptsRef.current++;
    setStatus('reconnecting');

    // Exponential backoff
    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1),
      RECONNECT_MAX_DELAY
    );

    reconnectTimeoutRef.current = setTimeout(() => {
      if (websocketUrlRef.current && tokenRef.current) {
        connectInternalRef.current(websocketUrlRef.current, tokenRef.current);
      }
    }, delay);
  }, [autoReconnect, maxReconnectAttempts, createError]);

  // ============================================================================
  // MESSAGE HANDLER
  // ============================================================================

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as AssemblyAIMessage;

        switch (data.type) {
          case 'Begin': {
            const expiresAt = new Date(data.expires_at * 1000);
            setSessionId(data.id);
            onSessionBeginRef.current?.(data.id, expiresAt);
            break;
          }

          case 'Turn': {
            const turn: TranscriptionTurn = {
              id: `turn-${++turnCounterRef.current}`,
              text: data.transcript || '',
              isFinal: data.turn_is_formatted,
              startTime: data.start ?? 0,
              endTime: data.end,
              confidence: data.confidence,
              words: data.words,
              timestamp: new Date(),
            };
            onTurnRef.current?.(turn, !data.turn_is_formatted);
            break;
          }

          case 'Termination': {
            onTerminationRef.current?.(data.audio_duration_seconds, data.session_duration_seconds);
            break;
          }

          case 'Error': {
            const err = createError('ASSEMBLYAI_ERROR');
            err.message = data.message || err.message;
            setError(err);
            onErrorRef.current?.(err);
            break;
          }
        }
      } catch (err) {
        console.error('[AssemblyAI WebSocket] Failed to parse message:', err);
      }
    },
    [createError]
  );

  // ============================================================================
  // CONNECT (INTERNAL)
  // ============================================================================

  const connectInternal = useCallback(
    (websocketUrl: string, token: string) => {
      cleanup();
      setError(null);
      setStatus('connecting');

      try {
        // Add token to URL
        const urlWithToken = `${websocketUrl}&token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(urlWithToken);
        wsRef.current = ws;

        ws.onopen = () => {
          reconnectAttemptsRef.current = 0;
          setStatus('connected');
        };

        ws.onmessage = handleMessage;

        ws.onerror = () => {
          // Error details are limited in browsers for security
          const err = createError('WEBSOCKET_CONNECTION_FAILED');
          setError(err);
          onErrorRef.current?.(err);
        };

        ws.onclose = (event) => {
          // Normal closure (1000) or going away (1001) - don't reconnect
          if (event.code === 1000 || event.code === 1001) {
            setStatus('disconnected');
            return;
          }

          // Unexpected closure - attempt reconnect
          setStatus('disconnected');
          attemptReconnect();
        };
      } catch (err) {
        const transcriptionError = createError(
          'WEBSOCKET_CONNECTION_FAILED',
          err instanceof Error ? err : undefined
        );
        setError(transcriptionError);
        setStatus('error');
        onErrorRef.current?.(transcriptionError);
      }
    },
    [cleanup, handleMessage, attemptReconnect, createError]
  );

  // Update ref when connectInternal changes
  useEffect(() => {
    connectInternalRef.current = connectInternal;
  }, [connectInternal]);

  // ============================================================================
  // CONNECT (PUBLIC)
  // ============================================================================

  const connect = useCallback(
    (websocketUrl: string, token: string) => {
      websocketUrlRef.current = websocketUrl;
      tokenRef.current = token;
      reconnectAttemptsRef.current = 0;
      connectInternal(websocketUrl, token);
    },
    [connectInternal]
  );

  // ============================================================================
  // DISCONNECT
  // ============================================================================

  const disconnect = useCallback(() => {
    cleanup();
    setStatus('disconnected');
    websocketUrlRef.current = null;
    tokenRef.current = null;
  }, [cleanup]);

  // ============================================================================
  // SEND AUDIO
  // ============================================================================

  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current && wsRef.current.readyState === WebSocketReadyState.OPEN) {
      wsRef.current.send(audioData);
    }
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    connect,
    disconnect,
    sendAudio,
    status,
    sessionId,
    error,
  };
}
