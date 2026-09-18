"use client";

import { useState } from "react";
import { addItineraryItem, removeItineraryItem } from "@/lib/os/actions/trips";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

const KINDS = ["pickup", "drive", "activity", "shoot", "meal", "ticket", "free_time", "dropoff", "other"];

export function ItineraryEditor({
  tripRef, locations, existing,
}: {
  tripRef: string;
  locations: { id: string; name: string }[];
  existing: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", startTime: "", endTime: "", kind: "activity", description: "", locationId: "" });
  const add = useAction(addItineraryItem, { onSuccess: () => { setForm({ title: "", startTime: "", endTime: "", kind: "activity", description: "", locationId: "" }); } });
  const remove = useAction(removeItineraryItem);

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} className={buttonClass.secondary}>
          <Icon.Plus size={15} />Add a step
        </button>
      ) : (
        <div className="rounded-xl border border-os-line bg-os-canvas p-3.5">
          <p className="mb-3 text-[13px] font-semibold text-os-text">Add an itinerary step</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="What happens" required>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Panoramic point — wide frames" />
              </Field>
            </div>
            <Field label="Start"><input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputClass} /></Field>
            <Field label="End"><input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClass} /></Field>
            <Field label="Kind">
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={selectClass}>
                {KINDS.map((k) => <option key={k} value={k}>{k.replace(/_/g, " ")}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <select value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} className={selectClass}>
                <option value="">Same as the trip</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes for the crew" hint="Anything the person running this step needs to know.">
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
              </Field>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              disabled={!form.title.trim() || add.pending}
              onClick={() => add.run(tripRef, {
                title: form.title, startTime: form.startTime || null, endTime: form.endTime || null,
                kind: form.kind, description: form.description || null, locationId: form.locationId || null,
              })}
              className={buttonClass.primary}
            >
              {add.pending ? <Spinner /> : null}Add step
            </button>
            <button onClick={() => setOpen(false)} className={buttonClass.ghost}>Done</button>
          </div>
          <ActionFeedback result={add.result} onDismiss={add.clear} />
        </div>
      )}

      {existing.length ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-[12.5px] font-medium text-os-muted">Remove a step</summary>
          <ul className="mt-2 space-y-1">
            {existing.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className="min-w-0 truncate text-os-text">{item.title}</span>
                <button
                  onClick={() => remove.run(tripRef, item.id)}
                  disabled={remove.pending}
                  className="shrink-0 text-[12px] font-medium text-os-muted hover:text-os-red disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <ActionFeedback result={remove.result} onDismiss={remove.clear} />
        </details>
      ) : null}
    </div>
  );
}
