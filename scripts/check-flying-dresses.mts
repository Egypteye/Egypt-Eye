/**
 * Guards Flying Dresses Egypt — a second brand, on its own domain, in this
 * same app, whose failure modes are all silent.
 *
 * WHAT THIS FILE IS ACTUALLY FOR
 *
 * Almost nothing here is a crash. A rental service that quietly grows a price
 * field, a dress photograph pointing at a path that no longer exists, a men's
 * gawn that acquires a colour swatch, a booking button aimed at a renamed
 * Sanity document — every one of those renders a perfectly healthy-looking
 * page and is wrong. Several of them are wrong about money or about what the
 * business owns, which is the kind of wrong that costs a customer.
 *
 * EVERY ASSERTION BELOW WAS PROVEN BY BREAKING THE THING IT GUARDS AND
 * WATCHING IT GO RED, then restoring it. That is not ceremony — CLAUDE.md §4
 * records three separate guards in this project that passed on the broken
 * version. The notes under each section say what was broken to prove it.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import {
  NAV_MAX_ITEMS,
  addOns,
  brand,
  packageIncludes,
  packagePriceLabel,
  cancellation,
  contact,
  dresses,
  flyingDressEnquiry,
  mensOutfits,
  nav,
  packages,
  rentalServices,
  urgentCall,
  wardrobe,
} from "../src/content/flyingDresses.js";
import { canCompleteBookingHere } from "../src/lib/booking/paypalConfig.js";
import {
  LOOKBOOK_NOTE,
  NAMING_NOTE,
  accessoryCategories,
  accessoryItems,
} from "../src/content/flyingDressAccessories.js";
import {
  FLYING_DRESS_COLLECTION,
  MENS_OUTFITS,
} from "../src/content/outfitCollection.js";
import { isFlyingDressesHost } from "../src/lib/brand/flyingDressesHost.js";
import { photoshoots } from "../src/content/photoshoots.js";
import { allSlots, location } from "../src/app/flying-dresses/_lib/assets.js";
import { dressPhotos } from "../src/app/flying-dresses/_lib/dressPhotos.js";
import { marqueeColours, marqueePlaces } from "../src/app/flying-dresses/_lib/marquee.js";
import { flyingDressGalleryById } from "../src/content/flyingDressGalleries.js";
import {
  ROOFTOP_LOCATION_NOTE,
  VENUE_DEPENDENCY,
  experienceCategories,
  flyingDressExperiences,
} from "../src/content/flyingDressExperiences.js";
import {
  EGYPT_EYE_FLYING_DRESS_STORIES,
  flyingDressStories,
  liveStories,
  storyPlainText,
  relatedStories,
  storyClusters,
  storyLinkTargets,
  storyWordCount,
} from "../src/content/flyingDressStories.js";
import { isFlyingDressRoute } from "../src/content/flyingDressRoutes.js";
import {
  revealDecorations,
  revealPayment,
  revealThemeById,
  revealThemes,
} from "../src/content/flyingDressGenderReveal.js";
import {
  proposalDecorations,
  proposalPayment,
  proposalVenue,
} from "../src/content/flyingDressProposal.js";
// The PURE merge module, deliberately — content.ts reaches the Sanity client,
// which reaches env.ts, which throws here. CLAUDE.md §6.
import {
  mergeAddOns,
  mergePackages,
  mergeRentals,
  mergeSettings,
  mergeWardrobe,
  type FdSettingsDoc,
} from "../src/app/flying-dresses/_lib/contentMerge.js";
import { hardenFlyingDressGallery } from "../src/lib/sanityShape.js";
import type { FlyingDressGallery } from "../src/content/types.js";

const errors: string[] = [];
/** Signature matches the other check scripts: label first, condition second. */
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const read = (path: string) => readFileSync(path, "utf8");

// ---------------------------------------------------------------------------
// 1. A RENTAL SERVICE CANNOT CARRY A PRICE
//
// The owner has confirmed no price for dress rental, accessories or men's
// wear, so `RentalService` has no price field AT ALL — not "price optional".
// There must be nowhere in the data for an invented figure to live.
//
// Asserted against the source text rather than the values, because a value
// check passes trivially on a type that has the field and happens to leave it
// undefined today. Proven by adding `priceUsd: number;` to the RentalService
// type: red. Removed: green.
// ---------------------------------------------------------------------------
const contentSource = read("src/content/flyingDresses.ts");

const rentalTypeStart = contentSource.indexOf("export type RentalService = {");
ok("content/flyingDresses.ts no longer declares a RentalService type", rentalTypeStart !== -1);
if (rentalTypeStart !== -1) {
  const rentalTypeBlock = contentSource.slice(
    rentalTypeStart,
    contentSource.indexOf("\n};", rentalTypeStart)
  );
  ok(
    "the RentalService type has grown a price field — rental, accessories and men's wear are quoted, " +
      "and a field for a price is a place for an invented one to live. Put real prices in `addOns` instead.",
    !/\bprice|\bamount|\bcost|\bfee|Usd\b/i.test(rentalTypeBlock)
  );
}

// And no rental service's own prose may quote a figure either, since all three
// are price-on-request. Proven by writing "from $40" into the dress-rental
// intro: red.
for (const service of rentalServices) {
  const prose = [
    service.title,
    service.summary,
    service.intro,
    ...service.youGet,
    ...service.notIncluded,
    ...service.howItWorks.map((s) => `${s.title} ${s.detail}`),
    ...service.faqs.map((f) => `${f.question} ${f.answer}`),
  ].join(" ");
  ok(
    `the "${service.slug}" hire service quotes a figure in its own copy, but it is sold price-on-request — ` +
      "a number here is one nobody has confirmed",
    !/[$£€]\s?\d/.test(prose)
  );
}

// ---------------------------------------------------------------------------
// 2. NOTHING UNCONFIRMED SHIPS AS SETTLED
//
// Each package and each hire service must record what still needs the owner's
// answer. An empty `confirm` list means somebody decided a brochure figure was
// independently verified without saying so.
//
// Proven by emptying the Fayoum package's `confirm` array: red.
// ---------------------------------------------------------------------------
for (const pkg of packages) {
  ok(`package "${pkg.slug}" has an empty confirm list`, pkg.confirm.length > 0);
  ok(`package "${pkg.slug}" has no FAQs`, pkg.faqs.length > 0);
  ok(`package "${pkg.slug}" has no "why this one" reasons`, pkg.whyThis.length > 0);
  // NULL IS A LEGITIMATE PRICE STATE and means "on request" — the Red Sea
  // yacht is a confirmed product whose price the October 2026 brief
  // deliberately does not confirm. Zero is not: it renders as free.
  ok(
    `package "${pkg.slug}" has a price of ${pkg.priceUsd}, which is neither a positive whole number of dollars nor a deliberate "on request"`,
    pkg.priceUsd === null || (Number.isInteger(pkg.priceUsd) && pkg.priceUsd > 0)
  );
  ok(
    `package "${pkg.slug}" has no durationNote — the site would have nothing to print where it used to say "30 to 45 minutes"`,
    pkg.durationNote.trim().length > 0
  );
  ok(
    `package "${pkg.slug}" has no priceConfidence, so the page cannot tell a confirmed price from a brochure one`,
    pkg.priceConfidence === "verified" || pkg.priceConfidence === "confirm"
  );
}

for (const service of rentalServices) {
  ok(`hire service "${service.slug}" has an empty confirm list`, service.confirm.length > 0);
  ok(`hire service "${service.slug}" has no FAQs`, service.faqs.length > 0);
  ok(`hire service "${service.slug}" lists nothing under "what you get"`, service.youGet.length > 0);
  ok(
    `hire service "${service.slug}" offers no way to receive the garment`,
    service.delivery.length > 0
  );
}

// The cancellation contradiction must stay recorded for as long as it is
// unresolved. This is written so it keeps working AFTER the owner answers:
// publishing a policy is allowed, publishing nothing while also recording
// nothing is not.
//
// Proven by blanking `cancellation.ambiguity` while `published` is false: red.
ok(
  "no cancellation policy is published and no reason is recorded either — the brochure's 15-day and 7-day " +
    "provisions contradict each other, and that has to stay written down until the owner resolves it",
  cancellation.published || cancellation.ambiguity.trim().length > 0
);

// ---------------------------------------------------------------------------
// 3. PRICES THAT ARE FLOORS MUST SAY SO
//
// The brochure says "starts at $35" for light makeup and "starts at $45" for
// the hairdresser. A floor displayed as if it were the price is how a customer
// arrives expecting $35 and is quoted $60.
//
// Proven by flipping light makeup's `fromPrice` to false while leaving
// "Starts at $35" in its detail — and separately by removing the words from
// the detail while leaving the flag true. Both red.
// ---------------------------------------------------------------------------
for (const addOn of addOns) {
  ok(
    `add-on "${addOn.id}" has a price of 0 — nothing here is free, and a zero reads as "included"`,
    addOn.priceUsd !== 0
  );
  if (addOn.priceUsd !== null) {
    ok(
      `add-on "${addOn.id}" has a price of ${addOn.priceUsd}, which is not a whole number of dollars`,
      Number.isInteger(addOn.priceUsd) && addOn.priceUsd > 0
    );
  }
  if (addOn.fromPrice) {
    ok(
      `add-on "${addOn.id}" is a starting price but its detail never says so, so the page presents a floor as the price`,
      /\b(starts? at|from)\b/i.test(addOn.detail)
    );
  }
  if (addOn.priceUsd === null) {
    ok(
      `add-on "${addOn.id}" has no price and does not say it is on request`,
      /request|ask/i.test(addOn.detail)
    );
  }
}

// ---------------------------------------------------------------------------
// 4. INSTANT BOOKING POINTS AT A PRODUCT THAT EXISTS
//
// Each package's `eyeSlug` names the Egypt Eye photoshoot that IS that shoot.
// BookingRail loads it from Sanity and asks productRail() for the deposit. A
// slug renamed in the Studio turns the booking button into a 404 — and the
// button looks perfectly fine until somebody with a card clicks it.
//
// Checked against the repo's own photoshoot list, which is the fallback the
// fetcher uses and the only copy reachable offline.
//
// Proven by changing one eyeSlug to "flying-dress-photoshoots": red.
// ---------------------------------------------------------------------------
const photoshootSlugs = new Set(photoshoots.map((p) => p.slug));
for (const pkg of packages) {
  // AN EMPTY eyeSlug IS NOT A BROKEN ONE. The Red Sea yacht has no Egypt Eye
  // counterpart to take a deposit against, so BookingRail gets no product back
  // and the Book button does not render; the page offers an enquiry instead.
  //
  // THIS USED TO ASSERT `priceUsd === null`, AND THAT WAS THE WRONG TEST.
  // It stood in for "nothing here can offer a booking", on the assumption that
  // an unbookable product would never carry a price. The owner then priced the
  // yacht at $399 per person while it still has no Egypt Eye product, which is
  // a perfectly coherent state — this whole brand takes no payment on its own
  // site — and the guard failed a true thing.
  //
  // So it now checks the real failure instead: the rail looks the slug up, and
  // the only way an empty one produces a button is if a photoshoot with an
  // empty slug exists for it to match. That, not the price, is what would put
  // a Book button in front of a customer with nothing behind it.
  if (pkg.eyeSlug === "") {
    ok(
      `package "${pkg.slug}" has an empty eyeSlug and a photoshoot with an empty slug exists for it to match, ` +
        "so the rail would offer a Book button with nothing behind it",
      !photoshootSlugs.has("")
    );
    continue;
  }
  ok(
    `package "${pkg.slug}" books Egypt Eye product "${pkg.eyeSlug}", which is not a photoshoot in this repo — ` +
      "the deposit button would 404",
    photoshootSlugs.has(pkg.eyeSlug)
  );
}
ok(
  "two Flying Dresses packages point at the same Egypt Eye product, so one of them books the wrong shoot",
  new Set(packages.map((p) => p.eyeSlug)).size === packages.length
);

// THE TWO BRANDS MUST QUOTE ONE PRICE FOR ONE SHOOT.
//
// This brand's pages print the price from content/flyingDresses.ts while the
// booking rail prints it from Sanity via productRail(). If those two ever
// disagree, one page shows a customer two different prices for the same shoot
// — which is EXACTLY the live bug this build found on egypteyetravel.com's
// /photoshoots page, where the listing says $349 and the FAQ on the same page
// says $219 (recorded in docs/FLYING-DRESSES-OWNER-CONFIRMATIONS.md §5).
//
// Sanity is unreachable from a check script, so this asserts against the
// repo's own photoshoot fallback, which is the offline stand-in for it. Both
// in-repo copies were verified equal to the live Sanity values when written.
// If the owner changes a price in Studio, update BOTH and this stays true.
//
// Proven by setting the Fayoum package to 299: red.
for (const pkg of packages) {
  const eye = photoshoots.find((p) => p.slug === pkg.eyeSlug);
  if (!eye?.price) continue;
  ok(
    `Flying Dresses prices "${pkg.slug}" at $${pkg.priceUsd} while Egypt Eye prices the same shoot ` +
      `("${pkg.eyeSlug}") at $${eye.price.amount} — one shoot, two prices, and the booking rail reads the other one`,
    eye.price.amount === pkg.priceUsd
  );
}

// ---------------------------------------------------------------------------
// 5. ONE WARDROBE, NOT TWO COPIES OF IT
//
// Egypt Eye's photoshoots and this brand rent out the same physical garments.
// Both must read content/outfitCollection.ts, by identity — not by having
// equal-looking arrays, which is exactly the state that drifts.
//
// Proven by re-declaring `dresses` as its own literal array in
// flyingDresses.ts with identical contents: red, because identity differs.
// ---------------------------------------------------------------------------
// Asserted structurally rather than by reference identity.
//
// `dresses === FLYING_DRESS_COLLECTION` is true in the app and CANNOT be
// observed here: content/flyingDresses.ts imports "./outfitCollection" while
// a check script imports "../src/content/outfitCollection.js", and tsx treats
// those two specifiers as two modules — so the array is loaded twice and the
// references differ even though the app only ever sees one. An identity check
// here fails on correct code, which is worse than no check.
//
// So the real failure mode is guarded directly instead: a brand file that
// declares its OWN dress list rather than importing the shared one. That is
// the thing that drifts, and it is visible in the source.
//
// Proven by pasting the twelve-dress literal back into flyingDresses.ts in
// place of the re-export: red on both the import and the literal assertion.
for (const [file, source] of [
  ["content/flyingDresses.ts", contentSource],
  ["content/photoshoots.ts", read("src/content/photoshoots.ts")],
] as const) {
  ok(
    `${file} no longer imports the shared wardrobe from ./outfitCollection`,
    /from "\.\/outfitCollection"/.test(source)
  );
  ok(
    `${file} declares its own garment list again — two copies of one wardrobe drift until the sister sites ` +
      "disagree about a dress",
    !/name:\s*"(Cherry|Emerald|BronZey)"/.test(source)
  );
}

// And the two views of it still agree, item for item.
ok(
  "the dress list this brand exports no longer matches the shared collection",
  JSON.stringify(dresses) === JSON.stringify(FLYING_DRESS_COLLECTION)
);
ok(
  "the men's list this brand exports no longer matches the shared collection",
  JSON.stringify(mensOutfits) === JSON.stringify(MENS_OUTFITS)
);
ok("the shared collection no longer holds thirteen dresses", FLYING_DRESS_COLLECTION.length === 13);

// ---------------------------------------------------------------------------
// The copy counts the dresses, so the copy drifts when the wardrobe grows.
//
// Two stories are built around the size of the collection — one of them
// enumerates every dress by name — and the rental copy sells "the collection
// of N". Adding Hot Pink made six sentences false at once, in an article a
// customer reads to choose a colour. Nothing caught it; these do.
// ---------------------------------------------------------------------------
const COUNT_WORDS: Record<number, string> = {
  11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen", 16: "sixteen",
};
const expectedCountWord = COUNT_WORDS[FLYING_DRESS_COLLECTION.length];
// Comments are stripped first. A comment reading "there were eleven of those
// render sites" is not a claim about the wardrobe, and flagging it trains the
// next person to ignore this check.
const withoutComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");
// Every file that states the size of the collection to a customer.
//
// This list began as the two content files, and that was not enough: adding a
// thirteenth dress left "Twelve flying dresses and five traditional gawns"
// sitting above a grid of thirteen, the wardrobe page's meta description
// naming twelve by name, and six more on the brand's home page. None of them
// live in src/content. A count can be written anywhere the brand has prose,
// so this walks the whole Flying Dresses app rather than naming files.
const countedSources = [
  ["content/flyingDressStories.ts", withoutComments(read("src/content/flyingDressStories.ts"))],
  ["content/flyingDresses.ts", withoutComments(contentSource)],
  ["content/outfitCollection.ts", withoutComments(read("src/content/outfitCollection.ts"))],
  ["content/photoshoots.ts", withoutComments(read("src/content/photoshoots.ts"))],
  ...readdirSync("src/app/flying-dresses", { recursive: true, encoding: "utf8" })
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .map((f): [string, string] => [
      `app/flying-dresses/${f}`,
      withoutComments(read(`src/app/flying-dresses/${f}`)),
    ]),
] as const;

ok(
  `the wardrobe has grown past the count words this check knows (${FLYING_DRESS_COLLECTION.length} dresses)`,
  Boolean(expectedCountWord)
);
// One word other than the size is legitimate, and only in one construction:
// "somewhere to put the other twelve colours" is correct prose about thirteen
// dresses, because the writer is counting the ones you are NOT wearing.
//
// It is allowed ONLY directly after "other". A blanket exemption for
// size-minus-one would have gutted this check: a wardrobe that grows from
// twelve to thirteen leaves copy saying "twelve", which is precisely
// size-minus-one and precisely the drift being guarded against.
const otherWord = COUNT_WORDS[FLYING_DRESS_COLLECTION.length - 1];
for (const [file, raw] of countedSources) {
  const source = otherWord ? raw.replace(new RegExp(`\\bother ${otherWord}\\b`, "gi"), " ") : raw;
  for (const [, word] of Object.entries(COUNT_WORDS)) {
    if (word === expectedCountWord) continue;
    ok(
      `${file} still says "${word}" about a collection that now holds ${FLYING_DRESS_COLLECTION.length}`,
      // "standing in the sun at eleven" is a clock time, not a count of
      // dresses. A check that flags it is a check people learn to ignore.
      !new RegExp(
        `(?<!\\b(?:at|until|till|by|past|gone|before|after|around|since)\\s)\\b${word}\\b(?![- ]day)`,
        "i"
      ).test(source)
    );
  }
}
for (const dress of FLYING_DRESS_COLLECTION) {
  ok(
    `"${dress.name}" is missing from the story that lists the collection by name`,
    read("src/content/flyingDressStories.ts").includes(dress.name)
  );
}
ok(
  "the shared men's collection no longer holds five gawns, but the rooftop FAQ promises five styles",
  MENS_OUTFITS.length === 5
);

const ids = wardrobe.map((o) => o.id.toLowerCase());
ok(
  "two garments in the wardrobe share an id, and a booking matches on the id — one of them cannot be selected",
  new Set(ids).size === ids.length
);
for (const outfit of wardrobe) {
  ok(`a garment has no name (id "${outfit.id}")`, outfit.name.trim().length > 0);
}

// A gawn must never carry a colour swatch. There is no colour that "Bahary
// Gawn" means, so a hex would be inventing a product attribute — and the UI
// would render it as the garment.
//
// Proven by adding hex: "#cccccc" to Saeedy Gawn 1: red.
for (const outfit of MENS_OUTFITS) {
  ok(
    `men's outfit "${outfit.id}" has a colour swatch, but it is sold by regional cut rather than colour — ` +
      "a swatch here presents an invented attribute as the garment",
    outfit.hex === undefined
  );
}

// Every dress, by contrast, needs either a photograph or a swatch, or its tile
// renders as an empty box. Proven by deleting Cherry's hex: red.
for (const dress of FLYING_DRESS_COLLECTION) {
  ok(
    `dress "${dress.id}" has neither a photograph nor a colour, so its tile renders blank`,
    Boolean(dress.hex) || Boolean(dress.image)
  );
}

// ---------------------------------------------------------------------------
// 6. EVERY PHOTOGRAPH THE SITE CLAIMS TO HAVE, IT HAS
//
// A missing image file is a broken slot on a photography site, and next/image
// fails at request time rather than at build time — so nothing catches it
// before a visitor does.
//
// Proven by pointing one slot at /photos/about/does-not-exist.jpg: red.
// ---------------------------------------------------------------------------
/**
 * THE ONLY FILES THAT MAY BE CALLED THE AGENCY'S OWN WORK.
 *
 * This list is the point of the whole check. "agency" is a claim about
 * provenance, and on a photography site a false one is the worst thing the
 * code can say: it presents somebody else's picture as proof of what this
 * business delivers. Adding a line here is therefore a deliberate act with a
 * reason attached, never a convenience.
 *
 * The first two were already published on egypteyetravel.com as creator
 * collaborations. The rest came from the owner in October 2026, from their own
 * client shoots, through a Drive folder they shared for this purpose; the EXIF
 * on the originals reads "egypt-eye-travel / EGYPT.EYE". The shoot each frame
 * came from is recorded beside it in _lib/dressPhotos.ts and in the credit on
 * the slot itself, so any one of them can be traced back.
 */
const AGENCY_WORK = new Set([
  "/photos/about/briana-trip-flying-dress.jpg",
  "/photos/about/cherry-travel-flying-dress.jpg",
  "/photos/flying-dresses/rooftop-group.jpg",
  "/photos/flying-dresses/rooftop-gold.jpg",
  "/photos/flying-dresses/fayoum-dress.jpg",
  "/photos/flying-dresses/assistant.jpg",
  "/photos/flying-dresses/wardrobe-lineup.jpg",
  "/photos/flying-dresses/fayoum-black.jpg",

  // Supplied October 2026 by the owner, from the agency's own Google Drive
  // library (Photos/). Each one is a frame from a named client shoot in that
  // library, downloaded from it and installed here:
  //
  //   couple-romance-rooftop   Alessandra shoot rooftop, black tie and lace
  //   couple-vows-rooftop      Alessandra shoot rooftop, formal dress
  //   gender-reveal-rooftop    Kayan shoot      rooftop, balloon arch
  //   giza-plateau             Luis shoot       the plateau itself
  //
  // giza-plateau REPLACES a Pexels stock photograph of the same place. It
  // carries no flying dress and sits in a kind:"location" slot, whose whole
  // contract is that it shows WHERE YOU WILL BE STANDING rather than claiming
  // to be one of our dress shoots.
  //
  // A fifth frame from that library, giza-horseback, was installed here and
  // has been removed: see HORSE below.
  "/photos/flying-dresses/couple-romance-rooftop.jpg",
  "/photos/flying-dresses/couple-vows-rooftop.jpg",
  "/photos/flying-dresses/gender-reveal-rooftop.jpg",
  "/photos/flying-dresses/giza-plateau.jpg",
]);

for (const [key, slot] of Object.entries(allSlots)) {
  if (slot.kind === "empty") {
    ok(`image slot "${key}" is marked empty but carries a src`, slot.src === null);
    ok(
      `image slot "${key}" is empty and does not say what photograph belongs there, so the panel renders unlabelled`,
      Boolean(slot.wanted)
    );
    continue;
  }

  ok(`image slot "${key}" is not marked empty but has no src`, slot.src !== null);
  if (slot.src) {
    ok(
      `image slot "${key}" points at ${slot.src}, which is not a file in public/ — the slot renders broken`,
      existsSync(`public${slot.src}`)
    );
  }
  ok(
    `image slot "${key}" has no alt text`,
    slot.alt.trim().length > 0
  );
  ok(
    `image slot "${key}" has no intrinsic size, so its box is not reserved and the layout shifts as it loads`,
    slot.width > 0 && slot.height > 0
  );

  // The important one. "agency" means "this is the business's own client
  // work". Promoting a stock location photo to agency work by editing a page
  // is exactly what the brief forbids, and it is a one-word edit.
  //
  // Proven by changing the Giza plateau slot's kind to "agency": red.
  if (slot.kind === "agency") {
    ok(
      `image slot "${key}" claims to be the agency's own photography, but ${slot.src} is not on the list of ` +
        "frames whose provenance has been established. Add it to AGENCY_WORK with a reason, or leave the slot " +
        'as kind:"location" or kind:"empty".',
      slot.src !== null && AGENCY_WORK.has(slot.src)
    );
  }
}

