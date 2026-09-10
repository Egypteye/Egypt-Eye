import type { Metadata, Viewport } from "next";
import { osFont } from "./fonts";

// The outer OS layout: the font, the theme wrapper, and nothing else.
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
  return <div className={osFont.variable}>{children}</div>;
}
