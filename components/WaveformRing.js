import { useEffect, useRef } from "react";
import { BARS_PER_TURN, SECONDS_PER_BAR } from "../hooks/useTurntable";

// Ring band, as fractions of the canvas radius
const INNER_RADIUS = 0.76;
const OUTER_RADIUS = 0.99;
const BAR_ANGLE = (2 * Math.PI) / BARS_PER_TURN;
const NEEDLE_COLOR = "#f9e412";

// The needle is fixed at the top of the screen and the waveform turns under
// it: playing forward rotates the ring counter-clockwise, so upcoming audio
// arrives from the right. Only the half-turn either side of the needle is
// shown.
const NEEDLE_ANGLE = -Math.PI / 2;
const angleOf = (bar, head) => NEEDLE_ANGLE + (bar - head) * BAR_ANGLE;

// While loading, a placeholder waveform ripples around the full ring
const loadingLevel = (angle, seconds) =>
  0.15 +
  0.25 * (0.5 + 0.5 * Math.sin(angle * 3 - seconds * 4)) +
  0.15 * (0.5 + 0.5 * Math.sin(angle * 7 + seconds * 2.5));
const LOADING_ALPHA = 0.5;

// Once the song is loaded the placeholder morphs into the real waveform
const MORPH_SECONDS = 0.8;
const easeInOut = (t) => t * t * (3 - 2 * t);
const mix = (from, to, t) => from + (to - from) * t;

const WaveformRing = ({ peaks, getPosition }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame;
    const loadedAt = performance.now() / 1000;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.round(canvas.clientWidth * dpr);
      if (canvas.width !== size) {
        canvas.width = size;
        canvas.height = size;
      }
      const center = size / 2;
      const inner = center * INNER_RADIUS;
      const band = center * OUTER_RADIUS - inner;

      ctx.clearRect(0, 0, size, size);
      ctx.lineWidth = Math.max(1, ((2 * Math.PI * inner) / BARS_PER_TURN) * 0.5);
      ctx.lineCap = "round";

      const drawBar = (angle, level) => {
        const length = Math.max(ctx.lineWidth, level * band);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(center + cos * inner, center + sin * inner);
        ctx.lineTo(center + cos * (inner + length), center + sin * (inner + length));
        ctx.stroke();
      };

      const seconds = performance.now() / 1000;
      const morph = peaks
        ? easeInOut(Math.min((seconds - loadedAt) / MORPH_SECONDS, 1))
        : 0;
      const head = peaks ? getPosition() / SECONDS_PER_BAR : 0;
      const current = Math.floor(head);
      const half = BARS_PER_TURN / 2;
      for (let offset = -half; offset < half; offset++) {
        const bar = current + offset;
        const angle = angleOf(bar, head);
        const placeholder = loadingLevel(angle, seconds);
        let level = placeholder;
        let alpha = LOADING_ALPHA;
        if (peaks) {
          // Fade towards the far side of the ring; dim what has already played
          const fade = 1 - Math.abs(offset) / half;
          const played = offset < 0 ? 0.35 : 1;
          level = mix(placeholder, peaks[((bar % peaks.length) + peaks.length) % peaks.length], morph);
          alpha = mix(LOADING_ALPHA, played * (0.15 + 0.85 * fade), morph);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        drawBar(angle, level);
      }

      if (!peaks) {
        frame = requestAnimationFrame(draw);
        return;
      }

      const needle = NEEDLE_ANGLE;
      ctx.globalAlpha = morph;
      ctx.strokeStyle = NEEDLE_COLOR;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(center + Math.cos(needle) * (inner - 6 * dpr), center + Math.sin(needle) * (inner - 6 * dpr));
      ctx.lineTo(center + Math.cos(needle) * center, center + Math.sin(needle) * center);
      ctx.stroke();
      ctx.globalAlpha = 1;

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [peaks, getPosition]);

  return <canvas ref={canvasRef} className="waveform-ring" aria-hidden="true" />;
};

export default WaveformRing;
