import Link from "next/link";
import type { Tour } from "@/content/types";
import { PlaceholderImage } from "./PlaceholderImage";
import { Rating } from "./Rating";
import { PriceTag } from "./PriceTag";
import { Badge } from "./Badge";

export function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
    >
      <PlaceholderImage
        tone={tour.imageTone}
        label={tour.destinations.join(" · ")}
        className="h-52 w-full transition duration-500 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {tour.badge && <Badge>{tour.badge}</Badge>}
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">
          {tour.title}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-soft/70">{tour.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm text-ink-soft/70">{tour.duration}</span>
          <Rating rating={tour.rating} />
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-3">
          <PriceTag price={tour.price} />
          <span className="text-sm font-semibold text-gold-dark transition group-hover:translate-x-1">
            View tour →
          </span>
        </div>
      </div>
    </Link>
  );
}
