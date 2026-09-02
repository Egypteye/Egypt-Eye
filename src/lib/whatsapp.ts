// Shared message-building for every WhatsApp link on the site — the
// equivalent, for WhatsApp, of what EnquiryModal.tsx collects for email.
//
// A wa.me link's `?text=` parameter only pre-fills WhatsApp's compose box —
// the customer can still edit or delete it before hitting send, same as any
// other pre-filled form field. That's why this is worth doing: without it,
// "Book on WhatsApp" opened a blank chat and the reservations team had no
// idea what the customer was even looking at when they clicked.

export type WhatsAppMessageContext = {
  /**
   * Where on the site this button lives, in a form that reads naturally
   * after "I clicked this button on ___" — e.g. "this tour's page", "the
   * homepage". Always included; this is the one field every button has.
   */
  page: string;
  /** The tour/experience/photoshoot/property this button is about, if any. */
  item?: string;
  /** A specific room or product variant within `item`, if applicable. */
  variant?: string;
  /** An active offer or package this enquiry references, if applicable. */
  offer?: string;
  /**
   * The opening line. Defaults to a reservation enquiry — pass something
   * like "Hi, I have a question about my trip." for a support/help context
   * instead of a booking one.
   */
  intro?: string;
};

const DEFAULT_INTRO = "Hi, I'd like to make a reservation.";

export function buildWhatsAppMessage({ page, item, variant, offer, intro = DEFAULT_INTRO }: WhatsAppMessageContext): string {
  const sentences = [intro];

  if (item) {
    sentences.push(variant ? `I'm enquiring about the ${variant} for ${item}.` : `I'm enquiring about ${item}.`);
  }
  if (offer) {
    sentences.push(`I'm interested in the ${offer}.`);
  }
  sentences.push(`I clicked this button on ${page}.`);

  return sentences.join(" ");
}

// `baseLink` is a plain https://wa.me/<number> URL with no query string on
// this site today, but built defensively in case one is ever added upstream.
export function whatsappHref(baseLink: string, context: WhatsAppMessageContext): string {
  const separator = baseLink.includes("?") ? "&" : "?";
  return `${baseLink}${separator}text=${encodeURIComponent(buildWhatsAppMessage(context))}`;
}
