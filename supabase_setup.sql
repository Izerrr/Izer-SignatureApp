-- ════════════════════════════════════════════════════════════
-- Signature-to-Video — Supabase Setup
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ════════════════════════════════════════════════════════════

-- 1. Table for submission metadata
create table if not exists public.signature_logs (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  kelas text not null,
  video_url text not null,
  created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.signature_logs enable row level security;

-- 3. Allow anyone (anon key) to INSERT a new signature row
create policy "anon can insert signatures"
  on public.signature_logs
  for insert
  to anon
  with check (true);

-- 4. Allow anyone to SELECT rows (needed for the admin dashboard to read them,
--    since the dashboard auth is client-side only in this lightweight setup).
--    For stricter security, remove this and instead read via a server-side
--    function / Supabase Edge Function gated by a real auth check.
create policy "anon can read signatures"
  on public.signature_logs
  for select
  to anon
  using (true);

-- ════════════════════════════════════════════════════════════
-- 5. Storage bucket — create via Dashboard → Storage → New bucket
--    Name: signatures
--    Public: ON  (so video_url / getPublicUrl works without extra signing)
-- ════════════════════════════════════════════════════════════

-- Storage policies (run after creating the bucket):
create policy "anon can upload to signatures bucket"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'signatures');

create policy "anon can read signatures bucket"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'signatures');

-- ════════════════════════════════════════════════════════════
-- NOTE on security:
-- This setup intentionally keeps writes/reads open to the anon key so the
-- app works with zero backend cost. The admin dashboard's password check
-- is client-side only (sessionStorage), which is fine for a low-stakes
-- internal tool but is NOT real auth. If submissions ever contain sensitive
-- data, swap to Supabase Auth + stricter RLS scoped to authenticated users.
-- ════════════════════════════════════════════════════════════
