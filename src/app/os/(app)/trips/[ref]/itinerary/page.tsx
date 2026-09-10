import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTripRecord } from "@/lib/os/trips";
import { osdb, getOrg } from "@/lib/os/db";
import { formatTime } from "@/lib/os/dates";
import { Card, CardHeader, EmptyState, Badge } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { ItineraryEditor } from "./ItineraryEditor";

export const dynamic = "force-dynamic";

// The plan for the day, in order. The location intelligence sits alongside it
// rather than in a separate knowledge tab, because "the drive is 45 minutes
// and there is no shade in the upper lot after 10:00" is only useful at the
// moment somebody is building the schedule.
export default async function ItineraryPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;

  const trip = await getTripRecord(actor, ref.toUpperCase());
  if (!trip) notFound();

  const db = osdb();
  const org = await getOrg();

  const [items, locations, tripLocation] = await Promise.all([
    db.from("os_itinerary_items")
      .select("id, seq, start_time, end_time, title, description, kind, location_text, os_locations ( name )")
      .eq("trip_id", trip.id).order("seq"),
    db.from("os_locations").select("id, name, city").eq("org_id", org.id).eq("active", true).order("name"),
    trip.location_id
      ? db.from("os_locations")
          .select("name, access_notes, permit_notes, ticket_notes, best_time_notes, typical_drive_minutes")
          .eq("id", trip.location_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const steps = (items.data ?? []) as any[];
  const place = tripLocation.data as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <Card padded={false}>
        <div className="border-b border-os-line px-4 py-3 sm:px-5">
          <CardHeader title="Itinerary" subtitle={steps.length ? `${steps.length} steps` : "Nothing planned yet"} />
        </div>

        {steps.length ? (
          <ol className="relative px-4 py-3 sm:px-5">
            {steps.map((step, index) => (
              <li key={step.id} className="relative flex gap-4 pb-4 last:pb-0">
                {index < steps.length - 1 ? (
                  <span className="absolute left-[7px] top-5 h-full w-px bg-os-line" aria-hidden />
                ) : null}
                <span className="relative mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-os-gold bg-white" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="os-nums text-[13px] font-semibold text-os-text">
                      {formatTime(step.start_time)}
                      {step.end_time ? `–${formatTime(step.end_time)}` : ""}
                    </span>
                    <Badge tone="neutral">{String(step.kind).replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-0.5 text-[14px] font-medium leading-snug text-os-text">{step.title}</p>
                  {step.description ? (
                    <p className="mt-1 text-[12.5px] leading-relaxed text-os-muted">{step.description}</p>
                  ) : null}
                  {step.os_locations?.name || step.location_text ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-os-faint">
                      <Icon.Pin size={12} />{step.os_locations?.name ?? step.location_text}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="px-4 py-6 sm:px-5">
            <EmptyState
              title="No itinerary yet"
              description="Until there is one, the crew has nothing to follow and the trip cannot reach Ready."
              icon={<Icon.Calendar size={24} />}
            />
          </div>
        )}

        {can(actor, "trips.edit") ? (
          <div className="border-t border-os-line px-4 py-4 sm:px-5">
            <ItineraryEditor
              tripRef={ref.toUpperCase()}
              locations={(locations.data ?? []).map((l) => ({ id: l.id as string, name: `${l.name}${l.city ? ` — ${l.city}` : ""}` }))}
              existing={steps.map((s) => ({ id: s.id as string, title: s.title as string }))}
            />
          </div>
        ) : null}
      </Card>

      {place ? (
        <Card>
          <CardHeader title={place.name} subtitle="What we know about working here" />
          <div className="mt-3 space-y-3">
            {place.typical_drive_minutes ? (
              <Note label="Typical drive" body={`About ${place.typical_drive_minutes} minutes from base.`} />
            ) : null}
            {place.access_notes ? <Note label="Access and parking" body={place.access_notes} /> : null}
            {place.permit_notes ? <Note label="Permits" body={place.permit_notes} /> : null}
            {place.ticket_notes ? <Note label="Tickets" body={place.ticket_notes} /> : null}
            {place.best_time_notes ? <Note label="Best time" body={place.best_time_notes} /> : null}
            {!place.access_notes && !place.permit_notes && !place.ticket_notes && !place.best_time_notes ? (
              <p className="text-[12.5px] text-os-muted">
                Nothing recorded for this location yet. Whoever runs the next trip here should add what they learn — that is
                how this stops living in one person&apos;s head.
              </p>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function Note({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">{label}</p>
      <p className="mt-0.5 text-[12.5px] leading-relaxed text-os-text">{body}</p>
    </div>
  );
}
