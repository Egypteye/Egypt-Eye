"use client";

import { useState } from "react";
import { setRolePermission } from "@/lib/os/actions/admin";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Badge } from "@/components/os/ui";
import type { Scope } from "@/lib/os/permissions";

// The matrix is wide by nature, so it scrolls horizontally with a sticky first
// column. Each cell cycles: none → all → unit → own → none, which is faster
// than a dropdown per cell when an administrator is setting up a role.

const NEXT: Record<string, Scope | null> = { none: "all", all: "unit", unit: "own", own: null };
const LABEL: Record<string, string> = { all: "All", unit: "Unit", own: "Own" };
const TONE: Record<string, string> = {
  all: "bg-os-green-soft text-os-green",
  unit: "bg-os-blue-soft text-os-blue",
  own: "bg-os-amber-soft text-os-amber",
};

export function PermissionMatrix({
  roles, modules, permissions, matrix,
}: {
  roles: { id: string; name: string; manageable: boolean; rank: number }[];
  modules: { key: string; label: string; description: string }[];
  permissions: { key: string; module: string; label: string; description: string | null; sensitive: boolean; scopeable: boolean; actorHolds: boolean }[];
  matrix: Record<string, Scope | null>;
}) {
  const [local, setLocal] = useState(matrix);
  const [busy, setBusy] = useState<string | null>(null);
  const action = useAction(setRolePermission, { refresh: false });

  async function cycle(roleId: string, permissionKey: string, scopeable: boolean) {
    const cellKey = `${roleId}:${permissionKey}`;
    const current = local[cellKey] ?? null;
    // Non-scopeable permissions are a plain on/off.
    const next = scopeable ? NEXT[current ?? "none"] : current ? null : "all";
    setBusy(cellKey);
    const outcome = await action.run(roleId, permissionKey, next as Scope | null);
    setBusy(null);
    if (outcome.ok) setLocal((prev) => ({ ...prev, [cellKey]: next as Scope | null }));
  }

  return (
    <div>
      <div className="os-scroll overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[280px] border-b border-os-line bg-os-card px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-os-faint">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role.id} className="border-b border-os-line px-2 py-2.5 text-center text-[11px] font-semibold text-os-faint">
                  <span className="block max-w-[86px] truncate" title={`${role.name} (rank ${role.rank})`}>{role.name}</span>
                  {!role.manageable ? <span className="block text-[9.5px] font-normal text-os-faint">locked</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => {
              const modulePermissions = permissions.filter((p) => p.module === module.key);
              if (!modulePermissions.length) return null;
              return [
                <tr key={`${module.key}-header`}>
                  <td colSpan={roles.length + 1} className="sticky left-0 border-b border-os-line bg-os-canvas px-4 py-1.5">
                    <span className="text-[11.5px] font-semibold text-os-text">{module.label}</span>
                    <span className="ml-2 text-[11px] text-os-faint">{module.description}</span>
                  </td>
                </tr>,
                ...modulePermissions.map((permission) => (
                  <tr key={permission.key} className="hover:bg-black/[0.015]">
                    <td className="sticky left-0 z-10 border-b border-os-line/60 bg-os-card px-4 py-2">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[12.5px] font-medium text-os-text">{permission.label}</span>
                        {permission.sensitive ? <Badge tone="red">Sensitive</Badge> : null}
                      </span>
                      <span className="block text-[11px] leading-snug text-os-faint">
                        {permission.description}
                        {!permission.actorHolds ? <span className="text-os-amber"> · you do not hold this, so you cannot grant it</span> : null}
                      </span>
                    </td>
                    {roles.map((role) => {
                      const cellKey = `${role.id}:${permission.key}`;
                      const value = local[cellKey];
                      const editable = role.manageable && permission.actorHolds;
                      return (
                        <td key={cellKey} className="border-b border-os-line/60 px-2 py-1.5 text-center">
                          <button
                            onClick={() => editable && cycle(role.id, permission.key, permission.scopeable)}
                            disabled={!editable || busy === cellKey}
                            title={
                              !role.manageable ? "This role is at or above your authority"
                                : !permission.actorHolds ? "You cannot grant a permission you do not hold"
                                : permission.scopeable ? "Click to cycle: all → unit → own → none"
                                : "Click to turn on or off"
                            }
                            className={`w-full rounded px-1.5 py-1 text-[10.5px] font-semibold transition ${
                              value ? TONE[value] : "bg-black/[0.04] text-os-faint"
                            } ${editable ? "hover:brightness-95" : "cursor-not-allowed opacity-60"}`}
                          >
                            {busy === cellKey ? <Spinner size={10} /> : value ? (permission.scopeable ? LABEL[value] : "Yes") : "—"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                )),
              ];
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 sm:px-5">
        <ActionFeedback result={action.result} onDismiss={action.clear} />
      </div>
    </div>
  );
}
