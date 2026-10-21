import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";

// Running the retention job.
//
// The periods themselves are not here — they are in the SQL function, which
// is the thing that enforces them, and stated in lib/privacy/policy.ts,
// which is the thing the customer reads. check-privacy.mts asserts the two
// agree. This file only calls it.
//
// It is called from the nightly reconciliation route, which already runs at
// 04:00 and already carries the rate-limit tidy-up, rather than adding a
// third cron entry for a single RPC.

export type RetentionReport = Record<string, number | string | boolean>;

/**
 * Applies the retention periods the privacy policy promises.
 *
 * Swallows its own errors, like pruneRateLimitHits: this runs after the
 * payment sweep in the same request, and a failure to anonymise an old
 * booking must not take down reconciliation of a live payment.
 */
export async function applyDataRetention(): Promise<{ ok: boolean; report?: RetentionReport }> {
  if (!supabaseAdminConfigured) return { ok: false };
  try {
    const supabase = createAdminSupabaseClient();
    // Explicitly false. The function defaults to a dry run precisely so that
    // a caller which forgets this argument deletes nothing.
    const { data, error } = await supabase.rpc("apply_data_retention", { p_dry_run: false });
    if (error) {
      console.error("data retention sweep failed:", error.message);
      return { ok: false };
    }
    return { ok: true, report: (data ?? undefined) as RetentionReport | undefined };
  } catch (err) {
    console.error("data retention sweep threw:", err);
    return { ok: false };
  }
}

/** The same sweep, counting only. Used by the /admin page. */
export async function previewDataRetention(): Promise<{ ok: boolean; report?: RetentionReport }> {
  if (!supabaseAdminConfigured) return { ok: false };
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.rpc("apply_data_retention", { p_dry_run: true });
    if (error) return { ok: false };
    return { ok: true, report: (data ?? undefined) as RetentionReport | undefined };
  } catch {
    return { ok: false };
  }
}
