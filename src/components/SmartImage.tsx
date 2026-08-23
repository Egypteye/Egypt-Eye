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
}: {
  image?: SanityImageType;
  tone: ImageTone | string;
  label?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
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
          sizes="(max-width: 768px) 100vw, 50vw"
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
