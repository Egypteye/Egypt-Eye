import { siteUrl } from "@/content/seo";
import { publishedLocales } from "@/lib/sitemapEntries";

// The sitemap index.
//
// Written by hand rather than through app/sitemap.ts: under
// generateSitemaps() that convention serves the children at
// /sitemap/<locale>.xml but leaves /sitemap.xml a 404, and it still reserves
// the path, so Next refuses a route handler there ("Conflicting route and
// metadata"). /sitemap.xml is the URL robots.txt advertises and the one
// already submitted in Search Console — losing it would turn a working
// sitemap into "Sitemap could not be read" on the address Google has.
// One hour, matching the fetchers' own window. Must be a literal: Next
// analyses segment config statically and rejects an imported constant
// ("Invalid segment configuration export detected").
export const revalidate = 3600;

export function GET() {
  const published = publishedLocales();
  const lastmod = new Date().toISOString();

  const entries = published
    .map(
      (l) =>
        `  <sitemap>\n    <loc>${siteUrl}/sitemap/${l.code}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
