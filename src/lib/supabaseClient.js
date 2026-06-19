import { createClient } from "@supabase/supabase-js";

// ── Fill these in with your Supabase project credentials ──
// Project Settings → API → Project URL / anon public key
const SUPABASE_URL = "https://andbgrcncbzzpopfzajf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5TF-EiuUHg_HH6GXYb87hg_jydePNQ_";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export const STORAGE_BUCKET = "signatures";
export const TABLE_NAME = "signature_logs";
