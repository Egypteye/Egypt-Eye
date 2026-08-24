import Link from "next/link";
import type { Testimonial } from "@/content/types";
import { TestimonialCard } from "./TestimonialCard";

// Speed scales with the number of cards (~7.5s per card, matching the pace
// a small hand-picked set had at the old fixed 40s duration) so adding more
// reviews in the CMS never makes the strip fly by faster than before.
const SECONDS_PER_CARD = 7.5;
const MIN_DURATION_S = 32;

export function ReviewsMarquee({ testimonials, href }: { testimonials: Testimonial[]; href?: string }) {
  // Duplicate the list once so the CSS marquee (-50%) loops seamlessly.
  const loop = [...testimonials, ...testimonials];
  const duration = Math.max(MIN_DURATION_S, Math.round(testimonials.length * SECONDS_PER_CARD));

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
    <Link href={href} aria-label="Read more traveler stories" className="block cursor-pointer">
      {track}
    </Link>
  );
}
