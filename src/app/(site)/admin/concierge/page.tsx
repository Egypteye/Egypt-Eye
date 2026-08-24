import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { NotConfiguredNotice } from "../NotConfiguredNotice";
import { setConciergeStatus } from "./actions";

export const metadata = { title: "Concierge Requests", robots: { index: false, follow: false } };

type ConciergeRequest = {
  id: string;
  question: string;
  answer: string | null;
  staff_status: string;
  created_at: string;
  profiles: { email: string; first_name: string | null } | null;
  reservations: { reference: string } | null;
};

export default async function AdminConciergePage() {
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("concierge_requests")
    .select("id, question, answer, staff_status, created_at, profiles(email, first_name), reservations(reference)")
    .neq("staff_status", "none")
    .order("created_at", { ascending: false })
    .limit(200);

  const requests = (data ?? []) as unknown as ConciergeRequest[];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Concierge Requests</h1>
      <p className="mt-1 text-sm text-ink-soft/60">Questions where the customer asked to send something to the team.</p>

      <div className="mt-6 flex flex-col gap-4">
        {requests.map((r) => (
          <div key={r.id} className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">
                  {r.profiles?.first_name ?? r.profiles?.email} {r.reservations?.reference && `· ${r.reservations.reference}`}
                </p>
                <p className="mt-1 text-sm font-medium text-ink">{r.question}</p>
                {r.answer && <p className="mt-1 text-sm text-ink-soft/60">{r.answer}</p>}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  r.staff_status === "pending" ? "bg-gold/15 text-gold-dark" : r.staff_status === "sent" ? "bg-nile/10 text-nile" : "bg-black/5 text-ink-soft/60"
                }`}
              >
                {r.staff_status}
              </span>
            </div>
            {r.staff_status === "pending" && (
              <div className="mt-3 flex gap-2">
                <form action={setConciergeStatus.bind(null, r.id, "resolved")}>
                  <button type="submit" className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-cream hover:bg-gold-dark">
                    Mark Resolved
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
        {requests.length === 0 && <p className="text-sm text-ink-soft/50">No pending concierge requests.</p>}
      </div>
    </div>
  );
}
