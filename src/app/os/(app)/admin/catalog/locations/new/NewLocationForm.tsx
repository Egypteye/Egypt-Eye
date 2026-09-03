"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createLocation } from "@/lib/os/actions/directory";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

const KINDS = ["site", "hotel", "airport", "restaurant", "office", "meeting_point", "studio", "other"];

export function NewLocationForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", kind: "site", city: "", region: "", latitude: "", longitude: "",
    typicalDriveMinutes: "", accessNotes: "", permitNotes: "", ticketNotes: "",
    bestTimeNotes: "", notes: "",
  });

  const action = useAction(createLocation, {
    onSuccess: () => router.push("/os/admin/catalog"),
    refresh: false,
  });

  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Name" required>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Giza Plateau — Panorama Point" />
          </Field>
        </div>
        <Field label="Kind">
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={selectClass}>
            {KINDS.map((k) => <option key={k} value={k}>{k.replace(/_/g, " ")}</option>)}
          </select>
        </Field>
        <Field label="City"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="Giza" /></Field>
        <Field label="Region"><input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={inputClass} placeholder="Greater Cairo" /></Field>
        <Field label="Typical drive" hint="Minutes from the office, at the hour trips actually leave. The conflict engine uses this to catch impossible back-to-back bookings.">
          <input inputMode="numeric" value={form.typicalDriveMinutes} onChange={(e) => setForm({ ...form, typicalDriveMinutes: e.target.value })} className={inputClass} placeholder="45" />
        </Field>
        <Field label="Latitude"><input inputMode="decimal" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className={inputClass} placeholder="29.976480" /></Field>
        <Field label="Longitude"><input inputMode="decimal" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className={inputClass} placeholder="31.131302" /></Field>

        <div className="sm:col-span-2">
          <Field label="Access" hint="Where the van actually parks, which gate, who to ask for.">
            <textarea rows={2} value={form.accessNotes} onChange={(e) => setForm({ ...form, accessNotes: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Permits" hint="What is needed, how long it takes, what it covers.">
            <textarea rows={2} value={form.permitNotes} onChange={(e) => setForm({ ...form, permitNotes: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Tickets" hint="Prices, where they are bought, whether children are free.">
            <textarea rows={2} value={form.ticketNotes} onChange={(e) => setForm({ ...form, ticketNotes: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Best time" hint="Light, crowds, heat. What a photographer would want told.">
            <textarea rows={2} value={form.bestTimeNotes} onChange={(e) => setForm({ ...form, bestTimeNotes: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Anything else">
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => action.run({
            name: form.name,
            kind: form.kind,
            city: form.city || null,
            region: form.region || null,
            latitude: num(form.latitude),
            longitude: num(form.longitude),
            typicalDriveMinutes: num(form.typicalDriveMinutes),
            accessNotes: form.accessNotes || null,
            permitNotes: form.permitNotes || null,
            ticketNotes: form.ticketNotes || null,
            bestTimeNotes: form.bestTimeNotes || null,
            notes: form.notes || null,
          })}
          disabled={!form.name.trim() || action.pending}
          className={buttonClass.gold}
        >
          {action.pending ? <Spinner /> : null}Add location
        </button>
        <Link href="/os/admin/catalog" className={buttonClass.ghost}>Cancel</Link>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
