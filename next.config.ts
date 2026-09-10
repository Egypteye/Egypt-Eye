import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Full Next.js server mode (Vercel) — needed for the embedded Sanity
  // Studio at /studio and for content to update without a manual rebuild.
  // If the site ever moves back to static shared hosting with no CMS,
  // see next.config.hostinger-export.ts.example for the static-export config.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        // Curated Pexels photos, used as real imagery until a matching
        // Sanity upload replaces them — see content/types.ts's SanityImage
        // union and sanity/image.ts's urlForImage().
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        // Hero photography for the destination activities, hot-linked from
        // Unsplash's own CDN rather than re-hosted — which is what the
        // Unsplash API Guidelines ask integrations to do. Each activity in
        // content/activities.ts carries the photographer and the photo's
        // Unsplash page in `imageCredit`. Served through next/image, so these
        // reach the browser from this origin and need no CSP img-src change.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Customer-uploaded profile pictures, served from the public
        // "avatars" Storage bucket (see supabase/migrations/0010_profile_avatars.sql).
        // Wildcarded so this keeps working if the project ever moves to a
        // different Supabase project.
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    // The public site (everything except /studio) loads no third-party
    // scripts and makes no client-side requests beyond same-origin /api/*
    // routes, Supabase (auth + the "avatars" storage bucket), the Sanity
    // image CDN, and the YouTube/Vimeo embeds a Story's videoEmbedBlock can
    // reference — confirmed by grepping for fetch()/script tags/external
    // clients across src/app and src/components before writing this list,
    // so tightening it here shouldn't break anything currently in use.
    // script-src still allows 'unsafe-inline' for Next's own hydration
    // bootstrap and this site's inline JSON-LD <script> tags — a stricter,
    // nonce-based policy is possible but needs middleware + per-page nonce
    // plumbing this pass doesn't attempt.
    const publicCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://cdn.sanity.io https://images.pexels.com https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        // Applies everywhere, including /admin and /account — baseline
        // hardening with no effect on normal page behavior.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
        ],
      },
      {
        // The public site gets a real CSP. /studio is excluded (see below)
        // — the embedded Sanity Studio needs a much looser policy (blob:
        // URLs, web workers, its own asset/API origins) that isn't worth
        // reverse-engineering without being able to test it live; Studio is
        // already behind Sanity's own login, so it's lower-risk to leave
        // unrestricted here than to risk silently breaking content editing.
        source: "/:path((?!studio).*)",
        headers: [{ key: "Content-Security-Policy", value: publicCsp }],
      },
    ];
  },
  async redirects() {
    return [
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
      // Yoast's attachment and feed URLs, which WordPress generated in bulk.
      { source: "/feed", destination: "/stories", permanent: true },
      { source: "/blog", destination: "/stories", permanent: true },
      { source: "/blog/:slug", destination: "/stories/:slug", permanent: true },
      // The 2025 travel-agency guide was consolidated into the 2026 guide
      // (near-duplicate content, same topic) — redirect rather than 404.
      {
        source: "/stories/best-travel-agencies-in-egypt-2025-guide",
        destination: "/stories/best-travel-agencies-in-egypt-2026-guide",
        permanent: true,
      },
      // Contact was folded into the About page (one page, not two) —
      // redirect rather than 404 for old links/bookmarks.
      {
        source: "/contact",
        destination: "/about#contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
