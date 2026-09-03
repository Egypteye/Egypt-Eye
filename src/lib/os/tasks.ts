import "server-only";
import { osdb, getOrg } from "./db";
import type { Actor } from "./actor";
import { scopeOf } from "./actor";
import { NO_MATCH, ownTripIds } from "./scope";
import { notify } from "./notify";

// ---------------------------------------------------------------------------
// TASKS
// ---------------------------------------------------------------------------
// A task template turns into real tasks the moment a trip is created. Two
// details make this useful rather than bureaucratic:
//
//  * Template steps are owned by a ROLE, not a person, so the checklist
//    survives staff changes. At generation time the role is resolved to the
//    person actually assigned to it on that trip; if nobody is assigned yet,
//    the task still lands on the right desk via owner_role_key rather than
//    disappearing.
//
//  * Due dates are relative to the trip's own start, so "confirm the pickup"
//    is due the evening before every trip, not on a date somebody typed.
// ---------------------------------------------------------------------------

export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueAt: string | null;
  phase: string;
  blocking: boolean;
  ownerEmployeeId: string | null;
  ownerName: string | null;
  ownerRoleKey: string | null;
  tripId: string | null;
  tripRef: string | null;
  tripTitle: string | null;
  entityType: string;
  overdue: boolean;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

const TASK_SELECT =
  "id, title, description, status, priority, due_at, phase, blocking, owner_employee_id, owner_role_key, " +
  "trip_id, entity_type, os_employees ( full_name ), os_trips ( ref, title )";

export type TaskFilters = {
  ownerEmployeeId?: string;
  tripId?: string;
  statuses?: string[];
  priorities?: string[];
  overdueOnly?: boolean;
  dueBefore?: string;
  search?: string;
  limit?: number;
  mineOnly?: boolean;
};

export async function listTasks(actor: Actor, filters: TaskFilters = {}): Promise<TaskItem[]> {
  const org = await getOrg();
  const db = osdb();
  const scope = scopeOf(actor, "tasks.view");
  if (!scope) return [];

  let query = db.from("os_tasks").select(TASK_SELECT).eq("org_id", org.id).is("archived_at", null);

  // 'own' for tasks means: assigned to me, or on a trip that is mine.
  if (scope === "own" || filters.mineOnly) {
    const tripIds = await ownTripIds(actor.employeeId);
    const orParts = [`owner_employee_id.eq.${actor.employeeId}`];
    if (tripIds.length) orParts.push(`trip_id.in.(${tripIds.join(",")})`);
    query = query.or(orParts.join(","));
  } else if (scope === "unit") {
    query = actor.unitIds.length ? query.in("unit_id", actor.unitIds) : query.eq("id", NO_MATCH);
  }

  if (filters.ownerEmployeeId) query = query.eq("owner_employee_id", filters.ownerEmployeeId);
  if (filters.tripId) query = query.eq("trip_id", filters.tripId);
  query = query.in("status", filters.statuses ?? ["todo", "in_progress", "blocked", "done"]);
  if (filters.priorities?.length) query = query.in("priority", filters.priorities);
  if (filters.dueBefore) query = query.lte("due_at", filters.dueBefore);
  if (filters.overdueOnly) query = query.lt("due_at", new Date().toISOString()).in("status", ["todo", "in_progress", "blocked"]);
  if (filters.search) {
    const term = filters.search.replace(/[%,()]/g, " ").trim();
    if (term) query = query.ilike("title", `%${term}%`);
  }

  query = query.order("due_at", { nullsFirst: false }).limit(filters.limit ?? 200);

  const { data } = await query;
  const now = Date.now();
  return ((data ?? []) as Raw[]).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueAt: t.due_at,
    phase: t.phase,
    blocking: t.blocking,
    ownerEmployeeId: t.owner_employee_id,
    ownerName: t.os_employees?.full_name ?? null,
    ownerRoleKey: t.owner_role_key,
    tripId: t.trip_id,
    tripRef: t.os_trips?.ref ?? null,
    tripTitle: t.os_trips?.title ?? null,
    entityType: t.entity_type,
    overdue: Boolean(t.due_at && new Date(t.due_at).getTime() < now && !["done", "cancelled"].includes(t.status)),
  }));
}

/**
 * Generate a trip's operational checklist from its type's template.
 * Idempotent: re-running for a trip that already has its tasks does nothing,
 * so an automation that fires twice cannot produce a duplicated checklist.
 */
