"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createLead } from "@/lib/os/actions/commercial";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

// The form is deliberately short. An enquiry logged at 23:00 from a DM has a
// name and a handle and nothing else; demanding a full customer record at that
// moment is how enquiries end up in a notebook instead of the system.
const SOURCES = [
  "Instagram", "TikTok", "WhatsApp", "Website", "Referral", "Repeat Customer",
  "Airbnb Experiences", "Viator", "Tripadvisor", "Travel Agency", "Trade show", "Email", "Walk-in", "Other",
];

export function NewLeadForm({
  pipeline: initialPipeline,
  tripTypes,
  units,
  currencies,
}: {
  pipeline: "b2c" | "b2b";
  tripTypes: { id: string; name: string }[];
  units: { id: string; name: string }[];
  currencies: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    pipeline: initialPipeline,
    contactName: "", contactEmail: "", contactPhone: "", contactWhatsapp: "", contactInstagram: "",
    companyName: "", country: "", language: "", source: "Instagram", campaign: "",
    interest: "", tripTypeId: "", unitId: "", requestedDate: "", dateFlexible: false,
    guests: "", budgetAmount: "", budgetCurrency: currencies[0] ?? "USD", message: "",
  });

  const action = useAction(createLead, {
    onSuccess: (result) => { if (result.data?.ref) router.push(`/os/reservations/leads/${result.data.ref}`); },
    refresh: false,
  });

  const reachable = Boolean(form.contactEmail || form.contactPhone || form.contactWhatsapp || form.contactInstagram);

  return (
    <div>
      <Field label="Which side of the business" required>
        <div className="mt-1 grid gap-1.5 sm:grid-cols-2">
          {(["b2c", "b2b"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setForm({ ...form, pipeline: p })}
              className={`rounded-lg border px-3 py-2 text-left transition ${
                form.pipeline === p ? "border-os-gold bg-os-gold-soft" : "border-os-line-strong bg-white hover:bg-black/[0.02]"
              }`}
            >
              <span className="block text-[13px] font-medium text-os-text">
                {p === "b2c" ? "Someone travelling with us" : "A company that wants to sell us"}
              </span>
              <span className="block text-[11px] text-os-muted">
                {p === "b2c" ? "Goes to Reservations." : "Goes to Partnerships."}
              </span>
            </button>
          ))}
        </div>
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Their name" required hint="Whatever you have. 'Instagram DM, no name given' beats a blank.">
            <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={inputClass} />
          </Field>
        </div>

        <Field label="Phone"><input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={inputClass} placeholder="+20 100 000 0000" /></Field>
        <Field label="WhatsApp"><input value={form.contactWhatsapp} onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })} className={inputClass} /></Field>
        <Field label="Email"><input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={inputClass} /></Field>
        <Field label="Instagram"><input value={form.contactInstagram} onChange={(e) => setForm({ ...form, contactInstagram: e.target.value })} className={inputClass} placeholder="@handle" /></Field>

        {form.pipeline === "b2b" ? (
          <div className="sm:col-span-2">
            <Field label="Company" hint="Registered as a partner only once it is qualified — a name here is enough for now.">
              <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={inputClass} />
            </Field>
          </div>
        ) : null}

        <Field label="Where it came from" required>
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={selectClass}>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Campaign" hint="The specific post, ad or event. This is what makes attribution possible.">
          <input value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} className={inputClass} />
        </Field>

        <Field label="Country"><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} /></Field>
        <Field label="Language"><input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={inputClass} /></Field>

        <div className="sm:col-span-2">
          <Field label="What they want">
            <input value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} className={inputClass} placeholder="Flying dress photoshoot at Wadi El Rayan" />
          </Field>
        </div>
        <Field label="Service">
          <select value={form.tripTypeId} onChange={(e) => setForm({ ...form, tripTypeId: e.target.value })} className={selectClass}>
            <option value="">Not decided</option>
            {tripTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Business unit">
          <select value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} className={selectClass}>
            <option value="">Not decided</option>
            {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>

        <Field label="Date they asked for" hint="A named date is the single strongest signal in the score.">
          <input type="date" value={form.requestedDate} onChange={(e) => setForm({ ...form, requestedDate: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Flexible">
          <label className="flex items-center gap-2 pt-2 text-[13px] text-os-text">
            <input type="checkbox" checked={form.dateFlexible} onChange={(e) => setForm({ ...form, dateFlexible: e.target.checked })} className="accent-os-gold" />
            They can move it
          </label>
        </Field>

        <Field label="Guests"><input inputMode="numeric" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} className={inputClass} /></Field>
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <Field label="Budget they stated">
            <input inputMode="decimal" value={form.budgetAmount} onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Currency">
            <select value={form.budgetCurrency} onChange={(e) => setForm({ ...form, budgetCurrency: e.target.value })} className={selectClass}>
              {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="What they actually wrote" hint="Paste it. What they typed is evidence; a summary is an interpretation.">
            <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </div>

      {!reachable && form.contactName.trim() ? (
        <p className="mt-3 rounded-lg border border-os-amber/25 bg-os-amber-soft px-3 py-2 text-[12px] text-os-amber">
          There is no way to reply to this yet. Add a phone, WhatsApp, email or handle — an enquiry nobody can answer is a
          note, not a lead, and the scorer will say so.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => action.run({
            pipeline: form.pipeline,
            contactName: form.contactName,
            contactEmail: form.contactEmail || null,
            contactPhone: form.contactPhone || null,
            contactWhatsapp: form.contactWhatsapp || null,
            contactInstagram: form.contactInstagram || null,
            companyName: form.companyName || null,
            country: form.country || null,
            language: form.language || null,
            source: form.source,
            campaign: form.campaign || null,
            interest: form.interest || null,
            tripTypeId: form.tripTypeId || null,
            unitId: form.unitId || null,
            requestedDate: form.requestedDate || null,
            dateFlexible: form.dateFlexible,
            guests: form.guests.trim() ? Number(form.guests) : null,
            budgetAmount: form.budgetAmount.trim() ? Number(form.budgetAmount) : null,
            budgetCurrency: form.budgetAmount.trim() ? form.budgetCurrency : null,
            message: form.message || null,
          })}
          disabled={!form.contactName.trim() || !reachable || action.pending}
          className={buttonClass.gold}
        >
          {action.pending ? <Spinner /> : null}Log the enquiry
        </button>
        <Link href="/os/reservations" className={buttonClass.ghost}>Cancel</Link>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
