# Tanda Tangan Digital — Signature-to-Video

Aplikasi web ultra-ringan untuk menandatangani secara digital dan langsung menghasilkan video pendek (≤8 detik, biasanya <1MB), tersimpan di Supabase. 100% gratis untuk dijalankan: frontend statis + backend serverless.

## Stack

| Layer | Teknologi |
|---|---|
| Frontend | React + Vite + Tailwind CSS + lucide-react |
| Drawing | Native HTML5 Canvas, rAF-driven |
| Video | `canvas.captureStream()` + `MediaRecorder` (WebM, 24fps, 400kbps) |
| Storage/DB | Supabase Storage + Postgres |
| Hosting | GitHub Pages / Vercel (frontend), Supabase (backend) — both free tier |

## Struktur Proyek

```
signature-app/
├── src/
│   ├── components/
│   │   ├── FloatingInput.jsx       # input dengan floating label
│   │   ├── SignatureCanvas.jsx     # canvas + bottom control pill
│   │   └── StatusOverlays.jsx      # loading / success / error states
│   ├── pages/
│   │   ├── SignaturePage.jsx       # halaman utama tanda tangan
│   │   └── AdminPage.jsx           # dashboard editor (/#/admin)
│   ├── lib/
│   │   ├── supabaseClient.js       # ⚠️ isi URL & anon key di sini
│   │   ├── useSignatureCanvas.js   # logic canvas + perekaman video
│   │   └── signatureApi.js         # upload & fetch dari Supabase
│   ├── main.jsx
│   └── index.css
├── supabase_setup.sql              # jalankan di Supabase SQL Editor
├── vite.config.js
└── tailwind.config.js
```

## 1. Setup Supabase (gratis)

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** → tempel isi `supabase_setup.sql` → Run.
3. Buka **Storage** → buat bucket baru bernama `signatures`, set **Public: ON**.
4. Buka **Project Settings → API** → salin **Project URL** dan **anon public key**.
5. Tempel keduanya ke `src/lib/supabaseClient.js`:

```js
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGci...";
```

## 2. Jalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` untuk halaman tanda tangan, dan `http://localhost:5173/#/admin` untuk dashboard editor.

**Password admin default:** `ganti-password-ini` — ganti ini di `src/pages/AdminPage.jsx` (`ADMIN_PASSWORD`) sebelum deploy.

## 3. Deploy gratis

### Opsi A — Vercel (disarankan, paling simpel)
```bash
npm i -g vercel
vercel
```
Vercel otomatis mendeteksi Vite. Tidak perlu setting tambahan.

### Opsi B — GitHub Pages
1. Di `vite.config.js`, set `base: "/nama-repo-kamu/"`.
2. Build & deploy:
```bash
npm run build
npx gh-pages -d dist
```
(install `gh-pages` dulu: `npm i -D gh-pages`)

Karena routing memakai `HashRouter`, tidak perlu konfigurasi rewrite khusus di GitHub Pages — URL akan berbentuk `namasitus.github.io/repo/#/admin`.

## Catatan performa & desain

- **Resolusi canvas internal:** 800×450, di-scale responsif lewat CSS — menjaga ukuran video tetap kecil tanpa mengorbankan ketajaman di layar.
- **Drawing loop:** posisi pointer disimpan di `ref` (bukan state), digambar lewat `requestAnimationFrame` — tidak ada re-render React saat menggambar, jadi tetap mulus di HP kelas menengah.
- **Video constraint:** 24fps, bitrate 400kbps, durasi maksimum 8 detik → file biasanya 200–800KB.
- **Bundle:** tanpa UI framework berat. Total JS gzipped ~114KB (sebagian besar adalah `@supabase/supabase-js` itu sendiri).

## Catatan keamanan

Setup ini memakai Row Level Security yang terbuka untuk `anon` key (insert + select), supaya berjalan tanpa server tambahan. Password dashboard admin hanya dicek di sisi client (`sessionStorage`) — cukup untuk kebutuhan internal/sekolah, tapi bukan autentikasi sungguhan. Jika data yang dikumpulkan sensitif, pertimbangkan migrasi ke Supabase Auth dengan RLS yang lebih ketat.
