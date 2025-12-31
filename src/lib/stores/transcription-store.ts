'use client';

import { create } from 'zustand';
import type { TranscriptionResult, Utterance } from '@/types/transcription';

export type TranscriptionDisplayStatus =
  | 'idle'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'error';

interface TranscriptionState {
  status: TranscriptionDisplayStatus;
  uploadProgress: number;
  transcriptId: string | null;
  processingStartedAt: Date | null;
  audioDuration: number | null;

  text: string | null;
  confidence: number | null;
  utterances: Utterance[];

  isEditing: boolean;
  editedText: string | null;

  error: string | null;

  setStatus: (status: TranscriptionDisplayStatus) => void;
  setUploadProgress: (progress: number) => void;
  setTranscriptId: (id: string) => void;
  startProcessing: () => void;
  setResult: (result: TranscriptionResult) => void;
  setError: (error: string) => void;
  setAudioDuration: (duration: number) => void;
  startEditing: () => void;
  saveEdit: (text: string) => void;
  cancelEdit: () => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as TranscriptionDisplayStatus,
  uploadProgress: 0,
  transcriptId: null,
  processingStartedAt: null,
  audioDuration: null,
  text: null,
  confidence: null,
  utterances: [],
  isEditing: false,
  editedText: null,
  error: null,
};

export const useTranscriptionStore = create<TranscriptionState>((set, get) => ({
  ...initialState,

  setStatus: (status) => set({ status }),

  setUploadProgress: (uploadProgress) => set({ uploadProgress }),

  setTranscriptId: (transcriptId) => set({ transcriptId }),

  startProcessing: () =>
    set({
      status: 'processing',
      processingStartedAt: new Date(),
    }),

  setResult: (result) => {
    if (result.status === 'completed') {
      set({
        status: 'completed',
        text: result.text,
        confidence: result.audioDuration ? 0.95 : null,
        utterances: result.utterances ?? [],
        audioDuration: result.audioDuration,
        error: null,
      });
    } else if (result.status === 'error') {
      set({
        status: 'error',
        error: result.error ?? 'Erreur de transcription',
      });
    } else if (result.status === 'processing' && get().status !== 'processing') {
      get().startProcessing();
    } else {
      set({ status: result.status as TranscriptionDisplayStatus });
    }
  },

  setError: (error) => set({ status: 'error', error }),

  setAudioDuration: (audioDuration) => set({ audioDuration }),

  startEditing: () => {
    const { text } = get();
    set({ isEditing: true, editedText: text });
  },

  saveEdit: (text) =>
    set({
      text,
      isEditing: false,
      editedText: null,
    }),

  cancelEdit: () =>
    set({
      isEditing: false,
      editedText: null,
    }),

  reset: () => set(initialState),
}));
