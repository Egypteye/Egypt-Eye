"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfigured } from "./env";

// Browser client — only ever holds the public anon key (safe to expose; the
// database's Row Level Security policies are what actually authorize every
// read/write this client makes, scoped to the signed-in user's own rows).
export function createClient() {
  if (!supabaseConfigured) {
    throw new Error(
      "Supabase isn't configured yet — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see README)."
    );
  }
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
