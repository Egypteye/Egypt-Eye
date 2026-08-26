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
    return [
      {
        // Applies everywhere, including /admin and /account — baseline
        // hardening with no effect on normal page behavior. A full
        // Content-Security-Policy is deliberately not included here: it
        // needs to be scoped carefully around the embedded Sanity Studio
        // at /studio (which relies on inline styles/scripts) and would
        // risk breaking it without being able to test that live from this
        // environment.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
  async redirects() {
    return [
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
