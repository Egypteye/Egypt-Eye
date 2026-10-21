"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionButton, ActionForm } from "../ActionForm";
import { Field, Panel, TextArea } from "../Fields";
import type { OsLead } from "@/lib/os/data";
import {
  PLATFORM_SUGGESTIONS,
  SERVICE_TYPE_SUGGESTIONS,
  addDays,
  describeFollowUp,
  followUpState,
  formatDate,
} from "@/lib/os/model";
import { closeLead, createLead, logFollowUp, markItinerarySent, reopenLead, updateLead } from "./actions";

// How urgent a row is, in colour. Overdue is the only one that shouts.
const STATE_STYLES: Record<string, string> = {
  overdue: "border-terracotta/40 bg-terracotta/5",
  today: "border-gold/50 bg-gold-light/10",
  soon: "border-black/10 bg-cream",
  later: "border-black/10 bg-cream",
  unscheduled: "border-dashed border-black/20 bg-cream",
};

const STATE_BADGES: Record<string, string> = {
  overdue: "bg-terracotta text-cream",
  today: "bg-gold text-ink",
  soon: "bg-black/10 text-ink-soft",
  later: "bg-black/5 text-ink-soft",
  unscheduled: "bg-black/5 text-ink-soft",
};

export function NewLeadForm({ today, owner }: { today: string; owner: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-cream"
      >
        Add a request
      </button>
    );
  }

  return (
    <Panel
      title="New request"
      description="What the desk writes down when an enquiry comes in — on WhatsApp, email, Instagram or TikTok."
    >
      <ActionForm action={createLead} submitLabel="Add to the list">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name" name="guest_name" required />
          <Field
            label="Came in on"
            name="platform"
            suggestions={PLATFORM_SUGGESTIONS}
            hint="Whatever you'd write on the sheet."
          />
          <Field label="Phone / handle / email" name="contact" />
          <Field label="Date of request" name="requested_on" type="date" defaultValue={today} />
          <Field label="When they want to travel" name="travel_window" placeholder="e.g. November" />
          <Field
            label="Interested in"
            name="interest"
            suggestions={SERVICE_TYPE_SUGGESTIONS}
            placeholder="e.g. 4 days"
          />
          <Field label="Guests" name="pax" type="number" min={1} />
          <Field
            label="Next follow-up"
            name="next_follow_up_on"
            type="date"
            defaultValue={addDays(today, 2)}
            hint="Defaults to two days out so nobody goes unchased."
          />
          <Field label="Owner" name="owner" defaultValue={owner} />
          <TextArea label="Notes" name="notes" className="sm:col-span-2 lg:col-span-3" />
        </div>
      </ActionForm>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-2 text-xs font-semibold text-ink-soft underline"
      >
        Close
      </button>
    </Panel>
  );
}

