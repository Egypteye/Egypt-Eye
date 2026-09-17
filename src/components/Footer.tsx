import Link from "next/link";
import Image from "next/image";
import type { ResolvedSiteSettings } from "@/content/types";
import { Container } from "./Container";
import { SocialLinks } from "./SocialLinks";
import { WhatsAppBookButton } from "./WhatsAppBookButton";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";

export async function Footer({ siteSettings: site }: { siteSettings: ResolvedSiteSettings }) {
  const dict = await getDictionary();
  const locale = await getLocale();
  const to = (href: string) => localePath(href, locale);
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink text-cream">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
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
            <p className="font-display text-xl font-semibold text-gold-light">
              {site.shortName}
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-cream/60">
            {site.description}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cream/50">
            {dict.footer.explore}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            {site.nav.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={to(item.href)} className="hover:text-gold-light">
                  {dict.nav.byHref[item.href] ?? item.label}
                </Link>
              </li>
            ))}
            {/* Reviews were reachable only from a block on /about that renders
                when testimonials exist, so an empty list orphaned the page
                entirely. A trust page belongs in the footer regardless. */}
            <li>
              <Link href={to("/testimonials")} className="hover:text-gold-light">
                {dict.footer.travelerReviews}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cream/50">
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
                {site.footer.whatsappPrefix}{site.contact.whatsapp}
              </WhatsAppBookButton>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cream/50">
            {dict.footer.follow}
          </p>
          <SocialLinks site={site} tone="dark" includeWhatsApp className="mt-4" />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cream/50">{dict.footer.partnerWithUs}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li>
              <Link href={to("/travel-agents")} className="hover:text-gold-light">
                {dict.footer.travelAgents}
              </Link>
            </li>
            <li>
              <Link href={to("/affiliate")} className="hover:text-gold-light">
                {dict.footer.affiliateProgram}
              </Link>
            </li>
            <li>
              <Link href={to("/collaborate")} className="hover:text-gold-light">
                {dict.footer.creators}
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-cream/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. {dict.footer.rightsReserved}</p>
          <div className="flex items-center gap-4">
            <Link href={to("/privacy")} className="hover:text-cream/70">
              {dict.footer.privacy}
            </Link>
            <Link href={to("/terms")} className="hover:text-cream/70">
              {dict.footer.terms}
            </Link>
            <p>{site.footer.location}</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
