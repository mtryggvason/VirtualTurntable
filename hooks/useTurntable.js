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

const useTurntable = (url) => {
  const { basePath } = useRouter();
  const nodeRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let node = null;
    setReady(false);
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

  return { ready, start, setRate };
};

export default useTurntable;
