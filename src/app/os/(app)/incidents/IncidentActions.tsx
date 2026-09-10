"use client";

import { useState } from "react";
import { updateIncident } from "@/lib/os/actions/work";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { inputClass, selectClass, buttonClass } from "@/components/os/ui";

export function IncidentActions({
  incidentId, status, employees,
}: {
  incidentId: string;
  status: string;
  employees: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ status, ownerEmployeeId: "", actionsTaken: "", resolution: "", costAmount: "" });
  const action = useAction(updateIncident, { onSuccess: () => setOpen(false) });

  if (!open) {
    return <button onClick={() => setOpen(true)} className={buttonClass.secondary}>Update</button>;
  }

  const closing = ["resolved", "closed"].includes(form.status);

  return (
    <div className="rounded-lg border border-os-line bg-os-canvas p-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectClass}>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={form.ownerEmployeeId} onChange={(e) => setForm({ ...form, ownerEmployeeId: e.target.value })} className={selectClass}>
          <option value="">Who owns it</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div className="sm:col-span-2">
          <textarea
            rows={2}
            value={form.actionsTaken}
            onChange={(e) => setForm({ ...form, actionsTaken: e.target.value })}
            placeholder="What has been done so far"
            className={inputClass}
          />
        </div>
        {closing ? (
          <div className="sm:col-span-2">
            <textarea
              rows={2}
              value={form.resolution}
              onChange={(e) => setForm({ ...form, resolution: e.target.value })}
              placeholder="How it was resolved, and what stops it happening again — required to close"
              className={inputClass}
            />
          </div>
        ) : null}
        <input
          type="number" min="0" step="0.01" value={form.costAmount}
          onChange={(e) => setForm({ ...form, costAmount: e.target.value })}
          placeholder="What it cost"
          className={inputClass}
        />
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          onClick={() => action.run(incidentId, {
            status: form.status,
            ownerEmployeeId: form.ownerEmployeeId || undefined,
            actionsTaken: form.actionsTaken || undefined,
            resolution: form.resolution || undefined,
            costAmount: form.costAmount ? Number(form.costAmount) : undefined,
          })}
          disabled={action.pending}
          className={buttonClass.primary}
        >
          {action.pending ? <Spinner /> : null}Save
        </button>
        <button onClick={() => setOpen(false)} className={buttonClass.ghost}>Cancel</button>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
