/**
 * AssemblyAI Real-Time Transcription Types
 *
 * Architecture: Browser WebSocket → AssemblyAI Streaming API
 * Audio Format: PCM16, 16kHz, mono
 */

// ============================================================================
// CONNECTION CONFIGURATION
// ============================================================================

/**
 * WebSocket connection parameters for AssemblyAI streaming API
 * @see https://www.assemblyai.com/docs/speech-to-text/streaming
 */
export interface AssemblyAIConnectionParams {
  /** Audio sample rate in Hz (default: 16000) */
  sample_rate: number;

  /** Enable turn-based formatting for medical dictation */
  format_turns: boolean;

  /** Confidence threshold to end a turn (0-1, default: 0.6) */
  end_of_turn_confidence_threshold: number;

  /** Minimum silence (ms) when confident turn ended (default: 200) */
  min_end_of_turn_silence_when_confident: number;

  /** Maximum silence (ms) before forcing turn end (default: 2600) */
  max_turn_silence: number;

  /** Domain-specific vocabulary for improved accuracy */
  keyterms_prompt: string[];

  /** Language code: 'fr' for French, 'multi' for multilingual */
  language: 'fr' | 'multi' | 'en' | 'es' | 'de' | 'it' | 'pt';
}

/**
 * Full configuration for transcription session
 */
export interface TranscriptionConfig {
  /** AssemblyAI connection parameters */
  connectionParams: AssemblyAIConnectionParams;

  /** Token expiry in seconds (default: 480 = 8 minutes) */
  tokenExpirySeconds: number;

  /** Auto-reconnect on connection loss */
  autoReconnect: boolean;

  /** Maximum reconnection attempts */
  maxReconnectAttempts: number;

  /** Save audio locally for debugging/backup */
  saveAudioLocally: boolean;
}

// ============================================================================
// ASSEMBLYAI WEBSOCKET MESSAGES
// ============================================================================

/**
 * Session initialization message from AssemblyAI
 */
export interface AssemblyAIBeginMessage {
  type: 'Begin';
  /** Unique session identifier */
  id: string;
  /** Unix timestamp when session expires */
  expires_at: number;
}

/**
 * Transcription turn message from AssemblyAI
 */
export interface AssemblyAITurnMessage {
  type: 'Turn';
  /** Transcribed text for this turn */
  transcript: string;
  /** Whether the turn is complete and formatted */
  turn_is_formatted: boolean;
  /** Start time of the turn in audio (seconds) */
  start?: number;
  /** End time of the turn in audio (seconds) */
  end?: number;
  /** Confidence score (0-1) */
  confidence?: number;
  /** Individual words with timestamps */
  words?: TranscriptionWord[];
}

/**
 * Session termination message from AssemblyAI
 */
export interface AssemblyAITerminationMessage {
  type: 'Termination';
  /** Total audio duration processed (seconds) */
  audio_duration_seconds: number;
  /** Total session duration (seconds) */
  session_duration_seconds: number;
}

/**
 * Error message from AssemblyAI
 */
export interface AssemblyAIErrorMessage {
  type: 'Error';
  /** Error code */
  code: string;
  /** Human-readable error description */
  message: string;
}

/**
 * Union type for all AssemblyAI WebSocket messages
 */
export type AssemblyAIMessage =
  | AssemblyAIBeginMessage
  | AssemblyAITurnMessage
  | AssemblyAITerminationMessage
  | AssemblyAIErrorMessage;

/**
 * Client-to-server termination request
 */
export interface AssemblyAITerminateRequest {
  type: 'Terminate';
}

// ============================================================================
// TRANSCRIPTION STATE
// ============================================================================

/**
 * Individual word with timing information
 */
export interface TranscriptionWord {
  /** The transcribed word */
  text: string;
  /** Start time in audio (seconds) */
  start: number;
  /** End time in audio (seconds) */
  end: number;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * A complete transcription turn (utterance)
 */
export interface TranscriptionTurn {
  /** Unique identifier for this turn */
  id: string;
  /** Full transcribed text */
  text: string;
  /** Whether this is the final version */
  isFinal: boolean;
  /** Start time in session (seconds) */
  startTime: number;
  /** End time in session (seconds) */
  endTime?: number;
  /** Confidence score (0-1) */
  confidence?: number;
  /** Individual words with timestamps */
  words?: TranscriptionWord[];
  /** Timestamp when received */
  timestamp: Date;
}

/**
 * Connection status for the transcription service
 */
export type TranscriptionConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/**
 * Recording status for audio capture
 */
export type RecordingStatus =
  | 'idle'
  | 'requesting_permission'
  | 'ready'
  | 'recording'
  | 'paused'
  | 'error';

/**
 * Complete transcription session state
 */
export interface TranscriptionState {
  /** Current connection status */
  connectionStatus: TranscriptionConnectionStatus;

  /** Current recording status */
  recordingStatus: RecordingStatus;

  /** Active session ID from AssemblyAI */
  sessionId: string | null;

  /** Session expiry timestamp */
  expiresAt: Date | null;

