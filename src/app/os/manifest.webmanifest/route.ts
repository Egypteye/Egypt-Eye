import { NextResponse } from "next/server";

// Makes the OS installable. A driver can add it to their home screen and it
// opens full-screen, straight into their own day, with no browser chrome and
// no app store. That is the whole reason the product is a responsive web app
// rather than something that needs distributing.
export function GET() {
  return NextResponse.json(
    {
      name: "Egypt Eye OS",
      short_name: "Egypt Eye",
      description: "The internal operating system of Egypt Eye.",
      start_url: "/os/me",
      scope: "/os",
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#0d1512",
      theme_color: "#0d1512",
      icons: [
        { src: "/brand/egypt-eye-badge-gold.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/brand/egypt-eye-badge-gold.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } },
  );
}
