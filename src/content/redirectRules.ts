// Every URL this site redirects, in one list.
//
// It lives here rather than inline in next.config.ts for the same reason
// storyRedirectRules does: a redirect's failure mode is silent — the page
// 404s, Google drops it, and the first signal is a traffic report weeks
// later — so the rules have to be testable without starting a server.
// scripts/check-redirects.mts imports this and matches real URLs against it
// with the same path-to-regexp Next compiles it with.
import { storyRedirectRules } from "./redirectedStories";
import { GOOGLE_REVIEW_URL } from "./googleReviews";
// Imported rather than retyped: the second brand's address has one
// definition, in the content file that owns the brand. A hardcoded copy here
// would be a second place to forget if the domain ever changes.
import { brand as flyingDressesBrand } from "./flyingDresses";

const FLYING_DRESSES_URL = flyingDressesBrand.url;

export type RedirectRule = {
  source: string;
  destination: string;
  permanent: boolean;
};

export function redirectRules(): RedirectRule[] {
  return [
    // The short review link to hand out: WhatsApp follow-ups, QR codes,
    // business cards. Straight out to Google, no page in between.
    //
    // Temporary (302), not permanent, and that is the whole decision here. A
    // 301 is cached by the browser indefinitely and there is no way to call
    // it back — if the Google listing's review URL ever changes, everyone who
    // already used this link would keep being sent to the old one, and the
    // only fix would be a different URL on everything already printed.
    //
    // The destination is imported rather than retyped so there is still one
    // definition of the review URL; check-review-page.mts asserts nothing
    // hardcodes a second copy.
    { source: "/google_review", destination: GOOGLE_REVIEW_URL, permanent: false },
    // The same link with a hyphen, because that is what people type and what
    // autocorrect produces. One line, and it stops a predictable mistype
    // becoming a 404 on a card that is already in someone's wallet.
    { source: "/google-review", destination: GOOGLE_REVIEW_URL, permanent: false },

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

    // ---------------------------------------------------------------------
    // URLs Google still ranks that returned 404.
    //
    // Found by testing every URL in a Search Console export against the live
    // site: 27 of them answered 404, carrying 629 impressions and 6 real
    // clicks over three months. Several were on page one — the private
    // photoshoot page at position 9.1, a luxury tour at 7.1, an award page at
    // 4.8 — so these are not dead weight, they are live search results that
    // land on nothing.
    //
    // None of them were in this file. check-redirects passed throughout,
    // because it can only check the rules that exist; a URL nobody listed is
    // a URL nobody checks. check-seo-404s.mts now pins this specific set.
    //
    // 301 throughout: these are permanent renames from the WordPress site, and
    // a 301 is what passes the old URL's ranking to the new one. A 302 here
    // would keep the value stranded on a page that does not exist.
    //
    // WHERE A MAPPING WAS NOT OBVIOUS, THE DESTINATION IS THE CATEGORY, NOT A
    // GUESS. Sending someone searching for one tour to a different tour is
    // worse than showing them the list and letting them choose — and it would
    // be inventing a product equivalence nobody confirmed.
    // ---------------------------------------------------------------------

    // Tours whose slug changed in the rebuild. Same product, new address.
    { source: "/tours/private-luxury-tour-of-egypt", destination: "/tours/10-day-private-luxurious-trip", permanent: true },
    { source: "/tours/best-of-egypt-in-10-days", destination: "/tours/10-day-private-luxurious-trip", permanent: true },
    { source: "/tours/cairo-giza-luxor-trip-6-days", destination: "/tours/6-day-cairo-giza-luxor", permanent: true },
    { source: "/tours/siwa-oasis-3-days-package-from-cairo", destination: "/tours/siwa-oasis", permanent: true },
    { source: "/tours/dahshour-sakkara-and-memphis", destination: "/tours/memphis-saqqara-dahshur-tour", permanent: true },
    { source: "/tours/egypt-giza-alexandria-khan-el-khalili-pyramids-old-cairo-tour", destination: "/tours/5-day-giza-cairo-alexandria", permanent: true },

    // Ambiguous tours. The old "pyramids + Egyptian Museum" day tour has no
    // single successor — the museum tour here does not include the pyramids
    // and the Giza tour does not include the museum. Same for the old
    // pyramids/cruise/Abu Simbel package, which maps equally badly onto the
    // 8-day cruise and the Aswan & Abu Simbel tour. The list is the honest
    // answer.
    { source: "/tours/tour-to-pyramids-the-egyptian-museum", destination: "/tours", permanent: true },
    { source: "/tours/pyramids-nile-cruise-abu-simbel", destination: "/tours", permanent: true },

    // Experiences whose slug changed.
    { source: "/experiences/atv-quad-bikes-at-pyramidss-desert", destination: "/experiences/atv-quad-bikes-sahara", permanent: true },
    { source: "/experiences/nile-cruise-dinner-belly-dancer-oriental-shows", destination: "/experiences/nile-cruise-dinner-show", permanent: true },
    { source: "/experiences/egypt-horse-riding-photography", destination: "/photoshoots/jumping-horse-photoshoot", permanent: true },

    // THE ONE I DELIBERATELY DID NOT MAP TO A PRODUCT.
    //
    // /experiences/425 is the second-best performing page on the site — 13
    // clicks at position 5.0 — and the rule further down already sends every
    // numeric WordPress id to /experiences, pinned by a check.
    //
    // I nearly overrode it to /photoshoots on the theory that 425 was a
    // photoshoot product. That theory rests on nothing: the id is recorded
    // nowhere in this repository, and the photo-related queries it probably
    // serves ("photosession" at position 1, "photographer hire" at 3) are
    // served just as well by /experiences, which does carry photography
    // products — photographer-by-the-hour, zamalek-private-photoshoot and
    // cairo-photography-class. Pointing it at a specific product would be
    // exactly the invented equivalence this block's header warns against.
    //
    // Same for the named version. "Private photoshoot with professional
    // photographer" is close to several live products and identical to none,
    // and it lived under /experiences, so that is where it goes.
    //
    // Only the owner knows what these two pages were. If they say, both
    // become one-line changes to a specific product.
    { source: "/experiences/private-photoshoot-with-professional-photographer", destination: "/experiences", permanent: true },

    // Old section and category pages.
    { source: "/contact-us", destination: "/about#contact", permanent: true },
    { source: "/customized-tours", destination: "/customize", permanent: true },
    { source: "/multi-day-tours", destination: "/tours", permanent: true },
    { source: "/populartours", destination: "/tours", permanent: true },
    { source: "/tour_category/:slug", destination: "/tours", permanent: true },
    { source: "/faqs/about-us", destination: "/faq", permanent: true },
    { source: "/faqs/:slug", destination: "/faq", permanent: true },
    { source: "/extra-experiences", destination: "/experiences", permanent: true },
    { source: "/extra-experiences/:slug", destination: "/experiences", permanent: true },

    // Featured-traveller pages from the old site. The reviews they showed now
    // live on the reviews wall.
    { source: "/award-winning/:slug", destination: "/testimonials", permanent: true },

    // German was never published. /de is indexed and 404s; the site does not
    // speak German, so the English home page is where it belongs.
    { source: "/de", destination: "/", permanent: true },

    // Three WordPress posts whose slug did NOT survive the rebuild, so the
    // generic /:year/:month/:day/:slug rule below sends them to a /stories/
    // address that does not exist — a redirect into a 404, which is worse
    // than the 404 it replaced because it hides the cause. These must stay
    // ABOVE that rule: Next matches in order.
    { source: "/2024/:month(\\d{2})/:day(\\d{2})/7-best-spots-for-diving-in-egypt", destination: "/stories/is-scuba-diving-in-egypt-worth-it", permanent: true },
    { source: "/2024/:month(\\d{2})/:day(\\d{2})/embracing-egypts-rich-tapestry-a-solo-journey-through-siwa-giza-and-cairo", destination: "/stories/siwa-oasis-travel-guide", permanent: true },
    // No "best beaches" story exists to receive this one, and naming a
    // different coast guide as its successor would be inventing an
    // equivalence. The stories index is the honest destination.
    { source: "/2024/:month(\\d{2})/:day(\\d{2})/12-best-beach-in-egypt-to-hit-in-2024", destination: "/stories", permanent: true },

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

    // THE FLYING DRESSES SHORT FORMS, WHICH WERE LEFT 404ing ON THIS DOMAIN.
    //
    // When the second brand was served from this domain its pages answered at
    // two shapes: /packages and /flying-dresses/packages. src/proxy.ts fixed
    // that by 308ing the short form to the long one, and later the long form
    // started 308ing to flyingdressesegypt.com — but the short form was
    // dropped from the chain somewhere in between, so on 4 November 2026 all
    // six answered 404 while their long forms redirected correctly.
    //
    // These are not guesses. src/proxy.ts records the impressions Search
    // Console had already attributed to the short forms when the duplication
    // was found: /packages 26 and /rentals 53. Those are indexed URLs on this
    // domain, and a 404 is where that search presence has been going.
    //
    // Cross-domain and permanent, because the content genuinely moved
    // domains: the same 301 the long forms already get, applied one hop
    // earlier. /collaborate is NOT here — Egypt Eye has its own page at that
    // address, which answers 200 and must not be sent anywhere.
    //
    // The cost is that this domain gives up these six paths. If Egypt Eye
    // ever wants /packages for tour packages, delete that line — but it needs
    // to be a decision, not a surprise, which is why it is written down.
    ...["packages", "rentals", "wardrobe", "celebrations", "creative", "enquire"].flatMap(
      (slug): RedirectRule[] => [
        {
          source: `/${slug}`,
          destination: `${FLYING_DRESSES_URL}/${slug}`,
          permanent: true,
        },
        {
          source: `/${slug}/:path*`,
          destination: `${FLYING_DRESSES_URL}/${slug}/:path*`,
          permanent: true,
        },
      ]
    ),

    // CONVENTIONAL OLD SLUGS, AND WHY THESE AND NOT THE OTHER THIRTY.
    //
    // Unlike every rule above, these are NOT from a Search Console export —
    // they came from probing the patterns a WordPress travel site has and
    // seeing which answered 404. So the evidence is weaker and the bar has to
    // be higher: each one below is either WordPress's own default slug for a
    // page this site really has (/privacy-policy, /terms-and-conditions) or
    // the plural/singular of a page that exists (/photoshoot). Nothing here
    // invents a page.
    //
    // Deliberately NOT added, though all of them 404: /team, /our-story,
    // /services, /prices, /pricing, /news, /gallery, /portfolio, /book-now,
    // /cart, /checkout, /login, /register, /my-account. Each would need a
    // guess about what the old site's structure was or which page the visitor
    // wanted, and a 301 to the wrong page is worse than a 404 — it spends the
    // click and tells Google the two pages are the same thing. They stay 404
    // until a Search Console export shows one of them actually earning
    // impressions.
    //
    // /wp-login.php, /category/*, /tag/*, /author/* and the date archives are
    // not here either, and should not be: those are exploit scans and crawler
    // noise, and 404 is the correct, cheapest answer to both.
    { source: "/about-us", destination: "/about", permanent: true },
    { source: "/privacy-policy", destination: "/privacy", permanent: true },
    { source: "/terms-and-conditions", destination: "/terms", permanent: true },
    { source: "/terms-of-service", destination: "/terms", permanent: true },
    { source: "/reviews", destination: "/testimonials", permanent: true },
    { source: "/photoshoot", destination: "/photoshoots", permanent: true },
    { source: "/photo-shoots", destination: "/photoshoots", permanent: true },
    { source: "/shop", destination: "/boutique", permanent: true },
    { source: "/store", destination: "/boutique", permanent: true },
    { source: "/egypt-tours", destination: "/tours", permanent: true },
    { source: "/day-tours", destination: "/tours", permanent: true },
    { source: "/our-tours", destination: "/tours", permanent: true },
    { source: "/tour", destination: "/tours", permanent: true },
    { source: "/nile-cruises", destination: "/tours", permanent: true },
    { source: "/destinations", destination: "/explore-egypt", permanent: true },
    // Not /sitemap.xml — that is the real file. This is the extensionless
    // form a person types, which Yoast used to serve.
    { source: "/sitemap", destination: "/sitemap.xml", permanent: true },
  ];
}
