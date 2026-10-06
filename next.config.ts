import type { NextConfig } from "next";
import { redirectRules } from "./src/content/redirectRules";

const nextConfig: NextConfig = {
  // The dev server only trusts the hostname it was started with, and blocks
  // cross-origin requests to dev assets — so opening http://127.0.0.1:3000
  // when it started on localhost returns 403 for every JS chunk, and the page
  // renders without ever hydrating. Listing both spellings means either
  // address works. Add a LAN IP here too if you test on a phone.
  //
  // Development only; `next build` ignores it.
  allowedDevOrigins: ["localhost", "127.0.0.1"],

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
    // `next dev` cannot run under this policy, and the failure is silent in a
    // way that wastes real time: React's development build uses eval() for
    // its debugging features, so with no 'unsafe-eval' React never hydrates
    // and every interactive component on the site is inert locally — buttons
    // that do nothing, forms that never submit, and no error that names the
    // cause. Hot reload needs a WebSocket that connect-src also blocks.
    //
    // Both are relaxed for development ONLY. The check is `=== "development"`
    // rather than `!== "production"` deliberately: an unset or unexpected
    // NODE_ENV must fall through to the strict policy, because the failure
    // mode of guessing wrong here is shipping eval() to real visitors.
    //
    // `next build` and `next start` both set NODE_ENV=production, so a
    // deployed site never sees these. scripts/check-csp.mts asserts that.
    const isDev = process.env.NODE_ENV === "development";
    const devScript = isDev ? " 'unsafe-eval'" : "";
    const devConnect = isDev ? " ws: http://localhost:* http://127.0.0.1:*" : "";

    // PayPal's checkout buttons run in the booking dialog, which means the
    // SDK script, the iframes it opens, the calls it makes and the card-brand
    // images it draws all have to be allowed through.
    //
    // Listed host by host rather than as https://*.paypal.com, deliberately.
    // A wildcard would be shorter and would also admit every other subdomain
    // PayPal has, now and in future, which is more trust than taking a payment
    // requires. These are the four origins the v2 buttons actually use.
    //
    // The order is kept in one place because scripts/check-csp.mts asserts it:
    // if PayPal's origins ever disappear from here the buttons stop rendering
    // with a console error nobody is watching for, and the only visible
    // symptom is that deposits quietly stop being paid.
    const paypal = [
      "https://www.paypal.com",
      "https://www.sandbox.paypal.com",
      "https://www.paypalobjects.com",
      "https://c.paypal.com",
    ].join(" ");

    const publicCsp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${paypal}${devScript}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: https://cdn.sanity.io https://images.pexels.com https://*.supabase.co ${paypal}`,
      "font-src 'self' data:",
      `connect-src 'self' https://*.supabase.co ${paypal}${devConnect}`,
      `frame-src 'self' https://www.youtube.com https://player.vimeo.com ${paypal}`,
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
    // The list itself lives in src/content/redirectRules.ts so it can be
    // tested without a server — see scripts/check-redirects.mts.
    return redirectRules();
  },
};

export default nextConfig;
