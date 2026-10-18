import {
  type EnquiryDraft,
  flyingDressEnquiry,
  mailtoHref,
  whatsappHref,
} from "@/content/flyingDresses";

/**
 * TWO WAYS TO ASK, BESIDE EVERY ITEM.
 *
 * The owner's instruction was "add enquire with mail or whatsapp on every
 * item", and the reason is visible in the analytics of any site built the way
 * this one was: the ways to make contact were gathered at the bottom of the
 * page and on the phone's bar. A visitor who had just read about ONE package,
 * one hire service or one experience, and decided on it, had to scroll away
 * from the thing they had decided on — and whichever route they then took
 * arrived carrying nothing about it.
 *
 * So this takes the draft, not a page. Both links are prefilled with the same
 * enquiry — the same shape the WhatsApp bar and the booking rail build — so
 * one item produces one message whichever of the two a visitor reaches for,
 * and we are never answering "which one did you mean".
 *
 * WHAT IT IS NOT. It is not a booking, a hold or a confirmation, and neither
 * link says it is: an email and a WhatsApp message are both the start of a
 * conversation. It also does not replace any page's existing form link — the
 * form is still the better route for us and is still there; this is the
 * alternative for someone who would rather write.
 */
export function ItemActions({
  draft,
  /** Hidden label for screen readers, naming what these two actions concern. */
  label,
}: {
  draft: EnquiryDraft;
  label: string;
}) {
  return (
    <div className="fd-actions fd-item-actions">
      <a className="fd-btn fd-btn-ghost fd-btn-sm" href={mailtoHref(draft)}>
        Enquire by email
        <span className="fd-sr"> about {label}</span>
      </a>
      <a
        className="fd-btn fd-btn-ghost fd-btn-sm"
        href={whatsappHref(flyingDressEnquiry(draft))}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
        <span className="fd-sr"> about {label} (opens in a new tab)</span>
      </a>
    </div>
  );
}
