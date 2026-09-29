"use client";

import { useState, useTransition } from "react";
import {
  cancelDeparture,
  completeDeparture,
  createDeparture,
  reinstateDeparture,
  rescheduleDeparture,
  updateCapacity,
} from "./actions";
import type { ActionResult } from "./types";
import type { Departure } from "@/lib/departureModel";

// The forms behind /admin/departures. Plain HTML forms over server actions —
// this screen is used weekly by the people running the trips, so it optimises
// for "add a date in fifteen seconds" rather than for looking like an app.

const input =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold";
const label = "mb-1 block text-xs font-semibold text-ink-soft";

function Message({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return result.ok ? (
    <p className="mt-2 text-sm font-semibold text-emerald-700">Saved.</p>
  ) : (
    <p className="mt-2 text-sm font-semibold text-rose-700">{result.error}</p>
  );
}

export function CreateDepartureForm({ trips }: { trips: { slug: string; title: string; nights: number }[] }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [tripSlug, setTripSlug] = useState(trips[0]?.slug ?? "");

  const overnight = (trips.find((t) => t.slug === tripSlug)?.nights ?? 0) > 0;

  return (
    <form
      action={(formData) =>
        start(async () => {
          const r = await createDeparture(formData);
          setResult(r);
          if (r.ok) (document.getElementById("create-departure") as HTMLFormElement | null)?.reset();
        })
      }
      id="create-departure"
      className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm"
    >
      <h2 className="font-display text-lg font-semibold text-ink">Schedule a departure</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Goes live on the site immediately. Seats sold are tracked automatically — you never set them here.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="trip_slug">
            Trip
          </label>
          <select
            id="trip_slug"
            name="trip_slug"
            className={input}
            value={tripSlug}
            onChange={(e) => setTripSlug(e.target.value)}
            required
          >
            {trips.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="departs_on">
            Departs
          </label>
          <input id="departs_on" name="departs_on" type="date" className={input} required />
        </div>

        <div>
          <label className={label} htmlFor="returns_on">
            Returns {overnight ? "" : "(day trip — leave blank)"}
          </label>
          <input id="returns_on" name="returns_on" type="date" className={input} />
        </div>

        <div>
          <label className={label} htmlFor="price_usd">
            Price per seat (USD)
          </label>
          <input id="price_usd" name="price_usd" type="number" min="0" step="1" className={input} required />
        </div>

        <div>
          <label className={label} htmlFor="child_price_usd">
            Child price (optional)
          </label>
          <input id="child_price_usd" name="child_price_usd" type="number" min="0" step="1" className={input} />
        </div>

        <div>
          <label className={label} htmlFor="capacity">
            Seats on the vehicle
          </label>
          <input id="capacity" name="capacity" type="number" min="1" step="1" defaultValue={12} className={input} required />
        </div>

        <div>
          <label className={label} htmlFor="min_seats">
            Minimum to run
          </label>
          <input id="min_seats" name="min_seats" type="number" min="1" step="1" defaultValue={4} className={input} required />
        </div>

        <div>
          <label className={label} htmlFor="departure_time">
            Departure time (text)
          </label>
          <input id="departure_time" name="departure_time" placeholder="06:30, Cairo" className={input} />
        </div>

        <div>
          <label className={label} htmlFor="booking_closes_at">
            Bookings close (optional)
          </label>
          <input id="booking_closes_at" name="booking_closes_at" type="datetime-local" className={input} />
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="meeting_point">
            Meeting point (optional)
          </label>
          <input id="meeting_point" name="meeting_point" className={input} />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className={label} htmlFor="note">
            Note shown on this date (optional)
          </label>
          <input id="note" name="note" placeholder="New moon — best stargazing of the month" className={input} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink/90 disabled:opacity-60"
      >
        {pending ? "Scheduling…" : "Schedule departure"}
      </button>
      <Message result={result} />
    </form>
  );
}

export function DepartureActions({ departure }: { departure: Departure }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [open, setOpen] = useState<null | "cancel" | "reschedule" | "capacity">(null);

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.ok) setOpen(null);
    });

  const btn = "rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-ink transition hover:border-gold";

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1.5">
        {departure.state === "cancelled" ? (
          <button type="button" disabled={pending} className={btn} onClick={() => run(() => reinstateDeparture(departure.id))}>
            Reinstate
          </button>
        ) : (
          <button type="button" className={btn} onClick={() => setOpen(open === "cancel" ? null : "cancel")}>
            Cancel
          </button>
        )}
        <button type="button" className={btn} onClick={() => setOpen(open === "reschedule" ? null : "reschedule")}>
          Reschedule
        </button>
        <button type="button" className={btn} onClick={() => setOpen(open === "capacity" ? null : "capacity")}>
          Capacity
        </button>
        {departure.state === "departed" && (
          <button type="button" disabled={pending} className={btn} onClick={() => run(() => completeDeparture(departure.id))}>
            Mark completed
          </button>
        )}
      </div>

      {open === "cancel" && (
        <form
          className="mt-2 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const reason = new FormData(e.currentTarget).get("reason");
            run(() => cancelDeparture(departure.id, String(reason ?? "")));
          }}
        >
          <input
            name="reason"
            required
            placeholder="Reason — travellers booked on this date will read it"
            className={`${input} flex-1 min-w-[16rem]`}
          />
          <button type="submit" disabled={pending} className="rounded-full bg-rose-700 px-4 py-2 text-xs font-semibold text-white">
            Confirm cancellation
          </button>
        </form>
      )}

      {open === "reschedule" && (
        <form
          className="mt-2 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const departs = String(fd.get("departs_on") ?? "");
            const returns = String(fd.get("returns_on") ?? "") || null;
            run(() => rescheduleDeparture(departure.id, departs, returns));
          }}
        >
          <div>
            <span className={label}>New departure date</span>
            <input name="departs_on" type="date" defaultValue={departure.departsOn} className={input} required />
          </div>
          <div>
            <span className={label}>New return date</span>
            <input name="returns_on" type="date" defaultValue={departure.returnsOn ?? ""} className={input} />
          </div>
          <button type="submit" disabled={pending} className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream">
            Move it
          </button>
          <p className="w-full text-xs text-ink-soft/85">
            Bookings stay attached — tell the travellers yourself, this doesn&apos;t email them.
          </p>
        </form>
      )}

      {open === "capacity" && (
        <form
          className="mt-2 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(new FormData(e.currentTarget).get("capacity"));
            run(() => updateCapacity(departure.id, n));
          }}
        >
          <div>
            <span className={label}>Seats on the vehicle</span>
            <input name="capacity" type="number" min="1" defaultValue={departure.capacity} className={input} required />
          </div>
          <button type="submit" disabled={pending} className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream">
            Update
          </button>
          <p className="w-full text-xs text-ink-soft/85">
            {departure.seatsTaken} seat{departure.seatsTaken === 1 ? "" : "s"} already booked — you can&apos;t go below that.
          </p>
        </form>
      )}

      <Message result={result} />
    </div>
  );
}
