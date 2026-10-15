"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/booking/quote";

// The four things a customer can do with a product, in one place and in a
// deliberate order.
//
// The hierarchy is the point. Buying is the primary action when buying is
// possible; when it is not — which is every oil in the Boutique today, see
// docs/oils-research.md — asking becomes primary rather than a buy button
// being faked. Only one action is ever gold, so a page never shouts four
// times at once.
//
// Booking a visit sits third because it is the right answer for fragrance
// specifically ("no description of a fragrance survives contact with your own
// nose") and nonsense for a pendant, so the page decides whether to offer it.

export function ProductActions({
  productSlug,
  productName,
  categorySlug,
  productPath,
  variants,
  unitCents,
  offersVisit,
}: {
  productSlug: string;
  productName: string;
  categorySlug: string;
  productPath: string;
  variants: string[];
  /** null when the product has no confirmed price, which means no buy button. */
  unitCents: number | null;
  offersVisit: boolean;
}) {
  const [variant, setVariant] = useState(variants[0] ?? "");
  const buyable = unitCents !== null && unitCents > 0;

  // The enquiry lives on the category page and already identifies the piece.
  // Carrying the product and the chosen size in the URL means the customer
  // does not retype what they just chose, and the team email says which
  // bottle without anyone having to ask.
  const enquiryHref =
    `/boutique/${categorySlug}#request?product=${encodeURIComponent(productSlug)}` +
    (variant ? `&size=${encodeURIComponent(variant)}` : "");

  return (
    <div data-product-actions className="flex flex-col gap-4">
      {variants.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-ink">Size</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={variant === v}
                onClick={() => setVariant(v)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  variant === v
                    ? "border-gold/60 bg-gold/15 text-ink"
                    : "border-black/10 bg-cream text-ink-soft hover:border-gold/30"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {buyable ? (
        <Link
          href={`/boutique/${categorySlug}#request`}
          className="rounded-full bg-gold px-7 py-3.5 text-center text-sm font-semibold text-ink shadow-md shadow-gold/25 transition hover:bg-gold-light"
        >
          Buy now — {formatCents(unitCents!)}, collected in Egypt
        </Link>
      ) : (
        <Link
          href={enquiryHref}
          className="rounded-full bg-gold px-7 py-3.5 text-center text-sm font-semibold text-ink shadow-md shadow-gold/25 transition hover:bg-gold-light"
        >
          Enquire about {productName}
        </Link>
      )}

      {buyable && (
        <Link
          href={enquiryHref}
          className="rounded-full border border-gold/50 px-7 py-3.5 text-center text-sm font-semibold text-ink transition hover:bg-gold/10"
        >
          Enquire about this one
        </Link>
      )}

      {offersVisit && (
        <Link
          href={`/boutique/${categorySlug}#visit`}
          className="rounded-full border border-black/10 px-7 py-3.5 text-center text-sm font-semibold text-ink-soft transition hover:border-gold/30 hover:text-ink"
        >
          Book a private shop visit
        </Link>
      )}

      {!buyable && (
        <p className="text-xs leading-relaxed text-ink-soft/85">
          We are still confirming the bottle sizes and the price on this one with the shop. Ask us and we
          will come back with both — nothing is charged in the meantime.
        </p>
      )}

      <p className="sr-only">{productPath}</p>
    </div>
  );
}
