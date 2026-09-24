import type { Metadata, Viewport } from "next";
import { Cinzel } from "next/font/google";
import "../globals.css";
import { osFont } from "./fonts";

// Cinzel is here only for `.os-wordmark` — the small EGYPT EYE lockup on the
// sign-in screen, the sidebar and the printed trip brief. Everything else in
// the OS is Inter.
const cinzel = Cinzel({
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// The OS root layout: <html>, <body>, the stylesheet and the fonts.
//
// It carries <html>/<body> itself because the site's root layout moved under
// app/[locale] to hold `lang` and `dir` for the seven languages, and /os is
// not part of that tree — it is an internal English tool. Without this the OS
// has no root layout, no stylesheet, and does not render. /studio solves the
// same problem the same way, in app/studio/layout.tsx.
//
// It deliberately does NOT gate on authentication, because /os/sign-in lives
// under it and a gate here would redirect the sign-in page to itself. The
// authenticated shell is one level down, in (app)/layout.tsx, which every
// real screen sits inside.
export const metadata: Metadata = {
  title: { default: "Egypt Eye OS", template: "%s · Egypt Eye OS" },
  description: "The internal operating system of Egypt Eye.",
  robots: { index: false, follow: false, nocache: true },
  manifest: "/os/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Egypt Eye OS", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0d1512",
  width: "device-width",
  initialScale: 1,
  // Field staff pinch to zoom a pickup address in bright sun. Locking that
  // out to look more "app-like" would be a real accessibility cost for a
  // cosmetic gain.
  maximumScale: 5,
};

export default function OsRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${osFont.variable} ${cinzel.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
