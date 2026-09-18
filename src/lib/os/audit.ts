import "server-only";
import { headers } from "next/headers";
import { osdb, getOrg } from "./db";
import type { Actor } from "./actor";

// ---------------------------------------------------------------------------
// THE RECORD OF WHAT HAPPENED
// ---------------------------------------------------------------------------
// Two tables, two different jobs, and they are not interchangeable:
//
//   os_activity  — the human story of a record. "Ahmed assigned as
//                  photographer." Rendered on every entity's Activity tab and
//                  written in language an employee would use.
//
//   os_audit_log — the forensic record. Exact before/after values, the actor's
//                  identity, their IP and user agent. Append-only: the
//                  service-role key this application holds has INSERT and
//                  SELECT on it and nothing else, so no code path here can
//                  rewrite or erase it.
//
// Anything that changes money, permissions, assignments, status or client data
// writes both. Reads are never audited — an audit log that records every page
// view is one nobody can read when it matters.
// ---------------------------------------------------------------------------

export type ActivityInput = {
  entityType: string;
  entityId: string;
  tripId?: string | null;
  verb: string;
  summary: string;
  meta?: Record<string, unknown>;
};

export async function logActivity(actor: Actor | null, input: ActivityInput): Promise<void> {
  const org = await getOrg();
  await osdb().from("os_activity").insert({
    org_id: org.id,
    entity_type: input.entityType,
    entity_id: input.entityId,
    trip_id: input.tripId ?? null,
    employee_id: actor?.employeeId ?? null,
    verb: input.verb,
    summary: input.summary,
    meta: input.meta ?? {},
  });
}

export type AuditInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

export async function logAudit(actor: Actor | null, input: AuditInput): Promise<void> {
  const org = await getOrg();
  let ip: string | null = null;
  let userAgent: string | null = null;
  try {
    const h = await headers();
    ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    userAgent = h.get("user-agent");
  } catch {
    // Called outside a request (a scheduled sweep). The actor and timestamp
    // still tell the story; the network detail simply does not exist.
  }

  await osdb().from("os_audit_log").insert({
    org_id: org.id,
    actor_employee_id: actor?.employeeId ?? null,
    actor_user_id: actor?.userId ?? null,
    actor_label: actor?.name ?? "System",
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    entity_label: input.entityLabel ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
    changed_fields: changedFields(input.before, input.after),
    ip,
    user_agent: userAgent,
  });
}

/** Both, in one call, for the common case. */
export async function record(
  actor: Actor | null,
  activity: ActivityInput,
  audit: Omit<AuditInput, "entityType" | "entityId">,
): Promise<void> {
  await Promise.all([
    logActivity(actor, activity),
    logAudit(actor, {
      ...audit,
      entityType: activity.entityType,
      entityId: activity.entityId,
    }),
  ]);
}

function changedFields(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): string[] | null {
  if (!before || !after) return null;
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed: string[] = [];
  for (const key of keys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) changed.push(key);
  }
  return changed.length ? changed : null;
}

/** Diff two records down to the fields that actually moved, for a compact log entry. */
export function diff<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>,
): { before: Record<string, unknown>; after: Record<string, unknown> } | null {
  const b: Record<string, unknown> = {};
  const a: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(after)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(value)) {
      b[key] = before[key];
      a[key] = value;
    }
  }
  return Object.keys(a).length ? { before: b, after: a } : null;
}
