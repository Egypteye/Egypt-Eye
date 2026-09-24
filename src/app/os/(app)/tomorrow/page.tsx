import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { listTrips } from "@/lib/os/trips";
import { todayInCairo, addDays, formatLongDate, formatTime } from "@/lib/os/dates";
import { PageHeader, Stat, EmptyState, buttonClass, NoAccess, Card, Notice, ReadinessRing, Badge } from "@/components/os/ui";
import { CrewChips } from "@/components/os/trip";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tomorrow" };

// ---------------------------------------------------------------------------
// THE TOMORROW BOARD
// ---------------------------------------------------------------------------
// The single most important screen in the product, and the one operations
// should have open at 17:00 every day.
//
// It is not a list of trips. It is a list of PROBLEMS, sorted worst first,
// with the fix one click away. A trip that is fully ready appears as one calm
// line at the bottom; a trip missing a driver takes up half the screen and
// says exactly what is missing and where to fix it.
// ---------------------------------------------------------------------------

export default async function TomorrowPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "trips.view")) return <NoAccess what="the Tomorrow board" permission="trips.view" />;

  const tomorrow = addDays(todayInCairo(), 1);
  const trips = await listTrips(actor, { date: tomorrow });

  const notReady = trips.filter((t) => t.readinessState === "red" && t.status !== "cancelled");
  const atRisk = trips.filter((t) => t.readinessState === "yellow" && t.status !== "cancelled");
  const ready = trips.filter((t) => t.readinessState === "green" && t.status !== "cancelled");
  const guests = trips.reduce((sum, t) => sum + t.guests, 0);
  const earliest = trips.map((t) => t.pickupTime ?? t.startTime).filter(Boolean).sort()[0];

  return (
    <>
      <PageHeader
        eyebrow="Operations planning"
        title="Tomorrow"
        description={formatLongDate(tomorrow)}
        actions={
          <>
            <Link href="/os/today" className={buttonClass.secondary}>← Today</Link>
            {can(actor, "calendar.view") ? <Link href="/os/calendar" className={buttonClass.secondary}>Calendar</Link> : null}
            {can(actor, "trips.create") ? <Link href="/os/trips/new" className={buttonClass.gold}><Icon.Plus size={15} />New trip</Link> : null}
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Trips" value={trips.length} sub={`${guests} guests`} />
        <Stat label="Ready" value={ready.length} tone={ready.length === trips.length && trips.length > 0 ? "green" : undefined} sub={trips.length ? `${Math.round((ready.length / trips.length) * 100)}% of the board` : "Nothing scheduled"} />
        <Stat label="At risk" value={atRisk.length} tone={atRisk.length ? "amber" : undefined} sub={atRisk.length ? "Something is missing" : "None"} />
        <Stat label="Not ready" value={notReady.length} tone={notReady.length ? "red" : undefined} sub={earliest ? `First pickup ${formatTime(earliest)}` : "None"} />
      </div>

      {trips.length === 0 ? (
        <EmptyState
          title="No trips tomorrow yet"
          description="Nothing is booked for tomorrow. When the reservation desk confirms a deal, it lands here with its checklist already generated."
          action={can(actor, "trips.create") ? <Link href="/os/trips/new" className={buttonClass.gold}>Create a trip</Link> : undefined}
          icon={<Icon.Flag size={28} />}
        />
      ) : (
        <div className="space-y-6">
          {notReady.length ? (
            <section>
              <div className="mb-2.5 flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-os-red">Not ready</h2>
                <span className="rounded bg-os-red-soft px-1.5 py-0.5 text-[11px] font-semibold text-os-red">{notReady.length}</span>
              </div>
              <div className="space-y-3">{notReady.map((trip) => <ProblemCard key={trip.id} trip={trip} tone="red" />)}</div>
            </section>
          ) : null}

          {atRisk.length ? (
            <section>
              <div className="mb-2.5 flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-os-amber">At risk</h2>
                <span className="rounded bg-os-amber-soft px-1.5 py-0.5 text-[11px] font-semibold text-os-amber">{atRisk.length}</span>
              </div>
              <div className="space-y-3">{atRisk.map((trip) => <ProblemCard key={trip.id} trip={trip} tone="amber" />)}</div>
            </section>
          ) : null}

          {ready.length ? (
            <section>
              <div className="mb-2.5 flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-os-green">Ready</h2>
                <span className="rounded bg-os-green-soft px-1.5 py-0.5 text-[11px] font-semibold text-os-green">{ready.length}</span>
              </div>
              <Card padded={false}>
                <ul>
                  {ready.map((trip) => (
                    <li key={trip.id} className="border-b border-os-line/60 last:border-0">
                      <Link href={`/os/trips/${trip.ref}`} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-black/[0.02]">
                        <span className="os-nums w-14 shrink-0 text-[13px] font-semibold text-os-text">{formatTime(trip.pickupTime ?? trip.startTime)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium text-os-text">{trip.title}</span>
                          <span className="block truncate text-[11.5px] text-os-faint">{trip.ref} · {trip.clientName ?? "No client"} · {trip.guests} guests</span>
                        </span>
                        <span className="hidden sm:block"><CrewChips crew={trip.crew.slice(0, 3)} /></span>
                        <Icon.ChevronRight size={16} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ) : null}

          {notReady.length === 0 && atRisk.length === 0 ? (
            <Notice tone="green" title="Everything is ready for tomorrow">
              All {trips.length} trips have their crew, resources and information in place. The first pickup is at {formatTime(earliest ?? null)}.
            </Notice>
          ) : null}
        </div>
      )}
    </>
  );
}

function ProblemCard({ trip, tone }: { trip: Awaited<ReturnType<typeof listTrips>>[number]; tone: "red" | "amber" }) {
  const border = tone === "red" ? "border-os-red/30" : "border-os-amber/30";

  return (
    <Card className={border}>
      <div className="flex flex-wrap items-start gap-4">
        <div className="shrink-0">
          <ReadinessRing score={trip.readinessScore} state={trip.readinessState} size={54} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="os-nums text-[11.5px] font-semibold text-os-faint">{trip.ref}</span>
            <span className="os-nums text-[13px] font-semibold text-os-text">
              {formatTime(trip.pickupTime ?? trip.startTime)}
              {trip.pickupTime ? " pickup" : ""}
            </span>
            {trip.clientVip ? <Badge tone="gold">VIP</Badge> : null}
            {trip.priority === "critical" ? <Badge tone="red">Critical</Badge> : null}
          </div>

          <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-os-text">{trip.title}</h3>
          <p className="mt-0.5 text-[12.5px] text-os-muted">
            {trip.clientName ?? "No client"} · {trip.guests} guests
            {trip.locationName ? ` · ${trip.locationName}` : ""}
            {trip.pickupLocation ? ` · from ${trip.pickupLocation}` : ""}
          </p>

          <div className="mt-2.5">
            <CrewChips crew={trip.crew} />
          </div>

          <ul className="mt-3 space-y-1.5">
            {trip.readinessBlockers.map((blocker) => (
              <li key={blocker.key} className="flex items-start gap-2 text-[12.5px] leading-snug">
                <span className={`mt-0.5 shrink-0 ${tone === "red" ? "text-os-red" : "text-os-amber"}`}>
                  <Icon.Alert size={14} />
                </span>
                <span>
                  <span className="font-medium text-os-text">{blocker.label}</span>
                  <span className="text-os-muted"> — {blocker.blocker}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Link href={`/os/trips/${trip.ref}/team`} className={buttonClass.primary}>Fix the crew</Link>
          <Link href={`/os/trips/${trip.ref}`} className={buttonClass.secondary}>Open trip</Link>
        </div>
      </div>
    </Card>
  );
}
