/**
 * EVERY REAL ROUTE ON THIS BRAND'S SITE, IN ONE LIST.
 *
 * =========================================================================
 * WHY THIS EXISTS
 * =========================================================================
 * The stories carry links: a primary commercial destination, a related rail,
 * and contextual links inside the prose. Every one of those is a string, and
 * a string that does not resolve is a 404 served to somebody we persuaded to
 * click it, from an article whose whole job was to be trusted.
 *
 * Nothing in Next's App Router will tell you about that. A `<Link href>` to a
 * route that does not exist builds, deploys, renders, and looks perfectly
 * correct until it is clicked. On a site with one editorial section and four
 * commercial ones, where articles are written to link outward, that is not a
 * hypothetical: it is the failure this file exists to make impossible.
 *
 * So the routes are DERIVED, not typed. Every entry below is computed from
 * the same catalogue the pages themselves render from, which means a package
 * renamed in content/flyingDresses.ts moves its URL here in the same edit, and
 * a story that links to the old one fails the check rather than the customer.
 *
 * =========================================================================
 * WHAT IT DELIBERATELY DOES NOT COVER
 * =========================================================================
 * Paths are brand-relative — "/wardrobe", not "/flying-dresses/wardrobe" and
 * not "https://flyingdressesegypt.com/wardrobe". fdPath() adds the prefix when
 * the deployment needs one, and that is the only place that decision lives.
 *
 * External links are not here and are not checked. An article citing a source
 * on another domain is doing something this file has no opinion about; see
 * `StorySource`, which is where that belongs.
 */

import { packages, rentalServices } from "./flyingDresses";
import { categoryPath, experienceCategories } from "./flyingDressExperiences";

/**
 * The pages that are not generated from a catalogue.
 *
 * Typed out rather than globbed from the filesystem: a check that reads the
 * app directory would pass on a route that exists and is broken, and would
 * need the filesystem at a point in the build where the content layer should
 * not need it. These are the routes a human decided to publish.
 *
 * /enquire IS here and the sitemap deliberately leaves it out. Those are
 * different questions: a story may legitimately link somebody to the enquiry
 * form, while a pre-filled form with one URL per query string has no business
 * competing in search. See sitemap.xml/route.ts.
 */
const STATIC_ROUTES = [
  "",
  "/about",
  "/celebrations",
  "/collaborate",
  "/creative",
  "/enquire",
  "/experiences",
  "/faq",
  "/packages",
  "/rentals",
  "/stories",
  "/wardrobe",
] as const;

/**
 * Every brand-relative path that resolves, except individual stories.
 *
 * Stories are excluded here and added by the story layer itself, because
 * flyingDressStories.ts imports this module: pulling the stories in would be
 * a cycle, and a cycle in a module one check script and every page imports is
 * a problem nobody enjoys debugging at build time.
 */
export const flyingDressRoutes: readonly string[] = [
  ...STATIC_ROUTES,
  ...packages.map((p) => `/experiences/${p.slug}`),
  ...rentalServices.map((s) => `/rentals/${s.slug}`),
  ...experienceCategories.map((c) => categoryPath(c)),
];

/**
 * Does this brand-relative path resolve, given the stories that exist?
 *
 * The caller passes the story slugs rather than this module importing them,
 * for the cycle reason above. A path with a query string or a fragment is
 * checked on its path part alone, since "/enquire?package=fayoum" resolves
 * exactly when "/enquire" does.
 */
export function isFlyingDressRoute(path: string, storySlugs: readonly string[] = []): boolean {
  const bare = path.split(/[?#]/)[0] ?? "";
  // A trailing slash is the same page. "/wardrobe/" and "/wardrobe" differ as
  // strings and not as destinations, and an editor will eventually type both.
  const normalised = bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare;
  if (flyingDressRoutes.includes(normalised)) return true;
  return storySlugs.some((slug) => normalised === `/stories/${slug}`);
}
