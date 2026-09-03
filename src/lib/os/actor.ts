import "server-only";
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { osdb, getOrg, OsForbiddenError } from "./db";
import { PERMISSION_KEYS, widerScope, type PermissionKey, type Scope } from "./permissions";

// ---------------------------------------------------------------------------
// WHO IS ACTING, AND WHAT MAY THEY DO
// ---------------------------------------------------------------------------
// Resolved once per request (React `cache`), from the Supabase Auth session
// via getUser() — which re-validates the JWT against the auth server rather
// than trusting the cookie, the right call anywhere the result gates real
// data.
//
// The effective permission set is computed here, in one place, from three
// layers applied in order:
//
//   1. Every role the employee holds contributes its permissions. Where two
//      roles grant the same permission, the WIDER scope wins.
//   2. Per-person overrides with granted = true widen or add.
//   3. Per-person overrides with granted = false REVOKE, and always win.
//
// Nothing else in the codebase computes permissions. A screen may hide a
// button, but hiding is cosmetic: the server action behind it calls
// requirePermission again, because the button was never the security boundary.
// ---------------------------------------------------------------------------

export type ActorRole = { key: string; name: string; rank: number; color: string; unitId: string | null };

export type Actor = {
  userId: string;
  employeeId: string;
  orgId: string;
  code: string;
  name: string;
  displayName: string;
  email: string | null;
  jobTitle: string | null;
  department: string | null;
  avatarUrl: string | null;
  status: string;
  primaryUnitId: string | null;
  unitIds: string[];
  roles: ActorRole[];
  /** Lowest rank number the actor holds. 0 is the owner. Used for "may I grant this role". */
  topRank: number;
  permissions: Partial<Record<PermissionKey, Scope>>;
  /** Cached set of trip ids this actor is personally connected to, for scope 'own'. */
  timezone: string;
  baseCurrency: string;
};

/** Signed in, but no employee record — a website customer who typed /os. */
export class OsNotStaffError extends Error {
  constructor() {
    super("This account is not a member of the Egypt Eye team.");
    this.name = "OsNotStaffError";
  }
}

export const getActor = cache(async (): Promise<Actor | null> => {
  if (!supabaseConfigured) return null;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const org = await getOrg();
  const db = osdb();

  const { data: employee } = await db
    .from("os_employees")
    .select(
      "id, code, full_name, display_name, email, job_title, department, avatar_url, status, primary_unit_id",
    )
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .maybeSingle();

  if (!employee) return null;

  const [{ data: roleRows }, { data: unitRows }, { data: overrideRows }] = await Promise.all([
    db
      .from("os_employee_roles")
      .select("unit_id, os_roles ( id, key, name, rank, color )")
      .eq("employee_id", employee.id),
    db.from("os_employee_units").select("unit_id").eq("employee_id", employee.id),
    db
      .from("os_permission_overrides")
      .select("permission_key, scope, granted, expires_at")
      .eq("employee_id", employee.id),
  ]);

  type RoleRow = { unit_id: string | null; os_roles: { id: string; key: string; name: string; rank: number; color: string } | null };
  const roles: ActorRole[] = ((roleRows ?? []) as unknown as RoleRow[])
    .filter((r) => r.os_roles)
    .map((r) => ({
      key: r.os_roles!.key,
      name: r.os_roles!.name,
      rank: r.os_roles!.rank,
      color: r.os_roles!.color,
      unitId: r.unit_id,
    }));

  const roleIds = ((roleRows ?? []) as unknown as RoleRow[]).map((r) => r.os_roles?.id).filter(Boolean) as string[];

  const permissions: Partial<Record<PermissionKey, Scope>> = {};

  if (roleIds.length) {
    const { data: grants } = await db
      .from("os_role_permissions")
      .select("permission_key, scope")
      .in("role_id", roleIds);
    for (const g of grants ?? []) {
      const key = g.permission_key as PermissionKey;
      const scope = g.scope as Scope;
      permissions[key] = permissions[key] ? widerScope(permissions[key]!, scope) : scope;
    }
  }

  const now = Date.now();
  for (const o of overrideRows ?? []) {
    const key = o.permission_key as PermissionKey;
    if (o.expires_at && new Date(o.expires_at as string).getTime() < now) continue;
    if (o.granted === false) {
      // An explicit revoke beats every role grant. This is the only way a
      // permission is ever taken away from a single person, and it is loud in
      // the Admin Center rather than hidden in a role.
      delete permissions[key];
      continue;
    }
    const scope = o.scope as Scope;
    permissions[key] = permissions[key] ? widerScope(permissions[key]!, scope) : scope;
  }

  const unitIds = Array.from(
    new Set([
      ...((unitRows ?? []).map((u) => u.unit_id as string)),
      ...(employee.primary_unit_id ? [employee.primary_unit_id as string] : []),
      ...roles.map((r) => r.unitId).filter(Boolean) as string[],
    ]),
  );

  return {
    userId: user.id,
    employeeId: employee.id as string,
    orgId: org.id,
    code: employee.code as string,
    name: employee.full_name as string,
    displayName: (employee.display_name as string) || (employee.full_name as string).split(" ")[0],
    email: (employee.email as string) ?? user.email ?? null,
    jobTitle: (employee.job_title as string) ?? null,
    department: (employee.department as string) ?? null,
    avatarUrl: (employee.avatar_url as string) ?? null,
    status: employee.status as string,
    primaryUnitId: (employee.primary_unit_id as string) ?? null,
    unitIds,
    roles,
    topRank: roles.length ? Math.min(...roles.map((r) => r.rank)) : 999,
    permissions,
    timezone: org.timezone,
    baseCurrency: org.baseCurrency,
  };
});

// ---------------------------------------------------------------------------
// The three functions every OS query and every server action goes through.
// ---------------------------------------------------------------------------

/** Does this actor hold the permission at all, at any scope? */
export function can(actor: Actor | null, key: PermissionKey): boolean {
  return Boolean(actor && actor.permissions[key]);
}

/** The widest scope this actor holds for a permission, or null if they hold none. */
export function scopeOf(actor: Actor | null, key: PermissionKey): Scope | null {
  return actor?.permissions[key] ?? null;
}

/**
 * Assert a permission and return its scope. Throws OsForbiddenError otherwise.
 * Server actions call this FIRST, before reading a single field of their input.
 */
export function requirePermission(actor: Actor | null, key: PermissionKey): Scope {
  const scope = scopeOf(actor, key);
  if (!scope) {
    throw new OsForbiddenError(
      `This action needs the "${key}" permission, which your roles do not include.`,
      key,
    );
  }
  return scope;
}

/** Any of the given permissions. Used for "can this person see this nav section". */
export function canAny(actor: Actor | null, ...keys: PermissionKey[]): boolean {
  return keys.some((k) => can(actor, k));
}

/**
 * Whether the actor may grant or edit a role. You can never touch a role at or
 * above your own authority, which is what stops an operations manager from
 * quietly promoting themselves.
 */
export function canManageRole(actor: Actor | null, roleRank: number): boolean {
  if (!actor) return false;
  if (!can(actor, "admin.roles") && !can(actor, "team.roles")) return false;
  return roleRank > actor.topRank;
}

/** The full catalog, for the Admin Center. */
export function allPermissionKeys(): readonly PermissionKey[] {
  return PERMISSION_KEYS;
}
