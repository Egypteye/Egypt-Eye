import type { Metadata } from "next";
import Link from "next/link";
import { fdPackages, fdSettings, fdWardrobe } from "../_lib/content";
import { Scene } from "../_components/Scene";
import { agency } from "../_lib/assets";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";
import { aboutShareImage } from "../_lib/shareImages";

/**
 * About.
 *
 * -------------------------------------------------------------------------
 * WHAT IS DELIBERATELY ABSENT
 * -------------------------------------------------------------------------
 * No founding year. No "over 2,000 happy clients". No team biographies. No
 * awards. No years-of-experience figure. Not one of those was verifiable from
 * anything reachable in this build, and an About page is precisely where a
 * business gets held to its claims.
 *
 * What is here instead is what the operation demonstrably does, stated in the
 * terms the brochure and the live sister-brand page support: three locations,
 * twelve dresses, five gawns, an assistant, a delivery window. A page that
 * tells you exactly how the morning runs earns more trust than one asserting
 * a decade of excellence, and it has the advantage of being checkable.
 *
 * docs/FLYING-DRESSES-OWNER-CONFIRMATIONS.md asks for the real story — who
 * founded it, when, how many shoots — so this page can be rewritten with
 * facts rather than filled with guesses.
 */

export const metadata: Metadata = fdMetadata({
  image: aboutShareImage,
  title: "About",
  description:
    "Who runs Flying Dresses Egypt, how a shoot actually works, and what we will and will not promise. Flying-dress photography in Cairo, Giza and Fayoum.",
  path: "/about",
});

