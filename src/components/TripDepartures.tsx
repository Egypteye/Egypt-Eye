"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useLocale, useTr } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/locales";
import { SeatPill, GuaranteeNote, SeatBar } from "./SeatAvailability";
import { formatDateRange, groupByMonth } from "@/lib/departureModel";
import type { Departure } from "@/lib/departureModel";

// Pick a date, then take the seats. The whole booking journey for a Weekly
// Trip, on one screen.
//
// Deliberately not a multi-step flow or a modal. There are two decisions —
// which date, how many people — and putting them on one screen means the
// visitor can see the seat count change as they reconsider the date, which is
// the thing that actually drives the booking. A modal would hide the very
// information the product is built on.
//
// Availability shown here is a snapshot. It is re-checked under a row lock
// when the form is submitted (see /api/trip-seats), so a departure that sells
// out between page load and submit produces a clear message and an offer of
// the waitlist rather than a silent oversell.

type Status = "idle" | "sending" | "done" | "error";

type Result = {
  reference: string;
  waitlisted: boolean;
  seats: number;
  guaranteed: boolean;
  seatsToGuarantee: number;
  total: number | null;
};

function inputClass(extra = "") {
  return `w-full rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold ${extra}`;
}

export function TripDepartures({
  departures,
  tripTitle,
  whatsappLink,
}: {
  departures: Departure[];
  tripTitle: string;
  whatsappLink: string;
}) {
  const tr = useTr();
  const { locale } = useLocale();

  const selectable = useMemo(() => departures.filter((d) => d.bookable || d.waitlistable), [departures]);
  const [selectedId, setSelectedId] = useState<string | null>(selectable[0]?.id ?? null);
  const selected = useMemo(() => departures.find((d) => d.id === selectedId) ?? null, [departures, selectedId]);

  const [seats, setSeats] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [offerWaitlist, setOfferWaitlist] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const months = useMemo(() => groupByMonth(departures, locale), [departures, locale]);
  const maxSeats = selected ? Math.max(1, Math.min(10, selected.waitlistable ? 10 : selected.seatsLeft)) : 10;

  async function submit(event: FormEvent, joinWaitlist: boolean) {
    event.preventDefault();
    if (!selected) return;
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/trip-seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departureId: selected.id,
          seats,
          guestName: name,
          guestEmail: email,
          guestPhone: phone || undefined,
          preferences: notes || undefined,
          joinWaitlist: joinWaitlist || selected.waitlistable,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? tr("Something went wrong. Please try again."));
        // The seats went while they were typing — offer the waitlist rather
        // than leaving them at a dead end.
        setOfferWaitlist(Boolean(data.canWaitlist));
        return;
      }

      setResult(data as Result);
      setStatus("done");
    } catch {
      setStatus("error");
      setError(tr("Something went wrong. Please try again, or message us on WhatsApp."));
    }
  }

  if (departures.length === 0) {
    return (
      <div className="rounded-2xl border border-black/5 bg-cream p-6 text-center">
        <p className="font-display text-lg font-semibold text-ink">{tr("No dates scheduled yet")}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          {tr("This trip runs seasonally and the next dates aren't up yet. Message us and we'll tell you as soon as they are — or run it privately on a date that suits you.")}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink/90"
          >
            {tr("Ask about dates")}
          </a>
          <Link
            href={localePath("/customize", locale)}
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-gold"
          >
            {tr("Run it privately")}
          </Link>
        </div>
      </div>
    );
  }

  if (status === "done" && result) {
    return (
      <div className="rounded-2xl border border-emerald-600/20 bg-emerald-50/60 p-6">
        <p className="font-display text-xl font-semibold text-ink">
          {result.waitlisted ? tr("You're on the waitlist") : tr("Your seat is held")}
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {result.waitlisted
            ? tr("This departure is full, so we've added you to the waitlist. No seat is held yet and nothing is owed — we'll be in touch if one opens.")
            : tr("We've emailed your confirmation. One of the team will be in touch shortly to confirm your pickup and take payment — nothing is charged through this website.")}
        </p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-soft/85">{tr("Reference")}</dt>
            <dd className="font-semibold text-ink">{result.reference}</dd>
          </div>
          <div>
            <dt className="text-ink-soft/85">{tr("Seats")}</dt>
            <dd className="font-semibold text-ink">{result.seats}</dd>
          </div>
          {result.total !== null && (
            <div>
              <dt className="text-ink-soft/85">{tr("Total")}</dt>
              <dd className="font-semibold text-ink">${result.total.toFixed(2)} USD</dd>
            </div>
          )}
        </dl>
        {!result.waitlisted && !result.guaranteed && (
          <p className="mt-4 rounded-lg bg-white/70 px-3 py-2 text-xs text-ink-soft">
            {tr("This departure needs {n} more to go ahead. We'll confirm as soon as it does — and if it doesn't run, you pay nothing.").replace(
              "{n}",
              String(result.seatsToGuarantee)
            )}
          </p>
        )}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink/90"
        >
          {tr("Message us on WhatsApp")}
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* ---- The calendar ---- */}
      <div>
        <h3 className="font-display text-xl font-semibold text-ink">{tr("Choose a date")}</h3>
        <div className="mt-4 space-y-5">
          {months.map(({ month, departures: group }) => (
            <div key={month}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft/85">{month}</p>
              <ul className="space-y-2">
                {group.map((d) => {
                  const choosable = d.bookable || d.waitlistable;
                  const isSelected = d.id === selectedId;
                  return (
                    <li key={d.id}>
                      <button
                        type="button"
                        disabled={!choosable}
                        onClick={() => {
                          setSelectedId(d.id);
                          setSeats(1);
                          setStatus("idle");
                          setError(null);
                          setOfferWaitlist(false);
                        }}
                        aria-pressed={isSelected}
                        className={`w-full rounded-xl border p-3.5 text-left transition ${
                          isSelected
                            ? "border-gold bg-sand/80 shadow-sm"
                            : choosable
                              ? "border-black/10 bg-cream hover:border-gold/60"
                              : "cursor-not-allowed border-black/5 bg-black/[0.02] opacity-70"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-ink">
                            {formatDateRange(d.departsOn, d.returnsOn, locale)}
                          </span>
                          <SeatPill departure={d} />
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <span className="text-sm text-ink-soft">
                            ${d.priceUsd} {tr("per seat")}
                            {d.departureTime ? ` · ${d.departureTime}` : ""}
                          </span>
                          <GuaranteeNote departure={d} />
                        </div>
                        <div className="mt-2">
                          <SeatBar departure={d} />
                        </div>
                        {d.state === "cancelled" && d.cancellationReason && (
                          <p className="mt-2 text-xs text-rose-800">{d.cancellationReason}</p>
                        )}
                        {d.note && d.state !== "cancelled" && (
                          <p className="mt-2 text-xs text-ink-soft">{d.note}</p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ---- The booking ---- */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        {selected ? (
          <form
            onSubmit={(e) => submit(e, false)}
            className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft/85">
              {selected.waitlistable ? tr("Join the waitlist") : tr("Reserve your seats")}
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-ink">
              {formatDateRange(selected.departsOn, selected.returnsOn, locale)}
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">{tripTitle}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="trip-seats" className="mb-1 block text-sm font-medium text-ink">
                  {selected.waitlistable ? tr("Seats wanted") : tr("Seats")}
                </label>
                <select
                  id="trip-seats"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className={inputClass()}
                >
                  {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                {!selected.waitlistable && selected.seatsLeft <= 3 && (
                  <p className="mt-1 text-xs text-amber-800">
                    {selected.seatsLeft === 1
                      ? tr("Only 1 seat left on this date")
                      : tr("Only {n} seats left on this date").replace("{n}", String(selected.seatsLeft))}
                  </p>
                )}
              </div>

              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tr("Your name")}
                className={inputClass()}
                autoComplete="name"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tr("Email")}
                className={inputClass()}
                autoComplete="email"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={tr("WhatsApp number (optional)")}
                className={inputClass()}
                autoComplete="tel"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={tr("Anything we should know — pickup area, dietary needs, who's with you")}
                rows={3}
                className={inputClass()}
              />
            </div>

            {!selected.waitlistable && (
              <div className="mt-4 flex items-baseline justify-between border-t border-black/5 pt-3">
                <span className="text-sm text-ink-soft">{tr("Total")}</span>
                <span className="font-display text-xl font-semibold text-ink">
                  ${(selected.priceUsd * seats).toFixed(2)}
                </span>
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
                <p>{error}</p>
                {offerWaitlist && (
                  <button
                    type="button"
                    onClick={(e) => submit(e, true)}
                    className="mt-2 font-semibold underline underline-offset-2"
                  >
                    {tr("Put me on the waitlist instead")}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-4 w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-ink/90 disabled:opacity-60"
            >
              {status === "sending"
                ? tr("Holding your seat…")
                : selected.waitlistable
                  ? tr("Join the waitlist")
                  : tr("Reserve my seat")}
            </button>

            {/* Said before the button is pressed, not after — this is the one
                expectation that would otherwise be a nasty surprise. */}
            <p className="mt-3 text-center text-xs text-ink-soft/85">
              {selected.waitlistable
                ? tr("No seat is held and nothing is owed until one opens.")
                : tr("No payment is taken on this site. We'll confirm your seat and arrange payment directly.")}
            </p>
          </form>
        ) : (
          <div className="rounded-2xl border border-black/5 bg-cream p-6 text-center">
            <p className="font-display text-lg font-semibold text-ink">{tr("No seats available right now")}</p>
            <p className="mt-2 text-sm text-ink-soft">
              {tr("Every listed date is full, closed or cancelled. Message us and we'll tell you when the next one opens.")}
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink/90"
            >
              {tr("Ask about the next date")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
