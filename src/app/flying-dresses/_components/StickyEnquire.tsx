"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  flyingDressEnquiry,
  packages,
  rentalServices,
  whatsappHref,
} from "@/content/flyingDresses";
import { fdPath } from "../_lib/seo";

/**
 * The phone-only action bar.
 *
 * Present because the two things a visitor on a phone wants are always the
 * same and are otherwise a scroll away: start a conversation, or open the
 * form. It is CSS-hidden above 48rem rather than conditionally rendered, so
 * there is no layout shift and no hydration mismatch on resize.
 *
 * It is deliberately slim — `fd-btn-sm` rather than the page's full-size
 * button, because at the default 48px height with 28px of side padding the
 * two of them filled a third of a phone screen, which is what the owner
 * reported. It carries no close button (two taps, no dismissal
 * state to persist), and the layout reserves space for it via
 * `.fd-has-sticky-cta` so it never covers the footer or the last field of the
 * enquiry form. The brief's warning about a persistent bar obscuring form
 * fields is the failure this guards against.
 *
 * =========================================================================
 * WHY IT READS THE ROUTE
 * =========================================================================
 * It used to send the same empty enquiry from every page. So a visitor who had
 * read the whole Fayoum page, decided, and tapped the one button in front of
 * them arrived at a blank form and had to tell us the thing they had just
 * spent five minutes choosing. On a phone, where this bar is the ONLY visible
 * call to action, that was the most-used enquiry path on the site throwing
 * away everything it knew.
 *
 * It lives in the layout, so no page can hand it a prop; the route is the only
 * thing it can read. The slug is resolved against the catalogue rather than
 * interpolated, exactly as /enquire does with its query string, so a renamed
 * or retired product degrades to the generic enquiry instead of producing a
 * link to a package that does not exist.
 */
export function StickyEnquire() {
  const pathname = usePathname() ?? "";

  const pkg = packages.find((p) => pathname.endsWith(`/experiences/${p.slug}`));
  const service = rentalServices.find((s) => pathname.endsWith(`/rentals/${s.slug}`));

  const enquiryHref = pkg
    ? fdPath(`/enquire?package=${pkg.slug}`)
    : service
      ? fdPath(`/enquire?service=${service.slug}`)
      : fdPath("/enquire");

  // The same draft shape BookingRail builds, so one shoot produces one message
  // whichever button the visitor happens to reach first.
  const whatsappMessage = pkg
    ? flyingDressEnquiry({ subject: pkg.title, location: pkg.name })
    : service
      ? flyingDressEnquiry({ subject: service.title })
      : flyingDressEnquiry();

  return (
    <div className="fd-sticky-cta">
      <a
        className="fd-btn fd-btn-ghost fd-btn-sm"
        style={{ flex: 1 }}
        href={whatsappHref(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
        <span className="fd-sr">, message us (opens in a new tab)</span>
      </a>
      <Link className="fd-btn fd-btn-sm" style={{ flex: 1 }} href={enquiryHref}>
        Enquire
      </Link>
    </div>
  );
}