export function LeadRow({
  lead,
  today,
  editable,
}: {
  lead: OsLead;
  today: string;
  editable: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [closing, setClosing] = useState(false);
  const state = lead.outcome === "pending" ? followUpState(lead.nextFollowUpOn, today) : "later";

  return (
    <article className={`rounded-xl border px-4 py-3 shadow-sm ${STATE_STYLES[state]}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-base font-semibold text-ink">{lead.guestName}</h3>

        {lead.outcome === "pending" ? (
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATE_BADGES[state]}`}>
            {describeFollowUp(lead.nextFollowUpOn, today)}
          </span>
        ) : (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              lead.outcome === "booked" ? "bg-nile text-cream" : "bg-black/10 text-ink-soft"
            }`}
          >
            {lead.outcome}
          </span>
        )}

        {lead.platform ? <span className="text-xs text-ink-soft">via {lead.platform}</span> : null}
        {lead.interest ? <span className="text-xs font-medium text-ink">{lead.interest}</span> : null}
        {lead.pax ? <span className="text-xs text-ink-soft">{lead.pax} pax</span> : null}
        {lead.travelWindow ? <span className="text-xs text-ink-soft">{lead.travelWindow}</span> : null}

        <span
          className={`ml-auto rounded px-1.5 py-0.5 text-xs font-semibold ${
            lead.itineraryStatus === "sent" ? "bg-nile/10 text-nile" : "bg-black/5 text-ink-soft"
          }`}
        >
          {lead.itineraryStatus === "sent" ? "Itinerary sent" : "Itinerary not sent"}
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink-soft">
        {lead.contact ? <span>{lead.contact}</span> : null}
        <span>Asked {formatDate(lead.requestedOn)}</span>
        {lead.lastFollowUpOn ? <span>Last chased {formatDate(lead.lastFollowUpOn)}</span> : null}
        {lead.owner ? <span>Owner: {lead.owner}</span> : null}
      </div>

      {lead.notes ? <p className="mt-1.5 whitespace-pre-line text-sm text-ink">{lead.notes}</p> : null}

      {editable ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {lead.outcome === "pending" ? (
            <>
              {/* The one-click path: chased today, next one in N days. Three
                  intervals because those are the ones the desk's own list
                  actually uses. */}
              {[2, 7, 14].map((days) => (
                <ActionButton
                  key={days}
                  action={logFollowUp.bind(null, lead.id, days)}
                  label={`Chased — again in ${days}d`}
                />
              ))}
              {lead.itineraryStatus !== "sent" ? (
                <ActionButton action={markItinerarySent.bind(null, lead.id)} label="Itinerary sent" />
              ) : null}
              <Link
                href={`/os/bookings/new?lead=${lead.id}`}
                className="rounded-lg bg-nile px-3 py-1.5 text-xs font-semibold text-cream"
              >
                Became a booking →
              </Link>
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="rounded-lg bg-black/5 px-3 py-1.5 text-xs font-semibold text-ink-soft"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
              <button
                type="button"
                onClick={() => setClosing((v) => !v)}
                className="rounded-lg bg-black/5 px-3 py-1.5 text-xs font-semibold text-ink-soft"
              >
                {closing ? "Cancel" : "Didn't book"}
              </button>
            </>
          ) : (
            <ActionButton action={reopenLead.bind(null, lead.id)} label="Reopen" />
          )}
        </div>
      ) : null}

      {closing && editable ? (
        <div className="mt-3 rounded-lg border border-black/10 bg-white px-3 py-3">
          <ActionForm
            action={async (formData: FormData) =>
              closeLead(lead.id, "lost", String(formData.get("note") ?? ""))
            }
            submitLabel="Close as not booked"
          >
            <Field
              label="Why not?"
              name="note"
              placeholder="Too expensive, dates changed, went quiet…"
              hint="Added to the notes, not instead of them. Worth knowing which platforms go cold."
            />
          </ActionForm>
        </div>
      ) : null}

      {editing && editable ? (
        <div className="mt-3 rounded-lg border border-black/10 bg-white px-3 py-3">
          <ActionForm action={updateLead.bind(null, lead.id)} submitLabel="Save">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Name" name="guest_name" required defaultValue={lead.guestName} />
              <Field label="Came in on" name="platform" suggestions={PLATFORM_SUGGESTIONS} defaultValue={lead.platform} />
              <Field label="Phone / handle / email" name="contact" defaultValue={lead.contact} />
              <Field label="When they want to travel" name="travel_window" defaultValue={lead.travelWindow} />
              <Field
                label="Interested in"
                name="interest"
                suggestions={SERVICE_TYPE_SUGGESTIONS}
                defaultValue={lead.interest}
              />
              <Field label="Guests" name="pax" type="number" min={1} defaultValue={lead.pax} />
              <Field label="Last chased" name="last_follow_up_on" type="date" defaultValue={lead.lastFollowUpOn} />
              <Field label="Next follow-up" name="next_follow_up_on" type="date" defaultValue={lead.nextFollowUpOn} />
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">Itinerary</span>
                <select
                  name="itinerary_status"
                  defaultValue={lead.itineraryStatus}
                  className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink shadow-sm"
                >
                  <option value="not_sent">Not sent</option>
                  <option value="sent">Sent</option>
                </select>
              </label>
              <TextArea
                label="Notes"
                name="notes"
                defaultValue={lead.notes}
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>
          </ActionForm>
        </div>
      ) : null}
    </article>
  );
}
