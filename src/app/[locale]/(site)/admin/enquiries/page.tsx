import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../NotConfiguredNotice";
import { summariseDelivery, describeSender, type EnquiryRow } from "@/lib/enquiries/delivery";

export const metadata = { title: "Enquiries & Email Delivery", robots: { index: false, follow: false } };

// WHY THIS PAGE EXISTS.
//
// public.enquiries has recorded email_status, email_error and email_sender
// since 3 November, and until now NOTHING displayed any of it. The one
// question the table was built to answer — "did the notification email
// actually leave?" — could only be asked by someone with a database client.
//
// The owner works from a browser. A diagnostic they cannot reach is not a
// diagnostic, and this is the page that was missing when "we stopped getting
// emails" had to be investigated from the outside.
//
// THE SENDER COLUMN IS THE POINT. src/lib/email/resend.ts falls back through
// three senders and they mean completely different things. The worst case is
// onboarding@resend.dev, which Resend accepts and then refuses to deliver to
// anyone except the account owner — "sent" with nothing arriving. That is
// invisible unless the sender is shown, so it is shown first.

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800",
};

function when(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
}

export default async function AdminEnquiriesPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "reservations")) {
    redirect("/account/login?next=/admin/enquiries");
  }
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select(
      "id, created_at, kind, brand, subject_title, name, email, phone, email_status, email_error, email_sender, email_attempted_at, anonymised_at"
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const rows = (data ?? []) as EnquiryRow[];
  const summary = summariseDelivery(rows);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Enquiries &amp; Email Delivery</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft/85">
        Every enquiry the website received, written down <strong>before</strong> the notification email was
        attempted. If a row is here but its email failed, the lead still exists — reply to it by hand.
      </p>

      {error && (
        <p className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-800">
          Could not read the enquiries table: {error.message}
        </p>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* The answer to "are our emails arriving", above the fold. */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total recorded", String(summary.total), "bg-cream"],
          ["Email sent", String(summary.sent), summary.sent > 0 ? "bg-emerald-50" : "bg-cream"],
          ["Email failed", String(summary.failed), summary.failed > 0 ? "bg-red-50" : "bg-cream"],
          ["Never attempted", String(summary.pending), summary.pending > 0 ? "bg-amber-50" : "bg-cream"],
        ].map(([label, value, tone]) => (
          <div key={label} className={`rounded-2xl border border-black/5 ${tone} p-5 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">{label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* The sender verdict — the thing that silently breaks delivery. */}
      <div className="mt-4 rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">Which sender Resend accepted</p>
        {summary.senders.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            No send has been attempted yet, so no sender has been recorded.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {summary.senders.map((s) => {
              const verdict = describeSender(s.sender);
              return (
                <li key={s.sender ?? "none"} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                  <code className="rounded bg-sand-dim px-2 py-0.5 text-xs text-ink">{s.sender ?? "(not recorded)"}</code>
                  <span className="text-ink-soft">{s.count}×</span>
                  <span
                    className={
                      verdict.severity === "bad"
                        ? "font-semibold text-red-700"
                        : verdict.severity === "warn"
                          ? "font-semibold text-amber-700"
                          : "text-emerald-700"
                    }
                  >
                    {verdict.message}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-sand-dim px-5 py-8 text-center text-sm text-ink-soft">
          No enquiries recorded yet. If you were expecting some, that points at the forms rather than at email —
          an enquiry is written here before any email is attempted, so a missing row means nothing was submitted.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border p-5 shadow-sm ${
                r.email_status === "sent" ? "border-black/5 bg-cream" : "border-red-200 bg-red-50/40"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{r.subject_title || r.kind}</p>
                  <p className="mt-0.5 text-xs text-ink-soft/80">
                    {r.kind} · {r.brand} · {when(r.created_at)} UTC
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_STYLES[r.email_status] ?? "bg-gray-200 text-gray-700"
                  }`}
                >
                  {r.email_status === "pending" ? "never attempted" : r.email_status}
                </span>
              </div>

              <div className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <p className="text-ink-soft">
                  <span className="text-ink-soft/70">From:</span>{" "}
                  <strong className="text-ink">{r.anonymised_at ? "(anonymised)" : r.name || "—"}</strong>
                </p>
                <p className="truncate text-ink-soft">
                  <span className="text-ink-soft/70">Email:</span>{" "}
                  {r.anonymised_at ? "(anonymised)" : r.email || "—"}
                </p>
                {r.phone && !r.anonymised_at && (
                  <p className="text-ink-soft">
                    <span className="text-ink-soft/70">Phone:</span> {r.phone}
                  </p>
                )}
                <p className="text-ink-soft">
                  <span className="text-ink-soft/70">Attempted:</span> {when(r.email_attempted_at)}
                </p>
                {r.email_sender && (
                  <p className="truncate text-ink-soft sm:col-span-2">
                    <span className="text-ink-soft/70">Sent as:</span>{" "}
                    <code className="text-xs">{r.email_sender}</code>
                  </p>
                )}
              </div>

              {r.email_error && (
                <p className="mt-3 rounded-xl bg-red-100 px-4 py-3 font-mono text-xs leading-relaxed text-red-900">
                  {r.email_error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
