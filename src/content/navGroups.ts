// Which pages appear in the header, and how the footer is grouped.
//
// These used to be the same list. site.nav drove the header bar, the "More"
// dropdown, the mobile sheet AND the footer's one long column, so a page could
// not be taken out of the menu without taking it off the site — the comment in
// site.ts said exactly that. This file separates the two questions:
//
//   site.nav  — every page that has a place in navigation at all.
//   here      — where each of them is shown.
//
// Nothing here can make a page unreachable. The header is a SELECTION and the
// footer is a GROUPING of the same list, and scripts/check-nav.mts asserts that
// every entry in site.nav is reachable from the footer whatever the header
// hides. A page dropped from the header is moved, never removed.
//
// Matching is by href, never by label. Labels come from the Studio and from
// six translation dictionaries; hrefs are the thing that actually identifies a
// page. The old code matched the bar against site.nav by English label, which
// silently did nothing for any label site.nav did not carry.
//
// Nothing withdrawn appears here. "Withdrawn" (content/withdrawnSections.ts)
// means gone from the nav and the footer, from every internal link and from
// the sitemap, with the URLs still answering for anyone holding an old link.
// Signature Experiences and Hotel Deals are both withdrawn, so neither gets a
// link — check-nav asserts it, because adding one back looks like a fix.

/** A nav accent. Each maps to real classes in Navbar — see ACCENT_CLASSES. */
import { redirectRules } from "./redirectRules";

export type NavAccent = "photoshoots" | "customize";

/**
 * The links in the desktop bar itself, in order.
 *
 * `label` is only a fallback for an href site.nav does not carry, so a page
 * can be promoted into the bar without having to live in the nav list too.
 */
export const HEADER_PRIMARY: { href: string; label: string; accent?: NavAccent }[] = [
  { href: "/tours", label: "Best Seller Tours" },
  { href: "/photoshoots", label: "Unique Photoshoots", accent: "photoshoots" },
];

/**
 * Pages kept out of the header and shown only in the footer.
 *
 * All four are live, linked and indexed — they are simply not in the menu. The
 * header was carrying thirteen items, which is a list nobody reads; these are
 * the four that belong in a footer a visitor goes looking in.
 */
export const HEADER_HIDDEN = ["/explore-egypt", "/partners", "/testimonials", "/weekly-trips"];

/**
 * Pinned to the bottom of the dropdown, after everything else.
 *
 * It is the one item in the menu that starts something rather than going
 * somewhere, so it reads as the action at the end of a list rather than one
 * more destination in the middle of it.
 */
export const HEADER_DROPDOWN_LAST = "/customize";

/**
 * Header-only labels.
 *
 * The section is The Boutique everywhere it is presented as a section — the
 * page, the footer, the Studio. In a menu, next to Tours and Transfers, one
 * word that says what it is beats a name that has to be learned first.
 */
export const HEADER_LABELS: Record<string, string> = {
  "/boutique": "Shop",
};

/** The accent for an href, wherever it appears in the header. */
export const HEADER_ACCENTS: Record<string, NavAccent> = {
  "/photoshoots": "photoshoots",
  "/customize": "customize",
};

export type FooterSection = {
  /** The column heading. English here; translated through <T> at render. */
  heading: string;
  /**
   * Links in display order. `label` is a fallback: an href that site.nav
   * carries uses the nav label, so the Studio and the dictionaries still win.
   */
  links: { href: string; label: string }[];
};

/**
 * The footer, in sections.
 *
 * One column of thirteen links is a list nobody finishes. These are grouped by
 * what a visitor came to do, which is also what makes the footer the safe home
 * for everything the header no longer shows.
 */
