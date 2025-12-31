/**
 * Transcription Store (Zustand)
 *
 * Global state management for transcription sessions.
 * Use this when you need to share transcription state
 * across multiple components.
 *
 * For most use cases, the useTranscription hook is sufficient.
 * Use this store when you need:
 * - Access to transcription state in non-React code
 * - Persistence across page navigations
 * - Shared state between distant components
 *
 * @example
 * ```tsx
 * // In a component
 * const { turns, fullTranscript, isActive } = useTranscriptionStore();
 *
 * // Or with selectors for performance
 * const turns = useTranscriptionStore(state => state.turns);
 * ```
 */

import { create } from 'zustand';
import type {
  TranscriptionTurn,
  TranscriptionError,
  TranscriptionConnectionStatus,
  RecordingStatus,
} from '@/types/transcription';

// ============================================================================
// TYPES
// ============================================================================

interface TranscriptionState {
  // Session state
  turns: TranscriptionTurn[];
  partialTranscript: string;
  fullTranscript: string;

  // Status
  connectionStatus: TranscriptionConnectionStatus;
  recordingStatus: RecordingStatus;
  isActive: boolean;

  // Editing
  isEditing: boolean;

  // Metrics
  audioLevel: number;
  duration: number;
  sessionId: string | null;
  wordCount: number;

  // Error
  error: TranscriptionError | null;
}

interface TranscriptionActions {
  // Turn management
  addTurn: (turn: TranscriptionTurn) => void;
  setPartialTranscript: (text: string) => void;
  clearTurns: () => void;

  // Status updates
  setConnectionStatus: (status: TranscriptionConnectionStatus) => void;
  setRecordingStatus: (status: RecordingStatus) => void;
  setSessionId: (id: string | null) => void;

  // Editing
  setEditing: (editing: boolean) => void;
  updateFullTranscript: (text: string) => void;

  // Metrics
  setAudioLevel: (level: number) => void;
  setDuration: (seconds: number) => void;

  // Error handling
  setError: (error: TranscriptionError | null) => void;

  // Reset
  reset: () => void;
}

type TranscriptionStore = TranscriptionState & TranscriptionActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: TranscriptionState = {
  turns: [],
  partialTranscript: '',
  fullTranscript: '',
  connectionStatus: 'disconnected',
  recordingStatus: 'idle',
  isActive: false,
  isEditing: false,
  audioLevel: 0,
  duration: 0,
  sessionId: null,
  wordCount: 0,
  error: null,
};

/**
 * Count words in a string
 */
function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

// ============================================================================
// STORE
// ============================================================================

export const useTranscriptionStore = create<TranscriptionStore>((set) => ({
  // Initial state
  ...initialState,

  // ============================================================================
  // TURN MANAGEMENT
  // ============================================================================

  addTurn: (turn) =>
    set((state) => {
      const newTurns = [...state.turns, turn];
      const newFullTranscript = newTurns.map((t) => t.text).join(' ');
      return {
        turns: newTurns,
        fullTranscript: newFullTranscript,
        partialTranscript: '', // Clear partial when adding final turn
        wordCount: countWords(newFullTranscript),
      };
    }),

  setPartialTranscript: (text) =>
    set({
      partialTranscript: text,
    }),

  clearTurns: () =>
    set({
      turns: [],
      partialTranscript: '',
      fullTranscript: '',
    }),

  // ============================================================================
  // STATUS UPDATES
  // ============================================================================

  setConnectionStatus: (status) =>
    set((state) => ({
      connectionStatus: status,
      isActive: status === 'connected' && state.recordingStatus === 'recording',
    })),

  setRecordingStatus: (status) =>
    set((state) => ({
      recordingStatus: status,
      isActive: state.connectionStatus === 'connected' && status === 'recording',
    })),

  setSessionId: (id) =>
    set({
      sessionId: id,
    }),

  // ============================================================================
  // EDITING
  // ============================================================================

  setEditing: (editing) =>
    set({
      isEditing: editing,
    }),

  updateFullTranscript: (text) =>
    set({
      fullTranscript: text,
      wordCount: countWords(text),
      // Clear turns since we're now in manual edit mode
      turns: [],
    }),

  // ============================================================================
  // METRICS
  // ============================================================================

  setAudioLevel: (level) =>
    set({
      audioLevel: level,
    }),

  setDuration: (seconds) =>
    set({
      duration: seconds,
    }),

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  setError: (error) =>
    set({
      error,
    }),

  // ============================================================================
  // RESET
  // ============================================================================

  reset: () => set(initialState),
}));

// ============================================================================
// SELECTORS (for optimized re-renders)
// ============================================================================

/**
 * Select only the transcript-related state
 */
export const selectTranscript = (state: TranscriptionStore) => ({
  turns: state.turns,
  partialTranscript: state.partialTranscript,
  fullTranscript: state.fullTranscript,
});

/**
 * Select only the status-related state
 */
export const selectStatus = (state: TranscriptionStore) => ({
  connectionStatus: state.connectionStatus,
  recordingStatus: state.recordingStatus,
  isActive: state.isActive,
});

/**
 * Select only the metrics
 */
export const selectMetrics = (state: TranscriptionStore) => ({
  audioLevel: state.audioLevel,
  duration: state.duration,
});

/**
 * Check if there's any transcription content
 */
export const selectHasContent = (state: TranscriptionStore) =>
  state.turns.length > 0 || state.partialTranscript.length > 0;
