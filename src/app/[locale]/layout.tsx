import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Noto_Kufi_Arabic } from "next/font/google";
import "../globals.css";
import { site } from "@/content/site";
import { siteUrl } from "@/content/seo";
import { LOCALES, isLocale, localeInfo, DEFAULT_LOCALE, type Locale } from "@/i18n/locales";
import { dictionaryFor } from "@/i18n/dictionary";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { alternatesFor } from "@/i18n/alternates";

// Cyrillic is in the body face's subsets because Russian is one of the
// supported languages and Cormorant covers it; without it every Russian page
// would silently fall back to a system serif.
const cormorant = Cormorant_Garamond({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "cyrillic"],
});

const cinzel = Cinzel({
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Neither brand face has Arabic glyphs, so Arabic would render in whatever
// the device happens to have. Noto Kufi carries the same upright, inscriptional
// feel the Cinzel headings have, which keeps the Arabic site recognisably the
// same brand rather than a default-system version of it.
const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
});

export function generateStaticParams() {
  return LOCALES.map((l) => ({ locale: l.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = dictionaryFor(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${site.name} | ${dict.seo.homeTitle}`,
      template: `%s | ${site.shortName}`,
    },
    description: site.description,
    alternates: alternatesFor("/", locale),
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: localeInfo(locale).htmlLang,
      title: `${site.name} | ${dict.seo.homeTitle}`,
      description: site.description,
      images: ["/brand/egypt-eye-badge-gold.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} | ${dict.seo.homeTitle}`,
      description: site.description,
      images: ["/brand/egypt-eye-badge-gold.png"],
    },
    robots: { index: true, follow: true },
  };
}

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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: siteUrl,
};

// The root layout sits under [locale] so `lang` and `dir` can follow the URL
// — the one place they can be set — and so `locale` becomes a root param that
// any Server Component can read without prop drilling (next/root-params).
// Kept minimal on purpose: the marketing chrome lives in (site)/layout.tsx.
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const info = localeInfo(locale);
  const dict = dictionaryFor(locale);

  return (
    <html
      lang={info.htmlLang}
      dir={info.dir}
      className={`${cormorant.variable} ${cinzel.variable} ${notoKufi.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-sand text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <LocaleProvider locale={locale} dict={dict}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
