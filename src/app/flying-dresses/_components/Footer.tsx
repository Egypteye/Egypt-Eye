import Image from "next/image";
import Link from "next/link";
import {
  brand,
  contact,
  flyingDressEnquiry,
  packages,
  rentalServices,
  whatsappHref,
} from "@/content/flyingDresses";
import { Wordmark } from "./Wordmark";
import { fdPath } from "../_lib/seo";

/**
 * The footer. A server component — every item in it is a link or a fact.
 *
 * The social accounts were rendered as plain text until the owner supplied the
 * three profile URLs, because the brochure gave only a handle and a link to
 * the wrong account is worse than no link. They are real links now. Any entry
 * whose `profileUrl` is null in content/flyingDresses.ts still falls back to
 * plain text rather than guessing a URL from the handle — which matters,
 * because the real TikTok account turned out not to match the handle the
 * brochure gave.
 */
export function FlyingDressesFooter({ logo }: { logo?: string | null }) {
  const year = new Date().getFullYear();

  return (
    <footer className="fd-footer fd-on-dark">
      <div className="fd-shell">
        <div className="fd-footer-grid">
          <div>
            {logo ? (
              <Image
                src={logo}
                alt={brand.name}
                width={320}
                height={120}
                className="fd-footer-logo"
              />
            ) : (
              <Wordmark tone="light" />
            )}
            <p className="fd-muted" style={{ maxWidth: "28ch", margin: "0 0 1.5rem" }}>
              Flying-dress photography on a Giza rooftop, in the dunes outside Cairo, and out at
              Fayoum.
            </p>
            <div className="fd-actions">
              <Link className="fd-btn" href={fdPath("/enquire")}>
                Plan your shoot
              </Link>
              <a
                className="fd-btn fd-btn-outline-light"
                href={whatsappHref(flyingDressEnquiry())}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
                <span className="fd-sr"> (opens in a new tab)</span>
              </a>
            </div>
          </div>

          <div>
            <h2>Shoots &amp; hire</h2>
            <ul>
              {packages.map((p) => (
                <li key={p.slug}>
                  <Link href={fdPath(`/experiences/${p.slug}`)}>{p.name}</Link>
                </li>
              ))}
              {rentalServices.map((s) => (
                <li key={s.slug}>
                  <Link href={fdPath(`/rentals/${s.slug}`)}>{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2>Get in touch</h2>
            <ul>
              {contact.phones.map((phone) => (
                <li key={phone.tel}>
                  <a href={`tel:${phone.tel}`}>{phone.display}</a>
                </li>
              ))}
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li className="fd-muted" style={{ fontSize: "var(--fd-step-0)" }}>
                {contact.location}
              </li>
            </ul>

            <h2 style={{ marginTop: "2rem" }}>Follow</h2>
            <ul>
              {contact.socials.map((social) =>
                social.profileUrl ? (
                  <li key={social.platform}>
                    <a href={social.profileUrl} target="_blank" rel="noopener noreferrer">
                      {social.platform}
                    </a>
                  </li>
                ) : (
                  <li
                    key={social.platform}
                    className="fd-muted"
                    style={{ fontSize: "var(--fd-step-0)" }}
                  >
                    {social.platform}: @{social.handle}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="fd-footer-base">
          <p style={{ margin: 0 }}>
            © {year} {brand.name}
          </p>
          <nav aria-label="Footer" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <Link href={fdPath("/packages")} style={{ color: "inherit" }}>
              Prices
            </Link>
            <Link href={fdPath("/faq")} style={{ color: "inherit" }}>
              Questions
            </Link>
            <Link href={fdPath("/about")} style={{ color: "inherit" }}>
              About
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