// THE HEADER'S THREE BREAKPOINTS ARE ONE DECISION.
//
// .fd-nav appears at X. .fd-burger (which opens the drawer) disappears at X.
// .fd-drawer (what the burger opens) disappears at X. If the drawer's X is
// smaller than the burger's, every width in between shows a menu button whose
// panel is display:none — it sets aria-expanded="true" and nothing happens.
//
// That shipped. The nav moved from 64rem to 90rem and the burger moved with
// it; the drawer's rule was left at 64rem, so from 1024px to 1440px — 1280px
// included — the menu button was dead. Found by the owner, not by this file.
//
// Read out of the CSS with comments stripped, so the paragraph above cannot
// satisfy it. Proven by setting the drawer's rule back to 64rem: red.
{
  const css = stripComments(read("src/app/flying-dresses/brand.css"));
  const widthOf = (selector: string): string | null => {
    // The @media that opens onto this selector's rule. Escaped for the dot in
    // the class name, which would otherwise match any character.
    const escaped = selector.replace(/[.]/g, "\\$&");
    const re = new RegExp(
      "@media\\s*\\(min-width:\\s*([0-9.]+rem)\\s*\\)\\s*\\{\\s*" + escaped + "\\s*\\{",
      "m"
    );
    const m = css.match(re);
    return m ? m[1] : null;
  };
  const nav = widthOf(".fd-nav");
  const burger = widthOf(".fd-burger");
  const drawer = widthOf(".fd-drawer");
  ok(
    `the header's three breakpoints disagree — .fd-nav at ${nav}, .fd-burger at ${burger}, ` +
      `.fd-drawer at ${drawer}. Any width where the burger shows but the drawer is hidden ` +
      "is a menu button that does nothing when clicked.",
    nav !== null && nav === burger && burger === drawer
  );
}

