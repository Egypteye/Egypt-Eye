import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";

/**
 * Writing an enquiry down before trying to email it.
 *
 * =========================================================================
 * THE RULE: STORE FIRST, SEND SECOND
 * =========================================================================
 * The order is the entire point and the only thing here that must not be
 * rearranged. Before this, four routes sent an email and kept no record, so a
 * refused send meant the visitor saw "we could not send that" and the business
 * never learned that anyone had tried. A lead did not fail loudly; it stopped
 * existing.
 *
 * Storing afterwards would reintroduce exactly that: the sends that fail are
 * disproportionately the ones that throw, time out, or take the route down a
 * branch that returns early, and those are precisely the enquiries worth
 * keeping. check-enquiry-storage.mts asserts the ordering in source.
 *
 * =========================================================================
 * NEITHER FUNCTION THROWS, EVER
 * =========================================================================
 * This is a safety net. A safety net that can itself knock the acrobat off
 * the wire is worse than none: if Supabase is unreachable, the correct
 * behaviour is still to send the email and tell the customer it worked.
 *
 * So both functions swallow their errors and report to the console, and the
 * callers ignore the return value except to pass the id along. The failure
 * mode is "this one enquiry is unrecorded", which is where the site already
 * was — never "the enquiry is refused because the database was busy".
 */

export type EnquiryKind = "tour_enquiry" | "flying_dresses" | "transfer" | "shop_visit";
export type EnquiryBrand = "egypt_eye" | "flying_dresses";

export type EnquiryRecord = {
  kind: EnquiryKind;
  brand: EnquiryBrand;
  /** What they were asking about — a tour title, a package, a route. */
  subjectTitle?: string;
  name: string;
  email: string;
  phone?: string;
  /** Everything else the form collected. Stored as submitted. */
  details?: Record<string, unknown>;
};

/**
 * Writes the enquiry and returns its id, or null if it could not be written.
 *
 * Null is not an error the caller should act on — it means the net was not
 * there this time, and the send should go ahead regardless.
 */
export async function recordEnquiry(record: EnquiryRecord): Promise<string | null> {
  if (!supabaseAdminConfigured) {
    // Local development without service-role credentials. Saying so once is
    // more useful than a silent null that looks like a database failure.
    console.warn("enquiry not recorded: Supabase admin is not configured");
    return null;
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("enquiries")
      .insert({
        kind: record.kind,
        brand: record.brand,
        subject_title: record.subjectTitle ?? null,
        name: record.name,
        email: record.email,
        phone: record.phone || null,
        details: record.details ?? {},
      })
      .select("id")
      .single();

    if (error) {
      console.error("enquiry not recorded:", error.message);
      return null;
    }
    return (data as { id: string }).id;
  } catch (err) {
    console.error("enquiry not recorded:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Records what happened when the notification email was attempted.
 *
 * `from` is the address sendEmail actually resolved — not a guess. For the
 * two-sender Flying Dresses route it is the difference between "the brand
 * domain is verified" and "the brand sender was refused and the platform's
 * address caught it", which read identically as "sent" without it.
 *
 * `error` is the provider's own message. It is stored because "failed" alone
 * does not tell the owner whether to re-verify a domain, replace a key or
 * wait out an outage — and they have no terminal to go looking in
 * (CLAUDE.md #2). It is never shown to the customer.
 */
export async function markEnquiryDelivery(
  id: string | null,
  result: { ok: boolean; error?: string; from?: string }
): Promise<void> {
  if (!id || !supabaseAdminConfigured) return;

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("enquiries")
      .update({
        email_status: result.ok ? "sent" : "failed",
        // Truncated: a provider can return a long HTML error body, and the
        // useful part is always at the front.
        email_error: result.ok ? null : (result.error ?? "unknown").slice(0, 2000),
        // Recorded on success AND failure. Which sender was refused is as
        // diagnostic as which one worked.
        email_sender: result.from ?? null,
        email_attempted_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) console.error("enquiry delivery not recorded:", error.message);
  } catch (err) {
    console.error("enquiry delivery not recorded:", err instanceof Error ? err.message : err);
  }
}
