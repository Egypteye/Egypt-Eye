/**
 * URL consolidation for flyingdressesegypt.com.
 *
 * Pure, and deliberately so: src/proxy.ts runs in the edge runtime and is out
 * of reach of the check scripts, so the two decisions worth getting right live
 * here where they can be tested directly. CLAUDE.md §6.
 *
 * =========================================================================
 * WHY THIS EXISTS: SEARCH CONSOLE, 1 NOVEMBER 2026
 * =========================================================================
 * The owner exported three months of Search Console data and it showed two
 * problems that no amount of reading the code had surfaced, because both are
 * invisible until something external crawls the site.
 *
 * PROBLEM ONE: EVERY PAGE IS INDEXED TWICE.
 *
 * The proxy serves this brand's pages at BOTH shapes on this domain:
 *
 *     flyingdressesegypt.com/stories/how-a-flying-dress-flies
 *     flyingdressesegypt.com/flying-dresses/stories/how-a-flying-dress-flies
 *
 * The first is the pretty public URL and the one every canonical tag points
 * at. The second is the internal route tree, which the proxy was passing
 * straight through on the reasoning that it is "the form every internal link
 * uses" — which is true, and is exactly why it got crawled.
 *
 * Search Console had both indexed for at least eight pages, competing with
 * each other:
 *
 *     /stories/how-a-flying-dress-flies                 6 impressions
 *     /flying-dresses/stories/how-a-flying-dress-flies 14 impressions
 *     /packages                                        26 impressions
 *     /flying-dresses/packages                         12 impressions
 *     /rentals                                         53 impressions
 *     /flying-dresses/rentals                           2 impressions
 *
 * A canonical tag is a hint. It had not won, and on a domain this new it was
 * never going to quickly. `canonicalFlyingDressPath` turns the long form into
 * a 308 so the question stops being a matter of opinion.
 *
 * THE COST, STATED HONESTLY: fdPath() emits the long form for every internal
 * link, because the same HTML is served to both this domain and
 * egypteyetravel.com/flying-dresses/* and a static href cannot vary by host.
 * So until those links are shortened, an internal click on this domain costs
 * one redirect hop. That is a real regression and it is worth it: one extra
 * round trip per navigation against the entire site being indexed twice. See
 * docs/FLYING-DRESSES-SEO-AUDIT.md for how to remove the hop.
 *
 * PROBLEM TWO: THE PREVIOUS SITE'S URLS 404, AND THEY STILL HAVE TRAFFIC.
 *
 * This brand had a site before this one. Four of its URLs are still being
 * served by Google and clicked on, and every one of them currently lands on
 * this brand's 404 page, because the proxy's catch-all rewrites an unknown
 * path into the route tree and finds nothing:
 *
 *     /blog-post1   6 clicks, 37 impressions, position 12.2
 *     /about-us     2 clicks, 41 impressions, position 6.3
 *     /blog-post5   1 click,  16 impressions, position 11.8
 *     /blog         0 clicks,  3 impressions, position 2.0
 *
 * Nine clicks and ninety-seven impressions a quarter, thrown away. /blog-post1
 * alone out-clicked every celebration page on the site.
 *
 * WHERE THE BLOG POSTS GO, and why it is the index rather than an article.
 * Nobody kept a mapping from the old post numbers to anything, and inventing
 * one would send a reader to an article that is not what they clicked. When
 * the exact page cannot be identified, the honest destination is the listing
 * that holds the same KIND of content, which is what the Egypt Eye rules
 * already do for that site's orphaned WordPress post IDs (see
 * content/redirectRules.ts). /about-us is the one unambiguous case and gets a
 * real one-to-one target.
 */

/** The internal route-tree prefix. Must match proxy.ts FLYING_DRESSES_BASE. */
export const FLYING_DRESSES_BASE = "/flying-dresses";

/**
 * Trailing slashes, normalised once.
 *
 * "/about/" and "/about" are one page and must not become two redirect
 * decisions. The root is left alone, because "" is not a path.
 */
function normalise(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

/**
 * The previous site's URLs, mapped to what replaced them.
 *
 * Exact matches only. A pattern is handled below, because the old blog used
 * numbered posts and there is no telling how many of them Google still holds.
 */
const LEGACY_EXACT: Record<string, string> = {
  // The one unambiguous rename. 41 impressions a quarter at position 6.3.
  "/about-us": "/about",
  // The old blog's index and its feed.
  "/blog": "/stories",
  "/feed": "/stories",
};

/** /blog-post1, /blog-post12, and whatever else the old site numbered. */
const LEGACY_BLOG_POST = /^\/blog-post\d+$/;

/** /blog/anything from the old structure. */
const LEGACY_BLOG_CHILD = /^\/blog\/[^/]+$/;

/**
 * Where a previous-site URL should send a visitor, or null if it is not one.
 *
 * Returns a brand-relative path ("/stories"), never an absolute URL: the
 * proxy is already on the right host and rewriting the host here would make
 * this function untestable against anything but production.
 */
export function legacyFlyingDressRedirect(pathname: string): string | null {
  const path = normalise(pathname);

  const exact = LEGACY_EXACT[path];
  if (exact) return exact;

  if (LEGACY_BLOG_POST.test(path) || LEGACY_BLOG_CHILD.test(path)) return "/stories";

  return null;
}

/**
 * The short, canonical form of a long-form route-tree URL, or null.
 *
 * `/flying-dresses/wardrobe` -> `/wardrobe`
 * `/flying-dresses`          -> `/`
 * `/wardrobe`                -> null, it is already canonical
 *
 * NOT applied to the Egypt Eye domain, where `/flying-dresses/*` is the real
 * and only address for these pages. The proxy calls this inside the
 * Flying-Dresses-host branch alone.
 */
export function canonicalFlyingDressPath(pathname: string): string | null {
  const path = normalise(pathname);

  if (path === FLYING_DRESSES_BASE) return "/";
  if (path.startsWith(`${FLYING_DRESSES_BASE}/`)) {
    const short = path.slice(FLYING_DRESSES_BASE.length);
    // Defensive: a path of exactly the prefix plus a slash would yield "",
    // which is not a path a redirect can use.
    return short === "" ? "/" : short;
  }

  return null;
}
