import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getDeal, dealStageHistory } from "@/lib/os/commercial/deals";
import { getStages, stageBlockers } from "@/lib/os/commercial/pipeline";
import { resolveTerm, describeTerm } from "@/lib/os/commercial/agreements";
import { osdb, getOrg } from "@/lib/os/db";
import { formatDate, relativeTime, todayInCairo } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Notice, Stat, Divider, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { StagePill } from "@/components/os/commercial";
import { DealControls } from "./DealControls";
import { EngagementLog } from "../../EngagementLog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return { title: `Deal ${ref}` };
}

// One deal in full. The two things this page exists to make visible:
//   * what is standing between it and the next stage, named;
//   * how it actually got here, from the append-only stage history.
export default async function DealPage({ params }: { params: Promise<{ ref: string }> }) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "deals.view")) return <NoAccess what="deals" permission="deals.view" />;

  const { ref } = await params;
  const deal = await getDeal(actor, ref);
  if (!deal) notFound();

  const db = osdb();
  const org = await getOrg();
  const workspace = deal.pipeline === "b2c" ? "reservations" : "partnerships";

  const [stages, history, { data: reasons }, { data: engagements }, { data: tasks }, { data: trips }] = await Promise.all([
    getStages(deal.pipeline),
    dealStageHistory(deal.id),
    db.from("os_lost_reasons").select("key, label, controllable, pipeline").eq("org_id", org.id).eq("active", true).order("sort_order"),
    can(actor, "engagements.view")
      ? db.from("os_engagements")
          .select("id, kind, direction, channel, subject, summary, outcome, happened_at, duration_minutes, participants, os_employees ( full_name )")
          .eq("deal_id", deal.id).order("happened_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    can(actor, "tasks.view")
      ? db.from("os_tasks").select("id, title, status, due_at").eq("deal_id", deal.id).order("due_at", { nullsFirst: false })
      : Promise.resolve({ data: [] }),
    db.from("os_deal_trips").select("os_trips ( ref, title, trip_date, status )").eq("deal_id", deal.id),
  ]);

  // What is standing between this deal and each stage it could move to,
  // computed server-side so the page shows the real answer rather than a
  // hopeful button.
  const current = stages.find((s) => s.id === deal.stageId);
  const nextStage = current ? stages.find((s) => s.sortOrder === current.sortOrder + 1 && s.category !== "lost") : null;
  const blockers = nextStage && deal.status === "open" ? await stageBlockers(deal.id, nextStage) : [];

  // For a B2B deal against a partner, the terms that would apply today.
  const terms = deal.companyId && can(actor, "companies.terms")
    ? await resolveTerm(deal.companyId, deal.requestedDate ?? todayInCairo(), {})
    : null;

  const relevantReasons = ((reasons ?? []) as { key: string; label: string; controllable: boolean; pipeline: string | null }[])
    .filter((r) => !r.pipeline || r.pipeline === deal.pipeline);

  // PostgREST returns an embedded row as an object or an array depending on
  // the relationship it infers, so normalise once rather than casting at
  // three call sites.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const dealTrips = ((trips ?? []) as any[])
    .flatMap((row) => (Array.isArray(row.os_trips) ? row.os_trips : row.os_trips ? [row.os_trips] : []))
    .map((t: any) => ({ ref: t.ref as string, title: t.title as string, tripDate: t.trip_date as string, status: t.status as string }));
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <>
      <PageHeader
        eyebrow={`Deal · ${deal.pipeline.toUpperCase()}`}
        title={deal.title}
        description={`${deal.ref} · ${deal.companyName ?? deal.clientName ?? "no counterparty"} · owned by ${deal.ownerName ?? "nobody"}.`}
        actions={<Link href={`/os/${workspace}`} className={buttonClass.ghost}><Icon.ArrowLeft size={15} />Back</Link>}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            {deal.stageLabel ? <StagePill label={deal.stageLabel} color={deal.stageColor} /> : null}
            <Badge tone={deal.status === "won" ? "green" : deal.status === "lost" ? "red" : "neutral"}>{deal.status}</Badge>
            <span className="os-nums text-[11.5px] text-os-faint">{deal.daysInStage} days in this stage</span>
          </div>
        }
      />

      {deal.stalled && deal.status === "open" ? (
        <div className="mb-5">
          <Notice tone="amber" title={`This deal has been in ${deal.stageLabel} for ${deal.daysInStage} days`}>
            That is past what this stage is configured to tolerate. Either it moves, or it should be closed with a reason
            — a pipeline full of deals nobody will name as lost forecasts revenue that is not coming.
          </Notice>
        </div>
      ) : null}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {deal.money ? (
          <>
            <Stat label="Value" value={formatMoney(deal.money.value, deal.money.currency)} />
            <Stat
              label="Weighted"
              value={formatMoney(deal.money.weighted, deal.money.currency)}
              sub={`${deal.money.probabilityPct}% ${deal.money.probabilitySource === "owner" ? "set by the owner" : "from the stage"}`}
            />
          </>
        ) : (
          <Stat label="Value" value="Not visible" sub="Needs the deal value permission" />
        )}
        <Stat label="Expected close" value={deal.expectedCloseOn ? formatDate(deal.expectedCloseOn) : "Not set"} />
        <Stat label="Travel date" value={deal.requestedDate ? formatDate(deal.requestedDate) : "Not set"} sub={deal.guests ? `${deal.guests} guests` : undefined} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          {nextStage && deal.status === "open" ? (
            <Card>
              <CardHeader
                title={`Before it can reach ${nextStage.label}`}
                subtitle={nextStage.description ?? undefined}
              />
              {blockers.length ? (
                <ul className="mt-3 space-y-2.5">
                  {blockers.map((b) => (
                    <li key={b.key} className="flex gap-2.5">
                      <span className="mt-0.5 shrink-0 text-os-amber"><Icon.Alert size={14} /></span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-medium text-os-text">{b.label}</span>
                        <span className="block text-[11.5px] leading-snug text-os-muted">{b.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 flex items-center gap-2 text-[12.5px] text-os-green">
                  <Icon.Check size={15} />Everything this stage needs is in place.
                </p>
              )}
            </Card>
          ) : null}

          {can(actor, "engagements.view") ? (
            <EngagementLog
              engagements={(engagements ?? []) as never[]}
              target={{ dealId: deal.id, clientId: deal.clientId, companyId: deal.companyId }}
              canLog={can(actor, "engagements.log")}
            />
          ) : null}

          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader
                title="How it got here"
                subtitle="Append-only. Nothing on this list can be edited or removed."
              />
            </div>
            {history.length ? (
              <ol className="p-4 sm:p-5">
                {history.map((entry) => (
                  <li key={entry.id} className="relative border-l border-os-line pb-4 pl-4 last:pb-0">
                    <span className="absolute -left-[4.5px] top-1 h-2 w-2 rounded-full bg-os-gold" />
                    <p className="text-[12.5px] font-medium text-os-text">
                      {entry.fromStage ? `${entry.fromStage} → ` : ""}{entry.toStage ?? entry.toStatus}
                      {entry.daysInPrevious != null ? (
                        <span className="ml-1.5 os-nums text-[11px] font-normal text-os-faint">
                          after {Math.round(entry.daysInPrevious)} day{Math.round(entry.daysInPrevious) === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </p>
                    {entry.note ? <p className="mt-0.5 text-[12px] leading-snug text-os-muted">{entry.note}</p> : null}
                    <p className="mt-0.5 text-[11px] text-os-faint">{entry.by} · {relativeTime(entry.at)}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="p-4 text-[12.5px] text-os-faint sm:p-5">No stage changes recorded yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="What happens next" />
            {deal.nextStep ? (
              <p className="mt-2.5 rounded-lg bg-os-gold-soft px-3 py-2 text-[12.5px] leading-snug text-[#7a6415]">
                {deal.nextStep}
                {deal.nextStepDueOn ? <span className="block text-[11px]">by {formatDate(deal.nextStepDueOn)}</span> : null}
              </p>
            ) : (
              <p className="mt-2.5 text-[12px] text-os-faint">No next step recorded. A deal with no next step is a deal drifting.</p>
            )}
            <Divider className="my-4" />
            <DealControls
              dealId={deal.id}
              dealRef={deal.ref}
              status={deal.status}
              stageId={deal.stageId}
              stages={stages.map((s) => ({ id: s.id, key: s.key, label: s.label, category: s.category, description: s.description }))}
              lostReasons={relevantReasons}
              can={{
                move: can(actor, "deals.stage"),
                close: can(actor, "deals.close"),
                edit: can(actor, "deals.edit"),
                value: can(actor, "deals.value"),
              }}
              currency={deal.money?.currency ?? actor.baseCurrency}
              value={deal.money?.value ?? 0}
            />
          </Card>

          {terms ? (
            <Card>
              <CardHeader title="Terms that would apply" subtitle={`Resolved for ${formatDate(deal.requestedDate ?? todayInCairo())}, not for today.`} />
              <p className="mt-2.5 text-[13px] font-semibold text-os-text">{describeTerm(terms.term)}</p>
              <p className="mt-0.5 text-[11.5px] text-os-muted">
                From {terms.agreement.ref}, effective {formatDate(terms.term.effectiveFrom)}
                {terms.term.effectiveTo ? ` to ${formatDate(terms.term.effectiveTo)}` : " and still open"}.
              </p>
              {terms.term.note ? <p className="mt-1.5 text-[11.5px] text-os-faint">{terms.term.note}</p> : null}
            </Card>
          ) : null}

          {deal.lostReason ? (
            <Card>
              <CardHeader title="Why it was lost" />
              <p className="mt-2 text-[13px] font-medium text-os-text">{deal.lostReason}</p>
              {deal.lostNote ? <p className="mt-1 text-[12.5px] leading-relaxed text-os-muted">{deal.lostNote}</p> : null}
            </Card>
          ) : null}

          {dealTrips.length ? (
            <Card>
              <CardHeader title="What it became" subtitle="The operation the deal handed over." />
              <ul className="mt-2.5 space-y-1.5">
                {dealTrips.map((trip) => (
                  <li key={trip.ref} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0">
                      <Link href={`/os/trips/${trip.ref}`} className="os-nums text-[12.5px] font-medium text-os-gold hover:underline">
                        {trip.ref}
                      </Link>
                      <span className="ml-1.5 text-[12px] text-os-muted">{trip.title}</span>
                    </span>
                    <span className="os-nums shrink-0 text-[11px] text-os-faint">{formatDate(trip.tripDate)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {((tasks ?? []) as { id: string; title: string; status: string; due_at: string | null }[]).length ? (
            <Card>
              <CardHeader title="Follow-ups" subtitle="On the same task list as everything else." />
              <ul className="mt-2.5 space-y-1.5">
                {((tasks ?? []) as { id: string; title: string; status: string; due_at: string | null }[]).map((t) => (
                  <li key={t.id} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                    <span className={t.status === "done" ? "text-os-faint line-through" : "text-os-text"}>{t.title}</span>
                    <span className="os-nums shrink-0 text-[11px] text-os-faint">
                      {t.due_at ? formatDate(t.due_at.slice(0, 10)) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
