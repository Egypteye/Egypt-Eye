/**
 * FLYING DRESSES EGYPT — the whole brand, in one file.
 *
 * This is the configuration the owner edits. Prices, locations, inclusions,
 * add-ons, the wardrobe, the rental services and the contact details all live
 * here and nowhere else, so changing a price is one edit in one file rather
 * than a search across components. Every page under src/app/flying-dresses
 * reads from this module.
 *
 * It is a SEPARATE BRAND from Egypt Eye Travel, on its own domain, with its
 * own root layout — so it deliberately does not import content/site.ts. The
 * two businesses share an owner and a wardrobe, not an identity.
 *
 * -------------------------------------------------------------------------
 * WHERE THESE FACTS COME FROM, AND WHAT IS NOT HERE
 * -------------------------------------------------------------------------
 * Source: the "Services and Pricing Packages Of Flying Dresses" brochure, as
 * transcribed into the build brief. The PDF itself was not available in this
 * environment, so the brochure is a second-hand transcription and is treated
 * as such: everything from it carries `confirm` where it needs checking
 * before launch. See docs/FLYING-DRESSES-OWNER-CONFIRMATIONS.md.
 *
 * Corroboration that the brochure is current: egypteyetravel.com/photoshoots
 * — the sister brand, same owner, same twelve dresses — was fetched live and
 * shows Sand Dunes $179, Rooftop $199 and Fayoum $349, matching the brochure
 * on all three. That is encouraging, not proof. Prices still need a yes.
 *
 * NOT IN THIS FILE, and not to be added without the owner supplying it:
 * rental prices, accessory names, dress sizes, stock or availability
 * promises, testimonials, ratings, review counts, customer numbers, awards,
 * founding dates, or any resolution of the brochure's contradictory
 * cancellation notice periods. The pages render all of those the moment they
 * are real. Until then they say what is known and stop.
 *
 * English only for now. This content is deliberately NOT imported by
 * scripts/i18n-extract.mts: the Egypt Eye site is translated into six
 * languages, and quietly enrolling a second brand's entire copy into that
 * pipeline would spend a translation budget nobody approved. Add the import
 * when the owner asks for it.
 */

import type { Outfit } from "@/lib/booking/outfits";
import {
  FLYING_DRESS_COLLECTION,
  FLYING_DRESS_OUTFITS,
  MENS_OUTFITS,
} from "./outfitCollection";

export const FLYING_DRESSES_PATH = "/flying-dresses";

/**
 * Where the deposit is actually taken.
 *
 * Instant booking runs on the Egypt Eye deployment — the one that holds the
 * PayPal credentials, writes the reservation and sends the emails. This brand
 * links to it ABSOLUTELY rather than with a relative path, and that is a
 * deliberate isolation decision, not a convenience:
 *
 *   - If Flying Dresses is served from its own Vercel project, a relative
 *     /secure/... would resolve against flyingdressesegypt.com, where
 *     src/proxy.ts now refuses every Egypt Eye route. The link would 404.
 *   - Pointing it at the Egypt Eye origin means the Flying Dresses project
 *     NEVER NEEDS PAYPAL CREDENTIALS. It cannot take a payment, cannot capture
 *     one and cannot receive a webhook, because it has nothing to do it with.
 *     That is the strongest form of isolation available: not a guard, an
 *     absence.
 *   - And it keeps "the same PayPal" literally true — it is not the same
 *     account configured twice, it is the same checkout.
 *
 * Override per deployment with NEXT_PUBLIC_EGYPT_EYE_ORIGIN if the travel
 * site ever moves.
 */
export const EGYPT_EYE_ORIGIN =
  process.env.NEXT_PUBLIC_EGYPT_EYE_ORIGIN || "https://egypteyetravel.com";

// ---------------------------------------------------------------------------
// VERIFICATION MARKERS
//
// Every business fact below is tagged with how well it is known. The UI reads
// these: a `confirm` fact can be shown, but it is never dressed up as
// independently verified, and `missing` renders as absent rather than as a
// guess. scripts/check-flying-dresses.mts asserts the marker is present
// wherever a price is.
// ---------------------------------------------------------------------------

export type Confidence =
  /** Read on a live page in this session, or structurally true in this repo. */
  | "verified"
  /** From the brochure transcription. Plausible, needs an owner yes. */
  | "confirm"
  /** Nobody has supplied this. Renders as absent, never as a placeholder. */
  | "missing";

// ---------------------------------------------------------------------------
// BRAND
// ---------------------------------------------------------------------------

export const brand = {
  name: "Flying Dresses Egypt",
  shortName: "Flying Dresses",
  /**
   * The owner has the domain. It did not resolve from the build environment,
   * which is consistent with a domain that is registered and hosted but not
   * yet pointed at a site — exactly the position a new build is for.
   *
   * Used for canonical URLs and the sitemap. If the site is served from a
   * different host, change it here and set NEXT_PUBLIC_FLYING_DRESSES_URL to
   * match; src/app/flying-dresses/_lib/seo.ts prefers the env var.
   */
  domain: "flyingdressesegypt.com",
  url: "https://flyingdressesegypt.com",

  /**
   * The line in the first viewport.
   *
   * Chosen over "Let the Desert Become Your Runway" from the brief, which is
   * the better-known construction and therefore the more generic one — the
   * desert-as-runway line is used by flying-dress operators in Agafay,
   * Cappadocia and Dubai. "Wear the wind" is the brief's second option and is
   * about the one thing that is physically true of this product and of no
   * other photoshoot: the garment is moved by the air.
   */
  heroHeadline: "Wear the Wind",
  heroHeadlineAccent: "Remember Egypt Forever",

  /**
   * The supporting line, and the most commercially important sentence on the
   * site.
   *
   * It leads with 7am and with the image count because those are the two
   * claims competitors at this price cannot match, and both are checkable.
   * Research: competitors listing $180 for the same hour deliver six to
   * twenty-five retouched photographs. See docs/INSPIRATION-RESEARCH.md §2.
   */
  heroSupport:
    "A flowing dress above Giza an hour before the gates open, or out in the dunes with nobody else in the frame. You leave with more than a hundred colour-graded photographs, not a handful.",

  tagline: "Editorial flying-dress photography in Egypt",

  description:
    "Flying-dress photoshoots in Egypt: a rooftop above the Pyramids of Giza, the sand dunes outside Cairo, and the lakes and white dunes of Fayoum. Twelve dresses, traditional Egyptian attire for men, door-to-door transport and 100+ colour-graded photographs. Dress rental without a photoshoot is available separately.",
} as const;

// ---------------------------------------------------------------------------
// CONTACT — all owner-confirmed. See the block comment below.
// ---------------------------------------------------------------------------

