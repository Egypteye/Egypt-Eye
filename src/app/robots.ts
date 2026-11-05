import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/seo";
import { robotsDisallows } from "@/content/robotsPolicy";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /flying-dresses WAS DISALLOWED HERE AND IS NOT ANY MORE, which is
        // the opposite of what it looks like.
        //
        // The second brand used to be served from this domain too, so the
        // owner could review it before flyingdressesegypt.com had DNS, and
        // the Disallow kept those duplicates out of the index. On 1 November
        // 2026 the owner confirmed the copy is no longer needed and the proxy
        // now 308s /flying-dresses/* to the brand's own domain.
        //
        // A Disallow would defeat that. Google cannot follow a redirect on a
        // URL it is not allowed to fetch, so any of these addresses already
        // in the index would sit there forever, unable to be consolidated.
        // Allowing the crawl is what lets the redirect do its job, and there
        // is no content left here to index either way.
        //
        // /os is the internal workspace: guest names, phone numbers and what
        // each booking was sold for. It is gated server-side, so listing it
        // here only keeps the URLs out of search results — it is not the
        // thing keeping anyone out.
        //
        // The rest of the list is the unpublished languages, generated rather
        // than written down so it cannot disagree with the sitemap: see
        // content/robotsPolicy.ts for why their crawl is blocked when their
        // indexing is already handled by `noindex`, and what the one-line
        // change is when a language is ready to publish.
        disallow: robotsDisallows(),
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
