import Image from "next/image";
import {
  LOOKBOOK_NOTE,
  NAMING_NOTE,
  accessoryCategories,
} from "@/content/flyingDressAccessories";

/**
 * The accessories, grouped the way the business groups them.
 *
 * A gallery, deliberately, and not the Wardrobe component. The wardrobe
 * renders Outfits — things a customer selects inside a paid booking — and
 * these have no figure and no availability behind them yet. Showing them in
 * the booking picker would offer a choice the deposit does not cover. So they
 * are shown, named, described and asked about.
 *
 * EACH FRAME CARRIES THREE THINGS AND THEY DO DIFFERENT JOBS.
 *
 *   The NAME is what a customer remembers and says out loud. It is the
 *   studio's own, drawn from ancient Egypt, and NAMING_NOTE below says so
 *   plainly so nobody reads it as a claim about an antiquity.
 *
 *   The REFERENCE is what the desk matches. It is unambiguous over a phone
 *   line and it does not change when a name is reconsidered.
 *
 *   WHERE IT IS WORN was asked for directly, and it is the line that does the
 *   most work: "a wide gold cuff" tells you nothing about whether it will be
 *   visible in a sleeveless dress, and "on the upper arm, above the elbow"
 *   tells you exactly that.
 *
 * See src/content/flyingDressAccessories.ts.
 */
export function AccessoryLookbook() {
  return (
    <>
      <p className="fd-muted" style={{ maxWidth: "46rem", marginTop: 0 }}>
        {NAMING_NOTE}
      </p>

      {accessoryCategories.map((category) => (
        <div key={category.slug} style={{ marginBottom: "3rem" }}>
          <h3 className="fd-display fd-h4" style={{ margin: "0 0 1.25rem" }}>
            {category.title}
          </h3>
          <div className="fd-grid" style={{ ["--fd-min" as string]: "15rem" }}>
            {category.items.map((item) => (
              <figure key={item.ref} style={{ margin: 0 }}>
                <div className="fd-acc-frame">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={1000}
                    height={1200}
                    className="fd-acc-img"
                    sizes="(max-width: 48rem) 50vw, 15rem"
                  />
                </div>
                <figcaption>
                  <span className="fd-acc-name">{item.name}</span>
                  <span className="fd-acc-ref">{item.ref}</span>
                  <span className="fd-acc-desc">{item.description}</span>
                  <span className="fd-acc-worn">{item.worn}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
      {/* Said once, at the bottom, after the pieces rather than before them:
          it is a note about how the frames were made, not a warning about the
          jewellery. See LOOKBOOK_NOTE. */}
      <p className="fd-muted" style={{ fontSize: "var(--fd-step--1)", maxWidth: "46rem" }}>
        {LOOKBOOK_NOTE}
      </p>
    </>
  );
}
