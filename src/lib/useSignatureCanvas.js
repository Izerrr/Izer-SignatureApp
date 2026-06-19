import { useRef, useCallback, useEffect, useState } from "react";

// Internal drawing resolution — deliberately small to keep exported video tiny.
// Scaled up visually via CSS, drawn at native res for crisp lines + small file size.
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

const STROKE_COLOR = "#0A0A0C";
const STROKE_WIDTH = 3;

/**
 * Encapsulates all canvas signature logic:
 * - smooth pointer-driven drawing via requestAnimationFrame
 * - stroke-level undo stack (not pixel diffing, so it's cheap)
 * - background toggle (paper white vs chroma key green)
 * - lightweight MediaRecorder-based video export
 */
export function useSignatureCanvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const rafRef = useRef(null);

  // Pointer state lives in refs, not React state, so drawing never triggers re-renders.
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const pendingPointRef = useRef(null);

  // Strokes are stored as arrays of points so we can redraw on undo/background-toggle.
  const strokesRef = useRef([]); // committed strokes
  const currentStrokeRef = useRef([]);

  const [hasInk, setHasInk] = useState(false);
  const [background, setBackground] = useState("white"); // 'white' | 'chroma'
  const [canUndo, setCanUndo] = useState(false);

  const bgColor = background === "white" ? "#FFFFFF" : "#00FF00";

  const getCtx = useCallback(() => {
    if (!ctxRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d", { alpha: false });
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = STROKE_WIDTH;
      ctx.strokeStyle = STROKE_COLOR;
      ctx.imageSmoothingEnabled = true;
      ctxRef.current = ctx;
    }
    return ctxRef.current;
  }, []);

  const clearToBackground = useCallback(
    (ctx) => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    },
    [bgColor]
  );

  // Redraw every committed stroke from scratch (cheap: signatures are short-lived).
  const redrawAll = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    clearToBackground(ctx);
    for (const stroke of strokesRef.current) {
      drawStrokePath(ctx, stroke);
    }
  }, [getCtx, clearToBackground]);

  function drawStrokePath(ctx, points) {
    if (points.length < 2) {
      if (points.length === 1) {
        // single tap = dot
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, STROKE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fillStyle = STROKE_COLOR;
        ctx.fill();
      }
      return;
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      // Quadratic smoothing between midpoints for anti-aliased, fluid strokes
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    ctx.stroke();
  }

  // Init canvas with background once mounted
  useEffect(() => {
    const ctx = getCtx();
    if (ctx) clearToBackground(ctx);
  }, [getCtx, clearToBackground]);

  // Re-render when background toggles
  useEffect(() => {
    redrawAll();
  }, [background, redrawAll]);

  const getPointFromEvent = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // rAF loop: drains the latest pointer position and draws incrementally.
  // This decouples drawing from the (potentially high-frequency) pointer event rate.
  const tick = useCallback(() => {
    const ctx = getCtx();
    const pending = pendingPointRef.current;
    if (ctx && pending && lastPointRef.current) {
      const last = lastPointRef.current;
      const midX = (last.x + pending.x) / 2;
      const midY = (last.y + pending.y) / 2;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.quadraticCurveTo(last.x, last.y, midX, midY);
      ctx.stroke();
      currentStrokeRef.current.push(pending);
      lastPointRef.current = pending;
      pendingPointRef.current = null;
    }
    if (isDrawingRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [getCtx]);

  const startDraw = useCallback(
    (e) => {
      e.preventDefault();
      const point = getPointFromEvent(e);
      if (!point) return;
      isDrawingRef.current = true;
      lastPointRef.current = point;
      currentStrokeRef.current = [point];
      rafRef.current = requestAnimationFrame(tick);
    },
    [getPointFromEvent, tick]
  );

  const moveDraw = useCallback(
    (e) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const point = getPointFromEvent(e);
      if (point) pendingPointRef.current = point;
    },
    [getPointFromEvent]
  );

  const endDraw = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push(currentStrokeRef.current);
      setHasInk(true);
      setCanUndo(true);
    }
    currentStrokeRef.current = [];
    lastPointRef.current = null;
    pendingPointRef.current = null;
  }, []);

  const undo = useCallback(() => {
    strokesRef.current.pop();
    setCanUndo(strokesRef.current.length > 0);
    setHasInk(strokesRef.current.length > 0);
    redrawAll();
  }, [redrawAll]);

  const clear = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    setHasInk(false);
    setCanUndo(false);
    redrawAll();
  }, [redrawAll]);

  const toggleBackground = useCallback(() => {
    setBackground((b) => (b === "white" ? "chroma" : "white"));
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    canvasRef,
    hasInk,
    canUndo,
    background,
    bgColor,
    undo,
    clear,
    toggleBackground,
    startDraw,
    moveDraw,
    endDraw,
  };
}

/**
 * Records a fixed-duration clip of the canvas as a lightweight WebM video.
 * - 24fps capture, 400kbps bitrate target → keeps files well under 1MB for short clips
 * - Hard-capped duration prevents runaway recordings
 */
export function recordCanvasAsVideo(canvas, { fps = 24, maxDurationMs = 8000, bitsPerSecond = 400000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!canvas || typeof canvas.captureStream !== "function") {
      reject(new Error("captureStream tidak didukung di browser ini."));
      return;
    }

    const stream = canvas.captureStream(fps);
    const mimeCandidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";

    let recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitsPerSecond });
    } catch (err) {
      reject(err);
      return;
    }

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e) => reject(e.error || new Error("Recording error"));
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.start();
    setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, maxDurationMs);
  });
}
