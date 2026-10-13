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
import { photoshoots } from "../src/content/photoshoots.js";
import { allSlots } from "../src/app/flying-dresses/_lib/assets.js";

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
const AGENCY_WORK = new Set([
  "/photos/about/briana-trip-flying-dress.jpg",
  "/photos/about/cherry-travel-flying-dress.jpg",
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
  // work", and only two files on this deployment are. Promoting a stock
  // location photo to agency work by editing a page is exactly what the
  // brief forbids, and it is a one-word edit.
  //
  // Proven by changing the Giza plateau slot's kind to "agency": red.
  if (slot.kind === "agency") {
    ok(
      `image slot "${key}" claims to be the agency's own photography, but ${slot.src} is not one of the two ` +
        "genuine flying-dress photographs on this deployment. Location photography must stay kind:\"location\".",
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

const proxySource = read("src/proxy.ts");
ok(
  "src/proxy.ts no longer exempts /flying-dresses from the locale rewrite — every page would be rewritten to " +
    "/en/flying-dresses/... and 404",
  proxySource.includes('pathname.startsWith("/flying-dresses/")')
);
ok(
  "src/proxy.ts no longer recognises the Flying Dresses host, so its own domain would serve the travel site",
  proxySource.includes("isFlyingDressesHost")
);
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
  ok(
    "the reduced-motion block does not reset the pinned scene, so it stays a 280svh scroll trap",
    reducedBlock.includes(".fd-pin-track")
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