/** Digits only, for tel: and wa.me. (+20)1097616533 -> 201097616533. */
function digits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * CONFIRMED BY THE OWNER.
 *
 * The email, the one phone number and all three social URLs were supplied
 * directly by the business, which is why they are marked "verified" rather
 * than "confirm" and why the social accounts are LINKED here where they were
 * previously rendered as plain text.
 *
 * Two things the brochure said that this supersedes, recorded so nobody
 * "restores" either of them:
 *
 *  1. The brochure listed a SECOND number, +20 128 534 3630. The owner named
 *     only this one for calls and WhatsApp, so only this one is published. An
 *     unanswered number on a contact page costs more than a missing one.
 *  2. The brochure gave one handle, "Flying_dresses_egypt", for both Instagram
 *     and TikTok. The real accounts do not match it: TikTok is
 *     @flying.dresses.eg and Facebook is /FlyingDressesEg. The URLs below are
 *     the authority; the handles are derived from them rather than typed
 *     separately, so the two can never disagree.
 */
const PRIMARY_PHONE = "+20 109 761 6533";

export const contact = {
  email: "info@flyingdressesegypt.com",
  emailConfidence: "verified" as Confidence,

  phones: [{ display: PRIMARY_PHONE, tel: `+${digits(PRIMARY_PHONE)}`, primary: true }],
  phoneConfidence: "verified" as Confidence,

  /** The same number. Confirmed by the owner as the WhatsApp line. */
  whatsapp: PRIMARY_PHONE,
  whatsappNumber: digits(PRIMARY_PHONE),
  whatsappConfidence: "verified" as Confidence,

  socials: [
    {
      platform: "Instagram",
      handle: "flying_dresses_egypt",
      profileUrl: "https://www.instagram.com/flying_dresses_egypt/" as string | null,
    },
    {
      platform: "TikTok",
      handle: "flying.dresses.eg",
      profileUrl: "https://www.tiktok.com/@flying.dresses.eg" as string | null,
    },
    {
      platform: "Facebook",
      handle: "FlyingDressesEg",
      profileUrl: "https://www.facebook.com/FlyingDressesEg" as string | null,
    },
  ],

  location: "Cairo, Egypt",
} as const;

/**
 * The WhatsApp deep link.
 *
 * `number` is optional and overrides the value in this file. It exists
 * because the phone number became editable in the Studio: a caller that has
 * already read the settings passes the live number, and a caller that has not
 * — a check script, a test — gets the content file's. One function, so the
 * message encoding cannot differ between the two.
 */
export function whatsappHref(message: string, number?: string): string {
  const to = (number ?? contact.whatsappNumber).replace(/\D/g, "");
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
}

// ---------------------------------------------------------------------------
// THE WARDROBE — twelve dresses and five men's gawns
// ---------------------------------------------------------------------------

/**
 * The twelve dresses and the five men's gawns, re-exported under this brand's
 * own names.
 *
 * Imported rather than re-declared: content/outfitCollection.ts is the single
 * authority for the wardrobe, because Egypt Eye Travel's photoshoot products
 * rent out the same physical garments. Two copies of the list would let the
 * sister sites drift until they disagreed about one wardrobe in Cairo. That
 * file carries the reasoning for every value, including why the men's gawns
 * have no colour swatch and what still needs confirming about them.
 */
export const dresses: Outfit[] = FLYING_DRESS_COLLECTION;
export const mensOutfits: Outfit[] = MENS_OUTFITS;
export const wardrobe: Outfit[] = FLYING_DRESS_OUTFITS;

// ---------------------------------------------------------------------------
// WHAT EVERY PHOTOSHOOT PACKAGE INCLUDES
//
// The brochure's list, in the brochure's terms. Shown prominently on every
// package, because research says the inclusions are this brand's strongest
// commercial asset at its price point: competitors listing the same $180 hour
// deliver six to twenty-five photographs. See docs/INSPIRATION-RESEARCH.md §2.
// ---------------------------------------------------------------------------

export type Inclusion = { title: string; detail: string };

export const packageIncludes: Inclusion[] = [
  {
    title: "Door-to-door transportation",
    // QUALIFIED, because the unqualified version could cost a customer money
    // on the day. The October 2026 brief: transport within the designated Giza
    // service area is free; from further out in Cairo, including New Cairo, it
    // "may incur an additional fee", calculated per booking rather than at a
    // flat rate. "Door-to-door transportation" with no conditions attached
    // promised a free pickup from anywhere.
    detail: "Collected from your hotel or address and brought back afterwards. Free within our Giza service area; from further out in Cairo, including New Cairo, there may be a transport charge, which we confirm with you before you book.",
  },
  {
    title: "100+ colour-graded photographs",
    detail: "Not a handful of selects. More than a hundred edited frames from one session.",
  },
  {
    title: "One flying dress, yours for the session",
    detail: "Rented from the collection for the shoot, in the colour you choose. Included in the price. Choosing one does not change what you pay.",
  },
  {
    // "Stylist" is the business's own word for this role, from the October
    // 2026 operating brief, and it is the more accurate one: the job is
    // dressing, fitting, tying and adjusting as well as throwing the fabric.
    title: "A stylist for the dress",
    detail: "One person whose whole job is the garment: dressing and fitting you, then holding the train, throwing it, and keeping it out of the sand between frames.",
  },
  {
    // NO CLOCK IN THIS LINE ANY MORE. It read "A 30 to 45 minute photoshoot"
    // and was printed on five pages for all three products. The October 2026
    // brief says that was right for the rooftop and wrong for everything else:
    // the desert is about an hour and a half, Fayoum four to six hours, the
    // yacht about six. Duration is `durationNote` on each product now.
    title: "A directed session",
    detail: "Directed throughout. You do not need to know how to pose. That is the photographer's job and the dress does the rest.",
  },
  {
    // Confirmed by the October 2026 brief. It was previously sold as a paid
    // extra ("Two Instagram Reels", $25) with nothing saying one came free,
    // so a customer could pay for something they already had.
    title: "A Reel from the session",
    detail: "A short vertical edit is included with every experience. Longer or more involved video is a separate, paid piece of work.",
  },
  {
    title: "Your unedited images, if you want them",
    detail: "Ask and we will send the originals as well, at no charge. They come as compressed JPGs rather than camera RAW files.",
  },
  {
    title: "Delivered in 6 to 10 days",
    detail: "Your edited gallery, within six to ten days of the shoot.",
  },
];

export const packageIncludesConfidence: Confidence = "confirm";

// ---------------------------------------------------------------------------
// LOCATIONS AND PACKAGES
// ---------------------------------------------------------------------------

