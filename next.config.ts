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
    ],
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
    ];
  },
};

export default nextConfig;
