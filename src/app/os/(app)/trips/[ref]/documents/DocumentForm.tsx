"use client";

import { useState } from "react";
import { addDocument } from "@/lib/os/actions/records";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

const KINDS = ["supplier_confirmation", "ticket", "voucher", "invoice", "contract", "client_document", "permit", "insurance", "internal", "other"];
const VISIBILITIES = [
  { key: "internal", label: "Anyone on the trip" },
  { key: "assigned_crew", label: "Assigned crew only" },
  { key: "client", label: "Shareable with the client" },
  { key: "management", label: "Management only" },
  { key: "finance", label: "Finance only" },
];

export function DocumentForm({ tripRef, tripId }: { tripRef: string; tripId: string }) {
  const [form, setForm] = useState({ title: "", kind: "supplier_confirmation", url: "", visibility: "internal" });
  const action = useAction(addDocument, { onSuccess: () => setForm({ ...form, title: "", url: "" }) });

  return (
    <div>
      <div className="space-y-3">
        <Field label="Title" required>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Fayoum Desert Camp confirmation" />
        </Field>
        <Field label="Kind">
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={selectClass}>
            {KINDS.map((k) => <option key={k} value={k}>{k.replace(/_/g, " ")}</option>)}
          </select>
        </Field>
        <Field label="Link" required hint="Must be https.">
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputClass} placeholder="https://drive.google.com/file/…" />
        </Field>
        <Field label="Who may see it" hint="Enforced on the server, not just hidden in the list.">
          <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className={selectClass}>
            {VISIBILITIES.map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
          </select>
        </Field>
      </div>
      <button
        onClick={() => action.run({ tripRef, entityType: "trip", entityId: tripId, title: form.title, kind: form.kind, url: form.url, visibility: form.visibility })}
        disabled={!form.title.trim() || !form.url.trim() || action.pending}
        className={`mt-3 ${buttonClass.primary}`}
      >
        {action.pending ? <Spinner /> : null}Attach
      </button>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
