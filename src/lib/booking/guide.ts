// The optional Egyptologist tour guide.
//
// Pure and free of `server-only` on purpose: the price, the eligibility rule
// and the language handling all have to be readable by scripts/check-booking
// without a browser or a database. The same reason paypalBody.ts and
// breakdown.ts sit where they do.
//
// THE PRICE LIVES HERE AND NOWHERE ELSE. It is deliberately NOT a per-product
// extra typed into each Studio document: forty dollars repeated across a
// dozen products is forty dollars that will eventually disagree with itself,
// and an editor who changes one has no way of knowing about the others. The
// quote reads it from this constant, server side, and the browser never sends
// a price — the same rule the deposit and the extras already follow.
//
// ONCE PER BOOKING, NOT PER GUEST. One guide walks the group. The quote
// forces the quantity to 1 no matter what arrives in the request, which is
// why this is a flag on the line rather than an ordinary extra with a
// stepper.

/** What the line is called everywhere a customer or the team sees it. */
export const GUIDE_LABEL = "Egyptologist Tour Guide";

/** The fee, once per booking. The single authority. */
export const GUIDE_PRICE_USD = 40;

/** The language offered without a caveat, because the guides speak it. */
export const DEFAULT_GUIDE_LANGUAGE = "English";

/** Long enough for "Brazilian Portuguese", short enough not to be an essay. */
export const MAX_LANGUAGE_LENGTH = 60;

/**
 * The products that offer a guide.
 *
 * An explicit list rather than a rule over product type, because the honest
 * answer is per product and a type-wide rule gets it wrong in both
 * directions. An Egyptologist is worth having beside you on the Giza plateau,
 * where there is five thousand years of masonry to explain. They are not
 * worth having at a marriage proposal, on a dinner cruise, on a quiet felucca
 * sail, on a food tour, or standing next to a flying-dress photoshoot — all
 * of which are instant-bookable today and none of which are on this list.
 *
 * This is a commercial judgement, not a technical one, and the owner should
 * confirm it. Adding a product is one line; nothing else needs to change.
 */
export const GUIDE_ELIGIBLE_SLUGS: readonly string[] = [
  // Confirmed by the owner, 19 October 2026. The common thread is the Giza
  // plateau: every one of these puts the customer in front of the Pyramids,
  // where an Egyptologist has something to add. The photoshoots qualify for
  // the same reason the camel ride does — people stand on the site for an
  // hour or more and ask what they are looking at.
  "camel-ride-giza-pyramids",
  "atv-quad-bikes-sahara",
  "exclusive-pyramids-photoshoot",
  "jumping-horse-photoshoot",
  "running-horse-video-jumping-horse-photoshoot",
];

/** Whether this product offers the guide at all. */
export function guideEligible(productSlug: string): boolean {
  return GUIDE_ELIGIBLE_SLUGS.includes(productSlug);
}

/**
 * Where a language request stands.
 *
 * `included` — English, which the guides speak, so nothing to confirm.
 * `requested` — another language, which is a REQUEST and not a promise. The
 *               team confirms it or offers English back.
 * `none` — no guide on this booking.
 */
export type GuideStatus = "none" | "included" | "requested";

export type GuideSelection = {
  selected: boolean;
  /** The language to deliver in. Empty only when no guide was taken. */
  language: string;
  /** True when the customer asked for something other than English. */
  isRequest: boolean;
  status: GuideStatus;
};

export const NO_GUIDE: GuideSelection = {
  selected: false,
  language: "",
  isRequest: false,
  status: "none",
};

/** Strips control characters and collapses whitespace in a typed language. */
function cleanLanguage(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_LANGUAGE_LENGTH);
}

/**
 * What the browser sent about the guide, reduced to something trustworthy.
 *
 * Carries no price and never has: the request says whether a guide was taken
 * and in what language, and the quote decides what that costs.
 *
 * A request that asks for another language but names none falls back to
 * English rather than being stored as a request. A request for a language
 * nobody typed is not something the team can confirm or decline — it would
 * sit in the queue meaning nothing. The form requires the field when
 * "another language" is chosen, so reaching this is a crafted or broken
 * request rather than a customer's real choice.
 */
export function readGuideSelection(raw: unknown): GuideSelection {
  if (!raw || typeof raw !== "object") return NO_GUIDE;
  const value = raw as { selected?: unknown; language?: unknown; otherLanguage?: unknown };
  if (value.selected !== true) return NO_GUIDE;

  const wantsOther = value.language === "other";
  const typed = cleanLanguage(value.otherLanguage);

  if (wantsOther && typed !== "" && typed.toLowerCase() !== DEFAULT_GUIDE_LANGUAGE.toLowerCase()) {
    return { selected: true, language: typed, isRequest: true, status: "requested" };
  }
  return { selected: true, language: DEFAULT_GUIDE_LANGUAGE, isRequest: false, status: "included" };
}

/** One line for an email or an admin row. Empty string when no guide. */
export function describeGuide(guide: GuideSelection): string {
  if (!guide.selected) return "";
  return guide.isRequest
    ? `${GUIDE_LABEL} — ${guide.language} requested (to be confirmed; English is available)`
    : `${GUIDE_LABEL} — ${guide.language}`;
}
