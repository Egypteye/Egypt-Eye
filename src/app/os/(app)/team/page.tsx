import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { employeeUtilization, periodPresets } from "@/lib/os/analytics";
import { todayInCairo } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Table, Th, Td, Badge, Stat, Avatar, EmptyState, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team" };

// The directory, with the two things that actually get looked up: what someone
// can do, and how loaded they already are. Pay rates are a separate permission
// from seeing the person, because a coordinator needs the second and has no
// business with the first.
export default async function TeamPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "team.view")) return <NoAccess what="the team directory" permission="team.view" />;

  const db = osdb();
  const org = await getOrg();
  const today = todayInCairo();

  const [{ data: employees }, { data: roleRows }, utilization, { data: unavailable }] = await Promise.all([
    db.from("os_employees")
      .select("id, code, full_name, job_title, department, employment_type, status, skills, languages, home_city, day_rate_amount, day_rate_currency, avatar_url, user_id, os_business_units ( name )")
      .eq("org_id", org.id).is("archived_at", null).order("code"),
    db.from("os_employee_roles").select("employee_id, os_roles ( key, name, color )"),
    employeeUtilization(actor, periodPresets(today).week),
    db.from("os_unavailability").select("employee_id, reason, starts_at, ends_at").lte("starts_at", `${today}T23:59:59Z`).gte("ends_at", `${today}T00:00:00Z`).not("employee_id", "is", null),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (employees ?? []) as any[];
  const rolesByEmployee = new Map<string, { name: string; color: string }[]>();
  for (const row of (roleRows ?? []) as any[]) {
    if (!row.os_roles) continue;
    const list = rolesByEmployee.get(row.employee_id) ?? [];
    list.push({ name: row.os_roles.name, color: row.os_roles.color });
    rolesByEmployee.set(row.employee_id, list);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const loadById = new Map(utilization.map((u) => [u.id, u]));
  const awayToday = new Set((unavailable ?? []).map((u) => u.employee_id as string));

  const showRates = can(actor, "team.rates");
  const active = rows.filter((e) => e.status === "active");
  const withoutLogin = rows.filter((e) => !e.user_id).length;

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Team"
        description="Everyone who delivers the work, including freelance crew who have no login. A person exists here whether or not they can sign in."
        actions={
          can(actor, "team.create") ? (
            <Link href="/os/team/new" className={buttonClass.gold}><Icon.Plus size={15} />Add a person</Link>
          ) : null
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active" value={active.length} sub={`${rows.length} on the books`} />
        <Stat label="Away today" value={awayToday.size} sub={awayToday.size ? "Leave, sick or training" : "Everyone available"} />
        <Stat label="Freelance and partner" value={rows.filter((e) => e.employment_type !== "staff").length} />
        <Stat label="No sign-in yet" value={withoutLogin} sub={withoutLogin ? "Schedulable, but cannot open the OS" : "Everyone has access"} />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No team records yet"
          description="Add the people who run the operation, including crew who never sign in."
          icon={<Icon.Users size={26} />}
          action={can(actor, "team.create") ? <Link href="/os/team/new" className={buttonClass.gold}>Add the first person</Link> : undefined}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Person</Th><Th>Roles</Th><Th>Speaks</Th><Th>Can do</Th>
              <Th>This week</Th><Th>Status</Th>
              {showRates ? <Th align="right">Day rate</Th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((employee) => {
              const load = loadById.get(employee.id);
              return (
                <tr key={employee.id} className="transition hover:bg-black/[0.02]">
                  <Td>
                    <Link href={`/os/team/${employee.id}`} className="flex items-center gap-2.5">
                      <Avatar name={employee.full_name} url={employee.avatar_url} size={30} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-os-text">{employee.full_name}</span>
                        <span className="block truncate text-[11.5px] text-os-faint">
                          {employee.job_title ?? employee.code}
                          {employee.os_business_units?.name ? ` · ${employee.os_business_units.name}` : ""}
                        </span>
                      </span>
                    </Link>
                  </Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {(rolesByEmployee.get(employee.id) ?? []).map((role, i) => (
                        <span key={i} className="rounded px-1.5 py-0.5 text-[10.5px] font-medium" style={{ background: `${role.color}22`, color: "#16211c" }}>
                          {role.name}
                        </span>
                      ))}
                    </span>
                  </Td>
                  <Td className="text-[12px] text-os-muted">{(employee.languages ?? []).join(", ") || "—"}</Td>
                  <Td className="text-[12px] text-os-muted">{(employee.skills ?? []).slice(0, 3).join(", ") || "—"}</Td>
                  <Td>
                    {load ? (
                      <span className="flex items-center gap-2">
                        <span className="os-nums text-[12.5px] font-medium text-os-text">{load.bookings}</span>
                        {load.flag === "overloaded" ? <Badge tone="amber">Loaded</Badge> : null}
                        {load.flag === "underused" ? <Badge tone="neutral">Free</Badge> : null}
                      </span>
                    ) : <span className="text-os-faint">—</span>}
                  </Td>
                  <Td>
                    {awayToday.has(employee.id) ? <Badge tone="amber">Away today</Badge>
                      : employee.status === "active" ? <Badge tone="green">Active</Badge>
                      : <Badge tone="neutral">{String(employee.status).replace(/_/g, " ")}</Badge>}
                  </Td>
                  {showRates ? (
                    <Td align="right" className="os-nums">
                      {employee.day_rate_amount ? formatMoney(Number(employee.day_rate_amount), employee.day_rate_currency) : "—"}
                    </Td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
}
