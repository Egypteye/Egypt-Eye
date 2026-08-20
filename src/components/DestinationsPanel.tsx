import Link from "next/link";
import type { Image as SanityImage } from "sanity";
import { destinations } from "@/content/destinations";
import { SmartImage } from "./SmartImage";

export function DestinationsPanel({
  photos,
}: {
  photos: readonly { name?: string; image?: SanityImage }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {destinations.map((d) => (
        <Link
          key={d.name}
          href={`/tours/${d.tourSlug}`}
          className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl"
        >
          <SmartImage
            image={photos.find((p) => p.name === d.name)?.image}
            tone={d.tone}
            alt={d.name}
            className="absolute inset-0 transition duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="relative p-4">
            <p className="font-display text-base font-semibold text-cream sm:text-lg">
              {d.name}
            </p>
            <p className="text-xs text-cream/70">{d.days}+ day{d.days > 1 ? "s" : ""}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
