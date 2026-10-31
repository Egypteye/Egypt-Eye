import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { bearerMatches } from "@/lib/security/secrets";
import { isConfigured } from "@/lib/google/businessProfile";
import { GOOGLE_REVIEWS_TAG, getGoogleReviews } from "@/lib/google/reviews";

// Refreshes the cached Google reviews. Hit daily by Vercel Cron (vercel.json).
//
// It drops the cache tag and then reads once, so the next visitor gets a warm
// cache rather than paying for the round trip to Google themselves.
//
// Returns a body rather than a bare 200 because this is the only window the
// owner has onto whether the integration is alive — they have no terminal
// (CLAUDE.md #2), and "not-configured" versus "error" is the difference
// between a setup step they still owe and a token that has been revoked.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!bearerMatches(request, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isConfigured()) {
    return NextResponse.json({
      status: "not-configured",
      detail: "Google Business Profile credentials are not set; /review renders without the reviews panel.",
    });
  }

  // `{ expire: 0 }` rather than the recommended "max".
  //
  // "max" is right for a page request: it serves stale content instantly and
  // revalidates in the background. This is a nightly cron, and it reads the
  // data straight afterwards to warm the cache and to report the counts back.
  // Under "max" that read would be served the stale copy, so the cron would
  // report yesterday's numbers and warm nothing. `{ expire: 0 }` makes the
  // next read a blocking refetch, which is exactly what a background job
  // wants and what no visitor is waiting on.
  revalidateTag(GOOGLE_REVIEWS_TAG, { expire: 0 });
  const state = await getGoogleReviews();

  if (state.status !== "ok") {
    return NextResponse.json({ status: state.status, detail: state }, { status: 502 });
  }

  return NextResponse.json({
    status: "ok",
    totalCount: state.data.totalCount,
    averageRating: state.data.averageRating,
    withText: state.data.reviews.filter((r) => r.text.length > 0).length,
    fetchedAt: state.data.fetchedAt,
  });
}