export async function generateTripTasks(tripId: string, actorEmployeeId: string | null): Promise<number> {
  const db = osdb();
  const org = await getOrg();

  const { data: trip } = await db
    .from("os_trips")
    .select("id, ref, title, unit_id, starts_at, trip_date, created_by, os_trip_types ( default_task_template_id )")
    .eq("id", tripId)
    .maybeSingle();
  if (!trip) return 0;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const templateId = (trip as any).os_trip_types?.default_task_template_id as string | undefined;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (!templateId) return 0;

  const [{ data: items }, { data: existing }, { data: assignments }] = await Promise.all([
    db.from("os_task_template_items").select("*").eq("template_id", templateId).order("seq"),
    db.from("os_tasks").select("template_item_id").eq("trip_id", tripId).not("template_item_id", "is", null),
    db.from("os_trip_assignments").select("role_key, employee_id").eq("trip_id", tripId).not("employee_id", "is", null),
  ]);

  const done = new Set((existing ?? []).map((t) => t.template_item_id as string));
  const byRole = new Map<string, string>();
  for (const a of assignments ?? []) {
    if (a.employee_id && !byRole.has(a.role_key as string)) byRole.set(a.role_key as string, a.employee_id as string);
  }

  const pending = (items ?? []).filter((i) => !done.has(i.id as string));
  if (!pending.length) return 0;

  // Fall back to whoever holds the role in the company, preferring the trip's
  // own business unit — the same rule the demo seed uses.
  const roleKeys = Array.from(new Set(pending.map((i) => i.owner_role_key as string).filter(Boolean)));
  const roleOwners = new Map<string, string>();
  if (roleKeys.length) {
    const { data: holders } = await db
      .from("os_employee_roles")
      .select("employee_id, os_roles!inner ( key ), os_employees!inner ( primary_unit_id, code, archived_at )")
      .in("os_roles.key", roleKeys);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const sorted = ((holders ?? []) as any[])
      .filter((h) => !h.os_employees?.archived_at)
      .sort((a, b) => {
        const aMatch = a.os_employees?.primary_unit_id === trip.unit_id ? 0 : 1;
        const bMatch = b.os_employees?.primary_unit_id === trip.unit_id ? 0 : 1;
        return aMatch - bMatch || String(a.os_employees?.code).localeCompare(String(b.os_employees?.code));
      });
    for (const h of sorted) {
      const key = h.os_roles?.key as string;
      if (key && !roleOwners.has(key)) roleOwners.set(key, h.employee_id as string);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  const startsAt = trip.starts_at ? new Date(trip.starts_at as string) : new Date(`${trip.trip_date}T09:00:00Z`);

  const rows = pending.map((i) => {
    const due = new Date(startsAt.getTime());
    due.setDate(due.getDate() + Number(i.offset_days ?? 0));
    due.setHours(due.getHours() + Number(i.offset_hours ?? 0));
    const roleKey = i.owner_role_key as string | null;
    return {
      org_id: org.id,
      title: i.title,
      description: i.description,
      status: "todo",
      priority: i.priority,
      owner_employee_id: (roleKey ? byRole.get(roleKey) ?? roleOwners.get(roleKey) : null) ?? null,
      owner_role_key: roleKey,
      entity_type: "trip",
      entity_id: tripId,
      trip_id: tripId,
      unit_id: trip.unit_id,
      due_at: due.toISOString(),
      phase: i.phase,
      blocking: i.blocking,
      template_item_id: i.id,
      created_by: actorEmployeeId ?? trip.created_by,
    };
  });

  const { data: inserted } = await db.from("os_tasks").insert(rows).select("id, owner_employee_id, title");

  const owners = Array.from(new Set((inserted ?? []).map((t) => t.owner_employee_id as string).filter(Boolean)));
  if (owners.length) {
    await notify({
      employeeIds: owners,
      level: "info",
      category: "task",
      title: `New tasks on ${trip.ref}`,
      body: `${trip.title} — the operational checklist has been created and some of it is yours.`,
      href: `/os/trips/${trip.ref}/tasks`,
      entityType: "trip",
      entityId: tripId,
      dedupeKey: `tasks-generated:${tripId}`,
    });
  }

  return rows.length;
}

/** Reassign a trip's role-owned tasks when the crew changes. */
export async function reassignRoleTasks(tripId: string, roleKey: string, employeeId: string | null): Promise<void> {
  await osdb()
    .from("os_tasks")
    .update({ owner_employee_id: employeeId })
    .eq("trip_id", tripId)
    .eq("owner_role_key", roleKey)
    .in("status", ["todo", "in_progress", "blocked"]);
}

export const TASK_STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
  cancelled: "Cancelled",
};

export const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
