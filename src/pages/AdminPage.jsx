import { useState, useEffect, useCallback, useMemo } from "react";
import { Lock, Download, RefreshCw, Search, Inbox } from "lucide-react";
import { fetchAllSignatures } from "../lib/signatureApi.js";

// Simple client-side gate. For real protection, enforce access via Supabase
// Row Level Security policies on the table/bucket rather than relying on this alone.
const ADMIN_PASSWORD = "izerjago";
const SESSION_KEY = "sig_admin_authed";

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");

  return authed ? <Dashboard /> : <PasswordGate onSuccess={() => setAuthed(true)} />;
}

function PasswordGate({ onSuccess }) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onSuccess();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form onSubmit={handleSubmit} className={`w-full max-w-xs flex flex-col items-center gap-5 transition-transform ${shake ? "animate-[shake_0.4s]" : ""}`}>
        <div className="w-10 h-10 rounded-full bg-slate flex items-center justify-center">
          <Lock size={16} strokeWidth={1.75} className="text-paper" />
        </div>
        <h1 className="font-display italic text-2xl text-ink">Akses Editor</h1>
        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Kata sandi"
          className="w-full text-center bg-transparent border-b border-hairline pb-2 text-[15px]
                     text-ink placeholder-muted/50 outline-none focus:border-moss transition-colors duration-200"
        />
        <button type="submit" className="text-[13px] font-medium text-moss hover:text-moss-dark transition-colors border-b border-moss/40 hover:border-moss-dark pb-0.5">
          Masuk
        </button>
      </form>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllSignatures();
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.nama?.toLowerCase().includes(q) || r.kelas?.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <div className="min-h-screen px-5 sm:px-10 py-10">
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted">Editor</span>
          <h1 className="font-display italic text-4xl text-ink mt-1">Daftar Tanda Tangan</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama / kelas…"
              className="pl-8 pr-3 py-2 text-[13px] bg-white border border-hairline rounded-full outline-none focus:border-moss transition-colors w-48"
            />
          </div>
          <button onClick={load} className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition-colors px-3 py-2 rounded-full border border-hairline hover:border-ink/30">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Muat ulang
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {error && <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">{error}</p>}

        {!loading && filtered.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-muted">
            <Inbox size={28} strokeWidth={1.5} />
            <p className="mt-3 text-[14px]">Belum ada tanda tangan masuk.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((row) => (
            <SubmissionCard key={row.id} row={row} />
          ))}
          {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </main>
    </div>
  );
}

function SubmissionCard({ row }) {
  const date = row.created_at ? new Date(row.created_at) : null;
  const formattedDate = date ? date.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const handleDownload = async () => {
    if (!row.video_url) return;
    const res = await fetch(row.video_url);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${row.kelas}_${row.nama}_${row.id}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-hairline rounded-xl overflow-hidden shadow-soft hover:shadow-paper transition-shadow duration-200">
      <div className="bg-ink aspect-video">{row.video_url && <video src={row.video_url} controls preload="metadata" className="w-full h-full object-contain bg-ink" />}</div>
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-ink truncate">{row.nama}</p>
          <p className="text-[12px] text-muted truncate">
            {row.kelas} · <span className="font-mono">{formattedDate}</span>
          </p>
        </div>
        <button
          onClick={handleDownload}
          title="Unduh video"
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-paper border border-hairline text-ink hover:bg-ink hover:text-paper hover:border-ink transition-colors duration-150"
        >
          <Download size={15} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-hairline rounded-xl overflow-hidden animate-pulse">
      <div className="bg-hairline aspect-video" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-2/3 bg-hairline rounded" />
        <div className="h-2.5 w-1/2 bg-hairline rounded" />
      </div>
    </div>
  );
}
