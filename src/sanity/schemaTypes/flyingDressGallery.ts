import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A FRAME IN A FLYING DRESSES GALLERY.
 *
 * The honesty rule this brand runs on is that a slot with no real photograph
 * must not look like one. So a frame with no image does not fall back to a
 * stock picture: it renders as a designed, labelled gap carrying the "What
 * should go here" text. That behaviour is why `photo` is optional and
 * `wanted` exists, and why there is no "use a placeholder" option anywhere.
 */
export const flyingDressFrameObject = defineType({
  name: "flyingDressFrame",
  title: "Frame",
  type: "object",
  fields: [
    defineField({
      name: "photo",
      title: "Photograph",
      type: "image",
      options: { hotspot: true },
      description:
        "Landscape works best: every frame on this site is a landscape cell. Leave it empty if you do not have the photograph yet and the frame will show as a labelled gap instead, which is better than a stock photo a visitor might mistake for your work.",
    }),
    defineField({
      name: "alt",
      title: "Describe the photograph",
      type: "string",
      description:
        "For someone who cannot see it, and for Google. Describe what is happening: 'The Cherry dress on the Giza rooftop, the pyramids behind'. Never the filename.",
      validation: (r) => r.required().min(10),
    }),
    defineField({
      name: "kind",
      title: "Whose photograph is this?",
      type: "string",
      options: {
        list: [
          { title: "Ours. A real client shoot.", value: "agency" },
          { title: "A photograph of the place, not of a shoot.", value: "location" },
        ],
        layout: "radio",
      },
      initialValue: "agency",
      description:
        "This is not cosmetic. A photograph of the place must never be presented as one of your shoots. If the frame has no photograph, leave this as it is; it is ignored.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "credit",
      title: "Caption",
      type: "string",
      description:
        "The line under the frame. Usually the shoot or the collaboration: 'Nunu and Kassy shoot, Fayoum'. Leave empty for no caption.",
    }),
    defineField({
      name: "wanted",
      title: "What should go here (only for a frame with no photograph)",
      type: "string",
      description:
        "Shown across the labelled gap, so a visitor sees what is coming: \"A couples' frame: a dress and a gawn together\".",
    }),
  ],
  preview: {
    select: { title: "alt", subtitle: "credit", media: "photo" },
  },
});

/**
 * A NAMED GALLERY.
 *
 * Publishing one of these REPLACES the matching entry in
 * src/content/flyingDressGalleries.ts wholesale. It does not merge field by
 * field. That is the documented behaviour of every Sanity-backed type in this
 * codebase (see .claude/skills/sanity-content), and it is why `frames` is
 * hardened at the fetch boundary: emptying this list should empty the section
 * on the page, never end the build.
 */
export const flyingDressGallery = defineType({
  name: "flyingDressGallery",
  title: "Flying Dresses gallery",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Heading shown on the page",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "galleryId",
      title: "Which gallery is this?",
      type: "string",
      options: {
        list: [{ title: "Home page: What a morning looks like", value: "home-work" }],
      },
      description:
        "This is how the page finds the gallery, so it is a fixed list rather than free text. Renaming the heading above is safe; this must keep matching the page.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Even grid. Every frame the same size.", value: "grid" },
          { title: "One large frame, the rest supporting it.", value: "feature" },
          { title: "A row you scroll sideways.", value: "strip" },
        ],
        layout: "radio",
      },
      initialValue: "grid",
      description:
        "The even grid looks best with a multiple of six frames, because it shows one, two or three across depending on the screen.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "frames",
      title: "Frames, in order",
      type: "array",
      of: [defineArrayMember({ type: "flyingDressFrame" })],
      description:
        "Drag to reorder. The page counts these itself, so the sentence above the gallery always matches what is actually shown.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "galleryId", media: "frames.0.photo" },
  },
});
