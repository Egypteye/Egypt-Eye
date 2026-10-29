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
      // The Boutique. These were missing from this list entirely until
      // now: the schemas and the documents existed, but with no entry here
      // there was no way to reach them in the Studio, which made the whole
      // section unmanageable without a developer — the opposite of the point.
      S.listItem()
        .title("✦ The Boutique — Landing Page")
        .child(S.document().schemaType("takeEgyptHomePage").documentId("takeEgyptHomePage")),
      S.documentTypeListItem("treasureCategory").title("✦ The Boutique — Categories"),
      S.documentTypeListItem("treasureProduct").title("✦ The Boutique — Products"),
      S.divider(),
      // ------------------------------------------------------------------
      // FLYING DRESSES EGYPT — a second brand on its own domain.
      //
      // The comment that used to sit here said this brand's content "lives
      // entirely in code" and that the galleries were "the one part the owner
      // can change without a developer". Both were true, and a query of the
      // production dataset found ZERO gallery documents — so in practice it
      // was not one part, it was none. Every price, photograph and sentence
      // on that site needed a developer and a deploy.
      //
      // Settings first, because it is the singleton holding the hero, the
      // contact details, the inclusions and the menu; then the things that
      // cost money; then the wardrobe.
      // ------------------------------------------------------------------
      S.listItem()
        .title("✿ Flying Dresses — Settings")
        .child(
          S.document()
            .schemaType("flyingDressSettings")
            .documentId("flyingDressSettings")
        ),
      S.listItem()
        .title("✿ Flying Dresses — Rates")
        .child(
          S.document()
            .schemaType("flyingDressRateCard")
            .documentId("flyingDressRateCard")
        ),
      S.listItem()
        .title("✿ Flying Dresses — Proposals page")
        .child(
          S.document()
            .schemaType("flyingDressProposalPage")
            .documentId("flyingDressProposalPage")
        ),
      S.listItem()
        .title("✿ Flying Dresses — Gender reveal page")
        .child(
          S.document()
            .schemaType("flyingDressRevealPage")
            .documentId("flyingDressRevealPage")
        ),
      S.documentTypeListItem("flyingDressPackage").title("✿ Flying Dresses — Photoshoots"),
      S.documentTypeListItem("flyingDressAddOn").title("✿ Flying Dresses — Extras"),
      S.documentTypeListItem("flyingDressRental").title("✿ Flying Dresses — Hire services"),
      S.documentTypeListItem("flyingDressOutfit").title("✿ Flying Dresses — Wardrobe"),
      S.documentTypeListItem("flyingDressGallery").title("✿ Flying Dresses — Galleries"),
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
