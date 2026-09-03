import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getLead } from "@/lib/os/commercial/leads";
import { osdb, getOrg } from "@/lib/os/db";
import { formatDateTime, relativeTime } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Notice, Divider, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { ScoreBreakdown, formatMinutes } from "@/components/os/commercial";
import { LeadActions } from "./LeadActions";
import { EngagementLog } from "../../../partnerships/EngagementLog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return { title: `Enquiry ${ref}` };
}

// One enquiry, in full — including every factor behind its score. The number
// and the reasons are rendered by the same component, so there is no path
// where a score appears without its explanation.
export default async function LeadPage({ params }: { params: Promise<{ ref: string }> }) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "leads.view")) return <NoAccess what="enquiries" permission="leads.view" />;

  const { ref } = await params;
  const lead = await getLead(actor, ref);
  if (!lead) notFound();

  const db = osdb();
  const org = await getOrg();
  const [{ data: companies }, { data: owners }, { data: reasons }, { data: engagements }, { data: client }] = await Promise.all([
    can(actor, "companies.view")
      ? db.from("os_companies").select("id, name").eq("org_id", org.id).is("archived_at", null).order("name")
      : Promise.resolve({ data: [] }),
    can(actor, "leads.assign")
      ? db.from("os_employees").select("id, full_name").eq("org_id", org.id).eq("status", "active").is("archived_at", null).order("full_name")
      : Promise.resolve({ data: [] }),
    db.from("os_lost_reasons").select("key, label, controllable").eq("org_id", org.id).eq("active", true).order("sort_order"),
    can(actor, "engagements.view")
      ? db.from("os_engagements")
          .select("id, kind, direction, channel, subject, summary, outcome, happened_at, duration_minutes, participants, os_employees ( full_name )")
          .eq("lead_id", lead.id).order("happened_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    lead.clientId
      ? db.from("os_clients").select("id, code, full_name, lifetime_trips, lifetime_revenue_amount, vip").eq("id", lead.clientId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const workspace = lead.pipeline === "b2c" ? "reservations" : "partnerships";

  return (
    <>
      <PageHeader
        eyebrow={`Enquiry · ${lead.pipeline.toUpperCase()}`}
        title={lead.contactName ?? "No name given"}
        description={`${lead.ref} · arrived ${relativeTime(lead.receivedAt)} from ${lead.source}${lead.campaign ? ` (${lead.campaign})` : ""}.`}
        actions={<Link href={`/os/${workspace}`} className={buttonClass.ghost}><Icon.ArrowLeft size={15} />Back</Link>}
      />

      {lead.responseOverdue ? (
        <div className="mb-5">
          <Notice tone="red" title="Nobody has replied to this yet">
            It arrived {relativeTime(lead.receivedAt)} and is past the first-response target. Replying is the one factor
            in the score below that Egypt Eye controls.
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="What they asked for" />
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <Detail label="Interest" value={lead.interest ?? lead.typeName ?? "Not stated"} />
              <Detail label="When" value={lead.requestedDate ? `${lead.requestedDate}${lead.dateFlexible ? " (flexible)" : ""}` : "No date given"} />
              <Detail label="Party size" value={lead.guests ? `${lead.guests}` : "Not stated"} />
              <Detail
                label="Budget"
                value={lead.budgetAmount ? `${lead.budgetCurrency ?? ""} ${Math.round(lead.budgetAmount).toLocaleString()}` : "Not stated"}
              />
              <Detail label="Country" value={lead.country ?? "Unknown"} />
              <Detail label="Owner" value={lead.ownerName ?? "Unassigned"} />
            </dl>

            {lead.message ? (
              <>
                <Divider className="my-4" />
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">
                  In their words
                </p>
                <p className="whitespace-pre-wrap rounded-lg bg-black/[0.03] px-3 py-2.5 text-[13px] leading-relaxed text-os-text">
                  {lead.message}
                </p>
                <p className="mt-1.5 text-[11px] text-os-faint">
                  Kept exactly as it arrived. The client record is an interpretation of this; this is the evidence.
                </p>
              </>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="How to reach them" />
            <div className="mt-3 flex flex-wrap gap-2">
              {lead.contactPhone && can(actor, "clients.contact") ? (
                <a href={`tel:${lead.contactPhone}`} className={buttonClass.secondary}>{lead.contactPhone}</a>
              ) : null}
              {lead.contactEmail && can(actor, "clients.contact") ? (
                <a href={`mailto:${lead.contactEmail}`} className={buttonClass.secondary}>{lead.contactEmail}</a>
              ) : null}
              {!can(actor, "clients.contact") ? (
                <p className="text-[12.5px] text-os-muted">
                  Contact details need the client contact permission. Everything else about this enquiry is above.
                </p>
              ) : null}
            </div>
            {client ? (
              <>
                <Divider className="my-4" />
                <p className="text-[12.5px] leading-relaxed text-os-text">
                  Matched to{" "}
                  <Link href={`/os/clients/${client.id}`} className="font-medium text-os-gold hover:underline">
                    {client.full_name as string} ({client.code as string})
                  </Link>
                  {Number(client.lifetime_trips ?? 0) > 0
                    ? ` — ${client.lifetime_trips} trip${client.lifetime_trips === 1 ? "" : "s"} already on record.`
                    : " — no completed trips yet."}
                </p>
              </>
            ) : (
              <p className="mt-3 text-[11.5px] text-os-faint">
                No client record yet. Qualifying this enquiry matches them against the book before creating one.
              </p>
            )}
          </Card>

          {can(actor, "engagements.view") ? (
            <EngagementLog
              title="Contact history"
              engagements={(engagements ?? []) as never[]}
              target={{ leadId: lead.id, clientId: lead.clientId, dealId: null, companyId: lead.companyId }}
              canLog={can(actor, "engagements.log")}
            />
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Lead score" subtitle="Arithmetic over published rules — no model, no hidden weighting." />
            <div className="mt-3">
              <ScoreBreakdown score={lead.score} band={lead.scoreBand} factors={lead.scoreFactors} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Response" />
            <dl className="mt-3 space-y-2.5">
              <Detail label="Arrived" value={formatDateTime(lead.receivedAt)} />
              <Detail
                label="First reply"
                value={
                  lead.firstResponseAt
                    ? `${formatDateTime(lead.firstResponseAt)} · ${formatMinutes(lead.firstResponseMinutes ?? 0)}`
                    : "Not yet"
                }
              />
              <Detail label="Status" value={<Badge tone={lead.status === "converted" ? "green" : "neutral"}>{lead.status.replace(/_/g, " ")}</Badge>} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="What happens next" />
            <div className="mt-3">
              <LeadActions
                leadId={lead.id}
                leadRef={lead.ref}
                status={lead.status}
                hasFirstResponse={Boolean(lead.firstResponseAt)}
                suggestedTitle={`${lead.contactName ?? "Enquiry"} — ${lead.interest ?? lead.typeName ?? "trip"}`}
                pipeline={lead.pipeline}
                companies={((companies ?? []) as { id: string; name: string }[]).map((c) => ({ id: c.id, name: c.name }))}
                owners={((owners ?? []) as { id: string; full_name: string }[]).map((o) => ({ id: o.id, name: o.full_name }))}
                lostReasons={(reasons ?? []) as { key: string; label: string; controllable: boolean }[]}
                can={{
                  respond: can(actor, "leads.edit"),
                  qualify: can(actor, "deals.create"),
                  close: can(actor, "leads.edit"),
                  assign: can(actor, "leads.assign"),
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">{label}</dt>
      <dd className="mt-0.5 text-[13px] text-os-text">{value}</dd>
    </div>
  );
}
