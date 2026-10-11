import { SmartImage } from "@/components/SmartImage";
import {
  OUTFIT_INCLUDED_NOTE,
  OUTFIT_PREFERENCE_NOTE,
  mensOutfits,
  womensDresses,
  type Outfit,
} from "@/lib/booking/outfits";
import type { ImageTone } from "@/content/types";

// The collection, shown on the product page so somebody deciding whether to
// book can see what they would wear before they commit to anything.
//
// A SERVER component, deliberately. It is a gallery, not a control: the
// actual choosing happens inside the booking sheet where it can be recorded
// against a booking. Keeping this one server-rendered means the page ships no
// extra JavaScript for it, the photographs are optimised through next/image
// like every other picture on the site, and the dress names are in the HTML
// where search engines and screen readers can read them.
//
// Renders nothing at all when a product has no collection, which is every
// product that dresses nobody. That is why adding this to the shared page
// template changed nothing for a horse shoot or a tour.

export function OutfitCollection({
  outfits,
  tone,
  headingId = "outfit-collection",
}: {
  outfits?: readonly Outfit[];
  tone: ImageTone | string;
  headingId?: string;
}) {
  const dresses = womensDresses(outfits ?? []);
  const mens = mensOutfits(outfits ?? []);
  if (dresses.length === 0 && mens.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id={headingId} className="font-display text-2xl font-semibold text-ink">
          Choose what you&rsquo;ll wear
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          {OUTFIT_INCLUDED_NOTE} You pick yours while you book, and{" "}
          {OUTFIT_PREFERENCE_NOTE.charAt(0).toLowerCase() + OUTFIT_PREFERENCE_NOTE.slice(1)}
        </p>
      </div>

      {dresses.length > 0 && (
        <OutfitGroup
          title="Flying dresses"
          count={dresses.length}
          outfits={dresses}
          tone={tone}
        />
      )}

      {/* Only when the business has actually loaded men's outfits. An empty
          heading over an empty grid would advertise a wardrobe that may not
          exist. */}
      {mens.length > 0 && (
        <OutfitGroup title="Men\u2019s outfits" count={mens.length} outfits={mens} tone={tone} />
      )}
    </section>
  );
}

function OutfitGroup({
  title,
  count,
  outfits,
  tone,
}: {
  title: string;
  count: number;
  outfits: readonly Outfit[];
  tone: ImageTone | string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
        {title} <span className="text-ink/40">({count})</span>
      </h3>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {outfits.map((outfit) => (
          <li key={outfit.id} className="flex flex-col gap-1.5">
            <div className="overflow-hidden rounded-xl border border-black/5 bg-cream">
              {outfit.image ? (
                <div className="aspect-[3/4]">
                  <SmartImage
                    image={outfit.image}
                    tone={tone}
                    alt={`${outfit.name} flying dress`}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                </div>
              ) : (
                // No photograph yet. The swatch is an approximation of the
                // colour NAME, not a measurement of the fabric, and it says so
                // rather than letting a flat circle stand in for a garment.
                <div
                  className="flex aspect-[3/4] items-end justify-center p-2"
                  style={{ backgroundColor: outfit.hex ?? "#e9e4da" }}
                >
                  <span className="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                    photo coming soon
                  </span>
                </div>
              )}
            </div>
            <p className="text-center text-xs font-medium text-ink">{outfit.name}</p>
            {outfit.note && <p className="text-center text-[11px] text-ink-soft">{outfit.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
