import Link from "next/link";
import { flyingDressEnquiry, whatsappHref } from "@/content/flyingDresses";
import { fdPath } from "../_lib/seo";

/**
 * The phone-only action bar.
 *
 * Present because the two things a visitor on a phone wants are always the
 * same and are otherwise a scroll away: start a conversation, or open the
 * form. It is CSS-hidden above 48rem rather than conditionally rendered, so
 * there is no layout shift and no hydration mismatch on resize.
 *
 * It is deliberately slim, it carries no close button (two taps, no dismissal
 * state to persist), and the layout reserves space for it via
 * `.fd-has-sticky-cta` so it never covers the footer or the last field of the
 * enquiry form. The brief's warning about a persistent bar obscuring form
 * fields is the failure this guards against.
 */
export function StickyEnquire() {
  return (
    <div className="fd-sticky-cta">
      <a
        className="fd-btn fd-btn-ghost"
        style={{ flex: 1 }}
        href={whatsappHref(flyingDressEnquiry())}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
        <span className="fd-sr"> — message us (opens in a new tab)</span>
      </a>
      <Link className="fd-btn" style={{ flex: 1 }} href={fdPath("/enquire")}>
        Enquire
      </Link>
    </div>
  );
}
