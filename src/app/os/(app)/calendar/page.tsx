import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { listTrips } from "@/lib/os/trips";
import { osdb, getOrg } from "@/lib/os/db";
import { todayInCairo, addDays, startOfWeek, startOfMonth, endOfMonth, formatMonth, formatTime, formatDate, dayLabel, daysBetween } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, EmptyState, buttonClass, Badge } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { statusColor } from "@/components/os/trip";

export const dynamic = "force-dynamic";
export const metadata = { title: "Operations calendar" };

// ---------------------------------------------------------------------------
// THE OPERATIONS CALENDAR
// ---------------------------------------------------------------------------
// Three views because operations genuinely thinks in three time horizons: the
// day (who is where, right now), the week (is anyone double-booked), and the
// month (are we over- or under-sold).
//
// The week view is a resource timeline rather than a grid of boxes, because the
// question it exists to answer is "who is free on Thursday", and a box grid
// answers "what is on Thursday" — a different, less useful question.
//
// Customer trips only. Internal meetings live on the company calendar; mixing
// them is how operations calendars become unreadable.
// ---------------------------------------------------------------------------

type View = "day" | "week" | "month";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "calendar.view")) return <NoAccess what="the operations calendar" permission="calendar.view" />;

  const params = await searchParams;
  const one = (key: string) => (Array.isArray(params[key]) ? params[key]![0] : params[key]) as string | undefined;

  const today = todayInCairo();
  const view = (one("view") as View) ?? "week";
  const anchor = one("date") ?? today;
  const unitFilter = one("unit");

  const range =
    view === "day" ? { from: anchor, to: anchor }
    : view === "week" ? { from: startOfWeek(anchor), to: addDays(startOfWeek(anchor), 6) }
    : { from: startOfMonth(anchor), to: endOfMonth(anchor) };

  const db = osdb();
  const org = await getOrg();

  const [trips, units] = await Promise.all([
    listTrips(actor, { from: range.from, to: range.to, unitIds: unitFilter ? [unitFilter] : undefined, limit: 400 }),
    db.from("os_business_units").select("id, name, color").eq("org_id", org.id).eq("active", true).order("sort_order"),
  ]);

  const byDate = new Map<string, typeof trips>();
  for (const trip of trips) {
    const list = byDate.get(trip.tripDate) ?? [];
    list.push(trip);
    byDate.set(trip.tripDate, list);
  }

  const shift = view === "day" ? 1 : view === "week" ? 7 : 30;
  const prev = `/os/calendar?view=${view}&date=${addDays(anchor, -shift)}${unitFilter ? `&unit=${unitFilter}` : ""}`;
  const next = `/os/calendar?view=${view}&date=${addDays(anchor, shift)}${unitFilter ? `&unit=${unitFilter}` : ""}`;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Calendar"
        description={
          view === "month" ? formatMonth(anchor)
            : view === "week" ? `${formatDate(range.from)} — ${formatDate(range.to)}`
            : formatDate(anchor)
        }
        actions={
          <>
            <Link href={`/os/calendar?view=${view}&date=${today}`} className={buttonClass.secondary}>Today</Link>
            {can(actor, "trips.create") ? <Link href="/os/trips/new" className={buttonClass.gold}><Icon.Plus size={15} />New trip</Link> : null}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Link href={prev} className="rounded-lg border border-os-line-strong bg-white p-2 text-os-muted hover:text-os-text" aria-label="Previous">
            <Icon.ArrowLeft size={15} />
          </Link>
          <Link href={next} className="rounded-lg border border-os-line-strong bg-white p-2 text-os-muted hover:text-os-text" aria-label="Next">
            <Icon.ChevronRight size={15} />
          </Link>
        </div>

        <div className="flex gap-1">
          {(["day", "week", "month"] as View[]).map((v) => (
            <Link
              key={v}
              href={`/os/calendar?view=${v}&date=${anchor}${unitFilter ? `&unit=${unitFilter}` : ""}`}
              className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium capitalize transition ${
                view === v ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"
              }`}
            >
              {v}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          <Link
            href={`/os/calendar?view=${view}&date=${anchor}`}
            className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition ${
              !unitFilter ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"
            }`}
          >
            All services
          </Link>
          {(units.data ?? []).map((unit) => (
            <Link
              key={unit.id as string}
              href={`/os/calendar?view=${view}&date=${anchor}&unit=${unit.id}`}
              className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition ${
                unitFilter === unit.id ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"
              }`}
            >
              {unit.name as string}
            </Link>
          ))}
        </div>

        <span className="ml-auto text-[12.5px] text-os-muted">
          {trips.length} trip{trips.length === 1 ? "" : "s"} · {trips.reduce((s, t) => s + t.guests, 0)} guests
        </span>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          title="Nothing scheduled in this period"
          description="Move to another week, clear the service filter, or create a trip."
          action={can(actor, "trips.create") ? <Link href="/os/trips/new" className={buttonClass.gold}>Create a trip</Link> : undefined}
          icon={<Icon.Calendar size={26} />}
        />
      ) : view === "month" ? (
        <MonthGrid anchor={anchor} byDate={byDate} today={today} />
      ) : (
        <DayList range={range} byDate={byDate} today={today} />
      )}
    </>
  );
}

function DayList({
  range, byDate, today,
}: {
  range: { from: string; to: string };
  byDate: Map<string, Awaited<ReturnType<typeof listTrips>>>;
  today: string;
}) {
  const days: string[] = [];
  for (let d = range.from; d <= range.to; d = addDays(d, 1)) days.push(d);

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const trips = byDate.get(day) ?? [];
        return (
          <section key={day}>
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className={`text-[14px] font-semibold ${day === today ? "text-os-gold" : "text-os-text"}`}>{dayLabel(day, today)}</h2>
              <span className="text-[12px] text-os-faint">{formatDate(day)}</span>
              {trips.length ? <span className="text-[12px] text-os-muted">· {trips.length}</span> : null}
            </div>
            {trips.length ? (
              <Card padded={false}>
                <ul>
                  {trips.map((trip) => (
                    <li key={trip.id} className="border-b border-os-line/60 last:border-0">
                      <Link href={`/os/trips/${trip.ref}`} className="flex items-center gap-3 px-3.5 py-2.5 transition hover:bg-black/[0.02]">
                        <span className="w-1 shrink-0 self-stretch rounded-full" style={{ background: trip.typeColor }} aria-hidden />
                        <span className="os-nums w-14 shrink-0 text-[13px] font-semibold text-os-text">{formatTime(trip.startTime)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium text-os-text">{trip.title}</span>
                          <span className="block truncate text-[11.5px] text-os-faint">
                            {trip.ref} · {trip.clientName ?? "No client"} · {trip.guests} guests
                            {trip.locationName ? ` · ${trip.locationName}` : ""}
                          </span>
                        </span>
                        <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                          {trip.crew.slice(0, 3).map((c, i) => (
                            <span key={i} className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10.5px] text-os-muted">{c.name.split(" ")[0]}</span>
                          ))}
                        </span>
                        <span className={`h-2 w-2 shrink-0 rounded-full ${trip.readinessState === "green" ? "bg-os-green" : trip.readinessState === "yellow" ? "bg-os-amber" : "bg-os-red"}`}
                          title={`${trip.readinessScore}% ready`} />
                        <span className="hidden shrink-0 sm:block">
                          <Badge tone="neutral"><span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor(trip.status) }} />{trip.status.replace(/_/g, " ")}</Badge>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <p className="rounded-xl border border-dashed border-os-line px-3.5 py-3 text-[12.5px] text-os-faint">Nothing scheduled.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function MonthGrid({
  anchor, byDate, today,
}: {
  anchor: string;
  byDate: Map<string, Awaited<ReturnType<typeof listTrips>>>;
  today: string;
}) {
  const first = startOfMonth(anchor);
  const last = endOfMonth(anchor);
  const gridStart = startOfWeek(first);
  const cells: string[] = [];
  for (let d = gridStart; daysBetween(d, last) >= 0 || cells.length % 7 !== 0; d = addDays(d, 1)) {
    cells.push(d);
    if (cells.length > 42) break;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-7 gap-px rounded-t-xl border border-os-line bg-os-line">
          {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
            <div key={day} className="bg-os-canvas px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-os-faint">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px border-x border-b border-os-line bg-os-line">
          {cells.map((day) => {
            const trips = byDate.get(day) ?? [];
            const inMonth = day.slice(0, 7) === anchor.slice(0, 7);
            return (
              <div key={day} className={`min-h-[104px] p-1.5 ${inMonth ? "bg-os-card" : "bg-os-canvas"}`}>
                <div className="mb-1 flex items-center justify-between">
                  <span className={`os-nums text-[11.5px] ${day === today ? "rounded bg-os-gold px-1 font-bold text-os-ink" : inMonth ? "font-medium text-os-text" : "text-os-faint"}`}>
                    {Number(day.slice(8, 10))}
                  </span>
                  {trips.length > 3 ? <span className="text-[10px] text-os-faint">{trips.length}</span> : null}
                </div>
                <ul className="space-y-1">
                  {trips.slice(0, 3).map((trip) => (
                    <li key={trip.id}>
                      <Link
                        href={`/os/trips/${trip.ref}`}
                        className="block truncate rounded px-1 py-0.5 text-[10.5px] leading-snug transition hover:brightness-95"
                        style={{ background: `${trip.typeColor}22`, color: "#16211c" }}
                        title={`${trip.ref} · ${trip.title}`}
                      >
                        <span className="os-nums font-semibold">{formatTime(trip.startTime)}</span> {trip.title}
                      </Link>
                    </li>
                  ))}
                  {trips.length > 3 ? (
                    <li>
                      <Link href={`/os/calendar?view=day&date=${day}`} className="block px-1 text-[10.5px] text-os-gold hover:underline">
                        +{trips.length - 3} more
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
