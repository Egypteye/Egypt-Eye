import "server-only";
import { osdb, getOrg } from "../db";
import { scopeOf, type Actor } from "../actor";
import type { PermissionKey } from "../permissions";
import { NO_MATCH } from "../scope";

// ---------------------------------------------------------------------------
// WHAT A COMMERCIAL SCOPE ACTUALLY MEANS
// ---------------------------------------------------------------------------
// Operations scopes on assignment: 'own' means the trips you are working. The
// commercial layer scopes on OWNERSHIP instead — a salesperson's own deals are
// the deals they own, not the ones they happen to have touched.
//
//   all   every record in the organization
//   unit  records belonging to a business unit the actor is a member of
//   own   records the actor owns or created
//
// This is applied to the query BEFORE it leaves, exactly as in src/lib/os/
// scope.ts, so there is no path that reads a commercial record without it.
// ---------------------------------------------------------------------------

export type CommercialScope =
  | { kind: "none" }
  | { kind: "all" }
  | { kind: "unit"; unitIds: string[]; employeeId: string }
  | { kind: "own"; employeeId: string };

export function commercialScope(actor: Actor, permission: PermissionKey): CommercialScope {
  const scope = scopeOf(actor, permission);
  if (!scope) return { kind: "none" };
  if (scope === "all") return { kind: "all" };
  if (scope === "unit") {
    return actor.unitIds.length
      ? { kind: "unit", unitIds: actor.unitIds, employeeId: actor.employeeId }
      : { kind: "own", employeeId: actor.employeeId };
  }
  return { kind: "own", employeeId: actor.employeeId };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Query = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Narrow a query to what the actor may see.
 *
 * `ownerColumn` is the column that decides ownership on this table. For a
 * table with no unit column, pass `unitColumn: null` and a unit-scoped actor
 * falls back to their own records rather than silently seeing everything —
 * failing closed is the only safe direction here.
 */
export function applyCommercialScope(
  query: Query,
  scope: CommercialScope,
  options: { ownerColumn: string; createdColumn?: string | null; unitColumn?: string | null } ,
): Query {
  if (scope.kind === "all") return query;
  if (scope.kind === "none") return query.eq("id", NO_MATCH);
  if (scope.kind === "unit") {
    if (options.unitColumn) return query.in(options.unitColumn, scope.unitIds);
    // This table has no unit column. Falling back to the actor's own records
    // is the only safe direction: a unit-scoped person must never widen to
    // the whole company because a column happens to be missing.
    return ownFilter(query, scope.employeeId, options);
  }
  return ownFilter(query, scope.employeeId, options);
}

function ownFilter(query: Query, employeeId: string, options: { ownerColumn: string; createdColumn?: string | null }): Query {
  if (!employeeId) return query.eq("id", NO_MATCH);
  const clauses = [`${options.ownerColumn}.eq.${employeeId}`];
  if (options.createdColumn) clauses.push(`${options.createdColumn}.eq.${employeeId}`);
  return query.or(clauses.join(","));
}

/** The sentence shown under a list heading so nobody mistakes a filtered view for the whole book. */
export function commercialScopeNote(scope: CommercialScope): string | null {
  if (scope.kind === "own") return "You are seeing the records you own.";
  if (scope.kind === "unit") return "You are seeing your business unit's records.";
  return null;
}

/** Whether the actor may reach one specific record, checked server-side before any detail page renders. */
export async function canReachCommercial(
  actor: Actor,
  permission: PermissionKey,
  table: "os_leads" | "os_deals" | "os_companies" | "os_agreements",
  id: string,
): Promise<boolean> {
  const scope = commercialScope(actor, permission);
  if (scope.kind === "none") return false;
  if (scope.kind === "all") return true;

  const org = await getOrg();
  const ownerColumn = table === "os_agreements" ? "created_by" : "owner_employee_id";
  const { data } = await osdb()
    .from(table)
    .select(`id, ${ownerColumn}, created_by`)
    .eq("org_id", org.id)
    .eq("id", id)
    .maybeSingle();
  if (!data) return false;

  const row = data as Record<string, unknown>;
  return row[ownerColumn] === actor.employeeId || row.created_by === actor.employeeId;
}
