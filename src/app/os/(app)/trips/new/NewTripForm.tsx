"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTrip } from "@/lib/os/actions/trips";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass, Notice } from "@/components/os/ui";

const SOURCES = ["Instagram", "TikTok", "Website", "WhatsApp", "Airbnb Experiences", "Viator", "Tripadvisor", "Travel Agency", "Referral", "Repeat Customer", "Other"];

export function NewTripForm({
  types, clients, locations, canSetPrice,
}: {
  types: { id: string; name: string; unit: string | null; description: string | null }[];
  clients: { id: string; label: string }[];
  locations: { id: string; label: string }[];
  canSetPrice: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", tripTypeId: types[0]?.id ?? "", clientId: "", tripDate: "", startTime: "", endTime: "",
    locationId: "", pickupLocation: "", pickupTime: "", dropoffLocation: "",
    guestsAdults: "2", guestsChildren: "0", source: "", sellAmount: "", currency: "USD",
    priority: "normal", specialRequests: "", notesInternal: "",
  });

  const action = useAction(createTrip, {
    onSuccess: (result) => {
      if (result.data?.ref) router.push(`/os/trips/${result.data.ref}`);
    },
    refresh: false,
  });

  const type = types.find((t) => t.id === form.tripTypeId);
  const ready = form.title.trim() && form.tripTypeId && form.tripDate;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Service" required hint={type?.description ?? undefined}>
            <select value={form.tripTypeId} onChange={(e) => setForm({ ...form, tripTypeId: e.target.value })} className={selectClass}>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}{t.unit ? ` — ${t.unit}` : ""}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="What to call it" required hint="What operations will see on the board. Be specific: “Sunrise Pyramids Photoshoot” beats “Photoshoot”.">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Sunrise Pyramids Photoshoot" />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Client" hint={clients.length ? "If they have travelled with us before, pick the existing record — never create a second one." : "No clients yet. Create one first so the trip has somebody to belong to."}>
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className={selectClass}>
              <option value="">No client selected yet</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Link href="/os/clients/new" className="mt-1 inline-block text-[12px] font-medium text-os-gold hover:underline">
            New client →
          </Link>
        </div>

        <Field label="Date" required>
          <input type="date" value={form.tripDate} onChange={(e) => setForm({ ...form, tripDate: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Priority">
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={selectClass}>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
            <option value="low">Low</option>
          </select>
        </Field>
        <Field label="Start time"><input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputClass} /></Field>
        <Field label="End time"><input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClass} /></Field>

        <Field label="Main location">
          <select value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} className={selectClass}>
            <option value="">Not set</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </Field>
        <Field label="Booking source" hint="Where this booking came from. It is what makes channel analytics possible later.">
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={selectClass}>
            <option value="">Not recorded</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Pickup point" hint="Name the exact door, not just the hotel. Every late start we have ever had traces back to this.">
            <input value={form.pickupLocation} onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })} className={inputClass} placeholder="Marriott Mena House, main entrance by the fountain" />
          </Field>
        </div>
        <Field label="Pickup time"><input type="time" value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })} className={inputClass} /></Field>
        <Field label="Drop-off"><input value={form.dropoffLocation} onChange={(e) => setForm({ ...form, dropoffLocation: e.target.value })} className={inputClass} placeholder="Same as pickup" /></Field>

        <Field label="Adults"><input type="number" min="0" value={form.guestsAdults} onChange={(e) => setForm({ ...form, guestsAdults: e.target.value })} className={inputClass} /></Field>
        <Field label="Children"><input type="number" min="0" value={form.guestsChildren} onChange={(e) => setForm({ ...form, guestsChildren: e.target.value })} className={inputClass} /></Field>

        {canSetPrice ? (
          <>
            <Field label="Selling price" hint="What the client is paying. Needed before the trip can reach Ready.">
              <input type="number" min="0" step="0.01" value={form.sellAmount} onChange={(e) => setForm({ ...form, sellAmount: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Currency">
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={selectClass}>
                {["USD", "EUR", "GBP", "EGP", "AED"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </>
        ) : null}

        <div className="sm:col-span-2">
          <Field label="Special requests" hint="What the client asked for. This appears on the printed brief the crew carries.">
            <textarea rows={2} value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Internal note" hint="For the team only. Never shown to the client and never printed on their itinerary.">
            <textarea rows={2} value={form.notesInternal} onChange={(e) => setForm({ ...form, notesInternal: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="mt-5">
        <Notice tone="blue" title="What happens when you create this">
          The service&apos;s checklist is generated with due dates relative to the start time, the trip&apos;s own channel opens,
          readiness starts scoring, and operations sees it on the board immediately.
        </Notice>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => action.run({
            title: form.title,
            tripTypeId: form.tripTypeId,
            clientId: form.clientId || null,
            tripDate: form.tripDate,
            startTime: form.startTime || null,
            endTime: form.endTime || null,
            locationId: form.locationId || null,
            pickupLocation: form.pickupLocation || null,
            pickupTime: form.pickupTime || null,
            dropoffLocation: form.dropoffLocation || null,
            guestsAdults: Number(form.guestsAdults) || 0,
            guestsChildren: Number(form.guestsChildren) || 0,
            source: form.source || null,
            sellAmount: Number(form.sellAmount) || 0,
            currency: form.currency,
            priority: form.priority,
            specialRequests: form.specialRequests || null,
            notesInternal: form.notesInternal || null,
          })}
          disabled={!ready || action.pending}
          className={buttonClass.gold}
        >
          {action.pending ? <Spinner /> : null}Create trip
        </button>
        <Link href="/os/trips" className={buttonClass.ghost}>Cancel</Link>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
