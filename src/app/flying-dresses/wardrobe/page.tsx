import type { Metadata } from "next";
import Link from "next/link";
import { dresses, mensOutfits } from "@/content/flyingDresses";
import { FaqList } from "../_components/FaqList";
import { Wardrobe } from "../_components/Wardrobe";
import { Scene } from "../_components/Scene";
import { empty } from "../_lib/assets";
import { fdBreadcrumbJsonLd, fdJsonLd, fdMetadata, fdPath } from "../_lib/seo";
import { wardrobeShareImage } from "../_lib/shareImages";

export const metadata: Metadata = fdMetadata({
  image: wardrobeShareImage,
  title: "The Wardrobe",
  description:
    "The twelve flying dresses (Cherry, Emerald, Navy, Black, Verdant, Ginger, Snowy, Golden, BronZey, Aqua, Lavender and Orchid) plus five traditional Egyptian gawns for men. Every dress is included in the photoshoot price.",
  path: "/wardrobe",
});

const WARDROBE_FAQS = [
  {
    question: "Does the dress I choose change the price?",
    answer:
      "No. Every dress in the collection is included in the photoshoot price, so the choice costs nothing. A second dress in the same session is $99, and a dress made or customised for you to keep is $249.",
  },
  {
    question: "Why are these colour swatches rather than photographs?",
    answer:
      "Because we would rather show you an honest colour than a photograph of a different dress. The garments are real and all twelve are available; the photography for this page has not been shot yet. Ask us and we will send you pictures of the actual dress you are considering.",
  },
  {
    question: "Can you promise me a specific dress on a specific day?",
    answer:
      "We note your choice and have it ready for you, and in practice it is almost always the one you get. We will not promise it absolutely, because a dress can come back from a shoot needing cleaning, and if yours is unavailable we would rather tell you before your shoot than on the roof.",
  },
  {
    question: "What size are they?",
    answer:
      "Ask us. We have not published a size range because these are long, flowing garments that fit differently from ordinary clothes, and we would rather check the actual dress against what you tell us than publish a range that turns out not to help.",
  },
  {
    question: "Can I rent a dress without booking a photoshoot?",
    answer:
      "Yes. That is a separate service. One dress from this collection, delivered to your hotel in Cairo or collected from us, with no photographer. It is priced on request.",
  },
];

export default function WardrobePage() {
  return (
    <>
      <section className="fd-section-tight">
        <div className="fd-shell">
          <nav aria-label="Breadcrumb" className="fd-eyebrow fd-eyebrow-crumbs" style={{ marginBottom: "2rem" }}>
            <Link href={fdPath()} style={{ color: "inherit" }}>
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">The Wardrobe</span>
          </nav>

          <div style={{ maxWidth: "46rem" }}>
            <h1 className="fd-display fd-h1">The Wardrobe</h1>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.75rem" }}>
              Twelve flying dresses and five traditional gawns. Every dress is included in the
              photoshoot price. Pick the one you want and tell us when you enquire, or rent one on
              its own.
            </p>
            <p className="fd-note">
              These are colour swatches, not photographs of the fabric. All twelve garments are
              real and available; the photography for this page has not been shot yet, and we would
              rather say so than show you a stock picture of a different dress. Ask us and we will
              send you pictures of the one you are considering.
            </p>
          </div>
        </div>
      </section>

      <section className="fd-section-tight" aria-labelledby="fd-collection-heading">
        <div className="fd-shell">
          <h2 id="fd-collection-heading" className="fd-sr">
            The collection
          </h2>
          <Wardrobe dresses={dresses} mensOutfits={mensOutfits} />
        </div>
      </section>

      {/* Men's attire, given its own section rather than left to dominate the
          main wardrobe grid — the brief's instruction, and the right call:
          the dresses are the product and the gawns are the complement. */}
      <section className="fd-section fd-dark fd-on-dark" aria-labelledby="fd-mens-heading">
        <div className="fd-shell fd-split">
          <div>
            <p className="fd-eyebrow">For him</p>
            <h2 id="fd-mens-heading" className="fd-display fd-h2">
              Five traditional gawns
            </h2>
            <p className="fd-lead fd-muted" style={{ marginTop: "1.5rem" }}>
              A flying-dress photograph with two people in it is a different picture from one with
              one. Five styles, in the Saeedy and Bahary traditions of Upper Egypt and the Delta,
              plus a classic plain cut.
            </p>
            <ul className="fd-ticks" style={{ margin: "0 0 2rem" }}>
              {mensOutfits.map((outfit) => (
                <li key={outfit.id}>{outfit.name}</li>
              ))}
            </ul>
            <p className="fd-note">
              We have not photographed the gawns for this site yet, so this page names them rather
              than showing them. Ask and we will send you pictures of the actual garments, and
              tell us which pair interests you, because what distinguishes the two Saeedy cuts from
              each other is easier to show than to describe.
            </p>
            <div className="fd-actions" style={{ marginTop: "2rem" }}>
              <Link className="fd-btn" href={fdPath("/rentals/mens-wear")}>
                Men&rsquo;s wear, in full
              </Link>
            </div>
          </div>

          <figure>
            <Scene
              src={empty.mensGawn.src}
              alt={empty.mensGawn.alt}
              width={empty.mensGawn.width}
              height={empty.mensGawn.height}
              ratio="fd-ratio-landscape"
              sizes="(min-width: 60rem) 40vw, 92vw"
              tone="neutral"
              label={empty.mensGawn.wanted}
            />
          </figure>
        </div>
      </section>

      <section className="fd-section-tight fd-sand">
        <div className="fd-shell fd-shell-narrow">
          <p className="fd-eyebrow">Questions</p>
          <h2 className="fd-display fd-h3" style={{ marginBottom: "2rem" }}>
            About the dresses
          </h2>
          <FaqList faqs={WARDROBE_FAQS} />
          <div className="fd-actions" style={{ marginTop: "2.5rem" }}>
            <Link className="fd-btn" href={fdPath("/enquire")}>
              Enquire with your choice
            </Link>
            <Link className="fd-btn fd-btn-ghost" href={fdPath("/rentals/dress-rental")}>
              Rent a dress only
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: fdJsonLd(
            fdBreadcrumbJsonLd([
              { name: "Home", path: "" },
              { name: "The Wardrobe", path: "/wardrobe" },
            ])
          ),
        }}
      />
    </>
  );
}
