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
  wardrobe,
} from "../src/content/flyingDresses.js";
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
  storyClusters,
  storyWordCount,
} from "../src/content/flyingDressStories.js";
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
ok("the shared collection no longer holds twelve dresses", FLYING_DRESS_COLLECTION.length === 12);
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

const bookingRail = read("src/app/flying-dresses/_components/BookingRail.tsx");
ok(
  "the deposit link is relative, so it resolves against the Flying Dresses domain — where the proxy refuses " +
    "payment routes, so the button 404s. It must point at the Egypt Eye origin, which is what keeps PayPal " +
    "credentials off this brand's deployment entirely.",
  bookingRail.includes("EGYPT_EYE_ORIGIN") && !/href=\{`\/secure\//.test(bookingRail)
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
  for (const story of flyingDressStories) {
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
  // NO PRICE AN ARTICLE INVENTED.
  //
  // Prose is where a figure gets rounded, remembered or guessed. Only the
  // confirmed numbers — the three photoshoot prices and the add-ons that
  // already carry one — may appear as a dollar amount in a story.
  //
  // Proven by writing "$250" into one paragraph: red.
  // -------------------------------------------------------------------------
  const confirmedPrices = new Set<number>([
    ...packages.map((p) => p.priceUsd).filter((v): v is number => typeof v === "number"),
    ...addOns.map((a) => a.priceUsd).filter((v): v is number => typeof v === "number"),
  ]);

  for (const story of flyingDressStories) {
    const prose = [
      story.title,
      story.excerpt,
      story.metaDescription,
      ...story.sections.flatMap((s) => [s.heading, ...s.body, ...(s.list ?? [])]),
      ...story.faqs.flatMap((f) => [f.question, f.answer]),
    ].join(" ");

    for (const match of prose.matchAll(/\$(\d[\d,]*)/g)) {
      const value = Number(match[1].replace(/,/g, ""));
      ok(
        `story ${story.slug} states $${match[1]}, which is not a confirmed price`,
        confirmedPrices.has(value)
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
    "the sitemap does not map over flyingDressStories, so new articles would never be submitted",
    sitemapSource.includes("flyingDressStories.map")
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
    "photographing one dress in the Studio leaves the other eleven photographed",
    Object.keys(oneUploaded.photos).length === Object.keys(dressPhotos).length,
  );
  ok(
    "and the uploaded photograph is the one used",
    oneUploaded.photos.cherry?.src === "https://cdn.sanity.io/images/x/y/new-cherry.jpg",
  );
  ok(
    "a garment with no photograph anywhere stays absent rather than blank",
    seeded.photos["saeedy-gawn-1"] === undefined,
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
  const wardrobePage = readFileSync("src/app/flying-dresses/wardrobe/page.tsx", "utf8");
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
// ---------------------------------------------------------------------------
{
  const form = read("src/app/flying-dresses/_components/EnquiryForm.tsx");
  ok(
    "the enquiry form does not validate the phone number's country code",
    /next\.phone\s*=/.test(form) && /\\\+\\d\{1,4\}/.test(form)
  );
  ok(
    "the phone field does not tell the visitor to include a country code",
    /country code/i.test(form)
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
// Report.
// ---------------------------------------------------------------------------
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
    `${Object.values(allSlots).filter((s) => s.kind !== "empty").length} real images all present and ` +
    `${Object.values(allSlots).filter((s) => s.kind === "empty").length} labelled gaps, ` +
    `${flyingDressStories.length} stories none of which duplicate a slug on egypteyetravel.com, ` +
    `${marqueePlaces.length + marqueeColours.length} ribbon frames all present and parked under reduced motion, ` +
    "reduced motion disables the timelines, and no enquiry claims to be a booking."
);
