import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

// Falls back to the current Vercel URL until a custom domain is attached —
// set NEXT_PUBLIC_SITE_URL in Vercel's env vars once one is, so canonical
// URLs and Open Graph links point at the real domain instead.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://egypt-eye.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: ["/brand/egypt-eye-badge-gold.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: ["/brand/egypt-eye-badge-gold.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: site.name,
  description: site.description,
  url: siteUrl,
  logo: `${siteUrl}/brand/egypt-eye-badge-gold.png`,
  email: site.contact.email,
  telephone: site.contact.whatsapp,
  sameAs: Object.values(site.socials).filter(Boolean),
};

// Kept deliberately minimal (just fonts + <html>/<body>) so the /studio
// route — which needs a full-screen app shell, not the marketing site's
// navbar/footer — can render cleanly. The site's chrome lives one level
// down, in app/(site)/layout.tsx.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-sand text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
