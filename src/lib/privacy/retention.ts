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
    // The enquiries table has its own function rather than a block inside
    // apply_data_retention, because adding one would have meant retyping a
    // hundred lines of customer-deleting SQL to gain six. See 0030's note.
    // Merged here so the report stays one object and /admin keeps showing
    // every number the policy promises.
    const enquiries = await sweepEnquiries(false);
    return {
      ok: true,
      report: { ...((data ?? {}) as RetentionReport), ...enquiries } as RetentionReport,
    };
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
    const enquiries = await sweepEnquiries(true);
    return {
      ok: true,
      report: { ...((data ?? {}) as RetentionReport), ...enquiries } as RetentionReport,
    };
  } catch {
    return { ok: false };
  }
}

/**
 * The enquiries half of the sweep.
 *
 * Returns a fragment to merge rather than a report of its own, so a caller
 * cannot accidentally run one half and believe it ran both. Swallows its
 * errors for the same reason the rest of this module does: an old enquiry
 * that failed to anonymise must not take down the payment reconciliation
 * running in the same request.
 */
async function sweepEnquiries(dryRun: boolean): Promise<Record<string, unknown>> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.rpc("apply_enquiry_retention", { p_dry_run: dryRun });
    if (error) {
      console.error("enquiry retention sweep failed:", error.message);
      return {};
    }
    const report = (data ?? {}) as { enquiries?: number };
    return { enquiries: report.enquiries ?? 0 };
  } catch (err) {
    console.error("enquiry retention sweep threw:", err);
    return {};
  }
}
