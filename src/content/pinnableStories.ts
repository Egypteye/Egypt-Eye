import { STORY_REDIRECTS } from "./redirectedStories";
import { RETIRED_STORY_SLUGS } from "./retiredStories";

/**
 * Story slugs that must never be sent to Pinterest, and the one GROQ filter
 * that keeps every caller agreeing about it.
 *
 * =========================================================================
 * THE BUG THIS EXISTS TO FIX
 * =========================================================================
 * On 23 November 2026 the admin "Pin Remaining Stories" button reported
 * "Pinned 0. 22 still remaining." and listed twenty-two slugs as having no
 * image. Every one of the twenty-two is a key of STORY_REDIRECTS. Not one was
 * a live article.
 *
 * So the message was true and the diagnosis it invited was wrong. Nothing was
 * missing a photograph. The sync was trying to pin twenty-two URLs that 301
 * away the moment anyone follows them, and the only thing standing between it
 * and a board full of dead Pins was that those documents happen to have no
 * image either. The missing cover was a lucky accident, not a safeguard.
 *
 * Why the documents are still there: redirectedStories.ts explains it. The
 * Sanity dataset holds a document for most redirected slugs, it has no
 * counterpart in src/content/stories.ts so no content edit can reach it, and
 * /api/purge-redirected-stories is what removes them. Until someone runs that,
 * the dataset keeps handing these rows to anything that asks for published
 * stories — the /stories grid included, where they render coverless and link
 * to a redirect.
 *
 * PURGING IS THE CLEANUP. THIS IS THE GUARD. Both are worth having: the purge
 * fixes the dataset today, and this makes the sync correct whatever state the
 * dataset is in tomorrow. A Pin is a public artefact on someone else's
 * platform and deleting one is not a thing this codebase can do, so the cost
 * of getting it wrong is not symmetrical with the cost of checking.
 *
 * =========================================================================
 * WHY RETIRED SLUGS ARE IN HERE TOO
 * =========================================================================
 * They should already be excluded by `status == "published"`, because
 * retiredStories.ts requires every slug it lists to carry status "archived".
 * That is an invariant held by a comment and a check over local content, and
 * this list costs nothing, so it is belt and braces against the day the two
 * drift in the dataset rather than in the file.
 */
export const UNPINNABLE_STORY_SLUGS: string[] = [
  ...Object.keys(STORY_REDIRECTS),
  ...RETIRED_STORY_SLUGS,
].sort();

/**
 * The single GROQ predicate for "a published story that still needs pinning".
 *
 * Three callers used to spell this out themselves: the query that picks what
 * to pin, the count that says how many are left, and the admin page's own
 * remaining count. Spelling it three times is how the admin screen ends up
 * saying "22 remaining" forever while the sync correctly refuses to pin any
 * of them, which is a worse bug than the one being fixed because it looks
 * like the fix did not work.
 *
 * Any query using this MUST pass the $unpinnable parameter. There is no
 * default: GROQ treats an undefined parameter as an error rather than as an
 * empty array, so a caller that forgets fails loudly instead of quietly
 * pinning everything.
 */
export const UNPINNED_STORY_FILTER =
  `_type == "story" && status == "published" && !defined(pinterestPinId) ` +
  `&& !(slug.current in $unpinnable)`;

/** The parameters every query built on UNPINNED_STORY_FILTER needs. */
export const unpinnableParams = { unpinnable: UNPINNABLE_STORY_SLUGS };
