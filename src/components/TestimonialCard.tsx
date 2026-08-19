import type { Testimonial } from "@/content/types";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col justify-between rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
      <svg
        viewBox="0 0 32 24"
        className="h-7 w-7 text-gold/40"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0 24V14.4C0 6.4 4.8 1.2 12.8 0l1.6 3.2C9.6 4.8 7.2 8 7.2 11.6h6.4V24H0Zm17.6 0V14.4c0-8 4.8-13.2 12.8-14.4l1.6 3.2c-4.8 1.6-7.2 4.8-7.2 8.4h6.4V24H17.6Z" />
      </svg>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-soft/85">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-5 border-t border-black/5 pt-4">
        <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
        {testimonial.context && (
          <p className="text-xs text-ink-soft/60">{testimonial.context}</p>
        )}
      </figcaption>
    </figure>
  );
}
