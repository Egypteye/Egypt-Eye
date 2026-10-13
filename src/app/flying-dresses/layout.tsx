import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Italianno, Jost } from "next/font/google";
import "./brand.css";
import { brand } from "@/content/flyingDresses";
import { FlyingDressesHeader } from "./_components/Header";
import { FlyingDressesFooter } from "./_components/Footer";
import { StickyEnquire } from "./_components/StickyEnquire";
import { brandLogo } from "./_lib/logo";
import { fdJsonLd, fdMetadata, fdOrganizationJsonLd, fdSiteUrl } from "./_lib/seo";

/**
 * A SECOND ROOT LAYOUT.
 *
 * This app has no src/app/layout.tsx. The Egypt Eye site's root layout lives
 * at app/[locale]/layout.tsx and the CMS has its own at app/studio — so a
 * third sibling that owns its own <html> is the pattern already in use here,
 * not a novelty introduced for this brand.
 *
 * What that buys: this brand gets its own document language, its own fonts,
 * its own stylesheet and its own chrome, and NOTHING it does can affect the
 * travel site. There is no shared provider, no shared nav, no shared palette
 * and no shared Tailwind theme to collide over.
 *
 * It also means this layout must be complete: <html>, <body>, lang, and the
 * viewport and metadata that would otherwise be inherited.
 */

// Only the weights actually used, listed explicitly rather than taking the
// variable font's whole range. Bodoni is display-only here and needs italic
// (the pull-quotes and the one-word accents); Jost carries all body and UI
// text; Italianno has a single weight and is used for at most one phrase per
// page. `display: "swap"` everywhere so text is never invisible while a font
// loads — a didone that arrives 200ms late is a reflow, a blank headline is a
// failed LCP.
const bodoni = Bodoni_Moda({
  variable: "--font-fd-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-fd-sans",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const italianno = Italianno({
  variable: "--font-fd-script",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(fdSiteUrl),
  ...fdMetadata({
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
  }),
  icons: {
    // Inline SVG favicon: a hairline "F" in the brand gold on ink. Data URI
    // rather than a file so this brand does not borrow Egypt Eye's icon.png,
    // which sits at the app root and would otherwise be inherited.
    icon: [
      {
        url:
          "data:image/svg+xml," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
              '<rect width="32" height="32" fill="#14110f"/>' +
              '<text x="16" y="23" font-family="Didot,Georgia,serif" font-size="20" fill="#c9a85f" text-anchor="middle">F</text>' +
              "</svg>"
          ),
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#14110f",
  // Deliberately NOT maximum-scale or user-scalable:no. Pinch-zoom is an
  // accessibility requirement (WCAG 2.2, 1.4.4 Resize Text) and locking it is
  // a common luxury-site mistake.
  width: "device-width",
  initialScale: 1,
};

export default function FlyingDressesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolved here, in a Server Component, because it reads the filesystem.
  const logo = brandLogo();

  return (
    <html lang="en" className={`${bodoni.variable} ${jost.variable} ${italianno.variable}`}>
      <body>
        <a className="fd-skip" href="#fd-main">
          Skip to content
        </a>
        <FlyingDressesHeader logo={logo.dark} />
        {/* The bottom padding class makes room for the phone-only sticky
            action bar, so it never covers the footer's last row. */}
        <main id="fd-main" className="fd-has-sticky-cta">
          {children}
        </main>
        <FlyingDressesFooter logo={logo.light} />
        <StickyEnquire />
        <script
          type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: fdJsonLd(fdOrganizationJsonLd()) }}
        />
      </body>
    </html>
  );
}
