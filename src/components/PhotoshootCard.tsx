import Link from "next/link";
import type { Photoshoot } from "@/content/types";
import { SmartImage } from "./SmartImage";
import { Rating } from "./Rating";
import { PriceTag } from "./PriceTag";

export function PhotoshootCard({ photoshoot }: { photoshoot: Photoshoot }) {
  return (
    <Link
      href={`/photoshoots/${photoshoot.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 sm:grid-cols-2"
    >
      <SmartImage
        image={photoshoot.image}
        tone={photoshoot.imageTone}
        alt={photoshoot.title}
        label={photoshoot.locations[0]}
        className="h-56 w-full transition duration-500 group-hover:scale-105 sm:h-full"
      />
      <div className="flex flex-col gap-3 p-6">
        <h3 className="font-display text-xl font-semibold text-ink">
          {photoshoot.title}
        </h3>
        <p className="text-sm text-ink-soft/70">{photoshoot.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {photoshoot.goodFor.slice(0, 3).map((g) => (
            <span
              key={g}
              className="rounded-full bg-sand-dim px-2.5 py-1 text-xs font-medium text-ink-soft/70"
            >
              {g}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-3">
          <PriceTag price={photoshoot.price} />
          <Rating rating={photoshoot.rating} />
        </div>
      </div>
    </Link>
  );
}
