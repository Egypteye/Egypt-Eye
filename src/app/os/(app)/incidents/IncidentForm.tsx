"use client";

import { useState } from "react";
import { reportIncident } from "@/lib/os/actions/work";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

const CATEGORIES = ["late_arrival", "no_show", "vehicle", "equipment", "supplier", "client_complaint", "safety", "lost_item", "weather", "permit", "other"];

export function IncidentForm({
  employees, suppliers,
}: {
  employees: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({
    title: "", description: "", severity: "medium", category: "other",
    tripRef: "", clientImpact: "none", subjectEmployeeId: "", subjectSupplierId: "",
  });
  const action = useAction(reportIncident, { onSuccess: () => setForm({ ...form, title: "", description: "", tripRef: "" }) });

  return (
    <div>
      <div className="space-y-3">
        <Field label="What happened" required>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Driver arrived 25 minutes late" />
        </Field>
        <Field label="Detail" hint="What actually happened, in the order it happened. Write it now while you remember.">
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Severity">
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className={selectClass}>
              <option value="low">Low</option><option value="medium">Medium</option>
              <option value="high">High</option><option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectClass}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
          </Field>
          <Field label="Trip">
            <input value={form.tripRef} onChange={(e) => setForm({ ...form, tripRef: e.target.value.toUpperCase() })} className={inputClass} placeholder="EE-10012" />
          </Field>
          <Field label="Did the client notice">
            <select value={form.clientImpact} onChange={(e) => setForm({ ...form, clientImpact: e.target.value })} className={selectClass}>
              <option value="none">No</option><option value="minor">Slightly</option>
              <option value="major">Yes, noticeably</option><option value="severe">Yes, badly</option>
            </select>
          </Field>
          <Field label="About a person" hint="Only if it is genuinely about them.">
            <select value={form.subjectEmployeeId} onChange={(e) => setForm({ ...form, subjectEmployeeId: e.target.value })} className={selectClass}>
              <option value="">Nobody in particular</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </Field>
          <Field label="About a supplier">
            <select value={form.subjectSupplierId} onChange={(e) => setForm({ ...form, subjectSupplierId: e.target.value })} className={selectClass}>
              <option value="">None</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <button
        onClick={() => action.run({
          title: form.title, description: form.description, severity: form.severity, category: form.category,
          tripRef: form.tripRef || null, clientImpact: form.clientImpact,
          subjectEmployeeId: form.subjectEmployeeId || null, subjectSupplierId: form.subjectSupplierId || null,
        })}
        disabled={!form.title.trim() || action.pending}
        className={`mt-3 ${buttonClass.primary}`}
      >
        {action.pending ? <Spinner /> : null}Log it
      </button>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
