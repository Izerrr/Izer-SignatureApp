export function LoadingOverlay({ label = "Mengunggah…" }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper/90 backdrop-blur-sm animate-fade-up">
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 40 40" className="w-10 h-10 animate-[spin_0.9s_linear_infinite]">
          <circle cx="20" cy="20" r="17" fill="none" stroke="#E8E6E1" strokeWidth="3" />
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke="#4A5D4E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="80"
            strokeDashoffset="55"
          />
        </svg>
      </div>
      <p className="mt-4 text-[13px] tracking-wide text-muted font-mono">{label}</p>
    </div>
  );
}

export function SuccessOverlay({ nama, onReset }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper animate-fade-up px-6">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="27" stroke="#4A5D4E" strokeWidth="1.5" />
        <path
          d="M17 29L24.5 36.5L39 20"
          stroke="#4A5D4E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="48"
          strokeDashoffset="48"
          className="animate-check-draw"
        />
      </svg>
      <h2 className="mt-6 font-display italic text-3xl text-ink text-center">
        Terkirim
      </h2>
      <p className="mt-2 text-[14px] text-muted text-center">
        Terima kasih{nama ? `, ${nama}` : ""}. Tanda tanganmu telah tersimpan.
      </p>
      <button
        onClick={onReset}
        className="mt-8 text-[13px] font-medium text-moss hover:text-moss-dark transition-colors duration-150 border-b border-moss/40 hover:border-moss-dark pb-0.5"
      >
        Tanda tangani lagi
      </button>
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[90%] animate-fade-up">
      <div className="flex items-center gap-3 bg-ink text-paper text-[13px] px-4 py-3 rounded-lg shadow-paper">
        <span>{message}</span>
        <button onClick={onDismiss} className="text-paper/60 hover:text-paper transition-colors">
          ✕
        </button>
      </div>
    </div>
  );
}
