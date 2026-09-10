import Link from "next/link";
import type { Tour } from "@/content/types";
import { SmartImage } from "./SmartImage";
import { Rating, hasProductReviews } from "./Rating";
import { PriceTag } from "./PriceTag";
import { Badge } from "./Badge";
import { AddToJourneyButton } from "./AddToJourneyButton";
import { PhysicalLevelChip } from "./PhysicalLevelBar";

export function TourCard({ tour }: { tour: Tour }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:shadow-lg hover:shadow-black/5">
      <Link href={`/tours/${tour.slug}`} className="absolute inset-0 z-10" aria-label={tour.title} />
      <SmartImage
        image={tour.image}
        tone={tour.imageTone}
        alt={tour.title}
        label={tour.destinations.join(" · ")}
        className="h-52 w-full transition duration-500 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {tour.badge && <Badge>{tour.badge}</Badge>}
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">
          {tour.title}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-soft/70">{tour.tagline}</p>
        {/* Duration, effort, rating — the three things worth knowing before
            opening the tour. Wraps rather than crushes on a narrow card. */}
        {/* Duration and reviews share a line; the physical level gets its own
            below them. Three of these abreast crowded the card and pushed the
            rating hard against the edge on a phone. */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-2">
          <span className="text-sm text-ink-soft/70">{tour.duration}</span>
          {hasProductReviews(tour.rating) && <Rating rating={tour.rating} />}
        </div>
        {tour.physicalLevel && <PhysicalLevelChip level={tour.physicalLevel} />}
        <div className="relative z-20">
          <AddToJourneyButton
            type="tour"
            slug={tour.slug}
            title={tour.title}
            subtitle={tour.duration}
            suggestions={tour.relatedExperiences?.map((e) => ({
              type: "experience" as const,
              slug: e.slug,
              title: e.title,
              subtitle: e.duration,
            }))}
          />
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-3">
          <PriceTag price={tour.price} />
          <span className="text-sm font-semibold text-gold-dark transition group-hover:translate-x-1">
            View tour →
          </span>
        </div>
      </div>
    </div>
  );
}
