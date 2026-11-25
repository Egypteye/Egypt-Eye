/**
 * Reading the delivery outcome of recorded enquiries.
 *
 * Pure and free of `server-only` on purpose (CLAUDE.md §6): the admin page
 * that renders this imports Supabase and `next/navigation`, which would put
 * the judgement out of reach of a check script. The judgement is the valuable
 * part, so it lives here and scripts/check-enquiry-delivery.mts executes it.
 *
 * =========================================================================
 * THE FAILURE THIS EXISTS TO MAKE VISIBLE
 * =========================================================================
 * src/lib/email/resend.ts resolves its sender through three candidates:
 *
 *   1. an explicit per-brand override      — the brand's domain is verified
 *   2. process.env.RESEND_FROM_EMAIL       — the platform sender caught it
 *   3. "onboarding@resend.dev"             — NOTHING was configured
 *
 * The third is the dangerous one, and it is dangerous precisely because it
 * does not look like a failure. Resend ACCEPTS the request, so the row is
 * marked `sent` and the dashboard is green — but Resend will not deliver from
 * that address to anyone except the account owner. Every customer enquiry
 * silently goes nowhere while every indicator says it was sent.
 *
 * "Sent" therefore cannot be trusted on its own. Which sender was accepted is
 * the fact that distinguishes working delivery from the silent kind, which is
 * why the admin page leads with it rather than burying it in a row.
 */

export type EnquiryRow = {
  id: string;
  created_at: string;
  kind: string;
  brand: string;
  subject_title: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  email_status: string;
  email_error: string | null;
  email_sender: string | null;
  email_attempted_at: string | null;
  anonymised_at: string | null;
};

/** The sender Resend falls back to when nothing at all is configured. */
export const UNCONFIGURED_SENDER = "onboarding@resend.dev";

export type SenderVerdict = {
  severity: "ok" | "warn" | "bad";
  message: string;
};

/**
 * What a recorded sender actually means for delivery.
 *
 * Deliberately blunt about the resend.dev case: an owner reading this page
 * during an outage needs to be told that "sent" is lying to them, not given
 * a neutral description of a configuration value.
 */
export function describeSender(sender: string | null): SenderVerdict {
  if (!sender) {
    return { severity: "warn", message: "No sender recorded — this send predates sender tracking." };
  }
  if (sender.includes(UNCONFIGURED_SENDER)) {
    return {
      severity: "bad",
      message:
        "RESEND_FROM_EMAIL is not reaching the function. Resend accepts these and delivers them to nobody " +
        "but the account owner — so these enquiries were never received, even where the status says sent.",
    };
  }
  return { severity: "ok", message: "A configured sender — delivery is genuine." };
}

export type DeliverySummary = {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  /** Distinct senders, most used first. */
  senders: { sender: string | null; count: number }[];
  /** True when any row was sent from the unconfigured fallback. */
  hasUnconfiguredSender: boolean;
};

export function summariseDelivery(rows: EnquiryRow[]): DeliverySummary {
  const counts = new Map<string | null, number>();
  let sent = 0;
  let failed = 0;
  let pending = 0;

  for (const r of rows) {
    if (r.email_status === "sent") sent++;
    else if (r.email_status === "failed") failed++;
    // Anything else — including the table's 'pending' default — means the
    // send was never marked, so it is counted as never attempted rather than
    // quietly folded into one of the two outcomes above.
    else pending++;

    // Only rows that reached a send attempt carry a sender worth counting.
    if (r.email_attempted_at) {
      counts.set(r.email_sender, (counts.get(r.email_sender) ?? 0) + 1);
    }
  }

  const senders = [...counts.entries()]
    .map(([sender, count]) => ({ sender, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: rows.length,
    sent,
    failed,
    pending,
    senders,
    hasUnconfiguredSender: senders.some((s) => (s.sender ?? "").includes(UNCONFIGURED_SENDER)),
  };
}
