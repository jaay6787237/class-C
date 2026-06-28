import { createClient } from "@supabase/supabase-js";
import { Course, Student, MediaItem } from "../types";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * SQL Schema representing the structure in Supabase:
 * 
 * -- 1. Table for class configuration / settings
 * create table if not exists public.sisfo_settings (
 *   id text primary key,
 *   jumlah_anggota integer default 12,
 *   logo_url text,
 *   jadwal jsonb
 * );
 * 
 * -- 2. Table for student profiles
 * create table if not exists public.sisfo_students (
 *   id text primary key,
 *   nama text not null,
 *   foto text,
 *   bio text
 * );
 * 
 * -- 3. Table for class media files
 * create table if not exists public.sisfo_media (
 *   id uuid default gen_random_uuid() primary key,
 *   tipe text not null, -- 'gambar' | 'video'
 *   url text not null,
 *   keterangan text
 * );
 */

export async function fetchSettingsCloud(): Promise<{ jumlah_anggota: number; logo_url: string; jadwal: Course[] } | null> {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from("sisfo_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Table exists but no config row yet, let's return default structure which will trigger seed
        return null;
      }
      throw error;
    }
    
    // Parse jadwal if stored as text string (sqlite style) or keep as jsonb
    let parsedJadwal: Course[] = [];
    if (data.jadwal) {
      parsedJadwal = typeof data.jadwal === "string" ? JSON.parse(data.jadwal) : data.jadwal;
    }

    return {
      jumlah_anggota: data.jumlah_anggota || 12,
      logo_url: data.logo_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop",
      jadwal: parsedJadwal
    };
  } catch (err) {
    console.warn("Supabase fetchSettingsCloud error (tabel mungkin belum dibuat):", err);
    return null;
  }
}

export async function saveSettingsCloud(jumlah: number, logoUrl: string, jadwal: Course[]) {
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient
      .from("sisfo_settings")
      .upsert({
        id: "default",
        jumlah_anggota: jumlah,
        logo_url: logoUrl,
        jadwal: jadwal // Supabase will natively store JSON if table schema has jsonb
      });
    if (error) throw error;
  } catch (err) {
    console.error("Gagal menyimpan settings ke Supabase:", err);
    throw err;
  }
}

export async function fetchStudentsCloud(): Promise<Student[] | null> {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from("sisfo_students")
      .select("*")
      .order("nama", { ascending: true });
    
    if (error) throw error;
    return data as Student[];
  } catch (err) {
    console.warn("Supabase fetchStudentsCloud error:", err);
    return null;
  }
}

export async function saveStudentsCloud(students: Student[]) {
  if (!supabaseClient) return;
  try {
    // Standard approach: To synchronize with high simplicity in one click:
    // First clear stale records, then insert current ones
    const { error: deleteError } = await supabaseClient
      .from("sisfo_students")
      .delete()
      .neq("nama", ""); // delete all
    
    if (deleteError) throw deleteError;

    if (students.length > 0) {
      const sanitized = students.map((s, idx) => ({
        id: s.id || String(idx + 1),
        nama: s.nama || "",
        foto: s.foto || "",
        bio: s.bio || ""
      }));
      const { error: insertError } = await supabaseClient
        .from("sisfo_students")
        .insert(sanitized);
      
      if (insertError) throw insertError;
    }
  } catch (err) {
    console.error("Gagal menyinkronkan data mahasiswa ke Supabase:", err);
    throw err;
  }
}

export async function fetchMediaCloud(): Promise<MediaItem[] | null> {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from("sisfo_media")
      .select("*");
    
    if (error) throw error;
    return data as MediaItem[];
  } catch (err) {
    console.warn("Supabase fetchMediaCloud error:", err);
    return null;
  }
}

export async function saveMediaCloud(media: MediaItem[]) {
  if (!supabaseClient) return;
  try {
    // Clear all and write back currently saved list
    const { error: deleteError } = await supabaseClient
      .from("sisfo_media")
      .delete()
      .neq("tipe", "stale"); // delete all
      
    if (deleteError) throw deleteError;

    if (media.length > 0) {
      const sanitized = media.map(m => ({
        tipe: m.tipe,
        url: m.url,
        keterangan: m.keterangan || ""
      }));
      const { error: insertError } = await supabaseClient
        .from("sisfo_media")
        .insert(sanitized);
      
      if (insertError) throw insertError;
    }
  } catch (err) {
    console.error("Gagal menyinkronkan media galeri ke Supabase:", err);
    throw err;
  }
}
