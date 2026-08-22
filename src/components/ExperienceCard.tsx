import Link from "next/link";
import type { Experience } from "@/content/types";
import { SmartImage } from "./SmartImage";
import { Rating } from "./Rating";
import { PriceTag } from "./PriceTag";

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:shadow-lg hover:shadow-black/5"
    >
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
        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-3">
          <PriceTag price={experience.price} />
          <Rating rating={experience.rating} />
        </div>
      </div>
    </Link>
  );
}
