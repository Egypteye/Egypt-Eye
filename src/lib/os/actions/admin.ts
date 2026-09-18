"use server";

import { revalidatePath } from "next/cache";
import { osdb, getOrg } from "../db";
import { record } from "../audit";
import { guarded } from "./guard";
import { ok, fail, type ActionResult } from "../action-types";
import { canManageRole } from "../actor";
import { PERMISSION_KEYS, type PermissionKey, type Scope } from "../permissions";

// ---------------------------------------------------------------------------
// ADMINISTRATION
// ---------------------------------------------------------------------------
// Everything here changes who can do what, so every function writes to the
// audit log with the before and after state — a permission change nobody can
// reconstruct later is a permission change nobody can be held to.
//
// The authority ladder is enforced throughout: you may never create, edit or
// grant a role ranked at or above your own. That is what stops an operations
// manager from quietly promoting themselves to administrator, and it applies
// even to someone holding admin.roles.
// ---------------------------------------------------------------------------

export async function createRole(input: {
  key: string;
  name: string;
  description: string;
  rank: number;
  copyFromRoleId?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  return guarded("admin.roles", async (actor) => {
    const db = osdb();
    const org = await getOrg();

    const key = input.key.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!key) return fail("The role needs a key");
    if (!input.name.trim()) return fail("The role needs a name");
    if (input.rank <= actor.topRank) {
      return fail(
        "You cannot create a role with authority at or above your own",
        `Your highest role sits at rank ${actor.topRank}. Give this one a higher number, which means less authority.`,
      );
    }

    const { data: created, error } = await db.from("os_roles").insert({
      org_id: org.id,
      key,
      name: input.name.trim(),
      description: input.description.trim() || null,
      rank: input.rank,
      is_system: false,
    }).select("id").single();
    if (error) throw error;

    if (input.copyFromRoleId) {
      const { data: source } = await db.from("os_role_permissions").select("permission_key, scope").eq("role_id", input.copyFromRoleId);
      const grants = (source ?? [])
        // A copied role can never inherit more than the copier holds.
        .filter((g) => actor.permissions[g.permission_key as PermissionKey])
        .map((g) => ({ role_id: created.id, permission_key: g.permission_key, scope: g.scope }));
      if (grants.length) await db.from("os_role_permissions").insert(grants);
    }

    await record(
      actor,
      { entityType: "role", entityId: created.id as string, verb: "role_created", summary: `Role created: ${input.name}` },
      { action: "role.create", entityLabel: input.name, after: { ...input, key } },
    );
    revalidatePath("/os/admin/roles");
    return ok({ id: created.id as string }, `${input.name} created.`);
  });
}

export async function setRolePermission(
  roleId: string,
  permissionKey: string,
  scope: Scope | null,
): Promise<ActionResult> {
  return guarded("admin.roles", async (actor) => {
    const db = osdb();
    if (!PERMISSION_KEYS.includes(permissionKey as PermissionKey)) return fail("That permission does not exist");

    const { data: role } = await db.from("os_roles").select("id, key, name, rank, is_system").eq("id", roleId).maybeSingle();
    if (!role) return fail("That role no longer exists");

    if (!canManageRole(actor, Number(role.rank))) {
      return fail(
        "You cannot change a role with authority at or above your own",
        `${role.name} sits at or above your level.`,
      );
    }
    if (role.key === "owner") {
      return fail("The Owner role cannot be edited", "It exists so that someone always retains full control of the system.");
    }
    // You cannot grant what you do not hold. This is what makes the ladder
    // hold under a determined administrator rather than only a careless one.
    if (scope && !actor.permissions[permissionKey as PermissionKey]) {
      return fail(
        "You cannot grant a permission you do not hold yourself",
        `You would be giving ${role.name} access to "${permissionKey}", which your own roles do not include.`,
      );
    }

    const { data: before } = await db.from("os_role_permissions").select("scope").eq("role_id", roleId).eq("permission_key", permissionKey).maybeSingle();

    if (scope === null) {
      await db.from("os_role_permissions").delete().eq("role_id", roleId).eq("permission_key", permissionKey);
    } else {
      await db.from("os_role_permissions").upsert(
        { role_id: roleId, permission_key: permissionKey, scope },
        { onConflict: "role_id,permission_key" },
      );
    }

    await record(
      actor,
      { entityType: "role", entityId: roleId, verb: "permission_changed",
        summary: scope
          ? `${role.name} may now "${permissionKey}" (${scope}).`
          : `${role.name} may no longer "${permissionKey}".` },
      { action: "role.permission", entityLabel: role.name as string,
        before: { permission: permissionKey, scope: before?.scope ?? null },
        after: { permission: permissionKey, scope } },
    );
    revalidatePath("/os/admin/roles");
    return ok(undefined, "Saved.");
  });
}

