import { createClient } from "@supabase/supabase-js";

const fallbackSupabaseUrl = "https://sqtftamvttdmtvdrzugo.supabase.co";
const fallbackSupabaseAnonKey = "sb_publishable_aB82no5C_8EpnPMaUI4UCg_siDT-AKf";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackSupabaseUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey;

export function getSupabaseBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
