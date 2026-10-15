import type { ImageTone, PageSeo, Price } from "./types";

// Shopping tours — a private day spent buying things properly.
//
// ─────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE IS ALLOWED TO SAY
// ─────────────────────────────────────────────────────────────────────────
//
// Giza and Old Cairo are real places and Khan el-Khalili is a real market,
// so naming them is reporting, not invention. Everything past that — which
// workshops we go to, how long the day runs, what it costs, what is included,
// who picks you up — is a commercial arrangement nobody has confirmed, and
// this file does not contain it.
//
// So every area below carries `confirmed: false` and empty lists. While that
// is false the page says the day is arranged around the traveller and
// confirmed before anything is booked, which is true, rather than printing an
// itinerary that would be invented. Fill the lists in, flip the flag, and the
// page shows the real thing instead. scripts/check-shopping-tours.mts holds
// the line.
//
// Specifically NOT claimed anywhere here: that any shop is a partner, that
// any workshop has been vetted by us, that anything sold is certified or
// guaranteed authentic, that a price is fixed, or that a departure runs on
// any particular day.

export const SHOPPING_TOURS_PATH = "/shopping-tours";

export type ShoppingArea = {
  slug: string;
  name: string;
  /** The place itself — geography, not commerce. */
  about: string;
  /** What that quarter is known for making. Crafts, not shops. */
  knownFor: string[];
  imageTone: ImageTone;
  image?: string;
  imageAlt?: string;
  /**
   * False until Egypt Eye confirms the commercial detail below. While it is
   * false the page shows none of it and says the day is built per trip.
   */
  confirmed: boolean;
  /** All editable, all empty until confirmed. Never invented. */
  duration?: string;
  price?: Price;
  itinerary?: { title: string; description: string }[];
  included?: string[];
  pickup?: string;
  availability?: string;
};

export const shoppingToursPage = {
  eyebrow: "Shop & Collect",
  title: "Spend a day buying things properly",
  intro:
    "Most souvenirs are bought in the last hour before an airport. A shopping day is the opposite: someone who knows the quarters takes you to the workshops, translates, tells you what a thing should cost, and carries the bags. You buy less and keep it longer.",
  body: [
    {
      title: "Why go with someone",
      body: "Cairo's craft quarters are not laid out for visitors. The good workshops are upstairs, behind other shops, or down lanes with no sign, and the price you are quoted depends entirely on whether the seller thinks you know what you are looking at. Going with someone who does changes both halves of that.",
    },
    {
      title: "We do not take a cut",
      body: "You pay the shop directly, at the shop's price. We are not going to steer you into a workshop because an arrangement says we should — and if we have not been somewhere ourselves, we will say that too.",
    },
  ],
  seo: {
    seoTitle: "Private Shopping Tours in Cairo — Giza and Old Cairo | Egypt Eye",
    seoDescription:
      "A private shopping day in Cairo's craft quarters — Giza and Old Cairo — with someone who knows the workshops, the prices and the language. Arranged around your trip.",
  } satisfies PageSeo,
};

export const shoppingAreas: ShoppingArea[] = [
  {
    slug: "giza",
    name: "Giza",
    about:
      "The quarter beside the pyramids, where the workshops that supply the plateau's shops actually sit. It is the easier half-day if you are already out there for the pyramids, and the one to combine with a morning at the site.",
    knownFor: ["Papyrus", "Alabaster", "Fragrance oils", "Cartouche and silverwork"],
    imageTone: "giza",
    confirmed: false,
  },
  {
    slug: "old-cairo",
    name: "Old Cairo",
    about:
      "Khan el-Khalili and the lanes around it have been a market since the fourteenth century, and the trades are still grouped by street — the coppersmiths together, the perfumers together. It is the bigger day, and the better one if you want to see things being made.",
    knownFor: ["Copper and brass", "Textiles and cotton", "Perfume oils", "Spices", "Inlaid wood"],
    imageTone: "desert",
    confirmed: false,
  },
];

export function shoppingAreaBySlug(slug: string): ShoppingArea | undefined {
  return shoppingAreas.find((a) => a.slug === slug);
}

/** True once at least one area has real commercial detail behind it. */
export function hasConfirmedShoppingTour(): boolean {
  return shoppingAreas.some((a) => a.confirmed);
}