// A PHOTOGRAPH THE SITE OWNS AND DOES NOT SHOW IS A PHOTOGRAPH IT DOES NOT HAVE.
//
// The home page's dress rail rendered `background: dress.hex` and the words
// "Photo coming soon" unconditionally. All twelve dresses had real photographs
// by then, already live on /wardrobe, so the home page was advertising colour
// swatches for a collection it had pictures of. Nothing was broken, nothing
// 404'd, and no existing check noticed, because the markup was valid and the
// files were present — just never referenced from this page.
//
// Matched on the page source with comments stripped, so this note cannot
// satisfy it. Proven by deleting the dressPhotos import and lookup: red.
{
  const page = stripComments(read("src/app/flying-dresses/page.tsx"));
  const photographed = Object.keys(dressPhotos).length;
  ok(
    `${photographed} dresses have photographs in dressPhotos, but the home page never reads ` +
      "that map — it is rendering colour swatches for pictures the site already owns.",
    photographed === 0 || /dressPhotos\[/.test(page)
  );
  ok(
    'the home page still says "Photo coming soon" unconditionally. It must say that only ' +
      "where there is genuinely no photograph.",
    !/Photo coming soon/.test(page) || /photo \?/.test(page) || /\bphoto\b[\s\S]{0,120}\?/.test(page)
  );
}

// COMMERCIAL LICENSING IS NOT A SHELF PRODUCT HERE.
//
// The owner's rule, October 2026: do not advertise commercial licensing as an
// established website offering; handle those enquiries individually. It had
// been listed in the creators page's `extras` as delivery:"in-house" — the
// same shape as "additional edited images" — which presents it as something
// we hand over on request rather than something negotiated per campaign.
//
// An FAQ may still ANSWER a commercial question, and should: someone planning
// a paid campaign deserves to know it is a different conversation. What this
// forbids is listing it as an extra alongside the ones we do supply.
//
// Proven by putting the extra back: red. Then removed again.
{
  const offered = flyingDressExperiences.flatMap((e) =>
    e.extras
      .filter((x) => /commercial licen[cs]e|licen[cs]ing/i.test(x.label))
      .map((x) => `${e.slug}: "${x.label}"`)
  );
  ok(
    `commercial licensing is listed as a bookable extra (${offered.join("; ")}). The owner's rule ` +
      "is that it is not an advertised offering: these enquiries are handled one at a time.",
    offered.length === 0
  );
}

// HORSE.
//
// Horseback riding at Giza is an Egypt Eye Travel product. It is not a Flying
// Dresses one. A horse photograph on this brand tells a visitor we sell
// something we do not, and one did: a rider in black on a decorated Arabian
// illustrated the home page's rooftop panel, installed from the owner's photo
// library in good faith and caught by the owner, not by this file.
//
// Checked over the registry's own src and alt values rather than over prose,
// so the paragraph you are reading cannot satisfy it. Proven by repointing a
// slot at giza-horseback.jpg: red on both halves. Then restored.
{
  const horsey = /horse|horseback|equestrian|stallion/i;
  for (const [key, slot] of Object.entries(allSlots)) {
    ok(
      `asset slot ${key} refers to a horse. Horseback riding is an Egypt Eye ` +
        "Travel product; this is the Flying Dresses brand.",
      !horsey.test(`${slot.src ?? ""} ${slot.alt ?? ""}`)
    );
  }
  const strays = readdirSync("public/photos/flying-dresses").filter((f) => horsey.test(f));
  ok(
    `public/photos/flying-dresses holds ${strays.length} horse photograph(s) (${strays.join(", ")}). ` +
      "Unreferenced, but still published at a guessable URL.",
    strays.length === 0
  );
}

ok(
  "neither of the two genuine flying-dress photographs is used anywhere any more",
  Object.values(allSlots).some((s) => s.kind === "agency")
);

// ---------------------------------------------------------------------------
// 7. NAVIGATION REACHES REAL PAGES
//
// A nav link to a route that does not exist is a 404 from the header, on every
// page. Resolved against the directory tree, which is where App Router routes
// actually come from.
//
// Proven by renaming the wardrobe nav href to /flying-dresses/wardrobes: red.
// ---------------------------------------------------------------------------
const routeExists = (href: string) => {
  const rest = href.replace(/^\/flying-dresses\/?/, "");
  if (rest === "") return existsSync("src/app/flying-dresses/page.tsx");
  return existsSync(`src/app/flying-dresses/${rest}/page.tsx`);
};

for (const item of nav) {
  ok(
    `the header links ${item.href} ("${item.label}"), which is not a page on this site`,
    item.href.startsWith("/flying-dresses") && routeExists(item.href)
  );
}

// The pages the footer and the CTAs reach that are not in the nav.
for (const href of ["/flying-dresses/enquire", "/flying-dresses/packages"]) {
  ok(`${href} is linked across the site but is not a page`, routeExists(href));
}

// Every package and service needs its detail route to exist, since the
// listing pages link to all of them.
ok(
  "the experience detail route is missing, so every location link 404s",
  existsSync("src/app/flying-dresses/experiences/[slug]/page.tsx")
);
ok(
  "the hire detail route is missing, so every rental link 404s",
  existsSync("src/app/flying-dresses/rentals/[slug]/page.tsx")
);
ok(
  "this brand has no 404 page of its own, so a bad URL shows Egypt Eye's",
  existsSync("src/app/flying-dresses/not-found.tsx")
);

// ---------------------------------------------------------------------------
// 8. THE TWO DOMAINS DO NOT COMPETE WITH EACH OTHER
//
// The pages are reachable on egypteyetravel.com for review. Indexed there they
// are duplicates of the real brand domain, and nothing visible breaks — the
// symptom is two sites splitting one set of rankings, months later.
//
// Proven by removing "/flying-dresses" from robots.ts's disallow list: red.
// And by removing the /flying-dresses case from proxy.ts's isLocaleExempt: red.
// ---------------------------------------------------------------------------
const robotsSource = read("src/app/robots.ts");
ok(
  "src/app/robots.ts no longer disallows /flying-dresses, so the second brand's pages can be indexed on the " +
    "travel domain as duplicates of its own",
  robotsSource.includes('"/flying-dresses"')
);

// ---------------------------------------------------------------------------
// NO EM-DASHES IN ANYTHING A VISITOR READS.
//
// The owner asked for them gone, in those words: they read as machine-written,
// and this is a business selling a human morning with a photographer. 85 of
// them were repunctuated by hand rather than swapped for a single character,
// because the right replacement differs every time: a colon before a list, a
// full stop between two independent clauses, a comma around an aside,
// parentheses where a pair of dashes was doing a parenthesis's job.
//
// Only STRINGS AND JSX count. Code comments keep theirs: they are documentation
// for whoever reads this repository next, no visitor can see them, and
// rewriting a hundred of them would churn the file history for nothing.
//
// Proven by putting a single em-dash back into a page's prose: red. And by
// putting one in a comment: still green, which is the distinction this makes.
// ---------------------------------------------------------------------------
function stripComments(src: string): string {
  let out = "";
  let mode: "code" | "block" = "code";
  for (const line of src.split("\n")) {
    let m: "code" | "block" = mode;
    for (let i = 0; i < line.length; i++) {
      const two = line.slice(i, i + 2);
      if (m === "code" && two === "/*") { m = "block"; i++; continue; }
      if (m === "block" && two === "*/") { m = "code"; i++; continue; }
      // A // comment runs to end of line. There is no http:// in these files'
      // prose; if one is ever added this would stop reading the rest of that
      // line, which fails safe (it can only miss a dash, never invent one).
      if (m === "code" && two === "//") break;
      if (m === "code") out += line[i];
    }
    mode = m;
    out += "\n";
  }
  return out;
}

const PROSE_FILES = [
  "src/content/flyingDresses.ts",
  // Added when the accessories grew names, descriptions and a line each
  // saying where they are worn. Before that this file held references and
  // alt text; now it is customer-facing prose like everything else here, and
  // leaving it out would have been a hole in the dash rule the owner asked
  // for, opened by the change that filled the file.
  "src/content/flyingDressAccessories.ts",
  "src/app/flying-dresses/_lib/assets.ts",
  "src/app/flying-dresses/_lib/seo.ts",
  "src/app/flying-dresses/page.tsx",
  "src/app/flying-dresses/layout.tsx",
  "src/app/flying-dresses/about/page.tsx",
  "src/app/flying-dresses/faq/page.tsx",
  "src/app/flying-dresses/enquire/page.tsx",
  "src/app/flying-dresses/packages/page.tsx",
  "src/app/flying-dresses/rentals/page.tsx",
  "src/app/flying-dresses/rentals/[slug]/page.tsx",
  "src/app/flying-dresses/wardrobe/page.tsx",
  "src/app/flying-dresses/experiences/page.tsx",
  "src/app/flying-dresses/experiences/[slug]/page.tsx",
  "src/app/flying-dresses/not-found.tsx",
  "src/app/flying-dresses/_components/Header.tsx",
  "src/app/flying-dresses/_components/Footer.tsx",
  "src/app/flying-dresses/_components/Wardrobe.tsx",
  "src/app/flying-dresses/_components/EnquiryForm.tsx",
  "src/app/flying-dresses/_components/BookingRail.tsx",
  "src/app/flying-dresses/_components/StickyEnquire.tsx",
  "src/app/flying-dresses/_components/FaqList.tsx",
  "src/app/flying-dresses/_components/Scene.tsx",
];

for (const file of PROSE_FILES) {
  const visible = stripComments(read(file));
  const count = (visible.match(/\u2014/g) ?? []).length;
  ok(
    `${file} has ${count} em-dash(es) in text a visitor reads. The owner asked for none: ` +
      "repunctuate by hand (a colon, a full stop, a comma or parentheses as the sentence needs), " +
      "do not swap in a hyphen.",
    count === 0
  );
}

const proxySource = read("src/proxy.ts");
ok(
  "src/proxy.ts no longer exempts /flying-dresses from the locale rewrite — every page would be rewritten to " +
    "/en/flying-dresses/... and 404",
  proxySource.includes('pathname.startsWith("/flying-dresses/")')
);
ok(
  "src/proxy.ts no longer asks isFlyingDressesHost which brand a request is for, so the host table below " +
    "guards nothing that runs",
  proxySource.includes("isFlyingDressesHost")
);

// ---------------------------------------------------------------------------
// WHICH HOSTNAMES ARE THIS BRAND'S — the real function, over real hostnames.
//
// This replaced an assertion that only checked the proxy source CONTAINED the
// string "isFlyingDressesHost". That assertion passed throughout the incident
// described at the top of src/lib/brand/flyingDressesHost.ts, in which the
// Flying Dresses deployment served the ENTIRE Egypt Eye site — Studio, admin
// and every API route — on all three of its *.vercel.app hostnames, because
// none of them matched and an unmatched host falls through to the other brand.
// It is the exact failure CLAUDE.md §4 is about: a check that passes on the
// broken code checks nothing.
//
// So this calls the function. Both columns matter and for different reasons:
// a hostname missing from TRUE is an Egypt Eye site served on a Flying Dresses
// address (the incident), and a hostname wrongly in TRUE is the travel site
// going dark. Every case below was taken from a real Vercel dashboard.
//
// Proven three ways, each restored afterwards:
//   - deleting the .vercel.app clause, which is the original bug: the three
//     project hostnames go red.
//   - widening it to a bare `name.includes("flying-dresses")`: three go red,
//     among them the egypt-eye-git-flying-dresses alias.
//   - dropping the `.endsWith(".vercel.app")` guard: one goes red,
//     flying-dresses-egypt-preview.example.com, and only because that case was
//     added for it — see the note beside it.
// ---------------------------------------------------------------------------
const FLYING_DRESSES_HOSTNAMES = [
  // The brand's own domain, which is all the first version of this matched.
  "flyingdressesegypt.com",
  "www.flyingdressesegypt.com",
  "FlyingDressesEgypt.com", // Host headers are not case-normalised for us.
  "flyingdressesegypt.com:443",
  // The three hostnames Vercel generates for the flying-dresses-egypt project,
  // copied from the deployment the owner opened and was shown the wrong site.
  "flying-dresses-egypt.vercel.app",
  "flying-dresses-egypt-git-flying-dresses-99c405-egypt-eye-travel.vercel.app",
  "flying-dresses-egypt-p0gbrpg5v-egypt-eye-travel.vercel.app",
  // Local review host.
  "flyingdressesegypt.localhost:3000",
];

const EGYPT_EYE_HOSTNAMES = [
  // The live travel site. If any of these ever matched, it would go dark:
  // every Egypt Eye URL would 404 on its own domain.
  "egypteyetravel.com",
  "www.egypteyetravel.com",
  "egypt-eye.vercel.app",
  "egypt-eye-git-main-egypt-eye-travel.vercel.app",
  // THE IMPORTANT ONE. This is the alias Egypt Eye's own project produces if
  // it ever builds this brand's branch. It contains "flying-dresses" and must
  // still be Egypt Eye — which is why the match is anchored to the start of
  // the hostname rather than being a substring search.
  "egypt-eye-git-flying-dresses-production-egypt-eye-travel.vercel.app",
  "localhost:3000",
  // Suffix spoofing: a hostname somebody else controls that begins with ours.
  "flying-dresses-egypt.vercel.app.example.com",
  "flyingdressesegypt.com.example.com",
  // A real custom domain that merely starts the same way is not this project.
  "flying-dresses-egypt.example.com",
  // This one, specifically, is what makes `.endsWith(".vercel.app")` load
  // bearing rather than decorative. It begins with `flying-dresses-egypt-`,
  // so the prefix test alone accepts it — only the suffix test refuses it. The
  // two spoofs above do NOT exercise that guard, because both have a `.` after
  // "egypt" where the prefix wants a `-`; a first version of this table used
  // only those and the guard could be deleted with every assertion still
  // passing. Which is CLAUDE.md §4 happening live, inside the check written to
  // honour CLAUDE.md §4.
  "flying-dresses-egypt-preview.example.com",
  "",
];

for (const host of FLYING_DRESSES_HOSTNAMES) {
  ok(
    `"${host}" is not recognised as a Flying Dresses hostname, so that address serves the ENTIRE Egypt Eye ` +
      "site — Studio, admin and every API route — because an unmatched host falls through to the other brand",
    isFlyingDressesHost(host)
  );
}

for (const host of EGYPT_EYE_HOSTNAMES) {
  ok(
    `"${host}" is wrongly claimed by Flying Dresses, so every Egypt Eye URL on it would 404 — the live ` +
      "travel site going dark",
    !isFlyingDressesHost(host)
  );
}
ok(
  "src/proxy.ts's matcher excludes robots.txt again, so the brand domain cannot serve its own copy",
  !/robots\.txt\|sitemap\.xml/.test(proxySource)
);

// Its own robots and sitemap must exist for that routing to land anywhere.
ok(
  "the brand has no robots.txt route, so its domain would advertise Egypt Eye's sitemap",
  existsSync("src/app/flying-dresses/robots.txt/route.ts")
);
ok(
  "the brand has no sitemap route",
  existsSync("src/app/flying-dresses/sitemap.xml/route.ts")
);

// ---------------------------------------------------------------------------
// 8b. THE BRAND DOMAIN MAY NOT SERVE EGYPT EYE
//
// This repository builds ONE application. A second Vercel project created
// from it to serve flyingdressesegypt.com contains the ENTIRE Egypt Eye app:
// 34 API routes, the embedded Sanity Studio, the admin and account pages, the
// PayPal capture endpoint and the PayPal webhook. A separate Vercel project
// does not isolate any of it, because what decides which URLs answer is the
// hostname, not the deployment.
//
// So the proxy answers 404 for those paths on that host, and the booking link
// points at the Egypt Eye origin absolutely — which is what lets the Flying
// Dresses project hold no PayPal credentials at all.
//
// These are the assertions that keep that true. Proven by putting
// `pathname.startsWith("/api/")` back into the allow-list, and separately by
// changing the booking href back to a relative `/secure/photoshoot/...`:
// red in both cases.
// ---------------------------------------------------------------------------
ok(
  "src/proxy.ts no longer refuses Egypt Eye's routes on the Flying Dresses host — /studio, /auth and every " +
    "/api route would answer on that domain, on a deployment that also carries the booking and CMS endpoints",
  /pathname\.startsWith\("\/api\/"\) \|\| pathname\.startsWith\("\/auth\/"\) \|\| pathname\.startsWith\("\/studio"\)/.test(
    proxySource
  ) && proxySource.includes("status: 404")
);

ok(
  "src/proxy.ts uses an allow-list for the Flying Dresses host — a deny-list lets every route added later " +
    "through by default, which is the wrong direction for a second hostname on a shared application",
  proxySource.includes("isFlyingDressesAllowed") && !proxySource.includes("isFlyingDressesExempt")
);

// ---------------------------------------------------------------------------
// THE DEPOSIT BUTTON MUST LEAVE THIS DOMAIN, AND THE DIALOG MUST NOT BE
// MOUNTED HERE.
//
// This was briefly the other way round: SecureDateButton, the dialog Egypt Eye
// opens on its own product pages, was mounted on these pages so that nobody
// mid-purchase had to cross to another brand. The booking logic was right —
// correct price, correct deposit percentage, correct wording — and the dialog
// still rendered as unstyled markup inline in the page, because that component
// is built from Tailwind utilities that resolve against the @theme in
// app/globals.css and this brand's root layout loads only brand.css, which
// imports no Tailwind on purpose.
//
// So the two halves are asserted separately, because they fail separately:
//   1. The handoff must stay absolute, to the Egypt Eye checkout that works.
//   2. This file must not import the Egypt Eye dialog at all. A styling
//      problem is invisible to every check in this repo — it was caught by
//      screenshotting the deployed page, not here — so what is guarded is the
//      import, which is checkable. When the dialog can be presented in this
//      brand's chrome, this assertion is the one to come back and change.
//
// PROVEN by restoring the SecureDateButton branch (both red) and by deleting
// the handoff link (first red). Then reverted.
// ---------------------------------------------------------------------------
const bookingRail = read("src/app/flying-dresses/_components/BookingRail.tsx");
const railCode = bookingRail
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

ok(
  "the Flying Dresses rail no longer sends the deposit to the Egypt Eye checkout, so a customer who " +
    "wants to pay has nowhere to go",
  railCode.includes("EGYPT_EYE_ORIGIN") && /secure\/photoshoot\/\$\{pkg\.eyeSlug\}/.test(railCode)
);
ok(
  "the Flying Dresses rail mounts Egypt Eye's SecureDateButton, whose Tailwind classes resolve to " +
    "nothing under this brand's layout — it rendered as unstyled markup inline in the page the last " +
    "time this was tried",
  !railCode.includes("SecureDateButton")
);

// The rule that will gate the dialog once it can be presented in this brand's
// chrome. Nothing calls it while the handoff stands, and it is exercised here
// rather than deleted because it is the one thing that will stand between a
// customer and a charge with no booking behind it.
ok(
  "canCompleteBookingHere lets a deployment take money with no database behind it",
  canCompleteBookingHere({ providerEnabled: true, supabaseReady: false }) === false
);
ok(
  "canCompleteBookingHere refuses a deployment that has both halves",
  canCompleteBookingHere({ providerEnabled: true, supabaseReady: true }) === true
);
ok(
  "canCompleteBookingHere offers a checkout with no payment provider",
  canCompleteBookingHere({ providerEnabled: false, supabaseReady: true }) === false
);

// ---------------------------------------------------------------------------
// WHAT THE BRAND'S DOMAIN REFUSES.
//
// No booking route answers on this host, because nothing on this host calls
// one: the deposit button hands off to the Egypt Eye checkout. Three were
// briefly open for a dialog that could not be styled here, and an allow-list
// entry for a feature that is not shipped reads to the next person as a
// decision somebody made.
//
// Two of them stay shut even when the dialog arrives, and nothing should ever
// widen to a prefix — `startsWith("/api/bookings")` would admit both of them
// and every route added under that path from now on.
// ---------------------------------------------------------------------------
// Comments stripped, for the third time in this change: the proxy's own note
// explains the prefix trap by writing `startsWith("/api/bookings")` out in
// full, and the first version of the guard below matched that sentence instead
// of the code. CLAUDE.md §4, again.
const proxyCode = proxySource
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

for (const route of ["/api/bookings", "/api/bookings/rail", "/api/bookings/paypal/capture"]) {
  ok(
    `${route} answers on the Flying Dresses domain, for a checkout that does not run there`,
    !proxyCode.includes(`pathname === "${route}"`)
  );
}
ok(
  "the Flying Dresses allow-list matches /api/bookings by PREFIX, which admits the reconcile sweep and " +
    "every booking route added after today without anybody deciding to",
  !/startsWith\(\s*["'`]\/api\/bookings/.test(proxyCode)
);
ok(
  "the reconcile sweep answers on the Flying Dresses domain — it belongs to one deployment and a second " +
    "one answering it is a second thing that can double-settle a payment",
  !proxyCode.includes('pathname === "/api/bookings/reconcile"')
);
ok(
  "a second PayPal webhook endpoint answers on the Flying Dresses domain. PayPal resolves a booking by " +
    "order id in the shared Supabase, so the Egypt Eye webhook already settles orders started here; a " +
    "second endpoint needs a second registration and a second PAYPAL_WEBHOOK_ID and buys nothing",
  !proxyCode.includes('pathname === "/api/webhooks/paypal"')
);

ok(
  "the Flying Dresses enquiry endpoint is not reachable on the brand's own domain, so its form cannot submit",
  proxySource.includes('pathname === "/api/flying-dresses-enquiry"')
);

// ---------------------------------------------------------------------------
// 9. AN ENQUIRY NEVER CLAIMS TO BE A BOOKING
//
// The WhatsApp message is what a customer reads back to themselves. It must ask
// for availability rather than assert it. CLAUDE.md §5: never tell a customer a
// booking is confirmed.
//
// Proven by rewriting the closing line to "My booking is confirmed for these
// dates." — red on both assertions.
// ---------------------------------------------------------------------------
const message = flyingDressEnquiry({
  subject: "the Pyramids Rooftop",
  name: "Test",
  date: "2026-11-02",
  dress: "Emerald",
});
ok(
  "the enquiry message does not ask for availability to be confirmed, so it reads as a booking rather than a question",
  /confirm availability/i.test(message)
);
ok(
  "the enquiry message asserts a confirmed or secured booking, which no message sent from this site ever is",
  !/\b(is|are) (confirmed|booked|reserved|secured)\b/i.test(message)
);
ok(
  "the enquiry message drops the details the customer chose",
  message.includes("Emerald") && message.includes("2026-11-02")
);

// ---------------------------------------------------------------------------
// 10. REDUCED MOTION REALLY TURNS THE MOTION OFF
//
// The whole motion system is CSS scroll-driven animation. The reduced-motion
// block has to drop the TIMELINES, not just shorten the durations — an
// animation-timeline animation with a 1ms duration still runs on scroll.
//
// Proven by deleting `animation-timeline: none !important;` from the
// prefers-reduced-motion block: red.
// ---------------------------------------------------------------------------
const brandCss = read("src/app/flying-dresses/brand.css");
const reducedStart = brandCss.indexOf("@media (prefers-reduced-motion: reduce)");
ok("brand.css has no prefers-reduced-motion block at all", reducedStart !== -1);
if (reducedStart !== -1) {
  const reducedBlock = brandCss.slice(reducedStart);
  ok(
    "the reduced-motion block does not disable animation-timeline, so every scroll-driven animation still runs " +
      "for a visitor who asked for less motion",
    reducedBlock.includes("animation-timeline: none !important")
  );
}

// ---------------------------------------------------------------------------
// NO PINNED SCROLL SCENE, ANYWHERE
//
// The home page used to carry one: three viewports of track with the captions
// cross-fading as you scrolled. The owner had it removed because it froze on
// their phone, and the principle behind that is worth keeping: a visitor who
// wants to read the page should never have to out-scroll an animation.
//
// This replaces an assertion that used to require the reduced-motion block to
// RESET that scene. That was the right guard while the scene existed; now that
// it is gone, requiring the reset would have meant keeping dead CSS alive to
// satisfy a check. The stronger property is that the scene cannot come back.
//
// A tall scroll track is the mechanism, so that is what is caught: a height in
// svh/vh above 150 is a section built to be scrolled through rather than
// looked at.
//
// Proven by re-adding `.fd-pin-track { height: 280svh; }`: red. Removed:
// green.
// ---------------------------------------------------------------------------
ok(
  "brand.css still defines the pinned scroll scene, which the owner had removed because it froze",
  !/\.fd-pin/.test(stripComments(brandCss))
);
for (const match of stripComments(brandCss).matchAll(/height:\s*(\d+)(svh|vh)/g)) {
  ok(
    `a section is ${match[1]}${match[2]} tall, which is a scroll track rather than a section — the pinned scene was removed for exactly this`,
    Number(match[1]) <= 150
  );
}

// Every animated element must be in its FINAL state by default, with the
// animation added ONLY inside the gated blocks — otherwise a browser without
// scroll-driven animations, or one that never fires the timeline, shows a
// permanently blank page. This repository has already had to work around that
// exact failure once, in components/Reveal.tsx.
//
// The first version of this assertion was USELESS and is worth recording: it
// scanned only the text BEFORE the first @supports block, so a rule added
// anywhere after it passed. Breaking the guard by pasting
// `.fd-reveal { opacity: 0 }` further down the file left the check green.
//
// It now cuts the gated regions out by brace-matching and scans everything
// that is left, which is the actual property: no ungated rule may hide a
// reveal. Proven by pasting that rule both before and after the @supports
// block: red in both positions.
function stripGuardedBlocks(css: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const atSupports = css.indexOf("@supports (animation-timeline", i);
    const atReduced = css.indexOf("@media (prefers-reduced-motion", i);
    const next =
      atSupports === -1 ? atReduced : atReduced === -1 ? atSupports : Math.min(atSupports, atReduced);
    if (next === -1) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, next);
    // Walk to the matching close brace of the at-rule.
    let depth = 0;
    let j = css.indexOf("{", next);
    if (j === -1) break;
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    i = j;
  }
  return out;
}

ok("brand.css no longer gates its reveals behind @supports", brandCss.includes("@supports (animation-timeline: view())"));

const ungated = stripGuardedBlocks(brandCss);
ok(
  "a reveal class hides content in an ungated rule — it would be permanently invisible in any browser without " +
    "scroll-driven animations, which is the one failure a scroll-reveal must never have",
  !/\.fd-(reveal|fabric|words|pin-step|enter)[^{}]*\{[^{}]*(opacity:\s*0|visibility:\s*hidden)/.test(ungated)
);

// ---------------------------------------------------------------------------
// 11. CONTACT DETAILS ARE REACHABLE
//
// Proven by setting the Instagram profileUrl to "instagram.com/x" (no scheme):
// red.
// ---------------------------------------------------------------------------
ok("the brand has no contact email", /\S+@\S+\.\S+/.test(contact.email));
ok("the brand has no phone number", contact.phones.length > 0);
for (const phone of contact.phones) {
  ok(
    `phone "${phone.display}" does not produce a dialable tel: value`,
    /^\+\d{8,15}$/.test(phone.tel)
  );
}
ok(
  "the WhatsApp number is not a bare international number, so every WhatsApp link on the site is malformed",
  /^\d{8,15}$/.test(contact.whatsappNumber)
);
for (const social of contact.socials) {
  if (social.profileUrl !== null) {
    ok(
      `the ${social.platform} link is not an absolute https URL, so it resolves relative to this site`,
      social.profileUrl.startsWith("https://")
    );
  }
}
ok(
  "the brand has no canonical URL, so every canonical tag and sitemap entry is relative",
  brand.url.startsWith("https://")
);

// ---------------------------------------------------------------------------
// EVERY fd- CLASS THE BRAND'S PAGES USE IS ACTUALLY DEFINED IN brand.css
//
// This one exists because it already happened. The home page's work gallery
// was renamed from `fd-grid` to `fd-gallery` and no rule was ever written for
// the new name, so six figures that should have sat in a grid stacked one per
// row, full width, down the page. Nothing caught it: TypeScript does not read
// class strings, ESLint does not read CSS, and all 17 checks passed. The page
// rendered, it was simply wrong — which is the exact failure mode the top of
// this file says the whole script is for.
//
// A className is a string, so a typo or a half-finished rename is invisible to
// every other tool in the project. This closes that gap: collect every fd-
// token the brand's own .tsx files put in a className, and require each one to
// have a definition in brand.css.
//
// Tokens built by interpolation cannot be checked from source text, so a
// className containing `${` is skipped rather than guessed at.
//
// PROVEN, four ways, each one failure naming the right class, green restored:
//   A  all three `.fd-gallery` rules renamed to `.fd-gallery-x`  -> red
//   B  same, plus `.fd-gallery` added back in a comment only     -> red
//      (B is the one that matters: the first draft of this guard read the
//      unstripped file and B passed it, which is CLAUDE.md §4's
//      matched-its-own-comment failure reproduced by accident.)
//   C  the @media-only `.fd-list-2` renamed                      -> red
//      (C is why the parser is a lookahead and not a split on `}`: the split
//      version could not see into a media query and called fd-list-2,
//      fd-form-2 and fd-has-sticky-cta undefined when all three are defined.)
//   D  the className itself typo'd to `fd-galery`                -> red
// ---------------------------------------------------------------------------
// COMMENTS STRIPPED FIRST, AND THIS IS NOT OPTIONAL.
// The first version of this guard read the whole file, and the explanatory
// comment above .fd-gallery names `.fd-gallery` in prose. So the class was
// "defined" by the comment describing it, and renaming the rule it guards left
// the check green. That is CLAUDE.md §4's first recorded failure — a guard
// that matched its own comment — reproduced here by accident.
const BRAND_CSS = read("src/app/flying-dresses/brand.css").replace(
  /\/\*[\s\S]*?\*\//g,
  ""
);

/**
 * Every class brand.css actually defines.
 *
 * Matched in SELECTOR POSITION ONLY: a class token whose next structural
 * character is `{` rather than `;` or `}`. That is what distinguishes
 * `.fd-gallery {` from a mention in a declaration value.
 *
 * The lookahead is why this is not a split on `}`. Splitting that way reads
 * only the outermost selector of each block, so every rule nested inside a
 * `@media` was invisible — the first version of this parser reported
 * fd-list-2, fd-form-2 and fd-has-sticky-cta as undefined when all three are
 * defined, just behind a breakpoint. Over half this file's rules are inside a
 * media query, so a parser that cannot see into one is useless here.
 */
const definedClasses = new Set(
  [...BRAND_CSS.matchAll(/\.(fd-[a-z0-9-]+)(?=[^{};]*\{)/g)].map((m) => m[1]!)
);

/** Every .tsx under the brand's route, which is the only place fd- classes are used. */
const brandTsx = execSync(
  "find src/app/flying-dresses -name '*.tsx' -type f",
  { encoding: "utf8" }
)
  .trim()
  .split("\n")
  .filter(Boolean);

const usedClasses = new Map<string, string>();
for (const file of brandTsx) {
  const source = read(file);
  for (const match of source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    const value = match[1] ?? match[2] ?? "";
    if (value.includes("${")) continue;
    for (const token of value.split(/\s+/)) {
      if (token.startsWith("fd-") && !usedClasses.has(token)) {
        usedClasses.set(token, file);
      }
    }
  }
}

for (const [token, file] of usedClasses) {
  ok(
    `${file} uses the class "${token}", which brand.css never defines — the element renders unstyled`,
    definedClasses.has(token)
  );
}

// ---------------------------------------------------------------------------
// A "NO PHOTOGRAPH YET" LINE MUST BE CONDITIONAL ON THERE BEING NO PHOTOGRAPH
//
// The wardrobe lightbox told every visitor "A colour swatch, not the fabric.
// Ask us for photographs" — correct while the wardrobe was twelve hex values,
// and wrong the moment twelve real photographs landed, because the line then
// sat directly under a photograph of the dress. It denied the picture above it
// and asked the customer to request what was already on screen.
//
// The thumbnail note in the SAME component was written conditionally and was
// right the whole time. So the component disagreed with itself, and nothing
// caught it: both branches compile, both render, and neither is a crash.
//
// This asserts the shape rather than the wording: wherever Wardrobe.tsx says
// no photograph exists, `dressPhotos` must be tested nearby, so the claim is
// driven by the registry rather than by what was true on the day it was typed.
//
// It is a text-proximity check and it knows it: it proves the condition is
// THERE, not that it is the right way round. That is still the difference
// between this bug being impossible to miss and it shipping for a week.
//
// Proven by reverting the caption to the unconditional string: red. Restored:
// green. Also proven to be load-bearing by deleting the `dressPhotos` test
// from the thumbnail note alone: red, naming that line.
// ---------------------------------------------------------------------------
// Comments stripped first, for the same reason the CSS guard above strips
// them: the explanatory comment beside this very caption names `dressPhotos`,
// so an unstripped scan would be satisfied by the note describing the bug
// rather than by the code that prevents it.
const WARDROBE_SRC = read("src/app/flying-dresses/_components/Wardrobe.tsx")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

/** Lines that assert to the visitor that no photograph of this garment exists. */
const NO_PHOTO_CLAIMS = [
  "A colour swatch, not the fabric",
  "Ask us for photographs",
  "Photo coming soon",
  "Photo on request",
];

for (const claim of NO_PHOTO_CLAIMS) {
  let from = 0;
  for (;;) {
    const at = WARDROBE_SRC.indexOf(claim, from);
    if (at < 0) break;
    from = at + claim.length;
    // The enclosing ternary's condition sits above the string. 400 characters
    // covers the longest of them in this file with room to spare.
    const window = WARDROBE_SRC.slice(Math.max(0, at - 400), at);
    ok(
      `Wardrobe.tsx says "${claim}" without testing the photo map first — it will say that over a real photograph`,
      // `photos[`, not `dressPhotos[`: the component used to import that
      // module and now receives the map as a prop, so the lookup it guards
      // on is named for the prop. Keyed to the old name this read as five
      // failures the moment the Studio field was wired up.
      window.includes("photos[")
    );
  }
}

// ---------------------------------------------------------------------------
// THE STICKY BAR'S CONTEXT COMES FROM THE CATALOGUE, NOT FROM THE URL
//
// The phone action bar is the only call to action visible on a phone, so it is
// the most-used enquiry path on the site. It lives in the layout, which means
// no page can hand it a prop and the route is the only thing it can read.
//
// The tempting version of that is to slice the slug out of the pathname and
// interpolate it into /enquire?package=<slug>. That turns the address bar into
// an input: /experiences/anything-at-all would produce a link to a package
// that does not exist, and a renamed product would keep generating links to
// its old slug forever. /enquire already resolves its query against the
// catalogue for exactly this reason, and the bar that feeds it must do the
// same, so an unknown route degrades to the generic enquiry.
//
// Proven by replacing the `packages.find` lookup with a pathname slice: red.
// Restored: green.
// ---------------------------------------------------------------------------
const STICKY_SRC = read("src/app/flying-dresses/_components/StickyEnquire.tsx")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

ok(
  "StickyEnquire does not resolve the route against `packages`, so its enquiry link can name a package that does not exist",
  /packages\.find\(/.test(STICKY_SRC)
);
ok(
  "StickyEnquire does not resolve the route against `rentalServices`, so its enquiry link can name a service that does not exist",
  /rentalServices\.find\(/.test(STICKY_SRC)
);
ok(
  "StickyEnquire interpolates the pathname straight into an /enquire link — the address bar is not a product id",
  !/enquire\?[^`"']*\$\{\s*pathname/.test(STICKY_SRC)
);

// ---------------------------------------------------------------------------
// EVERY SHARE IMAGE EXISTS, AND DECLARES ITS REAL SHAPE
//
// A link to this site used to render as grey text in WhatsApp, Instagram and
// iMessage: openGraph carried no `images` while twitter.card asked for
// "summary_large_image", so the big photo card was requested and no photo
// supplied. For a photography business whose customers share links in exactly
// those apps, that was the worst available first impression.
//
// Two ways the fix can rot, and both are silent, because a share card is
// rendered on somebody else's server and nobody on this team ever sees it:
//
//   1. The file moves or is renamed. The card goes back to grey text.
//   2. The declared size stops matching the file. Scrapers lay the card out
//      from the numbers, not the pixels, so the picture is right and its shape
//      is a lie. This is live: the poster is 1600x900, the dress frames are
//      1600x1067 and the shoot frames are 2000x1333, and the first draft of
//      fdMetadata hardcoded 1600x900 for all of them.
//
// So this reads the JPEG's own SOF header and compares it with what the code
// claims. Proven by swapping one entry's height to 999 (red, naming it) and by
// pointing one at a file that does not exist (red). Restored: green.
// ---------------------------------------------------------------------------
const SHARE_IMAGES_SRC = read("src/app/flying-dresses/_lib/shareImages.ts");
const SEO_SRC = read("src/app/flying-dresses/_lib/seo.ts");

// BOUNDED TO EACH OBJECT, and that is the whole point. The first version of
// these two used /openGraph:[\s\S]*?images:/, which walks past the end of the
// openGraph object and happily matches the `images:` belonging to `twitter:`
// further down. Deleting the openGraph image left it green — the exact failure
// this check exists to catch, in the check itself. `[^}]*` stops at the
// object's own closing brace; neither object contains a nested one.
ok(
  "fdMetadata no longer emits an openGraph image, so every shared link renders as grey text",
  /openGraph:\s*\{[^}]*images:/.test(SEO_SRC)
);
ok(
  "fdMetadata asks for a large Twitter card without supplying an image",
  !/card: "summary_large_image"/.test(SEO_SRC) || /twitter:\s*\{[^}]*images:/.test(SEO_SRC)
);

/** Reads width and height out of a JPEG's start-of-frame marker. */
const jpegSize = (file: string): { width: number; height: number } | null => {
  const buf = readFileSync(file);
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1]!;
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
};

// Each declared share image, as { src, width, height } in source order.
const declaredShareImages = [
  ...SEO_SRC.matchAll(
    /src:\s*"([^"]+)",\s*\n\s*width:\s*(\d+),\s*\n\s*height:\s*(\d+)/g
  ),
  ...SHARE_IMAGES_SRC.matchAll(
    /src:\s*"([^"]+)",\s*\n\s*width:\s*(\d+),\s*\n\s*height:\s*(\d+)/g
  ),
];

ok(
  "no share image is declared anywhere, so the share-image check is asserting nothing",
  declaredShareImages.length >= 4
);

for (const [, src, width, height] of declaredShareImages) {
  const file = `public${src}`;
  if (!existsSync(file)) {
    ok(`the share image ${src} is not in public/, so every card linking to it renders as text`, false);
    continue;
  }
  const real = jpegSize(file);
  ok(
    `${src} is declared ${width}x${height} but is really ${real?.width}x${real?.height} — scrapers lay the card out from the declared size`,
    real !== null && real.width === Number(width) && real.height === Number(height)
  );
}

// ---------------------------------------------------------------------------
// ONLY Gallery.tsx MAY BUILD A GALLERY
//
// Every rule that keeps a gallery honest on this site has already been broken
// once, and each time it was broken by a page building its own grid by hand:
//
//   * the grid lost its CSS in a rename and stacked six frames down the page;
//   * the intro read "Two frames here are ours" on a day when four were;
//   * only some figures had captions, so the rows shared no baseline;
//   * one cell carried `gridRow: span 2` and stranded another beside it.
//
// So the rules live in the component, and this stops a page going around it.
// Three things are asserted, and the third is the one that matters:
//
//   1. Gallery renders through `Scene`, which is what makes a missing
//      photograph a labelled gap rather than a stock photo.
//   2. Every frame gets a `<figcaption>`, so the baselines line up.
//   3. No other .tsx builds `className="fd-gallery`. That is the hole every
//      one of the bugs above came through.
//
// Proven by re-inlining the home page's old hand-built grid (red, naming
// page.tsx), by replacing Scene with a bare <img> (red), and by deleting the
// figcaption (red). Restored: green.
// ---------------------------------------------------------------------------
const GALLERY_SRC = read("src/app/flying-dresses/_components/Gallery.tsx")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

ok(
  "Gallery no longer renders through Scene, so a missing photograph stops being a labelled gap",
  /<Scene\b/.test(GALLERY_SRC)
);
ok(
  "Gallery no longer gives every frame a figcaption, so captioned and uncaptioned rows stop sharing a baseline",
  /<figcaption/.test(GALLERY_SRC)
);

for (const file of brandTsx) {
  if (file.endsWith("_components/Gallery.tsx")) continue;
  const source = read(file)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  ok(
    `${file} builds its own fd-gallery grid instead of using <Gallery> — every gallery bug on this site came through a hand-built grid`,
    !/className="fd-gallery/.test(source)
  );
}

// ---------------------------------------------------------------------------
// EMPTYING A GALLERY IN THE STUDIO MUST EMPTY IT, NOT RESTORE THE REPO'S
//
// The galleries are the one part of this brand the owner can edit without a
// developer, which means the Studio has to behave the way they expect or it is
// worse than not having it. The three cases are from the sanity-content skill
// and the middle one is the whole point:
//
//   null / undefined  the projection never returned it  -> the repo's frames
//   []                an editor emptied the gallery     -> STAYS EMPTY
//   no local entry    a Studio-only gallery             -> empty, not a throw
//
// Collapsing [] into null is the easy mistake, it reads as a sensible
// fallback, and it quietly overrules a deliberate deletion: the owner removes
// six frames, publishes, and the old six come back with nothing to say why.
//
// `layout` is checked for a different reason. It is a union, and a document
// saved before that field existed returns null, which would reach the page as
// the class `fd-gallery-null` and silently render an unstyled block — the same
// bug as the gallery that had no CSS at all.
//
// Proven by making arr() treat [] as missing (red on the emptied case) and by
// returning gallery.layout unchecked (red on the null and junk cases).
// ---------------------------------------------------------------------------
{
  const localGallery = flyingDressGalleryById("home-work");
  ok("the home-work gallery is missing from the content file, so its fallback is gone", Boolean(localGallery));

  if (localGallery) {
    const base = { galleryId: "home-work", title: "T", layout: "grid" as const };
    const framesOf = (doc: unknown, local?: typeof localGallery) =>
      hardenFlyingDressGallery(doc as FlyingDressGallery, local).frames.length;

    ok(
      "a gallery the projection did not return does not fall back to the content file",
      framesOf({ ...base, frames: null }, localGallery) === localGallery.frames.length
    );
    ok(
      "EMPTYING a gallery in the Studio silently restores the repo's frames, overruling the editor",
      framesOf({ ...base, frames: [] }, localGallery) === 0
    );
    ok(
      "a Studio-only gallery with no frames throws instead of rendering nothing",
      framesOf({ ...base, frames: null }, undefined) === 0
    );

    const layoutOf = (layout: unknown) =>
      hardenFlyingDressGallery(
        { ...base, layout, frames: [] } as unknown as FlyingDressGallery,
        localGallery
      ).layout;
    for (const bad of [null, undefined, "", "fd-gallery-null"]) {
      ok(
        `layout ${JSON.stringify(bad)} reaches the page unchecked and renders an unstyled block`,
        layoutOf(bad) === "grid"
      );
    }
    ok("a real layout is not overwritten", layoutOf("strip") === "strip");
  }
}

// ---------------------------------------------------------------------------
// A PRICE STORY MAY NOT INTRODUCE A PRICE
//
// `priceStory` exists to defend a number a visitor finds surprising, and the
// temptation when writing one is to reach for the comparison: "only $150 more
// than the rooftop", "about $60 an hour". Every one of those is a second
// figure about money living in prose, where CLAUDE.md section 5's rule that
// money has one authority cannot reach it, and where it will not be updated
// when the brochure changes.
//
// So the only dollar amount allowed anywhere in a package's priceStory is that
// package's own `priceUsd`. The Fayoum copy is written around this: it says
// "the same photoshoot" and "about three hours", and names no figure at all.
//
// A timeline is held to the same rule, for the same reason.
//
// Proven by adding "only $150 more than the rooftop" to the Fayoum story
// (red, naming the stray figure) and by writing "$349" into it (green, since
// that is its own price). Restored: green.
// ---------------------------------------------------------------------------
for (const pkg of packages) {
  const prose = [
    ...(pkg.priceStory ? [pkg.priceStory.heading, ...pkg.priceStory.body] : []),
    ...(pkg.timeline ?? []).flatMap((step) => [step.when, step.what]),
  ].join(" ");

  for (const match of prose.matchAll(/\$\s?([\d,]+)/g)) {
    const figure = Number(match[1]!.replace(/,/g, ""));
    ok(
      `the ${pkg.slug} price story or timeline names $${match[1]}, which is not its own price of $${pkg.priceUsd} — money has one authority and prose is not it`,
      figure === pkg.priceUsd
    );
  }
}

// ---------------------------------------------------------------------------
// THE EXPERIENCES CATALOGUE CANNOT PROMISE WHAT THE BUSINESS HAS NOT CONFIRMED
//
// This catalogue is eight experiences the owner described as CAPABILITIES. Not
// one of them has a confirmed price, a signed venue agreement or a verified
// equipment list behind it. The whole file is therefore written to make the
// honest answer the easy one, and these assertions are what stop that decaying
// the first time somebody is in a hurry.
//
// Five properties, each of which has a specific way of going wrong:
//
//   1. A PRICE CANNOT APPEAR while that experience still lists an open price
//      question. This is the expensive one: a figure on the page is what a
//      customer plans around and quotes back when it turns out to be wrong.
//   2. `included` may not contain anything a partner or the venue supplies.
//      Cake, musicians, dining, transport and sound are other people's to
//      deliver, and listing them as included is a promise we cannot keep.
//   3. Anything mentioning a rooftop carries the venue dependency, because the
//      rooftop belongs to a hotel and a customer planning a surprise around it
//      deserves to know that before they book flights.
//   4. Nothing offers drone filming. Egypt restricts it and the reported
//      penalty is equipment seizure.
//   5. The location note is the shared constant on every experience, so the
//      sentence that separates a hotel rooftop from the archaeological complex
//      cannot drift on one page while staying right on the others.
//
// Proven by: setting a fixed price while the price question is open (red),
// moving "Cake, flowers or refreshments" into `included` (red), deleting a
// venue dependency (red), adding a drone extra (red), and replacing one
// locationNote with a hand-written sentence (red).
// ---------------------------------------------------------------------------
{
  const PARTNER_WORDS = [
    "cake",
    "flowers",
    "musician",
    "singer",
    "dj ",
    "catering",
    "dining",
    "transport",
    "sound system",
    "generator",
    "hair and makeup",
    "celebrant",
  ];

  for (const exp of flyingDressExperiences) {
    const priceStillOpen = exp.confirm.some((line) => /price/i.test(line));
    if (exp.pricing.kind !== "enquire") {
      ok(
        `${exp.slug} shows a price while its own confirm list still has an open price question — that figure is not confirmed`,
        !priceStillOpen
      );
    }

    for (const line of exp.included) {
      const lower = ` ${line.toLowerCase()} `;
      const offending = PARTNER_WORDS.find((w) => lower.includes(w));
      ok(
        `${exp.slug} lists "${line.slice(0, 48)}" as INCLUDED, but ${offending?.trim()} is supplied by a partner or the venue — included means we deliver it`,
        offending === undefined
      );
    }

    const mentionsRooftop = (exp.intro + exp.included.join(" ") + exp.locationNote)
      .toLowerCase()
      .includes("rooftop");
    if (mentionsRooftop) {
      ok(
        `${exp.slug} talks about a rooftop without carrying the venue dependency, so a customer could plan around a roof nobody has agreed to`,
        exp.dependencies.some((d) => d === VENUE_DEPENDENCY)
      );
    }

    const allProse = [
      exp.intro,
      ...exp.included,
      ...exp.extras.map((x) => x.label),
      ...exp.dependencies,
      ...exp.faqs.map((f) => `${f.question} ${f.answer}`),
    ]
      .join(" ")
      .toLowerCase();
    const offersDrone = exp.extras.some((x) => /drone/i.test(x.label));
    ok(
      `${exp.slug} offers drone filming as an extra — Egypt restricts it and the reported penalty is equipment seizure`,
      !offersDrone
    );
    if (allProse.includes("drone")) {
      ok(
        `${exp.slug} mentions drones without saying we do not fly them`,
        /do not fly drones|do not offer it|restricted/i.test(allProse)
      );
    }

    ok(
      `${exp.slug} has a hand-written location note instead of the shared one, so the hotel-rooftop-not-complex sentence can drift on this page alone`,
      exp.locationNote === ROOFTOP_LOCATION_NOTE
    );
  }

  ok(
    "no experience is in the catalogue at all, so these assertions are checking nothing",
    flyingDressExperiences.length > 0
  );
  for (const exp of flyingDressExperiences) {
    ok(
      `${exp.slug} has a category that is not in experienceCategories, so it renders on no page`,
      experienceCategories.some((c) => c.id === exp.category)
    );
  }
}

// ---------------------------------------------------------------------------
// JSON-LD MUST BE IN A SCRIPT TAG
//
// `fdJsonLd()` returns a STRING. Written as `{fdJsonLd(...)}` in JSX, React
// renders that string as visible page text: a 250-character unbroken line of
// JSON printed at the top of the page, which pushed the layout 252px sideways
// on four new pages at once — and structured data that no crawler can read,
// because it never reached a script tag.
//
// Both halves are silent. The page still renders, the build still passes, and
// the JSON looks right in the source because it IS right; it is simply in the
// wrong place. The correct form is the one every older page already uses:
// `dangerouslySetInnerHTML={{ __html: fdJsonLd(...) }}` on a
// <script type="application/ld+json">.
//
// Proven by changing one page back to the bare form: red, naming the file.
// ---------------------------------------------------------------------------
for (const file of brandTsx) {
  const source = read(file).replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  ok(
    `${file} renders fdJsonLd() bare in JSX — that prints the raw JSON as page text and the structured data never reaches a script tag`,
    !/\{\s*fdJsonLd\(/.test(source)
  );
}

// ---------------------------------------------------------------------------
// A ROUTE MAY NOT MISTAKE sendEmail's RESULT FOR A BOOLEAN
//
// sendEmail resolves to `{ ok, error }`. An object is ALWAYS truthy, so
//
//     const sent = await sendEmail({ ... });
//     if (!sent) return error;          // can never be true
//
// compiles, type-checks, lints clean and silently tells every sender their
// message arrived. The collaboration route shipped exactly this in its first
// draft and returned {"ok":true} on a deployment with no RESEND_API_KEY
// configured, which is the single worst outcome available to a contact form:
// the sender stops chasing and waits for a reply that is never coming.
//
// TypeScript cannot catch it, because truthiness of an object is legal. So
// this does: every `const x = await sendEmail(...)` must be followed by a use
// of `x.ok` somewhere in the same file.
//
// Proven by changing `sentToTeam.ok` back to `sentToTeam`: red, naming the
// file and the variable. Restored: green.
// ---------------------------------------------------------------------------
{
  const apiFiles = execSync("find src/app/api -name 'route.ts' -type f", { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);

  for (const file of apiFiles) {
    const source = read(file).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const match of source.matchAll(/const\s+(\w+)\s*=\s*await\s+sendEmail\(/g)) {
      const name = match[1]!;
      ok(
        `${file} assigns sendEmail() to \`${name}\` and never reads \`${name}.ok\` — sendEmail returns an object, which is always truthy, so a failed send reports success`,
        // `?.ok` counts. treasure-request/route.ts uses optional chaining and
        // is correct; the first version of this pattern flagged it, and a
        // check that fires on correct code is one people stop reading.
        new RegExp(`\\b${name}\\??\\.ok\\b`).test(source)
      );
    }
  }
}

// ---------------------------------------------------------------------------
// NO DASHES, ANYWHERE A VISITOR CAN SEE ONE
//
// The owner's instruction, after seeing the drawn rule that used to trail
// every "See the experience" link: no dashes on this site. That covers three
// different things, which is why a grep for one character is not enough:
//
//   1. the DRAWN ones — `.fd-arrow-link::after` and `.fd-list h3::before`
//      were 1px-tall pseudo-elements, invisible to any search for "—"
//   2. the TYPED ones in copy — em dashes in a sentence
//   3. the RANGES — "30–45 minutes", which is the form they kept coming back
//      in, because a range reads naturally with one and nobody thinks of it
//      as a dash while typing it
//
// Comments are stripped first. This file's own prose is full of em dashes and
// so is every component's, and a check that fires on a comment is a check
// people disable. Proven on all three: restoring the `::after` rule, typing
// an em dash into a heading, and putting "6–10 days" back — each one red,
// naming the file and the line. Restored: green.
// ---------------------------------------------------------------------------
{
  const brandCss = read("src/app/flying-dresses/brand.css");
  ok(
    "brand.css draws the dash after .fd-arrow-link again — the owner asked for no dashes on the site",
    !/\.fd-arrow-link::after\s*\{/.test(brandCss)
  );
  ok(
    "brand.css draws the dash before .fd-list headings again — the owner asked for no dashes on the site",
    !/\.fd-list h3::before\s*\{/.test(brandCss)
  );

  const copyFiles = execSync(
    "find src/app/flying-dresses -name '*.tsx' -type f",
    { encoding: "utf8" }
  )
    .trim()
    .split("\n")
    .filter(Boolean)
    .concat([
      "src/content/flyingDresses.ts",
      "src/content/flyingDressExperiences.ts",
      "src/content/flyingDressCollaborations.ts",
      // Added with the stories section, and it mattered immediately: the
      // first draft of those six articles carried 28 lines of em dashes and
      // this guard was green, because the list above did not name the file
      // they were in. A copy check that does not cover a copy file is the
      // exact shape CLAUDE.md §4 is about.
      "src/content/flyingDressStories.ts",
    ]);

  for (const file of copyFiles) {
    // Block comments become the same number of blank lines so the reported
    // line number still points at the real one.
    const source = read(file)
      .replace(/\/\*[\s\S]*?\*\//g, (m) => "\n".repeat((m.match(/\n/g) ?? []).length))
      .replace(/^\s*\/\/.*$/gm, "");
    source.split("\n").forEach((line, index) => {
      ok(
        `${file}:${index + 1} contains a dash in visible copy: ${line.trim().slice(0, 80)}`,
        !/[—–]/.test(line)
      );
    });
  }
}

// ---------------------------------------------------------------------------
// THE HOME PAGE CARRIES NO PRICE
//
// Asked for directly, and the kind of thing that creeps back one section at a
// time: a figure added to a new panel "just so people know". The prices are
// not gone from the site — /packages and every /experiences/<slug> still
// publish the full figure and the whole extras table — they are gone from the
// page a visitor meets first, where a number arrives before the thing it buys
// has been described.
//
// Proven by putting `<span className="fd-price">${pkg.priceUsd}</span>` back
// into the package panel: red. Removed: green.
// ---------------------------------------------------------------------------
{
  const home = read("src/app/flying-dresses/page.tsx")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  ok(
    "the home page renders a priceUsd figure again — prices belong on /packages and the experience pages, not on the first page a visitor meets",
    !/priceUsd/.test(home)
  );
  ok(
    'the home page uses the .fd-price class again — that class exists to set a price in the display face, so its presence here means a figure is being shown',
    !/className="fd-price"/.test(home)
  );

  // THE FIRST VERSION OF THIS CHECK WAS NOT ENOUGH, and the owner found the
  // gap before it did: the rooftop story's button read "The rooftop shoot:
  // $199" as a HARD-CODED STRING. It referenced neither `priceUsd` nor
  // `.fd-price`, so both tests above passed over it while a price sat on the
  // home page in a filled capsule on a dark panel — about as prominent as a
  // price can be.
  //
  // A figure typed into a sentence is the form this will keep coming back
  // in, because it is the form that does not look like pricing code. So the
  // check is now on the CHARACTER: a dollar followed by a digit, anywhere in
  // the page's comment-stripped source. `${pkg.priceUsd}` is caught by this
  // too, which is the point — one rule, no way around it that is not also
  // obvious to read.
  //
  // Proven by typing "$199" back into that button: red, with the line.
  home.split("\n").forEach((line, index) => {
    ok(
      `the home page shows a price on line ${index + 1}: ${line.trim().slice(0, 80)}`,
      !/\$\s?\d/.test(line)
    );
  });

  // AND THE SAME TEST ON THE VALUES, not just the markup.
  //
  // The source check above passed while the home page displayed "$35" and
  // "$45", because the figures were not in the page at all — they were in
  // the add-on DESCRIPTIONS in content/flyingDresses.ts, which the page
  // rendered in a column. A guard that reads only the file it is suspicious
  // of will keep missing the data that file pulls in.
  //
  // So: every add-on string the home page actually renders is checked for a
  // currency figure. `detail` is deliberately NOT checked — it carries the
  // prices on purpose, for /packages — which is exactly why the home page
  // must not be the thing that renders it.
  ok(
    "the home page renders addOn.detail, which carries the prices — it should render addOn.homeNote",
    !/addOn\.detail/.test(home)
  );
  for (const addOn of addOns) {
    ok(
      `addOn "${addOn.id}" has a price in its homeNote, which the home page displays: ${addOn.homeNote}`,
      !/\$\s?\d/.test(addOn.homeNote)
    );
    ok(`addOn "${addOn.id}" has an empty homeNote`, addOn.homeNote.trim().length > 0);
  }
}

// ---------------------------------------------------------------------------
// A CATEGORY OF ONE MAY NOT PRINT ITS HEADING TWICE
//
// The category page sets the category's title as the h1 and its intro as the
// lede. ExperienceDetail then set the experience's title and intro directly
// underneath. For a category holding exactly one experience those two pairs
// are the same sentence written twice, which on /celebrations/maternity-and-
// family rendered as "Maternity and family portraits" twice in one viewport
// with near-identical paragraphs under each. The owner reported it as a
// duplication bug, which is exactly what it looked like.
//
// Proven by dropping the `headless` prop from the celebrations page: red.
// Restored: green.
// ---------------------------------------------------------------------------
for (const section of ["celebrations", "creative"]) {
  const file = `src/app/flying-dresses/${section}/[slug]/page.tsx`;
  const source = read(file);
  ok(
    `${file} renders ExperienceDetail without \`headless\` — a category holding one experience would print its title and intro twice`,
    /headless=\{experiences\.length === 1\}/.test(source)
  );
}

// ---------------------------------------------------------------------------
// EVERY GENUINE SERVICE IS REACHABLE FROM THE HOME PAGE
//
// The home page linked to the two hub pages and to none of the eight
// experiences behind them, so half the catalogue was two clicks deep behind a
// one-word label a visitor had to guess the meaning of. Nothing was broken,
// which is why nothing reported it: the pages existed, they were in the
// sitemap, and they were invisible to the page that gets the traffic.
//
// This is the kind of gap that reopens every time something is added to the
// catalogue, because adding a category and adding it to the home page are two
// separate edits and only one of them is obviously required. So the check
// reads the catalogue and the home page's source and insists they agree.
//
// Proven by deleting one category's card loop from the home page: red, naming
// the category. Restored: green.
// ---------------------------------------------------------------------------
{
  const home = read("src/app/flying-dresses/page.tsx");
  // The cards are rendered from `experienceCategories`, so what has to be
  // true is that the page iterates it — a hard-coded subset would pass a
  // link-by-link test while silently dropping whatever was added last.
  ok(
    "the home page no longer renders the experience catalogue, so the celebration and creative experiences are two clicks deep behind a hub label",
    /experienceCategories\.map\(/.test(home)
  );
  ok(
    "the home page imports experienceCategories but never links each one to its own page",
    /\$\{category\.section\}\/\$\{category\.slug\}/.test(home)
  );

  for (const service of rentalServices) {
    ok(
      `the home page does not link the hire service "${service.slug}"`,
      home.includes("rentalServices.map(") || home.includes(service.slug)
    );
  }
}

// ---------------------------------------------------------------------------
// A PUBLISHED URL NEVER CARRIES THE /flying-dresses SEGMENT
//
// The app serves its pages at /flying-dresses/*, and every internal link uses
// that path because it works on every host. But the brand domain is attached
// now, and on it the short form resolves too — so the same page has two
// working URLs and only one of them should ever be PUBLISHED.
//
// Canonicals, Open Graph urls, JSON-LD and the sitemap all go through
// fdUrl(). This checks that fdUrl is the only thing that builds a public URL,
// and that it does not simply concatenate fdPath() — which is what it used to
// do, and what would silently restore the long form.
//
// Getting this wrong is not a cosmetic fault. A sitemap listing one URL while
// the page canonicalises to another is a conflict the crawler resolves by
// discarding one of them, and CLAUDE.md records that this project has already
// had one duplicate-canonical incident.
//
// Proven by restoring `return `${fdSiteUrl}${fdPath(path)}`;`: red.
// ---------------------------------------------------------------------------
{
  const seo = read("src/app/flying-dresses/_lib/seo.ts");
  ok(
    "fdUrl() builds the absolute URL from fdPath(), which puts /flying-dresses back into every canonical and sitemap entry",
    !/return\s*`\$\{fdSiteUrl\}\$\{fdPath\(/.test(seo)
  );

  // And nothing else may assemble one by hand.
  const brandFiles = execSync("find src/app/flying-dresses -name '*.ts' -o -name '*.tsx'", {
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  for (const file of brandFiles) {
    const source = read(file)
      .replace(/\/\*[\s\S]*?\*\//g, (m) => "\n".repeat((m.match(/\n/g) ?? []).length))
      .replace(/^\s*\/\/.*$/gm, "");
    source.split("\n").forEach((line, index) => {
      ok(
        `${file}:${index + 1} builds a public URL with the /flying-dresses segment in it — use fdUrl(): ${line.trim().slice(0, 70)}`,
        !/https?:\/\/[^"'`\s]*\/flying-dresses/.test(line)
      );
    });
  }
}

// ---------------------------------------------------------------------------
// ANALYTICS MAY NOT CARRY PERSONAL DATA, AND MAY NOT COUNT TWICE
//
// Two failures, both of which produce a site that looks fine.
//
// 1. PII. Google's terms forbid sending names, email addresses and phone
//    numbers, and an account found carrying them can be purged — taking the
//    history with it. The enquiry form sits one line away from `track()` and
//    holds exactly those variables, so passing one is a single careless
//    autocomplete away.
//
// 2. DOUBLE COUNTING. GA4 sends its own page_view the moment `config` runs.
//    If that is left on while the app also sends one per route change, every
//    landing page is counted twice and every derived figure — bounce rate,
//    conversion rate, cost per enquiry — is wrong in a direction nobody
//    notices. The first version of Analytics.tsx did double-count; a browser
//    test caught it, and this keeps it caught.
//
// Proven on both: passing `email` into the generate_lead call, and deleting
// `send_page_view: false`. Each one red. Restored: green.
// ---------------------------------------------------------------------------
{
  // COMMENTS STRIPPED FIRST, and this is not a precaution — the first
  // version of this check read the raw file and passed while the code was
  // broken, because the doc comment at the top of Analytics.tsx explains
  // `send_page_view: false` in prose. Deleting the real setting left the
  // sentence describing it, and the check went on agreeing with itself.
  //
  // CLAUDE.md records this exact failure happening before in this project.
  // It happened again here, in a check written by someone who had just read
  // that warning, which is the best argument there is for stripping comments
  // by default rather than when it occurs to you.
  const analyticsComponent = read("src/app/flying-dresses/_components/Analytics.tsx")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  ok(
    "Analytics.tsx no longer disables GA4's automatic page_view (`send_page_view: false`) while also sending its own — every landing page would be counted twice",
    /send_page_view:\s*false/.test(analyticsComponent)
  );

  const PII = ["name", "email", "phone", "message", "hotel", "notes"];
  const brandFiles = execSync(
    "grep -rl 'track(' src/app/flying-dresses --include='*.tsx' --include='*.ts' || true",
    { encoding: "utf8" }
  )
    .trim()
    .split("\n")
    .filter(Boolean);

  for (const file of brandFiles) {
    const source = read(file)
      .replace(/\/\*[\s\S]*?\*\//g, (m) => "\n".repeat((m.match(/\n/g) ?? []).length))
      .replace(/^\s*\/\/.*$/gm, "");
    // Each track(...) call's argument text, up to the closing brace.
    for (const match of source.matchAll(/\btrack\(\s*"[^"]*"\s*,\s*\{([\s\S]*?)\}\s*\)/g)) {
      // String LITERALS are stripped first. `method: "email"` is a label for
      // which button was pressed, not an address — and a check that fires on
      // correct code is a check people switch off. What must not appear is
      // the IDENTIFIER: a variable called email, holding one.
      const args = (match[1] ?? "").replace(/"[^"]*"|'[^']*'|`[^`]*`/g, '""');
      for (const field of PII) {
        ok(
          `${file} sends \`${field}\` to analytics — personal data must never leave in an event parameter`,
          !new RegExp(`(^|[^\\w.])${field}\\b`).test(args)
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// THE QUAD BIKES DO NOT COME BACK
//
// /photos/pexels-20189345.jpg is a row of hired ATVs parked under sun
// umbrellas on a beach. It sat in the `saharaDunes` slot, under the alt text
// "Sahara sand dunes at golden hour outside Cairo", and it was the
// photograph illustrating the Sand Dunes photoshoot in three places: the
// home page, /experiences, and the shoot's own page.
//
// Nothing caught it because every check that touched it was a check about
// STRUCTURE — does the file exist, does the slot have alt text, is the alt
// text non-empty. All true. No check can read a photograph and say "that is
// not a dune", which is the real lesson: the structural checks in this file
// prove that a slot is wired up, never that it shows what it says.
//
// So this names the file. It is the one fault of its kind we have actually
// found, and naming it is cheap.
//
// Proven by pointing saharaDunes back at it: red.
// ---------------------------------------------------------------------------
{
  const brandFiles = execSync(
    "find src/app/flying-dresses src/content/flyingDresses.ts -type f \\( -name '*.ts' -o -name '*.tsx' \\)",
    { encoding: "utf8" }
  )
    .trim()
    .split("\n")
    .filter(Boolean);

  for (const file of brandFiles) {
    // Comments stripped, for the third time in this file and for the same
    // reason each time: the note in assets.ts explaining WHY that photograph
    // was removed names the file, and the first version of this check went
    // red on its own explanation.
    const source = read(file)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    ok(
      `${file} references pexels-20189345.jpg — that photograph is a row of parked quad bikes, not sand dunes`,
      !source.includes("pexels-20189345")
    );
  }
}

// ---------------------------------------------------------------------------
// THE STORIES.
//
// A content section fails differently from a product page. Nothing crashes; an
// article simply ends up unfindable, or duplicating one the owner already
// publishes on their OTHER domain, or quoting a price nobody confirmed. All
// three are invisible from the page itself, which is why they are here.
//
// Each assertion below was proven by breaking the thing it guards and watching
// it go red — the notes say what was broken.
// ---------------------------------------------------------------------------
{
  // The <title> budget. fdMetadata renders `${seoTitle} | ${brand.name}`, and
  // a result list shows roughly 60 characters, so the brand suffix is a fixed
  // tax on every one of these. Measured rather than assumed: the suffix length
  // is read from `brand.name` so renaming the brand moves the budget.
  const SUFFIX = ` | ${brand.name}`.length;
  const TITLE_MAX = 60;

  // Proven by lengthening one seoTitle past the budget: red.
  //
  // liveStories(), not every entry. A researched brief is deliberately a stub
  // with a placeholder section: it has no URL, no sitemap entry and no card on
  // the index, so holding it to the word floor a published reference article
  // owes a reader would mean the pipeline could not hold work in progress at
  // all, which is the whole point of StoryStatus.
  for (const story of liveStories()) {
    const rendered = story.seoTitle.length + SUFFIX;
    ok(
      `story ${story.slug}: <title> renders ${rendered} chars with the brand suffix, past the ${TITLE_MAX} a result list shows`,
      rendered <= TITLE_MAX
    );
    // Proven by trimming one description to 90 characters: red.
    ok(
      `story ${story.slug}: metaDescription is ${story.metaDescription.length} chars, outside 110-160`,
      story.metaDescription.length >= 110 && story.metaDescription.length <= 160
    );
    // Not an editorial judgement — a floor. Under this, an article is a
    // stub competing with the commercial pages for the same query.
    // Proven by deleting four sections from one article: red.
    const words = storyWordCount(story);
    ok(`story ${story.slug}: ${words} words, thin for a reference article`, words >= 600);

    ok(
      `story ${story.slug}: cluster "${story.cluster}" is not in storyClusters`,
      storyClusters.some((c) => c.id === story.cluster)
    );

    // `basis` has to mean something in both directions. A cited article with
    // no sources is the failure this catches; a first-party article WITH
    // sources is mislabelled, and the page would then render a "where this
    // came from" block under prose claiming to need none.
    // Proven by flipping one article's basis in each direction: red both ways.
    if (story.basis === "cited") {
      ok(
        `story ${story.slug}: basis is "cited" and it has no sources`,
        (story.sources ?? []).length > 0
      );
      for (const source of story.sources ?? []) {
        ok(
          `story ${story.slug}: source ${source.url} has no accessed date or no "supports" note`,
          Boolean(source.accessed) && Boolean(source.supports)
        );
        ok(
          `story ${story.slug}: source ${source.url} is not an absolute http(s) URL`,
          /^https?:\/\//.test(source.url)
        );
      }
    } else {
      ok(
        `story ${story.slug}: basis is "first-party" but it carries sources — one of the two is wrong`,
        (story.sources ?? []).length === 0
      );
    }
  }

  // Unique slugs. Two articles on one URL is one article.
  const slugs = flyingDressStories.map((s) => s.slug);
  ok("story slugs are not unique", new Set(slugs).size === slugs.length);

  // -------------------------------------------------------------------------
  // THE CANNIBALISATION GUARD, which is the reason this block exists.
  //
  // The owner's other site, egypteyetravel.com, already publishes seven
  // articles about flying-dress photoshoots, including a pillar guide of over
  // twenty thousand characters. Writing any of those again on this domain
  // would split one business's own signal across two hosts, one of which has
  // years of history and one of which had its DNS pointed this month.
  //
  // This does NOT read the curated list below and trust it. It reads the
  // travel site's content file and fails on any slug that appears in both,
  // so a story added to EITHER domain cannot create a duplicate quietly.
  //
  // Proven by renaming one story to `what-to-wear-flying-dress-photoshoot`,
  // which is a real slug on the travel site: red.
  // -------------------------------------------------------------------------
  // THE WHOLE CORPUS, not stories.ts alone. The travel site's articles are
  // split across stories.ts and src/content/storyBatches/*, and reading only
  // the first reported `abby-zoobi-midnight-flying-dress-booking` as missing
  // when it is in batch16.ts. A guard that reads half the data answers a
  // different question from the one it claims to.
  const travelStoryFiles = [
    "src/content/stories.ts",
    "src/content/retiredStories.ts",
    "src/content/redirectedStories.ts",
    ...readdirSync("src/content/storyBatches")
      .filter((f) => f.endsWith(".ts"))
      .map((f) => `src/content/storyBatches/${f}`),
  ].filter((f) => existsSync(f));
  const travelStories = travelStoryFiles.map(read).join("\n");
  for (const slug of slugs) {
    ok(
      `story ${slug} also exists on egypteyetravel.com (src/content/stories.ts) — one topic, two domains, split signal`,
      !travelStories.includes(`"${slug}"`)
    );
  }

  // And the other direction: the recorded list of the travel site's
  // flying-dress articles has to still be true, or the comment explaining why
  // this section avoids those topics is describing a site that changed.
  // Proven by adding a made-up slug to the constant: red.
  for (const slug of EGYPT_EYE_FLYING_DRESS_STORIES) {
    ok(
      `EGYPT_EYE_FLYING_DRESS_STORIES names "${slug}", which is no longer in src/content/stories.ts`,
      travelStories.includes(`"${slug}"`)
    );
  }

  // -------------------------------------------------------------------------
  // Internal links have to land somewhere. A "related" rail is the one place
  // a path is typed by hand rather than derived, so it is the one place a
  // renamed category produces a 404 nobody clicks in development.
  //
  // Proven by pointing one related link at /celebrations/proposals, which is
  // the category ID and not its slug: red.
  // -------------------------------------------------------------------------
  const validPaths = new Set<string>([
    "",
    "/experiences",
    "/celebrations",
    "/creative",
    "/rentals",
    "/packages",
    "/wardrobe",
    "/faq",
    "/about",
    "/enquire",
    "/collaborate",
    "/stories",
    ...packages.map((p) => `/experiences/${p.slug}`),
    ...rentalServices.map((r) => `/rentals/${r.slug}`),
    ...experienceCategories.map((c) => `/${c.section}/${c.slug}`),
    ...slugs.map((slug) => `/stories/${slug}`),
  ]);

  for (const story of flyingDressStories) {
    for (const link of story.related) {
      ok(
        `story ${story.slug}: related link "${link.path}" is not a route this site serves`,
        validPaths.has(link.path)
      );
      ok(`story ${story.slug}: related link "${link.path}" points at itself`, link.path !== `/stories/${story.slug}`);
    }
  }

  // -------------------------------------------------------------------------
  // NO PRICE AN ARTICLE INVENTED, AND NO PRICE AN ARTICLE HAS OUTLIVED.
  //
  // Prose is where a figure gets rounded, remembered or guessed. Only the
  // confirmed numbers — the photoshoot prices and the add-ons that already
  // carry one — may appear as a dollar amount in a story.
  //
  // The second half of that heading is the half that bites later. Every
  // figure in the cost article is also a field in content/flyingDresses.ts,
  // which the owner edits. Change a package price and the article goes on
  // confidently quoting the old one, in the one piece whose entire value is
  // that its numbers are real, and nothing about the rendered page looks
  // wrong. CLAUDE.md §5 is about money having one authority; this is what
  // that means for prose.
  //
  // THE ONE EXCEPTION IS SOMEBODY ELSE'S PRICE. The cost article compares our
  // figures to what else was being sold at Giza, which it cannot do without
  // naming those figures, and they are not ours to keep in sync. So they are
  // listed here one by one rather than waved through by a range, and a story
  // may only use one if it is `basis: "cited"` and carries sources — which
  // ties the exception to the evidence instead of to a promise.
  //
  // Proven by writing "$250" into one paragraph (red), by changing a package
  // price in content and leaving the article alone (red), and by moving a
  // market figure into a first-party article (red).
  // -------------------------------------------------------------------------
  const confirmedPrices = new Set<number>([
    ...packages.map((p) => p.priceUsd).filter((v): v is number => typeof v === "number"),
    ...addOns.map((a) => a.priceUsd).filter((v): v is number => typeof v === "number"),
  ]);

  /** Competitor figures researched on 2026-10-25, each supported by a source on the article. */
  const RESEARCHED_MARKET_PRICES = new Map<number, string>([
    [85, "Tripadvisor: pyramid photo sessions without a flying dress, listed from about $85"],
    [180, "Tripadvisor: one-hour private flying-dress session, listed from $180"],
    [189, "Tripadvisor: four-hour private flying-dress session, listed from $189"],
    [450, "Arabian Moments: rooftop flying-dress sessions advertised from $450"],
    [500, "Tinggly: pyramids rooftop flying-dress package listed at $500"],
  ]);

  for (const story of flyingDressStories) {
    const prose = [
      story.title,
      story.excerpt,
      story.metaDescription,
      ...story.sections.flatMap((s) => [s.heading, ...s.body, ...(s.list ?? [])]),
      ...story.faqs.flatMap((f) => [f.question, f.answer]),
    ].join(" ");

    for (const match of prose.matchAll(/\$(\d(?:[\d,]*\d)?)/g)) {
      const value = Number(match[1].replace(/,/g, ""));
      if (confirmedPrices.has(value)) continue;
      const market = RESEARCHED_MARKET_PRICES.get(value);
      ok(
        `story ${story.slug} states $${match[1]}, which is neither a price in the catalogue nor a ` +
          "researched market figure. If the catalogue changed, the article has to change with it.",
        market !== undefined
      );
      if (market === undefined) continue;
      ok(
        `story ${story.slug} quotes another operator's $${match[1]} (${market}) but is not a cited ` +
          "article with sources. A competitor's figure without the source that supports it is our " +
          "claim, not theirs.",
        story.basis === "cited" && (story.sources ?? []).length > 0
      );
    }
  }

  // -------------------------------------------------------------------------
  // REACHABLE AND CRAWLABLE. This is the fault pattern named in
  // scripts/audit-service-pages.mts: content that is owned, valid, and never
  // reaches the browser. A story nobody links to and no sitemap lists is a
  // file, not a page.
  //
  // Proven by removing the nav entry, and separately by removing the sitemap
  // mapping: red each time.
  // -------------------------------------------------------------------------
  // NOT the main nav, deliberately, and this is the interesting half.
  //
  // The obvious guard here was "the header links to /stories". It was written,
  // it passed, and the header was wrong: Chromium at the 72rem breakpoint
  // showed a seventh nav label squeezing the owner's wordmark to ZERO pixels,
  // and to 97px at 1280. The flex item that gives is the logo, so the bar
  // never overflows and nothing in any offline check can see it. That is the
  // narrow menu bar the owner already reported once, arriving by a new route.
  //
  // So the constraint is the item ceiling, and the section is reached from the
  // home page and the footer instead.
  //
  // Proven by adding a seventh nav entry: red.
  ok(
    `the main nav has ${nav.length} items; six is what fits at 72rem before the wordmark is squeezed (see NAV_MAX_ITEMS)`,
    nav.length <= NAV_MAX_ITEMS
  );

  // Reachable without typing the URL. Two routes in, because one of them is
  // the footer, which is where links go to be ignored.
  // Proven by removing the home page section: red.
  const homeSource = read("src/app/flying-dresses/page.tsx");
  ok(
    "the home page does not link to /stories — the footer would be the only way in",
    homeSource.includes('fdPath("/stories")')
  );

  const sitemapSource = read("src/app/flying-dresses/sitemap.xml/route.ts");
  ok(
    "the sitemap does not list /stories",
    sitemapSource.includes('path: "/stories"')
  );
  ok(
    "the sitemap does not map over the stories, so new articles would never be submitted. It must " +
      "map liveStories(), which is also what keeps a draft out of it.",
    sitemapSource.includes("liveStories().map")
  );

  const footerSource = read("src/app/flying-dresses/_components/Footer.tsx");
  ok("the footer has no Stories link", footerSource.includes('fdPath("/stories")'));
}

// ---------------------------------------------------------------------------
// THE PICTURE HAS TO BE OF THE THING.
//
// Three faults of one shape have now been found on this brand, all of them
// reported by the owner rather than by any check:
//
//   1. the dunes card showed hired quad bikes
//   2. the home page rail showed colour swatches for twelve photographed
//      dresses
//   3. the Fayoum card showed a traveller sitting in an ochre archway, and
//      the three photoshoot pages showed paint chips
//
// None of them is a crash, a broken link or a missing file. Every one renders
// a page that looks finished and sells the wrong thing. These guards are the
// structural half of that problem: they cannot tell you a photograph is good,
// only that a page is not showing a flat colour when a photograph exists, and
// not showing the archway on a panel about the lakes.
//
// Proven by reverting each one: red.
// ---------------------------------------------------------------------------
{
  // A swatch is the correct fallback for an unphotographed garment and the
  // wrong default for a photographed one. Every dress currently has a
  // photograph, so any page that maps the collection into a flat `dress.hex`
  // background WITHOUT consulting dressPhotos is showing paint chips.
  //
  // Proven by deleting the dressPhotos lookup from the experience page: red.
  const everyDressPhotographed = dresses.every((d) => Boolean(dressPhotos[d.id]));
  ok(
    "not every dress has a photograph any more — the swatch guard below assumes they all do",
    everyDressPhotographed
  );

  if (everyDressPhotographed) {
    const brandPages = execSync("find src/app/flying-dresses -name '*.tsx' -type f", {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);

    for (const file of brandPages) {
      const source = read(file)
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
      // Only a file that actually paints a swatch from the collection.
      if (!/background:\s*dress\.hex/.test(source)) continue;
      ok(
        `${file} paints dress.hex as a tile background and never reads dressPhotos — twelve photographs exist and this page is showing colour rectangles`,
        source.includes("dressPhotos[")
      );
    }
  }

  // The Fayoum panels are about the lakes and the white dunes. The frame that
  // used to sit there was architecture, with no dress in it.
  //
  // Proven by pointing fayoumLake back at wandee-travel-fayoum.jpg: red.
  // `src` is nullable on an ImageSlot: an empty slot has none. Read it once,
  // and treat "no photograph at all" as its own failure rather than letting
  // an optional chain quietly satisfy both assertions.
  const fayoumSrc = location.fayoumLake.src ?? "";
  ok("the Fayoum slot has no photograph at all", fayoumSrc !== "");
  ok(
    "the Fayoum slot points at the Wandee archway again — that frame is a building, and the panel it illustrates sells a landscape with water in it",
    !fayoumSrc.includes("wandee-travel-fayoum")
  );
  ok(
    "the Fayoum slot no longer points at a Fayoum photograph",
    fayoumSrc.includes("fayoum")
  );

  // THE PHONE HERO.
  //
  // The film is 1440x960 and the phone hero box was 390x776, so object-fit:
  // cover threw away two thirds of every frame and upscaled the rest 3.6x.
  // The fix is a layout, not a bitrate: below 48rem the media becomes a
  // landscape band with the copy beneath it. If that media query is ever
  // removed the hero silently goes back to showing a third of the picture,
  // and nothing else in this repository would notice.
  //
  // IT USED TO PIN THE BAND TO EXACTLY 3/2, THE FILM'S OWN SHAPE. That was
  // the right band the day it was written and the wrong test: the owner then
  // asked for the film to dominate the phone screen, where the band was about
  // a quarter of it, and 4/3 buys a third more height for a 5.5% crop off
  // each side. The guard failed a change that moved in the direction it
  // exists to protect.
  //
  // So it checks the band is still landscape and still close to the film's
  // shape. 4/3 (1.333) is the floor: tighter than that and the crop starts
  // taking the subject rather than the sand beside it, and by 1:1 we are back
  // to throwing away a third of every frame.
  //
  // Proven by deleting the block from brand.css, and by setting the band to
  // 9/16: both red.
  {
    const css = read("src/app/flying-dresses/brand.css");
    const bandMatch = css.match(
      /@media\s*\(max-width:\s*47\.99rem\)\s*\{[\s\S]*?\.fd-hero-media\s*\{[\s\S]*?aspect-ratio:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/
    );
    const bandRatio = bandMatch ? Number(bandMatch[1]) / Number(bandMatch[2]) : 0;
    const phoneHero = bandRatio >= 4 / 3 - 0.001;
    ok(
      `brand.css no longer gives .fd-hero-media a landscape band of at least 4/3 below 48rem (found ${bandRatio || "none"}), ` +
        "so the phone hero is back to cropping the film",
      phoneHero
    );
  }
}

// ---------------------------------------------------------------------------
// THE PHOTO RIBBON.
//
// Two rows of the agency's own frames, moving in opposite directions, asked
// for directly: "photos animated slider with variety of photos moving".
//
// Three things about it can break silently, and all three were found by
// building it rather than by imagining it.
//
// Proven by breaking each: red.
// ---------------------------------------------------------------------------
{
  // The ribbon's whole claim is "every one ours". A frame with no file behind
  // it renders as a gap in a moving row, which is worse than a short row.
  // Proven by pointing one marquee entry at a missing file: red.
  for (const frame of [...marqueePlaces, ...marqueeColours]) {
    ok(
      `the photo ribbon references ${frame.src}, which is not in public/`,
      existsSync(`public${frame.src}`)
    );
    ok(`the photo ribbon frame ${frame.src} has no alt text`, frame.alt.trim().length > 0);
  }

  // Two rows of three photographs is not a wall of work, it is a gap with
  // pictures in it. The loop duplicates the strip, so a short row also makes
  // the repeat obvious within one screen width.
  // Proven by truncating marqueePlaces to two entries: red.
  ok(
    `the photo ribbon's first row has ${marqueePlaces.length} frames; under 6 the loop repeats inside one screen`,
    marqueePlaces.length >= 6
  );
  ok(
    `the photo ribbon's colour row has ${marqueeColours.length} frames but the collection has ${dresses.length}`,
    marqueeColours.length === dresses.length
  );

  const css = read("src/app/flying-dresses/brand.css");

  // THE ONE THAT MATTERS.
  //
  // The global reduced-motion block sets animation-duration: 1ms and
  // iteration-count: 1 on everything. For a fade that is correct: it lands on
  // its end state, which is the visible one. For an INFINITE MARQUEE it is
  // exactly wrong — the end state is translateX(-50%), so the blanket rule
  // does not stop the ribbon, it fast-forwards it and parks it half a strip
  // to the left with the first frames off the edge. A visitor who asked for
  // less motion would get fewer photographs.
  //
  // Verified in Chromium with reducedMotion: "reduce": animationName none,
  // transform none, first cell at x=0 inside its ribbon, overflow-x auto.
  //
  // Proven by deleting the rule: red.
  ok(
    "brand.css does not park .fd-ribbon-track under reduced motion — the blanket 1ms rule would fast-forward the marquee to translateX(-50%) and hide the first frames",
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.fd-ribbon-track\s*\{[\s\S]*?transform:\s*none/.test(css)
  );

  // AN INLINE LINK WITH NO COLOUR IS BROWSER-DEFAULT BLUE.
  //
  // .fd-inline-link sized its tap target and set no colour, so every link in
  // running prose on this site rendered #0000EE, and purple once visited, on
  // a palette of ink, ivory, sand and one red. It was on the home page, under
  // the ribbon and on every source citation in the stories section.
  //
  // Proven by removing the colour declaration: red.
  //
  // THE FIRST VERSION OF THIS ASSERTION PASSED ON THE BROKEN CODE.
  // It was /\.fd-inline-link\s*\{[^}]*\bcolor:/ — and `text-decoration-color`
  // ENDS IN `color:` with a hyphen before it, which \b treats as a word
  // boundary. So the rule could lose its `color` declaration entirely and the
  // guard stayed green, which is the exact failure CLAUDE.md §4 is about and
  // the reason every assertion here gets broken on purpose before it counts.
  //
  // This one reads the declarations instead of grepping the block.
  {
    const body = css.match(/\.fd-inline-link\s*\{([^}]*)\}/)?.[1] ?? "";
    const declaresColour = body
      .split(";")
      .map((d) => d.trim())
      .some((d) => /^color\s*:/.test(d));
    ok(
      ".fd-inline-link declares no colour — prose links fall back to browser-default blue",
      declaresColour
    );
  }

  // And the ribbon has to actually be on the page.
  // Proven by removing the component from page.tsx: red.
  const homeSource = read("src/app/flying-dresses/page.tsx");
  ok("the home page no longer renders the photo ribbon", homeSource.includes("<PhotoRibbon"));
}

// ---------------------------------------------------------------------------
// EVERY DRESS IS REACHABLE THROUGH THE FILTERS, NOT JUST THROUGH "EVERYTHING".
//
// The wardrobe's colour families are a hand-written list of ids, chosen over a
// hue calculation so that nudging a swatch cannot silently re-sort the filter.
// The cost of that choice is that a new dress joins no family: Hot Pink
// shipped reachable only under "Everything", and under any of the five colour
// filters the collection quietly had twelve dresses again.
//
// Proven by removing "hot-pink" from the list: red.
// ---------------------------------------------------------------------------
{
  const wardrobeSource = read("src/app/flying-dresses/_components/Wardrobe.tsx");
  const families = wardrobeSource.slice(
    wardrobeSource.indexOf("const COLOUR_FAMILIES"),
    wardrobeSource.indexOf("type Filter")
  );
  const filed = new Map<string, number>();
  for (const id of families.matchAll(/"([a-z0-9-]+)"/g)) {
    const key = id[1]!;
    filed.set(key, (filed.get(key) ?? 0) + 1);
  }
  for (const dress of FLYING_DRESS_COLLECTION) {
    const count = filed.get(dress.id) ?? 0;
    ok(
      `${dress.name} is reachable under a colour filter, not only under "Everything"`,
      count > 0
    );
    ok(`${dress.name} is filed under exactly one colour family (found ${count})`, count <= 1);
  }
}

// ---------------------------------------------------------------------------
// THE STUDIO: DOES AN EDIT ACTUALLY REACH THE PAGE, AND DOES PUBLISHING THE
// SEED CHANGE ANYTHING?
//
// This brand just became editable in Sanity. Two things can go wrong, neither
// of them loudly:
//
//   1. The merge rules are subtly wrong — a `||` where `??` was needed turns a
//      real 0 into last week's value, an `arr()` that collapses [] onto the
//      fallback resurrects content an editor deliberately deleted.
//   2. The SEED is wrong. The first documents were generated from the content
//      files so that publishing them is a no-op. If that is not true, the day
//      the owner clicks Publish the live site changes in ways nobody intended.
//
// The fixture is the EXACT payload the live GROQ projection returned from the
// production dataset, captured verbatim rather than hand-written, so this
// tests the real contract and not a guess about it.
//
// Proven by changing one value in the fixture: red.
// ---------------------------------------------------------------------------
{
  const fixture = JSON.parse(read("scripts/fixtures/fd-settings-from-sanity.json")) as FdSettingsDoc;
  const merged = mergeSettings(fixture);

  // Publishing the seed must be invisible.
  ok(
    `settings seed would change the business name on publish: "${merged.brand.name}" vs "${brand.name}"`,
    merged.brand.name === brand.name
  );
  ok("settings seed would change the hero headline on publish", merged.brand.heroHeadline === brand.heroHeadline);
  ok("settings seed would change the hero support line on publish", merged.brand.heroSupport === brand.heroSupport);
  ok("settings seed would change the description on publish", merged.brand.description === brand.description);
  ok("settings seed would change the email on publish", merged.contact.email === contact.email);
  ok(
    `settings seed would change the WhatsApp number on publish: ${merged.contact.whatsappNumber} vs ${contact.whatsappNumber}`,
    merged.contact.whatsappNumber === contact.whatsappNumber
  );
  ok(
    `settings seed would change the menu on publish (${merged.nav.length} items vs ${nav.length})`,
    merged.nav.length === nav.length &&
      merged.nav.every((n, i) => n.label === nav[i]!.label && n.href === nav[i]!.href)
  );
  ok(
    "settings seed would change what every photoshoot includes on publish",
    merged.packageIncludes.length === packageIncludes.length &&
      merged.packageIncludes.every((inc, i) => inc.title === packageIncludes[i]!.title)
  );
  ok(
    "settings seed would publish a cancellation policy nobody has written",
    merged.cancellation.published === false
  );

  // THE FALLBACK. No document means the content file, unchanged.
  const empty = mergeSettings(null);
  ok("with no Studio document the settings do not fall back to the content file", empty.brand.name === brand.name);
  ok("with no Studio document the menu is lost", empty.nav.length === nav.length);
  ok("with no Studio document the packages are lost", mergePackages(null).length === packages.length);
  // AN EMPTY LIST IS NOT A CLEARED LIST, for documents.
  //
  // The three-case rule above is about a FIELD an editor emptied, which is a
  // real edit worth honouring. "No photoshoot documents exist" is a different
  // statement: it means nobody has created them yet, and a brand showing no
  // products at all is not a state worth rendering faithfully.
  //
  // The first version of this section only tested null, so a merge that
  // treated [] as "the business has no photoshoots" passed. Found by breaking
  // the guard and watching it stay green.
  ok(
    "an empty Studio list empties the site — a brand with no photoshoots is not an edit, it is an unfinished migration",
    mergePackages([]).length === packages.length
  );
  ok("an empty Studio list empties the extras", mergeAddOns([]).length === addOns.length);
  ok("an empty Studio list empties the hire services", mergeRentals([]).length === rentalServices.length);
  ok("with no Studio document the extras are lost", mergeAddOns(null).length === addOns.length);
  ok("with no Studio document the hire services are lost", mergeRentals(null).length === rentalServices.length);

  // THE THREE-CASE ARRAY RULE, which is the one every CMS integration in this
  // repository gets wrong eventually. An editor who empties a list means it.
  // Proven by changing `arr()` to treat [] as missing: red.
  const cleared = mergeSettings({ ...fixture, nav: [], socials: [] });
  ok(
    "emptying the menu in the Studio silently restores the one in the content file — a deliberate edit being overruled",
    cleared.nav.length === 0
  );

  // And null means "Studio never set this", which is not the same thing.
  const unset = mergeSettings({ ...fixture, nav: null });
  ok(
    "a menu the Studio never set should fall back to the content file, not render empty",
    unset.nav.length === nav.length
  );

  // A PRICE OF ZERO IS A PRICE. `??` not `||`: the bug this catches is a
  // genuine edit to 0 being read as "unset" and silently showing the old
  // figure, which is the worst possible failure for a number on a price page.
  // Proven by changing `??` to `||` in mergeAddOns: red.
  const zeroPriced = mergeAddOns([
    {
      addOnId: "light-makeup",
      label: "Light makeup",
      priceUsd: 0,
      priceIsFrom: false,
      homeNote: "x",
      detail: "y",
      order: 10,
    },
  ]);
  ok(
    "an extra priced at 0 in the Studio comes back as something else — a real edit being overruled by a falsy check",
    zeroPriced[0]?.priceUsd === 0
  );
}

// ---------------------------------------------------------------------------
// NO PAGE MAY INTERPOLATE A PACKAGE PRICE DIRECTLY.
//
// `priceUsd` became nullable when the Red Sea yacht arrived: a product the
// October 2026 brief confirms, with a price it deliberately does not. Eleven
// render sites were writing `${pkg.priceUsd}` straight into the markup, and
// every one of them would have printed the string "$null" — no crash, no
// build error, just a price-shaped lie on the page a customer reads to decide
// whether to spend money.
//
// So there is one function, packagePriceLabel(), and this fails if any page
// goes back to the raw field.
//
// Proven by restoring `${pkg.priceUsd}` on the packages page: red.
// ---------------------------------------------------------------------------
{
  const pageFiles = execSync("find src/app/flying-dresses -name '*.tsx' -type f", {
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  for (const file of pageFiles) {
    const source = read(file)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    // `$` immediately before an interpolation of a package price.
    const raw = source.match(/\$\{?\s*(pkg|p|other)\.priceUsd\s*\}?/g) ?? [];
    ok(
      `${file} writes a package price straight into the page (${raw[0] ?? ""}) — a shoot with no price renders "$null". Use packagePriceLabel().`,
      raw.length === 0
    );
  }

  // And the helper has to actually handle it.
  ok(
    "packagePriceLabel() renders a null price as a figure rather than a request",
    packagePriceLabel({ priceUsd: null }) === "Price on request"
  );
  ok(
    "packagePriceLabel() mangles a real price",
    packagePriceLabel({ priceUsd: 199 }) === "$199"
  );
}

// ---------------------------------------------------------------------------
// A photograph in the Studio has to reach the page, and publishing a garment
// must not take a photograph away.
//
// All three assertions below come from one incident. The wardrobe was seeded
// into Sanity, and the merge built its photo map ONLY from documents carrying
// an image — falling back to the local photographs just when there were no
// documents at all. Seventeen garments were published, none with an image, so
// the map went from twelve photographs to zero in a single publish. It did no
// visible damage only because the component was importing the local module
// directly, which was itself the second bug: the Studio's photo field was
// decorative, and an owner uploading a dress photograph would have seen
// nothing change. Fixing either one alone would have broken the page.
// ---------------------------------------------------------------------------
{
  const outfitDocs = [...FLYING_DRESS_COLLECTION, ...MENS_OUTFITS].map((o, i) => ({
    outfitId: o.id,
    name: o.name,
    category: o.category,
    photoUrl: null,
    alt: null,
    hex: o.category === "mens-outfit" ? null : (o.hex ?? null),
    shoot: null,
    order: (i + 1) * 10,
  }));

  // The state the live dataset is actually in: every garment published, none
  // of them photographed in the CMS yet.
  const seeded = mergeWardrobe(outfitDocs);
  ok(
    `publishing the wardrobe keeps every local photograph (${Object.keys(seeded.photos).length} of ${Object.keys(dressPhotos).length})`,
    Object.keys(seeded.photos).sort().join(",") === Object.keys(dressPhotos).sort().join(","),
  );

  // One upload must not cost the others. This is the shape of the bug that
  // the all-or-nothing fallback would have produced on the owner's first edit.
  const oneUploaded = mergeWardrobe(
    outfitDocs.map((d) =>
      d.outfitId === "cherry"
        ? { ...d, photoUrl: "https://cdn.sanity.io/images/x/y/new-cherry.jpg", alt: "A new Cherry frame" }
        : d,
    ),
  );
  ok(
    `photographing one dress in the Studio leaves the other ${FLYING_DRESS_COLLECTION.length - 1} photographed`,
    Object.keys(oneUploaded.photos).length === Object.keys(dressPhotos).length,
  );
  ok(
    "and the uploaded photograph is the one used",
    oneUploaded.photos.cherry?.src === "https://cdn.sanity.io/images/x/y/new-cherry.jpg",
  );
  // A GARMENT NOBODY HAS PHOTOGRAPHED MUST STAY ABSENT, not render blank.
  //
  // This used to point at "saeedy-gawn-1" as the example, which worked for as
  // long as that gawn had no photograph and broke the day it got one. All
  // seventeen garments are photographed now, so there is no real id left to
  // make the point with — and picking the next unphotographed one would just
  // arm the same trap for whoever fills it.
  //
  // So it asks the merge directly, with an id that is not in the wardrobe and
  // never will be. That is the behaviour the assertion was always about.
  const ghost = mergeWardrobe([
    ...outfitDocs,
    {
      outfitId: "not-a-real-garment",
      name: "Not A Real Garment",
      category: "mens-outfit" as const,
      photoUrl: null,
      alt: null,
      hex: null,
      shoot: null,
      order: 9990,
    },
  ]);
  ok(
    "a garment with no photograph anywhere stays absent rather than blank",
    ghost.photos["not-a-real-garment"] === undefined,
  );

  // The component must take the photographs as data. Importing the module's
  // VALUE here is what made the CMS field decorative; importing its TYPE is
  // fine and is what the props are declared with.
  const wardrobeSource = readFileSync("src/app/flying-dresses/_components/Wardrobe.tsx", "utf8");
  const valueImport = /import\s+\{[^}]*\bdressPhotos\b[^}]*\}\s+from\s+"\.\.\/_lib\/dressPhotos"/.test(
    wardrobeSource,
  );
  ok(
    "the wardrobe component takes photographs as a prop rather than importing them",
    !valueImport && /photos:\s*Record<string,\s*DressPhoto>/.test(wardrobeSource),
  );

  // And every page that renders it has to hand them over, or the grid shows
  // nothing at all.
  for (const page of [
    "src/app/flying-dresses/wardrobe/page.tsx",
    "src/app/flying-dresses/rentals/[slug]/page.tsx",
  ]) {
    const source = readFileSync(page, "utf8");
    const renders = /<Wardrobe\b/.test(source);
    ok(
      `${page} passes photos into <Wardrobe>`,
      !renders || /<Wardrobe[^>]*photos=\{photos\}/.test(source),
    );
  }

  // The page must not tell a customer there are no photographs while showing
  // some. Counted from the data, never asserted in prose.
  // COMMENTS STRIPPED, because this guard tripped on the note explaining why
  // the sentence was deleted. The page now carries a paragraph about having
  // once said "the photography for this page has not been shot yet", and a
  // guard that reads prose cannot tell that from the page saying it.
  const wardrobePage = readFileSync("src/app/flying-dresses/wardrobe/page.tsx", "utf8")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  const claimsNoPhotography = /the photography for this page has not been shot yet/.test(wardrobePage);
  ok(
    "the wardrobe page does not claim it has no photographs unless it has none",
    !claimsNoPhotography || /photographed\.length > 0/.test(wardrobePage),
  );
}

// ---------------------------------------------------------------------------
// A PRICED PRODUCT MUST NOT STILL SAY ITS PRICE IS UNPUBLISHED.
//
// The Red Sea yacht shipped as "price on request" and was priced at $399 per
// person by the owner later. The number lives in one field; the sentences that
// said there was no number lived in three others — the meta description, the
// cost FAQ and the confirm list. Changing the field alone would have left the
// page quoting $399 beside copy telling the reader to ask, which is the same
// class of mistake as the wardrobe's "not photographed yet" caption.
// ---------------------------------------------------------------------------
const NO_PRICE_PHRASES = ["price on request", "priced on request", "quoted rather than listed"];
for (const pkg of packages) {
  if (pkg.priceUsd === null) continue;
  const copy = [
    pkg.metaDescription ?? "",
    pkg.intro,
    ...pkg.faqs.flatMap((f) => [f.question, f.answer]),
  ]
    .join(" ")
    .toLowerCase();
  for (const phrase of NO_PRICE_PHRASES) {
    ok(
      `package "${pkg.slug}" costs $${pkg.priceUsd} but its own copy still says "${phrase}"`,
      !copy.includes(phrase)
    );
  }
}

// ---------------------------------------------------------------------------
// A PHONE NUMBER WITH NO COUNTRY CODE CANNOT BE RUNG OR FOUND ON WHATSAPP.
//
// Enquiries were arriving as bare Egyptian numbers ("01285343630"), which the
// desk cannot dial from outside Egypt and WhatsApp cannot resolve at all. The
// field stays optional; what is required is that a number which IS given
// carries its country code.
//
// THIS GUARD USED TO WATCH A REGULAR EXPRESSION IN THIS FORM, and it went red
// the moment that regex was deleted — correctly, and worth recording. The
// hint plus a pattern test has been replaced by a dropdown that cannot be
// skipped and by src/lib/booking/phone.ts, which is now the one authority on
// what a usable number is for both brands. So the assertion moved with the
// mechanism: the form must render the shared field and must carry that
// field's verdict into its own error state. A form that renders PhoneField
// but drops the verdict would submit an unusable number as no number at all,
// which is worse than the bug this all started with, so both halves are
// checked.
// ---------------------------------------------------------------------------
{
  const form = read("src/app/flying-dresses/_components/EnquiryForm.tsx");
  ok(
    "the enquiry form no longer renders the shared country-code field",
    /<PhoneField/.test(form)
  );
  ok(
    "the enquiry form takes the phone field's verdict but never acts on it, so an " +
      "unusable number would submit as no number at all",
    /setPhoneProblem/.test(form) && /next\.phone\s*=\s*phoneProblem/.test(form)
  );
  ok(
    "the phone field stopped being optional, which costs more enquiries than it saves",
    /label="Phone or WhatsApp"[\s\S]{0,400}?Optional/.test(form)
  );
}

// ---------------------------------------------------------------------------
// AN ENQUIRY IS NEVER LOST TO A SENDER THE PROVIDER REFUSES.
//
// Resend rejects any From on a domain it has not verified, so while
// flyingdressesegypt.com is unverified every enquiry failed and the visitor
// was sent to WhatsApp. The desk copy now retries from the platform's verified
// sender. The customer's receipt deliberately does NOT, because writing to a
// customer from the other brand's domain is worse than sending no receipt.
// ---------------------------------------------------------------------------
{
  const route = read("src/app/api/flying-dresses-enquiry/route.ts");
  ok(
    "the enquiry route does not retry the desk copy when the brand sender is refused",
    /sentFromFallbackSender/.test(route) && /let result = await sendEmail/.test(route)
  );
  ok(
    "the customer receipt is not skipped when only the fallback sender worked, so it would come from the wrong brand",
    /if \(sentFromFallbackSender\)[\s\S]{0,260}?return NextResponse\.json\(\{ ok: true \}\)/.test(route)
  );
}

// ---------------------------------------------------------------------------
// ON A PHONE THE COPY COMES FIRST AND THE HEADER STANDS CLEAR.
//
// Asked for directly, after the owner saw the film's darker frames sitting
// behind the header pill. Two things make it true and both are easy to undo
// by accident: the flex order that puts .fd-hero-body ahead of the media in
// the visual order, and the ABSENCE of the negative margin that used to pull
// the band up under the floating header. Put that margin back and the film
// slides under the bar again, which is exactly what was being complained
// about. Measured at 390px: the header ends at 70px and the copy begins at
// about 90.
// ---------------------------------------------------------------------------
{
  const css = read("src/app/flying-dresses/brand.css");
  // There are several media queries at this width; pick the one that actually
  // holds the hero, and stop at the next @media so a later rule cannot satisfy
  // these assertions from outside the block.
  const phoneBlock = (
    css.split(/@media\s*\(max-width:\s*47\.99rem\)\s*\{/).slice(1).find((chunk) =>
      chunk.includes(".fd-hero-media")
    ) ?? ""
  ).split("@media")[0];
  ok(
    "the phone hero block is missing entirely",
    phoneBlock.includes(".fd-hero-media")
  );
  ok(
    "the phone hero no longer puts the copy before the film",
    /\.fd-hero-body\s*\{[^}]*order:\s*1/.test(phoneBlock) &&
      /\.fd-hero-media\s*\{[^}]*order:\s*2/.test(phoneBlock)
  );
  ok(
    "the phone hero pulls the film back under the floating header with a negative margin",
    !/\.fd-hero-media\s*\{[^}]*margin-top:\s*-/.test(phoneBlock)
  );
}

// ---------------------------------------------------------------------------
// THE HERO ASKS THE BROWSER ABOUT THE CODEC THE FILE ACTUALLY IS.
//
// This guard exists because the component asked the wrong question for a
// while. It called canPlayType with 'avc1.42E01E' — Baseline, level 3.0 —
// and then set .src to a file that is High 4.0. A decoder that does Baseline
// but not High 4.0 answered yes, was handed a stream it could not decode, and
// had nowhere to go: the source is assigned directly rather than offered as
// <source> children, so there was no second candidate and no error handler.
// The result is a hero that shows its poster forever on some devices and
// plays perfectly on every device available to test it on.
//
// So the codec string is not hardcoded in this check either. It is read out
// of each file's own avcC box, which is where the profile and level actually
// live, and the component must contain that exact string. Re-encode the hero
// at a different profile and this goes red until the query is updated with
// it.
//
// PROVEN by putting 'avc1.42E01E' back in HeroVideo.tsx: red on both files.
// Proven again by deleting the error listener: red. Then restored.
// ---------------------------------------------------------------------------
{
  const componentRaw = read("src/app/flying-dresses/_components/HeroVideo.tsx");
  // COMMENTS STRIPPED FIRST, and that is not a detail. The first version of
  // this guard passed on the broken component, because the prose above the
  // fix names both codec strings to explain them — so `includes(codec)`
  // matched the explanation while the code underneath still asked for
  // Baseline. CLAUDE.md §4 lists that exact failure mode, and this is the
  // fourth time it has happened in this repository. Only live code counts.
  const component = componentRaw
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

  // ISO/IEC 14496-15: the AVCDecoderConfigurationRecord that follows the
  // 'avcC' box tag is configurationVersion, AVCProfileIndication,
  // profile_compatibility, AVCLevelIndication — the three bytes after the
  // version are exactly the three the codecs= parameter spells in hex.
  const codecOf = (file: string): string | null => {
    const bytes = readFileSync(file);
    const at = bytes.indexOf("avcC", 0, "latin1");
    if (at < 0) return null;
    const hex = [...bytes.subarray(at + 5, at + 8)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `avc1.${hex}`;
  };

  for (const [label, file] of [
    ["the full master", "public/brand/flying-dresses/hero.mp4"],
    ["the phone cut", "public/brand/flying-dresses/hero-small.mp4"],
  ] as const) {
    const codec = existsSync(file) ? codecOf(file) : null;
    ok(`${label} (${file}) is missing or carries no readable avcC box`, codec !== null);
    if (codec) {
      ok(
        `HeroVideo asks the browser about a codec ${label} is not — the file is ${codec}, ` +
          "and no canPlayType call in the component asks about it, so a decoder that refuses " +
          "this profile can be handed it anyway",
        new RegExp(`codecs=\\s*\\\\?["']${codec.replace(".", "\\.")}`).test(component)
      );
    }
  }

  ok(
    "HeroVideo has no error listener, so a source the browser accepts and then fails to " +
      "decode leaves the poster up with no second candidate",
    /addEventListener\(\s*"error"/.test(component)
  );
  ok(
    "HeroVideo no longer falls back to a second source on failure",
    /const\s+queue\s*=/.test(component) && /index\s*\+=\s*1/.test(component)
  );
}

// ---------------------------------------------------------------------------
// THE URGENT ROUTE DIALS THE LIVE NUMBER, NOT A COPY OF IT.
//
// Asked for directly: urgent and last minute enquiries should ring the line
// rather than queue behind the form. The number is the brand's existing one,
// so nothing new was invented; what is new is that one surface puts the call
// ahead of the form.
//
// The guard is about WHICH number it dials. The phone is editable in the
// Studio, and once that document exists Sanity replaces the content file
// wholesale (CLAUDE.md §3). A display string or a tel: href frozen into the
// component would keep dialling a retired number on the one route meant for
// people who cannot afford a second try, and every page would still look
// right. So the component must take the number as a prop and the content
// block must not carry a bare one for it to reach for.
//
// It also must not grow a promise. The owner has stated no opening hours and
// no answering time, and an urgent card is exactly where an invented "we
// always pick up" would be most tempting and most costly.
//
// PROVEN by hardcoding contact.phones[0] inside UrgentCall (red), by dropping
// the phone prop from the enquire page (red), and by adding "24/7" to the
// blurb (red). Then restored.
// ---------------------------------------------------------------------------
{
  const component = read("src/app/flying-dresses/_components/UrgentCall.tsx");
  const code = component
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

  ok(
    "UrgentCall does not take the number as a prop, so it cannot follow a Studio change",
    /phone\s*:\s*\{[^}]*tel/.test(code) && /phone\.tel/.test(code)
  );
  ok(
    "UrgentCall reaches for a number of its own instead of the one it is given",
    !/contact\.phones/.test(code) && !/urgentCall\.(display|tel)\b/.test(code)
  );
  ok(
    "the urgent card is a real tel: link, so it dials without JavaScript",
    /href=\{`tel:\$\{phone\.tel\}`\}/.test(code)
  );

  const page = read("src/app/flying-dresses/enquire/page.tsx");
  ok(
    "the enquire page no longer shows the urgent call route",
    /<UrgentCall/.test(page)
  );
  ok(
    "the enquire page shows the urgent route but not with the live settings number",
    /<UrgentCall\s+phone=\{urgentPhone\}/.test(page) &&
      /contact\.phones\.find\(/.test(page)
  );

  // A failed enquiry is the moment a phone number matters most, and WhatsApp
  // was the only way out of that state. WhatsApp needs an installed, signed-in
  // app; tel: needs neither.
  const form = read("src/app/flying-dresses/_components/EnquiryForm.tsx");
  ok(
    "the enquiry form's failure state offers no phone number, only WhatsApp",
    /tel:\$\{contactPhone\.tel\}/.test(form)
  );

  // No promise anybody has to keep.
  const PROMISES = [
    "24/7",
    "24 hours",
    "always available",
    "always answer",
    "we always pick up",
    "instant reply",
    "immediately",
    "any time of day",
    "round the clock",
  ];
  const copy = [urgentCall.eyebrow, urgentCall.heading, urgentCall.blurb, urgentCall.shortLabel]
    .join(" ")
    .toLowerCase();
  for (const phrase of PROMISES) {
    ok(
      `the urgent call copy promises "${phrase}", which the owner has not stated`,
      !copy.includes(phrase)
    );
  }
}

// ---------------------------------------------------------------------------
// A PACKAGE WITH NOTHING BEHIND IT MUST NOT SAY "RIGHT NOW".
//
// BookingRail has two ways of saying there is no deposit button, and they
// mean opposite things to somebody deciding whether to wait or to write:
//
//   "Online deposits are not open for this date right now"  -> come back
//   "This one is quoted rather than listed"                 -> ask us
//
// It chose between them on `pkg.priceUsd === null`, which was never the real
// question. That was a stand-in for "has no Egypt Eye product behind it",
// true of the Red Sea yacht only while the yacht had no figure. The owner
// gave it $399, the stand-in flipped, and the live page started telling
// customers that deposits on a shoot with no product behind it were shut
// "right now", for a date. Nobody had changed BookingRail.
//
// So this asserts the condition reads the product, never the price. The
// wording is checked too, because the bug was invisible in the diff that
// caused it: nothing in BookingRail changed at all.
//
// PROVEN by restoring `pkg.priceUsd === null`: red. Proven again by swapping
// the two sentences: red. Then restored.
// ---------------------------------------------------------------------------
{
  const rail = read("src/app/flying-dresses/_components/BookingRail.tsx");
  const code = rail
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

  ok(
    "BookingRail decides its no-deposit wording from the package's own price again — " +
      "a package that gains a price but still has no Egypt Eye product behind it will " +
      "tell customers to wait for a button that does not exist",
    !/pkg\.priceUsd\s*===\s*null\s*\n?\s*\?/.test(code)
  );
  ok(
    "BookingRail no longer chooses its no-deposit wording from whether a product exists",
    /\{!product\s*\n?\s*\?/.test(code)
  );
  // And the two sentences must stay the right way round.
  const quoted = code.indexOf("quoted rather than listed");
  const rightNow = code.indexOf("not open for this date right now");
  ok(
    "the no-deposit sentences are the wrong way round: no product must read " +
      "\"quoted rather than listed\", not \"right now\"",
    quoted !== -1 && rightNow !== -1 && quoted < rightNow
  );
}

// ---------------------------------------------------------------------------
// THE ACCESSORIES ARE SHOWN, NOT SOLD, AND NOT RENAMED.
//
// The owner photographed each piece and had it composited onto generated
// models, and states the pieces render identically to the wardrobe and that
// delivering the exact piece shown is theirs. That is their call and it is
// recorded in flyingDressAccessories.ts. What this guards is everything that is
// NOT theirs to assert later by accident:
//
//  1. Every frame must resolve to a file. A gallery of missing images is the
//     one failure that makes the collection look smaller than it is.
//  2. No piece may carry a price. The three hire services carry none by
//     design, and a figure here would be the first.
//  3. The references must stay references. The source names nothing — the
//     filenames are generative titles repeated across categories — so a
//     product name appearing here would be invented, which is CLAUDE.md §7.
//  4. The note saying what is generated must survive, and must still say it.
//     It is one string so it cannot drift between pages; a guard is what
//     stops it being quietly emptied.
//
// PROVEN by pointing a frame at a missing file, by adding priceUsd to an
// item, by renaming a ref to a product name, and by blanking the note. All
// red, then restored.
// ---------------------------------------------------------------------------
{
  const lookbook = read("src/content/flyingDressAccessories.ts");
  const lookbookComponent = read("src/app/flying-dresses/_components/AccessoryLookbook.tsx");

  ok(
    "the accessory lookbook is empty, so the collection page shows nothing",
    accessoryItems.length > 0 && accessoryCategories.length > 0
  );

  for (const item of accessoryItems) {
    const file = `public${item.src}`;
    ok(`accessory "${item.ref}" points at ${item.src}, which is not in public/`, existsSync(file));
    ok(
      `accessory "${item.ref}" has no alt text, so the piece is invisible to a screen reader`,
      item.alt.trim().length > 10
    );
  }

  // THE REFERENCE SURVIVES ALONGSIDE THE NAME.
  //
  // The pieces have names now — the owner asked for them, and naming your own
  // stock is branding rather than an invented fact. The reference is not
  // thereby redundant: it is stable when a name is reconsidered, it is
  // unambiguous read out over a phone line, and it is what the desk matches
  // an enquiry against. A name quietly replacing it would leave the desk with
  // "the gold one" and nothing to match.
  for (const item of accessoryItems) {
    ok(
      `accessory reference "${item.ref}" is no longer a reference — keep it as <category> <number>, ` +
        "which is what the desk matches and what stays put when a name changes.",
      /^[A-Z][a-z]+ \d+$/.test(item.ref)
    );
  }

  // ---------------------------------------------------------------------
  // NAMED, DESCRIBED, AND SAID TO BE WORN SOMEWHERE.
  //
  // All three were asked for together and they fail separately. A piece with
  // a name and no `worn` is the failure that matters most: "a wide gold cuff"
  // tells a customer nothing about whether it will even be visible in the
  // dress they picked, and "on the upper arm, above the elbow" tells them
  // exactly that. It is also the field most likely to be skipped when a
  // fourteenth piece is added in a hurry.
  //
  // A name must not be a reference wearing a name's clothes, either. If
  // `name` is allowed to read "Headpiece 1" then the whole request has been
  // satisfied on paper and not at all on the page.
  //
  // PROVEN by blanking one `worn`, by blanking one `description`, by setting
  // a `name` to "Headpiece 1", and by giving two pieces the same name. All
  // red, then restored.
  // ---------------------------------------------------------------------
  for (const item of accessoryItems) {
    ok(
      `accessory "${item.ref}" has no name, so the collection is a row of coordinates`,
      item.name.trim().length > 2
    );
    ok(
      `accessory "${item.ref}" has a name that is really a reference ("${item.name}") — the point of ` +
        "the name is that it is a name",
      !/^[A-Z][a-z]+ \d+$/.test(item.name)
    );
    ok(
      `accessory "${item.ref}" has no description, so the page shows a photograph and a name`,
      item.description.trim().length > 15
    );
    ok(
      `accessory "${item.ref}" does not say where it is worn, which is the one thing a customer ` +
        "cannot work out from the photograph",
      item.worn.trim().length > 15
    );
  }
  ok(
    "two accessories share a name, so an enquiry naming one is ambiguous",
    new Set(accessoryItems.map((i) => i.name.toLowerCase())).size === accessoryItems.length
  );

  // ---------------------------------------------------------------------
  // A NAME IS NOT A PROVENANCE CLAIM, AND THE PAGE HAS TO SAY SO.
  //
  // Calling a collar "Nefertiti" is branding. Letting a visitor read it as a
  // statement that the piece is an antiquity, or a documented reproduction of
  // one, is CLAUDE.md §7 arriving by implication rather than by sentence —
  // and implication is how it actually arrives. NAMING_NOTE is the sentence
  // that closes it, and it is one string so it cannot drift between the
  // collection page and the enquiry form.
  //
  // PROVEN by emptying NAMING_NOTE, by removing the word "ours" from it, and
  // by deleting it from the lookbook component. All red, then restored.
  // ---------------------------------------------------------------------
  ok(
    "the naming note is missing or too short to say anything, so the pieces carry invented-looking " +
      "names with nothing explaining them",
    NAMING_NOTE.trim().length > 60
  );
  ok(
    "the naming note no longer says the names are the studio's own, which is the only thing that " +
      "stops a name reading as a claim about an antiquity",
    /\bours\b|\bour own\b|\bwe (?:call|refer)\b/i.test(NAMING_NOTE)
  );
  ok(
    "the naming note no longer disowns the antiquity reading it exists to disown",
    /antiquit|artefact|artifact|not because/i.test(NAMING_NOTE)
  );
  ok(
    "the lookbook prints the names without the note saying whose names they are. (Matched as a " +
      "rendered expression, not a substring: the first version of this passed on a component that " +
      "imported NAMING_NOTE and never put it on the page.)",
    /\{NAMING_NOTE\}/.test(lookbookComponent)
  );
  ok(
    "the lookbook shows a photograph and a name but never says where the piece is worn",
    /item\.worn/.test(lookbookComponent) && /item\.description/.test(lookbookComponent)
  );

  // No price, anywhere near them.
  ok(
    "the accessory lookbook has grown a price field — the hire services carry no price by design",
    !/price|usd|\$\d/i.test(lookbook.replace(/\/\*[\s\S]*?\*\//g, " "))
  );

  // The note that says what is generated.
  ok(
    "the lookbook note is missing or empty, so the pages show generated imagery with nothing saying so",
    LOOKBOOK_NOTE.trim().length > 40
  );
  ok(
    "the lookbook note no longer says which part is created digitally",
    /digital/i.test(LOOKBOOK_NOTE) && /photograph/i.test(LOOKBOOK_NOTE)
  );
  ok(
    "the lookbook renders the pieces without the note about how the frames were made",
    /\{LOOKBOOK_NOTE\}/.test(lookbookComponent)
  );

  // And the accessories page must actually render them.
  const rentalPage = read("src/app/flying-dresses/rentals/[slug]/page.tsx");
  ok(
    "the accessories page no longer renders the collection",
    /<AccessoryLookbook/.test(rentalPage)
  );
  // They must not leak into the booking picker, which is a paid selection.
  const accessoriesService = rentalServices.find((r) => r.slug === "accessories");
  ok(
    "the accessories service now carries outfits, which the Egypt Eye booking picker reads — that " +
      "offers a customer a choice inside a paid booking that has no price or availability behind it",
    accessoriesService !== undefined && accessoriesService.outfits.length === 0
  );
}

// ---------------------------------------------------------------------------
// A STYLED COMPOSITE SAYS SO, AND NEVER CALLS ITSELF AGENCY WORK.
//
// "styled" was added for frames where the product is really ours and really
// photographed but the model and the setting are generated. It exists so that
// this kind of image has somewhere honest to go: the alternative was filing it
// as "agency", which is the one promotion assets.ts says nobody may make
// quietly, and which the file itself would contradict — these carry C2PA
// provenance naming OpenAI.
//
// So the kind has to earn itself. A styled slot must carry a credit, and that
// credit must say which part is generated. Without it the kind is just a label
// in a file nobody reads, and the page shows a composite with nothing saying
// so.
//
// PROVEN by removing the credit from the dress-rental slot (red), and by
// changing its kind to "agency" (red, on the agency allow-list guard above).
// ---------------------------------------------------------------------------
for (const [name, slot] of Object.entries(allSlots)) {
  if (slot.kind !== "styled") continue;
  ok(
    `the styled slot "${name}" carries no credit, so a generated scene renders with nothing saying so`,
    typeof slot.credit === "string" && slot.credit.trim().length > 20
  );
  ok(
    `the styled slot "${name}" has a credit that never says which part is generated`,
    /generated|digitally|composite/i.test(slot.credit ?? "")
  );
  ok(
    `the styled slot "${name}" has no image, which is what kind:"empty" is for`,
    typeof slot.src === "string" && slot.src.length > 0
  );
}

// AND THE CREDIT HAS TO REACH THE PAGE.
//
// The three assertions above check the DATA, and the first version of this
// stopped there — which was not enough: Scene took no credit prop at all, so
// the dress-rental frame rendered a generated scene with the note sitting
// unread in assets.ts. A credit nothing renders is a note to ourselves.
//
// PROVEN by removing the credit prop from Scene's usage on the rentals page
// (red) and by deleting the figcaption from Scene (red). Then restored.
{
  const scene = read("src/app/flying-dresses/_components/Scene.tsx");
  ok(
    "Scene accepts no credit, so a styled frame's provenance note never reaches the page",
    /credit\?:/.test(scene) && /figcaption/.test(scene)
  );
  const rentalsPage = read("src/app/flying-dresses/rentals/[slug]/page.tsx");
  ok(
    "the rentals page renders its art without passing the credit, so a styled frame shows with " +
      "nothing saying what is generated",
    /credit=\{art\.credit\}/.test(rentalsPage)
  );
}

// ---------------------------------------------------------------------------
// A COMPOSITE NEVER CLAIMS A CLIENT SHOOT.
//
// The wardrobe tells a customer "From the Aroouj shoot. The dress is the one
// you would wear." That is true of the twelve dresses, which were taken at
// real client shoots with real customers, and false of the five gawns, where
// the garment is real and photographed but the model and the background are
// generated. There was no shoot and the person is nobody.
//
// Without the styled flag those five would have inherited that sentence word
// for word, which is the quietest kind of fabrication: nothing looks wrong,
// and the site has invented a photo session and a client.
//
// PROVEN by dropping styled from a gawn entry (red), and by deleting the
// branch from Wardrobe so every photograph claims a shoot again (red).
// ---------------------------------------------------------------------------
{
  const gawnIds = MENS_OUTFITS.map((o) => o.id);
  for (const id of gawnIds) {
    const photo = dressPhotos[id];
    ok(
      `the gawn "${id}" has no photograph, so the wardrobe still shows it as a gap`,
      photo !== undefined
    );
    if (!photo) continue;
    ok(
      `the gawn "${id}" is not marked styled, so the wardrobe will tell a customer it came from a ` +
        "client shoot that never happened",
      photo.styled === true
    );
  }

  // The dresses are the other half of the same rule: they ARE client work and
  // must not be relabelled as composites.
  for (const dress of FLYING_DRESS_COLLECTION) {
    const photo = dressPhotos[dress.id];
    if (!photo) continue;
    ok(
      `the dress "${dress.id}" is marked styled, which would hide real client work behind a ` +
        "generated-imagery note",
      photo.styled !== true
    );
  }

  // And the component must still make the distinction.
  const wardrobe = read("src/app/flying-dresses/_components/Wardrobe.tsx");
  ok(
    "Wardrobe no longer branches on styled, so every photograph claims a shoot",
    /\.styled/.test(wardrobe) && /created digitally/.test(wardrobe)
  );
}

// ---------------------------------------------------------------------------
// NOTHING TELLS A CUSTOMER THE PHOTOGRAPHS DO NOT EXIST WHILE SHOWING THEM.
//
// Three times now. The wardrobe paragraph said "the photography has not been
// shot yet" after twelve photographs landed. The lightbox caption said the
// same in the same component. The wardrobe FAQ said it a third time, one
// scroll further down, and survived both fixes because nobody reads an FAQ
// array while fixing a paragraph.
//
// The paragraph and the caption are conditional now, which is the real fix.
// This is the backstop for the flat assertions: while every garment has a
// photograph, no customer-facing string on this page may say otherwise.
//
// PROVEN by restoring the old FAQ answer: red.
// ---------------------------------------------------------------------------
{
  const everyGarmentPhotographed = [...FLYING_DRESS_COLLECTION, ...MENS_OUTFITS].every(
    (o) => dressPhotos[o.id] !== undefined
  );
  const wardrobePage = read("src/app/flying-dresses/wardrobe/page.tsx");
  const copy = wardrobePage
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

  // EVERY SURFACE, NOT THE ONE I HAPPENED TO NOTICE.
  //
  // The FAQ was found by screenshotting the page, and the screenshot then
  // showed two more: a paragraph under the men's list saying "we have not
  // photographed the gawns", and the empty-slot caption calling them "the
  // site's biggest missing asset", both rendering directly beneath the five
  // photographs. Four copies of one claim, in three files.
  //
  // So the sweep is the files, not the file. A denial may only survive inside
  // a branch that the data can still reach.
  const DENIALS = [
    "has not been shot yet",
    "photography for this page has not",
    "not photographed the gawns",
    "names them rather than showing",
    "biggest missing asset",
    "Not on this page yet",
  ];
  const surfaces: [string, string][] = [
    ["the wardrobe page", copy],
    ["the men's wear content", read("src/content/flyingDresses.ts")],
    ["the image slots", read("src/app/flying-dresses/_lib/assets.ts")],
  ];
  for (const [where, text] of surfaces) {
    const body = text
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
    for (const phrase of DENIALS) {
      ok(
        `${where} still tells a customer "${phrase}" while every garment is photographed`,
        !everyGarmentPhotographed || !body.toLowerCase().includes(phrase.toLowerCase())
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// The wardrobe photographs.
//
// Each dress card used to render "photo coming soon" — on a page where the
// photograph IS the product, because a customer picks the dress by looking at
// it. The twelve colours now carry the owner's own wardrobe shoot, matched
// folder by folder and checked by eye against the swatch.
//
// The assertion that matters is the LAST one. Two dresses sharing a photograph
// means a colour was mapped to the wrong folder, and the symptom is a customer
// choosing Emerald and being handed Verdant on the day — a mistake nobody
// notices until somebody is standing on a rooftop in the wrong dress.
// ---------------------------------------------------------------------------
const dressPhotoRefs = FLYING_DRESS_COLLECTION.map((d) => {
  const img = d.image as { asset?: { _ref?: string } } | string | undefined;
  return typeof img === "string" ? img : img?.asset?._ref;
});

ok(
  "every dress in the collection carries a photograph",
  dressPhotoRefs.every((r) => typeof r === "string" && r.length > 0)
);
ok(
  "every dress photograph is a Sanity asset, so it is served resized rather than at full capture size",
  dressPhotoRefs.every((r) => typeof r === "string" && r.startsWith("image-"))
);
ok(
  "no two dresses share a photograph",
  new Set(dressPhotoRefs).size === dressPhotoRefs.length
);
// The five gawns have no photographs yet — the wardrobe shoot covered the
// dresses only. Their cards still say "photo coming soon", which is true.
ok(
  "the men's gawns are honestly unphotographed rather than borrowing a dress",
  MENS_OUTFITS.every((o) => !o.image)
);

// ---------------------------------------------------------------------------
// THE ENQUIRY FORM ASKS WHAT FIRST, AND EVERYTHING AFTER IT FOLLOWS.
//
// Four products shared one undivided form, and the form read as one product
// with a lot of caveats: somebody hiring a dress for an afternoon scrolled
// past a photoshoot location, a headcount and eleven priced photoshoot extras
// before reaching anything that applied to them, and could tick "full makeup"
// on a dress rental on the way past. The desk then unpicked it by hand.
//
// What is guarded is the SHAPE, not the wording:
//
//  1. There is a first question, with the four things we sell behind it.
//  2. The hire branches do not offer photoshoot extras. This is the one that
//     produced wrong enquiries rather than merely long ones.
//  3. Switching away from a branch forgets what was typed into it. A rooftop
//     left behind in a dress-rental enquiry is a question somebody has to
//     ring up and resolve.
//  4. `service` stays DERIVED from the answer. The payload, the route, the
//     email and the analytics all still read a rental slug or an empty
//     string, and a second piece of state saying the same thing as the first
//     is a second thing that can disagree with it.
//
// Matched against the file with comments stripped, for the reason CLAUDE.md
// §4 gives and this change has now hit five times: a guard that matches its
// own explanatory prose passes on the broken code.
//
// PROVEN by deleting the fieldset, by moving the extras out of the isShoot
// branch, by emptying chooseIntent's resets, and by storing `service` in
// useState beside `intent`. All red, then restored.
// ---------------------------------------------------------------------------
{
  const formSource = read("src/app/flying-dresses/_components/EnquiryForm.tsx");
  const formCode = formSource
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

  ok(
    "the enquiry form no longer asks what the visitor wants before asking for anything else",
    /fd-intent-grid/.test(formCode) && /name="intent"/.test(formCode)
  );
  for (const id of ["photoshoot", "dress-rental", "accessories", "mens-wear"] as const) {
    ok(
      `the enquiry form's first question does not offer "${id}", so one of the four things we sell ` +
        "is unreachable from the form",
      new RegExp(`id: "${id}"`).test(formCode)
    );
  }

  ok(
    "the enquiry form offers photoshoot extras on a hire, so somebody renting a dress can ask for " +
      "makeup on a session that does not exist",
    /isShoot \? \(\s*<div className="fd-field fd-field-full">[\s\S]{0,600}?addOns\.map/.test(formCode)
  );

  ok(
    "the enquiry form keeps a photoshoot location, occasion, headcount or extras after the visitor " +
      "switches to a hire, so the desk receives an answer to a question that was un-asked",
    /const chooseIntent/.test(formCode) &&
      /setPkg\(""\)/.test(formCode) &&
      /setExperience\(""\)/.test(formCode) &&
      /setExtras\(\[\]\)/.test(formCode)
  );

  ok(
    "the enquiry form stores the hire slug beside the intent instead of deriving it, so the two can " +
      "disagree and the payload stops matching what the visitor chose",
    /const service = isShoot \? "" : intent/.test(formCode) &&
      !/useState\(initialService\)/.test(formCode)
  );

  // -------------------------------------------------------------------
  // THE TWO WARDROBES ARE GATED ON THE EXTRA THAT PAYS FOR THEM.
  //
  // Accessories and men's attire are each a priced extra AND a collection to
  // choose from, and the flat form offered the collection to everybody. That
  // is how a form implies something is included: a visitor who picks a gawn
  // from a dropdown that was simply there has not been told it costs more,
  // and the first they hear of it is the quote.
  //
  // Now the extra is the gate on a shoot, and the intent is the gate on a
  // hire, where the collection IS the enquiry. Both are checked because they
  // are separate conditions in the source and either can be lost alone.
  // -------------------------------------------------------------------
  ok(
    "the accessory collection is offered without the extra that pays for it being ticked",
    /const showAccessories = isShoot \? extras\.includes\(ACCESSORIES_EXTRA\)/.test(formCode)
  );
  ok(
    "the gawn picker is offered without the extra that pays for it being ticked",
    /const showMens = isShoot \? extras\.includes\(MENS_EXTRA\)/.test(formCode)
  );
  // Scoped to toggleExtra's own body. Matched against the whole file this
  // passed on a form that had gutted it, because chooseIntent further up
  // makes the same two calls for a different reason — a guard satisfied by
  // the wrong function is a guard that checks nothing.
  const toggleBody = /const toggleExtra[\s\S]*?\n  \};/.exec(formCode)?.[0] ?? "";
  ok(
    "unticking an extra leaves the collection open and its choices in the payload, so the desk is " +
      "quoted for pieces the visitor took back",
    /setAccessories\(\[\]\)/.test(toggleBody) && /setMens\(""\)/.test(toggleBody)
  );

  // The gawn costs extra, and this sentence is where most visitors find out.
  ok(
    "the gawn picker never says the attire is charged on top of the shoot, so a visitor who picks " +
      "one from a dropdown has been told nothing about what it costs",
    /Charged on top of the shoot, not included in it/.test(formCode)
  );
  const mensAddOn = addOns.find((a) => a.id === "mens-attire");
  ok(
    "the men's attire extra no longer says it is charged on top of the shoot",
    mensAddOn !== undefined && /on top of the shoot/i.test(mensAddOn.detail)
  );

  // And the chosen pieces must be resolved server-side, like everything else.
  const enquiryRoute = read("src/app/api/flying-dresses-enquiry/route.ts");
  ok(
    "the enquiry route takes the accessory labels from the request instead of resolving them " +
      "against the collection, so a crafted payload puts a piece we do not own into an email the " +
      "desk reads as fact",
    /accessoryByRef\(/.test(enquiryRoute) && !/body\.accessories[\s\S]{0,80}?join/.test(enquiryRoute)
  );
}

// ---------------------------------------------------------------------------
// IT IS THE NINE PYRAMIDS VIEW, INSIDE THE GIZA COMPLEX. NOT A LOUNGE.
//
// The brochure called it "Nine Pyramids Lounge, within the Giza pyramid
// area"; a separate instruction said a Nine Pyramids rooftop "offers pyramid
// views, it is not inside the archaeological complex". The site said neither,
// which was the right answer to an unresolved question and the wrong one to
// leave standing once the owner resolved it: it is the Nine Pyramids View,
// in the complex, on request.
//
// This is not pedantry about a name. A session genuinely inside the
// archaeological area carries ticketing and permit implications a rooftop
// outside it does not, the sister brand sells that exact vantage point by
// name, and there is a Stories article on this site whose whole subject is
// competitors blurring the two. Drifting back to "Lounge" would put the two
// brands' descriptions of one place out of step again.
//
// PROVEN by restoring the old label and the old detail. Both red.
// ---------------------------------------------------------------------------
{
  const ninePyramids = addOns.find((a) => a.id === "nine-pyramids-view");
  ok(
    "the Nine Pyramids extra is gone or has been renumbered, so the shoot the owner confirmed is " +
      "no longer offered",
    ninePyramids !== undefined
  );
  if (ninePyramids) {
    ok(
      "the Nine Pyramids extra calls itself a session at a lounge again, which is the reading the " +
        "owner corrected",
      !/lounge/i.test(`${ninePyramids.label} ${ninePyramids.detail} ${ninePyramids.homeNote}`)
    );
    ok(
      "the Nine Pyramids extra no longer says it is the Nine Pyramids View",
      /nine pyramids view/i.test(ninePyramids.label) &&
        /nine pyramids view/i.test(ninePyramids.detail)
    );
    ok(
      "the Nine Pyramids extra no longer places itself inside the Giza complex, which is the part " +
        "that carries the permit and ticketing implications",
      /giza complex/i.test(ninePyramids.detail)
    );
  }
  // Nowhere else in this brand's copy either.
  const brandContent = read("src/content/flyingDresses.ts").replace(/\/\/[^\n]*/g, " ");
  ok(
    'this brand\'s content still says "Nine Pyramids Lounge" somewhere',
    !/Nine Pyramids Lounge/i.test(brandContent)
  );
}

// ---------------------------------------------------------------------------
// THE URGENT CALL SITS UNDER THE FORM, TURNED DOWN.
//
// Asked for directly. It was a loud card above the form, so the first thing
// every visitor met on the page that sells the shoot was an alarm about a
// situation almost none of them were in. Below the form, the people it IS for
// reach it at the moment they would otherwise hit send and wait.
//
// Both halves are checked because they fail separately: moved but still loud
// is still an alarm, and quiet but still first is still first.
//
// PROVEN by putting the block back above <EnquiryForm> (red) and by dropping
// variant="quiet" (red).
// ---------------------------------------------------------------------------
{
  const page = read("src/app/flying-dresses/enquire/page.tsx").replace(
    /\{\/\*[\s\S]*?\*\/\}/g,
    " "
  );
  const form = page.indexOf("<EnquiryForm");
  const urgent = page.indexOf("<UrgentCall");
  ok(
    "the urgent call card is back above the enquiry form, where every visitor meets it whether " +
      "their date is tomorrow or next spring",
    form !== -1 && urgent !== -1 && urgent > form
  );
  ok(
    "the urgent call is under the form but still rendered at full volume",
    /<UrgentCall[^>]*variant="quiet"/.test(page)
  );
  const urgentComponent = read("src/app/flying-dresses/_components/UrgentCall.tsx");
  ok(
    "UrgentCall has no quiet variant, so the enquiry page's quieter block falls back to the loud one",
    /fd-urgent-quiet/.test(urgentComponent)
  );
  ok(
    "brand.css has no rule for the quiet urgent block, so the class renders as unstyled markup. " +
      "(Matched as a selector: a substring test passed when the rule was renamed to " +
      ".fd-urgent-quietX, which still contains it.)",
    /\.fd-urgent-quiet\s*\{/.test(read("src/app/flying-dresses/brand.css"))
  );
}

// ---------------------------------------------------------------------------
// THE STORIES ARE AN ENGINE, AND AN ENGINE HAS PARTS THAT CAN COME LOOSE.
//
// Six articles shipped here with three structural faults that nothing caught,
// because nothing was looking: the related rail was `slice(0, 3)` and handed
// every article the same three links, no article had a named commercial
// destination, and nothing on the site linked to any of them except the index.
// All three render perfectly. None of them is visible in a screenshot.
//
// What follows guards the parts of an editorial section that fail silently.
// PROVEN, each by breaking the thing it names and watching it go red: a link
// to a route that does not exist, a duplicate slug, a published article with
// no destination, a draft in the sitemap, a repeated heading, and a price in
// prose that no longer matches the catalogue. Then restored.
// ---------------------------------------------------------------------------
{
  const stories = flyingDressStories;
  const live = liveStories();
  const allSlugs = stories.map((s) => s.slug);

  ok(
    "the Stories section is empty, so the editorial engine has nothing in it",
    live.length > 0
  );

  // ---- Every link resolves. ------------------------------------------
  // The one that actually costs money: an article is written to send people
  // somewhere, and Next will happily build, deploy and render a <Link> to a
  // route that does not exist. It looks correct until it is clicked.
  for (const story of stories) {
    for (const target of storyLinkTargets(story)) {
      ok(
        `story "${story.slug}" links to ${target}, which is not a route on this site. ` +
          "See content/flyingDressRoutes.ts for what resolves.",
        isFlyingDressRoute(target, allSlugs)
      );
    }
  }

  // ---- Identity. ------------------------------------------------------
  ok(
    "two stories share a slug, so one of them is unreachable",
    new Set(allSlugs).size === allSlugs.length
  );
  const titles = stories.map((s) => s.title.toLowerCase());
  ok(
    "two stories share a title, which is how a library starts competing with itself in search",
    new Set(titles).size === titles.length
  );
  const seoTitles = live.map((s) => s.seoTitle.toLowerCase());
  ok(
    "two published stories share a <title>, so a result list shows the same blue link twice",
    new Set(seoTitles).size === seoTitles.length
  );

  // ---- What a published article owes the reader and the business. -----
  for (const story of live) {
    ok(
      `published story "${story.slug}" has no commercial destination. An editorial page the ` +
        "business pays to write and is never paid for is the default outcome, not a risk.",
      story.destination !== undefined
    );
    ok(
      `published story "${story.slug}" is an orphan: nothing on this site links to it except the ` +
        "index. Name the pages it should be linked from in `inboundFrom`.",
      (story.inboundFrom ?? []).length > 0
    );
    ok(
      `published story "${story.slug}" has no sections`,
      story.sections.length > 0
    );
    ok(
      `published story "${story.slug}" has a meta description of ${story.metaDescription.length} ` +
        "characters. Under 70 wastes the line; over 165 is cut off mid-sentence in a result.",
      story.metaDescription.length >= 70 && story.metaDescription.length <= 165
    );
    ok(
      `published story "${story.slug}" has an seoTitle of ${story.seoTitle.length} characters, and ` +
        "the brand name appended to it costs 23 more. Keep it under 40.",
      story.seoTitle.length > 0 && story.seoTitle.length <= 40
    );
    // The table of contents links to #headingId. Two identical headings in one
    // article means one of those anchors silently goes to the wrong place.
    const headings = story.sections.map((s) => s.heading);
    ok(
      `story "${story.slug}" repeats a section heading, so its contents list has two links to one anchor`,
      new Set(headings).size === headings.length
    );
  }

  // ---- `inboundFrom` has to mean something. ---------------------------
  //
  // THE FIRST VERSION OF THIS BLOCK PASSED ON BROKEN CODE, which is the
  // reason the guard is written this way.
  //
  // Naming a page in `inboundFrom` only produces a link if that page renders
  // <StoriesFromHere>. Nine paths were named across the articles and six
  // pages had been wired, so /packages, /celebrations and /faq silently
  // carried no link at all. The non-empty check above was green throughout:
  // it asserted that somebody had written down an intention, not that the
  // intention had been carried out. A browser found it.
  //
  // So the path is resolved to the file that serves it and the file is read.
  // A dynamic segment collapses to its one route file, which is correct: wire
  // /experiences/[slug] once and every package page has it.
  const PAGE_FOR_PATH = (path: string): string => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "src/app/flying-dresses/page.tsx";
    if (segments.length === 1) return `src/app/flying-dresses/${segments[0]}/page.tsx`;
    return `src/app/flying-dresses/${segments[0]}/[slug]/page.tsx`;
  };
  const inboundPaths = new Set(live.flatMap((s) => s.inboundFrom ?? []));
  for (const path of inboundPaths) {
    const file = PAGE_FOR_PATH(path);
    ok(
      `a story asks to be linked from ${path}, but ${file} does not render <StoriesFromHere>, so ` +
        "the link does not exist. `inboundFrom` is a request, not a link.",
      existsSync(file) && read(file).includes("<StoriesFromHere")
    );
  }

  // A cited article without its citations is the failure the `basis` field
  // exists to prevent. This guard predates the engine and is kept.
  for (const story of stories) {
    if (story.basis !== "cited") continue;
    ok(
      `story "${story.slug}" says it is cited and carries no sources`,
      (story.sources ?? []).length > 0
    );
  }

  // ---- Drafts are not published. --------------------------------------
  const indexPage = read("src/app/flying-dresses/stories/page.tsx");
  const storyPage = read("src/app/flying-dresses/stories/[slug]/page.tsx");
  const storySitemap = read("src/app/flying-dresses/sitemap.xml/route.ts");
  for (const [label, source] of [
    ["the stories index", indexPage],
    ["the article route", storyPage],
    ["the sitemap", storySitemap],
  ] as const) {
    // Comments and the import SPECIFIER are stripped first. The first version
    // of this matched `from "@/content/flyingDressStories"` and a sentence in
    // a code comment, and failed on three files that were already correct —
    // a guard that cannot tell a module path from a use of the value is a
    // guard that gets switched off.
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
      .replace(/from\s+"[^"]*"/g, " ");
    ok(
      `${label} reads flyingDressStories directly, so a draft or a researched brief would be ` +
        "published. It must go through liveStories().",
      !/\bflyingDressStories\b/.test(code)
    );
  }

  // ---- The related rail is scored, not sliced. ------------------------
  // Asserted on behaviour rather than on the source text: the bug was a rail
  // that returned the same thing for every article, so what is checked is
  // that two articles do not get identical rails.
  const rails = live.map((s) => relatedStories(s).map((r) => r.slug).join("|"));
  const distinct = new Set(rails.filter((r) => r.length > 0));
  ok(
    "every article shows the same related rail, which is what slice(0, 3) did before " +
      "relatedStories() replaced it. A reader learns in two articles that the rail is furniture.",
    live.length < 3 || distinct.size > 1
  );

  // ---- Inline link markup is well formed. -----------------------------
  //
  // A malformed `[label](path` renders as literal brackets in the middle of a
  // sentence. It survives review because it reads as a typo rather than as a
  // broken feature, and it is invisible in the content file, where square
  // brackets look like square brackets.
  //
  // Checked on the OUTPUT rather than by counting markers. The first version
  // compared `](` occurrences to parsed links, which passes on the commonest
  // malformation of all: drop the `]` and there are zero of each. What is
  // actually wrong is residue in the text a reader sees, so that is what is
  // asserted — after parsing, no bracket or `](` may survive into the prose.
  for (const story of stories) {
    const lines = [
      ...story.sections.flatMap((s) => [...s.body, ...(s.list ?? [])]),
      ...story.faqs.map((f) => f.answer),
    ];
    for (const line of lines) {
      const rendered = storyPlainText(line);
      ok(
        `story "${story.slug}" has link markup that did not parse, so a reader sees brackets in ` +
          `the middle of a sentence: "${rendered.slice(0, 70)}"`,
        !/[[\]]/.test(rendered) && !rendered.includes("](")
      );
    }
  }
}

// ---------------------------------------------------------------------------
// THE PROPOSAL PAGE SELLS SOMETHING WE HAVE NEVER PHOTOGRAPHED.
//
// That is the fact the whole page is built around and the reason this block
// exists. The repository holds real, credited agency work from the Giza
// rooftop — couples, a vow renewal, a gender reveal, groups — and not one
// frame of a proposal. The couples frames look exactly like proposal
// photography, which is precisely why a caption that forgets to say what they
// are becomes fabricated client work rather than an oversight.
//
// The other half is the venue. The owner supplied "Palm Hotel, Mansouriya
// Street, near the Sphinx Gate area" and asked, in the same message, for it to
// be verified before publishing. A street address is what somebody types into
// a map on the morning of their proposal. It stays held until a human confirms
// it, and the flag is the mechanism.
//
// PROVEN, each by breaking the thing it names: a price on the page, a venue
// fact flipped to published, a decoration entry with no photograph, a caption
// that stops saying what the frame is, and a lightbox stripped of its dialog
// role. All red, then restored.
// ---------------------------------------------------------------------------
{
  const proposalContent = read("src/content/flyingDressProposal.ts");
  const proposalPage = read("src/app/flying-dresses/_components/ProposalPage.tsx");
  const galleryComponent = read("src/app/flying-dresses/_components/PhotoGallery.tsx");
  const lightbox = read("src/app/flying-dresses/_components/Lightbox.tsx");
  const decorations = read("src/app/flying-dresses/_components/ProposalDecorations.tsx");

  const strip = (source: string) =>
    source
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

  // ---- No price. Anywhere. -------------------------------------------
  // No figure has been set for any proposal package. The page carries a
  // deposit SPLIT, which is a percentage and not a price, so the test is for
  // a currency amount rather than for digits.
  for (const [label, source] of [
    ["the proposal content file", proposalContent],
    ["the proposal page", proposalPage],
  ] as const) {
    const code = strip(source);
    const money = code.match(/[$£€]\s?\d/g) ?? [];
    ok(
      `${label} states a currency amount (${money.join(", ")}). No price has been set for any ` +
        "proposal package, so a figure here is an invented one. CLAUDE.md §7.",
      money.length === 0
    );
  }
  ok(
    "the proposal payment split no longer adds up to the whole booking",
    proposalPayment.depositPercent + proposalPayment.balancePercent === 100
  );
  ok(
    "the proposal page stopped saying the price is quoted rather than published, so a visitor " +
      "cannot tell whether a figure exists",
    /no published price/i.test(proposalPayment.quoteNote)
  );

  // ---- The held facts stay held. --------------------------------------
  //
  // This is the guard that matters most, because flipping one of these is a
  // one-character edit that silently publishes an unverified claim about
  // somebody else's building.
  const held: [string, { value: string; published: boolean; note?: string }][] = [
    ["the venue name", proposalVenue.name],
    ["the venue street address", proposalVenue.address],
    ["the free changing room", proposalVenue.changingRoom],
  ];
  for (const [label, fact] of held) {
    ok(
      `${label} has been marked published. The owner supplied it AND asked for it to be verified; ` +
        "until a human confirms it, it stays off the page. Flipping this flag is not the " +
        "verification.",
      fact.published === false
    );
    ok(
      `${label} is held with no note saying what would release it, so nobody knows what to check`,
      typeof fact.note === "string" && fact.note.length > 40
    );
    ok(
      `${label} is held but its text appears on the proposal page anyway`,
      !strip(proposalPage).includes(fact.value)
    );
  }

  // ---- The rooftop is not the archaeological complex. -----------------
  ok(
    "the proposal page no longer distinguishes a rooftop with a pyramid view from the " +
      "archaeological complex. That distinction is the one competitors blur and the one this " +
      "brand has a whole article about.",
    /archaeological complex/i.test(proposalVenue.notTheComplex) &&
      strip(proposalPage).includes("notTheComplex")
  );

  // ---- Every gallery frame says what it actually is. ------------------
  //
  // The page has five captions and none of the photographs is a proposal.
  // Each caption must name the real occasion, or the frame is passed off as
  // something it is not.
  const OCCASIONS = ["couples shoot", "vow renewal", "gender reveal", "flying-dress session", "the roof"];
  const captions = [...proposalPage.matchAll(/caption:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
  ok(
    `the proposal gallery has ${captions.length} captions, which is not the set the page composes. ` +
      "Every frame must carry one: a caption is the only thing stopping a couples shoot reading " +
      "as a proposal we photographed.",
    captions.length >= 5
  );
  for (const caption of captions) {
    ok(
      `a proposal gallery caption never says what the photograph actually is: "${caption.slice(0, 60)}". ` +
        `It must name one of: ${OCCASIONS.join(", ")}.`,
      OCCASIONS.some((occasion) => caption.toLowerCase().includes(occasion))
    );
  }
  ok(
    "the proposal gallery stopped telling the visitor that none of these is a proposal, which is " +
      "the sentence that makes the rest of the section honest",
    /not photographed a proposal|nothing below is one/i.test(strip(proposalPage))
  );

  // ---- The catalogue cannot grow a fake entry. ------------------------
  for (const decoration of proposalDecorations) {
    ok(
      `proposal decoration "${decoration.id}" points at ${decoration.src}, which is not in public/. ` +
        "A catalogue entry without its photograph is a list item pretending to be a design.",
      existsSync(`public${decoration.src}`)
    );
    ok(
      `proposal decoration "${decoration.id}" has no alt text`,
      decoration.alt.trim().length > 10
    );
  }
  ok(
    "the decoration catalogue has entries but the page no longer offers the interim copy for an " +
      "empty one, so emptying it would render a heading over nothing",
    decorations.includes("interim") && /DECORATION_INTERIM/.test(proposalPage)
  );

  // ---- The lightbox is a real dialog. ---------------------------------
  //
  // A lightbox is the easiest component on a site to ship broken for keyboard
  // users, because it looks perfect to whoever built it with a mouse.
  // Comments stripped first. The block comment at the top of Lightbox.tsx
  // explains the component by NAMING every attribute this loop looks for, so
  // matched against the raw file the role check passed on a component whose
  // role had been changed to "group". CLAUDE.md §4.
  const lightboxCode = strip(lightbox);
  for (const [need, pattern] of [
    ['role="dialog"', /role="dialog"/],
    ["aria-modal", /aria-modal="true"/],
    ["an Escape handler", /"Escape"/],
    ["arrow-key navigation", /ArrowRight/],
    ["a focus trap on Tab", /"Tab"/],
    ["focus returned to the opener on close", /opener\?\.focus/],
  ] as const) {
    ok(
      `the lightbox has lost ${need}, so it is a picture viewer a keyboard user cannot operate`,
      pattern.test(lightboxCode)
    );
  }
  ok(
    "the gallery renders thumbnails that are not buttons, so the lightbox cannot be opened from " +
      "the keyboard at all",
    /<button[\s\S]{0,200}?fd-pgallery-btn/.test(galleryComponent)
  );

  // ---- The route still owns the URL. ----------------------------------
  const categoryRoute = read("src/app/flying-dresses/celebrations/[slug]/page.tsx");
  // Matched on the RENDER, not on the identifier. The first version tested
  // for `category.id === "proposals"` anywhere in the file, which is also how
  // the experience record is looked up two lines earlier — so switching the
  // render off left the guard green and the page back to the generic body.
  ok(
    "the proposal body is no longer rendered from the shared celebrations route: either it has " +
      "been forked to its own URL, taking the breadcrumbs and the FAQ structured data with it, " +
      "or the category has fallen back to the generic renderer",
    /category\.id === "proposals" && proposal \?[\s\S]{0,120}?<ProposalPage/.test(
      strip(categoryRoute)
    )
  );
}

// ---------------------------------------------------------------------------
// THE GENDER REVEAL PAGE
//
// The whole point of these guards is that this page is NOT the proposal page
// with the nouns changed. The owner supplied a deposit split, payment methods,
// a photograph count, a Google Drive gallery with a year of access and a hotel
// name FOR THE PROPOSAL. Nothing of the kind was said about a gender reveal,
// and the brief for this page warned twice against assuming it transfers.
//
// The cheapest possible mistake here is somebody later "finishing" this page by
// copying the file next door. Every one of these assertions exists to make that
// fail loudly instead of shipping invented terms to a paying customer.
//
// PROVEN, each by breaking the thing it names: a price in the content file, a
// currency amount on the page, termsSet flipped to true, an import of the
// proposal content, a hotel name, a named reveal effect advertised, the real
// reveal frame put back into the gallery, a caption that stops naming its
// occasion, a decoration entry with a missing photograph, a decoration entry
// carrying a price, an em-dash in visitor-facing copy, and the route's render
// switched off. All red, then restored.
// ---------------------------------------------------------------------------
{
  const revealContent = read("src/content/flyingDressGenderReveal.ts");
  const revealPage = read("src/app/flying-dresses/_components/GenderRevealPage.tsx");
  const revealThemesComponent = read("src/app/flying-dresses/_components/RevealThemes.tsx");
  const revealRoute = read("src/app/flying-dresses/celebrations/[slug]/page.tsx");
  const revealApi = read("src/app/api/flying-dresses-enquiry/route.ts");

  // Comments explain what the code must NOT do, which means an unstripped
  // match tests the explanation rather than the code. This has bitten this
  // script repeatedly; see the header. Import specifiers go too, because a
  // path like "@/content/flyingDressProposal" otherwise satisfies a guard
  // looking for proposal facts.
  const strip = (source: string) =>
    source
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  const stripWithImports = (source: string) =>
    strip(source).replace(/from\s+"[^"]*"/g, " ");

  // ---- No price. Anywhere. -------------------------------------------
  // The record's first unanswered question is "PRICE. Nothing has been set
  // for a gender reveal, with or without video." Unlike the proposal page
  // there is not even a percentage split to allow for, so this is stricter:
  // no currency amount AND no percentage.
  for (const [label, source] of [
    ["the gender reveal content file", revealContent],
    ["the gender reveal page", revealPage],
  ] as const) {
    const code = strip(source);
    const money = code.match(/[$£€]\s?\d/g) ?? [];
    ok(
      `${label} states a currency amount (${money.join(", ")}). No price has been set for a ` +
        "gender reveal, with or without video, so a figure here is an invented one. CLAUDE.md §7.",
      money.length === 0
    );
    const percent = code.match(/\b\d{1,3}\s?(?:%|per cent)/g) ?? [];
    ok(
      `${label} states a percentage (${percent.join(", ")}). That is how the proposal page ` +
        "expresses its deposit split, and NO deposit, balance or payment term has been agreed " +
        "for a gender reveal. See revealPayment.teamNote.",
      percent.length === 0
    );
  }

  // ---- The absence of payment terms is recorded, not quietly filled. --
  ok(
    "revealPayment.termsSet is true, which says payment terms now exist for a gender reveal. " +
      "If the owner has genuinely set them, add them deliberately and update the page and this " +
      "guard together. If this was flipped to make a section look finished, that is the exact " +
      "mistake the flag is here to catch.",
    revealPayment.termsSet === false
  );

  // ---- STRUCTURAL: the proposal's facts cannot reach this page. -------
  // Stronger than searching for each string, because it stops the next one
  // too. If the gender reveal page cannot import the proposal content, it
  // cannot render a proposal fact by accident.
  for (const [label, source] of [
    ["the gender reveal content file", revealContent],
    ["the gender reveal page", revealPage],
  ] as const) {
    ok(
      `${label} imports from flyingDressProposal. Those facts were supplied for the proposal ` +
        "service: a 25/75 split, cash and PayPal, more than a hundred photographs, a Google " +
        "Drive gallery expiring after a year, a named hotel. None of it was said about a gender " +
        "reveal, and importing the module is how one of them ends up on this page.",
      !/from\s+"[^"]*flyingDressProposal"/.test(source)
    );
  }

  // ---- The proposal's specific claims, named, in case of a hand copy. -
  const proposalOnlyClaims: [string, RegExp][] = [
    ["a named hotel", /Palm Hotel/i],
    ["a street address", /Mansouriya/i],
    ["Google Drive delivery", /Google Drive/i],
    ["a year of gallery access", /for a year|one year from/i],
    ["a photograph count", /more than a hundred|over a hundred|100\+/i],
    ["a speaker on the roof", /speaker/i],
  ];
  for (const [what, pattern] of proposalOnlyClaims) {
    const code = stripWithImports(revealContent) + stripWithImports(revealPage);
    ok(
      `the gender reveal page or its content file claims ${what}. That was supplied for the ` +
        "proposal service and has never been stated about a gender reveal. Publishing it here " +
        "is inventing a term the first customer will hold us to.",
      !pattern.test(code)
    );
  }

  // ---- No reveal mechanism advertised as available. -------------------
  // The record says it twice: "We will not confirm a particular prop or
  // effect until they have" and "Nothing specific should be advertised until
  // this is answered." The section explains how a method gets AGREED.
  //
  // "balloon arch" is deliberately NOT in this list: the page describes one
  // in a photograph we actually took, as decoration, which is a statement
  // about a past evening rather than an offer. The named EFFECTS below are
  // what cannot be offered.
  const unconfirmedEffects: [string, RegExp][] = [
    ["confetti", /confetti/i],
    ["a smoke effect", /smoke/i],
    ["a cannon", /cannon/i],
    ["fireworks", /firework/i],
    ["sparklers", /sparkler/i],
    ["coloured powder", /powder/i],
  ];
  for (const [what, pattern] of unconfirmedEffects) {
    const code = strip(revealContent) + strip(revealPage) + strip(revealThemesComponent);
    ok(
      `the gender reveal page names ${what}. No venue has confirmed which reveal mechanisms it ` +
        "permits, and the experience record says plainly that nothing specific should be " +
        "advertised until that is answered. Somebody will arrive expecting it.",
      !pattern.test(code)
    );
  }

  // ---- THE ONE REAL PHOTOGRAPH IS NOT SPENT TWICE. -------------------
  // There is exactly one genuine gender reveal frame in this repository. It
  // is the hero, rendered by the shared route. Putting it in the gallery as
  // well makes one photograph look like two, and makes the gallery's own
  // first sentence ("nothing below is a reveal") false.
  ok(
    "the gender reveal gallery now includes agency.genderReveal. That frame is the hero. " +
      "Showing it in the gallery as well spends the only real reveal photograph twice and " +
      "contradicts the gallery's own intro, which tells the visitor nothing below it is a reveal.",
    !/agency\.genderReveal/.test(strip(revealPage))
  );
  ok(
    "the gender reveal gallery intro no longer tells the visitor that the frames below are not " +
      "reveals. Four frames from couples shoots and flying-dress sessions, unqualified, read as " +
      "a reveal portfolio four times the size of the real one.",
    /nothing below is a reveal/i.test(revealPage)
  );

  // ---- Every gallery caption names what the frame actually is. -------
  // Matched inside the caption STRINGS rather than across the file, so a
  // single occurrence of "vow renewal" elsewhere cannot satisfy all four.
  {
    const captions = [...revealPage.matchAll(/caption:\s*\n?\s*"((?:[^"\\]|\\.)*)"/g)].map(
      (match) => match[1]
    );
    ok(
      `the gender reveal gallery has ${captions.length} captions rather than the four frames it ` +
        "renders, so at least one photograph is shown without saying what it is",
      captions.length === 4
    );
    const occasion = /couples shoot|vow renewal|flying-dress session|gender reveal/i;
    for (const caption of captions) {
      ok(
        `a gender reveal gallery caption does not name the occasion it was photographed at: ` +
          `"${caption.slice(0, 70)}". None of these frames is a gender reveal, and a visitor ` +
          "must not have to guess which.",
        occasion.test(caption)
      );
    }
  }

  // ---- The decoration catalogue, whenever it fills up. ---------------
  for (const decoration of revealDecorations) {
    ok(
      `the gender reveal decoration "${decoration.id}" has no photograph at public${decoration.src}. ` +
        "A catalogue entry without one is a list item, and the page renders it as a card with a " +
        "broken image.",
      decoration.src.startsWith("/") && existsSync(`public${decoration.src}`)
    );
    const priced = `${decoration.name} ${decoration.description}`.match(/[$£€]\s?\d/g) ?? [];
    ok(
      `the gender reveal decoration "${decoration.id}" carries a price (${priced.join(", ")}). ` +
        "No price has been set for a gender reveal or for any decoration in it.",
      priced.length === 0
    );
  }

  // ---- The colour themes resolve, and promise nothing priced. --------
  ok(
    "the gender reveal colour themes are empty. Unlike the decoration catalogue this list is " +
      "CONFIRMED by the experience record (\"in a colour theme you pick\"), so an empty list is a " +
      "regression rather than an honest gap.",
    revealThemes.length > 0
  );
  for (const theme of revealThemes) {
    ok(
      `the gender reveal theme "${theme.id}" does not resolve through revealThemeById, so the ` +
        "enquiry handoff would silently drop it",
      revealThemeById(theme.id)?.id === theme.id
    );
  }
  ok(
    "revealThemeById resolves an id that is not in the catalogue, so a crafted query string " +
      "could put a theme we do not offer into an enquiry email the desk reads as fact",
    revealThemeById("not-a-real-theme") === undefined
  );

  // ---- The handoff is resolved server-side, never echoed. ------------
  ok(
    "the enquiry API no longer resolves the gender reveal theme through revealThemeById. " +
      "Whatever arrives in that field ends up in an email the business reads as fact, so the " +
      "LABEL must come off the catalogue rather than off the request.",
    /revealThemeById\(clean\(body\.theme/.test(strip(revealApi))
  );
  ok(
    "the enquiry API stopped putting the gender reveal colour theme in the desk email, so a " +
      "choice the visitor made on the page is collected and then thrown away",
    /push\("Gender reveal colour theme", theme\?\.label/.test(strip(revealApi))
  );

  // ---- No em-dashes in visitor-facing copy. --------------------------
  // Project rule. Checked on the content file's STRING LITERALS, because the
  // explanatory comments above them are not visitor-facing and legitimately
  // contain them.
  {
    const literals = [...revealContent.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
    const offenders = literals.filter((literal) => literal.includes("—"));
    ok(
      `the gender reveal content file uses an em-dash in visitor-facing copy: ` +
        `"${offenders[0]?.slice(0, 70) ?? ""}". Repunctuate by hand with a colon, a full stop, a ` +
        "comma or parentheses as the sentence needs.",
      offenders.length === 0
    );
  }

  // ---- The route still owns the URL. ---------------------------------
  // Matched on the RENDER, not the identifier: `category.id === "gender-reveal"`
  // also appears in the lookup two lines earlier, so testing for it anywhere
  // in the file would stay green with the render switched off.
  ok(
    "the gender reveal body is no longer rendered from the shared celebrations route: either it " +
      "has been forked to its own URL, taking the breadcrumbs and the FAQ structured data with " +
      "it, or the category has fallen back to the generic renderer",
    /category\.id === "gender-reveal" && genderReveal \?[\s\S]{0,140}?<GenderRevealPage/.test(
      strip(revealRoute)
    )
  );
}

if (errors.length > 0) {
  console.error("check-flying-dresses: FAILED\n");
  for (const error of errors) console.error(`  ✗ ${error}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-flying-dresses: ok — ${packages.length} photoshoots all pointing at a real bookable product, ` +
    `${rentalServices.length} hire services none of which can carry a price, ` +
    `${FLYING_DRESS_COLLECTION.length} dresses and ${MENS_OUTFITS.length} gawns from one shared wardrobe, ` +
    `${Object.values(allSlots).filter((s) => s.kind === "agency" || s.kind === "location").length} ` +
    `photographs and ${Object.values(allSlots).filter((s) => s.kind === "styled").length} styled ` +
    `composites all present, ${Object.values(allSlots).filter((s) => s.kind === "empty").length} ` +
    "labelled gaps, " +
    `${flyingDressStories.length} stories none of which duplicate a slug on egypteyetravel.com, ` +
    `${marqueePlaces.length + marqueeColours.length} ribbon frames all present and parked under reduced motion, ` +
    "reduced motion disables the timelines, and no enquiry claims to be a booking."
);
