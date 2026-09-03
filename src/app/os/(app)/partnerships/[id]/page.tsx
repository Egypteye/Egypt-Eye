import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getCompany, companyContacts, HEALTH_LABEL } from "@/lib/os/commercial/companies";
import { listDeals } from "@/lib/os/commercial/deals";
import { listAgreements, agreementTerms, describeTerm } from "@/lib/os/commercial/agreements";
import { osdb, getOrg } from "@/lib/os/db";
import { formatDate, relativeTime } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, Notice, Table, Th, Td, Divider, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { HealthBreakdown, StagePill } from "@/components/os/commercial";
import { EngagementLog } from "../EngagementLog";
import { LinkContactPanel } from "./LinkContactPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partner" };

// ---------------------------------------------------------------------------
// ONE PARTNER, IN FULL
// ---------------------------------------------------------------------------
// The contacts table on this page is the clearest expression of the model:
// each person is an os_clients row, and the "Also a customer" column shows the
// trips they have taken PERSONALLY. There is no second contacts table, so a
// person cannot be a customer in one place and a contact in another and drift
// apart. That is the "avoid duplicate records" requirement, visible.
// ---------------------------------------------------------------------------
export default async function PartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "companies.view")) return <NoAccess what="partners" permission="companies.view" />;

  const { id } = await params;
  const company = await getCompany(actor, id);
  if (!company) notFound();

  const db = osdb();
  const org = await getOrg();
  const [contacts, deals, agreements, { data: engagements }, { data: trips }, { data: book }] = await Promise.all([
    companyContacts(company.id),
    can(actor, "deals.view") ? listDeals(actor, { companyId: company.id, statuses: ["open", "won", "lost"], limit: 60 }) : Promise.resolve([]),
    can(actor, "agreements.view") ? listAgreements(actor, { companyId: company.id }) : Promise.resolve([]),
    can(actor, "engagements.view")
      ? db.from("os_engagements")
          .select("id, kind, direction, channel, subject, summary, outcome, happened_at, duration_minutes, participants, os_employees ( full_name )")
          .eq("company_id", company.id).order("happened_at", { ascending: false }).limit(40)
      : Promise.resolve({ data: [] }),
    can(actor, "trips.view")
      ? db.from("os_trips").select("ref, title, trip_date, status, commission_pct, commission_amount, currency")
          .eq("company_id", company.id).order("trip_date", { ascending: false }).limit(20)
      : Promise.resolve({ data: [] }),
    // The whole client book, so the contact picker searches PEOPLE rather
    // than a separate contacts list. lifetime_trips comes with them, which is
    // what lets the picker say "has taken 2 trips with us personally".
    can(actor, "companies.edit") && can(actor, "clients.view")
      ? db.from("os_clients").select("id, code, full_name, email, lifetime_trips")
          .eq("org_id", org.id).is("archived_at", null).order("full_name").limit(500)
      : Promise.resolve({ data: [] }),
  ]);

  const activeAgreement = agreements.find((a) => a.status === "active");
  const terms = activeAgreement ? await agreementTerms(activeAgreement.id) : [];
  const alsoCustomers = contacts.filter((c) => c.ownTrips > 0);

  return (
    <>
      <PageHeader
        eyebrow="Partner"
        title={company.name}
        description={`${company.code} · ${company.kind.replace(/_/g, " ")}${company.city ? ` · ${company.city}` : ""}${company.country ? `, ${company.country}` : ""}`}
        actions={<Link href="/os/partnerships" className={buttonClass.ghost}><Icon.ArrowLeft size={15} />Back</Link>}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={company.status === "active" ? "green" : company.status === "prospect" ? "blue" : "neutral"}>
              {company.status}
            </Badge>
            {company.tier !== "standard" ? <Badge tone="gold">{company.tier}</Badge> : null}
            {company.creditHold ? <Badge tone="red">On credit hold</Badge> : null}
            <span className="text-[11.5px] text-os-faint">Owned by {company.ownerName ?? "nobody"}</span>
          </div>
        }
      />

      {company.creditHold ? (
        <div className="mb-5">
          <Notice tone="red" title="This partner is on credit hold">
            No deal for them can be marked won while the hold stands. Finance sets and releases it; a salesperson cannot
            close past it, which is the whole point of the block being here rather than in a policy document.
          </Notice>
        </div>
      ) : null}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Contacts" value={contacts.length} sub={alsoCustomers.length ? `${alsoCustomers.length} also travel with us` : undefined} />
        <Stat label="Open deals" value={deals.filter((d) => d.status === "open").length} />
        {company.lifetime ? (
          <>
            <Stat label="Trips booked" value={company.lifetime.trips} />
            <Stat label="Revenue" value={formatMoney(company.lifetime.revenue, company.lifetime.currency, { compact: true })} />
          </>
        ) : (
          <>
            <Stat label="Last spoken to" value={company.lastContactAt ? relativeTime(company.lastContactAt) : "Never"} />
            <Stat label="Agreements" value={agreements.length} />
          </>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader
                title="People"
                subtitle="Each of these is a person record, not a contact copy — which is why the last column can exist at all."
              />
              {can(actor, "companies.edit") ? (
                <div className="mt-3">
                  <LinkContactPanel
                    companyId={company.id}
                    people={((book ?? []) as { id: string; code: string; full_name: string; email: string | null; lifetime_trips: number }[])
                      .map((p) => ({ id: p.id, code: p.code, name: p.full_name, email: p.email, ownTrips: Number(p.lifetime_trips ?? 0) }))}
                    alreadyLinked={contacts.filter((c) => !c.endedOn).map((c) => c.clientId)}
                  />
                </div>
              ) : null}
            </div>
            {contacts.length ? (
              <Table className="rounded-none border-0">
                <thead>
                  <tr><Th>Name</Th><Th>Role here</Th><Th>Can they decide</Th><Th align="right">Also a customer</Th></tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.membershipId}>
                      <Td>
                        <Link href={`/os/clients/${contact.clientId}`} className="block">
                          <span className="block text-[13px] font-medium text-os-text">
                            {contact.name}
                            {contact.isPrimary ? <span className="ml-1.5 text-[11px] font-normal text-os-gold">main contact</span> : null}
                          </span>
                          <span className="block text-[11px] text-os-faint">{contact.code}{contact.email ? ` · ${contact.email}` : ""}</span>
                        </Link>
                      </Td>
                      <Td className="text-[12.5px] text-os-muted">
                        {contact.jobTitle ?? "—"}
                        {contact.endedOn ? <span className="block text-[11px] text-os-faint">left {formatDate(contact.endedOn)}</span> : null}
                      </Td>
                      <Td>
                        <Badge tone={["decision_maker", "signatory"].includes(contact.decisionRole) ? "green" : "neutral"}>
                          {contact.decisionRole.replace(/_/g, " ")}
                        </Badge>
                      </Td>
                      <Td align="right" className="text-[12px]">
                        {contact.ownTrips > 0 ? (
                          <span className="text-os-text">
                            <span className="os-nums font-medium">{contact.ownTrips}</span>
                            <span className="block text-[11px] text-os-faint">own trip{contact.ownTrips === 1 ? "" : "s"}</span>
                          </span>
                        ) : (
                          <span className="text-os-faint">—</span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="p-4 text-[12.5px] text-os-muted sm:p-5">
                Nobody is linked to this partner yet. A company with no named contact is a logo, not a relationship.
              </p>
            )}
            {alsoCustomers.length ? (
              <p className="border-t border-os-line px-4 py-3 text-[11.5px] leading-relaxed text-os-muted sm:px-5">
                {alsoCustomers.map((c) => c.name).join(", ")}{" "}
                {alsoCustomers.length === 1 ? "books" : "book"} with Egypt Eye personally as well as through this company.
                One record each — their private history and their role here are the same person, which is how this page can
                tell you at all.
              </p>
            ) : null}
          </Card>

          {can(actor, "deals.view") && deals.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader title="Deals" subtitle="Everything ever negotiated with this partner, won and lost." />
              </div>
              <Table className="rounded-none border-0">
                <thead>
                  <tr><Th>Deal</Th><Th>Stage</Th><Th>Owner</Th>{deals.some((d) => d.money) ? <Th align="right">Value</Th> : null}</tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id}>
                      <Td>
                        <Link href={`/os/partnerships/deals/${deal.ref}`} className="block">
                          <span className="block text-[13px] font-medium text-os-text">{deal.title}</span>
                          <span className="os-nums block text-[11px] text-os-faint">
                            {deal.ref}
                            {deal.status === "lost" && deal.lostReason ? ` · lost: ${deal.lostReason}` : ""}
                          </span>
                        </Link>
                      </Td>
                      <Td>
                        {deal.stageLabel ? <StagePill label={deal.stageLabel} color={deal.stageColor} /> : null}
                      </Td>
                      <Td className="text-[12px] text-os-muted">{deal.ownerName ?? "—"}</Td>
                      {deal.money ? (
                        <Td align="right" className="os-nums font-medium">
                          {formatMoney(deal.money.value, deal.money.currency, { compact: true })}
                        </Td>
                      ) : deals.some((d) => d.money) ? <Td /> : null}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ) : null}

          {can(actor, "engagements.view") ? (
            <EngagementLog
              engagements={(engagements ?? []) as never[]}
              target={{ companyId: company.id }}
              canLog={can(actor, "engagements.log")}
            />
          ) : null}

          {((trips ?? []) as { ref: string }[]).length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader
                  title="Trips booked through this partner"
                  subtitle="Each carries the commission that was in force on its own travel date, not today's."
                />
              </div>
              <Table className="rounded-none border-0">
                <thead>
                  <tr><Th>Trip</Th><Th>When</Th><Th>Status</Th>{can(actor, "companies.terms") ? <Th align="right">Commission</Th> : null}</tr>
                </thead>
                <tbody>
                  {((trips ?? []) as {
                    ref: string; title: string; trip_date: string; status: string;
                    commission_pct: number | null; commission_amount: number | null; currency: string;
                  }[]).map((trip) => (
                    <tr key={trip.ref}>
                      <Td>
                        <Link href={`/os/trips/${trip.ref}`} className="block">
                          <span className="os-nums block text-[12.5px] font-medium text-os-gold">{trip.ref}</span>
                          <span className="block text-[11.5px] text-os-muted">{trip.title}</span>
                        </Link>
                      </Td>
                      <Td className="os-nums text-[12px] text-os-muted">{formatDate(trip.trip_date)}</Td>
                      <Td><Badge tone="neutral">{String(trip.status).replace(/_/g, " ")}</Badge></Td>
                      {can(actor, "companies.terms") ? (
                        <Td align="right" className="os-nums text-[12px]">
                          {trip.commission_pct != null ? (
                            <>
                              {trip.commission_pct}%
                              {trip.commission_amount != null ? (
                                <span className="block text-[11px] text-os-faint">
                                  {formatMoney(Number(trip.commission_amount), trip.currency)}
                                </span>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-os-faint">—</span>
                          )}
                        </Td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Relationship health" subtitle="Recomputed from what is on file. Never typed in." />
            <div className="mt-3">
              <HealthBreakdown score={company.healthScore} state={company.healthState} factors={company.healthFactors} />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-os-faint">
              {HEALTH_LABEL[company.healthState] ?? company.healthState}. Several of the factors above measure Egypt Eye
              rather than the partner — a relationship nobody has called in six months is our doing, and a score that only
              graded them would quietly blame them for it.
            </p>
          </Card>

          {can(actor, "companies.terms") && company.terms ? (
            <Card>
              <CardHeader title="Commercial terms" />
              <dl className="mt-3 space-y-2.5">
                <Row label="Default commission" value={company.terms.commissionPct != null ? `${company.terms.commissionPct}%` : "Not set"} />
                <Row label="Payment terms" value={company.terms.paymentTerms ?? "Not set"} />
                <Row label="Invoices in" value={company.terms.currency} />
                <Row
                  label="Credit limit"
                  value={company.terms.creditLimit != null ? formatMoney(company.terms.creditLimit, company.terms.currency) : "None set"}
                />
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-os-faint">
                These are the defaults a new agreement starts from. What actually prices a booking is the effective-dated
                term below, resolved by the travel date.
              </p>
            </Card>
          ) : null}

          {can(actor, "agreements.view") ? (
            <Card>
              <CardHeader
                title="Agreements"
                action={
                  can(actor, "agreements.create") ? (
                    <Link href={`/os/partnerships/${company.id}/agreements/new`} className={buttonClass.ghost}>
                      <Icon.Plus size={14} />Draft
                    </Link>
                  ) : null
                }
              />
              {agreements.length ? (
                <ul className="mt-3 space-y-3">
                  {agreements.map((agreement) => (
                    <li key={agreement.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-[12.5px] font-medium text-os-text">{agreement.title}</span>
                        <Badge tone={agreement.status === "active" ? "green" : agreement.status === "expired" ? "neutral" : "blue"}>
                          {agreement.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="os-nums mt-0.5 text-[11px] text-os-faint">
                        {agreement.ref}
                        {agreement.startsOn ? ` · from ${formatDate(agreement.startsOn)}` : ""}
                        {agreement.endsOn ? ` to ${formatDate(agreement.endsOn)}` : ""}
                        {agreement.daysToExpiry != null && agreement.daysToExpiry >= 0 && agreement.daysToExpiry < 90
                          ? ` · ${agreement.daysToExpiry} days left`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[12px] text-os-muted">
                  Nothing signed. Every booking is negotiated from scratch until there is.
                </p>
              )}

              {terms.length ? (
                <>
                  <Divider className="my-4" />
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">
                    Terms on {activeAgreement?.ref}
                  </p>
                  <ul className="space-y-2.5">
                    {terms.map((term) => (
                      <li key={term.id} className={term.inForce ? "" : "opacity-60"}>
                        <p className="text-[12.5px] font-medium text-os-text">
                          {describeTerm(term)}
                          {term.tripTypeName ? <span className="font-normal text-os-muted"> · {term.tripTypeName}</span> : null}
                          {term.inForce ? <span className="ml-1.5 text-[11px] font-normal text-os-green">in force</span> : null}
                        </p>
                        <p className="os-nums text-[11px] text-os-faint">
                          {formatDate(term.effectiveFrom)}
                          {term.effectiveTo ? ` to ${formatDate(term.effectiveTo)}` : " onwards"}
                          {term.supersedesTermId ? " · replaced an earlier rate" : ""}
                        </p>
                        {term.note ? <p className="text-[11px] leading-snug text-os-muted">{term.note}</p> : null}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-os-faint">
                    Terms are superseded, never edited. A closed window above is what makes a commission statement from
                    last spring still defensible.
                  </p>
                </>
              ) : null}
            </Card>
          ) : null}

          {company.notes ? (
            <Card>
              <CardHeader title="Notes" />
              <p className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-os-muted">{company.notes}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[12px] text-os-muted">{label}</dt>
      <dd className="text-[12.5px] font-medium text-os-text">{value}</dd>
    </div>
  );
}
