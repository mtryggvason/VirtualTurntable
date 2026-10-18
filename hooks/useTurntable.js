import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";

// Audio-thread engine, see public/turntable-processor.js
const PROCESSOR_PATH = "/turntable-processor.js";

// One shared context: iOS limits how many can exist at once
let context = null;
let workletLoaded = null;

const getContext = (basePath) => {
  if (!context) {
    context = new AudioContext({ latencyHint: "interactive" });
    workletLoaded = context.audioWorklet.addModule(basePath + PROCESSOR_PATH);
  }
  return context;
};

// 45 rpm = 270°/s is normal speed; clockwise rotation (negative gamma) plays
// forward, counter-clockwise plays in reverse
export const rotationToRate = (gamma) => -(gamma || 0) / 270;

// One full turn of the phone at normal speed covers this much audio (45 rpm)
export const SECONDS_PER_TURN = 360 / 270;
// Waveform resolution: bars drawn per turn of the ring
export const BARS_PER_TURN = 180;
export const SECONDS_PER_BAR = SECONDS_PER_TURN / BARS_PER_TURN;

// Peak level per bar across all channels, normalised to 0..1
const computePeaks = (audioBuffer) => {
  const samplesPerBar = Math.round(SECONDS_PER_BAR * audioBuffer.sampleRate);
  const peaks = new Float32Array(Math.ceil(audioBuffer.length / samplesPerBar));
  for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
    const samples = audioBuffer.getChannelData(c);
    for (let i = 0; i < samples.length; i++) {
      const level = Math.abs(samples[i]);
      const bar = Math.floor(i / samplesPerBar);
      if (level > peaks[bar]) peaks[bar] = level;
    }
  }
  const loudest = peaks.reduce((max, level) => Math.max(max, level), 0) || 1;
  return peaks.map((level) => level / loudest);
};

const useTurntable = (url) => {
  const { basePath } = useRouter();
  const nodeRef = useRef(null);
  // Last read-head report from the audio thread, in samples
  const headRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [peaks, setPeaks] = useState(null);
  // Track length in seconds, once loaded
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let node = null;
    setReady(false);
    setPeaks(null);
    setDuration(null);
    headRef.current = null;
    const ctx = getContext(basePath);

    (async () => {
      try {
        const [audioBuffer] = await Promise.all([
          fetch(url)
            .then((response) => response.arrayBuffer())
            .then((data) => ctx.decodeAudioData(data)),
          workletLoaded,
        ]);
        if (cancelled) return;

        setPeaks(computePeaks(audioBuffer));
        setDuration(audioBuffer.duration);
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
        const { length, sampleRate } = audioBuffer;
        // Known start position, so seeking works before the audio has started
        headRef.current = { position: 0, rate: 0, length, sampleRate, at: performance.now() };
        node.port.onmessage = (e) => {
          headRef.current = { ...e.data, length, sampleRate, at: performance.now() };
        };
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
      headRef.current = null;
    };
  }, [url, basePath]);

  // Must be called from a user gesture to unlock audio on mobile
  const start = useCallback(() => context && context.resume(), []);

  const setRate = useCallback((rate) => {
    if (nodeRef.current) {
      nodeRef.current.parameters
        .get("rate")
        .setValueAtTime(rate, context.currentTime);
    }
  }, []);

  // Jump the read head to a point in the track; the rotation still sets the
  // speed, so nothing plays until the phone is turning
  const seek = useCallback((seconds) => {
    const node = nodeRef.current;
    const head = headRef.current;
    if (!node || !head) return;
    const position = Math.min(Math.max(seconds, 0), head.length / head.sampleRate) * head.sampleRate;
    node.port.postMessage({ seek: position });
    // Move the display now rather than on the audio thread's next report
    headRef.current = { ...head, position, at: performance.now() };
  }, []);

  // Current play position in seconds, extrapolated between the audio thread's
  // ~40Hz reports so the display moves smoothly at the screen's frame rate
  const getPosition = useCallback(() => {
    const head = headRef.current;
    if (!head) return 0;
    const elapsed = (performance.now() - head.at) / 1000;
    const samples = head.position + head.rate * head.sampleRate * elapsed;
    const wrapped = ((samples % head.length) + head.length) % head.length;
    return wrapped / head.sampleRate;
  }, []);

  return { ready, start, setRate, peaks, duration, getPosition, seek };
};

export default useTurntable;
