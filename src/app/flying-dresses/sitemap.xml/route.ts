import { packages, rentalServices } from "@/content/flyingDresses";
import { categoryPath, experienceCategories } from "@/content/flyingDressExperiences";
import { liveStories } from "@/content/flyingDressStories";
import { fdUrl } from "../_lib/seo";

/**
 * The Flying Dresses sitemap.
 *
 * Hand-written for the same reason the Egypt Eye one is (see
 * src/app/sitemap.xml/route.ts): app/sitemap.ts would reserve the path and
 * Next then refuses a route handler on it, and this brand needs its own URL
 * set on its own domain rather than entries inside the travel site's
 * per-locale sitemap index.
 *
 * /enquire is deliberately absent — it is noindex, because a pre-filled form
 * has one URL per query-string combination and none of them should compete
 * with the pages that actually sell the shoots.
 *
 * Priorities are a hint nobody is obliged to honour, and they are set from
 * what the business needs ranked: the home page, then the three shoots and the
 * three hire services, which are the products.
 *
 * =========================================================================
 * LASTMOD IS OMITTED UNLESS IT IS KNOWN, AND THAT IS THE POINT
 * =========================================================================
 * Every URL here used to carry `new Date().toISOString()`: the moment the
 * sitemap was generated, which under `revalidate = 3600` meant the whole site
 * claimed to have changed within the last hour, every hour, forever.
 *
 * That is not a harmless default. Google's own guidance is that lastmod is
 * used only when it is consistently accurate, and a site that reports
 * everything as always-just-changed teaches the crawler to ignore the field
 * on this domain — including on the pages where it would have been true and
 * useful. A wrong date is strictly worse than no date.
 *
 * So a URL carries lastmod only where the content layer actually knows one.
 * Today that is the stories, which record publishedAt and updatedAt. The
 * product and listing pages have no edit date anywhere in the content files,
 * so they say nothing rather than guessing, which is exactly what the Egypt
 * Eye sitemap beside this one already does (see lib/sitemapEntries.ts, where
 * lastModified is optional and the writer omits the element when it is
 * absent).
 */

export const revalidate = 3600;

export function GET() {
  // `lastmod` is optional on purpose. See the note above: a date we cannot
  // stand behind is worse than none.
  const urls: { path: string; priority: string; lastmod?: string }[] = [
    { path: "", priority: "1.0" },
    { path: "/experiences", priority: "0.9" },
    ...packages.map((p) => ({ path: `/experiences/${p.slug}`, priority: "0.9" })),
    { path: "/rentals", priority: "0.9" },
    ...rentalServices.map((s) => ({ path: `/rentals/${s.slug}`, priority: "0.8" })),
    // The experiences catalogue. One URL per CATEGORY and none per
    // experience: each category currently holds a single experience and the
    // category page renders it in full, so a second URL would be the same
    // page competing with itself.
    { path: "/celebrations", priority: "0.9" },
    { path: "/creative", priority: "0.9" },
    ...experienceCategories.map((c) => ({
      path: categoryPath(c),
      priority: "0.8",
    })),
    { path: "/wardrobe", priority: "0.8" },
    { path: "/packages", priority: "0.8" },
    // The stories. Below the products on purpose: these exist to be found by
    // someone who is not yet searching for a photoshoot by name, and to
    // answer them once they are here. They are not what the business sells.
    { path: "/stories", priority: "0.7" },
    // liveStories(): a draft or a researched brief has no URL, so it must not
    // be announced as one. See StoryStatus in content/flyingDressStories.ts.
    ...liveStories().map((s) => ({
      path: `/stories/${s.slug}`,
      priority: "0.6",
      // The one date on this site that is real. updatedAt when the article has
      // been revised, publishedAt otherwise.
      lastmod: new Date(s.updatedAt ?? s.publishedAt).toISOString(),
    })),
    { path: "/collaborate", priority: "0.7" },
    { path: "/faq", priority: "0.6" },
    { path: "/about", priority: "0.5" },
  ];

  const entries = urls
    .map((url) => {
      const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${fdUrl(url.path)}</loc>${lastmod}\n    <priority>${url.priority}</priority>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
