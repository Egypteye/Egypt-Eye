"use client";

import { useState, useMemo } from "react";
import { linkContact } from "@/lib/os/actions/commercial";
import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Field, inputClass, selectClass, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

// ---------------------------------------------------------------------------
// LINKING A PERSON TO A PARTNER
// ---------------------------------------------------------------------------
// The picker searches the WHOLE client book, not a separate contacts list,
// because there is no separate contacts list. If the person you are adding
// has travelled with Egypt Eye personally, this is where that becomes
// visible — and linking them keeps one record rather than creating a second.
//
// `decision_role` is asked for on purpose. Sending a proposal to somebody
// with no authority is the most common wasted week in B2B selling, and the
// pipeline's Qualified stage refuses to accept a deal until this is known.
// ---------------------------------------------------------------------------

const ROLES = [
  { key: "decision_maker", label: "Can decide", hint: "Signs off on the commercial arrangement." },
  { key: "signatory", label: "Signs contracts", hint: "Their name goes on the agreement." },
  { key: "recommender", label: "Recommends", hint: "Influences, does not decide." },
  { key: "influencer", label: "Has a say", hint: "Consulted, no authority." },
  { key: "contact", label: "Day to day", hint: "Bookings and operations." },
  { key: "gatekeeper", label: "Gatekeeper", hint: "Controls access to whoever decides." },
];

export function LinkContactPanel({
  companyId,
  people,
  alreadyLinked,
}: {
  companyId: string;
  people: { id: string; code: string; name: string; email: string | null; ownTrips: number }[];
  alreadyLinked: string[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    clientId: "",
    jobTitle: "",
    department: "",
    decisionRole: "contact",
    isPrimary: false,
    workEmail: "",
    workPhone: "",
    notes: "",
  });

  const action = useAction(linkContact, { onSuccess: () => { setOpen(false); setSearch(""); } });

  const linked = useMemo(() => new Set(alreadyLinked), [alreadyLinked]);
  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return people
      .filter((p) => !linked.has(p.id))
      .filter((p) => p.name.toLowerCase().includes(term) || (p.email ?? "").toLowerCase().includes(term) || p.code.toLowerCase().includes(term))
      .slice(0, 8);
  }, [search, people, linked]);

  const chosen = people.find((p) => p.id === form.clientId) ?? null;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={buttonClass.secondary}>
        <Icon.Plus size={14} />Link a person
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-os-line bg-os-card p-4">
      <p className="mb-3 text-[12px] leading-relaxed text-os-muted">
        Search the client book. There is no separate contacts list — the person you link is the same record they would be
        if they booked a trip themselves, which is how their two relationships stay one history.
      </p>

      {chosen ? (
        <div className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-os-gold bg-os-gold-soft px-3 py-2">
          <span className="min-w-0">
            <span className="block text-[13px] font-medium text-os-text">{chosen.name}</span>
            <span className="block text-[11.5px] text-[#7a6415]">
              {chosen.code}
              {chosen.ownTrips > 0
                ? ` · has taken ${chosen.ownTrips} trip${chosen.ownTrips === 1 ? "" : "s"} with us personally`
                : " · no trips of their own yet"}
            </span>
          </span>
          <button onClick={() => setForm({ ...form, clientId: "" })} className="shrink-0 text-[11.5px] font-medium text-[#7a6415] hover:underline">
            Change
          </button>
        </div>
      ) : (
        <>
          <Field label="Who" required hint="By name, email or client code.">
            <input value={search} onChange={(e) => setSearch(e.target.value)} className={inputClass} placeholder="Olivia Bennett" autoFocus />
          </Field>
          {matches.length ? (
            <ul className="mt-2 space-y-1">
              {matches.map((person) => (
                <li key={person.id}>
                  <button
                    onClick={() => { setForm({ ...form, clientId: person.id, workEmail: person.email ?? "" }); setSearch(""); }}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border border-os-line-strong bg-white px-3 py-2 text-left transition hover:border-os-gold"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-os-text">{person.name}</span>
                      <span className="block text-[11px] text-os-faint">{person.code}{person.email ? ` · ${person.email}` : ""}</span>
                    </span>
                    {person.ownTrips > 0 ? (
                      <span className="shrink-0 rounded bg-os-green-soft px-1.5 py-0.5 text-[10.5px] font-medium text-os-green">
                        {person.ownTrips} own trip{person.ownTrips === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : search.trim() ? (
            <p className="mt-2 text-[12px] text-os-muted">
              Nobody in the book matches. Add them as a client first — the person record comes before the link.
            </p>
          ) : null}
        </>
      )}

      {chosen ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Job title">
            <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className={inputClass} placeholder="Egypt Product Manager" />
          </Field>
          <Field label="Department">
            <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="What can they actually do"
              required
              hint="Asked because B2B deals die when nobody with authority ever joins the conversation. The Qualified stage will not accept a deal until somebody here can decide."
            >
              <select value={form.decisionRole} onChange={(e) => setForm({ ...form, decisionRole: e.target.value })} className={selectClass}>
                {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label} — {r.hint}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Work email">
            <input type="email" value={form.workEmail} onChange={(e) => setForm({ ...form, workEmail: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Work phone">
            <input value={form.workPhone} onChange={(e) => setForm({ ...form, workPhone: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Main contact" hint="Exactly one per partner. Choosing this hands the title over from whoever holds it.">
            <label className="flex items-center gap-2 pt-2 text-[13px] text-os-text">
              <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })} className="accent-os-gold" />
              Who to call first
            </label>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} placeholder="Reads the whole contract. Replies at midnight Cairo time." />
            </Field>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => action.run({
            companyId,
            clientId: form.clientId,
            jobTitle: form.jobTitle || null,
            department: form.department || null,
            decisionRole: form.decisionRole,
            isPrimary: form.isPrimary,
            workEmail: form.workEmail || null,
            workPhone: form.workPhone || null,
            notes: form.notes || null,
          })}
          disabled={!form.clientId || action.pending}
          className={buttonClass.gold}
        >
          {action.pending ? <Spinner /> : null}Link them
        </button>
        <button onClick={() => setOpen(false)} className={buttonClass.ghost}>Cancel</button>
      </div>
      <ActionFeedback result={action.result} onDismiss={action.clear} />
    </div>
  );
}
