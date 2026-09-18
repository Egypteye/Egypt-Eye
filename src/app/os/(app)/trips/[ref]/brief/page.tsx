import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTripRecord, getTrip } from "@/lib/os/trips";
import { osdb } from "@/lib/os/db";
import { formatLongDate, formatTime, formatDuration } from "@/lib/os/dates";
import { PrintButton } from "./PrintButton";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trip brief" };

// ---------------------------------------------------------------------------
// THE TRIP BRIEF
// ---------------------------------------------------------------------------
// Generated, never retyped. Everything on this page already exists somewhere in
// the system, and a brief assembled by hand is a brief that goes stale the
// moment a driver changes.
//
// It prints cleanly to one or two A4 pages because some of this operation still
// runs on paper: a driver with no data signal, a guide handing a sheet to a
// site inspector, a coordinator's clipboard at 05:30.
//
// Money is deliberately absent even for people who can see it. This sheet ends
// up in a client's line of sight often enough that putting our margin on it
// would eventually cost a booking.
// ---------------------------------------------------------------------------

export default async function TripBriefPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;

  const upper = ref.toUpperCase();
  const [record, trip] = await Promise.all([getTripRecord(actor, upper), getTrip(actor, upper)]);
  if (!record || !trip) notFound();

  const db = osdb();
  const [itinerary, party, client, location, assignments] = await Promise.all([
    db.from("os_itinerary_items")
      .select("seq, start_time, end_time, title, description, kind, location_text, os_locations ( name )")
      .eq("trip_id", record.id).order("seq"),
    db.from("os_trip_travelers")
      .select("is_lead, os_travelers ( full_name, age_category, relationship, dietary_notes, special_requirements )")
      .eq("trip_id", record.id),
    record.client_id && can(actor, "clients.view")
      ? db.from("os_clients").select("full_name, phone, whatsapp, email, nationality, language, preferences").eq("id", record.client_id).maybeSingle()
      : Promise.resolve({ data: null }),
    record.location_id
      ? db.from("os_locations").select("name, access_notes, permit_notes, ticket_notes").eq("id", record.location_id).maybeSingle()
      : Promise.resolve({ data: null }),
    db.from("os_trip_assignments")
      .select("role_key, status, os_employees ( full_name, phone ), os_resources ( name, code, plate, color, size )")
      .eq("trip_id", record.id).in("status", ["assigned", "confirmed"]),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const steps = (itinerary.data ?? []) as any[];
  const travellers = (party.data ?? []) as any[];
  const clientRow = client.data as any;
  const place = location.data as any;
  const crew = (assignments.data ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const showContact = can(actor, "clients.contact");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="os-no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link href={`/os/trips/${upper}`} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-os-muted hover:text-os-text">
          <Icon.ArrowLeft size={14} />Back to the trip
        </Link>
        <PrintButton />
      </div>

      <article className="os-print-sheet rounded-xl border border-os-line bg-white p-6 sm:p-8">
        <header className="border-b-2 border-os-ink pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="os-wordmark text-[11px] font-semibold text-os-gold">EGYPT EYE</p>
              <h1 className="mt-1 text-[22px] font-bold leading-tight text-os-ink">{record.title as string}</h1>
              <p className="mt-0.5 text-[13px] text-os-muted">
                {trip.typeName ?? "Trip"}{trip.unitName ? ` · ${trip.unitName}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="os-nums text-[15px] font-bold text-os-ink">{upper}</p>
              <p className="os-nums text-[12.5px] text-os-muted">{formatLongDate(record.trip_date as string)}</p>
              <p className="os-nums text-[12.5px] font-semibold text-os-ink">
                {formatTime(record.start_time as string)}
                {record.end_time ? ` – ${formatTime(record.end_time as string)}` : ""}
                {record.duration_minutes ? ` (${formatDuration(record.duration_minutes as number)})` : ""}
              </p>
            </div>
          </div>
        </header>

        <Block title="Pickup and movement">
          <Row label="Pickup point" value={(record.pickup_location as string) ?? "Not recorded"} />
          <Row label="Pickup time" value={record.pickup_time ? formatTime(record.pickup_time as string) : "Not recorded"} />
          <Row label="Main location" value={place?.name ?? trip.locationName ?? "Not set"} />
          <Row label="Drop-off" value={(record.dropoff_location as string) ?? "Same as pickup"} />
        </Block>

        <Block title="Guests">
          <Row
            label="Party"
            value={`${record.guests_adults} adult${record.guests_adults === 1 ? "" : "s"}${Number(record.guests_children) ? `, ${record.guests_children} child${Number(record.guests_children) === 1 ? "" : "ren"}` : ""}`}
          />
          {clientRow ? (
            <>
              <Row label="Client" value={clientRow.full_name} />
              {clientRow.nationality || clientRow.language ? (
                <Row label="Nationality / language" value={[clientRow.nationality, clientRow.language].filter(Boolean).join(" · ")} />
              ) : null}
              {showContact && (clientRow.phone || clientRow.whatsapp) ? (
                <Row label="Contact" value={[clientRow.phone, clientRow.whatsapp && clientRow.whatsapp !== clientRow.phone ? `WhatsApp ${clientRow.whatsapp}` : null].filter(Boolean).join(" · ")} />
              ) : null}
            </>
          ) : null}
          {travellers.length ? (
            <div className="mt-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Travelling</p>
              <ul className="mt-1 space-y-0.5">
                {travellers.map((row, i) => (
                  <li key={i} className="text-[13px] text-os-ink">
                    {row.os_travelers?.full_name}
                    {row.is_lead ? <span className="ml-1.5 text-[11px] font-semibold text-os-gold">LEAD</span> : null}
                    {row.os_travelers?.age_category !== "adult" ? <span className="ml-1.5 text-[11.5px] text-os-muted">({row.os_travelers?.age_category})</span> : null}
                    {row.os_travelers?.dietary_notes ? <span className="ml-1.5 text-[11.5px] font-medium text-os-terracotta">{row.os_travelers.dietary_notes}</span> : null}
                    {row.os_travelers?.special_requirements ? <span className="ml-1.5 text-[11.5px] font-medium text-os-terracotta">{row.os_travelers.special_requirements}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Block>

        <Block title="Crew and resources">
          {crew.length ? (
            <ul className="space-y-1">
              {crew.map((assignment, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="shrink-0 capitalize text-os-muted">{String(assignment.role_key).replace(/_/g, " ")}</span>
                  <span className="text-right font-medium text-os-ink">
                    {assignment.os_employees?.full_name ?? assignment.os_resources?.name}
                    {assignment.os_resources?.plate ? ` (${assignment.os_resources.plate})` : ""}
                    {assignment.os_resources?.color ? ` — ${assignment.os_resources.color}` : ""}
                    {showContact && assignment.os_employees?.phone ? (
                      <span className="os-nums ml-2 text-[12px] font-normal text-os-muted">{assignment.os_employees.phone}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] font-semibold text-os-terracotta">NOBODY IS ASSIGNED TO THIS TRIP.</p>
          )}
        </Block>

        {steps.length ? (
          <Block title="Itinerary">
            <ol className="space-y-2">
              {steps.map((step) => (
                <li key={step.seq} className="flex gap-3">
                  <span className="os-nums w-24 shrink-0 text-[12.5px] font-semibold text-os-ink">
                    {formatTime(step.start_time)}
                    {step.end_time ? `–${formatTime(step.end_time)}` : ""}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-os-ink">{step.title}</span>
                    {step.description ? <span className="block text-[12px] leading-snug text-os-muted">{step.description}</span> : null}
                    {step.os_locations?.name || step.location_text ? (
                      <span className="block text-[11.5px] text-os-faint">{step.os_locations?.name ?? step.location_text}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          </Block>
        ) : null}

        {record.special_requests ? (
          <Block title="Special requests">
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-os-ink">{record.special_requests as string}</p>
          </Block>
        ) : null}

        {place && (place.access_notes || place.permit_notes || place.ticket_notes) ? (
          <Block title={`Working at ${place.name}`}>
            {place.access_notes ? <p className="text-[12.5px] leading-relaxed text-os-ink">{place.access_notes}</p> : null}
            {place.permit_notes ? <p className="mt-1.5 text-[12.5px] leading-relaxed text-os-ink"><span className="font-semibold">Permits: </span>{place.permit_notes}</p> : null}
            {place.ticket_notes ? <p className="mt-1.5 text-[12.5px] leading-relaxed text-os-ink"><span className="font-semibold">Tickets: </span>{place.ticket_notes}</p> : null}
          </Block>
        ) : null}

        <Block title="If something goes wrong">
          {record.emergency_notes ? (
            <p className="whitespace-pre-line text-[13px] font-medium leading-relaxed text-os-ink">{record.emergency_notes as string}</p>
          ) : null}
          <ol className="mt-1 space-y-0.5 text-[12.5px] text-os-ink">
            <li>1. Make everyone safe first. Everything else can wait.</li>
            <li>2. If anyone is injured: Ambulance 123. Tourist Police 126.</li>
            <li>3. Call Operations. If there is no answer within two rings, call the founder.</li>
            <li>4. Log the incident in the OS as soon as the situation is stable.</li>
            <li>5. Do not discuss fault or compensation with the client.</li>
          </ol>
        </Block>

        <footer className="mt-5 border-t border-os-line pt-3 text-[11px] text-os-faint">
          Generated from Egypt Eye OS on {new Date().toISOString().slice(0, 10)} for {actor.name}. Every detail here comes from
          the live trip record — if something is wrong, fix it on the trip, not on this sheet.
        </footer>
      </article>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 break-inside-avoid">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-os-gold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-os-line py-1 last:border-0">
      <span className="shrink-0 text-[12.5px] text-os-muted">{label}</span>
      <span className="text-right text-[13px] font-medium text-os-ink">{value}</span>
    </div>
  );
}
