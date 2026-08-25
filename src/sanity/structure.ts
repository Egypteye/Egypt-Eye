import type { StructureResolver } from "sanity/structure";
import BulkReviewsTool from "./tools/BulkReviewsTool";

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
        .title("Homepage")
        .child(
          S.document().schemaType("homepage").documentId("homepage")
        ),
      S.listItem()
        .title("Listing Pages")
        .child(
          S.document().schemaType("listingPages").documentId("listingPages")
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
        .title("Contact Info (shown on the About page)")
        .child(
          S.document().schemaType("contactPage").documentId("contactPage")
        ),
      S.divider(),
      S.documentTypeListItem("signatureExperience").title("✦ Signature Experiences"),
      S.documentTypeListItem("host").title("✦ Hosts / Guides"),
      S.divider(),
      S.documentTypeListItem("story").title("✦ Stories"),
      S.documentTypeListItem("author").title("✦ Story Authors"),
      S.documentTypeListItem("event").title("✦ Events / Countdowns"),
      S.divider(),
      S.documentTypeListItem("destinationHub").title("✦ Explore Egypt Destinations"),
      S.divider(),
      S.documentTypeListItem("tour").title("Tours"),
      S.documentTypeListItem("experience").title("Extra Experiences"),
      S.documentTypeListItem("photoshoot").title("Photoshoot Packages"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.listItem()
        .title("＋ Bulk Add Reviews")
        .child(S.component(BulkReviewsTool).id("bulk-reviews").title("Bulk Add Reviews")),
      S.documentTypeListItem("faqItem").title("FAQ"),
    ]);
