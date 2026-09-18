import { getActor, can, canManageRole } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { PERMISSION_MODULES, SCOPE_LABEL, type PermissionKey, type Scope } from "@/lib/os/permissions";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Notice } from "@/components/os/ui";
import { PermissionMatrix } from "./PermissionMatrix";

export const dynamic = "force-dynamic";
export const metadata = { title: "Roles and permissions" };

// ---------------------------------------------------------------------------
// THE PERMISSION MATRIX
// ---------------------------------------------------------------------------
// The complete, live answer to "who can do what". It is generated from the
// catalog rather than hand-maintained, so it can never quietly fall behind the
// code — and every cell is editable in place by anyone with admin.roles, within
// the two rules that hold absolutely:
//
//   * You cannot edit a role at or above your own authority.
//   * You cannot grant a permission you do not hold yourself.
// ---------------------------------------------------------------------------

export default async function RolesPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "admin.roles")) return <NoAccess what="roles and permissions" permission="admin.roles" />;

  const db = osdb();
  const org = await getOrg();

  const [{ data: roles }, { data: permissions }, { data: grants }, { data: counts }] = await Promise.all([
    db.from("os_roles").select("id, key, name, description, rank, is_system, color").eq("org_id", org.id).is("archived_at", null).order("rank"),
    db.from("os_permissions").select("key, module, action, label, description, sensitive, scopeable, sort_order").order("sort_order"),
    db.from("os_role_permissions").select("role_id, permission_key, scope"),
    db.from("os_employee_roles").select("role_id"),
  ]);

  const holderCounts = new Map<string, number>();
  for (const row of counts ?? []) {
    holderCounts.set(row.role_id as string, (holderCounts.get(row.role_id as string) ?? 0) + 1);
  }

  const grantMap = new Map<string, Scope>();
  for (const grant of grants ?? []) {
    grantMap.set(`${grant.role_id}:${grant.permission_key}`, grant.scope as Scope);
  }

  const roleRows = (roles ?? []).map((role) => ({
    id: role.id as string,
    key: role.key as string,
    name: role.name as string,
    description: (role.description as string) ?? null,
    rank: role.rank as number,
    isSystem: role.is_system as boolean,
    color: role.color as string,
    holders: holderCounts.get(role.id as string) ?? 0,
    manageable: canManageRole(actor, role.rank as number) && role.key !== "owner",
    grantCount: (grants ?? []).filter((g) => g.role_id === role.id).length,
  }));

  const permissionRows = (permissions ?? []).map((p) => ({
    key: p.key as PermissionKey,
    module: p.module as string,
    label: p.label as string,
    description: (p.description as string) ?? null,
    sensitive: p.sensitive as boolean,
    scopeable: p.scopeable as boolean,
    /** What the acting person holds — you cannot grant beyond this. */
    actorHolds: Boolean(actor.permissions[p.key as PermissionKey]),
  }));

  const matrix: Record<string, Scope | null> = {};
  for (const role of roleRows) {
    for (const permission of permissionRows) {
      matrix[`${role.id}:${permission.key}`] = grantMap.get(`${role.id}:${permission.key}`) ?? null;
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Roles and permissions"
        description="The complete answer to who can do what. Generated from the catalog, so it can never fall behind the code."
      />

      <div className="mb-5">
        <Notice tone="blue" title="Two rules hold regardless of your role">
          You cannot edit a role at or above your own authority, and you cannot grant a permission you do not hold yourself.
          Both are enforced in the server action, not by hiding a control. Every change is written to the audit log with the
          before and after value.
        </Notice>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roleRows.map((role) => (
          <Card key={role.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-os-text">{role.name}</p>
                <p className="os-nums text-[11px] text-os-faint">rank {role.rank} · {role.holders} {role.holders === 1 ? "person" : "people"}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {role.isSystem ? <Badge tone="neutral">System</Badge> : <Badge tone="gold">Custom</Badge>}
                {!role.manageable ? <Badge tone="amber">Read only</Badge> : null}
              </div>
            </div>
            {role.description ? <p className="mt-1.5 text-[12px] leading-relaxed text-os-muted">{role.description}</p> : null}
            <p className="mt-2 text-[11.5px] text-os-faint">{role.grantCount} of {permissionRows.length} permissions</p>
          </Card>
        ))}
      </div>

      <Card padded={false}>
        <div className="border-b border-os-line px-4 py-3 sm:px-5">
          <CardHeader
            title="Matrix"
            subtitle={`${permissionRows.length} permissions × ${roleRows.length} roles. Click a cell to change it. ${SCOPE_LABEL.all} / ${SCOPE_LABEL.unit} / ${SCOPE_LABEL.own}.`}
          />
        </div>
        <PermissionMatrix
          roles={roleRows.map(({ id, name, manageable, rank }) => ({ id, name, manageable, rank }))}
          modules={PERMISSION_MODULES}
          permissions={permissionRows}
          matrix={matrix}
        />
      </Card>
    </>
  );
}
