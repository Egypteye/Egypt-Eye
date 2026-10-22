import { readFileSync } from "node:fs";
import { activities, experienceThemes } from "../src/content/activities";
import type { Experience } from "../src/content/types";

// The Cairo collections — craft, heritage, photography, outdoors — and the
// promises they are not allowed to make.
//
// These eleven products were researched in October 2026 and almost nothing
// about them is confirmed: there is no signed artisan, no agreed calligrapher,
// no protectorate camping permit and no published rate. What makes them safe
// to publish is that every page says so. This file is what stops a later edit
// quietly turning "we arrange this for your date" into "our workshop".
//
// It also guards the thing that fails silently. `theme` is a scalar on a
// product type whose Studio documents win wholesale, so a missing GROQ
// projection or a missing fallback in hardenExperience drops every one of
// these out of its collection in production while looking perfect locally.

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const THEMED = activities.filter((a) => a.theme);
const bySlug = new Map(activities.map((a) => [a.slug, a]));

const prose = (e: Experience): string =>
  [
    e.title,
    e.description,
    e.location ?? "",
    e.duration,
    ...(e.steps ?? []).flatMap((s) => [s.title, s.description]),
    ...e.included,
    ...(e.goodToKnow ?? []),
    ...(e.enquiryOptions ?? []),
  ].join(" ");

// ---------------------------------------------------------------------------
// 1. The collections exist, and every themed product sits in a real one.
// ---------------------------------------------------------------------------
ok("there are themed experiences at all", THEMED.length > 0);
const themeKeys = new Set(experienceThemes.map((t) => t.key));
ok("the four collections are defined", experienceThemes.length === 4);
for (const e of THEMED) {
  ok(`${e.slug} sits in a collection that exists`, themeKeys.has(e.theme!));
}
for (const t of experienceThemes) {
  ok(`the "${t.name}" collection is not empty`, THEMED.some((e) => e.theme === t.key));
  ok(`the "${t.name}" collection has a blurb`, t.blurb.trim().length > 20);
}

// ---------------------------------------------------------------------------
// 2. Not one of them quotes a price. They are enquiry products, all of them.
//
// The market research found comparable Cairo photography from roughly $80 for
// an hour to $400 for a half day — a spread far too wide to publish a number
// against before the suppliers are ours.
// ---------------------------------------------------------------------------
for (const e of THEMED) {
  ok(`${e.slug} carries no price`, e.price.amount === null || e.price.amount === undefined);
  ok(`${e.slug} quotes no currency figure in its prose`, !/[$€£]\s?\d/.test(prose(e)));
  ok(`${e.slug} quotes no bare currency amount`, !/\b\d+\s*(usd|eur|egp)\b/i.test(prose(e)));
  ok(`${e.slug} is not marked instantly bookable`, e.bookable !== true);
  ok(`${e.slug} offers no paid extras`, (e.extras ?? []).length === 0);
}

// ---------------------------------------------------------------------------
// 3. Nothing claims a supplier, a permit or a permission we do not have.
//
// The banned phrasing is the confident kind. "Our artisan" is a claim about a
// relationship; "an artisan we arrange" is a description of what we do.
// ---------------------------------------------------------------------------
const OVERCLAIM = [
  /\bour (artisan|calligrapher|photographer|workshop|partner|supplier)\b/i,
  /\bwe have (a|an) (permit|licence|license|permission)\b/i,
  /\bpermits? (are|is) included\b/i,
  /\bguaranteed\b/i,
  /\bexclusive (access|partnership)\b/i,
];
for (const e of THEMED) {
  for (const pattern of OVERCLAIM) {
    ok(`${e.slug} makes no unverified claim matching ${pattern}`, !pattern.test(prose(e)));
  }
}

// ---------------------------------------------------------------------------
// 4. The products whose feasibility is genuinely open say so on the page.
//
// Each of these was researched to a specific unknown, and the unknown is the
// thing a customer would otherwise assume we had settled.
// ---------------------------------------------------------------------------
const MUST_DISCLOSE: [string, RegExp, string][] = [
  [
    "wadi-degla-hike-stargazing",
    /have not confirmed the current permit process/i,
    "no official source confirms the protectorate's overnight camping permit process",
  ],
  [
    "city-of-the-dead-heritage-walk",
    /UNESCO has stated it was not consulted/i,
    "demolition has been clearing parts of Al-Qarafa since 2023",
  ],
  [
    "arabic-calligraphy-workshop-cairo",
    /public programmes on their own calendars, not ours/i,
    "the Gayer-Anderson and Bayt Al-Sinnari programmes are not ours to sell",
  ],
  [
    "cairo-metal-engraving-workshop",
    /We arrange the artisan for your date/i,
    "no artisan is under contract",
  ],
  [
    "zamalek-private-photoshoot",
    /professional and commercial shoots.*are a different matter/i,
    "Egypt's 2022 rules exempt personal photography only",
  ],
  [
    "photographer-by-the-hour",
    /some require a permit we have to arrange in advance/i,
    "ticketed sites have their own professional-photography rules",
  ],
  [
    "wadi-el-natrun-monasteries",
    /varies by day, by feast and by fasting season/i,
    "monastery access is not ours to promise",
  ],
];
for (const [slug, pattern, why] of MUST_DISCLOSE) {
  const e = bySlug.get(slug);
  ok(`${slug} exists`, e !== undefined);
  if (e) ok(`${slug} discloses that ${why}`, pattern.test(prose(e)));
}

