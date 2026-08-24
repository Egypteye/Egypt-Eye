import Link from "next/link";
import type { Experience } from "@/content/types";
import { SmartImage } from "./SmartImage";
import { Rating } from "./Rating";
import { PriceTag } from "./PriceTag";
import { AddToJourneyButton } from "./AddToJourneyButton";

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:shadow-lg hover:shadow-black/5">
      <Link
        href={`/experiences/${experience.slug}`}
        className="absolute inset-0 z-10"
        aria-label={experience.title}
      />
      <SmartImage
        image={experience.image}
        tone={experience.imageTone}
        alt={experience.title}
        label={experience.duration}
        className="h-44 w-full transition duration-500 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">
          {experience.title}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-soft/70">
          {experience.description}
        </p>
        <div className="relative z-20">
          <AddToJourneyButton
            type="experience"
            slug={experience.slug}
            title={experience.title}
            subtitle={experience.duration}
            suggestions={experience.relatedTours?.map((t) => ({
              type: "tour" as const,
              slug: t.slug,
              title: t.title,
              subtitle: t.duration,
            }))}
          />
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-3">
          <PriceTag price={experience.price} />
          <Rating rating={experience.rating} />
        </div>
      </div>
    </div>
  );
}
