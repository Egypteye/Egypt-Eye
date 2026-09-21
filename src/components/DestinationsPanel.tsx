import Link from "next/link";
import type { SanityImage } from "@/content/types";
import { SmartImage } from "./SmartImage";
import type { Destination, Tour } from "@/content/types";
import { trAll } from "@/i18n/T";

export async function DestinationsPanel({
  photos,
  tours,
  destinations,
}: {
  photos: readonly { name?: string; image?: SanityImage }[];
  tours: Tour[];
  destinations: readonly Destination[];
}) {
  const ui = await trAll(["{n}+ day", "{n}+ days"]);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {destinations.map((d) => {
        // Prefer an explicit override from Site Settings > Destinations panel
        // photos; otherwise reuse the linked tour's own photo, so uploading a
        // photo once on the Tour is enough — no separate upload required.
        const image =
          photos.find((p) => p.name === d.name)?.image ??
          tours.find((t) => t.slug === d.tourSlug)?.image;

        return (
          <Link
            key={d.name}
            href={`/tours/${d.tourSlug}`}
            className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl"
          >
            <SmartImage
              image={image}
              tone={d.tone}
              alt={d.name}
              className="absolute inset-0 transition duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="relative p-4">
              <p className="font-display text-base font-semibold text-cream sm:text-lg">
                {d.name}
              </p>
              <p className="text-xs text-cream/70">{(d.days > 1 ? ui["{n}+ days"] : ui["{n}+ day"]).replace("{n}", String(d.days))}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
