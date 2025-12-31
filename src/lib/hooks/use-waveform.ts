'use client';

import { useCallback, useState } from 'react';
import { useAudioStore } from '@/lib/stores/audio-store';

const WAVEFORM_BARS = 100;

export function useWaveform() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { waveformData, setWaveformData } = useAudioStore();

  const analyzeBlob = useCallback(
    async (blob: Blob) => {
      setIsAnalyzing(true);

      try {
        const audioContext = new AudioContext();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const channelData = audioBuffer.getChannelData(0);
        const samplesPerBar = Math.floor(channelData.length / WAVEFORM_BARS);
        const peaks: number[] = [];

        for (let i = 0; i < WAVEFORM_BARS; i++) {
          const start = i * samplesPerBar;
          const end = start + samplesPerBar;

          let max = 0;
          for (let j = start; j < end && j < channelData.length; j++) {
            const abs = Math.abs(channelData[j]);
            if (abs > max) max = abs;
          }

          peaks.push(max);
        }

        const maxPeak = Math.max(...peaks, 0.01);
        const normalizedPeaks = peaks.map((p) => p / maxPeak);

        setWaveformData(normalizedPeaks);
        await audioContext.close();
      } catch (error) {
        console.error('Waveform analysis failed:', error);
        setWaveformData([]);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setWaveformData]
  );

  return {
    waveformData,
    isAnalyzing,
    analyzeBlob,
  };
}
