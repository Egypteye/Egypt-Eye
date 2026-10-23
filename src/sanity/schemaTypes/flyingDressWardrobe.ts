import { defineField, defineType } from "sanity";

/**
 * A GARMENT IN THE WARDROBE.
 *
 * =========================================================================
 * THE ID IS LOAD-BEARING AND A BOOKING DEPENDS ON IT
 * =========================================================================
 * These are the same physical garments Egypt Eye Travel rents out, and its
 * booking flow STORES THE ID of whatever a customer chose, alongside the name
 * it was shown under (see lib/booking/outfits.ts). That split is deliberate:
 * renaming "BronZey" to "Bronze" must not orphan an existing selection, and
 * must not quietly rewrite what an old booking says the customer picked.
 *
 * So the identifier here is set once and then left alone. Changing it on a
 * garment somebody has already booked does not fail loudly — it simply stops
 * matching, and a past booking's dress becomes unresolvable. The field
 * description says so in those words, because an editor has no other way to
 * know it.
 *
 * =========================================================================
 * WHY THE COLOUR SWATCH IS A FALLBACK AND NOT THE DESIGN
 * =========================================================================
 * A customer choosing a dress wants to see the dress. The hex exists so the
 * picker stays usable and honest on the day the business adds a colour before
 * it has photographed it, and the interface labels such an option as having
 * no photograph yet rather than pretending the circle is the garment.
 *
 * Three separate pages shipped showing colour rectangles for twelve dresses
 * that had all been photographed. The photograph field is therefore first on
 * this form, and the swatch is described as the thing you use when you have
 * nothing better.
 *
 * Men's gawns deliberately carry NO hex. There is no colour that "Bahary
 * Gawn" means — they are sold by regional cut — so a swatch would be an
 * invented fact rather than a stand-in.
 */
export const flyingDressOutfit = defineType({
  name: "flyingDressOutfit",
  title: "Flying Dresses — Garment",
  type: "document",
  fields: [
    defineField({
      name: "outfitId",
      title: "Identifier",
      type: "string",
      description:
        "⚠️ SET THIS ONCE AND DO NOT CHANGE IT. Bookings store this value. Changing it on a garment somebody has already chosen does not show an error — it just stops matching, and that booking's dress becomes unresolvable. Lowercase, no spaces: cherry, bahary-gawn-3.",
      validation: (r) =>
        r.required().custom((v) =>
          typeof v === "string" && /^[a-z0-9-]+$/.test(v)
            ? true
            : "Lowercase letters, numbers and hyphens only."
        ),
    }),
    defineField({
      name: "name",
      title: "Name shown to customers",
      type: "string",
      description: "Safe to change at any time. Renaming does not affect past bookings.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "What kind of garment",
      type: "string",
      options: {
        list: [
          { title: "Flying dress", value: "womens-dress" },
          { title: "Men's gawn", value: "mens-outfit" },
        ],
        layout: "radio",
      },
      initialValue: "womens-dress",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photo",
      title: "Photograph",
      type: "image",
      options: { hotspot: true },
      description:
        "Landscape. This is what a customer actually wants to see. Without it the site falls back to the colour swatch below, which is honest but much weaker.",
    }),
    defineField({
      name: "alt",
      title: "Describe the photograph",
      type: "string",
      description:
        "For someone who cannot see it, and for Google: \"The Cherry dress on the Giza rooftop, its red train sweeping the full width of the frame\".",
      validation: (r) =>
        r.custom((v, ctx) => {
          const doc = ctx.document as { photo?: unknown } | undefined;
          if (doc?.photo && (!v || (typeof v === "string" && v.trim().length < 10))) {
            return "A photograph needs a description. Say what is happening in it.";
          }
          return true;
        }),
    }),
    defineField({
      name: "hex",
      title: "Colour swatch (fallback only)",
      type: "string",
      description:
        "Used ONLY where there is no photograph yet. Leave it empty for a men's gawn: those are sold by regional cut, not by colour, so a swatch would invent a fact. Format: #9d2235.",
      validation: (r) =>
        r.custom((v, ctx) => {
          if (!v) return true;
          if (typeof v !== "string" || !/^#[0-9a-fA-F]{6}$/.test(v)) {
            return "Six-digit hex, like #9d2235.";
          }
          const doc = ctx.document as { category?: string } | undefined;
          if (doc?.category === "mens-outfit") {
            return "Men's gawns have no colour swatch — there is no colour that a regional cut means. Leave this empty.";
          }
          return true;
        }),
    }),
    defineField({
      name: "shoot",
      title: "Which shoot the photograph came from",
      type: "string",
      description: "So a frame can always be traced back to the session and the client it belongs to.",
    }),
    defineField({
      name: "order",
      title: "Position in the wardrobe",
      type: "number",
      initialValue: 10,
      validation: (r) => r.required().integer().min(0),
    }),
    defineField({
      name: "retired",
      title: "No longer available",
      type: "boolean",
      initialValue: false,
      description:
        "Hides it from the website WITHOUT deleting it. Use this rather than deleting: a deleted garment is one a past booking can no longer name. There is no undo for a delete.",
    }),
  ],
  orderings: [
    { title: "Position", name: "order", by: [{ field: "order", direction: "asc" }] },
    { title: "Name", name: "name", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", category: "category", retired: "retired", media: "photo" },
    prepare: ({ title, category, retired, media }) => ({
      title: retired ? `${title} (retired)` : title,
      subtitle: category === "mens-outfit" ? "Men's gawn" : "Flying dress",
      media,
    }),
  },
});
