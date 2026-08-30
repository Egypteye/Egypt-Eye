import Image from "next/image";
import type { SanityImage as SanityImageType } from "@/content/types";
import { urlForImage } from "@/sanity/image";
import { PlaceholderImage } from "./PlaceholderImage";
import type { ImageTone } from "@/content/types";

// Renders a real uploaded photo (from Sanity) when one exists; otherwise
// falls back to the gradient placeholder. This is the single place that
// decides "real photo vs. placeholder" so every card/hero stays in sync
// automatically as real photos get uploaded in the CMS.
export function SmartImage({
  image,
  tone,
  label,
  alt = "",
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  image?: SanityImageType;
  tone: ImageTone | string;
  label?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  // Must match how large the image actually renders — this is what Next.js
  // uses to pick which source resolution to serve. The default is
  // calibrated for a grid card (TourCard/StoryCard/PhotoshootCard/etc. all
  // rely on it as-is — they render 2-4 per row on desktop, never full-bleed);
  // full-bleed banners/heroes (`absolute inset-0` at 100vw) MUST pass
  // sizes="100vw" or they get served an undersized image stretched across
  // the whole screen, which looks blurry/low-quality even though the
  // original upload is perfectly sharp. Getting this wrong in either
  // direction either blurs a hero or silently balloons data transfer
  // (a card rendered at ~300px fetching a 50vw-wide image on a wide
  // desktop monitor can be 3-4x the bytes it actually needs).
  sizes?: string;
}) {
  const src = urlForImage(image)?.url();

  if (src) {
    // Match PlaceholderImage's own fix: don't force `relative` when the
    // caller already passed a position utility (e.g. `absolute inset-0`
    // for full-bleed heroes) — both classes targeting `position` at once
    // silently drops one of them and collapses the element to zero height.
    const hasPositionOverride = /\b(absolute|fixed|sticky|static)\b/.test(className);
    return (
      <div className={`${hasPositionOverride ? "" : "relative"} overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes={sizes}
        />
        {label && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/30 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
            {label}
          </span>
        )}
      </div>
    );
  }

  return <PlaceholderImage tone={tone} label={label} className={className} />;
}