export type FlyingDressPackage = {
  /**
   * The <meta name="description"> when the intro is the wrong length for one.
   * These intros run 212 to 240 characters because they are editorial openings;
   * a description is read in a result list and Google renders about 110 to 160.
   * Appending the inclusions to the intro produced 334 to 359, so the back half
   * — the part naming the price and what you get — was always cut off.
   */
  metaDescription?: string;
  slug: string;
  /**
   * The Egypt Eye photoshoot document this shoot IS.
   *
   * Flying Dresses Egypt and Egypt Eye Travel sell the same three sessions,
   * run by the same team, from the same wardrobe — so instant booking here is
   * the SAME product being booked, not a second copy of it. This slug is how
   * the booking rail finds it: src/app/flying-dresses/_components/BookingRail.tsx
   * loads that document from Sanity and asks productRail() for the deposit,
   * exactly as the Egypt Eye product page does.
   *
   * That is the whole reason there is no second payment integration here. The
   * price, the deposit percentage, the PayPal credentials and the on/off
   * switch all stay in one place, and nothing in this brand's code can quote a
   * figure the other brand would disagree with. See CLAUDE.md §5 — one
   * authority per answer, and `productRail()` is it.
   *
   * A slug that no longer exists simply makes the deposit unavailable and the
   * page falls back to the enquiry button. scripts/check-flying-dresses.mts
   * asserts all three still resolve, so a rename in the Studio is caught by a
   * check rather than by a customer finding a dead button.
   */
  /**
   * The Egypt Eye photoshoot document this shoot IS, or "" when there is none.
   *
   * EMPTY IS LEGITIMATE. The Ain Sokhna yacht experience has no counterpart on
   * the travel site, so there is nothing to take a deposit against and the
   * page offers an enquiry instead. That is the same graceful path a renamed
   * slug already took; the difference is that this one is deliberate, so the
   * check script verifies the slugs that EXIST rather than asserting there are
   * three of them.
   */
  eyeSlug: string;
  /** Short label for nav and cards. */
  name: string;
  /** Full editorial title. */
  title: string;
  eyebrow: string;
  /**
   * Per person, USD. Integer dollars.
   *
   * NULL MEANS NOBODY HAS SET A PRICE, and that is a real, publishable state
   * rather than a bug. It arrived with the Ain Sokhna yacht experience: the
   * October 2026 operating brief confirms the product, its location and its
   * six-hour duration, and explicitly does not confirm a price. The honest
   * rendering is "price on request", which is what the rental services have
   * always done.
   *
   * It is deliberately NOT 0. A zero is a price, and it means free.
   */
  priceUsd: number | null;
  priceConfidence: Confidence;
  /**
   * HOW LONG THIS ONE ACTUALLY TAKES.
   *
   * This used to be a single shared inclusion reading "A 30 to 45 minute
   * photoshoot", printed on the home page, the photoshoots index, every shoot
   * page, the pricing page and in an FAQ answer. The October 2026 operating
   * brief says it was right for exactly one of the four:
   *
   *     Giza rooftop      about 45 minutes
   *     Giza desert       about 1.5 hours
   *     Fayoum            4 to 6 hours, several locations
   *     Ain Sokhna yacht  about 6 hours
   *
   * So a visitor comparing the desert shoot against the rooftop was told both
   * take the same time, when one takes twice the other. Duration is per
   * product now, and the shared inclusion no longer mentions a clock.
   */
  durationNote: string;
  /**
   * The brochure's own description of where it is. Reproduced rather than
   * rewritten, because "approximately 45 minutes from central Cairo towards
   * New Cairo" is the kind of sentence that gets silently turned into a named
   * site that is then wrong.
   */
  gettingThere: string;
  gettingThereConfidence: Confidence;
  /** Editorial lead paragraph. Art direction, not a claim about the site. */
  intro: string;
  /** Why this one rather than the other two. */
  whyThis: string[];
  /** What the photography looks like here — art direction for the gallery. */
  visualDirection: string;
  /** Hero image slot. See docs/FLYING-DRESSES-ASSET-CHECKLIST.md. */
  image: string | null;
  imageAlt: string;
  /** Marks a stand-in image so a reviewer can see what still needs replacing. */
  imageIsPlaceholder: boolean;
  /** Tone for the gradient shown when `image` is null. */
  tone: "dunes" | "rooftop" | "fayoum";
  faqs: { question: string; answer: string }[];
  /**
   * WHY THIS ONE COSTS WHAT IT COSTS, said where the price is read.
   *
   * Optional, because only a price that looks surprising needs defending.
   * Fayoum is $349 against $179 and $199 and the reason was buried in an FAQ
   * near the foot of the page, which is three screens below the number it
   * explains. A figure a visitor cannot account for reads as a mistake or as
   * greed, and either way they leave before reaching the answer.
   *
   * It may never introduce a new figure. The only price on this page is
   * `priceUsd`, and scripts/check-flying-dresses.mts holds that line.
   */
  priceStory?: { heading: string; body: string[] };
  /**
   * The shoot in order, for the visitor who wants to know what they are
   * actually signing up for before they enquire.
   *
   * Only confirmed facts: the hours come from the brochure and from what the
   * business has stated about its own sessions. Anything unverified belongs in
   * `confirm`, not here.
   */
  timeline?: { when: string; what: string }[];
  /** Anything about this package the owner still has to confirm. */
  confirm: string[];
};

