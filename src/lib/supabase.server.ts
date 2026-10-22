import { createClient } from "@supabase/supabase-js";
import { getServerConfig } from "./config.server";

export function getSupabaseAdmin() {
  const config = getServerConfig();
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = config.supabaseServiceRoleKey;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase configuration. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}
