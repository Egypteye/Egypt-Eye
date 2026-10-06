"use client";

import { useTr } from "@/i18n/LocaleProvider";
import { isInstantBookable, type QuotableProduct } from "@/lib/booking/quote";

// The Instant Booking badge, in one place so it cannot say different things
// in different rooms.
//
// A client component, like PriceTag and for the same reason: it sits inside
// PhotoshootCard and ExperienceCard, which are client components. Translating
// through the server-side <T> pulled next/root-params into the browser bundle
// and failed the build outright — useTr() is the client-side equivalent.
//
// Two rules, and the second is the one that matters:
//
// 1. One wording and one treatment everywhere. A badge that reads "Instant
//    Booking" on a card and "Book online" on the detail page is two features
//    as far as a customer is concerned.
//
// 2. It is never passed a boolean. It takes the product and asks
//    isInstantBookable() itself, which is the same function the product page,
//    the booking route and the quote engine ask. Passing a flag in would let a
//    card be told `instant` by something that worked it out differently —
//    which is exactly how this codebase has shipped the same bug four times:
//    a page deciding one way and the route another. Turning the switch off in
//    the Studio, or clearing the price, removes the badge everywhere at once
//    because there is only one place that decides.

/** Where the badge is sitting, which is all that changes about it. */
type Placement =
  /** Over a card's photo — needs its own background to stay legible. */
  | "overlay"
  /** In a row of text on a detail page. */
  | "inline";

export function InstantBookingBadge({
  product,
  placement = "inline",
  className = "",
}: {
  product: QuotableProduct;
  placement?: Placement;
  className?: string;
}) {
  const tr = useTr();
  // Asked here, not by the caller. See the note above.
  if (!isInstantBookable(product)) return null;

  const base =
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold uppercase tracking-[0.12em]";
  const tone =
    placement === "overlay"
      ? "bg-ink/80 px-2.5 py-1 text-[10px] text-gold-light backdrop-blur-sm"
      : "bg-gold/15 px-2.5 py-1 text-[11px] text-gold-dark";

  return (
    <span className={`${base} ${tone} ${className}`}>
      {/* A lightning bolt rather than a clock: the promise is that the
          booking completes now, not that the trip happens now. */}
      <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden>
        <path d="M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z" />
      </svg>
      {tr("Instant Booking")}
    </span>
  );
}
