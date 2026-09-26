import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawStroke } from '../../types/game';

interface CanvasBoardProps {
  isMyTurn: boolean;
  myColor: string;
  strokes: DrawStroke[];
  onDrawStroke: (stroke: DrawStroke) => void;
  disabled?: boolean;
}

export const CanvasBoard: React.FC<CanvasBoardProps> = ({
  isMyTurn,
  myColor,
  strokes,
  onDrawStroke,
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [lineWidth, setLineWidth] = useState(4);

  // Helper to draw a single stroke on canvas context
  const drawStrokeOnCtx = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawStroke, width: number, height: number) => {
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(stroke.prevX * width, stroke.prevY * height);
    ctx.lineTo(stroke.currX * width, stroke.currY * height);
    ctx.stroke();
  }, []);

  // Redraw complete canvas from stroke history
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Optional faint grid lines for aesthetics
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw all strokes
    strokes.forEach((stroke) => {
      drawStrokeOnCtx(ctx, stroke, canvas.width, canvas.height);
    });
  }, [strokes, drawStrokeOnCtx]);

  // Handle canvas sizing and resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const targetWidth = rect.width;
      const targetHeight = Math.min(Math.max(rect.width * 0.75, 320), 550);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [redrawCanvas]);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [strokes, redrawCanvas]);

  // Get normalized coordinates (0 to 1) from mouse or touch event
  const getNormalizedCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    return {
      x: Math.min(Math.max(x, 0), 1),
      y: Math.min(Math.max(y, 0), 1)
    };
  };

  // Start stroke
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMyTurn || disabled) return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }

    const coords = getNormalizedCoords(e);
    if (!coords) return;

    isDrawingRef.current = true;
    lastPointRef.current = coords;
  };

  // Move stroke
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMyTurn || disabled || !isDrawingRef.current || !lastPointRef.current) return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }

    const coords = getNormalizedCoords(e);
    if (!coords) return;

    const stroke: DrawStroke = {
      prevX: lastPointRef.current.x,
      prevY: lastPointRef.current.y,
      currX: coords.x,
      currY: coords.y,
      color: myColor,
      lineWidth: lineWidth
    };

    // Draw locally immediately for zero latency feel
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawStrokeOnCtx(ctx, stroke, canvas.width, canvas.height);
      }
    }

    // Broadcast stroke
    onDrawStroke(stroke);
    lastPointRef.current = coords;
  };

  // Stop stroke
  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <div className="w-full flex flex-col items-center space-y-3">
      {/* Canvas Container */}
      <div
        className={`w-full relative rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-300 ${
          isMyTurn && !disabled
            ? 'border-indigo-500 shadow-indigo-500/30 ring-4 ring-indigo-500/20'
            : 'border-slate-700/60 shadow-black/60'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
          className={`w-full block touch-none select-none bg-white ${
            isMyTurn && !disabled ? 'cursor-crosshair' : 'cursor-not-allowed'
          }`}
        />

        {/* Turn Status Overlay Badge */}
        <div className="absolute top-3 right-3 pointer-events-none flex items-center gap-2">
          {isMyTurn && !disabled ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/90 text-white text-xs font-black shadow-lg backdrop-blur-md animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>دورك في الرسم الآن! (ارسم خطاً واحداً معبراً)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-slate-300 text-xs font-bold backdrop-blur-md">
              <span>لوحة الرسم المشتركة</span>
            </div>
          )}
        </div>
      </div>

      {/* Brush tools (When it's player's turn) */}
      {isMyTurn && !disabled && (
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">لونك المخصص:</span>
            <div
              className="w-6 h-6 rounded-full ring-2 ring-white/30 shadow-md"
              style={{ backgroundColor: myColor }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">سمك الخط:</span>
            {[3, 6, 10].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setLineWidth(size)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  lineWidth === size
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: size, height: size }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
