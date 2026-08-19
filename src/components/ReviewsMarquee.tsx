import type { Testimonial } from "@/content/types";
import { TestimonialCard } from "./TestimonialCard";

export function ReviewsMarquee({ testimonials }: { testimonials: Testimonial[] }) {
  // Duplicate the list once so the CSS marquee (-50%) loops seamlessly.
  const loop = [...testimonials, ...testimonials];

  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]">
        {loop.map((t, i) => (
          <div key={`${t.name}-${i}`} className="w-[320px] shrink-0 sm:w-[360px]">
            <TestimonialCard testimonial={t} />
          </div>
        ))}
      </div>
    </div>
  );
}
