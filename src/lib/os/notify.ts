import "server-only";
import { osdb, getOrg } from "./db";

// ---------------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------------
// The design constraint here is restraint. A system that notifies an employee
// about everything trains them to read nothing, and then the one notification
// that mattered — "tomorrow's 05:45 trip has no driver" — is lost in the pile.
//
// So: three levels only, a required category, and a dedupe key. The unique
// index on (employee_id, dedupe_key) where read_at is null means the
// readiness sweep can shout about the same missing driver every hour without
// producing twenty-four identical lines; it produces one, until someone reads
// it or fixes it.
// ---------------------------------------------------------------------------

export type NotifyLevel = "critical" | "warning" | "info";
export type NotifyCategory =
  | "assignment" | "task" | "approval" | "trip" | "mention"
  | "incident" | "readiness" | "content" | "attendance" | "system";

export type NotifyInput = {
  employeeIds: string[];
  level: NotifyLevel;
  category: NotifyCategory;
  title: string;
  body?: string;
  href?: string;
  entityType?: string;
  entityId?: string;
  /** Same key + same person + still unread = do not create a second one. */
  dedupeKey?: string;
};

export async function notify(input: NotifyInput): Promise<void> {
  const recipients = Array.from(new Set(input.employeeIds.filter(Boolean)));
  if (!recipients.length) return;
  const org = await getOrg();

  const rows = recipients.map((employeeId) => ({
    org_id: org.id,
    employee_id: employeeId,
    level: input.level,
    category: input.category,
    title: input.title,
    body: input.body ?? null,
    href: input.href ?? null,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    dedupe_key: input.dedupeKey ?? null,
  }));

  // The partial unique index rejects duplicates. Ignoring the conflict is the
  // whole point, so this is not an error path.
  await osdb().from("os_notifications").upsert(rows, {
    onConflict: "employee_id,dedupe_key",
    ignoreDuplicates: true,
  });
}

/** Everyone holding a role, for "tell operations" style alerts. */
export async function employeesWithRole(roleKey: string): Promise<string[]> {
  const { data } = await osdb()
    .from("os_employee_roles")
    .select("employee_id, os_roles!inner ( key )")
    .eq("os_roles.key", roleKey);
  return (data ?? []).map((r) => r.employee_id as string);
}

/** Everyone assigned to a trip — the crew who need to know it changed. */
export async function employeesOnTrip(tripId: string): Promise<string[]> {
  const { data } = await osdb()
    .from("os_trip_assignments")
    .select("employee_id")
    .eq("trip_id", tripId)
    .not("employee_id", "is", null)
    .in("status", ["proposed", "assigned", "confirmed"]);
  return (data ?? []).map((r) => r.employee_id as string).filter(Boolean);
}

export async function unreadCount(employeeId: string): Promise<number> {
  const { count } = await osdb()
    .from("os_notifications")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .is("read_at", null);
  return count ?? 0;
}

export async function markRead(employeeId: string, ids?: string[]): Promise<void> {
  let query = osdb().from("os_notifications").update({ read_at: new Date().toISOString() })
    .eq("employee_id", employeeId).is("read_at", null);
  if (ids?.length) query = query.in("id", ids);
  await query;
}