// ---------------------------------------------------------------------------
// 5. Consent and children, on every product that puts a camera in a street.
//
// Egyptian law requires a person's consent before they are photographed and
// does not permit photographing children. A photography product that does not
// say so is selling a customer into a problem.
// ---------------------------------------------------------------------------
for (const e of THEMED.filter((x) => x.theme === "photography")) {
  ok(
    `${e.slug} states the consent rule`,
    /consent before (they are photographed|photographing a person)|written consent before photographing/i.test(prose(e))
  );
  ok(`${e.slug} states that children are not photographed`, /photographing children is not permitted/i.test(prose(e)));
}

// ---------------------------------------------------------------------------
// 6. The three photography products are told apart, in writing.
//
// A shoot OF you, a lesson in shooting, and a photographer for hire are three
// different purchases. Each one points at the others so nobody buys the wrong
// one — which is also the only reason it is safe to list them side by side.
// ---------------------------------------------------------------------------
const CROSS: [string, RegExp][] = [
  ["zamalek-private-photoshoot", /the photography class is the other product/i],
  ["cairo-photography-class", /the Zamalek shoot or a photographer by the hour/i],
  ["photographer-by-the-hour", /the Zamalek photoshoot is the better product/i],
];
for (const [slug, pattern] of CROSS) {
  const e = bySlug.get(slug);
  ok(`${slug} distinguishes itself from the other two`, e !== undefined && pattern.test(prose(e)));
}
const byHour = bySlug.get("photographer-by-the-hour");
ok("the hourly service says it is a service, not a tour", /a service, not a tour/i.test(prose(byHour!)));

// ---------------------------------------------------------------------------
// 7. Two places people live are described as places people live.
// ---------------------------------------------------------------------------
const qarafa = bySlug.get("city-of-the-dead-heritage-walk")!;
ok("the necropolis walk leads on the fact that people live there", /People live here\./.test(prose(qarafa)));
ok(
  "it does not photograph residents without asking",
  /do not photograph residents or their homes without asking/i.test(prose(qarafa))
);
const mokattam = bySlug.get("mokattam-cave-church")!;
ok(
  "the cave church refuses to package the surrounding quarter as a sight",
  /we do not run a tour of anyone's neighbourhood or livelihood/i.test(prose(mokattam))
);
// "Garbage City" is the trade's own name for the quarter and the reason this
// product needed a line drawn around it. It must not appear in our copy.
for (const e of activities) {
  ok(`${e.slug} does not use the phrase "Garbage City"`, !/garbage city/i.test(prose(e)));
}

// ---------------------------------------------------------------------------
// 8. No camel market.
//
// Researched and rejected in October 2026: documented beatings at Birqash,
// Lonely Planet declining to recommend it, and the market named as the chief
// supplier of camels to the Giza ride trade — which this company sells. If it
// is ever added, it should be a decision somebody takes deliberately, not a
// product that reappears because the brief once listed it.
// ---------------------------------------------------------------------------
for (const e of activities) {
  ok(`${e.slug} is not the Birqash camel market`, !/birqash/i.test(prose(e)));
}

// ---------------------------------------------------------------------------
// 9. The Sanity round trip — the failure nobody sees.
// ---------------------------------------------------------------------------
const queries = readFileSync("src/sanity/queries.ts", "utf8");
const shape = readFileSync("src/lib/sanityShape.ts", "utf8");
const schema = readFileSync("src/sanity/schemaTypes/experience.ts", "utf8");
const listingProjection = queries.slice(queries.indexOf("experiencesQuery"), queries.indexOf("experienceDetailFields"));
ok("theme is projected by the experience LISTING query, which is what groups them", /theme/.test(listingProjection));
ok("theme is projected by the experience detail query", /destinations, theme,/.test(queries));
ok("theme falls back to the content file in hardenExperience", /theme: experience\.theme \?\? local\?\.theme/.test(shape));
ok("theme is editable in the Studio schema", /name: "theme"/.test(schema));

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`check-experience-collections: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log(
  `check-experience-collections: ok — ${THEMED.length} experiences across ${experienceThemes.length} collections, ` +
    `none carrying a price, a bookable flag or a claimed artisan, permit or partnership; the seven products with an ` +
    `open question each disclose it; the photography products all state the consent rule and point at one another so ` +
    `nobody buys the wrong one; no neighbourhood is sold as a sight; and theme survives the Sanity round trip.`
);
