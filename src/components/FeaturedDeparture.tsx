"use client";

import Link from "next/link";
import { SmartImage } from "./SmartImage";
import { SeatPill, GuaranteeNote } from "./SeatAvailability";
import { DepartureCountdown } from "./DepartureCountdown";
import { useLocale, useTr } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/locales";
import { formatDateRange, departureInstantMs } from "@/lib/departureModel";
import type { Departure } from "@/lib/departureModel";

// The next departure anyone can actually get on.
//
// Which one this is comes from selectFeaturedDeparture in departureModel.ts,
// never from an editor's choice and never from a flag on a row: it is the
// soonest bookable date, so it changes by itself as dates fill up and pass.
// There is deliberately no way to pin a trip here. A hand-picked "featured"
// slot is a thing somebody forgets to update, and a stale one on a page whose
// entire promise is "there is always something coming up" is worse than none.
//
// The image sits beside the text rather than behind it. A scrim dark enough
// to carry a countdown, a price, a status pill and two CTAs over a desert
// photograph ends up hiding the photograph, and this is the one place on the
// page where the picture is doing real selling.

export function FeaturedDeparture({ departure }: { departure: Departure }) {
  const tr = useTr();
  const { locale } = useLocale();
  const { trip } = departure;
  const href = localePath(`/weekly-trips/${trip.slug}`, locale);
  // No clock for a departure whose date cannot be read. "No confirmed date,
  // no countdown" is a rule in its own right: a timer against a broken or
  // missing date is the one kind of countdown that is actually dishonest.
  const targetMs = departureInstantMs(departure.departsOn, departure.departureTime);
  const hasClock = Number.isFinite(targetMs);

  const facts: { label: string; value: string }[] = [
    { label: tr("Dates"), value: formatDateRange(departure.departsOn, departure.returnsOn, locale) },
    { label: tr("Duration"), value: trip.duration },
    { label: tr("Leaves from"), value: departure.meetingPoint ?? trip.departsFrom },
  ];

  return (
    <div className="overflow-hidden rounded-3xl bg-ink shadow-xl shadow-black/10">
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        <div className="relative min-h-[15rem] lg:min-h-[30rem]">
          <SmartImage
            image={trip.image}
            tone={trip.imageTone}
            alt={trip.title}
            className="absolute inset-0 h-full w-full"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
          {/* Only deep enough to seat the countdown, and only at the bottom,
              so the photograph is still a photograph. */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-ink/10 lg:to-ink" />
          {hasClock && (
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:hidden">
              <DepartureCountdown targetMs={targetMs} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-gold/15 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold-light">
              {tr("Next departure")}
            </span>
            <SeatPill departure={departure} />
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-cream/70 ring-1 ring-inset ring-cream/20">
              {trip.nights > 0 ? tr("Overnight") : tr("Day trip")}
            </span>
          </div>

          {hasClock && (
            <div className="hidden lg:block">
              <DepartureCountdown targetMs={targetMs} />
            </div>
          )}

          <div>
            <h3 className="font-display text-2xl font-semibold leading-tight text-cream sm:text-3xl">
              {trip.title}
            </h3>
            <p className="mt-2 text-cream/75">{trip.tagline}</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-cream/10 py-4 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-cream/50">
                  {f.label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-cream">{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-3xl font-semibold text-cream">${departure.priceUsd}</span>
            <span className="text-sm text-cream/65">{tr("per seat")}</span>
            <GuaranteeNote departure={departure} className="w-full !text-cream/70 sm:w-auto" />
          </div>

          <div className="mt-auto flex flex-wrap gap-3">
            <Link
              href={href}
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              {tr("Reserve a seat")}
            </Link>
            <Link
              href={href}
              className="rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition hover:border-gold"
            >
              {tr("See the full day")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
