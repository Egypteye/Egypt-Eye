"use client";

import Link from "next/link";
import { SmartImage } from "./SmartImage";
import { useLocale, useTr } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/locales";
import { site } from "@/content/site";
import type { WeeklyTrip } from "@/content/types";

// What the top of the page is when nothing is scheduled.
//
// This is not an error state and it is not a placeholder for a featured trip
// that failed to load - it is the truthful state of a seasonal product
// between calendars, and on this site it is the state the page has actually
// been in. So it gets the same space and the same photograph the featured
// departure would have had, rather than collapsing the page into a grid of
// cards that all say "coming soon".
//
// What it must never do is fill the gap with an invented date, a countdown to
// nothing, or a trip presented as bookable. The honest version converts
// better anyway: the ask here is to be told first, which is a real thing a
// visitor can do today.

export function NoDeparturesPanel({ trip }: { trip?: WeeklyTrip }) {
  const tr = useTr();
  const { locale } = useLocale();

  return (
    <div className="overflow-hidden rounded-3xl bg-ink shadow-xl shadow-black/10">
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        <div className="relative min-h-[14rem] lg:min-h-[24rem]">
          <SmartImage
            image={trip?.image}
            tone={trip?.imageTone ?? "desert"}
            alt={trip?.title ?? tr("Egypt Eye Weekly Trips")}
            className="absolute inset-0 h-full w-full"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-ink/10 lg:to-ink" />
        </div>

        <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
          <span className="w-fit rounded-full bg-gold/15 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold-light">
            {tr("Next season")}
          </span>

          <h3 className="font-display text-2xl font-semibold leading-tight text-cream sm:text-3xl">
            {tr("The next dates are being set")}
          </h3>
          <p className="text-cream/75">
            {tr(
              "Weekly Trips run in seasons, and the calendar for the coming one is being put together now. Tell us which trip you want and we will come to you with the date before it goes on the site — the first dates of a season are the ones that fill."
            )}
          </p>
          <p className="text-sm text-cream/60">
            {tr("Every one of these also runs privately, on any date you like, for your group alone.")}
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <a
              href={site.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              {tr("Ask about a date")}
            </a>
            <Link
              href={localePath("/customize", locale)}
              className="rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition hover:border-gold"
            >
              {tr("Run one privately instead")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
