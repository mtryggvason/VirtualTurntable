import { useEffect, useRef } from "react";

// Whole-track waveform below the record. Tapping or dragging it moves the
// read head there; the phone's rotation still sets the speed.
const BAR_WIDTH = 2;
const BAR_GAP = 1;
// Matches --accent and --text in App.css
const PLAYED_COLOR = "#e0623a";
const UNPLAYED_COLOR = "rgba(242, 228, 218, 0.45)";

// Average level in each of `count` equal slices of the track, relative to the
// loudest slice. Averaging rather than taking the maximum keeps the shape of
// heavily compressed tracks, whose peaks are near full scale throughout.
const columnLevels = (peaks, count) => {
  const sums = new Float32Array(count);
  const counts = new Uint32Array(count);
  for (let i = 0; i < peaks.length; i++) {
    const column = Math.floor((i / peaks.length) * count);
    sums[column] += peaks[i];
    counts[column]++;
  }
  const levels = sums.map((sum, column) => sum / (counts[column] || 1));
  const loudest = levels.reduce((max, level) => Math.max(max, level), 0) || 1;
  return levels.map((level) => level / loudest);
};

const WaveformOverview = ({ peaks, duration, getPosition, seek }) => {
  const canvasRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!peaks || !duration) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame;
    let levels = null;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        levels = null;
      }
      const step = (BAR_WIDTH + BAR_GAP) * dpr;
      if (!levels) levels = columnLevels(peaks, Math.floor(width / step));

      const playedTo = (getPosition() / duration) * width;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < levels.length; i++) {
        const x = i * step;
        // Mirrored around the middle, never thinner than one bar width
        const bar = Math.max(BAR_WIDTH * dpr, levels[i] * height);
        ctx.fillStyle = x < playedTo ? PLAYED_COLOR : UNPLAYED_COLOR;
        ctx.fillRect(x, (height - bar) / 2, BAR_WIDTH * dpr, bar);
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [peaks, duration, getPosition]);

  const seekToPointer = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const fraction = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    seek(fraction * duration);
  };

  const onPointerDown = (e) => {
    draggingRef.current = true;
    canvasRef.current.setPointerCapture(e.pointerId);
    seekToPointer(e);
  };
  const onPointerMove = (e) => {
    if (draggingRef.current) seekToPointer(e);
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      className={`waveform-overview ${peaks ? "" : "loading"}`}
      aria-hidden="true"
      onPointerDown={peaks ? onPointerDown : undefined}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
};

export default WaveformOverview;
