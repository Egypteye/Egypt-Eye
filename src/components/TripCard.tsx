"use client";

import Link from "next/link";
import { SmartImage } from "./SmartImage";
import { Badge } from "./Badge";
import { SeatPill } from "./SeatAvailability";
import { useLocale, useTr } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/locales";
import { formatDateRange } from "@/lib/departureModel";
import type { Departure } from "@/lib/departureModel";
import type { WeeklyTrip } from "@/content/types";

// A Weekly Trip on the hub grid.
//
// Differs from TourCard in what it leads with. A tour card sells the trip; a
// Weekly Trip card has to answer "when is the next one and can I still get
// on it" before anything else, because that is the question the whole product
// exists to answer. So the next date and the seat state sit above the fold of
// the card, and the price is quoted from that departure rather than from the
// catalogue — see the note in content/weeklyTrips.ts about why no price is
// authored there at all.

export function TripCard({
  trip,
  nextDeparture,
  fromPrice,
  departureCount,
}: {
  trip: WeeklyTrip;
  nextDeparture?: Departure;
  fromPrice?: number;
  /** How many bookable dates this trip has coming up. */
  departureCount?: number;
}) {
  const tr = useTr();
  const { locale } = useLocale();
  const href = localePath(`/weekly-trips/${trip.slug}`, locale);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:shadow-lg hover:shadow-black/5">
      <Link href={href} className="absolute inset-0 z-10" aria-label={trip.title} />
      <SmartImage
        image={trip.image}
        tone={trip.imageTone}
        alt={trip.title}
        label={trip.destinations.join(" · ")}
        className="h-52 w-full transition duration-500 group-hover:scale-105"
      />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{trip.duration}</Badge>
          {nextDeparture && <SeatPill departure={nextDeparture} />}
        </div>

        <h3 className="font-display text-lg font-semibold leading-snug text-ink">{trip.title}</h3>
        <p className="line-clamp-2 text-sm text-ink-soft">{trip.tagline}</p>

        {/* The whole point of the card: when the next one goes. */}
        <div className="mt-auto rounded-xl bg-sand/70 px-3 py-2.5">
          {nextDeparture ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft/85">
                {tr("Next departure")}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                {formatDateRange(nextDeparture.departsOn, nextDeparture.returnsOn, locale)}
              </p>
              {departureCount !== undefined && departureCount > 1 && (
                <p className="mt-0.5 text-xs text-ink-soft">
                  {tr("+{n} more dates").replace("{n}", String(departureCount - 1))}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft/85">
                {tr("Dates")}
              </p>
              {/* No invented date and no invented price — this is the truthful
                  state of a trip nobody has scheduled yet. */}
              <p className="mt-0.5 text-sm font-semibold text-ink">{tr("Coming soon")}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{tr("Ask us to be told first")}</p>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-black/5 pt-3">
          {fromPrice !== undefined ? (
            <span className="text-sm text-ink-soft">
              <span className="text-base font-semibold text-ink">${fromPrice}</span>{" "}
              {tr("per seat")}
            </span>
          ) : (
            <span className="text-sm text-ink-soft">{trip.typicalGroupSize ?? ""}</span>
          )}
          <span className="text-sm font-semibold text-gold-dark transition group-hover:translate-x-1">
            {tr("View trip →")}
          </span>
        </div>
      </div>
    </div>
  );
}
