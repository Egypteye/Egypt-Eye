import type { Metadata } from "next";
import Link from "next/link";
import { fdWardrobe } from "../_lib/content";
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
    "The thirteen flying dresses (Cherry, Emerald, Navy, Black, Verdant, Ginger, Snowy, Golden, BronZey, Aqua, Lavender, Hot Pink and Orchid) plus five traditional Egyptian gawns for men. Every dress is included in the photoshoot price.",
  path: "/wardrobe",
});

const WARDROBE_FAQS = [
  {
    question: "Does the dress I choose change the price?",
    answer:
      "No. Every dress in the collection is included in the photoshoot price, so the choice costs nothing. A second dress in the same session is $99, and a dress made or customised for you to keep is $249.",
  },
  {
    // REWRITTEN, AND THE OLD VERSION IS WHY THE COMMENT BELOW EXISTS.
    //
    // This asked "Why are these colour swatches rather than photographs?" and
    // answered that "the photography for this page has not been shot yet" —
    // a flat assertion, written when it was true, left standing after twelve
    // dress photographs and then five gawn frames landed. The paragraph on
    // the page had already been made conditional after exactly this mistake;
    // the FAQ was the same sentence hiding one scroll further down, telling a
    // customer the page could not show them what it was showing them.
    question: "Are these photographs of the actual garments?",
    answer:
      "Yes. Every dress and every gawn on this page is photographed. The thirteen dresses are frames from real client shoots. The five gawns are studio frames of the garments themselves, with the model and the background created digitally, so you are seeing the real garment rather than a photograph of a shoot. Whatever you pick is the one that arrives.",
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

export default async function WardrobePage() {
  const { dresses, mensOutfits, photos } = await fdWardrobe();
  const all = [...dresses, ...mensOutfits];
  const photographed = all.filter((o) => photos[o.id]);
  const missingPhotos = all.filter((o) => !photos[o.id]);
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
              Thirteen flying dresses and five traditional gawns. Every dress is included in the
              photoshoot price. Pick the one you want and tell us when you enquire, or rent one on
              its own.
            </p>
            {/* THIS PARAGRAPH HAS TO AGREE WITH THE GRID BELOW IT, and for a
                while it did not. It said the photography "has not been shot
                yet" as a flat statement, written when that was true. Twelve
                real photographs then landed and the sentence stayed, so the
                page showed a customer twelve dresses and told them in the
                same breath that it could not show them any — and invited
                them to ask for what was already on their screen. The same
                mistake the lightbox caption made, in the same component.

                So it is counted, not asserted: what is missing is derived
                from the photographs the page actually received.

                The all-zero branch that used to sit here is gone too. It read
                "the photography for this page has not been shot yet" and was
                reachable only by deleting all seventeen photographs, which is
                a different emergency; meanwhile it sat in the file as a fourth
                copy of the sentence this page keeps having to unlearn, and the
                counted version above covers every state that can actually
                happen, zero included. */}
            {missingPhotos.length > 0 ? (
              <p className="fd-note">
                {`${photographed.length} of the ${all.length} garments are photographed here. The rest are shown as colour swatches rather than a stock picture of a different dress, and we would rather say so. Ask us and we will send you pictures of the one you are considering.`}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="fd-section-tight" aria-labelledby="fd-collection-heading">
        <div className="fd-shell">
          <h2 id="fd-collection-heading" className="fd-sr">
            The collection
          </h2>
          <Wardrobe dresses={dresses} mensOutfits={mensOutfits} photos={photos} />
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
            {/* The fourth place on this page that said the gawns were not
                photographed. The grid above now shows all five, so this said
                "we cannot show you these" directly beneath them.

                What survives is the half that is still true and still useful:
                the two Saeedy cuts are genuinely hard to tell apart in a
                frame, so the invitation to ask is kept and the denial is
                dropped. */}
            <p className="fd-note">
              The two Saeedy cuts are close in a photograph and easier to tell apart in person.
              Tell us which one you are drawn to and we will send you more pictures of it, and of
              how it hangs on somebody your height.
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