export const packages: FlyingDressPackage[] = [
  {
    slug: "sand-dunes",
    metaDescription:
      "A flying dress photoshoot in open dune country outside Cairo, shot at first light. $179 per person, including the dress, transport and 100+ edited photographs.",
    eyeSlug: "flying-dress-photoshoot",
    name: "Sand Dunes",
    title: "Sand Dunes",
    eyebrow: "45 minutes from Cairo",
    priceUsd: 179,
    priceConfidence: "confirm",
    durationNote: "About an hour and a half out in the dunes.",
    gettingThere:
      "Approximately 45 minutes from central Cairo, towards New Cairo.",
    gettingThereConfidence: "confirm",
    intro:
      "Open dune country close enough to Cairo to shoot at first light and be back for breakfast. No skyline, no other people, nothing in the frame that dates the photograph, just sand, wind and whichever colour you chose.",
    whyThis: [
      "The closest of the three to central Cairo, so it costs you a morning rather than a day.",
      "Low sun across open dunes is the light this product was invented for.",
      "Nothing in shot but landscape, which is what makes a bold colour read.",
    ],
    visualDirection:
      "Expansive dunes, low-angle golden light, a saturated dress against neutral sand, and a lot of deliberate empty space.",
    image: null,
    imageAlt:
      "A flowing dress lifted by the wind across open sand dunes outside Cairo in low golden light",
    imageIsPlaceholder: true,
    tone: "dunes",
    faqs: [
      {
        question: "How far out of Cairo is it?",
        answer:
          "The brochure puts it at about forty-five minutes from central Cairo, heading towards New Cairo. Transport is door to door and included, so the drive is ours to manage rather than yours.",
      },
      {
        question: "What time of day do you shoot?",
        answer:
          "Early, for the low sun. The exact start depends on the time of year and we confirm it with you when we confirm the date.",
      },
    ],
    confirm: [
      "Current price: brochure says $179 per person.",
      "The exact shooting area, and whether it is a fixed site or chosen on the day.",
      "The start times actually offered, by season.",
    ],
  },
  {
    slug: "pyramids-rooftop",
    metaDescription:
      "A flying dress photoshoot on a Giza rooftop at seven, before the site opens. $199 per person, including the dress, transport and 100+ edited photographs.",
    eyeSlug: "pyramids-rooftop-flying-dress-photoshoot",
    name: "Pyramids Rooftop",
    title: "The Pyramids Rooftop",
    eyebrow: "An hour before the gates open",
    priceUsd: 199,
    priceConfidence: "verified",
    durationNote: "About forty-five minutes on the roof.",
    gettingThere:
      "A private rooftop with views of the Pyramids of Giza. Door-to-door transport included; no entry ticket to the archaeological site is needed.",
    gettingThereConfidence: "verified",
    intro:
      "The Giza site does not open until eight. From a rooftop there is no gate, so at seven the pyramids are catching the first low sun, the plateau below is still empty, and the only person in your photographs is you.",
    whyThis: [
      "The one hour of the day no photoshoot inside the Giza complex can offer.",
      "No entry ticket and no queue. The shoot is on a private roof, not inside the site.",
      "The pyramids across a skyline, which is a different photograph from standing underneath them.",
    ],
    visualDirection:
      "Monumental pyramids held at a distance, an elevated and composed frame, sunrise tones, dramatic flowing fabric against stone and sky.",
    image: null,
    imageAlt:
      "A flowing dress on a Giza rooftop at first light with the Pyramids of Giza across the skyline",
    imageIsPlaceholder: true,
    tone: "rooftop",
    faqs: [
      {
        question: "Do I need a ticket for the pyramids?",
        answer:
          "No. The shoot is on a private rooftop rather than inside the archaeological site, so there is no entry ticket and no queue.",
      },
      {
        question: "Why so early?",
        answer:
          "Because the site below does not open until 8am, which makes the first hour of the day one that no shoot inside the complex can sell. Between October and February the sun has only been up a few minutes when you start.",
      },
      {
        question: "Can we shoot at sunset instead?",
        answer:
          "Afternoon sessions run, but the roof closes before the earliest sunset of the year, so sunset itself is not something to promise. Ask us for your date and we will tell you what is actually possible.",
      },
    ],
    timeline: [
      {
        when: "Before first light",
        what: "A car collects you from your hotel. Door-to-door is in the price, so there is nothing to arrange and nothing to find in the dark.",
      },
      {
        when: "About an hour before the gates open",
        what: "You arrive on a private roof rather than at the archaeological site, so there is no ticket queue to stand in and no opening time to wait for. The dress is already there, in the colour you chose.",
      },
      {
        when: "The first hour of light",
        what: "The pyramids are catching the low sun and the plateau below is still closed, which is why this hour exists as a product at all. Nobody shooting inside the complex can be there yet.",
      },
      {
        when: "Thirty to forty-five minutes",
        what: "The shoot itself. You are directed the whole way through, so you do not need to know how to pose. An assistant stays out of frame and moves the dress, because a flying dress is not the wind doing it; it is a person throwing several kilos of fabric, over and over, until one throw is the photograph.",
      },
      {
        when: "Six to ten days later",
        what: "More than a hundred colour-graded photographs arrive. Not a handful of favourites, and not proofs you then pay to unlock.",
      },
    ],
    confirm: [
      "Current price: brochure and the live sister-brand page both say $199 per person.",
      "The booking window and last session time for this roof, as they stand now.",
    ],
  },
  {
    slug: "fayoum",
    metaDescription:
      "A flying dress photoshoot on the pale dunes and still lakes of Fayoum. $349 per person, including the dress, door-to-door transport and 100+ photographs.",
    eyeSlug: "fayoum-flying-dress-photoshoot",
    name: "Fayoum",
    title: "Fayoum: the Lakes and the White Dunes",
    eyebrow: "Three hours from Cairo",
    priceUsd: 349,
    priceConfidence: "confirm",
    durationNote: "Four to six hours, including the driving between the locations.",
    gettingThere:
      "Approximately three hours from central Cairo. White sand dunes, waterfalls and lakes.",
    gettingThereConfidence: "confirm",
    intro:
      "The furthest of the three and the strangest-looking. Pale dunes running down to still water, with a horizon that does not look like anywhere else in Egypt. A full day rather than a morning, and the photographs are the reason people take it.",
    whyThis: [
      "A landscape with water in it, which neither of the other two has.",
      "Pale sand instead of gold, so dark and jewel colours read completely differently here.",
      "The widest panoramas of the three.",
    ],
    visualDirection:
      "Surreal pale formations, luminous sand, water where the real portfolio supports it, strong silhouettes and wide desert panoramas.",
    image: null,
    imageAlt:
      "A flowing dress against pale dunes and still lake water in Fayoum",
    imageIsPlaceholder: true,
    tone: "fayoum",
    faqs: [
      {
        question: "How long does the day take?",
        answer:
          "The brochure puts Fayoum at about three hours from central Cairo each way, so this one is a day rather than a morning. The photoshoot itself is the same 30 to 45 minutes.",
      },
      {
        question: "Why is it more than the other two?",
        answer:
          "Distance. It is the same shoot and the same inclusions, with six hours of driving around it.",
      },
    ],
    priceStory: {
      heading: "Why this one is the most expensive",
      body: [
        "It is the same photoshoot. The same dress, the same assistant, the same 30 to 45 minutes in front of the camera, the same hundred-plus colour-graded photographs afterwards. Nothing about the session is larger.",
        "What is larger is the day around it. Fayoum is about three hours from central Cairo, so there is roughly six hours of driving wrapped around the shoot, and the car and the driver are yours for all of it. The other two locations give you your afternoon back. This one does not.",
        "What you get for the day is a landscape neither of the others can offer: pale sand instead of gold, and water in the frame. Dark and jewel colours read completely differently against it, and the panoramas are the widest of the three.",
      ],
    },
    confirm: [
      "Current price: brochure says $349 per person.",
      "THE NAME. The brochure calls this \"White Desert / Fayoum\" and then describes Fayoum: three hours from Cairo, white dunes, waterfalls, lakes. Egypt's White Desert is at Farafra, far beyond Fayoum and a different trip entirely. This page says Fayoum, because the brochure's own description is Fayoum. If the product really does run to the White Desert, the distance, the duration and the price all need revisiting.",
      "Whether the exact sites are Wadi El Rayan and the Magic Lake, as the sister brand's page states.",
    ],
  },
  // ---------------------------------------------------------------------------
  // THE FOURTH EXPERIENCE, WHICH WAS NOT ON THE SITE AT ALL.
  //
  // Confirmed by the October 2026 operating brief, which lists it alongside the
  // other three in its own comparison table. The brand was selling it and the
  // website did not mention it existed.
  //
  // IT SHIPS WITHOUT A PRICE, on purpose. The brief confirms the location, the
  // format and the six-hour duration, and says in terms that "the precise
  // inclusions, including transportation, yacht arrangements, and other
  // amenities, should be confirmed against the relevant package". So the page
  // says what is known and asks, rather than inventing a figure to fill the
  // slot where the other three have one.
  //
  // `eyeSlug` is empty because there is no Egypt Eye counterpart to take a
  // deposit against. The Book button does not render and the page offers an
  // enquiry, which is the right answer for a product with no confirmed price.
  // ---------------------------------------------------------------------------
  {
    slug: "red-sea-yacht",
    metaDescription:
      "A flying dress photoshoot on a yacht off Ain Sokhna, an hour and a half from Cairo on the Red Sea. $399 per person, about six hours including the drive.",
    eyeSlug: "",
    name: "Red Sea Yacht",
    title: "The Red Sea Yacht Experience",
    eyebrow: "Ain Sokhna, on the Red Sea",
    priceUsd: 399,
    priceConfidence: "confirm",
    durationNote: "About six hours for the whole experience, including the drive.",
    gettingThere:
      "Ain Sokhna, approximately an hour and a half from Cairo depending on where you set off from and the traffic.",
    gettingThereConfidence: "confirm",
    intro:
      "The only one of the four that happens on water. A yacht off Ain Sokhna on the Red Sea, photographed across a day rather than a session, with the sea where the other three have sand or stone.",
    whyThis: [
      "A marine setting, which none of the other three can offer.",
      "A day out rather than a shoot: the experience is the boat as much as the photographs.",
      "The furthest from the desert palette, so colour behaves completely differently.",
    ],
    visualDirection:
      "Open water, a high horizon, and fabric against blue rather than against sand. Light off the sea is harder and more directional than the dunes at dawn.",
    image: null,
    imageAlt:
      "A flying dress photographed on a yacht on the Red Sea at Ain Sokhna",
    imageIsPlaceholder: true,
    tone: "fayoum",
    faqs: [
      {
        question: "How long does the day take?",
        answer:
          "About six hours for the whole experience. Ain Sokhna is roughly an hour and a half from Cairo depending on your starting point and the traffic, so this is a day out rather than a morning.",
      },
      {
        question: "What does it cost?",
        answer:
          "$399 per person. Groups are discounted. Tell us how many of you there are and we will quote it, because the saving depends on the size of the party and the yacht arrangement for your date. Nothing is held until you have the figure in writing.",
      },
      {
        question: "Is transport included?",
        answer:
          "That is one of the things confirmed per booking rather than assumed. Tell us where you are staying and we will tell you what the day includes and what it costs.",
      },
    ],
    confirm: [
      "The group discount: at what party size it starts and what it is worth. The $399 per person is confirmed; the saving is not yet a published figure.",
      "Exactly what the package includes: transport to Ain Sokhna, the yacht arrangement, catering, and any other amenity.",
      "Whether the yacht is chartered per booking or a standing arrangement.",
      "The maximum group size on the boat.",
      "Whether the photoshoot portion has its own duration within the six hours.",
    ],
  },
];

