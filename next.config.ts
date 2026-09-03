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
        //
        // /os is excluded from THIS policy and given its own, stricter one
        // below: the internal operating system loads no third-party anything,
        // so it can afford a tighter list than the marketing site.
        source: "/:path((?!studio|os).*)",
        headers: [{ key: "Content-Security-Policy", value: publicCsp }],
      },
      {
        // Egypt Eye OS. Deliberately tighter than the public site's policy:
        // the OS loads no third-party scripts, styles, fonts or images at
        // all. Its only network destinations are same-origin API routes and
        // Supabase (auth plus the avatars storage bucket), and the only
        // remote images it renders are employee avatars from that bucket.
        //
        // frame-ancestors 'none' is deliberate — an internal operations tool
        // has no reason to be embeddable anywhere, and clickjacking a
        // "confirm this assignment" button is a real if unglamorous risk.
        source: "/os/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co",
              "frame-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // Internal operational data must never be cached by an
          // intermediary, and must never be indexed.
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, must-revalidate" },
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
