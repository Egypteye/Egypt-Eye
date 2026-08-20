import type { StructureResolver } from "sanity/structure";

// Custom Studio sidebar: pins "Site Settings" as a single always-visible
// entry (it's a singleton — one document holds all global copy) instead of
// showing it as a list you could accidentally create duplicates of.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Egypt Eye Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings")
        ),
      S.listItem()
        .title("Customize Page")
        .child(
          S.document().schemaType("customizePage").documentId("customizePage")
        ),
      S.listItem()
        .title("About Page")
        .child(
          S.document().schemaType("aboutPage").documentId("aboutPage")
        ),
      S.listItem()
        .title("Contact Page")
        .child(
          S.document().schemaType("contactPage").documentId("contactPage")
        ),
      S.divider(),
      S.documentTypeListItem("tour").title("Tours"),
      S.documentTypeListItem("experience").title("Extra Experiences"),
      S.documentTypeListItem("photoshoot").title("Photoshoot Packages"),
      S.documentTypeListItem("story").title("Blog Posts"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("faqItem").title("FAQ"),
    ]);
