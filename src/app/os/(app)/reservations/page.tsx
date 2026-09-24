import Link from "next/link";
import { getActor, can, canAny } from "@/lib/os/actor";
import { listLeads } from "@/lib/os/commercial/leads";
import { pipelineBoard } from "@/lib/os/commercial/deals";
import { pipelineSummary, responseSummary } from "@/lib/os/commercial/analytics";
import { commercialScope, commercialScopeNote } from "@/lib/os/commercial/scope";
import { formatMoney } from "@/lib/os/money";
import { relativeTime } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader, Stat, Table, Th, EmptyState, Notice, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { DealCard, LeadRow } from "@/components/os/commercial";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reservations" };

// ---------------------------------------------------------------------------
// B2C — RESERVATIONS
// ---------------------------------------------------------------------------
// One of the two lenses on a single commercial model. Everything here reads
// os_leads and os_deals filtered to pipeline = 'b2c'; nothing is duplicated
// from the B2B side and nothing is copied between them. A guest who turns out
// to run an agency is re-pointed, not re-entered.
//
// The screen is ordered by what actually decides whether an enquiry converts:
// response time first, then the enquiries themselves, then the pipeline.
// ---------------------------------------------------------------------------
export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!canAny(actor, "leads.view", "deals.view")) {
    return <NoAccess what="the reservations workspace" permission="leads.view" />;
  }

  const params = await searchParams;
  const one = (key: string) => (Array.isArray(params[key]) ? params[key]![0] : params[key]) as string | undefined;
  const mineOnly = one("who") === "me";

  const [leads, board, summary, response] = await Promise.all([
    listLeads(actor, {
      pipeline: "b2c",
      statuses: ["new", "contacted", "qualifying", "qualified"],
      mineOnly,
      limit: 60,
    }),
    can(actor, "deals.view") ? pipelineBoard(actor, "b2c", { mineOnly }) : Promise.resolve([]),
    pipelineSummary(actor, "b2c"),
    responseSummary(actor),
  ]);

  const scope = commercialScope(actor, "leads.view");
  const note = commercialScopeNote(scope);
  const unanswered = leads.filter((l) => l.responseOverdue);

  return (
    <>
      <PageHeader
        eyebrow="Sell · B2C"
        title="Reservations"
        description="Enquiries, quotes and bookings for people travelling with us directly."
        actions={
          <>
            <Link
              href={`/os/reservations?who=${mineOnly ? "all" : "me"}`}
              className={buttonClass.secondary}
            >
              {mineOnly ? "Everyone's" : "Only mine"}
            </Link>
            {can(actor, "leads.create") ? (
              <Link href="/os/reservations/new" className={buttonClass.gold}><Icon.Plus size={15} />Log an enquiry</Link>
            ) : null}
          </>
        }
        meta={note ? <p className="text-[12px] text-os-faint">{note}</p> : null}
      />

      {/* Response time first, because it is the one factor Egypt Eye controls
          and the strongest single predictor of whether an enquiry converts. */}
      {response ? (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Waiting for a first reply"
            value={response.waiting}
            tone={response.overdue ? "red" : undefined}
            sub={response.overdue ? `${response.overdue} past the ${response.targetMinutes}-minute target` : "All inside target"}
          />
          <Stat
            label="Median reply time"
            value={response.medianMinutes != null ? `${response.medianMinutes}m` : "—"}
            sub={`Target ${response.targetMinutes} minutes`}
          />
          <Stat
            label="Answered within target"
            value={response.answered ? `${Math.round((response.withinTarget / response.answered) * 100)}%` : "—"}
            sub={response.answered ? `of ${response.answered} answered in 30 days` : "Nothing answered yet"}
          />
          {summary?.money ? (
            <Stat
              label="Open pipeline"
              value={formatMoney(summary.money.openValue, summary.money.currency, { compact: true })}
              sub={`${formatMoney(summary.money.weighted, summary.money.currency, { compact: true })} weighted by stage`}
            />
          ) : (
            <Stat label="Open deals" value={summary?.open ?? 0} sub={summary?.stalled ? `${summary.stalled} stalled` : "None stalled"} />
          )}
        </div>
      ) : null}

      {unanswered.length ? (
        <div className="mb-5">
          <Notice tone="red" title={`${unanswered.length} enquir${unanswered.length === 1 ? "y has" : "ies have"} gone past the reply target`}>
            {unanswered.slice(0, 3).map((l) => `${l.contactName ?? l.ref} (${relativeTime(l.receivedAt)})`).join(", ")}
            {unanswered.length > 3 ? ` and ${unanswered.length - 3} more` : ""}. Replying first is the cheapest advantage
            Egypt Eye has over a competitor with the same photographs.
          </Notice>
        </div>
      ) : null}

      {can(actor, "leads.view") ? (
        <Card padded={false} className="mb-6">
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader
              title="Enquiries"
              subtitle="Not an inbox — a record that an enquiry arrived, where from, and what happened next."
            />
          </div>
          {leads.length ? (
            <Table className="rounded-none border-0">
              <thead>
                <tr>
                  <Th>Who</Th>
                  <Th>What they want</Th>
                  <Th>Score</Th>
                  <Th>First reply</Th>
                  <Th>Owner</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} href={`/os/reservations/leads/${lead.ref}`} />
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="p-4">
              <EmptyState
                title="No open enquiries"
                description="Everything that has come in has been answered and either qualified or closed."
                icon={<Icon.Chat size={26} />}
              />
            </div>
          )}
        </Card>
      ) : null}

      {can(actor, "deals.view") ? (
        <>
          <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold text-os-text">Pipeline</h2>
              <p className="mt-0.5 text-[12.5px] text-os-muted">
                Stages are configuration. Each one declares what must be true before a deal can leave it.
              </p>
            </div>
          </div>
          <div className="os-scroll -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-3">
              {board.map(({ stage, deals }) => (
                <div key={stage.id} className="w-[260px] shrink-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-os-text">
                      <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                      {stage.label}
                    </span>
                    <span className="os-nums text-[11.5px] text-os-faint">{deals.length}</span>
                  </div>
                  <p className="mb-2 text-[11px] leading-snug text-os-faint">{stage.description}</p>
                  <div className="space-y-2">
                    {deals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} href={`/os/reservations/deals/${deal.ref}`} />
                    ))}
                    {!deals.length ? (
                      <p className="rounded-lg border border-dashed border-os-line px-3 py-4 text-center text-[11.5px] text-os-faint">
                        Nothing here
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
