import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { relativeTime, formatDateTime, nowMs } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, EmptyState, Notice } from "@/components/os/ui";
import { DecisionPanel } from "./DecisionPanel";
import { RequestPanel } from "./RequestPanel";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Approvals" };

// ---------------------------------------------------------------------------
// APPROVALS
// ---------------------------------------------------------------------------
// Every decision that costs money, breaks a rule, or overrides the system is
// raised here with a reason, decided by a named person, and kept.
//
// One rule is absolute regardless of role: you cannot approve your own
// request. That is the only separation-of-duties constraint the system
// enforces unconditionally, and it is enforced in the server action rather
// than by hiding a button.
// ---------------------------------------------------------------------------

const KIND_LABELS: Record<string, string> = {
  discount: "Discount", refund: "Refund", extra_cost: "Unplanned cost",
  supplier_change: "Supplier change", purchase: "Purchase", vip_upgrade: "VIP upgrade",
  free_service: "Complimentary service", cancellation: "Cancellation",
  special_request: "Special request", assignment_override: "Forced scheduling conflict", other: "Other",
};

export default async function ApprovalsPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "approvals.view")) return <NoAccess what="approvals" permission="approvals.view" />;

  const db = osdb();
  const org = await getOrg();

  const { data } = await db
    .from("os_approvals")
    .select(
      "id, ref, kind, title, detail, amount, currency, status, requested_at, decided_at, decision_note, due_at, escalated_at, " +
      "requested_by, decided_by, approver_role_key, " +
      "requester:os_employees!os_approvals_requested_by_fkey ( full_name ), " +
      "decider:os_employees!os_approvals_decided_by_fkey ( full_name ), " +
      "os_trips ( ref, title )",
    )
    .eq("org_id", org.id)
    .order("requested_at", { ascending: false })
    .limit(120);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (data ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const pending = rows.filter((r) => r.status === "pending");
  const decided = rows.filter((r) => r.status !== "pending");
  const mine = pending.filter((r) => r.requested_by === actor.employeeId);
  const canDecide = can(actor, "approvals.decide");
  const now = nowMs();
  const overdue = pending.filter((r) => r.due_at && new Date(r.due_at).getTime() < now);

  return (
    <>
      <PageHeader
        eyebrow="Decisions"
        title="Approvals"
        description="What is waiting on somebody, and what was decided. Nothing that needed a decision disappears without one."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Pending" value={pending.length} tone={pending.length ? "amber" : undefined} />
        <Stat label="Past their deadline" value={overdue.length} tone={overdue.length ? "red" : undefined} sub={overdue.length ? "Escalating automatically" : "All within window"} />
        <Stat label="Raised by you" value={mine.length} />
        <Stat label="Decided" value={decided.length} sub="On record" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader
                title="Waiting for a decision"
                subtitle={canDecide ? "You can decide these, except any you raised yourself." : "You can see these but not decide them."}
              />
            </div>
            {pending.length ? (
              <ul>
                {pending.map((approval) => {
                  const isOwn = approval.requested_by === actor.employeeId;
                  const isLate = approval.due_at && new Date(approval.due_at).getTime() < now;
                  return (
                    <li key={approval.id} className="border-b border-os-line/60 px-4 py-3.5 last:border-0 sm:px-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="os-nums text-[11.5px] font-semibold text-os-faint">{approval.ref}</span>
                        <Badge tone="neutral">{KIND_LABELS[approval.kind] ?? approval.kind}</Badge>
                        {approval.amount ? (
                          <Badge tone="gold">{formatMoney(Number(approval.amount), approval.currency ?? "USD")}</Badge>
                        ) : null}
                        {isLate ? <Badge tone="red">Past deadline</Badge> : null}
                        {approval.escalated_at ? <Badge tone="red">Escalated</Badge> : null}
                      </div>

                      <p className="mt-1 text-[14px] font-semibold leading-snug text-os-text">{approval.title}</p>
                      {approval.detail ? (
                        <p className="mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-os-muted">{approval.detail}</p>
                      ) : null}
                      <p className="mt-1.5 text-[11.5px] text-os-faint">
                        {approval.requester?.full_name ?? "Someone"} · {relativeTime(approval.requested_at)}
                        {approval.os_trips?.ref ? (
                          <> · <Link href={`/os/trips/${approval.os_trips.ref}`} className="font-medium text-os-gold hover:underline">{approval.os_trips.ref}</Link></>
                        ) : null}
                        {approval.due_at ? <> · deadline {formatDateTime(approval.due_at)}</> : null}
                      </p>

                      {canDecide ? (
                        isOwn ? (
                          <p className="mt-2.5 rounded-lg bg-black/[0.03] px-3 py-2 text-[12px] text-os-muted">
                            You raised this. Somebody else with approval rights has to decide it — that rule holds for every role,
                            including the owner.
                          </p>
                        ) : (
                          <div className="mt-3">
                            <DecisionPanel approvalId={approval.id} title={approval.title} />
                          </div>
                        )
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-6 sm:px-5">
                <EmptyState title="No pending approvals" description="Nothing is waiting on a decision." icon={<Icon.Shield size={24} />} />
              </div>
            )}
          </Card>

          {decided.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader title="Decided" subtitle="The record of what was agreed, and why" />
              </div>
              <ul>
                {decided.slice(0, 30).map((approval) => (
                  <li key={approval.id} className="border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="os-nums text-[11.5px] font-semibold text-os-faint">{approval.ref}</span>
                      <Badge tone={approval.status === "approved" ? "green" : approval.status === "rejected" ? "red" : "amber"}>
                        {String(approval.status).replace(/_/g, " ")}
                      </Badge>
                      {approval.amount ? <span className="os-nums text-[12px] text-os-muted">{formatMoney(Number(approval.amount), approval.currency ?? "USD")}</span> : null}
                    </div>
                    <p className="mt-0.5 text-[13px] font-medium leading-snug text-os-text">{approval.title}</p>
                    {approval.decision_note ? (
                      <p className="mt-0.5 text-[12px] leading-relaxed text-os-muted">&ldquo;{approval.decision_note}&rdquo;</p>
                    ) : null}
                    <p className="mt-0.5 text-[11px] text-os-faint">
                      {approval.decider?.full_name ?? "Someone"} · {relativeTime(approval.decided_at)}
                      {approval.requester?.full_name ? ` · raised by ${approval.requester.full_name}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          {can(actor, "approvals.request") ? (
            <Card>
              <CardHeader title="Raise an approval" subtitle="Anything that costs money, breaks a rule, or needs a manager's name on it." />
              <div className="mt-3">
                <RequestPanel />
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="How this works" />
            <ul className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-os-muted">
              <li><span className="font-medium text-os-text">Rules decide the approver.</span> A discount above 15% goes to management; an unplanned cost above the threshold goes to the operations manager. The rule also sets the deadline.</li>
              <li><span className="font-medium text-os-text">Nothing sits forever.</span> An approval past its deadline escalates to the next role up automatically and is flagged critical.</li>
              <li><span className="font-medium text-os-text">You cannot approve your own request.</span> No role overrides that.</li>
              <li><span className="font-medium text-os-text">A rejection needs a reason.</span> The person who asked has to know what to do differently.</li>
            </ul>
          </Card>

          {overdue.length ? (
            <Notice tone="red" title={`${overdue.length} approval${overdue.length === 1 ? " is" : "s are"} past deadline`}>
              These have escalated, or will on the next hourly sweep.
            </Notice>
          ) : null}
        </div>
      </div>
    </>
  );
}
