import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /flying-dresses is a SECOND BRAND on its own domain
        // (flyingdressesegypt.com) that happens to be served from this same
        // app — see src/proxy.ts. Its pages stay reachable on this domain so
        // the owner can review them before DNS is pointed, but they must not
        // be indexed here: the same pages on two domains are duplicates, and
        // a fashion brand's pages ranking under a tour operator's domain
        // helps neither. Their canonical URLs all point at
        // flyingdressesegypt.com, and that domain serves its own robots.txt
        // from src/app/flying-dresses/robots.txt/route.ts.
        disallow: ["/studio", "/api/", "/flying-dresses"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
