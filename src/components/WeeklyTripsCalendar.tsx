"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SmartImage } from "./SmartImage";
import { SeatPill, GuaranteeNote } from "./SeatAvailability";
import { useLocale, useTr } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/locales";
import { formatDateRange, groupByMonth } from "@/lib/departureModel";
import type { Departure } from "@/lib/departureModel";
import type { WeeklyTripCategory } from "@/content/types";

// The upcoming-departures calendar on /weekly-trips.
//
// A chronological list, not a month grid. A grid looks like a calendar but
// answers the wrong question: nobody arrives asking "what is happening on the
// 14th", they ask "what is the next thing I could get on". A date-ordered list
// answers that in the first row, works down to a single column on a phone
// without becoming a scroll-sideways table, and puts the seat count on the
// same line as the date it belongs to.
//
// Cancelled departures stay in the list rather than disappearing, because
// someone holding a booking for one needs the page to tell them.

type LengthFilter = "all" | "day" | "overnight";

export function WeeklyTripsCalendar({
  departures,
  categoryLabels,
}: {
  departures: Departure[];
  categoryLabels: Record<WeeklyTripCategory, string>;
}) {
  const tr = useTr();
  const { locale } = useLocale();
  const [category, setCategory] = useState<WeeklyTripCategory | "all">("all");
  const [length, setLength] = useState<LengthFilter>("all");

  // Only offer a filter the visitor can actually use — a category chip that
  // returns nothing is a dead control.
  const availableCategories = useMemo(() => {
    const set = new Set<WeeklyTripCategory>();
    for (const d of departures) set.add(d.trip.category);
    return [...set];
  }, [departures]);

  const filtered = useMemo(
    () =>
      departures.filter((d) => {
        if (category !== "all" && d.trip.category !== category) return false;
        if (length === "day" && d.trip.nights > 0) return false;
        if (length === "overnight" && d.trip.nights === 0) return false;
        return true;
      }),
    [departures, category, length]
  );

  const months = useMemo(() => groupByMonth(filtered, locale), [filtered, locale]);

  const chip = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
      active ? "bg-ink text-cream" : "bg-sand text-ink-soft hover:bg-sand-dim"
    }`;

  if (departures.length === 0) {
    return (
      <div className="rounded-2xl border border-black/5 bg-cream p-8 text-center">
        <p className="font-display text-xl font-semibold text-ink">{tr("The next dates are being finalised")}</p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ink-soft">
          {tr("Weekly Trips run seasonally, and the upcoming calendar is being set. Browse the trips below and ask us about a date — or have us run any of them privately whenever suits you.")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setCategory("all")} className={chip(category === "all")}>
          {tr("All trips")}
        </button>
        {availableCategories.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={chip(category === c)}>
            {categoryLabels[c]}
          </button>
        ))}
        <span aria-hidden className="mx-1 h-5 w-px bg-black/10" />
        <button type="button" onClick={() => setLength(length === "day" ? "all" : "day")} className={chip(length === "day")}>
          {tr("Day trips")}
        </button>
        <button
          type="button"
          onClick={() => setLength(length === "overnight" ? "all" : "overnight")}
          className={chip(length === "overnight")}
        >
          {tr("Overnight")}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-black/5 bg-cream p-6 text-center text-sm text-ink-soft">
          {tr("No upcoming departures match that. Try another filter.")}
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {months.map(({ month, departures: group }) => (
            <section key={month}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink-soft/85">{month}</h3>
              <ul className="space-y-3">
                {group.map((d) => {
                  const href = localePath(`/weekly-trips/${d.trip.slug}`, locale);
                  const dim = d.state === "cancelled" || d.state === "closed";
                  return (
                    <li key={d.id}>
                      <div
                        className={`group relative flex gap-4 overflow-hidden rounded-2xl border border-black/5 bg-cream p-3 shadow-sm transition hover:shadow-md sm:p-4 ${
                          dim ? "opacity-75" : ""
                        }`}
                      >
                        <Link href={href} className="absolute inset-0 z-10" aria-label={d.trip.title} />
                        <SmartImage
                          image={d.trip.image}
                          tone={d.trip.imageTone}
                          alt={d.trip.title}
                          className="hidden h-24 w-32 shrink-0 rounded-xl sm:block"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <span className="font-display text-base font-semibold text-ink">
                              {formatDateRange(d.departsOn, d.returnsOn, locale)}
                            </span>
                            <SeatPill departure={d} />
                          </div>
                          <p className="mt-1 truncate font-semibold text-ink">{d.trip.title}</p>
                          <p className="mt-0.5 text-sm text-ink-soft">
                            {d.trip.duration} · {tr("from")} {d.trip.departsFrom}
                          </p>
                          {d.state === "cancelled" ? (
                            <p className="mt-1.5 text-xs text-rose-800">
                              {d.cancellationReason || tr("This departure was cancelled.")}
                            </p>
                          ) : (
                            <div className="mt-1.5">
                              <GuaranteeNote departure={d} />
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end justify-between text-right">
                          <span className="font-display text-lg font-semibold text-ink">${d.priceUsd}</span>
                          <span className="text-xs text-ink-soft/85">{tr("per seat")}</span>
                          <span className="mt-2 hidden text-sm font-semibold text-gold-dark transition group-hover:translate-x-0.5 sm:inline">
                            {d.instantBooking ? tr("Instant Booking →") : d.bookable ? tr("Reserve →") : tr("View →")}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
