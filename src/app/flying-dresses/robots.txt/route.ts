import { fdSiteUrl } from "../_lib/seo";

/**
 * robots.txt for the Flying Dresses domain.
 *
 * A route handler rather than an app/robots.ts metadata export, because
 * robots.ts is generated once at build time and cannot vary by host — and this
 * deployment answers on two domains with two different robots policies. The
 * Egypt Eye one stays at src/app/robots.ts; src/proxy.ts maps
 * flyingdressesegypt.com/robots.txt onto this file.
 *
 * /api/ is disallowed because the enquiry endpoint is a POST target, not a
 * page, and there is nothing in it for a crawler.
 */

export const revalidate = 3600;

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Sitemap: ${fdSiteUrl}/flying-dresses/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
