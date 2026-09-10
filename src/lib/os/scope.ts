import "server-only";
import { cache } from "react";
import { osdb } from "./db";
import type { Actor } from "./actor";
import { scopeOf } from "./actor";
import type { PermissionKey, Scope } from "./permissions";

// ---------------------------------------------------------------------------
// TURNING A SCOPE INTO A QUERY FILTER
// ---------------------------------------------------------------------------
// A permission answers "may they"; a scope answers "over which rows". This
// module is the only place the second question is turned into SQL, so there is
// exactly one definition of "mine" and one of "my unit" in the whole system.
//
// "Mine", for a trip, means: I am assigned to it, or I created it. That is the
// definition a photographer, a driver and a guide would all recognise, and it
// is what the field roles' entire view of the company is built on.
// ---------------------------------------------------------------------------

export type TripScope =
  | { kind: "all" }
  | { kind: "unit"; unitIds: string[] }
  | { kind: "own"; tripIds: string[] }
  | { kind: "none" };

/** Trip ids this actor is personally connected to. Cached per request. */
export const ownTripIds = cache(async (employeeId: string): Promise<string[]> => {
  const db = osdb();
  const [assigned, created] = await Promise.all([
    db.from("os_trip_assignments").select("trip_id").eq("employee_id", employeeId),
    db.from("os_trips").select("id").eq("created_by", employeeId),
  ]);
  const ids = new Set<string>();
  for (const row of assigned.data ?? []) ids.add(row.trip_id as string);
  for (const row of created.data ?? []) ids.add(row.id as string);
  return Array.from(ids);
});

/** Resolve the row-level reach an actor has for a trip-shaped permission. */
export async function tripScopeFor(actor: Actor | null, permission: PermissionKey): Promise<TripScope> {
  const scope = scopeOf(actor, permission);
  if (!actor || !scope) return { kind: "none" };
  if (scope === "all") return { kind: "all" };
  if (scope === "unit") {
    // A unit-scoped person with no unit membership would otherwise see the
    // whole company. Fail closed instead.
    return actor.unitIds.length ? { kind: "unit", unitIds: actor.unitIds } : { kind: "none" };
  }
  const ids = await ownTripIds(actor.employeeId);
  return ids.length ? { kind: "own", tripIds: ids } : { kind: "own", tripIds: [] };
}

/**
 * Apply a trip scope to a PostgREST query builder over a table that has
 * `id`/`unit_id` (os_trips) or `trip_id`/`unit_id` (anything hanging off a trip).
 */
// The Supabase query builder's type is deeply generic; narrowing it here would
// force every call site to name a huge type. The structural constraint below
// captures the one method this needs, which is stable across all of them.
export function applyTripScope<T extends { in: (col: string, values: readonly string[]) => T }>(
  query: T,
  scope: TripScope,
  columns: { id?: string; unit?: string } = {},
): T {
  const idColumn = columns.id ?? "id";
  const unitColumn = columns.unit ?? "unit_id";
  switch (scope.kind) {
    case "all":
      return query;
    case "unit":
      return query.in(unitColumn, scope.unitIds);
    case "own":
      // An empty list must match nothing. PostgREST's `in.()` with no values
      // does exactly that, but passing a sentinel is clearer and portable.
      return query.in(idColumn, scope.tripIds.length ? scope.tripIds : [NO_MATCH]);
    case "none":
      return query.in(idColumn, [NO_MATCH]);
  }
}

/** A uuid that cannot exist, used to make a scoped query return nothing. */
export const NO_MATCH = "00000000-0000-0000-0000-000000000000";

/** Can this actor reach one specific trip, for one permission? */
export async function canReachTrip(
  actor: Actor | null,
  permission: PermissionKey,
  trip: { id: string; unit_id: string | null },
): Promise<boolean> {
  const scope = await tripScopeFor(actor, permission);
  switch (scope.kind) {
    case "all":
      return true;
    case "unit":
      return Boolean(trip.unit_id && scope.unitIds.includes(trip.unit_id));
    case "own":
      return scope.tripIds.includes(trip.id);
    case "none":
      return false;
  }
}

/**
 * The scope label to show a user, so nobody is ever confused about why a list
 * looks shorter than a colleague's.
 */
export function scopeNote(scope: Scope | null): string | null {
  if (scope === "unit") return "Showing your business units only.";
  if (scope === "own") return "Showing only what you are assigned to.";
  return null;
}