export async function grantRoleToEmployee(employeeId: string, roleId: string): Promise<ActionResult> {
  return guarded("team.roles", async (actor) => {
    const db = osdb();
    const [{ data: role }, { data: employee }] = await Promise.all([
      db.from("os_roles").select("id, name, rank").eq("id", roleId).maybeSingle(),
      db.from("os_employees").select("id, full_name").eq("id", employeeId).maybeSingle(),
    ]);
    if (!role || !employee) return fail("That role or person no longer exists");
    if (!canManageRole(actor, Number(role.rank))) {
      return fail("You cannot grant a role with authority at or above your own");
    }

    await db.from("os_employee_roles").upsert(
      { employee_id: employeeId, role_id: roleId, granted_by: actor.employeeId },
      { onConflict: "employee_id,role_id", ignoreDuplicates: true },
    );

    await record(
      actor,
      { entityType: "employee", entityId: employeeId, verb: "role_granted", summary: `${employee.full_name} granted the ${role.name} role.` },
      { action: "employee.role.grant", entityLabel: employee.full_name as string, after: { role: role.name } },
    );
    revalidatePath(`/os/team/${employeeId}`);
    revalidatePath("/os/admin/users");
    return ok(undefined, `${employee.full_name} is now ${role.name}.`);
  });
}

export async function revokeRoleFromEmployee(employeeId: string, roleId: string): Promise<ActionResult> {
  return guarded("team.roles", async (actor) => {
    const db = osdb();
    const [{ data: role }, { data: employee }] = await Promise.all([
      db.from("os_roles").select("id, name, rank, key").eq("id", roleId).maybeSingle(),
      db.from("os_employees").select("id, full_name").eq("id", employeeId).maybeSingle(),
    ]);
    if (!role || !employee) return fail("That role or person no longer exists");
    if (!canManageRole(actor, Number(role.rank))) {
      return fail("You cannot revoke a role with authority at or above your own");
    }

    // Never leave the company with nobody who can administer it.
    if (role.key === "owner" || role.key === "admin") {
      const { count } = await db
        .from("os_employee_roles").select("employee_id", { count: "exact", head: true }).eq("role_id", roleId);
      if ((count ?? 0) <= 1) {
        return fail(
          `${role.name} is the last account holding that role`,
          "Grant it to someone else first. A system nobody can administer is a system nobody can recover.",
        );
      }
    }

    await db.from("os_employee_roles").delete().eq("employee_id", employeeId).eq("role_id", roleId);
    await record(
      actor,
      { entityType: "employee", entityId: employeeId, verb: "role_revoked", summary: `${employee.full_name} no longer holds the ${role.name} role.` },
      { action: "employee.role.revoke", entityLabel: employee.full_name as string, before: { role: role.name } },
    );
    revalidatePath(`/os/team/${employeeId}`);
    revalidatePath("/os/admin/users");
    return ok(undefined, "Role removed.");
  });
}

export async function setPermissionOverride(input: {
  employeeId: string;
  permissionKey: string;
  scope: Scope | null;
  granted: boolean;
  reason: string;
}): Promise<ActionResult> {
  return guarded("team.roles", async (actor) => {
    const db = osdb();
    if (!PERMISSION_KEYS.includes(input.permissionKey as PermissionKey)) return fail("That permission does not exist");
    if (!input.reason.trim()) {
      return fail("An exception needs a reason", "Overrides sit outside the role structure, so the reason is the only thing that explains them later.");
    }
    if (input.granted && !actor.permissions[input.permissionKey as PermissionKey]) {
      return fail("You cannot grant a permission you do not hold yourself");
    }

    const { data: employee } = await db.from("os_employees").select("id, full_name").eq("id", input.employeeId).maybeSingle();
    if (!employee) return fail("That person no longer exists");

    if (input.scope === null && input.granted) {
      await db.from("os_permission_overrides").delete().eq("employee_id", input.employeeId).eq("permission_key", input.permissionKey);
    } else {
      await db.from("os_permission_overrides").upsert({
        employee_id: input.employeeId,
        permission_key: input.permissionKey,
        scope: input.scope ?? "own",
        granted: input.granted,
        reason: input.reason.trim(),
        granted_by: actor.employeeId,
      }, { onConflict: "employee_id,permission_key" });
    }

    await record(
      actor,
      { entityType: "employee", entityId: input.employeeId, verb: "override_set",
        summary: input.granted
          ? `${employee.full_name} granted "${input.permissionKey}" as an exception.`
          : `${employee.full_name} had "${input.permissionKey}" revoked.` },
      { action: "employee.override", entityLabel: employee.full_name as string, after: { ...input } },
    );
    revalidatePath(`/os/team/${input.employeeId}`);
    return ok(undefined, "Exception saved.");
  });
}

