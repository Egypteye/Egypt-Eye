import "server-only";

/**
 * The Google Business Profile API client, for Egypt Eye's own reviews.
 *
 * =========================================================================
 * WHY THIS API AND NOT THE PLACES API
 * =========================================================================
 * The Places API is the obvious one and it is the wrong one twice over:
 *
 *   it returns at most FIVE reviews, chosen by Google for "relevance", so the
 *   site could never show all of them, and
 *
 *   its policies forbid pre-fetching, caching or storing Places content —
 *   only the place ID may be stored. A review wall built on it would have to
 *   call Google on every render and still only ever hold five.
 *
 * The Business Profile API is the owner-side API: it returns every review on
 * a location the authenticated account verifiably owns, with the total count
 * and average rating, paginated. That is the only route to "all of them".
 *
 * =========================================================================
 * WHY v4 WHEN EVERYTHING ELSE GOOGLE MOVED
 * =========================================================================
 * Google split the old My Business API into several versioned APIs
 * (Account Management, Business Information, and so on). Reviews did not move
 * with them: review listing still lives on the legacy v4 endpoint, which is
 * why this file talks to `mybusiness.googleapis.com/v4` while the account and
 * location ids come from the newer console. If a future migration moves
 * reviews, this is the one file that changes.
 *
 * =========================================================================
 * CREDENTIALS
 * =========================================================================
 * Server-side only, never NEXT_PUBLIC. A refresh token for an account that
 * manages the location, exchanged for a short-lived access token per call.
 * Every one of these is absent in development and in the cloud sandbox, which
 * is why `isConfigured()` exists and why every caller must handle false.
 */

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const API_BASE = "https://mybusiness.googleapis.com/v4";

/** Google returns the star value as a word, not a number. */
const STAR_VALUES: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export type GoogleReview = {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  /** 1-5. A review Google could not resolve to a star value is dropped. */
  rating: number;
  text: string;
  /** ISO 8601, as Google returns it. */
  createdAt: string;
  /** Egypt Eye's published reply, where there is one. */
  reply?: { text: string; updatedAt: string };
};

export type GoogleReviewsResult = {
  reviews: GoogleReview[];
  totalCount: number;
  /** Google's own average over every review, not an average of what we show. */
  averageRating: number | null;
  fetchedAt: string;
};

type Env = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accountId: string;
  locationId: string;
};

function readEnv(): Env | null {
  const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_BUSINESS_REFRESH_TOKEN;
  const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
  const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;
  if (!clientId || !clientSecret || !refreshToken || !accountId || !locationId) return null;
  return { clientId, clientSecret, refreshToken, accountId, locationId };
}

/**
 * Whether the integration can run at all.
 *
 * Exported because the page needs to tell the difference between "Google
 * returned nothing" and "nobody has connected Google yet" — those are a
 * missing-reviews bug and a pending setup task, and they look identical from
 * an empty array.
 */
export function isConfigured(): boolean {
  return readEnv() !== null;
}

async function accessToken(env: Env): Promise<string> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.clientId,
      client_secret: env.clientSecret,
      refresh_token: env.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    // The body of a token failure names the cause (invalid_grant for a revoked
    // or expired refresh token, which is the one that will actually happen).
    // It carries no secret of ours, so it is safe to surface to the caller's
    // logging — but the thrown message must never reach a page.
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Google token exchange returned no access_token");
  return json.access_token;
}

type ApiReview = {
  reviewId?: string;
  reviewer?: { displayName?: string; profilePhotoUrl?: string; isAnonymous?: boolean };
  starRating?: string;
  comment?: string;
  createTime?: string;
  updateTime?: string;
  reviewReply?: { comment?: string; updateTime?: string };
};

/**
 * Every review on the location, following pagination to the end.
 *
 * `maxPages` is a stop, not a target: an account with a runaway page token
 * would otherwise loop until the function times out. 20 pages at 50 per page
 * is 1000 reviews, far beyond this business, and hitting it is a bug worth
 * seeing rather than a limit worth raising.
 */
export async function fetchGoogleReviews(maxPages = 20): Promise<GoogleReviewsResult> {
  const env = readEnv();
  if (!env) throw new Error("Google Business Profile is not configured");

  const token = await accessToken(env);
  const base = `${API_BASE}/accounts/${env.accountId}/locations/${env.locationId}/reviews`;

  const collected: ApiReview[] = [];
  let totalCount = 0;
  let averageRating: number | null = null;
  let pageToken: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const url = new URL(base);
    url.searchParams.set("pageSize", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Google reviews request failed: ${res.status} ${await res.text()}`);
    }

    const json = (await res.json()) as {
      reviews?: ApiReview[];
      totalReviewCount?: number;
      averageRating?: number;
      nextPageToken?: string;
    };

    collected.push(...(json.reviews ?? []));
    // Google reports the totals on every page; the first is as good as any,
    // and taking the latest keeps it right if a review lands mid-walk.
    if (typeof json.totalReviewCount === "number") totalCount = json.totalReviewCount;
    if (typeof json.averageRating === "number") averageRating = json.averageRating;

    pageToken = json.nextPageToken;
    if (!pageToken) break;
  }

  return {
    reviews: collected.flatMap(normalize),
    // Google's own count, not collected.length: a review with no star value is
    // dropped below, and the headline figure must stay Google's rather than
    // become a number only this site believes.
    totalCount: totalCount || collected.length,
    averageRating,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * One API review, or nothing.
 *
 * Returns an array so callers can flatMap: a review Google cannot give a
 * star value or an id is not shown rather than shown as zero stars, because a
 * rating this site invented is worse than a review it omitted.
 */
function normalize(raw: ApiReview): GoogleReview[] {
  const rating = STAR_VALUES[raw.starRating ?? ""];
  if (!raw.reviewId || !rating) return [];

  const text = (raw.comment ?? "").trim();
  const name = raw.reviewer?.isAnonymous
    ? "A Google user"
    : (raw.reviewer?.displayName ?? "").trim() || "A Google user";

  return [
    {
      id: raw.reviewId,
      authorName: name,
      // An anonymous reviewer's photo is not theirs to show.
      authorPhotoUrl: raw.reviewer?.isAnonymous ? undefined : raw.reviewer?.profilePhotoUrl,
      rating,
      text,
      createdAt: raw.createTime ?? raw.updateTime ?? "",
      reply: raw.reviewReply?.comment
        ? { text: raw.reviewReply.comment, updatedAt: raw.reviewReply.updateTime ?? "" }
        : undefined,
    },
  ];
}
