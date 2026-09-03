"use client";

import { useState } from "react";
import Link from "next/link";
import { updateTrip } from "@/lib/os/actions/trips";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

type Values = Record<string, string>;

export function EditTripForm({
  tripRef, initial, clients, locations,
}: {
  tripRef: string;
  initial: Values;
  clients: { id: string; label: string }[];
  locations: { id: string; label: string }[];
}) {
  const [form, setForm] = useState<Values>(initial);
  const action = useAction(updateTrip);
  const set = (key: string, value: string) => setForm({ ...form, [key]: value });

  // Only send what actually changed, so the audit log records a real diff
  // rather than every field being rewritten to its own value.
  const changed = Object.fromEntries(Object.entries(form).filter(([k, v]) => v !== initial[k]));
  const dirty = Object.keys(changed).length > 0;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Title" required><input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} /></Field>
        </div>
        <Field label="Date"><input type="date" value={form.trip_date} onChange={(e) => set("trip_date", e.target.value)} className={inputClass} /></Field>
        <Field label="Priority">
          <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className={selectClass}>
            <option value="low">Low</option><option value="normal">Normal</option>
            <option value="high">High</option><option value="critical">Critical</option>
          </select>
        </Field>
        <Field label="Start time"><input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} className={inputClass} /></Field>
        <Field label="End time"><input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} className={inputClass} /></Field>
        <Field label="Client">
          <select value={form.client_id} onChange={(e) => set("client_id", e.target.value)} className={selectClass}>
            <option value="">No client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Location">
          <select value={form.location_id} onChange={(e) => set("location_id", e.target.value)} className={selectClass}>
            <option value="">Not set</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Pickup point"><input value={form.pickup_location} onChange={(e) => set("pickup_location", e.target.value)} className={inputClass} /></Field>
        </div>
        <Field label="Pickup time"><input type="time" value={form.pickup_time} onChange={(e) => set("pickup_time", e.target.value)} className={inputClass} /></Field>
        <Field label="Drop-off"><input value={form.dropoff_location} onChange={(e) => set("dropoff_location", e.target.value)} className={inputClass} /></Field>
        <Field label="Adults"><input type="number" min="0" value={form.guests_adults} onChange={(e) => set("guests_adults", e.target.value)} className={inputClass} /></Field>
        <Field label="Children"><input type="number" min="0" value={form.guests_children} onChange={(e) => set("guests_children", e.target.value)} className={inputClass} /></Field>
        <div className="sm:col-span-2">
          <Field label="Special requests"><textarea rows={2} value={form.special_requests} onChange={(e) => set("special_requests", e.target.value)} className={inputClass} /></Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Internal note"><textarea rows={2} value={form.notes_internal} onChange={(e) => set("notes_internal", e.target.value)} className={inputClass} /></Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Emergency information" hint="Printed on the crew brief. A partner's number, a medical note, anything that matters at 06:00 on a plateau.">
            <textarea rows={2} value={form.emergency_notes} onChange={(e) => set("emergency_notes", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => action.run(tripRef, changed)}
          disabled={!dirty || action.pending}
          className={buttonClass.primary}
        >
          {action.pending ? <Spinner /> : null}Save changes
        </button>
        <Link href={`/os/trips/${tripRef}`} className={buttonClass.ghost}>Back to the trip</Link>
        {dirty ? <span className="text-[12px] text-os-muted">{Object.keys(changed).length} field{Object.keys(changed).length === 1 ? "" : "s"} changed</span> : null}
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
