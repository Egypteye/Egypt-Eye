import Link from "next/link";
import { getActor, can, canAny } from "@/lib/os/actor";
import { listCompanies, HEALTH_LABEL } from "@/lib/os/commercial/companies";
import { pipelineBoard } from "@/lib/os/commercial/deals";
import { listLeads } from "@/lib/os/commercial/leads";
import { listAgreements } from "@/lib/os/commercial/agreements";
import { pipelineSummary } from "@/lib/os/commercial/analytics";
import { commercialScope, commercialScopeNote } from "@/lib/os/commercial/scope";
import { formatMoney } from "@/lib/os/money";
import { formatDate, relativeTime } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader, Stat, Table, Th, Td, Badge, EmptyState, Notice, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { DealCard, ScorePill } from "@/components/os/commercial";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partnerships" };

// ---------------------------------------------------------------------------
// B2B — SALES AND PARTNERSHIPS
// ---------------------------------------------------------------------------
// The second lens on the SAME model. os_deals filtered to pipeline = 'b2b',
// os_leads the same, and the people at these companies are os_clients rows —
// the identical table a private traveller lives in. That is what lets this
// page say "Olivia books with us privately too" without a second record.
//
// Ordered by what a partnership manager opens it to find out: which
// relationships are slipping, what is moving, and what expires soon.
// ---------------------------------------------------------------------------
export default async function PartnershipsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!canAny(actor, "companies.view", "deals.view")) {
    return <NoAccess what="the partnerships workspace" permission="companies.view" />;
  }

  const params = await searchParams;
  const one = (key: string) => (Array.isArray(params[key]) ? params[key]![0] : params[key]) as string | undefined;
  const mineOnly = one("who") === "me";

  const [companies, board, summary, leads, expiring] = await Promise.all([
    listCompanies(actor, { mineOnly, limit: 200 }),
    can(actor, "deals.view") ? pipelineBoard(actor, "b2b", { mineOnly }) : Promise.resolve([]),
    pipelineSummary(actor, "b2b"),
    can(actor, "leads.view")
      ? listLeads(actor, { pipeline: "b2b", statuses: ["new", "contacted", "qualifying", "qualified"], mineOnly, limit: 20 })
      : Promise.resolve([]),
    can(actor, "agreements.view")
      ? listAgreements(actor, { statuses: ["active"], expiringWithinDays: 90 })
      : Promise.resolve([]),
  ]);

  const note = commercialScopeNote(commercialScope(actor, "companies.view"));
  const atRisk = companies.filter((c) => ["at_risk", "slipping"].includes(c.healthState));
  const onHold = companies.filter((c) => c.creditHold);

  return (
    <>
      <PageHeader
        eyebrow="Sell · B2B"
        title="Sales and partnerships"
        description="Agencies, operators, hotels and corporates — the relationships that book through somebody else."
        actions={
          <>
            <Link href={`/os/partnerships?who=${mineOnly ? "all" : "me"}`} className={buttonClass.secondary}>
              {mineOnly ? "Everyone's" : "Only mine"}
            </Link>
            {can(actor, "companies.create") ? (
              <Link href="/os/partnerships/new" className={buttonClass.gold}><Icon.Plus size={15} />Register a partner</Link>
            ) : null}
          </>
        }
        meta={note ? <p className="text-[12px] text-os-faint">{note}</p> : null}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Partners" value={companies.length} sub={`${companies.filter((c) => c.status === "active").length} active`} />
        <Stat
          label="Relationships slipping"
          value={atRisk.length}
          tone={atRisk.length ? "amber" : undefined}
          sub={atRisk.length ? "Health score, with its reasons" : "All steady or strong"}
        />
        {summary?.money ? (
          <Stat
            label="Open pipeline"
            value={formatMoney(summary.money.openValue, summary.money.currency, { compact: true })}
            sub={`${formatMoney(summary.money.weighted, summary.money.currency, { compact: true })} weighted`}
          />
        ) : (
          <Stat label="Open deals" value={summary?.open ?? 0} />
        )}
        <Stat
          label="Agreements expiring"
          value={expiring.length}
          tone={expiring.length ? "amber" : undefined}
          sub={expiring.length ? "Inside 90 days" : "Nothing due"}
        />
      </div>

      {onHold.length ? (
        <div className="mb-5">
          <Notice tone="red" title={`${onHold.length} partner${onHold.length === 1 ? " is" : "s are"} on credit hold`}>
            {onHold.map((c) => c.name).join(", ")}. Deals for these partners cannot be marked won until finance clears the
            balance or somebody accepts the exposure through an approval.
          </Notice>
        </div>
      ) : null}

      {expiring.length ? (
        <div className="mb-5">
          <Notice tone="amber" title="Agreements coming to an end">
            {expiring.slice(0, 3).map((a) => `${a.companyName ?? a.ref} (${a.daysToExpiry}d)`).join(", ")}
            {expiring.length > 3 ? ` and ${expiring.length - 3} more` : ""}. A renewal handled at ninety days is a
            conversation; one handled at five is a concession.
          </Notice>
        </div>
      ) : null}

      {can(actor, "deals.view") && board.length ? (
        <div className="mb-6">
          <div className="mb-2.5">
            <h2 className="text-[15px] font-semibold text-os-text">Pipeline</h2>
            <p className="mt-0.5 text-[12.5px] text-os-muted">
              Longer and slower than B2C, because it ends in a contract rather than a booking.
            </p>
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
                      <DealCard key={deal.id} deal={deal} href={`/os/partnerships/deals/${deal.ref}`} />
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
        </div>
      ) : null}

      {leads.length ? (
        <Card padded={false} className="mb-6">
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader title="Partner enquiries" subtitle="Companies that have approached us, before they are qualified." />
          </div>
          <Table className="rounded-none border-0">
            <thead>
              <tr><Th>Who</Th><Th>Company</Th><Th>Score</Th><Th>Arrived</Th><Th>Status</Th></tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <Td>
                    <Link href={`/os/reservations/leads/${lead.ref}`} className="block">
                      <span className="block text-[13px] font-medium text-os-text">{lead.contactName ?? "No name"}</span>
                      <span className="os-nums block text-[11px] text-os-faint">{lead.ref} · {lead.source}</span>
                    </Link>
                  </Td>
                  <Td className="text-[12.5px] text-os-muted">{lead.companyName ?? "Not stated"}</Td>
                  <Td><ScorePill score={lead.score} band={lead.scoreBand} href={`/os/reservations/leads/${lead.ref}`} /></Td>
                  <Td className="text-[11.5px] text-os-muted">{relativeTime(lead.receivedAt)}</Td>
                  <Td><Badge tone={lead.responseOverdue ? "red" : "neutral"}>{lead.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : null}

      {can(actor, "companies.view") ? (
        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader
              title="The partner book"
              subtitle="Health is recomputed from what is on file — contact, bookings, pipeline and the contract — never typed in."
            />
          </div>
          {companies.length ? (
            <Table className="rounded-none border-0">
              <thead>
                <tr>
                  <Th>Partner</Th>
                  <Th>Health</Th>
                  <Th>Main contact</Th>
                  <Th>Last spoken to</Th>
                  <Th>Open</Th>
                  {can(actor, "companies.terms") ? <Th>Terms</Th> : null}
                  {companies.some((c) => c.lifetime) ? <Th align="right">Lifetime</Th> : null}
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <Td>
                      <Link href={`/os/partnerships/${company.id}`} className="block">
                        <span className="block text-[13px] font-medium text-os-text">
                          {company.name}
                          {company.creditHold ? <span className="ml-1.5 text-[11px] font-normal text-os-red">on hold</span> : null}
                        </span>
                        <span className="block text-[11px] text-os-faint">
                          {company.code} · {company.kind.replace(/_/g, " ")}
                          {company.city ? ` · ${company.city}` : ""}
                          {company.tier !== "standard" ? ` · ${company.tier}` : ""}
                        </span>
                      </Link>
                    </Td>
                    <Td>
                      <Link
                        href={`/os/partnerships/${company.id}`}
                        title="Open to see every factor behind this number"
                        className="os-nums inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold"
                        style={{ background: healthTone(company.healthState).bg, color: healthTone(company.healthState).fg }}
                      >
                        {company.healthScore}
                        <span className="font-normal">{HEALTH_LABEL[company.healthState] ?? company.healthState}</span>
                      </Link>
                    </Td>
                    <Td className="text-[12px] text-os-muted">
                      {company.primaryContactName ?? <span className="text-os-amber">None named</span>}
                      {company.contactCount > 1 ? (
                        <span className="block text-[11px] text-os-faint">+{company.contactCount - 1} more</span>
                      ) : null}
                    </Td>
                    <Td className="text-[11.5px] text-os-muted">
                      {company.lastContactAt ? relativeTime(company.lastContactAt) : <span className="text-os-amber">Never</span>}
                    </Td>
                    <Td className="os-nums text-[12px]">{company.openDeals || "—"}</Td>
                    {can(actor, "companies.terms") ? (
                      <Td className="text-[12px] text-os-muted">
                        {company.terms?.commissionPct != null ? `${company.terms.commissionPct}%` : "—"}
                        {company.agreementEndsOn ? (
                          <span className="block text-[11px] text-os-faint">to {formatDate(company.agreementEndsOn)}</span>
                        ) : null}
                      </Td>
                    ) : null}
                    {company.lifetime ? (
                      <Td align="right" className="os-nums font-medium">
                        {formatMoney(company.lifetime.revenue, company.lifetime.currency, { compact: true })}
                        <span className="block text-[11px] font-normal text-os-faint">{company.lifetime.trips} trips</span>
                      </Td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="p-4">
              <EmptyState
                title="No partners yet"
                description="Register the agencies and operators that book through us, so their terms and their history are company knowledge rather than one person's contacts list."
                icon={<Icon.Building size={26} />}
                action={can(actor, "companies.create") ? <Link href="/os/partnerships/new" className={buttonClass.gold}>Register the first one</Link> : undefined}
              />
            </div>
          )}
        </Card>
      ) : null}
    </>
  );
}

function healthTone(state: string): { bg: string; fg: string } {
  if (state === "strong") return { bg: "#5c7a5f22", fg: "#3f5c42" };
  if (state === "steady") return { bg: "#4a7c8c22", fg: "#345b66" };
  if (state === "slipping") return { bg: "#c9a22722", fg: "#7a6415" };
  if (state === "dormant") return { bg: "#7c8a9122", fg: "#5a666c" };
  return { bg: "#b91c1c22", fg: "#9a2020" };
}
