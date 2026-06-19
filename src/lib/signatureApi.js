import { supabase, STORAGE_BUCKET, TABLE_NAME } from "./supabaseClient";

function slugify(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "anon";
}

/**
 * Uploads the recorded video blob to Supabase Storage and writes
 * a matching row to the signature_logs table.
 */
export async function submitSignature({ nama, kelas, blob }) {
  const timestamp = Date.now();
  const filename = `${slugify(kelas)}_${slugify(nama)}_${timestamp}.webm`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, blob, {
      contentType: "video/webm",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Gagal mengunggah video: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
  const videoUrl = publicUrlData?.publicUrl;

  const { error: insertError } = await supabase.from(TABLE_NAME).insert({
    nama,
    kelas,
    video_url: videoUrl,
    created_at: new Date(timestamp).toISOString(),
  });

  if (insertError) {
    throw new Error(`Gagal menyimpan data: ${insertError.message}`);
  }

  return { videoUrl, filename };
}

export async function fetchAllSignatures() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