/**
 * HOW A PACKAGE PRICE IS WRITTEN. ONE FUNCTION, EVERYWHERE.
 *
 * `priceUsd` became nullable when the Ain Sokhna yacht arrived with a
 * confirmed product and no confirmed price. Every page that rendered
 * `${pkg.priceUsd}` would have printed the string "$null" — not a crash, not
 * a build error, just a price-shaped lie on a page a customer is reading to
 * decide whether to spend money.
 *
 * There were eleven of those render sites. So there is one function, every
 * page calls it, and scripts/check-flying-dresses.mts fails if any page
 * interpolates the raw field again.
 */
export function packagePriceLabel(pkg: Pick<FlyingDressPackage, "priceUsd">): string {
  return pkg.priceUsd === null ? "Price on request" : `$${pkg.priceUsd}`;
}

/** The same answer for a sentence: "$179 per person" / "priced on request". */
export function packagePricePhrase(pkg: Pick<FlyingDressPackage, "priceUsd">): string {
  return pkg.priceUsd === null ? "priced on request" : `$${pkg.priceUsd} per person`;
}

export function packageBySlug(slug: string): FlyingDressPackage | undefined {
  return packages.find((p) => p.slug === slug);
}

// ---------------------------------------------------------------------------
// ADD-ONS AND EXTRAS
//
// `fromPrice: true` preserves the brochure's "starts at" qualification. A
// price that is a floor must never be displayed as if it were the price —
// that is how a customer arrives expecting $35 and is quoted $60.
//
// `priceUsd: null` means nobody has supplied a price. It renders as
// "price on request" with a real enquiry path, never as "$0" or "Free".
// ---------------------------------------------------------------------------

export type AddOn = {
  id: string;
  label: string;
  /** null = price on request. Never 0. */
  priceUsd: number | null;
  /** True where the brochure says "starts at". */
  fromPrice: boolean;
  detail: string;
  /**
   * THE SAME FACT WITH NO FIGURE IN IT, for the home page.
   *
   * `detail` is the pricing page's wording and three of these have a number
   * written into the sentence — "Starts at $35", "Price on request". The home
   * page renders this column, so those numbers were appearing on a page the
   * owner had asked to be free of prices, and no check caught them: the
   * figures are in THIS file, while the guard was reading the page's source.
   *
   * Two fields rather than one stripping routine, because stripping is a
   * guess about where a sentence ends. These are written, and they say the
   * same thing: what the extra is and who it suits, which is what the home
   * page's column is for. The prices are one click away on /packages.
   */
  homeNote: string;
  confidence: Confidence;
};

