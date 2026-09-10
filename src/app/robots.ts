import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /os is the internal operating system. It is behind
        // authentication regardless, but there is no reason for a crawler to
        // spend requests discovering that.
        disallow: ["/studio", "/api/", "/os"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
