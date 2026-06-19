import { useState, useCallback, useRef } from "react";
import { PenLine, Video, Square } from "lucide-react";
import FloatingInput from "../components/FloatingInput.jsx";
import SignatureCanvas from "../components/SignatureCanvas.jsx";
import { LoadingOverlay, SuccessOverlay, ErrorBanner } from "../components/StatusOverlays.jsx";
import { useSignatureCanvas, recordCanvasAsVideo } from "../lib/useSignatureCanvas.js";
import { submitSignature } from "../lib/signatureApi.js";

const MAX_RECORD_MS = 8000;

export default function SignaturePage() {
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [phase, setPhase] = useState("form"); // form | recording | uploading | success
  const [error, setError] = useState(null);
  const [recordProgress, setRecordProgress] = useState(0);

  const sig = useSignatureCanvas();
  const recordTimerRef = useRef(null);
  const recordStartRef = useRef(0);

  const canSubmit = nama.trim().length > 0 && kelas.trim().length > 0 && sig.hasInk && phase === "form";

  const tickProgress = useCallback(() => {
    const elapsed = Date.now() - recordStartRef.current;
    setRecordProgress(Math.min(1, elapsed / MAX_RECORD_MS));
    if (elapsed < MAX_RECORD_MS) {
      recordTimerRef.current = requestAnimationFrame(tickProgress);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setError(null);
    setPhase("recording");
    recordStartRef.current = Date.now();
    recordTimerRef.current = requestAnimationFrame(tickProgress);

    try {
      // Disederhanakan: langsung kirim canvas, strokes, dan object konfigurasi saja
      const blob = await recordCanvasAsVideo(sig.canvasRef.current, sig.getStrokes(), {
        fps: 24,
        maxDurationMs: MAX_RECORD_MS,
        bitsPerSecond: 400000,
      });

      cancelAnimationFrame(recordTimerRef.current);
      setPhase("uploading");
      await submitSignature({ nama: nama.trim(), kelas: kelas.trim(), blob });
      setPhase("success");
    } catch (err) {
      cancelAnimationFrame(recordTimerRef.current);
      setError(err.message || "Terjadi kesalahan. Coba lagi.");
      setPhase("form");
    }
  }, [canSubmit, sig.canvasRef, sig.getStrokes, nama, kelas, tickProgress]);

  const handleReset = useCallback(() => {
    setNama("");
    setKelas("");
    sig.clear();
    setPhase("form");
    setRecordProgress(0);
  }, [sig]);

  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-10 sm:py-16">
      <header className="w-full max-w-md mb-8 sm:mb-10">
        <div className="flex items-center gap-2 text-muted mb-3">
          <PenLine size={14} strokeWidth={1.75} />
          <span className="text-[11px] font-mono tracking-[0.15em] uppercase">Tanda Tangan Digital</span>
        </div>
        <h1 className="font-display italic text-[2.5rem] sm:text-5xl leading-[1.05] text-ink">
          Satu goresan,
          <br />
          satu video.
        </h1>
      </header>

      <main className="w-full max-w-md flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-6">
          <FloatingInput label="Nama" name="nama" value={nama} onChange={setNama} />
          <FloatingInput label="Kelas" name="kelas" value={kelas} onChange={setKelas} />
        </div>

        <SignatureCanvas sig={sig} />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`group relative w-full flex items-center justify-center gap-2.5 rounded-full py-4 text-[14px] font-medium
            transition-all duration-200 overflow-hidden
            ${canSubmit ? "bg-ink text-paper hover:bg-slate active:scale-[0.98]" : "bg-hairline text-muted/60 cursor-not-allowed"}`}
        >
          {phase === "recording" && <span className="absolute inset-0 bg-moss/90 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${recordProgress})` }} />}
          <span className="relative flex items-center gap-2.5">
            {phase === "recording" ? (
              <>
                <Square size={14} strokeWidth={2} className="animate-pulse" />
                Merekam…
              </>
            ) : (
              <>
                <Video size={15} strokeWidth={1.75} />
                Kirim Tanda Tangan
              </>
            )}
          </span>
        </button>

        <p className="text-center text-[12px] text-muted/70 -mt-3">Video singkat (maks. 8 detik) akan dibuat otomatis dari tanda tanganmu.</p>
      </main>

      {phase === "uploading" && <LoadingOverlay label="Mengunggah video…" />}
      {phase === "success" && <SuccessOverlay nama={nama} onReset={handleReset} />}
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
    </div>
  );
}
