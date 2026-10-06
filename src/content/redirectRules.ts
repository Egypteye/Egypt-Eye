// Every URL this site redirects, in one list.
//
// It lives here rather than inline in next.config.ts for the same reason
// storyRedirectRules does: a redirect's failure mode is silent — the page
// 404s, Google drops it, and the first signal is a traffic report weeks
// later — so the rules have to be testable without starting a server.
// scripts/check-redirects.mts imports this and matches real URLs against it
// with the same path-to-regexp Next compiles it with.
import { storyRedirectRules } from "./redirectedStories";

export type RedirectRule = {
  source: string;
  destination: string;
  permanent: boolean;
};

export function redirectRules(): RedirectRule[] {
  return [
    // The old WordPress/Yoast sitemap URLs. Search Console keeps fetching
    // whatever sitemap URL was submitted years ago, and a submission that
    // 404s is reported as "Sitemap could not be read" with 0 discovered
    // pages — which is indistinguishable, from inside GSC, from the
    // sitemap itself being broken. Pointing the old names at the real one
    // makes an existing submission start working without anyone having to
    // re-submit it.
    { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
    { source: "/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
    { source: "/sitemap-index.xml", destination: "/sitemap.xml", permanent: true },

    // WordPress date permalinks from the previous site — /2024/04/01/some-post.
    // Search Console reports 24 of these as 404s, and they are where most of
    // the domain's remaining search visibility still points. Mapping the
    // pattern to /stories/:slug recovers every post whose slug survived the
    // rebuild; anything that didn't still 404, exactly as it does today, so
    // this costs nothing where it can't help.
    {
      source: "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug",
      destination: "/stories/:slug",
      permanent: true,
    },
    // Story URLs that were retired — rewritten under a different slug, or
    // merged into another article. The list lives in one place because the
    // sitemap and the Sanity purge endpoint have to agree with it; see
    // src/content/redirectedStories.ts.
    ...storyRedirectRules(),

    // Yoast's attachment and feed URLs, which WordPress generated in bulk.
    { source: "/feed", destination: "/stories", permanent: true },
    { source: "/blog", destination: "/stories", permanent: true },
    { source: "/blog/:slug", destination: "/stories/:slug", permanent: true },
    // Contact was folded into the About page (one page, not two) —
    // redirect rather than 404 for old links/bookmarks.
    {
      source: "/contact",
      destination: "/about#contact",
      permanent: true,
    },

    // WordPress numeric post IDs. The previous site addressed pages by ID,
    // and Search Console still shows those URLs being requested —
    // /experiences/425 alone accounts for most of the domain's remaining
    // impressions. The ID is meaningless to this site (slugs replaced it and
    // the mapping wasn't kept), so each one goes to the listing it belonged
    // to: the same category of content the visitor was after, which is what
    // Google asks for when the exact page can't be identified. A 404 there
    // throws away a live inbound link; the listing keeps it.
    // The Boutique was called "Take Egypt Home" and lived at
    // /take-egypt-home until the rename. These four rules are the whole
    // reason the rename is safe: a 301 tells Google the page MOVED rather
    // than vanished, so the ranking the old address earned transfers to the
    // new one, and every link already shared — in an email, a DM, an
    // Instagram bio — still arrives somewhere real.
    //
    // Four rules rather than two because English keeps the bare path while
    // every other language is prefixed (see i18n/locales.ts localePath), so
    // /fr/take-egypt-home is a real URL that also has to move. The exact
    // sources come first: :path* matches zero segments, but spelling the
    // bare page out leaves no doubt about the trailing slash.
    { source: "/take-egypt-home", destination: "/boutique", permanent: true },
    { source: "/take-egypt-home/:path*", destination: "/boutique/:path*", permanent: true },
    {
      source: "/:locale(ar|fr|es|it|ru)/take-egypt-home",
      destination: "/:locale/boutique",
      permanent: true,
    },
    {
      source: "/:locale(ar|fr|es|it|ru)/take-egypt-home/:path*",
      destination: "/:locale/boutique/:path*",
      permanent: true,
    },

    { source: "/experiences/:id(\\d+)", destination: "/experiences", permanent: true },
    { source: "/tours/:id(\\d+)", destination: "/tours", permanent: true },
    { source: "/photoshoots/:id(\\d+)", destination: "/photoshoots", permanent: true },
    { source: "/stories/:id(\\d+)", destination: "/stories", permanent: true },
  ];
}