export const FOOTER_SECTIONS: FooterSection[] = [
  {
    heading: "Plan Your Trip",
    links: [
      { href: "/tours", label: "Best Seller Tours" },
      { href: "/experiences", label: "Extra Experiences" },
      { href: "/photoshoots", label: "Unique Photoshoots" },
      { href: "/transfers", label: "Transfers" },
      { href: "/customize", label: "Customize Your Tour" },
    ],
  },
  {
    heading: "Join a Trip",
    links: [
      { href: "/weekly-trips", label: "Weekly Trips" },
      { href: "/explore-egypt", label: "Explore Egypt" },
    ],
  },
  {
    // The Boutique keeps its name here. The four categories are listed rather
    // than hidden behind the landing page, because a footer is where somebody
    // scans for the specific thing they came back for.
    heading: "Shop",
    links: [
      { href: "/boutique", label: "The Boutique" },
      { href: "/boutique/cartouches", label: "Cartouches" },
      { href: "/boutique/papyrus", label: "Papyrus" },
      { href: "/boutique/clothing", label: "Clothing" },
      { href: "/boutique/essence-oils", label: "Essence Oils" },
    ],
  },
  {
    // Unchanged from what the footer already carried, plus the overview page
    // itself — it was in the header and nowhere else, so dropping it from the
    // menu without this would have made /partners unreachable.
    heading: "Partner With Us",
    links: [
      { href: "/partners", label: "Partner With Us" },
      { href: "/travel-agents", label: "Travel Agents" },
      { href: "/affiliate", label: "Affiliate Program" },
      { href: "/collaborate", label: "Creators & Collaborations" },
    ],
  },
  {
    // Traveler Reviews sits here rather than under a trip heading: it is
    // evidence about the company, which is what the rest of this column is,
    // and it is what somebody checks before they believe any of the above.
    heading: "About Egypt Eye",
    links: [
      { href: "/about", label: "About" },
      { href: "/testimonials", label: "Traveler Reviews" },
      { href: "/stories", label: "Stories" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

/** Every href the footer links, for the reachability check and for lookups. */
export function footerHrefs(): string[] {
  return FOOTER_SECTIONS.flatMap((section) => section.links.map((link) => link.href));
}

/**
 * The current URL for a path a navigation entry points at.
 *
 * Navigation items come from Sanity, so the Studio can still hold a URL the
 * site has since renamed. That is not hypothetical: after The Boutique rename
 * the Studio's nav kept `/take-egypt-home`, and because the header matches its
 * labels and its hidden list by href, that one stale entry put the old name
 * back in the live menu and sent every visitor who clicked it through a 308 —
 * while the footer, which is built from this file, showed the new name on the
 * same page.
 *
 * Rather than hard-code the rename a second time, this reads the answer from
 * redirectRules(), which is where the rename is already defined — the literal
 * rules, plus the `/prefix/:path*` ones as plain prefix swaps so a nav entry
 * pointing at a sub-page resolves too. Anything more complicated needs
 * path-to-regexp, which does not belong in a module client components import.
 */
export function canonicalNavHref(href: string): string {
  const literal = new Map(
    redirectRules()
      .filter((rule) => !rule.source.includes(":") && !rule.source.includes("*"))
      .map((rule) => [rule.source, rule.destination])
  );

  // The trailing-wildcard rules, as plain prefix swaps. A renamed section
  // redirects both itself and everything under it — `/old` plus
  // `/old/:path*` — and a nav entry can point at a sub-page, so matching only
  // the exact rule would normalise /take-egypt-home and leave
  // /take-egypt-home/papyrus behind. This deliberately handles ONLY the
  // `/prefix/:path*` -> `/other/:path*` form rather than pretending to be a
  // path matcher: anything more needs path-to-regexp, and this module is
  // imported by client components, where a new dependency is a real cost.
  const SUFFIX = "/:path*";
  const prefixes = redirectRules()
    .filter((rule) => rule.source.endsWith(SUFFIX) && rule.destination.endsWith(SUFFIX))
    .map((rule) => ({
      from: rule.source.slice(0, -SUFFIX.length),
      to: rule.destination.slice(0, -SUFFIX.length),
    }))
    .filter((rule) => !rule.from.includes(":") && !rule.to.includes(":"));

  const step = (path: string): string | null => {
    const exact = literal.get(path);
    // A rule whose destination needs a parameter cannot apply to a plain path.
    if (exact !== undefined && !exact.includes(":")) return exact;
    for (const { from, to } of prefixes) {
      if (path.startsWith(`${from}/`)) return `${to}${path.slice(from.length)}`;
    }
    return null;
  };

  // Transitive, so a page renamed twice still resolves, with a cap in case a
  // rule ever points in a circle.
  let current = href;
  for (let hops = 0; hops < 5; hops += 1) {
    const next = step(current);
    if (next === null || next === current) return current;
    current = next;
  }
  return current;
}
