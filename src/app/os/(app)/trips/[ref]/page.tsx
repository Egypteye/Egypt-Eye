import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTrip, getTripRecord } from "@/lib/os/trips";
import { computeReadiness } from "@/lib/os/readiness";
import { osdb } from "@/lib/os/db";
import { formatTime, formatDate, relativeTime } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { Card, CardHeader, Badge, Notice, buttonClass, Divider } from "@/components/os/ui";
import { CrewChips } from "@/components/os/trip";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

// The overview tab. Readiness first — because the whole point of the product
// is that a coordinator can tell in two seconds whether this trip is going to
// work — then the operational facts, then the people.
export default async function TripOverview({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;

  const upper = ref.toUpperCase();
  const [trip, record] = await Promise.all([getTrip(actor, upper), getTripRecord(actor, upper)]);
  if (!trip || !record) notFound();

  const readiness = await computeReadiness(trip.id);
  const db = osdb();

  const [travelers, itinerary, activity, contentJob, commercial] = await Promise.all([
    db.from("os_trip_travelers")
      .select("is_lead, os_travelers ( full_name, relationship, age_category, dietary_notes, special_requirements )")
      .eq("trip_id", trip.id),
    db.from("os_itinerary_items").select("seq, start_time, title, kind").eq("trip_id", trip.id).order("seq").limit(6),
    db.from("os_activity")
      .select("id, verb, summary, at, os_employees ( full_name )")
      .eq("trip_id", trip.id).order("at", { ascending: false }).limit(6),
    can(actor, "content.view")
      ? db.from("os_content_jobs").select("id, stage, promised_at, delivered_at").eq("trip_id", trip.id).maybeSingle()
      : Promise.resolve({ data: null }),
    // Where this trip came from commercially. The operation and the sale are
    // the same system, so the trip knows which deal closed it and which
    // partner's terms priced it.
    can(actor, "deals.view")
      ? db.from("os_trips")
          .select(
            "deal_id, company_id, agreement_id, commission_pct, commission_amount, currency, " +
            "os_deals ( ref, title, pipeline, source ), os_companies ( id, name ), os_agreements ( ref, title )",
          )
          .eq("id", trip.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const party = (travelers.data ?? []) as any[];
  const steps = (itinerary.data ?? []) as any[];
  const history = (activity.data ?? []) as any[];
  const content = contentJob.data as any;
  const origin = commercial.data as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  type ClientCard = {
    full_name: string; phone: string | null; whatsapp: string | null;
    email: string | null; language: string | null; nationality: string | null; preferences: string | null;
  };
  const clientContactVisible = can(actor, "clients.contact");
  let client: ClientCard | null = null;
  if (trip.clientId && can(actor, "clients.view")) {
    const { data } = await db.from("os_clients")
      .select("full_name, phone, whatsapp, email, language, nationality, preferences")
      .eq("id", trip.clientId).maybeSingle();
    client = (data as ClientCard | null) ?? null;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
      <div className="space-y-5">
        {/* -------------------------------------------------------------- */}
        {/* Readiness, explained line by line                               */}
        {/* -------------------------------------------------------------- */}
        <Card>
          <CardHeader
            title={`Readiness — ${readiness?.score ?? trip.readinessScore}%`}
            subtitle={
              readiness?.state === "green"
                ? "Everything this service needs is in place."
                : "The system will not mark this trip Ready until these are cleared."
            }
            action={
              <span className={`rounded-md px-2 py-0.5 text-[11.5px] font-semibold ${
                (readiness?.state ?? trip.readinessState) === "green" ? "bg-os-green-soft text-os-green"
                  : (readiness?.state ?? trip.readinessState) === "yellow" ? "bg-os-amber-soft text-os-amber"
                  : "bg-os-red-soft text-os-red"
              }`}>
                {(readiness?.state ?? trip.readinessState) === "green" ? "Ready" : (readiness?.state ?? trip.readinessState) === "yellow" ? "At risk" : "Not ready"}
              </span>
            }
          />

          <ul className="mt-3.5 space-y-2">
            {(readiness?.checks ?? []).map((check) => (
              <li key={check.key} className="flex items-start gap-2.5">
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${check.ok ? "bg-os-green-soft text-os-green" : "bg-os-red-soft text-os-red"}`}>
                  {check.ok ? <Icon.Check size={11} /> : <Icon.Close size={10} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[13px] ${check.ok ? "text-os-muted" : "font-medium text-os-text"}`}>{check.label}</span>
                  {!check.ok && check.blocker ? (
                    <span className="block text-[12px] leading-snug text-os-amber">{check.blocker}</span>
                  ) : null}
                </span>
                {!check.ok && check.fixHref ? (
                  <Link href={check.fixHref} className="shrink-0 text-[12px] font-semibold text-os-gold hover:underline">Fix</Link>
                ) : null}
              </li>
            ))}
            {!readiness?.checks.length ? (
              <li className="text-[13px] text-os-muted">
                This service type has no readiness requirements configured. Set them under Admin, services.
              </li>
            ) : null}
          </ul>
        </Card>

        {/* -------------------------------------------------------------- */}
        {/* Operational facts                                               */}
        {/* -------------------------------------------------------------- */}
        <Card>
          <CardHeader
            title="The operation"
            action={can(actor, "trips.edit") ? (
              <Link href={`/os/trips/${trip.ref}/edit`} className="text-[12.5px] font-medium text-os-gold hover:underline">Edit</Link>
            ) : null}
          />
          <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Fact label="Pickup" value={trip.pickupLocation ?? "Not recorded"} note={trip.pickupTime ? formatTime(trip.pickupTime) : undefined} warn={!trip.pickupLocation} />
            <Fact label="Drop-off" value={(record.dropoff_location as string) ?? "Same as pickup"} />
            <Fact label="Location" value={trip.locationName ?? "Not set"} />
            <Fact label="Source" value={trip.source ?? "Not recorded"} />
            <Fact label="Party" value={`${record.guests_adults} adult${record.guests_adults === 1 ? "" : "s"}${Number(record.guests_children) ? `, ${record.guests_children} children` : ""}`} />
            <Fact label="Created" value={`${formatDate(String(record.created_at).slice(0, 10))}`} note={relativeTime(record.created_at as string)} />
          </dl>

          {record.special_requests ? (
            <>
              <Divider className="my-4" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Special requests</p>
                <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-os-text">{record.special_requests as string}</p>
              </div>
            </>
          ) : null}

          {record.notes_internal ? (
            <div className="mt-3 rounded-lg bg-os-gold-soft/60 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a6415]">Internal note</p>
              <p className="mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-os-text">{record.notes_internal as string}</p>
            </div>
          ) : null}

          {record.emergency_notes ? (
            <div className="mt-3">
              <Notice tone="red" title="Emergency information">{record.emergency_notes as string}</Notice>
            </div>
          ) : null}
        </Card>

        {/* -------------------------------------------------------------- */}
        {/* Itinerary preview                                               */}
        {/* -------------------------------------------------------------- */}
        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader
              title="Itinerary"
              subtitle={steps.length ? `${steps.length} step${steps.length === 1 ? "" : "s"}` : "Nothing planned yet"}
              action={<Link href={`/os/trips/${trip.ref}/itinerary`} className="text-[12.5px] font-medium text-os-gold hover:underline">Full itinerary</Link>}
            />
          </div>
          {steps.length ? (
            <ul>
              {steps.map((step) => (
                <li key={step.seq} className="flex items-start gap-3 border-b border-os-line/60 px-4 py-2.5 last:border-0 sm:px-5">
                  <span className="os-nums w-12 shrink-0 text-[12.5px] font-semibold text-os-text">{formatTime(step.start_time)}</span>
                  <span className="min-w-0 flex-1 text-[13px] text-os-text">{step.title}</span>
                  <Badge tone="neutral">{String(step.kind).replace("_", " ")}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-5 text-[13px] text-os-muted sm:px-5">
              No itinerary yet. The crew has nothing to follow until there is one.
            </p>
          )}
        </Card>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Side column                                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-5">
        <Card>
          <CardHeader
            title="Crew and resources"
            action={can(actor, "trips.assign") ? (
              <Link href={`/os/trips/${trip.ref}/team`} className="text-[12.5px] font-medium text-os-gold hover:underline">Manage</Link>
            ) : null}
          />
          <div className="mt-3">
            {trip.crew.length ? (
              <CrewChips crew={trip.crew} missing={readiness?.blockers.filter((b) => ["guide", "driver", "photographer", "vehicle", "dress"].includes(b.key)).map((b) => b.key)} />
            ) : (
              <p className="text-[13px] text-os-muted">Nobody is assigned yet.</p>
            )}
          </div>
        </Card>

        {client ? (
          <Card>
            <CardHeader
              title="Client"
              action={trip.clientId && can(actor, "clients.view") ? (
                <Link href={`/os/clients/${trip.clientId}`} className="text-[12.5px] font-medium text-os-gold hover:underline">Profile</Link>
              ) : null}
            />
            <p className="mt-2.5 text-[14px] font-semibold text-os-text">{client.full_name}</p>
            <p className="text-[12.5px] text-os-muted">
              {[client.nationality, client.language].filter(Boolean).join(" · ") || "No details recorded"}
            </p>
            {clientContactVisible && (client.phone || client.whatsapp) ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {client.phone ? <a href={`tel:${client.phone.replace(/\s/g, "")}`} className={buttonClass.secondary}>Call</a> : null}
                {client.whatsapp ? (
                  <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className={buttonClass.secondary}>WhatsApp</a>
                ) : null}
              </div>
            ) : !clientContactVisible ? (
              <p className="mt-2 text-[11.5px] text-os-faint">Contact details need the client contact permission.</p>
            ) : null}
            {client.preferences ? (
              <p className="mt-3 rounded-lg bg-black/[0.03] px-3 py-2 text-[12.5px] leading-relaxed text-os-muted">{client.preferences}</p>
            ) : null}
          </Card>
        ) : null}

        {origin && (origin.os_deals || origin.os_companies) ? (
          <Card>
            <CardHeader title="Where this booking came from" subtitle="The commercial record behind the operation." />
            <dl className="mt-3 space-y-2.5 text-[13px]">
              {origin.os_deals ? (
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-[12px] text-os-muted">Deal</dt>
                  <dd>
                    <Link
                      href={`/os/${origin.os_deals.pipeline === "b2c" ? "reservations" : "partnerships"}/deals/${origin.os_deals.ref}`}
                      className="text-[12.5px] font-medium text-os-gold hover:underline"
                    >
                      {origin.os_deals.ref}
                    </Link>
                  </dd>
                </div>
              ) : null}
              {origin.os_companies ? (
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-[12px] text-os-muted">Booked through</dt>
                  <dd>
                    <Link href={`/os/partnerships/${origin.os_companies.id}`} className="text-[12.5px] font-medium text-os-gold hover:underline">
                      {origin.os_companies.name}
                    </Link>
                  </dd>
                </div>
              ) : null}
              {origin.commission_pct != null && can(actor, "companies.terms") ? (
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-[12px] text-os-muted">Commission</dt>
                  <dd className="os-nums text-[12.5px] font-medium text-os-text">
                    {origin.commission_pct}%
                    {origin.commission_amount != null
                      ? ` · ${formatMoney(Number(origin.commission_amount), origin.currency ?? actor.baseCurrency)}`
                      : ""}
                  </dd>
                </div>
              ) : null}
            </dl>
            {origin.os_agreements && can(actor, "agreements.view") ? (
              <p className="mt-3 text-[11px] leading-relaxed text-os-faint">
                Priced under {origin.os_agreements.ref}, at the rate in force on {trip.tripDate} — not at today&apos;s rate.
                Renegotiating the agreement later cannot restate what this trip earned.
              </p>
            ) : null}
          </Card>
        ) : null}

        {party.length ? (
          <Card>
            <CardHeader title="Travel party" subtitle={`${party.length} travelling`} />
            <ul className="mt-2.5 space-y-2">
              {party.map((row, i) => (
                <li key={i} className="text-[13px]">
                  <span className="font-medium text-os-text">{row.os_travelers?.full_name}</span>
                  {row.is_lead ? <Badge tone="gold" className="ml-1.5">Lead</Badge> : null}
                  <span className="block text-[11.5px] text-os-faint">
                    {[row.os_travelers?.relationship, row.os_travelers?.age_category].filter(Boolean).join(" · ")}
                  </span>
                  {row.os_travelers?.dietary_notes ? (
                    <span className="block text-[11.5px] text-os-amber">{row.os_travelers.dietary_notes}</span>
                  ) : null}
                  {row.os_travelers?.special_requirements ? (
                    <span className="block text-[11.5px] text-os-amber">{row.os_travelers.special_requirements}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {trip.money ? (
          <Card>
            <CardHeader
              title="Money"
              action={<Link href={`/os/trips/${trip.ref}/costs`} className="text-[12.5px] font-medium text-os-gold hover:underline">Detail</Link>}
            />
            <dl className="mt-2.5 space-y-1.5 text-[13px]">
              <Row label="Selling price" value={formatMoney(trip.money.sell, trip.money.currency)} strong />
              <Row label="Estimated cost" value={formatMoney(trip.money.estimatedCost, trip.money.currency)} />
              {trip.money.actualCost > 0 ? <Row label="Actual cost" value={formatMoney(trip.money.actualCost, trip.money.currency)} /> : null}
              <Row label="Margin" value={`${formatMoney(trip.money.margin, trip.money.currency)} · ${trip.money.marginPct}%`} strong />
              <Row label="Paid" value={formatMoney(trip.money.paid, trip.money.currency)} />
              {trip.money.sell - trip.money.paid > 0 ? (
                <Row label="Outstanding" value={formatMoney(trip.money.sell - trip.money.paid, trip.money.currency)} warn />
              ) : null}
            </dl>
          </Card>
        ) : null}

        {content ? (
          <Card>
            <CardHeader title="Content" subtitle="Post-shoot pipeline" />
            <p className="mt-2 text-[13.5px] font-semibold capitalize text-os-text">{String(content.stage).replace(/_/g, " ")}</p>
            {content.promised_at ? (
              <p className="text-[12px] text-os-muted">
                {content.delivered_at ? `Delivered ${relativeTime(content.delivered_at)}` : `Promised ${relativeTime(content.promised_at)}`}
              </p>
            ) : null}
            <Link href="/os/content" className="mt-2 inline-block text-[12.5px] font-medium text-os-gold hover:underline">Open the pipeline →</Link>
          </Card>
        ) : null}

        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3">
            <CardHeader
              title="Recent history"
              action={<Link href={`/os/trips/${trip.ref}/activity`} className="text-[12px] font-medium text-os-gold hover:underline">All</Link>}
            />
          </div>
          <ul>
            {history.length ? history.map((entry) => (
              <li key={entry.id} className="border-b border-os-line/60 px-4 py-2.5 last:border-0">
                <p className="text-[12.5px] leading-snug text-os-text">{entry.summary}</p>
                <p className="text-[11px] text-os-faint">
                  {entry.os_employees?.full_name ?? "System"} · {relativeTime(entry.at)}
                </p>
              </li>
            )) : (
              <li className="px-4 py-4 text-[12.5px] text-os-muted">Nothing recorded yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Fact({ label, value, note, warn }: { label: string; value: string; note?: string; warn?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">{label}</dt>
      <dd className={`mt-0.5 text-[13.5px] leading-snug ${warn ? "text-os-amber" : "text-os-text"}`}>
        {value}
        {note ? <span className="os-nums ml-1.5 text-[12px] text-os-muted">{note}</span> : null}
      </dd>
    </div>
  );
}

function Row({ label, value, strong, warn }: { label: string; value: string; strong?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-os-muted">{label}</dt>
      <dd className={`os-nums ${strong ? "font-semibold" : ""} ${warn ? "text-os-amber" : "text-os-text"}`}>{value}</dd>
    </div>
  );
}
