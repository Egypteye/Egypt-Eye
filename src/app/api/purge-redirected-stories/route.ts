import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { stories } from "@/content/stories";
import { STORY_REDIRECTS, REDIRECTED_STORY_SLUGS } from "@/content/redirectedStories";

// Removes the Sanity story documents that sit at redirected URLs.
//
// The /stories grid was showing a run of cards with no cover photo. The first
// theory was dead image URLs; /api/image-audit disproved that (deadCount: 0)
// and named the real cause: 22 documents that exist in Sanity with no
// counterpart in src/content/stories.ts, so they have no image and no local
// fallback to borrow one from.
//
// Giving them cover photos would have been the wrong fix. Every one of those
// 22 slugs is already a 301 source in next.config.ts — they are the pre-rewrite
// versions of articles that now live at a different slug. So each card in the
// grid links to a URL that immediately redirects to an article already in the
// grid under its real title. They are duplicates pointing at their own
// replacements, and the fix is to delete them, not to photograph them.
//
//   https://yoursite.com/api/purge-redirected-stories?secret=YOUR_MIGRATE_SECRET
//   https://yoursite.com/api/purge-redirected-stories?secret=YOUR_MIGRATE_SECRET&apply=1
//
// Without `apply=1` this is a dry run: it lists what it would delete and
// changes nothing. Read that list first — these documents are the only copy of
// the pre-rewrite wording, so take a Sanity export if any of it is worth
// keeping.
//
// The 301s stay either way. Deleting the document removes the duplicate card
// from the grid; the redirect keeps every crawled link and bookmark working.
//
// It will only ever touch a slug listed in src/content/redirectedStories.ts, and
// it refuses outright if a retirement's destination doesn't resolve to a
// published story — deleting a document whose replacement isn't live would
// turn a redirect into a 404.
export const maxDuration = 30;

type StoryDoc = { _id: string; slug: string | null; title?: string };

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.MIGRATE_SECRET || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Invalid or missing secret" }, { status: 401 });
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "SANITY_API_WRITE_TOKEN is not set in this deployment's environment variables" },
      { status: 500 }
    );
  }

  const apply = request.nextUrl.searchParams.get("apply") === "1";

  // A 301 into a 404 is worse than the 404 it replaced, so verify every
  // destination is live before removing anything the redirects depend on.
  const publishedLocal = new Set(
    stories.filter((s) => s.status === "published").map((s) => s.slug)
  );
  const brokenDestinations = Object.entries(STORY_REDIRECTS)
    .filter(([, to]) => !publishedLocal.has(to))
    .map(([from, to]) => ({ from, to }));
  if (brokenDestinations.length > 0) {
    return NextResponse.json(
      {
        error:
          "Refusing to delete: some retirements point at a slug that is not a published story. " +
          "Fix src/content/redirectedStories.ts (or publish the destination) and redeploy first.",
        brokenDestinations,
      },
      { status: 409 }
    );
  }

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

  const docs = await client.fetch<StoryDoc[]>(
    `*[_type == "story" && slug.current in $slugs]{_id, "slug": slug.current, title}`,
    { slugs: [...REDIRECTED_STORY_SLUGS] }
  );

  // Belt and braces: the query already filters by slug, but this is a delete,
  // so re-check each document against the map before it goes into the
  // transaction rather than trusting the query alone.
  const targets = docs.filter((d) => d.slug !== null && REDIRECTED_STORY_SLUGS.has(d.slug));

  const details = targets.map((d) => ({
    _id: d._id,
    slug: d.slug,
    title: d.title ?? "",
    redirectsTo: `/stories/${STORY_REDIRECTS[d.slug as string]}`,
  }));

  const notInSanity = [...REDIRECTED_STORY_SLUGS].filter(
    (slug) => !targets.some((d) => d.slug === slug)
  );

  if (!apply) {
    return NextResponse.json({
      dryRun: true,
      redirectedSlugsTracked: REDIRECTED_STORY_SLUGS.size,
      foundInSanity: targets.length,
      wouldRemove: targets.length,
      alreadyGone: notInSanity,
      details,
      note:
        "Nothing was changed. Every document listed above sits at a URL that already 301s " +
        "to the slug shown in redirectsTo, so it appears in the /stories grid as a duplicate " +
        "card with no cover photo. Re-run with &apply=1 to delete them. This is permanent — " +
        "take a Sanity export first if the pre-rewrite wording is worth keeping. The redirects " +
        "are unaffected either way.",
    });
  }

  if (targets.length > 0) {
    const tx = client.transaction();
    for (const d of targets) tx.delete(d._id);
    await tx.commit();
  }

  return NextResponse.json({
    applied: true,
    removed: targets.length,
    alreadyGone: notInSanity,
    details,
    note:
      "Deleted. The /stories grid should lose one card per document above on the next " +
      "revalidation, and every redirected URL still 301s to its replacement.",
  });
}
