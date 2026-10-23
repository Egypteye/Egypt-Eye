import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * FLYING DRESSES EGYPT — THE STUDIO.
 *
 * =========================================================================
 * WHY THIS FILE EXISTS
 * =========================================================================
 * Until now this brand had exactly one Sanity type (flyingDressGallery), and
 * a query of the production dataset found ZERO documents of it. Everything
 * else — the three prices, twelve dresses, eight experience categories, every
 * headline, every FAQ answer, the contact details and the nav — lived in
 * src/content/flyingDresses.ts and could only be changed by a developer
 * editing TypeScript and redeploying.
 *
 * The owner works from a browser, Vercel, the Studio and the Supabase SQL
 * editor (CLAUDE.md §2). So every request they made about this brand —
 * a price, a photograph, a sentence — required a code change. That is the
 * problem this closes.
 *
 * =========================================================================
 * THE RULE THAT GOVERNS EVERY TYPE IN HERE
 * =========================================================================
 * Publishing a document REPLACES the matching entry in src/content wholesale.
 * It does not merge field by field. That is the documented behaviour of every
 * Sanity-backed type in this codebase (.claude/skills/sanity-content), and it
 * is why every list is hardened at the fetch boundary in lib/sanityShape.ts:
 * clearing a field should empty a section on the page, never end a build.
 *
 * The content files stay. They are the fallback when no document exists, the
 * source the i18n pipeline extracts from, and the record of why each value is
 * what it is. They are not dead code and must not be deleted.
 *
 * =========================================================================
 * WHAT IS DELIBERATELY NOT IN THE STUDIO
 * =========================================================================
 * Documented in docs/FLYING-DRESSES-STUDIO.md and worth stating here too:
 * the domain, the Egypt Eye origin used for checkout handoff, PayPal
 * credentials, the Supabase keys, the deposit percentage authority and the
 * breakpoint constants. Those are technical configuration or money
 * authorities, and a CMS field is the wrong place for either. An editor who
 * can change the domain can take the site down; an editor who can change the
 * deposit percentage in two places can make the two disagree.
 */

/* ------------------------------------------------------------------------ */
/* Shared objects                                                            */
/* ------------------------------------------------------------------------ */

export const fdFaqObject = defineType({
  name: "fdFaq",
  title: "Question",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "The question, as a customer would ask it",
      type: "string",
      description:
        "Write it the way somebody actually types it, not the way a brochure phrases it. \"Do I have to hold the dress myself?\" beats \"Regarding dress handling\".",
      validation: (r) => r.required().min(8),
    }),
    defineField({
      name: "answer",
      title: "The answer",
      type: "text",
      rows: 4,
      description:
        "Answer it in the first sentence, then explain. These are read by people deciding whether to spend money, and they are also what Google shows.",
      validation: (r) => r.required().min(20),
    }),
  ],
  preview: { select: { title: "question", subtitle: "answer" } },
});

export const fdInclusionObject = defineType({
  name: "fdInclusion",
  title: "What is included",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "The inclusion",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "detail",
      title: "What it actually means",
      type: "text",
      rows: 2,
      description:
        "The sentence that stops it being a bullet point. \"One person whose whole job is the fabric\" tells a customer something; \"An assistant\" does not.",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "title", subtitle: "detail" } },
});

export const fdSocialObject = defineType({
  name: "fdSocial",
  title: "Social account",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: {
        list: ["Instagram", "TikTok", "Facebook", "YouTube", "Pinterest"],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "handle",
      title: "Handle, without the @",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "profileUrl",
      title: "Full link to the profile",
      type: "url",
      description:
        "This is what tells Google these accounts belong to this business. A link to the WRONG account ties the business to someone else, so leave it empty rather than guess: an account with no link is simply not published as a connection.",
    }),
  ],
  preview: { select: { title: "platform", subtitle: "handle" } },
});

/* ------------------------------------------------------------------------ */
/* The settings singleton                                                    */
/* ------------------------------------------------------------------------ */

