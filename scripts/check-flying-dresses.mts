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
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import {
  addOns,
  brand,
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
import { allSlots } from "../src/app/flying-dresses/_lib/assets.js";
import { flyingDressGalleryById } from "../src/content/flyingDressGalleries.js";
import {
  ROOFTOP_LOCATION_NOTE,
  VENUE_DEPENDENCY,
  experienceCategories,
  flyingDressExperiences,
} from "../src/content/flyingDressExperiences.js";
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
  ok(
    `package "${pkg.slug}" has a price of ${pkg.priceUsd}, which is not a positive whole number of dollars`,
    Number.isInteger(pkg.priceUsd) && pkg.priceUsd > 0
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
      `Wardrobe.tsx says "${claim}" without testing dressPhotos first — it will say that over a real photograph`,
      window.includes("dressPhotos[")
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
    "reduced motion disables the timelines, and no enquiry claims to be a booking."
);
