import Link from "next/link";
import type { Testimonial } from "@/content/types";
import { TestimonialCard } from "./TestimonialCard";
import { trAll } from "@/i18n/T";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";

// How many reviews the strip actually puts in the page.
//
// This cap is the whole point of this component's existence, so it is the
// first thing in the file.
//
// It used to render every testimonial, twice. That was right when it was
// written — the comment below still says "a small hand-picked set" — and it
// stopped being right as real reviews accumulated. By October 2026 the CMS
// held about 2,600 of them, so the homepage shipped roughly 5,200 review
// cards: 18.4 MB of HTML, 1.4 MB of it over the wire after compression, and
// 5,184 interactive elements in the DOM. The next largest page on the site
// was 341 KB. Nobody changed this component; the content grew into it.
//
// Two things were wrong at once, and the second is the one you can see:
// duration was `count * SECONDS_PER_CARD`, so at 2,600 reviews one loop took
// about five and a half hours and the strip looked frozen.
//
// A marquee shows about four cards at a time on a wide screen. Fourteen is
// comfortably more than one screenful, so the loop never visibly repeats,
// and it is 0.5% of the DOM the old version built. The full set is not
// hidden — the strip links to /testimonials, which pages through all of
// them. No review is rewritten, dropped from the site, or re-ordered to
// flatter: this is how many are drawn in a scrolling strip, nothing else.
const MARQUEE_CARDS = 14;

// Speed scales with the number of cards (~7.5s per card, matching the pace
// a small hand-picked set had at the old fixed 40s duration) so the strip
// keeps the pace it was designed around. Now that the card count is capped
// this is effectively a constant, which is the point: the animation speed
// is a design decision and should not be a side effect of how many reviews
// the business has collected.
const SECONDS_PER_CARD = 7.5;
const MIN_DURATION_S = 32;

export async function ReviewsMarquee({ testimonials, href }: { testimonials: Testimonial[]; href?: string }) {
  const ui = await trAll([
    "Read more traveler stories",
  ]);
  // Localised here rather than by the caller: a raw href drops a French or
  // Arabic visitor onto the English reviews page, and this strip is the main
  // route into reviews from the homepage.
  const locale = await getLocale();

  // Take a screenful or two, then duplicate that once so the CSS marquee
  // (-50%) loops seamlessly. Both the slice and the duration are computed
  // from the capped list, so neither the payload nor the speed moves when
  // the review count does.
  const shown = testimonials.slice(0, MARQUEE_CARDS);
  const loop = [...shown, ...shown];
  const duration = Math.max(MIN_DURATION_S, Math.round(shown.length * SECONDS_PER_CARD));

  const track = (
    <div className="group overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div
        className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((t, i) => (
          <div key={`${t.name}-${i}`} className="w-[320px] shrink-0 sm:w-[360px]">
            <TestimonialCard testimonial={t} />
          </div>
        ))}
      </div>
    </div>
  );

  if (!href) return track;

  return (
    <Link href={localePath(href, locale)} aria-label={ui["Read more traveler stories"]} className="block cursor-pointer">
      {track}
    </Link>
  );
}
