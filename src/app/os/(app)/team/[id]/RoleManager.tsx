"use client";

import { useState } from "react";
import { grantRoleToEmployee, revokeRoleFromEmployee } from "@/lib/os/actions/admin";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Badge, buttonClass, selectClass } from "@/components/os/ui";

// Granting access to a person.
//
// The ladder rule is visible in the UI, not just enforced behind it: roles you
// cannot grant are listed and greyed with the reason, so nobody has to guess
// why "Administrator" is not in the dropdown.
export function RoleManager({
  employeeId, employeeName, held, available, overrides,
}: {
  employeeId: string;
  employeeName: string;
  held: { id: string; name: string; rank: number; description: string | null }[];
  available: { id: string; name: string; rank: number; description: string | null; manageable: boolean }[];
  overrides: { permissionKey: string; scope: string; granted: boolean; reason: string | null }[];
}) {
  const [pick, setPick] = useState("");
  const grant = useAction(grantRoleToEmployee, { onSuccess: () => setPick("") });
  const revoke = useAction(revokeRoleFromEmployee);

  const heldIds = new Set(held.map((r) => r.id));
  const grantable = available.filter((r) => !heldIds.has(r.id) && r.manageable);
  const blocked = available.filter((r) => !heldIds.has(r.id) && !r.manageable);

  return (
    <div>
      <div className="space-y-2">
        {held.length ? held.map((role) => (
          <div key={role.id} className="flex items-start justify-between gap-3 rounded-lg border border-os-line px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-os-text">{role.name}</p>
              {role.description ? <p className="mt-0.5 text-[11.5px] leading-snug text-os-muted">{role.description}</p> : null}
            </div>
            {available.find((r) => r.id === role.id)?.manageable ? (
              <button
                onClick={() => revoke.run(employeeId, role.id)}
                disabled={revoke.pending}
                className="shrink-0 text-[12px] font-medium text-os-muted transition hover:text-os-red disabled:opacity-50"
              >
                {revoke.pending ? <Spinner size={12} /> : "Remove"}
              </button>
            ) : (
              <span className="shrink-0 text-[11px] text-os-faint">Above your level</span>
            )}
          </div>
        )) : (
          <p className="rounded-lg border border-dashed border-os-line px-3 py-3 text-[12.5px] text-os-muted">
            {employeeName} holds no roles, so the OS shows them nothing at all. Grant one below.
          </p>
        )}
      </div>

      <ActionFeedback result={revoke.result} onDismiss={revoke.clear} />

      {grantable.length ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="min-w-[200px] flex-1">
            <span className="mb-1 block text-[12px] font-medium text-os-text">Grant a role</span>
            <select value={pick} onChange={(e) => setPick(e.target.value)} className={selectClass}>
              <option value="">Choose…</option>
              {grantable.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </label>
          <button
            onClick={() => pick && grant.run(employeeId, pick)}
            disabled={!pick || grant.pending}
            className={buttonClass.primary}
          >
            {grant.pending ? <Spinner /> : null}Grant
          </button>
        </div>
      ) : null}

      {blocked.length ? (
        <p className="mt-2 text-[11.5px] leading-snug text-os-faint">
          {blocked.map((r) => r.name).join(", ")} {blocked.length === 1 ? "is" : "are"} at or above your own authority, so you
          cannot grant {blocked.length === 1 ? "it" : "them"}.
        </p>
      ) : null}

      <ActionFeedback result={grant.result} onDismiss={grant.clear} />

      {overrides.length ? (
        <div className="mt-4 border-t border-os-line pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Personal exceptions</p>
          <ul className="mt-2 space-y-2">
            {overrides.map((override) => (
              <li key={override.permissionKey} className="text-[12.5px]">
                <span className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={override.granted ? "green" : "red"}>{override.granted ? "Granted" : "Revoked"}</Badge>
                  <code className="rounded bg-black/[0.05] px-1 py-0.5 text-[11.5px]">{override.permissionKey}</code>
                  {override.granted ? <span className="text-[11px] text-os-faint">({override.scope})</span> : null}
                </span>
                {override.reason ? <span className="mt-0.5 block text-[11.5px] leading-snug text-os-muted">{override.reason}</span> : null}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-snug text-os-faint">
            Exceptions sit on top of the roles above. A revoke always wins, whatever the roles say.
          </p>
        </div>
      ) : null}
    </div>
  );
}
