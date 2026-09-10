import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can, canManageRole } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { listTrips } from "@/lib/os/trips";
import { todayInCairo, formatDate, relativeTime, formatTime } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, Avatar, EmptyState, Divider } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { RoleManager } from "./RoleManager";

export const dynamic = "force-dynamic";

// One person: what they do, what they are on, how they have performed, and —
// for anyone who may grant roles — exactly what the system will let them see.
// That last panel is the honest answer to "what can Ahmed actually do", which
// is otherwise guesswork.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await osdb().from("os_employees").select("full_name").eq("id", id).maybeSingle();
  return { title: (data?.full_name as string) ?? "Team member" };
}

export default async function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "team.view")) return <NoAccess what="team records" permission="team.view" />;

  const db = osdb();
  const org = await getOrg();
  const today = todayInCairo();

  const { data: employee } = await db
    .from("os_employees").select("*, os_business_units ( name )").eq("id", id).eq("org_id", org.id).maybeSingle();
  if (!employee) notFound();

  const [trips, { data: roleRows }, { data: allRoles }, { data: reviews }, { data: overrides }, { data: unavailability }, { data: attendance }] = await Promise.all([
    listTrips(actor, { employeeId: id, from: today, limit: 40 }),
    db.from("os_employee_roles").select("role_id, granted_at, os_roles ( id, key, name, color, rank, description )").eq("employee_id", id),
    can(actor, "team.roles") ? db.from("os_roles").select("id, key, name, rank, description").eq("org_id", org.id).is("archived_at", null).order("rank") : Promise.resolve({ data: null }),
    can(actor, "team.performance")
      ? db.from("os_performance_reviews").select("id, rating, punctuality, quality, professionalism, note, created_at, os_trips ( ref, title )").eq("employee_id", id).order("created_at", { ascending: false }).limit(12)
      : Promise.resolve({ data: null }),
    can(actor, "team.roles") ? db.from("os_permission_overrides").select("permission_key, scope, granted, reason, granted_at").eq("employee_id", id) : Promise.resolve({ data: null }),
    db.from("os_unavailability").select("id, reason, starts_at, ends_at, note").eq("employee_id", id).gte("ends_at", `${today}T00:00:00Z`).order("starts_at"),
    can(actor, "attendance.view")
      ? db.from("os_attendance").select("work_date, status, check_in_at, check_out_at, minutes").eq("employee_id", id).order("work_date", { ascending: false }).limit(14)
      : Promise.resolve({ data: null }),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const roles = ((roleRows ?? []) as any[]).filter((r) => r.os_roles).map((r) => r.os_roles);
  const reviewRows = (reviews ?? []) as any[];
  const overrideRows = (overrides ?? []) as any[];
  const attendanceRows = (attendance ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const avgRating = reviewRows.length
    ? Math.round((reviewRows.reduce((s, r) => s + Number(r.rating), 0) / reviewRows.length) * 10) / 10
    : null;
  const punctuality = reviewRows.filter((r) => r.punctuality).length
    ? Math.round((reviewRows.reduce((s, r) => s + Number(r.punctuality ?? 0), 0) / reviewRows.filter((r) => r.punctuality).length) * 10) / 10
    : null;

  const showRate = can(actor, "team.rates");
  const isSelf = employee.id === actor.employeeId;

  return (
    <>
      <div className="mb-4">
        <Link href="/os/team" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-os-muted hover:text-os-text">
          <Icon.ArrowLeft size={14} />Team
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-start gap-4">
        <Avatar name={employee.full_name as string} url={employee.avatar_url as string | null} size={64} />
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow={(employee.code as string) + (isSelf ? " · you" : "")}
            title={employee.full_name as string}
            description={
              <span className="flex flex-wrap items-center gap-2">
                <span>{[employee.job_title, employee.department, (employee.os_business_units as { name: string } | null)?.name].filter(Boolean).join(" · ")}</span>
                {roles.map((role) => (
                  <span key={role.id} className="rounded px-1.5 py-0.5 text-[11px] font-medium" style={{ background: `${role.color}22`, color: "#16211c" }}>
                    {role.name}
                  </span>
                ))}
                {employee.status !== "active" ? <Badge tone="amber">{String(employee.status).replace(/_/g, " ")}</Badge> : null}
                {!employee.user_id ? <Badge tone="neutral">No sign-in</Badge> : null}
              </span>
            }
          />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Upcoming trips" value={trips.length} sub={trips[0] ? `Next ${formatDate(trips[0].tripDate)}` : "Nothing scheduled"} />
        <Stat label="Rating" value={avgRating ? `${avgRating}/5` : "—"} sub={reviewRows.length ? `${reviewRows.length} reviews` : "Not rated yet"} />
        <Stat label="Punctuality" value={punctuality ? `${punctuality}/5` : "—"} />
        {showRate ? (
          <Stat label="Day rate" value={employee.day_rate_amount ? formatMoney(Number(employee.day_rate_amount), employee.day_rate_currency as string) : "—"} />
        ) : (
          <Stat label="Employment" value={String(employee.employment_type).replace(/_/g, " ")} />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader title="Assignments" subtitle="Trips coming up" />
            </div>
            {trips.length ? (
              <ul>
                {trips.map((trip) => (
                  <li key={trip.id} className="border-b border-os-line/60 last:border-0">
                    <Link href={`/os/trips/${trip.ref}`} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-black/[0.02] sm:px-5">
                      <span className="w-20 shrink-0">
                        <span className="block text-[12.5px] font-semibold text-os-text">{formatDate(trip.tripDate)}</span>
                        <span className="os-nums block text-[11.5px] text-os-faint">{formatTime(trip.startTime)}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-os-text">{trip.title}</span>
                        <span className="block truncate text-[11.5px] text-os-faint">
                          {trip.ref} · {trip.crew.find((c) => c.employeeId === id)?.roleKey.replace(/_/g, " ") ?? ""}
                        </span>
                      </span>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${trip.readinessState === "green" ? "bg-os-green" : trip.readinessState === "yellow" ? "bg-os-amber" : "bg-os-red"}`} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 sm:px-5">
                <EmptyState title="No upcoming assignments" description="Nothing on their schedule right now." icon={<Icon.Trip size={22} />} />
              </div>
            )}
          </Card>

          {reviewRows.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader title="Performance" subtitle="Internal post-trip evaluations, separate from client feedback" />
              </div>
              <ul>
                {reviewRows.map((review) => (
                  <li key={review.id} className="border-b border-os-line/60 px-4 py-2.5 last:border-0 sm:px-5">
                    <p className="flex items-center gap-2 text-[12px] text-os-faint">
                      <span className="os-nums font-semibold text-os-text">{review.rating}/5</span>
                      {review.os_trips?.ref ? <span className="os-nums">{review.os_trips.ref}</span> : null}
                      <span>{relativeTime(review.created_at)}</span>
                    </p>
                    {review.note ? <p className="mt-0.5 text-[12.5px] leading-relaxed text-os-text">{review.note}</p> : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {can(actor, "team.roles") && allRoles ? (
            <Card>
              <CardHeader
                title="Access"
                subtitle="Roles decide what this person can reach. You can never grant a role at or above your own authority."
              />
              <div className="mt-3">
                <RoleManager
                  employeeId={id}
                  employeeName={employee.full_name as string}
                  held={roles.map((r) => ({ id: r.id, name: r.name, rank: r.rank, description: r.description }))}
                  available={(allRoles ?? []).map((r) => ({
                    id: r.id as string, name: r.name as string, rank: r.rank as number,
                    description: (r.description as string) ?? null,
                    manageable: canManageRole(actor, r.rank as number),
                  }))}
                  overrides={overrideRows.map((o) => ({
                    permissionKey: o.permission_key, scope: o.scope, granted: o.granted, reason: o.reason,
                  }))}
                />
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Capability" subtitle="What smart assignment matches on" />
            <div className="mt-3 space-y-3">
              <Chips label="Languages" values={(employee.languages as string[]) ?? []} />
              <Chips label="Skills" values={(employee.skills as string[]) ?? []} />
              {employee.home_city ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Based in</p>
                  <p className="mt-0.5 text-[13px] text-os-text">{employee.home_city as string}</p>
                </div>
              ) : null}
              {employee.can_drive ? <Badge tone="green">Can drive</Badge> : null}
            </div>
            {employee.notes ? (
              <>
                <Divider className="my-3.5" />
                <p className="text-[12.5px] leading-relaxed text-os-muted">{employee.notes as string}</p>
              </>
            ) : null}
          </Card>

          {unavailability?.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader title="Unavailable" subtitle="Blocked on the schedule, not just noted" />
              </div>
              <ul>
                {unavailability.map((row) => (
                  <li key={row.id as string} className="border-b border-os-line/60 px-4 py-2.5 last:border-0">
                    <p className="text-[12.5px] font-medium capitalize text-os-text">{String(row.reason).replace(/_/g, " ")}</p>
                    <p className="os-nums text-[11.5px] text-os-faint">
                      {String(row.starts_at).slice(0, 10)} → {String(row.ends_at).slice(0, 10)}
                    </p>
                    {row.note ? <p className="text-[11.5px] text-os-muted">{row.note as string}</p> : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {attendanceRows.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader title="Attendance" subtitle="Last two weeks" />
              </div>
              <ul>
                {attendanceRows.map((row) => (
                  <li key={row.work_date} className="flex items-center justify-between gap-2 border-b border-os-line/60 px-4 py-2 last:border-0">
                    <span className="os-nums text-[12.5px] text-os-text">{formatDate(row.work_date)}</span>
                    <span className="flex items-center gap-2">
                      {row.minutes ? <span className="os-nums text-[11.5px] text-os-faint">{Math.floor(row.minutes / 60)}h {row.minutes % 60}m</span> : null}
                      <Badge tone={row.status === "late" ? "amber" : row.status === "leave" ? "neutral" : "green"}>{row.status}</Badge>
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

function Chips({ label, values }: { label: string; values: string[] }) {
  if (!values.length) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {values.map((value) => (
          <span key={value} className="rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[11.5px] capitalize text-os-muted">
            {value.replace(/_/g, " ")}
          </span>
        ))}
      </div>
    </div>
  );
}
