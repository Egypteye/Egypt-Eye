import "server-only";
import { unstable_cache } from "next/cache";
import { fetchGoogleReviews, isConfigured, type GoogleReviewsResult } from "./businessProfile";

/**
 * The reviews as a page may use them: cached, and never throwing.
 *
 * =========================================================================
 * WHY THIS NEVER THROWS
 * =========================================================================
 * /review is the URL printed on business cards, sent in WhatsApp follow-ups
 * and encoded in QR codes. The single worst outcome for this page is that a
 * traveller taps the link, Google's API is having a bad afternoon, and they
 * get an error page instead of the form — the review is then lost, and so is
 * the trust the branded link was supposed to buy.
 *
 * So every failure degrades to "no reviews to show" and the page renders its
 * form regardless. The reason is returned rather than swallowed, so /admin can
 * tell the owner what is wrong without a log they cannot read (CLAUDE.md #2).
 *
 * =========================================================================
 * CACHING
 * =========================================================================
 * Google's quota for the Business Profile APIs is measured per minute and is
 * not generous. A page rendered per visitor against a live API would burn it
 * and slow the page down for no benefit: reviews change a few times a month.
 *
 * So the fetch is wrapped with a tag, revalidated daily and on demand by the
 * cron route. Note this is the owner-side API, where the reviews are the
 * business's own data — the Places API caching prohibition does not apply to
 * it, and could not be worked around if it did.
 *
 * `unstable_cache` rather than Next 16's `use cache`: the directive needs
 * Cache Components switched on in next.config, which changes caching
 * behaviour for every route in the app. That is a migration this site should
 * make deliberately, not a side effect of adding a review page. The
 * deprecated API still works and this is the only caller, so the swap is a
 * single function when the time comes.
 */

export const GOOGLE_REVIEWS_TAG = "google-reviews";

/** A day. Reviews arrive slowly; the cron refreshes it sooner. */
const REVALIDATE_SECONDS = 86_400;

export type GoogleReviewsState =
  | { status: "ok"; data: GoogleReviewsResult }
  /** No credentials. Setup is pending — not an error, and not a bug. */
  | { status: "not-configured" }
  /** Configured but the call failed. The page still renders. */
  | { status: "error"; message: string };

const cachedFetch = unstable_cache(
  async () => fetchGoogleReviews(),
  ["google-business-reviews"],
  { revalidate: REVALIDATE_SECONDS, tags: [GOOGLE_REVIEWS_TAG] }
);

export async function getGoogleReviews(): Promise<GoogleReviewsState> {
  if (!isConfigured()) return { status: "not-configured" };

  try {
    return { status: "ok", data: await cachedFetch() };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * The reviews worth putting on a page, newest first.
 *
 * A Google review can be stars with no words. Those count towards the rating
 * and the total — they are real — but there is nothing to read, so they are
 * not rendered as empty cards.
 */
export function readableReviews(data: GoogleReviewsResult) {
  return data.reviews
    .filter((r) => r.text.length > 0)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
