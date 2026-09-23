import { sitemapEntriesFor, publishedLocales } from "@/lib/sitemapEntries";
import type { Locale } from "@/i18n/locales";

// One sitemap per published locale, at /sitemap/<locale>.xml.
//
// A single file covering every language reports as one number in Search
// Console, so there is no way to tell whether Arabic is being indexed at all,
// or whether one language is absorbing the crawl budget. Split per locale,
// each is submitted and reported separately, and a language that is not
// earning its crawl can be withdrawn on its own.
//
// One hour, matching the fetchers' own window. Must be a literal: Next
// analyses segment config statically and rejects an imported constant
// ("Invalid segment configuration export detected").
export const revalidate = 3600;

export async function generateStaticParams() {
  return publishedLocales().map((l) => ({ file: `${l.code}.xml` }));
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(_request: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const code = file.replace(/\.xml$/, "") as Locale;

  // Only serve a locale that is actually published. Anything else is a 404
  // rather than an empty <urlset>, which Search Console reports as an error
  // on a sitemap someone would then have to go and diagnose.
  if (!publishedLocales().some((l) => l.code === code)) {
    return new Response("Not found", { status: 404 });
  }

  const entries = await sitemapEntriesFor(code);

  const urls = entries
    .map((e) => {
      const alts = e.alternates?.languages ?? {};
      const links = Object.entries(alts)
        .map(
          ([lang, href]) =>
            `    <xhtml:link rel="alternate" hreflang="${esc(lang)}" href="${esc(String(href))}" />`
        )
        .join("\n");
      const lastmod = e.lastModified
        ? `\n    <lastmod>${new Date(e.lastModified).toISOString()}</lastmod>`
        : "";
      const freq = e.changeFrequency ? `\n    <changefreq>${e.changeFrequency}</changefreq>` : "";
      const pri = e.priority !== undefined ? `\n    <priority>${e.priority}</priority>` : "";
      return `  <url>\n    <loc>${esc(e.url)}</loc>${links ? `\n${links}` : ""}${lastmod}${freq}${pri}\n  </url>`;
    })
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
