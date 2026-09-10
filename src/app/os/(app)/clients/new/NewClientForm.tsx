"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/os/actions/records";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";

const SOURCES = ["Instagram", "TikTok", "Website", "WhatsApp", "Airbnb Experiences", "Viator", "Tripadvisor", "Travel Agency", "Referral", "Repeat Customer", "Other"];

export function NewClientForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "", kind: "individual" as "individual" | "agency", companyName: "",
    email: "", phone: "", whatsapp: "", nationality: "", country: "", language: "",
    instagram: "", source: "", vip: false, preferences: "", notes: "",
  });

  const action = useAction(createClient, {
    onSuccess: (result) => { if (result.data?.id) router.push(`/os/clients/${result.data.id}`); },
    refresh: false,
  });

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kind">
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as "individual" | "agency" })} className={selectClass}>
            <option value="individual">Traveller</option>
            <option value="agency">Travel agency (B2B)</option>
          </select>
        </Field>
        <Field label="Booking source">
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={selectClass}>
            <option value="">Not recorded</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label={form.kind === "agency" ? "Main contact name" : "Full name"} required>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} />
          </Field>
        </div>
        {form.kind === "agency" ? (
          <div className="sm:col-span-2">
            <Field label="Company name" required>
              <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={inputClass} />
            </Field>
          </div>
        ) : null}

        <Field label="Email" hint="Used to match a returning client.">
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Phone" hint="With country code.">
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+20 100 000 0000" />
        </Field>
        <Field label="WhatsApp" hint="If different from the phone number.">
          <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Instagram">
          <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className={inputClass} placeholder="@handle" />
        </Field>

        <Field label="Nationality"><input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className={inputClass} /></Field>
        <Field label="Country"><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} /></Field>
        <Field label="Preferred language"><input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={inputClass} /></Field>
        <Field label="VIP">
          <label className="flex items-center gap-2 pt-2 text-[13px] text-os-text">
            <input type="checkbox" checked={form.vip} onChange={(e) => setForm({ ...form, vip: e.target.checked })} className="accent-os-gold" />
            Handle personally, escalate anything unusual
          </label>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Preferences" hint="What matters to them. The crew reads this before the trip.">
            <textarea rows={2} value={form.preferences} onChange={(e) => setForm({ ...form, preferences: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Internal notes">
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => action.run({
            fullName: form.fullName, kind: form.kind, companyName: form.companyName || null,
            email: form.email || null, phone: form.phone || null, whatsapp: form.whatsapp || null,
            nationality: form.nationality || null, country: form.country || null, language: form.language || null,
            instagram: form.instagram || null, source: form.source || null, vip: form.vip,
            preferences: form.preferences || null, notes: form.notes || null,
          })}
          disabled={!form.fullName.trim() || action.pending}
          className={buttonClass.gold}
        >
          {action.pending ? <Spinner /> : null}Save client
        </button>
        <Link href="/os/clients" className={buttonClass.ghost}>Cancel</Link>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
