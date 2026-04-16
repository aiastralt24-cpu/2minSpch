"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase/config";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(config.url, config.anonKey);
  }

  return browserClient;
}
