import { packages, rentalServices } from "@/content/flyingDresses";
import { categoryPath, experienceCategories } from "@/content/flyingDressExperiences";
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
 */

export const revalidate = 3600;

export function GET() {
  const lastmod = new Date().toISOString();

  const urls: { path: string; priority: string }[] = [
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
    { path: "/collaborate", priority: "0.7" },
    { path: "/faq", priority: "0.6" },
    { path: "/about", priority: "0.5" },
  ];

  const entries = urls
    .map(
      (url) =>
        `  <url>\n    <loc>${fdUrl(url.path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${url.priority}</priority>\n  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
