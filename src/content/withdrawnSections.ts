// Sections withdrawn from the site.
//
// Same idea as content/hiddenTours.ts, one level up: the section is no longer
// offered, but its pages, content, admin tooling and data are left intact so
// bringing it back is deleting a line rather than rebuilding it.
//
// Withdrawn means: gone from the nav and footer, from every internal link,
// and from the sitemap, and marked noindex so search engines let it go. The
// URLs still return 200 for anyone holding an old link — they are indexed
// today, and manufacturing dead ends would add to the 404s already being
// reported in Search Console.
//
// One list drives all of it. A path here covers the section's own page and
// everything beneath it, so a detail route can't be missed the way it would
// be if each page carried its own flag.

export const withdrawnSectionPaths = ["/signature-experiences", "/hotel-deals"] as const;

/** True for a withdrawn section's own path and anything nested under it. */
export function isWithdrawnPath(path: string): boolean {
  return withdrawnSectionPaths.some((base) => path === base || path.startsWith(`${base}/`));
}

/**
 * The robots directive a withdrawn page carries.
 *
 * `follow: false` as well as `index: false`: the pages link on into tours and
 * the enquiry flow, and there is no reason to keep spending crawl budget
 * walking out of a section that is no longer offered.
 */
export const withdrawnRobots = { index: false, follow: false } as const;
