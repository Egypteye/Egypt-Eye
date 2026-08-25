import Link from "next/link";
import Image from "next/image";
import type { ResolvedSiteSettings } from "@/content/types";
import { Container } from "./Container";

export function Footer({ siteSettings: site }: { siteSettings: ResolvedSiteSettings }) {
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink text-cream">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
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
            {site.footer.exploreLabel}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            {site.nav.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-gold-light">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cream/50">
            {site.footer.contactLabel}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li>
              <a href={`mailto:${site.contact.email}`} className="hover:text-gold-light">
                {site.contact.email}
              </a>
            </li>
            <li>
              <a href={site.contact.whatsappLink} target="_blank" rel="noreferrer" className="hover:text-gold-light">
                {site.footer.whatsappPrefix}{site.contact.whatsapp}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cream/50">
            {site.footer.followLabel}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li>
              <a href={site.socials.instagram} target="_blank" rel="noreferrer" className="hover:text-gold-light">
                Instagram
              </a>
            </li>
            <li>
              <a href={site.socials.facebook} target="_blank" rel="noreferrer" className="hover:text-gold-light">
                Facebook
              </a>
            </li>
            <li>
              <a href={site.socials.tiktok} target="_blank" rel="noreferrer" className="hover:text-gold-light">
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-cream/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/travel-agents" className="hover:text-cream/70">
              Travel Agents
            </Link>
            <Link href="/collaborate" className="hover:text-cream/70">
              Collaborate
            </Link>
            <Link href="/privacy" className="hover:text-cream/70">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-cream/70">
              Terms of Service
            </Link>
            <p>{site.footer.location}</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
