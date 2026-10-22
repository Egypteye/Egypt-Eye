import Image from "next/image";
import { LOOKBOOK_NOTE, accessoryCategories } from "../_lib/accessoryLookbook";

/**
 * The accessories, grouped the way the business groups them.
 *
 * A gallery, deliberately, and not the Wardrobe component. The wardrobe
 * renders Outfits — things a customer selects inside a paid booking — and
 * these have no price and no availability behind them yet. Showing them in a
 * picker would offer a choice the deposit does not cover. So they are shown,
 * referenced, and asked about.
 *
 * THE REFERENCE UNDER EACH FRAME IS THE POINT. Nothing in the source material
 * names a single piece, so there is no product name to print. "Headpiece 2" is
 * something a customer can quote in an enquiry and the desk can act on, and it
 * invents nothing. See accessoryLookbook.ts.
 */
export function AccessoryLookbook() {
  return (
    <>
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
                <figcaption className="fd-acc-ref">{item.ref}</figcaption>
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
