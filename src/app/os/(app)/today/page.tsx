import Link from "next/link";
import { getActor, can, requirePermission } from "@/lib/os/actor";
import { listTrips } from "@/lib/os/trips";
import { todayInCairo, formatLongDate, formatTime } from "@/lib/os/dates";
import { PageHeader, Stat, EmptyState, buttonClass, NoAccess, Card, CardHeader } from "@/components/os/ui";
import { TripCard } from "@/components/os/trip";
import { Icon } from "@/components/os/icons";
import { osdb, getOrg } from "@/lib/os/db";
import { scopeNote } from "@/lib/os/scope";

export const dynamic = "force-dynamic";
export const metadata = { title: "Today" };

// The operational present tense: what is running, what is about to start, and
// who is where. Ordered by start time because that is the order the day
// happens in, not by status or importance.
export default async function TodayPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "trips.view")) return <NoAccess what="today's board" permission="trips.view" />;
  requirePermission(actor, "trips.view");

  const today = todayInCairo();
  const trips = await listTrips(actor, { date: today });

  const org = await getOrg();
  const { data: attendance } = can(actor, "attendance.view")
    ? await osdb().from("os_attendance")
        .select("status, check_in_at, os_employees ( full_name, job_title )")
        .eq("org_id", org.id).eq("work_date", today).not("check_in_at", "is", null)
    : { data: null };

  const running = trips.filter((t) => t.status === "in_progress");
  const upcoming = trips.filter((t) => ["ready", "assigned", "confirmed", "planning"].includes(t.status));
  const finished = trips.filter((t) => ["completed", "content_pending", "client_follow_up", "closed"].includes(t.status));
  const problems = trips.filter((t) => t.readinessState !== "green" && !["completed", "closed", "cancelled"].includes(t.status));
  const guests = trips.reduce((sum, t) => sum + t.guests, 0);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Today"
        description={formatLongDate(today)}
        actions={
          <>
            <Link href="/os/tomorrow" className={buttonClass.secondary}>Tomorrow →</Link>
            {can(actor, "calendar.view") ? <Link href="/os/calendar" className={buttonClass.secondary}>Calendar</Link> : null}
          </>
        }
        meta={scopeNote(actor.permissions["trips.view"] ?? null) ? (
          <p className="text-[12px] text-os-faint">{scopeNote(actor.permissions["trips.view"] ?? null)}</p>
        ) : null}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Trips" value={trips.length} sub={`${guests} guests`} />
        <Stat label="Running now" value={running.length} sub={running.length ? "Crew on location" : "None started"} tone={running.length ? "green" : undefined} />
        <Stat label="Still to go" value={upcoming.length} sub={upcoming[0] ? `Next at ${formatTime(upcoming[0].startTime)}` : "Nothing left"} />
        <Stat label="Needing attention" value={problems.length} tone={problems.length ? "amber" : undefined} sub={problems.length ? "Not fully ready" : "All clear"} />
      </div>

      {trips.length === 0 ? (
        <EmptyState
          title="Nothing scheduled today"
          description="A quiet day, or the board has not been built yet. Trips appear here as soon as the reservation desk creates them."
          action={can(actor, "trips.create") ? <Link href="/os/trips/new" className={buttonClass.gold}>Create a trip</Link> : undefined}
          icon={<Icon.Today size={28} />}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-5">
            {running.length ? (
              <section>
                <h2 className="mb-2.5 flex items-center gap-2 text-[15px] font-semibold text-os-text">
                  <span className="os-live-dot h-2 w-2 rounded-full bg-os-green" />
                  Running now
                </h2>
                <div className="space-y-2">{running.map((t) => <TripCard key={t.id} trip={t} />)}</div>
              </section>
            ) : null}

            {upcoming.length ? (
              <section>
                <h2 className="mb-2.5 text-[15px] font-semibold text-os-text">Still to go</h2>
                <div className="space-y-2">{upcoming.map((t) => <TripCard key={t.id} trip={t} />)}</div>
              </section>
            ) : null}

            {finished.length ? (
              <section>
                <h2 className="mb-2.5 text-[15px] font-semibold text-os-text">Finished</h2>
                <div className="space-y-2 opacity-75">{finished.map((t) => <TripCard key={t.id} trip={t} />)}</div>
              </section>
            ) : null}
          </div>

          <div className="space-y-5">
            {problems.length ? (
              <Card padded={false}>
                <div className="border-b border-os-line px-4 py-3">
                  <CardHeader title="Needs attention" subtitle="Not fully ready, and running today" />
                </div>
                <ul>
                  {problems.map((trip) => (
                    <li key={trip.id} className="border-b border-os-line/60 px-4 py-2.5 last:border-0">
                      <Link href={`/os/trips/${trip.ref}`} className="block">
                        <p className="os-nums text-[11.5px] font-semibold text-os-faint">{trip.ref} · {formatTime(trip.startTime)}</p>
                        <p className="text-[12.5px] font-medium leading-snug text-os-text">{trip.title}</p>
                        <p className="mt-0.5 text-[11.5px] leading-snug text-os-amber">{trip.readinessBlockers[0]?.blocker}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {attendance ? (
              <Card padded={false}>
                <div className="border-b border-os-line px-4 py-3">
                  <CardHeader title="Who is working" subtitle={`${attendance.length} checked in`} />
                </div>
                <ul className="max-h-[420px] overflow-y-auto os-scroll">
                  {attendance.length ? attendance.map((row, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 border-b border-os-line/60 px-4 py-2 last:border-0">
                      <span className="min-w-0">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <span className="block truncate text-[12.5px] font-medium text-os-text">{(row as any).os_employees?.full_name}</span>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <span className="block truncate text-[11px] text-os-faint">{(row as any).os_employees?.job_title}</span>
                      </span>
                      {row.status === "late" ? (
                        <span className="shrink-0 rounded bg-os-amber-soft px-1.5 py-0.5 text-[10.5px] font-medium text-os-amber">late</span>
                      ) : null}
                    </li>
                  )) : (
                    <li className="px-4 py-4 text-[12.5px] text-os-muted">Nobody has checked in yet.</li>
                  )}
                </ul>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
