/**
 * Audio Store - État global pour l'enregistrement audio
 */

import { create } from 'zustand';
import type { RecorderStatus, AudioChunk } from '@/types/audio';

interface AudioState {
  status: RecorderStatus;
  audioBlob: Blob | null;
  duration: number;
  chunks: AudioChunk[];
  currentTime: number;
  isPlaying: boolean;
  audioLevel: number;
  waveformData: number[];
  error: Error | null;

  setStatus: (status: RecorderStatus) => void;
  setAudioBlob: (blob: Blob | null) => void;
  setDuration: (duration: number) => void;
  addChunk: (chunk: AudioChunk) => void;
  truncateAt: (timestamp: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setAudioLevel: (level: number) => void;
  setWaveformData: (data: number[]) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as RecorderStatus,
  audioBlob: null,
  duration: 0,
  chunks: [],
  currentTime: 0,
  isPlaying: false,
  audioLevel: 0,
  waveformData: [],
  error: null,
};

export const useAudioStore = create<AudioState>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setAudioBlob: (audioBlob) => set({ audioBlob }),
  setDuration: (duration) => set({ duration }),
  addChunk: (chunk) => set((state) => ({ chunks: [...state.chunks, chunk] })),
  truncateAt: (timestamp) =>
    set((state) => ({
      chunks: state.chunks.filter((c) => c.timestamp <= timestamp),
      duration: timestamp / 1000,
    })),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setAudioLevel: (audioLevel) => set({ audioLevel }),
  setWaveformData: (waveformData) => set({ waveformData }),
  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  reset: () => set(initialState),
}));