  /** All transcription turns in this session */
  turns: TranscriptionTurn[];

  /** Current partial (unfinished) transcription */
  partialTranscript: string;

  /** Full combined transcript */
  fullTranscript: string;

  /** Total audio duration recorded (seconds) */
  audioDuration: number;

  /** Session start time */
  sessionStartTime: Date | null;

  /** Last error if any */
  error: TranscriptionError | null;

  /** Audio level (0-1) for UI visualization */
  audioLevel: number;
}

/**
 * Transcription error with context
 */
export interface TranscriptionError {
  /** Error code for programmatic handling */
  code: TranscriptionErrorCode;
  /** Human-readable message (French) */
  message: string;
  /** Original error if available */
  originalError?: Error;
  /** Timestamp of error */
  timestamp: Date;
}

/**
 * Error codes for transcription failures
 */
export type TranscriptionErrorCode =
  | 'MICROPHONE_PERMISSION_DENIED'
  | 'MICROPHONE_NOT_FOUND'
  | 'AUDIO_CONTEXT_ERROR'
  | 'WEBSOCKET_CONNECTION_FAILED'
  | 'WEBSOCKET_CLOSED_UNEXPECTEDLY'
  | 'TOKEN_GENERATION_FAILED'
  | 'TOKEN_EXPIRED'
  | 'ASSEMBLYAI_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Response from /api/transcription/token
 */
export interface TokenResponse {
  /** Temporary authentication token */
  token: string;
  /** WebSocket endpoint URL with parameters */
  websocketUrl: string;
  /** Token expiry timestamp (ISO string) */
  expiresAt: string;
}

/**
 * Error response from API
 */
export interface TokenErrorResponse {
  error: string;
  code?: TranscriptionErrorCode;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Audio capture hook return type
 */
export interface UseAudioCaptureReturn {
  /** Start capturing audio from microphone */
  startCapture: () => Promise<void>;
  /** Stop capturing audio */
  stopCapture: () => void;
  /** Pause audio capture (keeps stream open) */
  pauseCapture: () => void;
  /** Resume paused capture */
  resumeCapture: () => void;
  /** Current recording status */
  status: RecordingStatus;
  /** Current audio level (0-1) */
  audioLevel: number;
  /** Error if any */
  error: TranscriptionError | null;
  /** Whether microphone permission is granted */
  hasPermission: boolean | null;
}

/**
 * WebSocket hook return type
 */
export interface UseAssemblyAIWebSocketReturn {
  /** Connect to AssemblyAI */
  connect: (websocketUrl: string, token: string) => void;
  /** Disconnect from AssemblyAI */
  disconnect: () => void;
  /** Send audio data */
  sendAudio: (audioData: ArrayBuffer) => void;
  /** Current connection status */
  status: TranscriptionConnectionStatus;
  /** Session ID if connected */
  sessionId: string | null;
  /** Error if any */
  error: TranscriptionError | null;
}

/**
 * Main transcription hook return type
 */
export interface UseTranscriptionReturn {
  /** Start transcription session */
  start: () => Promise<void>;
  /** Stop transcription session */
  stop: () => void;
  /** Pause transcription (keeps connection) */
  pause: () => void;
  /** Resume paused transcription */
  resume: () => void;
  /** Clear all transcription data */
  clear: () => void;

  /** Current partial transcript (being spoken) */
  partialTranscript: string;
  /** All completed turns */
  turns: TranscriptionTurn[];
  /** Full combined transcript */
  fullTranscript: string;

  /** Connection status */
  connectionStatus: TranscriptionConnectionStatus;
  /** Recording status */
  recordingStatus: RecordingStatus;
  /** Whether currently active (recording + connected) */
  isActive: boolean;

  /** Audio level for visualization */
  audioLevel: number;
  /** Session duration in seconds */
  duration: number;

  /** Error if any */
  error: TranscriptionError | null;
}

// ============================================================================
// AUDIO PROCESSING TYPES
// ============================================================================

/**
 * Audio worklet processor message types
 */
export interface AudioWorkletMessage {
  type: 'audio' | 'level' | 'error';
}

export interface AudioWorkletAudioMessage extends AudioWorkletMessage {
  type: 'audio';
  /** PCM16 audio data as Int16Array buffer */
  buffer: ArrayBuffer;
}

export interface AudioWorkletLevelMessage extends AudioWorkletMessage {
  type: 'level';
  /** RMS audio level (0-1) */
  level: number;
}

export interface AudioWorkletErrorMessage extends AudioWorkletMessage {
  type: 'error';
  message: string;
}

/**
 * Recorded audio frame for local storage
 */
export interface AudioFrame {
  /** PCM16 audio data */
  data: Int16Array;
  /** Timestamp when recorded */
  timestamp: number;
}

/**
 * Audio recording session for export
 */
export interface AudioRecording {
  /** All recorded frames */
  frames: AudioFrame[];
  /** Sample rate */
  sampleRate: number;
  /** Number of channels (always 1 for mono) */
  channels: 1;
  /** Total duration in seconds */
  duration: number;
  /** Session start timestamp */
  startTime: Date;
}
