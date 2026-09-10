"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createResource } from "@/lib/os/actions/directory";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

// The form changes shape with the kind, because a dress has no number plate
// and a van has no train length. The reference is not asked for — it is
// allocated server-side from the highest one in the series.
type Kind = "vehicle" | "dress" | "equipment" | "venue" | "prop" | "other";

const KINDS: { key: Kind; label: string; hint: string }[] = [
  { key: "vehicle", label: "Vehicle", hint: "Vans, sedans, 4x4s." },
  { key: "dress", label: "Dress", hint: "Flying dresses and gowns." },
  { key: "equipment", label: "Equipment", hint: "Cameras, drones, lighting." },
  { key: "venue", label: "Venue", hint: "A space the company books." },
  { key: "prop", label: "Prop", hint: "Anything carried to a shoot." },
  { key: "other", label: "Other", hint: "Anything else that gets assigned." },
];

const STATUSES = ["available", "in_use", "maintenance", "cleaning", "reserved", "retired"];
const CONDITIONS = ["excellent", "good", "fair", "needs_repair", "damaged"];
const RATE_UNITS = [
  { key: "per_trip", label: "per trip" },
  { key: "per_day", label: "per day" },
  { key: "per_hour", label: "per hour" },
  { key: "per_km", label: "per kilometre" },
];

export function NewResourceForm({
  units, currencies, canSetCost,
}: {
  units: { id: string; name: string }[];
  currencies: string[];
  canSetCost: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    kind: "vehicle" as Kind,
    name: "", description: "", unitId: "", status: "available", condition: "good",
    capacity: "", model: "", plate: "", year: "", color: "", size: "", serialNumber: "",
    homeBase: "", costRateAmount: "", costRateCurrency: currencies[0] ?? "USD", costRateUnit: "per_trip",
    insuranceExpiresOn: "", licenseExpiresOn: "", notes: "",
  });

  const action = useAction(createResource, {
    onSuccess: (result) => { if (result.data?.id) router.push(`/os/resources/${result.data.id}`); },
    refresh: false,
  });

  const isVehicle = form.kind === "vehicle";
  const isDress = form.kind === "dress";
  const isEquipment = form.kind === "equipment";
  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  return (
    <div>
      <Field label="What is it" required>
        <div className="mt-1 grid gap-1.5 sm:grid-cols-3">
          {KINDS.map((k) => (
            <button
              key={k.key}
              type="button"
              onClick={() => setForm({ ...form, kind: k.key })}
              className={`rounded-lg border px-3 py-2 text-left transition ${
                form.kind === k.key ? "border-os-gold bg-os-gold-soft" : "border-os-line-strong bg-white hover:bg-black/[0.02]"
              }`}
            >
              <span className="block text-[13px] font-medium text-os-text">{k.label}</span>
              <span className="block text-[11px] text-os-muted">{k.hint}</span>
            </button>
          ))}
        </div>
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Name" required hint="What the crew calls it. This is what shows on the assignment.">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder={isDress ? "Red Flame" : "Hyundai H1 — White"} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </Field>
        </div>

        <Field label="Business unit" hint="Leave blank if it is shared across the company.">
          <select value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} className={selectClass}>
            <option value="">Shared</option>
            {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
        <Field label="Home base" hint="Where it lives when nothing is booked.">
          <input value={form.homeBase} onChange={(e) => setForm({ ...form, homeBase: e.target.value })} className={inputClass} placeholder="Egypt Eye Office" />
        </Field>

        <Field label="Status" hint="Anything but available or in use blocks assignment.">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectClass}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </Field>
        <Field label="Condition">
          <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={selectClass}>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
          </select>
        </Field>

        {isVehicle ? (
          <>
            <Field label="Seats" hint="Counted against the guest number when the trip is staffed.">
              <input inputMode="numeric" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className={inputClass} placeholder="7" />
            </Field>
            <Field label="Model"><input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputClass} placeholder="Hyundai H1" /></Field>
            <Field label="Number plate"><input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className={inputClass} placeholder="GZ 4471" /></Field>
            <Field label="Year"><input inputMode="numeric" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputClass} placeholder="2022" /></Field>
            <Field label="Insurance expires" hint="The resources page warns before this date.">
              <input type="date" value={form.insuranceExpiresOn} onChange={(e) => setForm({ ...form, insuranceExpiresOn: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Licence expires">
              <input type="date" value={form.licenseExpiresOn} onChange={(e) => setForm({ ...form, licenseExpiresOn: e.target.value })} className={inputClass} />
            </Field>
          </>
        ) : null}

        {isDress ? (
          <>
            <Field label="Colour"><input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputClass} placeholder="Red" /></Field>
            <Field label="Size"><input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className={inputClass} placeholder="One size / adjustable" /></Field>
          </>
        ) : null}

        {isEquipment ? (
          <div className="sm:col-span-2">
            <Field label="Serial number"><input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} className={inputClass} /></Field>
          </div>
        ) : null}

        {canSetCost ? (
          <>
            <Field label="Cost rate" hint="What putting this on a trip costs. The trip snapshots it at assignment, so changing it later never rewrites history.">
              <input inputMode="decimal" value={form.costRateAmount} onChange={(e) => setForm({ ...form, costRateAmount: e.target.value })} className={inputClass} placeholder="45" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Currency">
                <select value={form.costRateCurrency} onChange={(e) => setForm({ ...form, costRateCurrency: e.target.value })} className={selectClass}>
                  {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Charged">
                <select value={form.costRateUnit} onChange={(e) => setForm({ ...form, costRateUnit: e.target.value })} className={selectClass}>
                  {RATE_UNITS.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </Field>
            </div>
          </>
        ) : null}

        <div className="sm:col-span-2">
          <Field label="Notes" hint="What the next person needs to know. Quirks, restrictions, who to call.">
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => action.run({
            kind: form.kind,
            name: form.name,
            description: form.description || null,
            unitId: form.unitId || null,
            status: form.status,
            condition: form.condition,
            capacity: isVehicle ? num(form.capacity) : null,
            model: isVehicle ? form.model || null : null,
            plate: isVehicle ? form.plate || null : null,
            year: isVehicle ? num(form.year) : null,
            color: isDress ? form.color || null : null,
            size: isDress ? form.size || null : null,
            serialNumber: isEquipment ? form.serialNumber || null : null,
            homeBase: form.homeBase || null,
            costRateAmount: canSetCost ? num(form.costRateAmount) : null,
            costRateCurrency: canSetCost ? form.costRateCurrency : null,
            costRateUnit: canSetCost ? form.costRateUnit : null,
            insuranceExpiresOn: isVehicle ? form.insuranceExpiresOn || null : null,
            licenseExpiresOn: isVehicle ? form.licenseExpiresOn || null : null,
            notes: form.notes || null,
          })}
          disabled={!form.name.trim() || action.pending}
          className={buttonClass.gold}
        >
          {action.pending ? <Spinner /> : null}Register resource
        </button>
        <Link href="/os/resources" className={buttonClass.ghost}>Cancel</Link>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
