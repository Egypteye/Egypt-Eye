import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { pipelineSummary, sourcePerformance, lossBreakdown, partnerRevenue, responseSummary } from "@/lib/os/commercial/analytics";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Stat, Table, Th, Td, EmptyState, Notice } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Commercial reporting" };

// ---------------------------------------------------------------------------
// COMMERCIAL REPORTING
// ---------------------------------------------------------------------------
// Derived at read time from the rows the workspaces show, so a number here and
// a number on the board can never disagree. Two habits throughout:
//
//   * A conversion rate is always shown with its denominator. "38%" with no
//     "of 21" behind it is a figure nobody can sanity-check.
//   * Losses are split by whether Egypt Eye could have changed them. A
//     quarter lost to price is a pricing decision; a quarter lost to
//     cancelled travel is weather, and a list that mixes the two teaches
//     nothing.
// ---------------------------------------------------------------------------
export default async function CommercialPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "commercial.analytics")) {
    return <NoAccess what="commercial reporting" permission="commercial.analytics" />;
  }

  const [b2c, b2b, sources, losses, partners, response] = await Promise.all([
    pipelineSummary(actor, "b2c"),
    pipelineSummary(actor, "b2b"),
    sourcePerformance(actor),
    lossBreakdown(actor),
    partnerRevenue(actor),
    responseSummary(actor, 90),
  ]);

  const showMoney = can(actor, "deals.value");
  const controllableLosses = losses.filter((l) => l.controllable);
  const uncontrollableLosses = losses.filter((l) => !l.controllable);
  const totalLost = losses.reduce((t, l) => t + l.count, 0);

  return (
    <>
      <PageHeader
        eyebrow="Sell"
        title="Commercial reporting"
        description="One pipeline, two workspaces, and the same numbers behind both."
      />

      {!showMoney ? (
        <div className="mb-5">
          <Notice tone="blue" title="Counts only, not values">
            You can see how many deals are moving and how they convert, but not what they are worth — that needs the deal
            value permission. Nothing below is blanked out; the figures are simply not in the page.
          </Notice>
        </div>
      ) : null}

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        {[b2c, b2b].map((summary) =>
          summary ? (
            <Card key={summary.pipeline}>
              <CardHeader
                title={summary.pipeline === "b2c" ? "B2C — Reservations" : "B2B — Sales and partnerships"}
                subtitle={`${summary.open} open, ${summary.won} won, ${summary.lost} lost`}
                action={
                  <Link
                    href={summary.pipeline === "b2c" ? "/os/reservations" : "/os/partnerships"}
                    className="text-[12px] font-medium text-os-gold hover:underline"
                  >
                    Open
                  </Link>
                }
              />
              {summary.money ? (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Stat label="Open value" value={formatMoney(summary.money.openValue, summary.money.currency, { compact: true })} />
                  <Stat
                    label="Weighted"
                    value={formatMoney(summary.money.weighted, summary.money.currency, { compact: true })}
                    sub="By each stage's own probability"
                  />
                </div>
              ) : null}

              <div className="mt-4 space-y-1.5">
                {summary.stages.map((stage) => {
                  const share = summary.open ? (stage.count / summary.open) * 100 : 0;
                  return (
                    <div key={stage.key}>
                      <div className="flex items-baseline justify-between gap-3 text-[12px]">
                        <span className="text-os-text">{stage.label}</span>
                        <span className="os-nums text-os-muted">
                          {stage.count}
                          {stage.value != null && stage.value > 0 ? (
                            <span className="ml-1.5 text-os-faint">
                              {formatMoney(stage.value, summary.money?.currency ?? actor.baseCurrency, { compact: true })}
                            </span>
                          ) : null}
                        </span>
                      </div>
                      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
                        <div className="h-full rounded-full" style={{ width: `${share}%`, background: stage.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {summary.stalled ? (
                <p className="mt-3 text-[11.5px] text-os-amber">
                  {summary.stalled} deal{summary.stalled === 1 ? " has" : "s have"} sat past what their stage tolerates.
                </p>
              ) : (
                <p className="mt-3 text-[11.5px] text-os-faint">Nothing has stalled.</p>
              )}

              {summary.won + summary.lost > 0 ? (
                <p className="mt-2 text-[11.5px] text-os-muted">
                  Win rate{" "}
                  <span className="font-semibold text-os-text">
                    {Math.round((summary.won / (summary.won + summary.lost)) * 100)}%
                  </span>{" "}
                  of {summary.won + summary.lost} closed.
                </p>
              ) : null}
            </Card>
          ) : null,
        )}
      </div>

      {response ? (
        <Card className="mb-6">
          <CardHeader
            title="How fast enquiries are answered"
            subtitle={`Against the ${response.targetMinutes}-minute target, over 90 days. The one factor entirely within Egypt Eye's control.`}
          />
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Answered" value={response.answered} />
            <Stat
              label="Inside target"
              value={response.answered ? `${Math.round((response.withinTarget / response.answered) * 100)}%` : "—"}
              sub={response.answered ? `${response.withinTarget} of ${response.answered}` : undefined}
            />
            <Stat label="Median" value={response.medianMinutes != null ? `${response.medianMinutes}m` : "—"} />
            <Stat
              label="Still waiting"
              value={response.waiting}
              tone={response.overdue ? "red" : undefined}
              sub={response.overdue ? `${response.overdue} past target` : "All inside target"}
            />
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader
              title="Where business comes from"
              subtitle="Enquiries, not impressions — the OS has no advertising data and will not invent a cost per lead."
            />
          </div>
          {sources.length ? (
            <Table className="rounded-none border-0">
              <thead>
                <tr>
                  <Th>Channel</Th>
                  <Th align="right">Enquiries</Th>
                  <Th align="right">Answered</Th>
                  <Th align="right">Won</Th>
                  {showMoney ? <Th align="right">Revenue</Th> : null}
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.source}>
                    <Td>
                      <span className="text-[13px] font-medium text-os-text">{source.source}</span>
                      {source.medianResponseMinutes != null ? (
                        <span className="block text-[11px] text-os-faint">
                          median reply {source.medianResponseMinutes}m
                        </span>
                      ) : null}
                    </Td>
                    <Td align="right" className="os-nums">{source.leads}</Td>
                    <Td align="right" className="os-nums text-os-muted">{source.answered}</Td>
                    <Td align="right" className="os-nums">
                      {source.won}
                      <span className="block text-[11px] text-os-faint">
                        {source.conversionPct}% of {source.leads}
                      </span>
                    </Td>
                    {showMoney ? (
                      <Td align="right" className="os-nums font-medium">
                        {source.revenue ? formatMoney(source.revenue, actor.baseCurrency, { compact: true }) : "—"}
                      </Td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="p-4">
              <EmptyState title="No enquiries in the window" description="Nothing has come in to attribute yet." icon={<Icon.Chart size={24} />} />
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Why deals are lost"
            subtitle="Split by whether we could have changed it. That split is the entire point of the field."
          />
          {totalLost ? (
            <div className="mt-3 space-y-4">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-os-red">
                  Things we could have changed
                </p>
                {controllableLosses.length ? (
                  <ul className="space-y-1.5">
                    {controllableLosses.map((loss) => (
                      <li key={loss.reason} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                        <span className="text-os-text">{loss.reason}</span>
                        <span className="os-nums shrink-0 text-os-muted">
                          {loss.count}
                          {loss.value ? (
                            <span className="ml-1.5 text-os-faint">
                              {formatMoney(loss.value, actor.baseCurrency, { compact: true })}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[12px] text-os-faint">Nothing in this half.</p>
                )}
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">
                  Things we could not
                </p>
                {uncontrollableLosses.length ? (
                  <ul className="space-y-1.5">
                    {uncontrollableLosses.map((loss) => (
                      <li key={loss.reason} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                        <span className="text-os-muted">{loss.reason}</span>
                        <span className="os-nums shrink-0 text-os-faint">
                          {loss.count}
                          {loss.value ? (
                            <span className="ml-1.5">{formatMoney(loss.value, actor.baseCurrency, { compact: true })}</span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[12px] text-os-faint">Nothing in this half.</p>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-os-faint">
                {controllableLosses.reduce((t, l) => t + l.count, 0)} of {totalLost} losses were within our control.
                That number, not the total, is the one worth acting on.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[12.5px] text-os-muted">Nothing has been recorded as lost yet.</p>
          )}
        </Card>
      </div>

      {partners.length ? (
        <Card padded={false} className="mt-5">
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader
              title="What each partnership earns"
              subtitle="From the attribution snapshots written when a trip completes — not recalculated from today's terms."
            />
          </div>
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>Partner</Th>
                <Th align="right">Trips</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">Commission paid</Th>
                <Th align="right">Net to us</Th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.companyId}>
                  <Td>
                    <Link href={`/os/partnerships/${partner.companyId}`} className="text-[13px] font-medium text-os-text hover:text-os-gold">
                      {partner.name}
                    </Link>
                  </Td>
                  <Td align="right" className="os-nums">{partner.trips}</Td>
                  <Td align="right" className="os-nums">{formatMoney(partner.revenue, partner.currency)}</Td>
                  <Td align="right" className="os-nums text-os-muted">{formatMoney(partner.commission, partner.currency)}</Td>
                  <Td align="right" className="os-nums font-medium">
                    {formatMoney(partner.revenue - partner.commission, partner.currency)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : null}
    </>
  );
}
