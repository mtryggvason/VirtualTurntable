/* global AudioWorkletProcessor, registerProcessor, sampleRate */
// Runs on the audio thread. A single read head moves through the buffer at a
// signed rate (negative = reverse), so speed and direction changes never
// restart playback. The rate is smoothed per sample to avoid zipper noise from
// the ~60Hz gyro updates, and gain fades in/out near standstill instead of
// hard-muting.
const RATE_SMOOTHING_SECONDS = 0.05;
const SILENT_BELOW = 0.03;
const FULL_VOLUME_ABOVE = 0.12;
// Seeks fade out, jump, then fade back in over this long each way, so the
// jump doesn't click
const SEEK_FADE_SECONDS = 0.005;

class TurntableProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: "rate", defaultValue: 0, automationRate: "k-rate" }];
  }

  constructor() {
    super();
    this.channels = null;
    this.length = 0;
    this.position = 0;
    this.rate = 0;
    this.blocks = 0;
    this.smoothing = 1 - Math.exp(-1 / (RATE_SMOOTHING_SECONDS * sampleRate));
    this.fadeSamples = Math.round(SEEK_FADE_SECONDS * sampleRate);
    // Pending seek target in samples, and progress through its fade (counts
    // down to -fadeSamples: positive is fading out, negative fading back in)
    this.seekTo = null;
    this.seekFade = 0;
    this.port.onmessage = (e) => {
      if (e.data.channels) {
        this.channels = e.data.channels;
        this.length = this.channels[0].length;
        this.position = 0;
      } else if (e.data.seek !== undefined) {
        this.seekTo = e.data.seek;
        // Fade out from wherever an earlier seek's fade-in has got to
        if (this.seekFade === 0) this.seekFade = this.fadeSamples;
        else if (this.seekFade < 0) {
          this.seekFade = Math.max(this.seekFade + this.fadeSamples, 1);
        }
      }
    };
  }

  // Gain for the seek fade, jumping the read head at its silent midpoint
  seekGain() {
    if (this.seekFade === 0) return 1;
    if (this.seekFade > 0) {
      this.seekFade--;
      if (this.seekFade === 0) {
        this.position = Math.min(Math.max(this.seekTo, 0), this.length - 1);
        this.seekTo = null;
        this.seekFade = -this.fadeSamples;
      }
      return this.seekFade > 0 ? this.seekFade / this.fadeSamples : 0;
    }
    this.seekFade++;
    return 1 + this.seekFade / this.fadeSamples;
  }

  // 4-point Hermite interpolation, wrapping around the loop point
  read(samples, index, frac) {
    const length = this.length;
    const x0 = samples[(index - 1 + length) % length];
    const x1 = samples[index];
    const x2 = samples[(index + 1) % length];
    const x3 = samples[(index + 2) % length];
    const c1 = 0.5 * (x2 - x0);
    const c2 = x0 - 2.5 * x1 + 2 * x2 - 0.5 * x3;
    const c3 = 0.5 * (x3 - x0) + 1.5 * (x1 - x2);
    return ((c3 * frac + c2) * frac + c1) * frac + x1;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    if (!this.channels) {
      return true;
    }
    const target = parameters.rate[0];
    const lastChannel = this.channels.length - 1;
    for (let i = 0; i < output[0].length; i++) {
      this.rate += (target - this.rate) * this.smoothing;
      const speed = Math.abs(this.rate);
      const t = Math.min(
        Math.max((speed - SILENT_BELOW) / (FULL_VOLUME_ABOVE - SILENT_BELOW), 0),
        1
      );
      const gain = t * t * (3 - 2 * t) * this.seekGain();
      const index = Math.floor(this.position);
      const frac = this.position - index;
      for (let c = 0; c < output.length; c++) {
        const samples = this.channels[Math.min(c, lastChannel)];
        output[c][i] = gain === 0 ? 0 : this.read(samples, index, frac) * gain;
      }
      this.position += this.rate;
      if (this.position >= this.length) {
        this.position -= this.length;
      } else if (this.position < 0) {
        this.position += this.length;
      }
    }
    // Report the read head to the main thread (~40Hz) for the waveform display
    this.blocks++;
    if (this.blocks % 8 === 0) {
      this.port.postMessage({ position: this.position, rate: this.rate });
    }
    return true;
  }
}

registerProcessor("turntable", TurntableProcessor);
