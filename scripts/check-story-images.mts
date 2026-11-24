/**
 * Guards story cover photos against the three failures that all shipped to
 * production together:
 *
 *   1. A published story with no cover at all.
 *   2. Two published stories sharing one cover — 12 photos were doing the
 *      work of 32 stories, so the /stories grid repeated itself.
 *   3. A hot-linked photo with no provenance. content/unsplash.ts requires
 *      every Unsplash photo to carry an UnsplashCredit, and not one of the
 *      153 published stories had one: there was no way to trace a cover to
 *      its photographer, its licence, or its original page, and so no way to
 *      tell a live photo ID from an invented one.
 *
 * All three are invisible in a build — the page renders, it just renders a
 * broken image, the same image twice, or an uncredited one. Run in CI.
 */
import { stories } from "../src/content/stories";
import { STORY_REDIRECTS } from "../src/content/redirectedStories";
import { RETIRED_STORY_SLUGS } from "../src/content/retiredStories";
import {
  UNPINNABLE_STORY_SLUGS,
  UNPINNED_STORY_FILTER,
} from "../src/content/pinnableStories";
import { readFileSync } from "node:fs";

const published = stories.filter((s) => s.status === "published");
const errors: string[] = [];

const byImage = new Map<string, string[]>();

for (const story of published) {
  const image = story.image;

  if (!image) {
    errors.push(`${story.slug}: published with no cover photo`);
    continue;
  }

  const key = typeof image === "string" ? image : JSON.stringify(image);
  byImage.set(key, [...(byImage.get(key) ?? []), story.slug]);

  // A local file under /photos is Egypt Eye's own and needs no credit. A
  // remote hot-link is someone else's work and does.
  if (typeof image === "string" && image.startsWith("http") && !story.imageCredit) {
    errors.push(
      `${story.slug}: hot-links ${new URL(image).hostname} with no imageCredit — ` +
        `use unsplashUrl()/unsplashCredit() so the photo can be traced back.`,
    );
  }
}

for (const [image, slugs] of byImage) {
  if (slugs.length > 1) {
    errors.push(
      `${slugs.length} stories share one cover (${slugs.join(", ")}): ` +
        `${image.slice(0, 72)}`,
    );
  }
}

// A retirement is three coordinated facts (a 301, a sitemap exclusion, and a
// Sanity document to remove), and all three read from STORY_REDIRECTS.
// Two ways that map can rot silently, both of which serve a broken page:
const publishedSlugs = new Set(published.map((s) => s.slug));
for (const [from, to] of Object.entries(STORY_REDIRECTS)) {
  if (!publishedSlugs.has(to)) {
    errors.push(
      `/stories/${from} redirects to /stories/${to}, which is not a ` +
        `published story — a 301 into a 404 is worse than the 404 it replaced.`,
    );
  }
  if (publishedSlugs.has(from)) {
    errors.push(
      `/stories/${from} is listed as redirected but is still published — the ` +
        `redirect in next.config.ts shadows it, so the article is unreachable.`,
    );
  }
}

// ---------------------------------------------------------------------------
// PINTEREST CAN ONLY BE SHOWN A LIVE ARTICLE
//
// On 23 November 2026 the admin backfill tried to pin twenty-two stories and
// every one of them was a redirected slug: a URL that 301s away the moment
// anyone follows it. It failed only because those documents also happen to
// have no cover photo, which is luck rather than a safeguard.
//
// A Pin is public, it lives on someone else's platform, and nothing in this
// codebase can delete one. So the exclusion is asserted here rather than left
// to a comment.
// ---------------------------------------------------------------------------
{
  // Every redirected and every retired slug is excluded.
  // Proven by removing the RETIRED_STORY_SLUGS spread from
  // UNPINNABLE_STORY_SLUGS: red, naming the slugs that fell out.
  const unpinnable = new Set(UNPINNABLE_STORY_SLUGS);
  for (const from of Object.keys(STORY_REDIRECTS)) {
    if (!unpinnable.has(from)) {
      errors.push(
        `/stories/${from} redirects elsewhere but is not in UNPINNABLE_STORY_SLUGS — ` +
          `Pinterest would be handed a URL that 301s away.`,
      );
    }
  }
  for (const slug of RETIRED_STORY_SLUGS) {
    if (!unpinnable.has(slug)) {
      errors.push(
        `/stories/${slug} is retired (410 Gone) but is not in UNPINNABLE_STORY_SLUGS.`,
      );
    }
  }

  // The filter has to actually carry the exclusion clause. Without this, the
  // two assertions above pass while the list they check goes unused.
  // Proven by deleting the `!(slug.current in $unpinnable)` clause from
  // UNPINNED_STORY_FILTER: red.
  if (!UNPINNED_STORY_FILTER.includes("!(slug.current in $unpinnable)")) {
    errors.push(
      "UNPINNED_STORY_FILTER no longer excludes $unpinnable, so the slug list " +
        "above is decorative and every redirected story is pinnable again.",
    );
  }

  // AND NOBODY SPELLS THE PREDICATE OUT THEMSELVES.
  //
  // This is the one that actually catches the original bug. Three callers each
  // wrote `status == "published" && !defined(pinterestPinId)` by hand, so
  // fixing one left the other two wrong — and the admin screen reporting
  // "22 remaining" while the sync refuses to pin any of them looks exactly
  // like a fix that did not work.
  //
  // Proven by pasting the raw predicate back into data.ts: red, naming it.
  const CONSUMERS = [
    "src/lib/pinterest/sync.ts",
    "src/app/[locale]/(site)/admin/pinterest/data.ts",
  ];
  for (const file of CONSUMERS) {
    const source = readFileSync(file, "utf8");
    if (/!defined\(pinterestPinId\)/.test(source)) {
      errors.push(
        `${file} spells out the unpinned-story predicate itself instead of using ` +
          `UNPINNED_STORY_FILTER. Three copies of this is how the admin count and ` +
          `the sync came to disagree.`,
      );
    }
    // A query built on the filter without the parameter is a GROQ error at
    // runtime, which on this stack means a 500 on an admin page the owner
    // uses. Cheaper to catch here.
    // Proven by deleting `unpinnableParams` from the data.ts fetch call: red.
    if (source.includes("UNPINNED_STORY_FILTER") && !source.includes("unpinnableParams")) {
      errors.push(
        `${file} uses UNPINNED_STORY_FILTER but never passes unpinnableParams, so the ` +
          `$unpinnable parameter is undefined and the query throws.`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(`\ncheck-story-images: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-story-images: ok — ${published.length} published stories, ` +
    `${byImage.size} distinct covers, all credited, ` +
    `${Object.keys(STORY_REDIRECTS).length} story redirects resolving, and ` +
    `${UNPINNABLE_STORY_SLUGS.length} slugs Pinterest can never be handed.`,
);
