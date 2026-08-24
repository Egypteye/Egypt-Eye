import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdminConfigured } from "./env";

// Service-role client — bypasses Row Level Security entirely. This is the
// ONLY thing allowed to write newsletter subscribers, mint/redeem discount
// codes, or create/update reservations, because those operations must
// enforce business rules (uniqueness, eligibility, "not already redeemed")
// that a client-controlled request can never be trusted to get right.
//
// The `server-only` import makes any accidental client-component import of
// this file fail at build time rather than leaking SUPABASE_SERVICE_ROLE_KEY
// into the browser bundle. Only import this from Route Handlers, Server
// Actions, or other server-only modules.
let cached: SupabaseClient | null = null;

export function createAdminSupabaseClient(): SupabaseClient {
  if (!supabaseAdminConfigured) {
    throw new Error(
      "Supabase admin access isn't configured yet — add SUPABASE_SERVICE_ROLE_KEY (see README). Never expose this key to the browser."
    );
  }
  if (cached) return cached;
  cached = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