export const flyingDressSettings = defineType({
  name: "flyingDressSettings",
  title: "Flying Dresses — Settings",
  type: "document",
  groups: [
    { name: "brand", title: "Brand & hero", default: true },
    { name: "contact", title: "Contact" },
    { name: "included", title: "What's included" },
    { name: "policy", title: "Payment & cancellation" },
    { name: "nav", title: "Menu" },
  ],
  fields: [
    /* ---- Brand ---- */
    defineField({
      name: "name",
      title: "Business name",
      type: "string",
      group: "brand",
      description:
        "Used in the page title of every page, after the page's own name. It costs 23 of the ~60 characters Google shows, so a longer name leaves less room for the page.",
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: "shortName",
      title: "Short name",
      type: "string",
      group: "brand",
      validation: (r) => r.required().max(30),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "brand",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "What the business does, in one paragraph",
      type: "text",
      rows: 4,
      group: "brand",
      description:
        "Used for search engines and for the card that appears when somebody shares the site. Say the locations and what is included.",
      validation: (r) => r.required().min(80),
    }),
    defineField({
      name: "heroHeadline",
      title: "Headline, first line",
      type: "string",
      group: "brand",
      description:
        "The largest words on the site. Keep both lines short: they are set in a display face at up to 84px and a long line wraps into a wall.",
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: "heroHeadlineAccent",
      title: "Headline, second line (italic)",
      type: "string",
      group: "brand",
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: "heroSupport",
      title: "The paragraph under the headline",
      type: "text",
      rows: 3,
      group: "brand",
      description:
        "The most commercially important sentence on the site. It is where the early hour and the photograph count are claimed, which are the two things competitors at this price do not match.",
      validation: (r) => r.required().min(60),
    }),

    /* ---- Contact ---- */
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "contact",
      validation: (r) =>
        r.required().custom((v) =>
          typeof v === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)
            ? true
            : "That does not look like an email address."
        ),
    }),
    defineField({
      name: "phoneDisplay",
      title: "Phone, written the way it should be read",
      type: "string",
      group: "contact",
      description:
        "Spaces and all: +20 109 761 6533. The dialling link and the WhatsApp link are both built from this by stripping everything that is not a digit, so there is one number here and it cannot disagree with itself.",
      validation: (r) =>
        r.required().custom((v) =>
          typeof v === "string" && v.replace(/\D/g, "").length >= 10
            ? true
            : "Needs at least 10 digits, including the country code."
        ),
    }),
    defineField({
      name: "location",
      title: "Where the business is",
      type: "string",
      group: "contact",
      initialValue: "Cairo, Egypt",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "socials",
      title: "Social accounts",
      type: "array",
      group: "contact",
      of: [defineArrayMember({ type: "fdSocial" })],
    }),

    /* ---- Inclusions ---- */
    defineField({
      name: "packageIncludes",
      title: "What every photoshoot includes",
      type: "array",
      group: "included",
      of: [defineArrayMember({ type: "fdInclusion" })],
      description:
        "Shown on the home page and on all three photoshoot pages. This is the brand's strongest commercial asset at its price point, so it is one list used everywhere rather than three that can drift apart. Drag to reorder.",
    }),

    /* ---- Policy ---- */
    defineField({
      name: "paymentNote",
      title: "The payment note",
      type: "text",
      rows: 3,
      group: "policy",
      description:
        "Shown wherever payment is mentioned. It currently says no card details are ever collected on this website, which is true and is a trust signal. Do not weaken it unless a checkout is actually built here.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "paymentMethods",
      title: "Accepted payment methods",
      type: "array",
      group: "policy",
      of: [
        defineArrayMember({
          type: "object",
          name: "fdPaymentMethod",
          fields: [
            defineField({ name: "label", title: "Method", type: "string", validation: (r) => r.required() }),
            defineField({ name: "detail", title: "Any condition", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "detail" } },
        }),
      ],
    }),
    defineField({
      name: "cancellationPublished",
      title: "Publish a full cancellation policy?",
      type: "boolean",
      group: "policy",
      initialValue: false,
      description:
        "LEAVE THIS OFF until the real notice periods and charges have been decided. The brochure sets out both a 15-day and a 7-day provision and they overlap rather than nest, so it is not determinable which applies to a cancellation made ten days out. Turning this on publishes a commitment the business has not made.",
    }),
    defineField({
      name: "cancellationSummary",
      title: "What is said about cancellation",
      type: "text",
      rows: 3,
      group: "policy",
      description:
        "The honest version, used whether or not the switch above is on: deposits are non-refundable and can usually be moved, and the exact terms are confirmed in writing when a date is held.",
      validation: (r) => r.required(),
    }),

    /* ---- Nav ---- */
    defineField({
      name: "nav",
      title: "Main menu",
      type: "array",
      group: "nav",
      of: [
        defineArrayMember({
          type: "object",
          name: "fdNavItem",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required().max(16) }),
            defineField({
              name: "href",
              title: "Where it goes",
              type: "string",
              description: "A path on this site, starting with /flying-dresses — for example /flying-dresses/wardrobe.",
              validation: (r) =>
                r.required().custom((v) =>
                  typeof v === "string" && v.startsWith("/flying-dresses")
                    ? true
                    : "Must be a path on this site, starting with /flying-dresses."
                ),
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
      /**
       * SIX IS A MEASURED CEILING, NOT A PREFERENCE.
       *
       * The header shows this menu from 72rem up, where it has to fit the
       * wordmark, the labels and the enquire button on one line. A seventh
       * label was added for the stories section and then removed, because
       * Chromium at the breakpoint reported the wordmark squeezed to ZERO
       * pixels, and to 97 of 135 at 1280. The logo is the flex item that
       * gives, so a seventh entry does not overflow the bar — it silently
       * eats the owner's logo between 1152px and about 1400px, invisibly on a
       * 1440px laptop and on a phone.
       *
       * An editor cannot see that, so the rule says it here rather than
       * leaving them to discover it from a screenshot.
       */
      validation: (r) =>
        r
          .max(6)
          .warning(
            "Six is the most that fits. A seventh item does not overflow the bar — it squeezes the logo to nothing between 1152px and 1400px, which you will not see on a laptop or a phone. Put the extra link in the footer instead."
          ),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Flying Dresses — Settings" }),
  },
});
