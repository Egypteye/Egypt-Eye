import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { todayInCairo, addDays, formatDate, formatClock } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, Table, Th, Td, EmptyState } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Attendance" };

// Deliberately thin. This answers "who is working today" for operations. It is
// not payroll — Egypt Eye has an accountant, and a half-built payroll module
// is worse than none at all.
export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "attendance.view")) return <NoAccess what="attendance" permission="attendance.view" />;

  const params = await searchParams;
  const date = (Array.isArray(params.date) ? params.date[0] : params.date) ?? todayInCairo();
  const today = todayInCairo();

  const db = osdb();
  const org = await getOrg();

  const [{ data: rows }, { data: staff }] = await Promise.all([
    db.from("os_attendance")
      .select("id, employee_id, work_date, check_in_at, check_out_at, minutes, status, note, os_employees ( full_name, job_title, department )")
      .eq("org_id", org.id).eq("work_date", date).order("check_in_at", { nullsFirst: false }),
    db.from("os_employees").select("id, full_name, job_title").eq("org_id", org.id).eq("employment_type", "staff").eq("status", "active").is("archived_at", null),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const records = (rows ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const recorded = new Set(records.map((r) => r.employee_id as string));
  const missing = (staff ?? []).filter((s) => !recorded.has(s.id as string));

  const present = records.filter((r) => r.check_in_at);
  const late = records.filter((r) => r.status === "late");
  const onLeave = records.filter((r) => r.status === "leave");

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Attendance"
        description={`${formatDate(date)}${date === today ? " — today" : ""}`}
        actions={
          <div className="flex gap-1">
            <Link href={`/os/attendance?date=${addDays(date, -1)}`} className="rounded-lg border border-os-line-strong bg-white p-2 text-os-muted hover:text-os-text" aria-label="Previous day">
              <Icon.ArrowLeft size={15} />
            </Link>
            <Link href={`/os/attendance?date=${today}`} className="rounded-lg border border-os-line-strong bg-white px-3 py-2 text-[13px] font-medium text-os-text hover:bg-black/[0.03]">Today</Link>
            <Link href={`/os/attendance?date=${addDays(date, 1)}`} className="rounded-lg border border-os-line-strong bg-white p-2 text-os-muted hover:text-os-text" aria-label="Next day">
              <Icon.ChevronRight size={15} />
            </Link>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Checked in" value={present.length} />
        <Stat label="Late" value={late.length} tone={late.length ? "amber" : undefined} />
        <Stat label="On leave" value={onLeave.length} />
        <Stat label="No record" value={missing.length} tone={missing.length && date <= today ? "amber" : undefined} sub={date > today ? "Future date" : "Staff with nothing logged"} />
      </div>

      {records.length === 0 ? (
        <EmptyState
          title="Nothing recorded for this day"
          description={date > today ? "This day has not happened yet." : "Nobody checked in. That may be a weekend, a holiday, or a problem."}
          icon={<Icon.Clock size={26} />}
        />
      ) : (
        <Table>
          <thead>
            <tr><Th>Person</Th><Th>Department</Th><Th>In</Th><Th>Out</Th><Th>Hours</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {records.map((row) => (
              <tr key={row.id}>
                <Td>
                  <Link href={`/os/team/${row.employee_id}`} className="block text-[13px] font-medium text-os-text">
                    {row.os_employees?.full_name}
                  </Link>
                  <span className="block text-[11px] text-os-faint">{row.os_employees?.job_title}</span>
                </Td>
                <Td className="text-[12px] text-os-muted">{row.os_employees?.department ?? "—"}</Td>
                <Td className="os-nums">{row.check_in_at ? formatClock(row.check_in_at) : "—"}</Td>
                <Td className="os-nums">{row.check_out_at ? formatClock(row.check_out_at) : row.check_in_at ? <span className="text-os-faint">still in</span> : "—"}</Td>
                <Td className="os-nums text-os-muted">{row.minutes ? `${Math.floor(row.minutes / 60)}h ${row.minutes % 60}m` : "—"}</Td>
                <Td>
                  <Badge tone={row.status === "late" ? "amber" : row.status === "absent" ? "red" : row.status === "leave" ? "neutral" : "green"}>
                    {row.status}
                  </Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {missing.length && date <= today ? (
        <Card className="mt-5">
          <CardHeader title="No record today" subtitle="Staff with nothing logged. Could be leave, could be a forgotten check-in." />
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {missing.map((person) => (
              <li key={person.id as string}>
                <Link href={`/os/team/${person.id}`} className="rounded-md bg-black/[0.05] px-2 py-1 text-[12px] text-os-muted hover:text-os-text">
                  {person.full_name as string}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <p className="mt-5 max-w-2xl text-[12px] leading-relaxed text-os-faint">
        Attendance here exists so operations knows who is available today. It is deliberately not a payroll system — Egypt Eye
        already has an accountant, and a half-built payroll module would be worse than none.
      </p>
    </>
  );
}
