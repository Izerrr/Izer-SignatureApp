import { Eraser, Undo2, Palette } from "lucide-react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../lib/useSignatureCanvas";

export default function SignatureCanvas({ sig }) {
  const { canvasRef, hasInk, canUndo, background, undo, clear, toggleBackground, startDraw, moveDraw, endDraw } = sig;

  return (
    <div className="w-full">
      <div
        className="relative w-full rounded-xl border border-hairline shadow-paper overflow-hidden bg-white"
        style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full touch-none cursor-crosshair block"
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={endDraw}
        />
        {!hasInk && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-display italic text-2xl text-ink/15 select-none">
              tanda tangan di sini
            </span>
          </div>
        )}
        {background === "chroma" && (
          <span className="absolute top-3 right-3 text-[10px] font-mono tracking-wider text-white/70 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
            CHROMA KEY
          </span>
        )}
      </div>

      {/* Floating control pill */}
      <div className="mt-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-1 bg-slate rounded-full px-1.5 py-1.5 shadow-soft">
          <ControlButton onClick={clear} disabled={!hasInk} label="Hapus">
            <Eraser size={16} strokeWidth={1.75} />
          </ControlButton>
          <Divider />
          <ControlButton onClick={undo} disabled={!canUndo} label="Urungkan">
            <Undo2 size={16} strokeWidth={1.75} />
          </ControlButton>
          <Divider />
          <ControlButton
            onClick={toggleBackground}
            label={background === "white" ? "Latar: Putih" : "Latar: Hijau"}
            active={background === "chroma"}
          >
            <Palette size={16} strokeWidth={1.75} />
          </ControlButton>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-white/10" />;
}

function ControlButton({ children, onClick, disabled, label, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150
        ${disabled ? "text-white/25 cursor-not-allowed" : "text-white/85 hover:text-white hover:bg-white/10 active:scale-90"}
        ${active ? "bg-moss/80 text-white" : ""}`}
    >
      {children}
    </button>
  );
}
