import Link from "next/link";
import type { Tour } from "@/content/types";
import { SmartImage } from "./SmartImage";
import { PriceTag } from "./PriceTag";
import { Badge } from "./Badge";
import { AddToJourneyButton } from "./AddToJourneyButton";
import { PhysicalLevelChip } from "./PhysicalLevelBar";
import { ExperienceRatingLink } from "./ExperienceRatingLink";

// destinationLabels/viewTourLabel are optional, pre-translated lookups
// passed down from the server page (via contentDictionary()/tr()) rather
// than looked up here — this card renders inside both server and client
// trees, so it stays a plain function component with no i18n hooks of its
// own. Falling back to the raw English keeps it safe to call without them.
export function TourCard({
  tour,
  destinationLabels,
  viewTourLabel = "View tour →",
}: {
  tour: Tour;
  destinationLabels?: Record<string, string>;
  viewTourLabel?: string;
}) {
  const destinations = destinationLabels
    ? tour.destinations.map((d) => destinationLabels[d] ?? d)
    : tour.destinations;
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:shadow-lg hover:shadow-black/5">
      <Link href={`/tours/${tour.slug}`} className="absolute inset-0 z-10" aria-label={tour.title} />
      <SmartImage
        image={tour.image}
        tone={tour.imageTone}
        alt={tour.title}
        label={destinations.join(" · ")}
        className="h-52 w-full transition duration-500 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {tour.badge && <Badge>{tour.badge}</Badge>}
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">
          {tour.title}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-soft/70">{tour.tagline}</p>
        {/* Duration and, where reviews exist, the star that opens them. */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-2">
          <span className="text-sm text-ink-soft/70">{tour.duration}</span>
          <ExperienceRatingLink type="tour" slug={tour.slug} />
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
            {viewTourLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
