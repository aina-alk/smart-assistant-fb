/**
 * AudioWorklet Processor for Real-Time Audio Capture
 *
 * This processor runs in a separate audio thread and converts
 * raw audio samples to PCM16 format for AssemblyAI streaming.
 *
 * Features:
 * - Downsampling from browser sample rate (usually 44.1kHz/48kHz) to 16kHz
 * - Float32 to Int16 conversion (PCM16)
 * - Real-time audio level calculation for UI visualization
 * - Buffering to reduce message frequency
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor
 */

// Target sample rate for AssemblyAI
const TARGET_SAMPLE_RATE = 16000;

// Buffer size before sending (reduces message frequency)
// 50ms at 16kHz = 800 samples
const BUFFER_SIZE = 800;

// Level update interval (every N samples)
const LEVEL_UPDATE_INTERVAL = 4000; // ~250ms at 16kHz

/**
 * PCM16 Audio Processor
 *
 * Processes audio from the microphone and outputs:
 * - PCM16 audio data in chunks
 * - Real-time audio level for visualization
 */
class PCM16AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // Buffering
    this._buffer = new Int16Array(BUFFER_SIZE);
    this._bufferIndex = 0;

    // Downsampling
    this._inputSampleRate = sampleRate; // Global from AudioWorklet scope
    this._downsampleRatio = this._inputSampleRate / TARGET_SAMPLE_RATE;
    this._sampleAccumulator = 0;

    // Level calculation
    this._levelSampleCount = 0;
    this._levelSum = 0;

    // State
    this._isRecording = true;

    // Listen for messages from main thread
    this.port.onmessage = (event) => {
      if (event.data.type === 'pause') {
        this._isRecording = false;
      } else if (event.data.type === 'resume') {
        this._isRecording = true;
      } else if (event.data.type === 'stop') {
        this._isRecording = false;
        this._flushBuffer();
      }
    };
  }

  /**
   * Process audio samples
   *
   * Called automatically by the audio system with batches of samples.
   *
   * @param {Float32Array[][]} inputs - Input audio buffers
   * @returns {boolean} - true to keep processing
   */
  process(inputs) {
    // Get the first input channel (mono)
    const input = inputs[0];
    if (!input || input.length === 0 || !this._isRecording) {
      return true;
    }

    const inputChannel = input[0];
    if (!inputChannel) {
      return true;
    }

    // Process each sample
    for (let i = 0; i < inputChannel.length; i++) {
      const sample = inputChannel[i];

      // Accumulate for level calculation
      this._levelSum += Math.abs(sample);
      this._levelSampleCount++;

      // Send level update periodically
      if (this._levelSampleCount >= LEVEL_UPDATE_INTERVAL) {
        const rmsLevel = this._levelSum / this._levelSampleCount;
        this.port.postMessage({
          type: 'level',
          level: Math.min(1, rmsLevel * 3), // Amplify for visibility
        });
        this._levelSum = 0;
        this._levelSampleCount = 0;
      }

      // Downsample: only take every Nth sample
      this._sampleAccumulator += 1;
      if (this._sampleAccumulator >= this._downsampleRatio) {
        this._sampleAccumulator -= this._downsampleRatio;

        // Convert Float32 [-1, 1] to Int16 [-32768, 32767]
        const int16Sample = this._floatToInt16(sample);

        // Add to buffer
        this._buffer[this._bufferIndex++] = int16Sample;

        // Send buffer when full
        if (this._bufferIndex >= BUFFER_SIZE) {
          this._sendBuffer();
        }
      }
    }

    return true;
  }

  /**
   * Convert Float32 sample to Int16
   *
   * @param {number} sample - Float32 sample in range [-1, 1]
   * @returns {number} - Int16 sample in range [-32768, 32767]
   */
  _floatToInt16(sample) {
    // Clamp to [-1, 1]
    const clamped = Math.max(-1, Math.min(1, sample));
    // Scale to Int16 range
    return Math.round(clamped * 32767);
  }

  /**
   * Send the current buffer to the main thread
   */
  _sendBuffer() {
    if (this._bufferIndex === 0) return;

    // Create a copy of the buffer to send
    const dataToSend = new Int16Array(this._bufferIndex);
    dataToSend.set(this._buffer.subarray(0, this._bufferIndex));

    // Send as transferable for performance
    this.port.postMessage(
      {
        type: 'audio',
        buffer: dataToSend.buffer,
      },
      [dataToSend.buffer]
    );

    // Reset buffer
    this._buffer = new Int16Array(BUFFER_SIZE);
    this._bufferIndex = 0;
  }

  /**
   * Flush any remaining samples in the buffer
   */
  _flushBuffer() {
    if (this._bufferIndex > 0) {
      this._sendBuffer();
    }
  }
}

// Register the processor
registerProcessor('pcm16-audio-processor', PCM16AudioProcessor);
