import Link from "next/link";
import { EgyptMap } from "./EgyptMap";
import { Reveal } from "./Reveal";
import type { DestinationHub } from "@/content/types";

// A compact, high-impact homepage promo for /explore-egypt — built around a
// live, decorative preview of the real interactive map (not stock imagery
// or a fake mockup), inside the same dark rounded-panel language already
// used by the Flying Dress / Red Sea / Custom Tours sections on this page.
export function ExploreEgyptPromo({ hubs }: { hubs: DestinationHub[] }) {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-3xl bg-ink">
        <div className="bg-hieroglyph-pattern absolute inset-0 opacity-[0.07]" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:p-16">
          <div>
            <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-light">
              Explore Egypt
            </span>
            <h2 className="mt-5 text-balance font-display text-3xl font-semibold leading-[1.1] text-cream sm:text-4xl lg:text-[2.75rem]">
              Your Egypt Adventure Starts Here
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-cream/70">
              Tap through Cairo, Luxor, the Red Sea coast and beyond on our interactive map — see the real tours,
              experiences and photoshoots waiting at each stop, then build your own journey in minutes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="/explore-egypt"
                className="group/cta inline-flex items-center gap-3 rounded-full bg-gold py-2 pl-6 pr-2 text-sm font-semibold text-ink shadow-lg shadow-gold/20 transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light hover:shadow-xl hover:shadow-gold/30 active:scale-[0.98]"
              >
                Start Exploring
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-cream transition-transform duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5">
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M6 14L14 6M14 6H8M14 6V12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-cream/40">
                10 destinations · one live map
              </p>
            </div>
          </div>

          <div className="group/preview [perspective:1200px]">
            <div className="relative mx-auto max-w-sm transition-transform duration-700 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group-hover/preview:-rotate-1 group-hover/preview:scale-[1.015]">
              <div
                className="pointer-events-none absolute -inset-3 rounded-[2.25rem] bg-gradient-to-br from-gold/30 via-gold/5 to-transparent opacity-70 blur-xl"
                aria-hidden="true"
              />
              <div className="relative rounded-[2.25rem] bg-cream/5 p-1.5 ring-1 ring-cream/10">
                <EgyptMap hubs={hubs} className="pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
