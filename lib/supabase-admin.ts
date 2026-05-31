import { createClient } from "@supabase/supabase-js";

let adminClient: ReturnType<typeof createClient<any>> | null = null;

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) {
    throw new Error("Supabase server credentials are not configured.");
  }
  if (!adminClient) {
    adminClient = createClient<any>(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return adminClient;
}
