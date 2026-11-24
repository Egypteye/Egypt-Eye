import Link from "next/link";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { T } from "@/i18n/T";
import {
  CAMPAIGN_ACTIVE,
  CAMPAIGN_COPY,
  PARTY_DATE,
  campaignDate,
} from "@/content/shakiraCampaign";
import { CampaignPromoTracker } from "@/components/CampaignPromoTracker";

/**
 * The campaign's one foothold on the homepage.
 *
 * DELIBERATELY SMALL, AND DELIBERATELY LAST. The brief is explicit: the
 * homepage must stay essentially unchanged and the campaign must not dominate
 * it. So this is a single compact band at the very bottom — below the
 * Pharaoh's Challenge promo, which already occupies the "last section" slot —
 * and nothing above it moved. No hero takeover, no nav entry, no second CTA
 * competing with the tours.
 *
 * It renders nothing at all once CAMPAIGN_ACTIVE is false, so retiring the
 * campaign restores the homepage exactly rather than leaving a dead band
 * pointing at a page that explains it has ended.
 *
 * A server component, so it costs the homepage no JavaScript; the impression
 * and click measurement lives in the small client wrapper around it.
 */
export function CampaignHomePromo() {
  if (!CAMPAIGN_ACTIVE) return null;

  return (
    <section className="pb-16">
      <Container>
        <Reveal>
          <CampaignPromoTracker>
            <Link
              href={CAMPAIGN_COPY.path}
              className="group relative block overflow-hidden rounded-3xl border border-gold/25 bg-ink px-7 py-10 transition hover:border-gold/50 sm:px-12 sm:py-12"
            >
              {/* A single quiet gold wash. The campaign's energy belongs on its
                  own page; here it has to sit politely under the rest of the
                  homepage. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(228,200,120,0.22)_0%,_transparent_70%)]"
              />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
                    {campaignDate(PARTY_DATE)} 2026
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-cream sm:text-3xl">
                    <T>Shakira let you down?</T>{" "}
                    <span className="text-gold">
                      <T>Egypt Eye got you.</T>
                    </span>
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-cream/70">
                    <T>Your Egypt trip deserves an unforgettable ending.</T>
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition group-hover:bg-gold-light sm:self-auto">
                  <T>Explore the experiences</T>
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          </CampaignPromoTracker>
        </Reveal>
      </Container>
    </section>
  );
}