export default async function AboutPage() {
  const [settings, packages, wardrobe] = await Promise.all([
    fdSettings(),
    fdPackages(),
    fdWardrobe(),
  ]);
  const { brand, contact } = settings;
  const { dresses, mensOutfits } = wardrobe;
  return (
    <>
      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">About</span>
          </nav>

          <div className="fd-split">
            <div>
              <p className="fd-eyebrow">Who we are</p>
              <h1 className="fd-display fd-h1">
                A dress, a landscape,
                <br />
                <span className="fd-italic">and somebody who knows the light</span>
              </h1>
              <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
                {brand.name} photographs people in flying dresses in three places around Cairo: a
                private rooftop above Giza, the sand dunes towards New Cairo, and the lakes and pale
                dunes of Fayoum. We own the wardrobe, we run the shoots ourselves, and we drive you
                there and back.
              </p>
            </div>

            <figure>
              <Scene
                src={agency.whiteGownDune.src}
                alt={agency.whiteGownDune.alt}
                width={agency.whiteGownDune.width}
                height={agency.whiteGownDune.height}
                ratio="fd-ratio-landscape"
                sizes="(min-width: 60rem) 40vw, 92vw"
                priority
              />
              <figcaption className="fd-caption">{agency.whiteGownDune.credit}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* How a morning runs. The genuinely useful part for someone deciding. */}
      <section className="fd-section fd-sand">
        <div className="fd-shell">
          <div style={{ maxWidth: "44rem", marginBottom: "3rem" }}>
            <p className="fd-eyebrow">The morning</p>
            <h2 className="fd-display fd-h2">How a shoot actually goes</h2>
          </div>

          <ol className="fd-list fd-list-2 fd-reveal-group" style={{ listStyle: "none" }}>
            <li>
              <h3>
                <span className="fd-price-from" aria-hidden="true">
                  01
                </span>
                We collect you
              </h3>
              <p>
                Door to door, from your hotel or wherever you are staying, and back again
                afterwards. Included in every price, at all three locations.
              </p>
            </li>
            <li>
              <h3>
                <span className="fd-price-from" aria-hidden="true">
                  02
                </span>
                The dress is already there
              </h3>
              <p>
                In the colour you chose when you enquired. You change on site. If you asked for a
                gawn for your partner, that is there too.
              </p>
            </li>
            <li>
              <h3>
                <span className="fd-price-from" aria-hidden="true">
                  03
                </span>
                Somebody tells you what to do
              </h3>
              <p>
                The photographer directs the whole session. Almost nobody arriving has modelled
                before and it does not matter. Being told where to stand and when to move is the
                service.
              </p>
            </li>
            <li>
              <h3>
                <span className="fd-price-from" aria-hidden="true">
                  04
                </span>
                And somebody handles the fabric
              </h3>
              <p>
                An assistant whose only job is the dress: holding the train, throwing it, keeping it
                out of the sand between frames. It is more work than the photographs make it look.
              </p>
            </li>
            <li>
              <h3>
                <span className="fd-price-from" aria-hidden="true">
                  05
                </span>
                Thirty to forty-five minutes
              </h3>
              <p>
                That is the shoot. Long enough to get everything and short enough that you are not
                standing in the sun at eleven.
              </p>
            </li>
            <li>
              <h3>
                <span className="fd-price-from" aria-hidden="true">
                  06
                </span>
                Then more than a hundred photographs
              </h3>
              <p>
                Colour-graded, delivered within six to ten days. Not a handful of selects, the full
                set from the session.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* What the operation is, in numbers that are true. */}
      <section className="fd-section-tight">
        <div className="fd-shell fd-split fd-split-reverse">
          <div>
            <p className="fd-eyebrow">The operation</p>
            <h2 className="fd-display fd-h3" style={{ marginBottom: "1.5rem" }}>
              What we actually have
            </h2>
            <ul className="fd-ticks">
              <li>{dresses.length} flying dresses, all available, all included in a shoot price.</li>
              <li>{mensOutfits.length} traditional gawns, in the Saeedy and Bahary styles and a plain cut.</li>
              <li>{packages.length} locations: a Giza rooftop, the sand dunes, and Fayoum.</li>
              <li>Our own transport to all three, door to door.</li>
              <li>An assistant on every shoot, not an optional extra.</li>
            </ul>

            <p className="fd-note" style={{ marginTop: "2rem" }}>
              You will notice there is no founding date on this page, no client count and no star
              rating. That is on purpose: we would rather put real ones here when we have collected
              them properly than numbers you have no way to check.
            </p>
          </div>

          <figure>
            <Scene
              src={agency.assistantAtWork.src}
              alt={agency.assistantAtWork.alt}
              width={agency.assistantAtWork.width}
              height={agency.assistantAtWork.height}
              ratio="fd-ratio-landscape"
              tone="neutral"
              label={agency.assistantAtWork.wanted}
            />
          </figure>
        </div>
      </section>

      {/* Contact. */}
      <section className="fd-section fd-dark fd-on-dark">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">Get in touch</p>
            <h2 className="fd-display fd-h2">Ask us anything</h2>
            <p className="fd-muted" style={{ marginTop: "1.5rem" }}>
              A real person replies. If you are deciding between locations, or wondering whether a
              colour works where you want to shoot, that is exactly the kind of question to send.
            </p>
            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-btn" href={fdPath("/enquire")}>
                Send an enquiry
              </Link>
            </div>
          </div>

          <div>
            <ul className="fd-list">
              <li>
                <h3>Phone and WhatsApp</h3>
                <p>
                  {contact.phones.map((phone, index) => (
                    <span key={phone.tel}>
                      {index > 0 ? <br /> : null}
                      <a href={`tel:${phone.tel}`} className="fd-link" style={{ color: "inherit" }}>
                        {phone.display}
                      </a>
                    </span>
                  ))}
                </p>
              </li>
              <li>
                <h3>Email</h3>
                <p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="fd-link"
                    style={{ color: "inherit" }}
                  >
                    {contact.email}
                  </a>
                </p>
              </li>
              <li>
                <h3>Where we are</h3>
                <p>{contact.location}</p>
              </li>
              <li>
                <h3>Social</h3>
                <p>
                  {contact.socials.map((social, index) => (
                    <span key={social.platform}>
                      {index > 0 ? <br /> : null}
                      {social.platform}: @{social.handle}
                    </span>
                  ))}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: fdJsonLd(
            fdBreadcrumbJsonLd([
              { name: "Home", path: "" },
              { name: "About", path: "/about" },
            ])
          ),
        }}
      />
    </>
  );
}
