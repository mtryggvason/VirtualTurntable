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

const WaveformRing = ({ peaks, getPosition }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!peaks) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame;

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

      const head = getPosition() / SECONDS_PER_BAR;
      const current = Math.floor(head);
      const half = BARS_PER_TURN / 2;
      for (let offset = -half; offset < half; offset++) {
        const bar = current + offset;
        const level = peaks[((bar % peaks.length) + peaks.length) % peaks.length];
        const length = Math.max(ctx.lineWidth, level * band);
        const angle = angleOf(bar, head);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        // Fade towards the far side of the ring; dim what has already played
        const fade = 1 - Math.abs(offset) / half;
        const alpha = (offset < 0 ? 0.35 : 1) * (0.15 + 0.85 * fade);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(center + cos * inner, center + sin * inner);
        ctx.lineTo(center + cos * (inner + length), center + sin * (inner + length));
        ctx.stroke();
      }

      const needle = NEEDLE_ANGLE;
      ctx.strokeStyle = NEEDLE_COLOR;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(center + Math.cos(needle) * (inner - 6 * dpr), center + Math.sin(needle) * (inner - 6 * dpr));
      ctx.lineTo(center + Math.cos(needle) * center, center + Math.sin(needle) * center);
      ctx.stroke();

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [peaks, getPosition]);

  return <canvas ref={canvasRef} className="waveform-ring" aria-hidden="true" />;
};

export default WaveformRing;
