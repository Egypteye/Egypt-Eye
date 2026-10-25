import { requireOsStaff } from "@/lib/auth/session";
import { canManageLeads } from "@/lib/auth/roles";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { listLeads } from "@/lib/os/data";
import { compareFollowUps, followUpState, todayInCairo } from "@/lib/os/model";
import { LeadRow, NewLeadForm } from "./LeadForms";

// The follow-up list — the handwritten one, with the dates doing some work.
//
// The paper version already has the right columns. What it cannot do is tell
// anybody that today is the day, which is the single reason a lead goes cold:
// not that nobody wrote the date down, but that nobody read all five sheets
// this morning. So this screen is sorted by urgency and opens on what is due.

export const dynamic = "force-dynamic";
export const metadata = { title: "Follow-ups — Egypt Eye OS", robots: { index: false, follow: false } };

export default async function OsFollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  const user = await requireOsStaff();
  const { all } = await searchParams;
  const includeClosed = all === "1";
  const mayManage = canManageLeads(user.role);
  const today = todayInCairo();

  const leads = supabaseAdminConfigured ? await listLeads(includeClosed) : [];
  const sorted = [...leads].sort((a, b) => compareFollowUps(a, b, today));

  const due = sorted.filter((lead) => {
    const state = followUpState(lead.nextFollowUpOn, today);
    return lead.outcome === "pending" && (state === "overdue" || state === "today");
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">Follow-ups</h1>
        <a
          href={includeClosed ? "/os/follow-ups" : "/os/follow-ups?all=1"}
          className="text-sm font-semibold text-gold-dark underline"
        >
          {includeClosed ? "Show only open" : "Show closed too"}
        </a>
      </div>

      <p className="rounded-xl border border-black/10 bg-cream px-4 py-3 text-sm">
        {due.length === 0 ? (
          <span className="font-semibold text-nile">Nothing due today. </span>
        ) : (
          <span className="font-semibold text-terracotta">
            {due.length} {due.length === 1 ? "person" : "people"} to chase today.{" "}
          </span>
        )}
        <span className="text-ink-soft">
          {sorted.filter((l) => l.outcome === "pending").length} open
          {includeClosed ? `, ${sorted.filter((l) => l.outcome !== "pending").length} closed` : ""}.
        </span>
      </p>

      {mayManage ? <NewLeadForm today={today} owner={user.firstName ?? user.email} /> : null}

      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 bg-cream px-5 py-10 text-center text-sm text-ink-soft">
          Nothing on the follow-up list.
        </p>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((lead) => (
            <LeadRow key={lead.id} lead={lead} today={today} editable={mayManage} />
          ))}
        </div>
      )}
    </div>
  );
}
