import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "./Container";
import { EyeOfHorusIcon } from "./EyeOfHorusIcon";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink text-cream">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-gold/40 text-gold-light">
              <EyeOfHorusIcon className="h-5 w-5" />
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
            Explore
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
            Contact
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li>
              <a href={`mailto:${site.contact.email}`} className="hover:text-gold-light">
                {site.contact.email}
              </a>
            </li>
            <li>
              <a href={site.contact.whatsappLink} target="_blank" className="hover:text-gold-light">
                WhatsApp: {site.contact.whatsapp}
              </a>
            </li>
            <li className="text-cream/50">
              Urgent booking: {site.contact.urgentBooking}
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cream/50">
            Follow
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li>
              <a href={site.socials.instagram} target="_blank" className="hover:text-gold-light">
                Instagram
              </a>
            </li>
            <li>
              <a href={site.socials.facebook} target="_blank" className="hover:text-gold-light">
                Facebook
              </a>
            </li>
            <li>
              <a href={site.socials.tiktok} target="_blank" className="hover:text-gold-light">
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-cream/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Cairo, Egypt</p>
        </Container>
      </div>
    </footer>
  );
}
