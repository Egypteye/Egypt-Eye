import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { listTrips } from "@/lib/os/trips";
import { listTasks } from "@/lib/os/tasks";
import { osdb } from "@/lib/os/db";
import { todayInCairo, addDays, formatTime, dayLabel, formatDate, relativeTime, formatClock } from "@/lib/os/dates";
import { PageHeader, Card, CardHeader, Badge, EmptyState, Section, buttonClass, Avatar, Divider } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { AttendanceControl } from "./AttendanceControl";
import { FieldStatusButtons } from "./FieldStatusButtons";
import { TaskToggle } from "../tasks/TaskToggle";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "My day" };

// ---------------------------------------------------------------------------
// MY DAY — the field employee's whole relationship with the OS
// ---------------------------------------------------------------------------
// This is the screen a driver opens at 05:30 in a hotel car park, and the one
// a photographer checks between sets. Everything on it is designed for that:
//
//  * The next trip is the biggest thing on the page, with the pickup point and
//    the client's phone number reachable in one tap.
//  * Field status is five large buttons, not a dropdown.
//  * No company numbers, no other people's trips, no navigation to places
//    their permissions do not reach — because the permission engine decides
//    what this page fetches, not a role name in a template.
// ---------------------------------------------------------------------------

export default async function MyDayPage() {
  const actor = await getActor();
  if (!actor) return null;

  const today = todayInCairo();
  const db = osdb();

  const [myTrips, myTasks, attendance, meetings] = await Promise.all([
    listTrips(actor, { employeeId: actor.employeeId, from: today, to: addDays(today, 14), order: "date_asc" }),
    can(actor, "tasks.view")
      ? listTasks(actor, { mineOnly: true, statuses: ["todo", "in_progress", "blocked"], limit: 40 })
      : Promise.resolve([]),
    db.from("os_attendance").select("check_in_at, check_out_at, status, minutes").eq("employee_id", actor.employeeId).eq("work_date", today).maybeSingle(),
    can(actor, "events.view")
      ? db.from("os_event_attendees")
          .select("response, os_events ( id, title, starts_at, ends_at, location, kind )")
          .eq("employee_id", actor.employeeId)
          .limit(20)
      : Promise.resolve({ data: [] }),
  ]);

  const todayTrips = myTrips.filter((t) => t.tripDate === today);
  const upcoming = myTrips.filter((t) => t.tripDate > today);
  const nextTrip = todayTrips[0] ?? upcoming[0] ?? null;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const todaysMeetings = ((meetings.data ?? []) as any[])
    .map((row) => row.os_events)
    .filter((e) => e && String(e.starts_at).slice(0, 10) === today)
    .sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)));
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // The client's contact details only load if this person is allowed them.
  let nextTripContact: { name: string; phone: string | null; whatsapp: string | null } | null = null;
  if (nextTrip?.clientId && can(actor, "clients.contact")) {
    const { data: client } = await db.from("os_clients").select("full_name, phone, whatsapp").eq("id", nextTrip.clientId).maybeSingle();
    if (client) {
      nextTripContact = {
        name: client.full_name as string,
        phone: (client.phone as string) ?? null,
        whatsapp: (client.whatsapp as string) ?? null,
      };
    }
  }

  const myAssignmentRole = nextTrip
    ? nextTrip.crew.find((c) => c.employeeId === actor.employeeId)?.roleKey ?? null
    : null;

  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", hour12: false }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const overdue = myTasks.filter((t) => t.overdue);

  return (
    <>
      <PageHeader
        eyebrow={formatDate(today)}
        title={`${greeting}, ${actor.displayName}`}
        description={
          todayTrips.length
            ? `${todayTrips.length} trip${todayTrips.length === 1 ? "" : "s"} today, ${myTasks.length} open task${myTasks.length === 1 ? "" : "s"}${todaysMeetings.length ? `, ${todaysMeetings.length} meeting${todaysMeetings.length === 1 ? "" : "s"}` : ""}.`
            : myTasks.length
              ? `No trips today. ${myTasks.length} open task${myTasks.length === 1 ? "" : "s"}.`
              : "Nothing scheduled for you today."
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* ---------------------------------------------------------- */}
          {/* The next trip, made unmissable                              */}
          {/* ---------------------------------------------------------- */}
          {nextTrip ? (
            <Card padded={false} className="overflow-hidden">
              <div className="bg-os-ink px-4 py-3 text-white sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="os-nums text-[11.5px] font-semibold text-os-gold">{nextTrip.ref}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] capitalize">
                    {myAssignmentRole ? myAssignmentRole.replace("_", " ") : "assigned"}
                  </span>
                  {nextTrip.clientVip ? <span className="rounded bg-os-gold px-1.5 py-0.5 text-[10.5px] font-bold text-os-ink">VIP</span> : null}
                  <span className="ml-auto text-[12px] text-white/60">{dayLabel(nextTrip.tripDate)}</span>
                </div>
                <p className="mt-1.5 text-[20px] font-semibold leading-tight">{nextTrip.title}</p>
                <p className="os-nums mt-1 text-[15px] font-medium text-os-gold">
                  {formatTime(nextTrip.startTime)}
                  {nextTrip.pickupTime ? ` · pickup ${formatTime(nextTrip.pickupTime)}` : ""}
                </p>
              </div>

              <div className="space-y-3 px-4 py-4 sm:px-5">
                {nextTrip.pickupLocation ? (
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-os-muted"><Icon.Pin size={16} /></span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Pickup</p>
                      <p className="text-[14px] font-medium leading-snug text-os-text">{nextTrip.pickupLocation}</p>
                    </div>
                  </div>
                ) : null}
                {nextTrip.locationName ? (
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-os-muted"><Icon.Flag size={16} /></span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Location</p>
                      <p className="text-[14px] font-medium leading-snug text-os-text">{nextTrip.locationName}</p>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-os-muted"><Icon.Users size={16} /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Guests</p>
                    <p className="text-[14px] font-medium leading-snug text-os-text">
                      {nextTripContact?.name ? `${nextTripContact.name} · ` : ""}{nextTrip.guests} {nextTrip.guests === 1 ? "person" : "people"}
                    </p>
                  </div>
                </div>

                {nextTripContact && (nextTripContact.phone || nextTripContact.whatsapp) ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {nextTripContact.phone ? (
                      <a href={`tel:${nextTripContact.phone.replace(/\s/g, "")}`} className={buttonClass.secondary}>
                        Call {nextTripContact.name.split(" ")[0]}
                      </a>
                    ) : null}
                    {nextTripContact.whatsapp ? (
                      <a
                        href={`https://wa.me/${nextTripContact.whatsapp.replace(/\D/g, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className={buttonClass.secondary}
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                ) : null}

                <Divider className="my-1" />

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Report your status</p>
                  <FieldStatusButtons tripRef={nextTrip.ref} />
                </div>

                <Link href={`/os/trips/${nextTrip.ref}`} className="block pt-1 text-[13px] font-semibold text-os-gold hover:underline">
                  Open the full trip brief →
                </Link>
              </div>
            </Card>
          ) : (
            <EmptyState
              title="Nothing on your schedule"
              description="When operations assigns you to a trip you will see it here, and get a notification."
              icon={<Icon.Trip size={28} />}
            />
          )}

          {/* ---------------------------------------------------------- */}
          {/* The rest of today, then what is coming                      */}
          {/* ---------------------------------------------------------- */}
          {todayTrips.length > 1 ? (
            <Section title="Also today">
              <div className="space-y-2">
                {todayTrips.slice(1).map((trip) => (
                  <Link key={trip.id} href={`/os/trips/${trip.ref}`} className="flex items-center gap-3 rounded-xl border border-os-line bg-os-card p-3 transition hover:border-os-line-strong">
                    <span className="os-nums w-12 shrink-0 text-[13px] font-semibold text-os-text">{formatTime(trip.startTime)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-os-text">{trip.title}</span>
                      <span className="block truncate text-[12px] text-os-muted">{trip.pickupLocation ?? trip.locationName ?? trip.ref}</span>
                    </span>
                    <Icon.ChevronRight size={16} />
                  </Link>
                ))}
              </div>
            </Section>
          ) : null}

          {upcoming.length ? (
            <Section title="Coming up" description="Your next two weeks.">
              <div className="space-y-2">
                {upcoming.slice(0, 6).map((trip) => (
                  <Link key={trip.id} href={`/os/trips/${trip.ref}`} className="flex items-center gap-3 rounded-xl border border-os-line bg-os-card p-3 transition hover:border-os-line-strong">
                    <span className="w-20 shrink-0">
                      <span className="block text-[12px] font-semibold text-os-text">{dayLabel(trip.tripDate)}</span>
                      <span className="os-nums block text-[11.5px] text-os-faint">{formatTime(trip.startTime)}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-os-text">{trip.title}</span>
                      <span className="block truncate text-[12px] text-os-muted">
                        {trip.crew.find((c) => c.employeeId === actor.employeeId)?.roleKey.replace("_", " ") ?? ""} · {trip.locationName ?? ""}
                      </span>
                    </span>
                    <Icon.ChevronRight size={16} />
                  </Link>
                ))}
              </div>
            </Section>
          ) : null}
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Side column                                                   */}
        {/* ------------------------------------------------------------ */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="Attendance" subtitle={formatDate(today)} />
            <div className="mt-3">
              <AttendanceControl
                checkedInAt={(attendance.data?.check_in_at as string) ?? null}
                checkedOutAt={(attendance.data?.check_out_at as string) ?? null}
                status={(attendance.data?.status as string) ?? null}
              />
            </div>
          </Card>

          {myTasks.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader
                  title="My tasks"
                  subtitle={overdue.length ? `${overdue.length} overdue` : `${myTasks.length} open`}
                  action={<Link href="/os/tasks" className="text-[12px] font-medium text-os-gold hover:underline">All</Link>}
                />
              </div>
              <ul>
                {myTasks.slice(0, 8).map((task) => (
                  <li key={task.id} className="flex items-start gap-2.5 border-b border-os-line/60 px-4 py-2.5 last:border-0">
                    <TaskToggle taskId={task.id} status={task.status} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-medium leading-snug text-os-text">{task.title}</span>
                      <span className="block text-[11px] text-os-faint">
                        {task.tripRef ? `${task.tripRef} · ` : ""}
                        {task.dueAt ? (task.overdue ? <span className="text-os-red">due {relativeTime(task.dueAt)}</span> : `due ${relativeTime(task.dueAt)}`) : "no due date"}
                      </span>
                    </span>
                    {task.priority === "critical" ? <Badge tone="red">Critical</Badge> : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {todaysMeetings.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader title="Meetings today" />
              </div>
              <ul>
                {todaysMeetings.map((event) => (
                  <li key={event.id} className="flex items-start gap-3 border-b border-os-line/60 px-4 py-2.5 last:border-0">
                    <span className="os-nums w-12 shrink-0 text-[12.5px] font-semibold text-os-text">{formatClock(event.starts_at)}</span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-medium leading-snug text-os-text">{event.title}</span>
                      {event.location ? <span className="block text-[11px] text-os-faint">{event.location}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Your account" />
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={actor.name} url={actor.avatarUrl} size={40} />
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-os-text">{actor.name}</p>
                <p className="truncate text-[12px] text-os-muted">{actor.jobTitle ?? actor.roles[0]?.name ?? "Team member"}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {actor.roles.map((role) => (
                <Badge key={role.key} tone="neutral">{role.name}</Badge>
              ))}
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-os-muted">
              Signed in as {actor.email}. Your access is set by the roles above, and an administrator changes it.
            </p>
            <div className="mt-3">
              <SignOutButton />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
