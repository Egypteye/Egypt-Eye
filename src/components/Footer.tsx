import Link from "next/link";
import Image from "next/image";
import type { ResolvedSiteSettings } from "@/content/types";
import { Container } from "./Container";
import { SocialLinks } from "./SocialLinks";
import { WhatsAppBookButton } from "./WhatsAppBookButton";
import { LanguageLinks } from "./LanguageLinks";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { T } from "@/i18n/T";
import { FOOTER_SECTIONS } from "@/content/navGroups";

// The footer, and the site's complete map.
//
// It used to be one column headed "Explore" holding every nav item in order —
// thirteen links nobody reads to the end of. Now it is the grouping in
// content/navGroups.ts, which matters more than it looks: the header no longer
// shows Explore Egypt, Weekly Trips, Partner With Us or Traveler Reviews, so
// this is where those pages are found. scripts/check-nav.mts asserts that
// every page in site.nav is linked from here, so a header tidy-up can never
// quietly strand one.
export async function Footer({ siteSettings: site }: { siteSettings: ResolvedSiteSettings }) {
  const dict = await getDictionary();
  const locale = await getLocale();
  const to = (href: string) => localePath(href, locale);

  // Labels already carried by the dictionaries, so the sections pick up the
  // existing translations rather than reverting these four to English.
  const translated: Record<string, string> = {
    "/partners": dict.footer.partnerWithUs,
    "/travel-agents": dict.footer.travelAgents,
    "/affiliate": dict.footer.affiliateProgram,
    "/collaborate": dict.footer.creators,
  };

  // Order of preference: the nav translation for this href, then a dictionary
  // label, then whatever the Studio called the page in site.nav, then the
  // fallback written in navGroups. The Studio and the translators win; the
  // fallback only ever covers a page neither of them mentions.
  const labelFor = (link: { href: string; label: string }) =>
    dict.nav.byHref[link.href] ??
    translated[link.href] ??
    site.nav.find((item) => item.href === link.href)?.label ??
    link.label;

  return (
    <footer className="mt-24 border-t border-white/10 bg-ink text-cream">
      {/* Who we are, and how to reach a person. Kept apart from the link
          columns below so the first thing in the footer is not a list. */}
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full p-1 ring-1 ring-gold/40">
              <Image
                src="/brand/egypt-eye-mark-gold.png"
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </span>
            <p className="font-display text-xl font-semibold text-gold-light">{site.shortName}</p>
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/60">{site.description}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/45">
            {dict.footer.contact}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li>
              <a href={`mailto:${site.contact.email}`} className="hover:text-gold-light">
                {site.contact.email}
              </a>
            </li>
            <li>
              <WhatsAppBookButton
                whatsappLink={site.contact.whatsappLink}
                context={{ page: "the site footer", intro: "Hi, I have a question." }}
                className="hover:text-gold-light"
              >
                {site.footer.whatsappPrefix}
                {site.contact.whatsapp}
              </WhatsAppBookButton>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/45">
            {dict.footer.follow}
          </p>
          <SocialLinks site={site} tone="dark" includeWhatsApp className="mt-4" />
        </div>
      </Container>

      {/* The sections. A hairline above them separates the map from the
          introduction, which is most of what makes a long footer scannable. */}
      <div className="border-t border-white/10">
        <Container className="grid gap-x-8 gap-y-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.heading} aria-label={section.heading}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/45">
                {/* Partner With Us already has a translated heading; the rest
                    go through <T>, which falls back to English per language
                    until the dictionaries are filled. */}
                {section.heading === "Partner With Us" ? (
                  dict.footer.partnerWithUs
                ) : (
                  <T>{section.heading}</T>
                )}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={to(link.href)} className="transition hover:text-gold-light">
                      {labelFor(link)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </Container>
      </div>

      {/* Language sits in its own band just above the legal line: the last
          thing on the page, where someone who has scrolled the whole way in
          the wrong language will look for it. */}
      <div className="border-t border-white/10 py-6">
        <Container>
          <LanguageLinks />
        </Container>
      </div>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-cream/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. {dict.footer.rightsReserved}
          </p>
          <div className="flex items-center gap-4">
            {/* FAQ moved up into "About Egypt Eye" — it is a real page people
                go looking for, not a legal footnote, and listing it in both
                places listed it twice. */}
            <Link href={to("/privacy")} className="hover:text-cream/70">
              {dict.footer.privacy}
            </Link>
            <Link href={to("/terms")} className="hover:text-cream/70">
              {dict.footer.terms}
            </Link>
            <Link href={to("/cancellation-policy")} className="hover:text-cream/70">
              {dict.footer.cancellation}
            </Link>
            <p>{site.footer.location}</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
