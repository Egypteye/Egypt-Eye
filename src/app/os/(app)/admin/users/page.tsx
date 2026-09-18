import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { relativeTime } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, Table, Th, Td, Notice, Avatar } from "@/components/os/ui";
import { UserStatusControl } from "./UserStatusControl";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users and access" };

// Who can sign in, and what happens when someone leaves. The distinction that
// matters here: an employee record and a login are different things. Freelance
// crew are scheduled without ever having an account, and offboarding someone
// removes the login while keeping every trip they ever ran.
export default async function UsersPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "admin.users")) return <NoAccess what="user administration" permission="admin.users" />;

  const db = osdb();
  const org = await getOrg();

  const [{ data: employees }, { data: roleRows }, { data: logins }] = await Promise.all([
    db.from("os_employees")
      .select("id, code, full_name, email, job_title, department, employment_type, status, user_id, avatar_url, created_at")
      .eq("org_id", org.id).is("archived_at", null).order("code"),
    db.from("os_employee_roles").select("employee_id, os_roles ( name, color, rank )"),
    db.from("os_login_events").select("user_id, at, kind, ip").order("at", { ascending: false }).limit(200),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rolesByEmployee = new Map<string, { name: string; color: string }[]>();
  for (const row of (roleRows ?? []) as any[]) {
    if (!row.os_roles) continue;
    const list = rolesByEmployee.get(row.employee_id) ?? [];
    list.push({ name: row.os_roles.name, color: row.os_roles.color });
    rolesByEmployee.set(row.employee_id, list);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const lastLogin = new Map<string, { at: string; ip: string | null }>();
  for (const event of logins ?? []) {
    const key = event.user_id as string;
    if (key && !lastLogin.has(key)) lastLogin.set(key, { at: event.at as string, ip: (event.ip as string) ?? null });
  }

  const rows = employees ?? [];
  const withLogin = rows.filter((e) => e.user_id);
  const noRoles = rows.filter((e) => e.user_id && !(rolesByEmployee.get(e.id as string) ?? []).length);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Users and access"
        description="An employee record and a login are different things. Freelance crew are scheduled without ever having an account."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="People" value={rows.length} />
        <Stat label="Can sign in" value={withLogin.length} sub={`${rows.length - withLogin.length} schedulable without a login`} />
        <Stat label="Suspended" value={rows.filter((e) => e.status === "suspended").length} tone={rows.some((e) => e.status === "suspended") ? "amber" : undefined} />
        <Stat label="No roles" value={noRoles.length} tone={noRoles.length ? "amber" : undefined} sub={noRoles.length ? "They can sign in and see nothing" : "Everyone has a role"} />
      </div>

      {noRoles.length ? (
        <div className="mb-5">
          <Notice tone="amber" title={`${noRoles.length} account${noRoles.length === 1 ? "" : "s"} can sign in but hold no roles`}>
            {noRoles.map((e) => e.full_name).join(", ")} will reach the OS and see an empty shell. Grant a role on their team
            profile.
          </Notice>
        </div>
      ) : null}

      <Card padded={false}>
        <div className="border-b border-os-line px-4 py-3 sm:px-5">
          <CardHeader title="Everyone" subtitle="Sign-in state, roles and last activity" />
        </div>
        <Table className="rounded-none border-0">
          <thead>
            <tr><Th>Person</Th><Th>Sign-in</Th><Th>Roles</Th><Th>Last seen</Th><Th>Status</Th><Th /></tr>
          </thead>
          <tbody>
            {rows.map((employee) => {
              const roles = rolesByEmployee.get(employee.id as string) ?? [];
              const login = employee.user_id ? lastLogin.get(employee.user_id as string) : null;
              const isSelf = employee.id === actor.employeeId;
              return (
                <tr key={employee.id as string}>
                  <Td>
                    <Link href={`/os/team/${employee.id}`} className="flex items-center gap-2.5">
                      <Avatar name={employee.full_name as string} url={employee.avatar_url as string | null} size={28} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-os-text">
                          {employee.full_name as string}{isSelf ? " · you" : ""}
                        </span>
                        <span className="block truncate text-[11px] text-os-faint">{employee.code as string} · {employee.job_title as string}</span>
                      </span>
                    </Link>
                  </Td>
                  <Td>
                    {employee.user_id ? (
                      <span className="block text-[12px] text-os-muted">{(employee.email as string) ?? "linked"}</span>
                    ) : (
                      <Badge tone="neutral">No account</Badge>
                    )}
                  </Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {roles.map((role, i) => (
                        <span key={i} className="rounded px-1.5 py-0.5 text-[10.5px] font-medium" style={{ background: `${role.color}22`, color: "#16211c" }}>
                          {role.name}
                        </span>
                      ))}
                      {!roles.length ? <span className="text-[11.5px] text-os-amber">none</span> : null}
                    </span>
                  </Td>
                  <Td className="text-[11.5px] text-os-muted">
                    {login ? relativeTime(login.at) : employee.user_id ? "Never signed in" : "—"}
                  </Td>
                  <Td>
                    <Badge tone={employee.status === "active" ? "green" : employee.status === "suspended" ? "red" : "neutral"}>
                      {String(employee.status).replace(/_/g, " ")}
                    </Badge>
                  </Td>
                  <Td align="right">
                    {!isSelf ? (
                      <UserStatusControl employeeId={employee.id as string} name={employee.full_name as string} status={employee.status as string} />
                    ) : (
                      <span className="text-[11px] text-os-faint">Cannot change your own</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Card className="mt-5">
        <CardHeader title="How sign-in works" />
        <ul className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-os-muted">
          <li>
            <span className="font-medium text-os-text">Credentials are not stored here.</span> Supabase Auth owns password
            hashing, sessions, refresh tokens, email verification and password reset. The OS never sees a password.
          </li>
          <li>
            <span className="font-medium text-os-text">One account, every device.</span> The same sign-in works on a phone in a
            hotel car park and on a MacBook in the office — the OS is a responsive web app, so nothing needs installing.
          </li>
          <li>
            <span className="font-medium text-os-text">Losing a phone is handled.</span> Anyone can sign out of every device
            from their own workspace, which revokes every refresh token on the account.
          </li>
          <li>
            <span className="font-medium text-os-text">Offboarding keeps history.</span> Marking someone as left removes their
            access but keeps every trip they ran, every decision they made, and every audit entry with their name on it.
          </li>
          <li>
            <span className="font-medium text-os-text">Single sign-on is possible later.</span> Because identity is delegated to
            Supabase Auth rather than built here, adding Google or Microsoft sign-in is a provider configuration, not a rewrite.
          </li>
        </ul>
      </Card>
    </>
  );
}