export const addOns: AddOn[] = [
  {
    id: "light-makeup",
    label: "Light makeup",
    priceUsd: 35,
    fromPrice: true,
    detail: "Starts at $35. The final price depends on what you want, so it is confirmed with you rather than charged up front.",
    homeNote: "Done before the shoot, to whatever level you want. Confirmed with you rather than charged up front.",
    confidence: "confirm",
  },
  {
    id: "full-makeup",
    label: "Full makeup",
    priceUsd: 45,
    fromPrice: false,
    detail: "A full application before the shoot.",
    homeNote: "A full application before the shoot.",
    confidence: "confirm",
  },
  {
    id: "hairdresser",
    label: "Hairdresser",
    priceUsd: 45,
    fromPrice: true,
    detail: "Starts at $45. Worth considering for the dunes and Fayoum, where there is real wind.",
    homeNote: "Worth considering for the dunes and Fayoum, where there is real wind.",
    confidence: "confirm",
  },
  {
    id: "two-reels",
    // ONE REEL IS NOW INCLUDED FREE with every experience (October 2026
    // brief), so this $25 item can no longer be described as "two Reels" with
    // no mention of that: a customer could pay for something they already had.
    // The price is unchanged; what it buys is stated relative to the free one.
    label: "Extra Reels",
    priceUsd: 25,
    fromPrice: false,
    detail: "A short vertical edit is already included with every experience. This adds two more, cut for Reels and TikTok.",
    homeNote: "A Reel comes with every experience. This adds two more.",
    confidence: "confirm",
  },
  {
    // The brief confirms the service and the fact that a dedicated video
    // specialist joins the team for it. It does not confirm a price, so there
    // is none here — `priceUsd: null` renders as "price on request".
    id: "professional-video",
    label: "Professional video production",
    priceUsd: null,
    fromPrice: false,
    detail: "A separate piece of work from the Reel included with your session: a video specialist joins the team for the day and the footage is produced properly. Price on request, because it is quoted per booking.",
    homeNote: "A video specialist joins the team. A different thing from the Reel that comes free.",
    confidence: "confirm",
  },
  {
    // "Customers requesting specific additional edits may select approximately
    // 7-10 preferred photographs. These specialized edits are charged
    // separately." Price not confirmed.
    id: "additional-editing",
    label: "Additional retouching",
    priceUsd: null,
    fromPrice: false,
    detail: "Basic editing is included on all hundred-plus images. If you want deeper work on a handful, choose roughly seven to ten frames. Price on request for those.",
    homeNote: "Deeper retouching on seven to ten frames of your choosing.",
    confidence: "confirm",
  },
  {
    // "An additional photography session at Nine Pyramids Lounge, within the
    // Giza pyramid area, can be added to an existing package. This is a
    // separate photography service and does not require a flying dress."
    //
    // NOTE FOR REVIEW: the brief places this "within the Giza pyramid area",
    // while an earlier instruction said the Nine Pyramids rooftop "offers
    // pyramid views; it is not inside the archaeological complex". Those may
    // be two different venues with similar names, or the same one described
    // two ways. This copy deliberately says neither — see
    // docs/FLYING-DRESSES-BRIEF-CONFLICTS.md.
    id: "nine-pyramids-lounge",
    label: "A session at Nine Pyramids Lounge",
    priceUsd: null,
    fromPrice: false,
    detail: "A second, separate photography session at Nine Pyramids Lounge, added to an existing booking. No flying dress involved: it is ordinary portrait work in a different setting. Availability confirmed per date, price on request.",
    homeNote: "A second session in a different setting. No flying dress; ordinary portraits.",
    confidence: "confirm",
  },
  {
    id: "additional-dress",
    label: "An additional dress",
    priceUsd: 99,
    fromPrice: false,
    detail: "A second look in the same session: a second colour, and the frames to go with it.",
    homeNote: "A second look in the same session: a second colour, and the frames to go with it.",
    confidence: "confirm",
  },
  {
    id: "own-custom-dress",
    label: "Own or customise a special dress",
    priceUsd: 249,
    fromPrice: false,
    detail: "Keep it. A dress made or customised for you rather than rented for the session.",
    homeNote: "Keep it. A dress made or customised for you rather than rented for the session.",
    confidence: "confirm",
  },
  {
    id: "accessories",
    label: "Accessories",
    priceUsd: null,
    fromPrice: false,
    detail: "Available alongside any shoot. The brochure confirms accessories exist without listing them or pricing them, so ask and we will tell you what is in the collection.",
    homeNote: "Available alongside any shoot. Ask and we will tell you what is in the collection.",
    confidence: "missing",
  },
  {
    id: "mens-attire",
    label: "Traditional attire for men",
    priceUsd: null,
    fromPrice: false,
    detail: "Five styles of gawn, for a partner in the frame. Price on request.",
    homeNote: "Five styles of gawn, for a partner in the frame.",
    confidence: "missing",
  },
];

// ---------------------------------------------------------------------------
// THE RENTAL SERVICES — the three new products
//
// Dress rental without a photoshoot, accessories, and men's attire.
//
// RentalService HAS NO PRICE FIELD. Not "price optional" — no field at all,
// exactly as lib/booking/outfits.ts omits it from Outfit, and for the same
// reason: the owner has confirmed no prices for any of these, so there must be
// nowhere in the data for an invented figure to live. Not a promise not to
// invent one — a structure in which one cannot be written.
// scripts/check-flying-dresses.mts asserts it.
//
// When prices arrive they belong in `addOns` above, which is already the
// priced shape, or in a new `priceUsd` field added deliberately with the
// owner's figures in hand.
// ---------------------------------------------------------------------------

/** How the customer gets the garment. Both confirmed by the owner. */
export type RentalDelivery = "hotel-delivery" | "collection";

export const RENTAL_DELIVERY_LABELS: Record<RentalDelivery, string> = {
  "hotel-delivery": "Delivered to your hotel",
  collection: "Collected from us in Cairo",
};

export type RentalService = {
  slug: string;
  name: string;
  title: string;
  eyebrow: string;
  /** One sentence, for cards and metadata. */
  summary: string;
  /** Editorial lead. */
  intro: string;
  /** What the customer actually receives. Only what is known. */
  youGet: string[];
  /** Explicitly what this is NOT, because rental-only is easy to misread. */
  notIncluded: string[];
  howItWorks: { title: string; detail: string }[];
  delivery: RentalDelivery[];
  /**
   * The rental window, if one is set. `null` because the owner has not stated
   * one — the research precedent in Cappadocia is a three-hour window, but
   * that is another company in another country and is not borrowed here.
   */
  durationNote: string | null;
  /** The wardrobe this service draws on. Empty renders as absent. */
  outfits: Outfit[];
  faqs: { question: string; answer: string }[];
  confirm: string[];
};

