import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Hit by a Sanity webhook (configured at manage.sanity.io → API → Webhooks —
// see README → "Setting up instant content updates") the moment an editor
// publishes anything in Studio. Every page on the site pulls its data
// through src/sanity/fetchers.ts' safeFetch(), which caches for
// REVALIDATE_SECONDS (currently 1 hour) as a backstop — this route exists so
// an edit shows up immediately instead of waiting out that window, without
// needing a short global revalidate time that regenerates pages constantly
// under normal traffic (see the fetchers.ts comment on REVALIDATE_SECONDS
// for why that was expensive).
//
// Deliberately doesn't try to figure out which specific page changed from
// the webhook payload — Sanity content maps to a lot of different routes
// (tours, stories, experiences, listing pages, the homepage, siteSettings
// feeding the nav/footer on every page...), and getting that mapping wrong
// would silently leave stale pages live. revalidatePath("/", "layout")
// invalidates the Data Cache for every route nested under the root layout,
// i.e. the entire site — cheap and always correct, since this only ever
// fires on an actual Studio publish, not on a timer.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
