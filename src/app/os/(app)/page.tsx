import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { listTrips } from "@/lib/os/trips";
import { listTasks } from "@/lib/os/tasks";
import { overview, periodPresets } from "@/lib/os/analytics";
import { osdb, getOrg } from "@/lib/os/db";
import { todayInCairo, addDays, formatTime, dayLabel, relativeTime } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { Card, CardHeader, PageHeader, Stat, Badge, EmptyState, Section, Notice, buttonClass, Avatar } from "@/components/os/ui";
import { TripCard } from "@/components/os/trip";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Command centre" };

// ---------------------------------------------------------------------------
// THE COMMAND CENTRE
// ---------------------------------------------------------------------------
// The first question this screen answers is "what is happening inside Egypt
// Eye right now", and the second is "what needs me". Everything else is below
// the fold on purpose.
//
// It adapts to the person rather than to a role name: each block renders only
// if their permissions reach the underlying data, so a driver opening /os sees
// a short, honest page about their own day instead of a wall of locked panels.
// ---------------------------------------------------------------------------

export default async function CommandCentre() {
  const actor = await getActor();
  if (!actor) return null;

  const today = todayInCairo();
  const tomorrow = addDays(today, 1);
  const seesCompany = can(actor, "trips.view") && actor.permissions["trips.view"] !== "own";

  const [todayTrips, tomorrowTrips, myTasks] = await Promise.all([
    can(actor, "trips.view") ? listTrips(actor, { date: today }) : Promise.resolve([]),
    can(actor, "trips.view") ? listTrips(actor, { date: tomorrow }) : Promise.resolve([]),
    can(actor, "tasks.view") ? listTasks(actor, { mineOnly: true, statuses: ["todo", "in_progress", "blocked"], limit: 60 }) : Promise.resolve([]),
  ]);

  const stats = can(actor, "analytics.view")
    ? await overview(actor, periodPresets(today).month)
    : null;

  const db = osdb();
  const org = await getOrg();

  const [approvals, incidents, checkedIn, unread] = await Promise.all([
    can(actor, "approvals.view")
      ? db.from("os_approvals")
          .select("id, ref, title, amount, currency, requested_at, due_at, kind, os_employees!os_approvals_requested_by_fkey ( full_name )")
          .eq("org_id", org.id).eq("status", "pending").order("requested_at").limit(5)
      : Promise.resolve({ data: [] }),
    can(actor, "incidents.view")
      ? db.from("os_incidents")
          .select("id, ref, title, severity, status, occurred_at")
          .eq("org_id", org.id).in("status", ["open", "investigating"]).order("occurred_at", { ascending: false }).limit(4)
      : Promise.resolve({ data: [] }),
    can(actor, "attendance.view")
      ? db.from("os_attendance").select("employee_id, status, os_employees ( full_name, job_title )").eq("work_date", today).not("check_in_at", "is", null).limit(40)
      : Promise.resolve({ data: [] }),
    db.from("os_notifications").select("id, level, title, body, href, created_at").eq("employee_id", actor.employeeId).is("read_at", null).order("created_at", { ascending: false }).limit(5),
  ]);

  const criticalTomorrow = tomorrowTrips.filter((t) => t.readinessState === "red");
  const atRiskTomorrow = tomorrowTrips.filter((t) => t.readinessState === "yellow");
  const liveNow = todayTrips.filter((t) => t.status === "in_progress");
  const overdueTasks = myTasks.filter((t) => t.overdue);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const pendingApprovals = (approvals.data ?? []) as any[];
  const openIncidents = (incidents.data ?? []) as any[];
  const working = (checkedIn.data ?? []) as any[];
  const notifications = (unread.data ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", hour12: false }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        eyebrow={dayLabel(today)}
        title={`${greeting}, ${actor.displayName}`}
        description={
          seesCompany
            ? "Everything below is live. What needs a decision is at the top."
            : "Your day, your assignments and anything waiting on you."
        }
        actions={
          <>
            {can(actor, "trips.create") ? (
              <Link href="/os/trips/new" className={buttonClass.gold}><Icon.Plus size={15} />New trip</Link>
            ) : null}
            {can(actor, "trips.view") ? (
              <Link href="/os/tomorrow" className={buttonClass.secondary}>Tomorrow board</Link>
            ) : null}
          </>
        }
      />

      {/* ---------------------------------------------------------------- */}
      {/* What needs attention, before anything else                        */}
      {/* ---------------------------------------------------------------- */}
      {(criticalTomorrow.length > 0 || overdueTasks.length > 0 || openIncidents.some((i) => i.severity === "critical")) ? (
        <div className="mb-5 space-y-2">
          {criticalTomorrow.map((trip) => (
            <Notice
              key={trip.id}
              tone="red"
              title={`${trip.ref} runs tomorrow at ${formatTime(trip.startTime)} and is not ready`}
              action={<Link href={`/os/trips/${trip.ref}`} className="rounded-lg bg-os-red px-2.5 py-1.5 text-[12px] font-semibold text-white">Open</Link>}
            >
              {trip.readinessBlockers.slice(0, 2).map((b) => b.blocker).join(" ")}
            </Notice>
          ))}
          {openIncidents.filter((i) => i.severity === "critical").map((incident) => (
            <Notice
              key={incident.id}
              tone="red"
              title={`Critical incident open: ${incident.title}`}
              action={<Link href="/os/incidents" className="rounded-lg bg-os-red px-2.5 py-1.5 text-[12px] font-semibold text-white">Open</Link>}
            >
              {incident.ref} · reported {relativeTime(incident.occurred_at)}
            </Notice>
          ))}
          {overdueTasks.length ? (
            <Notice
              tone="amber"
              title={overdueTasks.length === 1 ? "One of your tasks is overdue" : `${overdueTasks.length} of your tasks are overdue`}
              action={<Link href="/os/tasks" className={buttonClass.secondary}>See them</Link>}
            >
              {overdueTasks.slice(0, 2).map((t) => t.title).join(" · ")}
            </Notice>
          ) : null}
        </div>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* The numbers                                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Today"
          value={todayTrips.length}
          sub={liveNow.length ? `${liveNow.length} running right now` : todayTrips.length ? "None started yet" : "Nothing scheduled"}
          href={can(actor, "trips.view") ? "/os/today" : undefined}
          icon={<span className="text-os-faint"><Icon.Today size={16} /></span>}
        />
        <Stat
          label="Tomorrow"
          value={tomorrowTrips.length}
          tone={criticalTomorrow.length ? "red" : atRiskTomorrow.length ? "amber" : undefined}
          sub={
            criticalTomorrow.length
              ? `${criticalTomorrow.length} not ready`
              : atRiskTomorrow.length
                ? `${atRiskTomorrow.length} at risk`
                : tomorrowTrips.length ? "All ready" : "Nothing scheduled"
          }
          href={can(actor, "trips.view") ? "/os/tomorrow" : undefined}
          icon={<span className="text-os-faint"><Icon.Flag size={16} /></span>}
        />
        <Stat
          label="My open tasks"
          value={myTasks.length}
          tone={overdueTasks.length ? "amber" : undefined}
          sub={overdueTasks.length ? `${overdueTasks.length} overdue` : "Nothing overdue"}
          href="/os/tasks"
          icon={<span className="text-os-faint"><Icon.CheckSquare size={16} /></span>}
        />
        {stats?.revenue !== null && stats !== null ? (
          <Stat
            label="This month"
            value={formatMoney(stats.revenue, stats.currency, { compact: true })}
            sub={`${stats.marginPct}% margin · ${stats.trips} trips`}
            href={can(actor, "analytics.financial") ? "/os/analytics" : undefined}
            icon={<span className="text-os-faint"><Icon.Chart size={16} /></span>}
          />
        ) : (
          <Stat
            label="Pending approvals"
            value={pendingApprovals.length}
            sub={pendingApprovals.length ? "Waiting on a decision" : "Nothing waiting"}
            href={can(actor, "approvals.view") ? "/os/approvals" : undefined}
            icon={<span className="text-os-faint"><Icon.Shield size={16} /></span>}
          />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Section
            title={liveNow.length ? "Running now" : "Today"}
            description={liveNow.length ? "Crew are on location." : undefined}
            action={can(actor, "trips.view") ? <Link href="/os/today" className="text-[12.5px] font-medium text-os-gold hover:underline">Full board →</Link> : null}
          >
            {todayTrips.length ? (
              <div className="space-y-2">
                {(liveNow.length ? liveNow : todayTrips).slice(0, 5).map((trip) => <TripCard key={trip.id} trip={trip} />)}
              </div>
            ) : (
              <EmptyState
                title="Nothing scheduled today"
                description={can(actor, "trips.create")
                  ? "When the reservation desk closes a deal, the trip appears here."
                  : "You have no assignments today."}
                action={can(actor, "trips.create") ? <Link href="/os/trips/new" className={buttonClass.gold}>Create a trip</Link> : undefined}
              />
            )}
          </Section>

          {tomorrowTrips.length ? (
            <Section
              title="Tomorrow"
              description={`${tomorrowTrips.length} trip${tomorrowTrips.length === 1 ? "" : "s"}, ${tomorrowTrips.filter((t) => t.readinessState === "green").length} ready.`}
              action={<Link href="/os/tomorrow" className="text-[12.5px] font-medium text-os-gold hover:underline">Tomorrow board →</Link>}
            >
              <div className="space-y-2">
                {[...criticalTomorrow, ...atRiskTomorrow, ...tomorrowTrips.filter((t) => t.readinessState === "green")]
                  .slice(0, 4)
                  .map((trip) => <TripCard key={trip.id} trip={trip} />)}
              </div>
            </Section>
          ) : null}
        </div>

        <div className="space-y-5">
          {notifications.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader
                  title="For you"
                  action={<Link href="/os/notifications" className="text-[12px] font-medium text-os-gold hover:underline">All</Link>}
                />
              </div>
              <ul>
                {notifications.map((n) => (
                  <li key={n.id} className="border-b border-os-line/60 last:border-0">
                    <Link href={n.href ?? "/os/notifications"} className="block px-4 py-2.5 transition hover:bg-black/[0.02]">
                      <div className="flex items-start gap-2">
                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.level === "critical" ? "bg-os-red" : n.level === "warning" ? "bg-os-amber" : "bg-os-blue"}`} />
                        <span className="min-w-0">
                          <span className="block text-[12.5px] font-medium leading-snug text-os-text">{n.title}</span>
                          {n.body ? <span className="mt-0.5 block line-clamp-2 text-[11.5px] leading-snug text-os-muted">{n.body}</span> : null}
                          <span className="mt-0.5 block text-[11px] text-os-faint">{relativeTime(n.created_at)}</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {can(actor, "approvals.view") && pendingApprovals.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader
                  title="Waiting on a decision"
                  subtitle={`${pendingApprovals.length} pending`}
                  action={<Link href="/os/approvals" className="text-[12px] font-medium text-os-gold hover:underline">All</Link>}
                />
              </div>
              <ul>
                {pendingApprovals.map((a) => (
                  <li key={a.id} className="border-b border-os-line/60 px-4 py-2.5 last:border-0">
                    <p className="text-[12.5px] font-medium leading-snug text-os-text">{a.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-os-muted">
                      {a.os_employees?.full_name ?? "Someone"} · {relativeTime(a.requested_at)}
                      {a.amount ? ` · ${formatMoney(Number(a.amount), a.currency ?? "USD")}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {can(actor, "attendance.view") ? (
            <Card>
              <CardHeader title="Working today" subtitle={`${working.length} checked in`} />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {working.length ? (
                  working.slice(0, 18).map((row, i) => (
                    <span key={`${row.employee_id}-${i}`} title={`${row.os_employees?.full_name} · ${row.status}`}>
                      <Avatar name={row.os_employees?.full_name ?? "?"} size={28} />
                    </span>
                  ))
                ) : (
                  <p className="text-[12.5px] text-os-muted">Nobody has checked in yet.</p>
                )}
              </div>
              {working.some((w) => w.status === "late") ? (
                <p className="mt-2.5 text-[11.5px] text-os-amber">
                  {working.filter((w) => w.status === "late").length} marked late.
                </p>
              ) : null}
            </Card>
          ) : null}

          {can(actor, "incidents.view") && openIncidents.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader title="Open incidents" action={<Link href="/os/incidents" className="text-[12px] font-medium text-os-gold hover:underline">All</Link>} />
              </div>
              <ul>
                {openIncidents.map((i) => (
                  <li key={i.id} className="flex items-start gap-2 border-b border-os-line/60 px-4 py-2.5 last:border-0">
                    <Badge tone={i.severity === "critical" || i.severity === "high" ? "red" : "amber"}>{i.severity}</Badge>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-medium leading-snug text-os-text">{i.title}</span>
                      <span className="block text-[11px] text-os-faint">{i.ref} · {relativeTime(i.occurred_at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