export async function linkEmployeeAccount(employeeId: string, userId: string | null): Promise<ActionResult> {
  return guarded("admin.users", async (actor) => {
    const db = osdb();
    const { data: employee } = await db.from("os_employees").select("id, full_name, user_id").eq("id", employeeId).maybeSingle();
    if (!employee) return fail("That person no longer exists");

    await db.from("os_employees").update({ user_id: userId }).eq("id", employeeId);
    await record(
      actor,
      { entityType: "employee", entityId: employeeId, verb: userId ? "account_linked" : "account_unlinked",
        summary: userId ? `${employee.full_name} can now sign in.` : `${employee.full_name}'s sign-in was removed.` },
      { action: "employee.account", entityLabel: employee.full_name as string,
        before: { user_id: employee.user_id }, after: { user_id: userId } },
    );
    revalidatePath("/os/admin/users");
    return ok(undefined, userId ? "Account linked." : "Account unlinked.");
  });
}

export async function setEmployeeStatus(employeeId: string, status: string, reason: string): Promise<ActionResult> {
  return guarded("admin.users", async (actor) => {
    const db = osdb();
    const { data: employee } = await db.from("os_employees").select("id, full_name, status").eq("id", employeeId).maybeSingle();
    if (!employee) return fail("That person no longer exists");
    if (employeeId === actor.employeeId) return fail("You cannot change your own account status");
    if (["suspended", "left"].includes(status) && !reason.trim()) return fail("Suspending or offboarding needs a reason");

    await db.from("os_employees").update({ status }).eq("id", employeeId);
    await record(
      actor,
      { entityType: "employee", entityId: employeeId, verb: "status_changed", summary: `${employee.full_name} marked ${status.replace("_", " ")}. ${reason}`.trim() },
      { action: "employee.status", entityLabel: employee.full_name as string, before: { status: employee.status }, after: { status, reason } },
    );
    revalidatePath("/os/admin/users");
    revalidatePath("/os/team");
    return ok(undefined, `${employee.full_name} is now ${status.replace("_", " ")}.`);
  });
}

export async function updateSetting(key: string, value: string): Promise<ActionResult> {
  return guarded("admin.settings", async (actor) => {
    const db = osdb();
    const org = await getOrg();
    let parsed: unknown;
    try { parsed = JSON.parse(value); } catch { return fail("That is not valid JSON", "Numbers need no quotes; text does. For example: 48, or \"06:00\"."); }

    const { data: before } = await db.from("os_settings").select("value").eq("org_id", org.id).eq("key", key).maybeSingle();

    await db.from("os_settings").upsert({
      org_id: org.id, key, value: parsed, updated_by: actor.employeeId, updated_at: new Date().toISOString(),
    }, { onConflict: "org_id,key" });

    await record(
      actor,
      { entityType: "setting", entityId: org.id, verb: "setting_changed", summary: `${key} changed.` },
      { action: "setting.update", entityLabel: key, before: { value: before?.value ?? null }, after: { value: parsed } },
    );
    revalidatePath("/os/admin/settings");
    return ok(undefined, "Setting saved.");
  });
}

export async function toggleAutomation(automationId: string, active: boolean): Promise<ActionResult> {
  return guarded("admin.automations", async (actor) => {
    const db = osdb();
    const { data: automation } = await db.from("os_automations").select("id, name, implemented, requires_integration").eq("id", automationId).maybeSingle();
    if (!automation) return fail("That automation no longer exists");
    if (!automation.implemented) {
      return fail(
        "That automation is not built yet",
        `It needs ${automation.requires_integration ?? "an integration"} before it can do anything. Turning it on would be a switch that does nothing.`,
      );
    }

    await db.from("os_automations").update({ active }).eq("id", automationId);
    await record(
      actor,
      { entityType: "automation", entityId: automationId, verb: active ? "automation_enabled" : "automation_disabled",
        summary: `${automation.name} ${active ? "enabled" : "disabled"}.` },
      { action: "automation.toggle", entityLabel: automation.name as string, after: { active } },
    );
    revalidatePath("/os/admin/automations");
    return ok(undefined, active ? "Enabled." : "Disabled.");
  });
}