export const rentalServices: RentalService[] = [
  // -------------------------------------------------------------------------
  {
    slug: "dress-rental",
    name: "Rent a dress",
    title: "Rent a Dress, Without the Photoshoot",
    eyebrow: "Dress only",
    summary:
      "Rent one flying dress from the collection of twelve and shoot it yourself. Delivered to your hotel in Cairo, or collected from us.",
    intro:
      "Not everyone needs a photographer. If you are travelling with someone who shoots, or you simply want the dress for your own camera and your own morning, this is the dress on its own: the same twelve garments from the same collection, without the session built around them.",
    youGet: [
      "One flying dress from the collection of twelve, in the colour you choose.",
      "Delivery to your hotel in Cairo, or collection from us, whichever suits you.",
    ],
    notIncluded: [
      "No photographer. The photographs are yours to take.",
      "No assistant. Someone has to hold and throw the fabric, and on a rental that is your own companion. It is more work than it looks.",
      "No transport to a location, and no access arranged. A rooftop with a pyramid view is a private roof, not a public one.",
      "No edited gallery, since there is no shoot to edit.",
    ],
    howItWorks: [
      {
        title: "Tell us the colour and the dates",
        detail: "Which dress, when you want it, and whether you would rather it came to your hotel or you came to us.",
      },
      {
        title: "We reply with the price and the terms",
        detail:
          "The rental price, how long you have it for, and what happens if it comes back damaged: in writing, before you commit to anything. Nothing is charged on this website.",
      },
      {
        title: "You collect it, or we bring it",
        detail: "Delivery to a Cairo hotel, or collection from us. Agreed in the same reply.",
      },
      {
        title: "Shoot it, and bring it back",
        detail: "The dress comes back to us at the end of the window.",
      },
    ],
    delivery: ["hotel-delivery", "collection"],
    durationNote: null,
    outfits: dresses,
    faqs: [
      {
        question: "How much does it cost?",
        answer:
          "We have not published a rental price, because we would rather quote you one that is right for the dress, the dates and where you are staying than put a number here that turns out not to apply. Ask and you get it in writing before anything is agreed.",
      },
      {
        question: "How long do I have the dress for?",
        answer:
          "That is part of what we confirm when you ask, along with the price. It depends on the dress and on your dates.",
      },
      {
        question: "Can you deliver it to my hotel?",
        answer:
          "Yes, in Cairo. Tell us the hotel and your dates and we will confirm it. You can also collect from us if that is easier.",
      },
      {
        question: "Can I take it to the Pyramids rooftop myself?",
        answer:
          "Not with a rental. That roof is private and the access is part of the photoshoot package, not something a dress comes with. If the rooftop is what you want, the Pyramids Rooftop shoot is the way to it.",
      },
      {
        question: "Do you have a size for me?",
        answer:
          "Ask. We have not published sizes because we would rather check the actual garment against what you tell us than publish a range and have the dress not fit on the day.",
      },
      {
        question: "What if it gets damaged?",
        answer:
          "The terms, including anything held as a deposit, come with your quote in writing. They are not something to find out about afterwards.",
      },
    ],
    confirm: [
      "THE RENTAL PRICE. Nothing is published. Research found rental-only established in Cappadocia at roughly a fifth of a full shoot, and no Egyptian operator selling it at all. The price is a commercial decision, not a figure to copy.",
      "The rental window: how many hours or days one rental runs for.",
      "The security deposit or damage terms, and whether a card or cash hold is taken.",
      "Whether delivery is free, charged, or limited to certain areas of Cairo.",
      "Which of the twelve dresses are actually available to rent out unaccompanied. The whole collection is listed here, which assumes all twelve are.",
      "Dress sizes and fit range.",
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: "accessories",
    name: "Accessories",
    title: "Accessories",
    eyebrow: "With a shoot, or on their own",
    summary:
      "Accessories are available alongside any shoot or any dress rental. Ask us what is in the collection.",
    intro:
      "The brochure confirms accessories are available and does not list them, so rather than guess at a collection we have not seen, this page tells you the service is real and asks you to ask. It is the one page on this site that is deliberately short.",
    youGet: [
      "Accessories to wear with a photoshoot or a dress rental.",
    ],
    notIncluded: [],
    howItWorks: [
      {
        title: "Ask what is available",
        detail:
          "Tell us which dress or which shoot you are thinking about and we will tell you what we have that goes with it.",
      },
      {
        title: "We reply with the collection and the price",
        detail: "In writing, before anything is agreed.",
      },
    ],
    delivery: ["hotel-delivery", "collection"],
    durationNote: null,
    // DELIBERATELY EMPTY. Nothing in the brochure, on any reachable page, or
    // anywhere in this repository names a single accessory. Listing "veil,
    // crown, parasol" would put three products on a page that the business may
    // not own. The structure is live and waiting: add entries and the grid
    // appears by itself, exactly as the men's outfits section did.
    outfits: [],
    faqs: [
      {
        question: "What accessories do you have?",
        answer:
          "Ask us. We would rather tell you what is actually in the collection this week than publish a list here and have you arrive expecting something we have lent out.",
      },
      {
        question: "Can I rent accessories without a dress?",
        answer:
          "Ask and we will tell you honestly what is possible. Accessories are designed to go with the dresses, so most requests come with one.",
      },
      {
        question: "What do they cost?",
        answer:
          "Price on request. Nothing about accessory pricing is published, and we are not going to guess at it here.",
      },
    ],
    confirm: [
      "THE ACCESSORY LIST. This page cannot show a collection until someone names what is in it. Photographs and names are all that is needed. The grid is already built.",
      "Accessory prices, or whether they are included with certain packages.",
      "Whether accessories can be rented without a dress at all.",
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: "mens-wear",
    name: "Men's wear",
    title: "Traditional Attire for Men",
    eyebrow: "Five styles",
    summary:
      "Five styles of traditional Egyptian gawn, for a partner in the frame or to rent on its own.",
    intro:
      "A flying-dress photograph with two people in it is a different picture from one with one. Five styles of traditional gawn, in the Saeedy and Bahary traditions of Upper Egypt and the Delta, plus a classic plain cut, worn in a shoot, or rented on their own the same way a dress is.",
    youGet: [
      "One gawn from the five styles, for a photoshoot or as a rental.",
      "Delivery to your hotel in Cairo, or collection from us.",
    ],
    notIncluded: [
      "Photographs, unless you are booking a photoshoot as well.",
    ],
    howItWorks: [
      {
        title: "Choose a style",
        detail:
          "Five are listed. We have not photographed them for this site yet, so if the look matters more than the name, say so and we will send you pictures of the actual garments.",
      },
      {
        title: "We reply with the price and the fit",
        detail: "Including sizes, in writing, before anything is agreed.",
      },
      {
        title: "Wear it in your shoot, or rent it on its own",
        detail: "Either works. Rented alone it follows the same delivery and return as a dress.",
      },
    ],
    delivery: ["hotel-delivery", "collection"],
    durationNote: null,
    outfits: mensOutfits,
    faqs: [
      {
        question: "What is the difference between Saeedy and Bahary?",
        answer:
          "They are the two regional dress traditions the names come from: Saeedy from Upper Egypt, Bahary from the north and the Delta. What distinguishes our particular garments within each pair is something we would rather show you than describe: ask and we will send photographs.",
      },
      {
        question: "Can my partner wear one during my flying-dress shoot?",
        answer:
          "Yes, and it is one of the more common requests. Tell us when you enquire so the garment is there on the day.",
      },
      {
        question: "What does it cost?",
        answer:
          "Price on request. Nothing about men's attire pricing is published and we are not going to invent a figure here.",
      },
      {
        question: "Are there photographs of the five styles?",
        answer:
          "Not on this page yet, which is why it names them rather than showing them. Ask and we will send you pictures of the actual garments.",
      },
    ],
    confirm: [
      "PHOTOGRAPHS of all five gawns. This is the single highest-value asset gap on the site: five named garments with no pictures.",
      "What distinguishes Saeedy Gawn 1 from Saeedy Gawn 2, and Bahary Gawn 3 from Bahary Gawn 4. The brochure numbers them and does not say.",
      "Prices: both as a photoshoot add-on and as a standalone rental.",
      "Sizes available.",
      "Whether the brochure's numbering (1 to 5) is how the owner refers to them, or an artefact of the list.",
    ],
  },
];

export function rentalServiceBySlug(slug: string): RentalService | undefined {
  return rentalServices.find((s) => s.slug === slug);
}

// ---------------------------------------------------------------------------
// PAYMENT AND CANCELLATION
//
// The brochure's payment methods are reproduced. The cancellation terms are
// NOT: the brochure's 15-day and 7-day provisions overlap in a way that
// cannot be resolved without the owner, and publishing one reading of
// contradictory terms as settled policy is how a business ends up bound to
// something it did not mean.
//
// So `cancellation.published` is false and the page says the terms are
// confirmed in writing when a date is held. That is true, useful, and commits
// the business to nothing it has not agreed.
// ---------------------------------------------------------------------------

export const payment = {
  methods: [
    { label: "Visa and MasterCard", detail: "On the day of the shoot, on request." },
    { label: "PayPal", detail: null },
    { label: "Bank transfer", detail: null },
  ],
  confidence: "confirm" as Confidence,
  /**
   * No card details are ever collected by this website. There is no checkout
   * here and there will not be one until someone implements it deliberately.
   */
  note: "No payment is taken on this website. Nothing on these pages charges a card, and we will never ask you to type card details into a form here.",
} as const;

export const cancellation = {
  /**
   * False on purpose. See the block comment above.
   */
  published: false,
  summary:
    "Deposits are non-refundable, and can usually be moved to another date or held as credit rather than lost. The exact notice periods and charges are confirmed in writing when we hold your date.",
  /**
   * The contradiction, recorded verbatim-in-substance so the next person does
   * not have to rediscover it.
   */
  ambiguity:
    "The brochure sets out both a 15-day and a 7-day provision for amendments and cancellations, and they overlap rather than nest. It is not determinable from the brochure alone which applies to a cancellation made, say, 10 days out, nor how the charge differs for payments made after the deposit. This needs the owner's answer before any cancellation policy is published.",
} as const;

// ---------------------------------------------------------------------------
// THE ENQUIRY MESSAGE
//
// What a visitor's choices turn into. Used by the WhatsApp buttons and by the
// enquiry form's WhatsApp fallback, so there is one encoder and one shape of
// message rather than a different one per button.
//
// It asks for availability confirmation explicitly, and says nothing that
// could be read as a booking. A WhatsApp click is a message, never a
// reservation — see also the note in lib/booking/outfits.ts about why a dress
// choice is a preference rather than a hold.
// ---------------------------------------------------------------------------

export type EnquiryDraft = {
  /** What they were looking at: a package, a rental service, or nothing. */
  subject?: string;
  name?: string;
  location?: string;
  date?: string;
  people?: string;
  dress?: string;
  mensOutfit?: string;
  extras?: string[];
  hotel?: string;
  delivery?: string;
  notes?: string;
};

export function flyingDressEnquiry(draft: EnquiryDraft = {}): string {
  const lines: string[] = [];
  lines.push(
    draft.subject
      ? `Hello Flying Dresses Egypt. I would like to ask about ${draft.subject}.`
      : "Hello Flying Dresses Egypt. I would like to ask about a flying-dress photoshoot."
  );
  lines.push("");

  const row = (label: string, value?: string) => {
    const v = value?.trim();
    if (v) lines.push(`${label}: ${v}`);
  };

  row("Name", draft.name);
  row("Location", draft.location);
  row("Preferred date", draft.date);
  row("People", draft.people);
  row("Dress", draft.dress);
  row("Men's attire", draft.mensOutfit);
  if (draft.extras?.length) row("Extras", draft.extras.join(", "));
  row("Hotel / pickup area", draft.hotel);
  row("Delivery", draft.delivery);
  row("Notes", draft.notes);

  lines.push("");
  lines.push("Could you confirm availability and the price for these dates?");
  return lines.join("\n");
}

/**
 * The same draft, addressed to the inbox instead of the phone.
 *
 * WHY A `mailto:` RATHER THAN A SECOND LINK TO THE FORM. The form is better
 * for us — it is structured, it is captured, and it cannot be lost in a spam
 * folder. It is not better for everyone: a visitor who would rather write in
 * their own words, keep a copy in their sent items, or forward the thread to
 * the person they are planning this with has nowhere to do that, and the only
 * address on the site is in the footer. This gives the same prefilled message
 * WhatsApp gets, to the published address, from wherever they happen to be
 * standing on the page.
 *
 * It does NOT replace the form anywhere. Every page that had a form link
 * still has it; this sits beside it.
 */
export function mailtoHref(draft: EnquiryDraft = {}): string {
  const subject = draft.subject
    ? `Enquiry: ${draft.subject}`
    : "Flying Dresses Egypt enquiry";
  return (
    `mailto:${contact.email}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(flyingDressEnquiry(draft))}`
  );
}

// ---------------------------------------------------------------------------
// NAVIGATION
//
// Six items. A single-product brand with a thirteen-item menu buries the
// product; the sister brand's nav is thirteen items because it sells tours,
// cruises, transfers, a boutique and a journal.
// ---------------------------------------------------------------------------

/**
 * SIX ITEMS, AND THAT IS A CEILING RATHER THAN A COINCIDENCE.
 *
 * The header is a wordmark, these links and a button, and measured across the
 * rendered page that content needs about 1440px before it stops running off
 * the side of the screen. Every item added here lowers the width at which the
 * desktop nav can appear at all.
 *
 * So the catalogue was added by RESTRUCTURING rather than appending: Packages
 * and Questions moved to the footer, which already linked both, and the two
 * new sections took their places. "Experiences" became "Photoshoots" because
 * it now has to mean one specific thing beside Celebrations and Creative.
 */
export const nav: { label: string; href: string }[] = [
  { label: "Photoshoots", href: `${FLYING_DRESSES_PATH}/experiences` },
  { label: "Celebrations", href: `${FLYING_DRESSES_PATH}/celebrations` },
  { label: "Creative", href: `${FLYING_DRESSES_PATH}/creative` },
  { label: "The Wardrobe", href: `${FLYING_DRESSES_PATH}/wardrobe` },
  { label: "Rent & Hire", href: `${FLYING_DRESSES_PATH}/rentals` },
  { label: "About", href: `${FLYING_DRESSES_PATH}/about` },
];

/**
 * SIX ITEMS IS THE CEILING, AND IT WAS MEASURED RATHER THAN GUESSED.
 *
 * `.fd-nav` appears at 72rem (1152px), where the header has to fit the
 * wordmark, these labels and the enquire button on one line. A seventh label
 * was added for the stories section and then taken out again, because
 * Chromium at the breakpoint reported this:
 *
 *            wordmark width     6 items    7 items
 *            1152px (nav on)      81px       0px   <- the logo disappears
 *            1200px              122px      30px
 *            1280px              135px      97px
 *            1440px              135px     135px
 *
 * The logo is the flex item that gives, so a seventh label does not overflow
 * the bar: it silently eats the owner's logo between 1152px and about 1400px.
 * That is the fault the owner reported as a narrow menu bar, returning by a
 * different route, and it is invisible on a 1440px laptop and on a phone.
 *
 * So the stories section is reached from the footer and from the home page
 * instead. If a seventh item is ever genuinely needed, the fix is the header
 * layout, not one more entry: check-flying-dresses.mts fails past six.
 */
export const NAV_MAX_ITEMS = 6;
