import type { Metadata } from "next";
import Link from "next/link";
import {
  fdPackageBySlug,
  fdRentalBySlug,
  fdSettings,
  fdWardrobe,
} from "../_lib/content";
import { experienceBySlug } from "@/content/flyingDressExperiences";
import { EnquiryForm } from "../_components/EnquiryForm";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";

/**
 * The enquiry page.
 *
 * Pre-filled from the URL, which is how a choice made in the wardrobe or on a
 * product page travels here: /enquire?package=pyramids-rooftop&dress=emerald.
 *
 * Every incoming value is RESOLVED AGAINST THE CATALOGUE before it reaches the
 * form, not passed through. A query string is user input: `?dress=Free%20Upgrade`
 * would otherwise render as a selected option and end up in an email. An
 * unknown value simply selects nothing, which is the right failure — a stale
 * link from a retired colour still opens a working form.
 *
 * `noindex` because a pre-filled form is one page in hundreds of query-string
 * variants and none of them should be competing in search with the pages that
 * sell the thing.
 */

export const metadata: Metadata = fdMetadata({
  title: "Plan Your Photoshoot",
  description:
    "Tell us the date, the location and the dress, and we will confirm what is available. An enquiry, not a booking. Nothing is charged on this website.",
  path: "/enquire",
  noindex: true,
});

export default async function EnquirePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const one = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

  // Everything the form offers is Studio-managed now, so it is fetched here
  // rather than imported.
  const [{ contact }, wardrobe, chosenPackage, chosenService] = await Promise.all([
    fdSettings(),
    fdWardrobe(),
    fdPackageBySlug(one(params.package)),
    fdRentalBySlug(one(params.service)),
  ]);
  const { dresses, mensOutfits } = wardrobe;

  // Resolved, never trusted. An unknown id becomes "" and selects nothing.
  const pkg = chosenPackage?.slug ?? "";
  const service = chosenService?.slug ?? "";
  // Resolved against the catalogue exactly like the two above. An unknown
  // slug selects nothing, so a stale link from a retired experience still
  // opens a working form rather than a broken one.
  const experience = experienceBySlug(one(params.experience))?.slug ?? "";
  const dressParam = one(params.dress).toLowerCase();
  const dress = dresses.find((d) => d.id.toLowerCase() === dressParam)?.id ?? "";
  const mensParam = one(params.mens).toLowerCase();
  const mens = mensOutfits.find((m) => m.id.toLowerCase() === mensParam)?.id ?? "";

  return (
    <>
      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Plan your photoshoot</span>
          </nav>

          <div style={{ maxWidth: "44rem" }}>
            <p className="fd-eyebrow">Enquire</p>
            <h1 className="fd-display fd-h1">Plan your photoshoot</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              Two required fields. Everything else helps us give you a useful answer first time
              instead of asking four questions back.
            </p>
          </div>
        </div>
      </section>

      <section className="fd-section-tight" style={{ paddingTop: 0 }}>
        <div className="fd-shell fd-split">
          <div>
            <EnquiryForm
              initialPackage={pkg}
              initialService={service}
              initialExperience={experience}
              initialDress={dress}
              initialMens={mens}
            />
          </div>

          <aside>
            <div className="fd-note">
              <p style={{ margin: "0 0 0.75rem", fontWeight: 500, color: "var(--fd-ink)" }}>
                What happens next
              </p>
              <p style={{ margin: "0 0 0.75rem" }}>
                A person reads it and replies, about whether your date is free, and about the price
                where it is not published on the site.
              </p>
              <p style={{ margin: 0 }}>
                Nothing you send here books anything, and no form on this website asks for card
                details.
              </p>
            </div>

            <div style={{ marginTop: "2rem" }}>
              <p className="fd-eyebrow">Or reach us directly</p>
              <ul className="fd-list">
                <li>
                  <h3>WhatsApp and phone</h3>
                  <p>
                    {contact.phones.map((phone, index) => (
                      <span key={phone.tel}>
                        {index > 0 ? <br /> : null}
                        <a href={`tel:${phone.tel}`} className="fd-link">
                          {phone.display}
                        </a>
                      </span>
                    ))}
                  </p>
                </li>
                <li>
                  <h3>Email</h3>
                  <p>
                    <a href={`mailto:${contact.email}`} className="fd-link">
                      {contact.email}
                    </a>
                  </p>
                </li>
              </ul>
            </div>

            <div style={{ marginTop: "2rem" }}>
              <p className="fd-eyebrow">Not decided yet?</p>
              <ul className="fd-list">
                <li>
                  <h3>
                    <Link href={fdPath("/experiences")} className="fd-link">
                      Compare the three locations
                    </Link>
                  </h3>
                </li>
                <li>
                  <h3>
                    <Link href={fdPath("/wardrobe")} className="fd-link">
                      Look through the wardrobe
                    </Link>
                  </h3>
                </li>
                <li>
                  <h3>
                    <Link href={fdPath("/faq")} className="fd-link">
                      Read the questions
                    </Link>
                  </h3>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: fdJsonLd(
            fdBreadcrumbJsonLd([
              { name: "Home", path: "" },
              { name: "Plan your photoshoot", path: "/enquire" },
            ])
          ),
        }}
      />
    </>
  );
}
