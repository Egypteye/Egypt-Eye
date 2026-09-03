import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { todayInCairo, addDays, formatDate, formatClock, dayLabel, relativeTime } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, Badge, EmptyState, Notice } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Company calendar" };

// ---------------------------------------------------------------------------
// THE COMPANY CALENDAR
// ---------------------------------------------------------------------------
// Deliberately separate from the operations calendar. A customer trip and a
// Tuesday management meeting have almost nothing in common operationally, and
// merging them is exactly how operations calendars become unreadable — the
// screen you check at 05:30 should contain only things that involve a client.
// ---------------------------------------------------------------------------

const KIND_LABELS: Record<string, string> = {
  meeting: "Meeting", one_on_one: "One-on-one", training: "Training", interview: "Interview",
  company_event: "Company event", supplier_meeting: "Supplier meeting", deadline: "Deadline",
  holiday: "Holiday", other: "Other",
};

export default async function CompanyCalendarPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "events.view")) return <NoAccess what="the company calendar" permission="events.view" />;

  const db = osdb();
  const org = await getOrg();
  const today = todayInCairo();

  const [{ data: events }, { data: myAttendance }] = await Promise.all([
    db.from("os_events")
      .select("id, kind, title, description, starts_at, ends_at, all_day, location, meeting_url, visibility, organizer_employee_id, os_employees ( full_name )")
      .eq("org_id", org.id).is("cancelled_at", null)
      .gte("starts_at", `${addDays(today, -7)}T00:00:00Z`)
      .lte("starts_at", `${addDays(today, 45)}T23:59:59Z`)
      .order("starts_at"),
    db.from("os_event_attendees").select("event_id, response").eq("employee_id", actor.employeeId),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const attendeeMap = new Map(((myAttendance ?? []) as any[]).map((a) => [a.event_id as string, a.response as string]));

  // Private events are only visible to the organizer and the invitees.
  const visible = ((events ?? []) as any[]).filter((event) => {
    if (event.visibility !== "private") return true;
    return event.organizer_employee_id === actor.employeeId || attendeeMap.has(event.id);
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const byDay = new Map<string, typeof visible>();
  for (const event of visible) {
    const day = String(event.starts_at).slice(0, 10);
    const list = byDay.get(day) ?? [];
    list.push(event);
    byDay.set(day, list);
  }

  const days = Array.from(byDay.keys()).sort();
  const mine = visible.filter((e) => attendeeMap.has(e.id) && String(e.starts_at).slice(0, 10) >= today);

  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="Company calendar"
        description="Meetings, training, interviews and deadlines. Deliberately separate from the operations calendar."
        actions={can(actor, "calendar.view") ? (
          <Link href="/os/calendar" className="rounded-lg border border-os-line-strong bg-white px-3 py-2 text-[13px] font-medium text-os-text hover:bg-black/[0.03]">
            Operations calendar →
          </Link>
        ) : null}
      />

      {mine.length ? (
        <div className="mb-5">
          <Notice tone="blue" title={`You are invited to ${mine.length} upcoming event${mine.length === 1 ? "" : "s"}`}>
            Next: {mine[0].title} — {relativeTime(mine[0].starts_at)}.
          </Notice>
        </div>
      ) : null}

      {days.length === 0 ? (
        <EmptyState
          title="Nothing on the company calendar"
          description="Meetings, training and deadlines appear here. Customer trips never do — those live on the operations calendar."
          icon={<Icon.Calendar size={26} />}
        />
      ) : (
        <div className="max-w-3xl space-y-4">
          {days.map((day) => (
            <section key={day}>
              <div className="mb-2 flex items-baseline gap-2">
                <h2 className={`text-[14px] font-semibold ${day === today ? "text-os-gold" : "text-os-text"}`}>{dayLabel(day, today)}</h2>
                <span className="text-[12px] text-os-faint">{formatDate(day)}</span>
              </div>
              <Card padded={false}>
                <ul>
                  {(byDay.get(day) ?? []).map((event) => (
                    <li key={event.id} className="flex items-start gap-3 border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                      <span className="os-nums w-14 shrink-0 text-[13px] font-semibold text-os-text">
                        {event.all_day ? "All day" : formatClock(event.starts_at)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-medium leading-snug text-os-text">{event.title}</p>
                        {event.description ? <p className="mt-0.5 text-[12px] leading-relaxed text-os-muted">{event.description}</p> : null}
                        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11.5px] text-os-faint">
                          <Badge tone="neutral">{KIND_LABELS[event.kind] ?? event.kind}</Badge>
                          {event.location ? <span>{event.location}</span> : null}
                          {event.os_employees?.full_name ? <span>· {event.os_employees.full_name}</span> : null}
                          {event.visibility === "private" ? <Badge tone="amber">Private</Badge> : null}
                        </p>
                      </div>
                      {attendeeMap.has(event.id) ? <Badge tone="green">You are invited</Badge> : null}
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
