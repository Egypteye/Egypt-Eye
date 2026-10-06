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
