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

if (errors.length > 0) {
  console.error(`\ncheck-story-images: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-story-images: ok — ${published.length} published stories, ` +
    `${byImage.size} distinct covers, all credited.`,
);
