import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /os is the internal workspace: guest names, phone numbers and what
        // each booking was sold for. It is gated server-side, so this only
        // keeps the URLs out of search results — it is not the thing keeping
        // anyone out.
        disallow: ["/studio", "/api/", "/os"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
