/**
 * Types pour l'enregistrement et la lecture audio
 */

/**
 * Statuts de l'enregistreur audio
 */
export type RecorderStatus =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'paused'
  | 'stopped'
  | 'error';

/**
 * Chunk audio avec timestamp pour punch-in
 */
export interface AudioChunk {
  data: Blob;
  timestamp: number;
}

/**
 * Configuration du MediaRecorder
 */
export interface MediaRecorderConfig {
  mimeType: string;
  audioBitsPerSecond: number;
}

/**
 * Contraintes audio pour getUserMedia
 */
export const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: { ideal: 44100 },
  channelCount: { ideal: 1 },
};

/**
 * Retourne la configuration MediaRecorder optimale pour le navigateur
 */
export function getMediaRecorderConfig(): MediaRecorderConfig {
  const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/wav'];

  for (const mimeType of mimeTypes) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType)) {
      return {
        mimeType,
        audioBitsPerSecond: 128000,
      };
    }
  }

  return {
    mimeType: '',
    audioBitsPerSecond: 128000,
  };
}

/**
 * Formate une durée en secondes en MM:SS
 */
export function formatTime(seconds: number): string {
  // Guard against non-finite values (Infinity, NaN)
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
