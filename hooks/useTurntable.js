import { useState, useEffect, useRef, useCallback } from "react";

// Runs on the audio thread. A single read head moves through the buffer at a
// signed rate (negative = reverse), so speed and direction changes never
// restart playback. The rate is smoothed per sample to avoid zipper noise from
// the ~60Hz gyro updates, and gain fades in/out near standstill instead of
// hard-muting.
const WORKLET_SOURCE = `
const RATE_SMOOTHING_SECONDS = 0.05;
const SILENT_BELOW = 0.03;
const FULL_VOLUME_ABOVE = 0.12;

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
    this.smoothing = 1 - Math.exp(-1 / (RATE_SMOOTHING_SECONDS * sampleRate));
    this.port.onmessage = (e) => {
      this.channels = e.data.channels;
      this.length = this.channels[0].length;
      this.position = 0;
    };
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
      const gain = t * t * (3 - 2 * t);
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
    return true;
  }
}

registerProcessor("turntable", TurntableProcessor);
`;

// One shared context: iOS limits how many can exist at once
let context = null;
let workletLoaded = null;

const getContext = () => {
  if (!context) {
    context = new AudioContext({ latencyHint: "interactive" });
    const workletUrl = URL.createObjectURL(
      new Blob([WORKLET_SOURCE], { type: "application/javascript" })
    );
    workletLoaded = context.audioWorklet.addModule(workletUrl);
  }
  return context;
};

// 45 rpm = 270°/s is normal speed; clockwise rotation (negative gamma) plays
// forward, counter-clockwise plays in reverse
export const rotationToRate = (gamma) => -(gamma || 0) / 270;

const useTurntable = (url) => {
  const nodeRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let node = null;
    setReady(false);
    const ctx = getContext();

    (async () => {
      try {
        const [audioBuffer] = await Promise.all([
          fetch(url)
            .then((response) => response.arrayBuffer())
            .then((data) => ctx.decodeAudioData(data)),
          workletLoaded,
        ]);
        if (cancelled) return;

        node = new AudioWorkletNode(ctx, "turntable", {
          numberOfInputs: 0,
          outputChannelCount: [2],
        });
        const channels = [];
        for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
          channels.push(audioBuffer.getChannelData(c).slice());
        }
        node.port.postMessage(
          { channels },
          channels.map((channel) => channel.buffer)
        );
        node.connect(ctx.destination);
        nodeRef.current = node;
        setReady(true);
      } catch (error) {
        console.error("Failed to load audio:", error);
      }
    })();

    return () => {
      cancelled = true;
      if (node) node.disconnect();
      nodeRef.current = null;
    };
  }, [url]);

  // Must be called from a user gesture to unlock audio on mobile
  const start = useCallback(() => context && context.resume(), []);

  const setRate = useCallback((rate) => {
    if (nodeRef.current) {
      nodeRef.current.parameters
        .get("rate")
        .setValueAtTime(rate, context.currentTime);
    }
  }, []);

  return { ready, start, setRate };
};

export default useTurntable;
