/**
 * Where Egypt Eye's Google reviews live, and where travellers go to write one.
 *
 * Repo-only on purpose. Sanity wins wholesale over a content file (CLAUDE.md
 * #3), and the one thing on this page that must never resolve to undefined is
 * the link the whole page exists to send people to. A Studio document that
 * predates this field would project null over it and the primary button would
 * point nowhere.
 */

/**
 * The owner's existing Google review link, already in use in WhatsApp
 * follow-ups. It is a `g.page/r/<CID>/review` short link.
 *
 * KEPT RATHER THAN REPLACED, deliberately. Google's own Places API (New)
 * exposes a documented `googleMapsLinks.writeAReviewUri` for a place, and the
 * `search.google.com/local/writereview?placeid=` form is widely used — but
 * neither is what this business has been handing to customers, and this link
 * is known to work. Swapping a working review link for a better-documented
 * one is a change that can only be verified by a real customer failing to
 * leave a review, which is the worst possible feedback loop.
 *
 * If it ever needs to change, change it here: it is referenced in exactly one
 * place and check-review-page.mts asserts that.
 */
export const GOOGLE_REVIEW_URL = "https://g.page/r/CRosmlHQ5siiEAE/review";

/** The public profile, for "read our reviews on Google" attribution links. */
export const GOOGLE_PROFILE_URL = "https://g.page/r/CRosmlHQ5siiEAE";

/**
 * How long a traveller's draft survives a round trip to Google and back.
 *
 * The flow sends people to another site and hopes they come back. If they
 * return to this tab, their words should still be here rather than lost —
 * sessionStorage, not localStorage, because a review draft is not something
 * to leave on a shared or borrowed device indefinitely.
 */
export const DRAFT_STORAGE_KEY = "ee-review-draft";
