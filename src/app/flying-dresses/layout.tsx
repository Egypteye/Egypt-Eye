import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost, Sacramento } from "next/font/google";
import "./brand.css";
import { flyingDressEnquiry, whatsappHref } from "@/content/flyingDresses";
import { fdSettings } from "./_lib/content";
import { FlyingDressesHeader } from "./_components/Header";
import { FlyingDressesFooter } from "./_components/Footer";
import { StickyEnquire } from "./_components/StickyEnquire";
import { Analytics } from "./_components/Analytics";
import { brandCover, brandLogo } from "./_lib/logo";
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
// text; the script has a single weight and is used for at most one phrase per
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

/**
 * THE SIGNATURE HAND.
 *
 * Was Italianno, a formal copperplate calligraphy with hairline strokes. It
 * is beautiful at 80px on a wedding invitation and it disappears at the sizes
 * this brand actually uses it: one or two words crossing a headline, in red,
 * at roughly 1.35em of the heading around it. Hairlines at that size on a
 * warm white simply go grey.
 *
 * Sacramento is a signature hand rather than a calligraphic one: a single
 * monoline weight, so it holds its colour at small sizes and reads as
 * handwriting rather than as penmanship. That is what the references the
 * owner supplied are doing with their red script.
 */
const sacramento = Sacramento({
  variable: "--font-fd-script",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const cover = brandCover();

/**
 * ASYNC NOW, because the business name, tagline and description are editable.
 *
 * This was `export const metadata`, evaluated at module load from the content
 * file — which meant renaming the business in the Studio changed every page
 * EXCEPT the title and the share card, the two places a rename is most
 * visible. A static export cannot await a fetch, so it became a function.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await fdSettings();
  return {
  metadataBase: new URL(fdSiteUrl),
  ...fdMetadata({
    title: `${brand.name} | ${brand.tagline}`,
    description: brand.description,
  }),
  // The share card every pasted link renders as. Emitted only when the file
  // is actually present — see brandCover(). Set on the root layout so every
  // page inherits it; a page that wants its own can override `openGraph`.
  ...(cover
    ? {
        openGraph: {
          type: "website",
          siteName: brand.name,
          title: `${brand.name} | ${brand.tagline}`,
          description: brand.description,
          url: fdSiteUrl,
          images: [{ url: cover, width: 1200, height: 630, alt: brand.name }],
        },
        twitter: { card: "summary_large_image", images: [cover] },
      }
    : {}),
  /* NO `icons` KEY HERE ANY MORE — ON PURPOSE.
     ----------------------------------------------------------------------
     This used to be an inline SVG data URI: a brown square with a gold "F"
     set in `font-family="Didot,Georgia,serif"`. Two things were wrong with
     it. Didot is not installed on most machines and the brand's display face
     is Bodoni Moda, so nearly every visitor saw the letter in whatever serif
     their device fell back to — a typeface belonging to no one. And it was
     a stand-in written before the owner had sent any logo files, which then
     stayed after they arrived.

     `icon.png` and `apple-icon.png` now sit beside this file, and Next's file
     convention picks them up without a metadata key. They are cut from the
     owner's own logo: the capital F is the real letterform from the supplied
     artwork, not a letter re-set in a substitute font, and the Apple icon is
     the full two-line lockup, which has the room to be read at 180px.

     A single wide lockup cannot do both jobs — at 32px a two-line wordmark is
     a smudge — which is why the small icon is one glyph from it. Checked by
     rendering at 16, 32 and 48px before committing.

     Removing the key rather than pointing it at the files matters: a metadata
     `icons` entry overrides the file convention, so leaving it would have kept
     the old SVG winning over the new PNGs. */
  };
}

export const viewport: Viewport = {
  themeColor: "#3a2e1c",
  // Deliberately NOT maximum-scale or user-scalable:no. Pinch-zoom is an
  // accessibility requirement (WCAG 2.2, 1.4.4 Resize Text) and locking it is
  // a common luxury-site mistake.
  width: "device-width",
  initialScale: 1,
};

export default async function FlyingDressesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolved here, in a Server Component, because it reads the filesystem.
  const logo = brandLogo();

  // The header is a client component (it owns the drawer's open/closed
  // state), so it cannot fetch. Everything editable it displays — the menu,
  // the business name, the WhatsApp number behind its button — is read here
  // and handed down.
  const settings = await fdSettings();
  const whatsappUrl = whatsappHref(flyingDressEnquiry(), settings.contact.whatsappNumber);

  return (
    <html lang="en" className={`${bodoni.variable} ${jost.variable} ${sacramento.variable}`}>
      <body>
        <a className="fd-skip" href="#fd-main">
          Skip to content
        </a>
        <FlyingDressesHeader logo={logo.dark} settings={settings} whatsappUrl={whatsappUrl} />
        {/* The bottom padding class makes room for the phone-only sticky
            action bar, so it never covers the footer's last row. */}
        <main id="fd-main" className="fd-has-sticky-cta">
          {children}
        </main>
        <FlyingDressesFooter logo={logo.light} />
        <StickyEnquire />
        {/* Renders nothing at all until a measurement ID is configured. */}
        <Analytics />
        <script
          type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: fdJsonLd(fdOrganizationJsonLd()) }}
        />
      </body>
    </html>
  );
}
