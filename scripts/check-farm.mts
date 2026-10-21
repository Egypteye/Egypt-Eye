import { readFileSync } from "node:fs";
import { activities } from "../src/content/activities";

// The Dahshur farm day, and the promises it must not make.
//
// This product is unusual in that its headline draw is seasonal. The farm's
// fresh date harvest happens in August and in no other month, and the page
// used to describe "how the date harvest works" as simply part of the visit —
// which reads, in February, as a promise of fruit on the palms. A guest who
// books for that reason has been mis-sold by a sentence nobody thought was a
// claim.
//
// Everything here is either a fact the owner confirmed or a hedge. The
// varieties grown are NOT confirmed, so naming one is an invention; the day's
// programme bends to the season and the farm's own work, so guaranteeing an
// activity is a promise we do not control.

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const farm = activities.find((a) => a.slug === "dahshur-village-farm-experience");
if (!farm) {
  console.error("check-farm: the Dahshur farm experience is missing from activities.ts");
  process.exit(1);
}

const steps = farm.steps ?? [];
const goodToKnow = farm.goodToKnow ?? [];
const options = farm.enquiryOptions ?? [];

// Every piece of customer-facing prose this product owns, in one string.
const prose = [
  farm.title,
  farm.description,
  farm.location ?? "",
  farm.duration,
  ...steps.map((s) => `${s.title} ${s.description}`),
  ...farm.included,
  ...goodToKnow,
  ...options,
].join(" ");
const lower = prose.toLowerCase();

// ---------------------------------------------------------------------------
// 1. The harvest is August, and the page says so where it matters.
// ---------------------------------------------------------------------------
const seasonLine = goodToKnow.find((g) => /fresh date harvest/i.test(g)) ?? "";
ok("good-to-know carries the seasonal harvest statement", seasonLine !== "");
ok("the statement names August", /August/.test(seasonLine));
ok(
  "the statement says fresh dates cannot be guaranteed outside August",
  /cannot be guaranteed outside August/i.test(seasonLine)
);
ok(
  "the statement offers what IS available year-round: varieties and date products",
  /varieties/i.test(seasonLine) && /date products/i.test(seasonLine)
);
ok(
  "August is named as the month to plan around for fresh dates",
  goodToKnow.some((g) => /August/.test(g) && /(plan around|main reason)/i.test(g))
);

// ---------------------------------------------------------------------------
// 2. No sentence promises fresh dates or harvesting without its season.
//
// Checked per field rather than over the whole page: a hedge sitting in
// good-to-know does not qualify a promise made four paragraphs earlier in a
// step description, and the guest reading the itinerary may never reach it.
// ---------------------------------------------------------------------------
const PROMISE = /\b(fresh dates|harvest the|harvesting dates|pick(ing)? dates|dates off the (tree|palm))\b/i;
const HEDGE = /\b(August|seasonal|cannot be guaranteed|rather than fruit off the tree)\b/i;
for (const field of [farm.description, ...steps.map((s) => s.description), ...farm.included]) {
  if (PROMISE.test(field)) {
    ok(`a fresh-date promise carries its season in the same breath: "${field.slice(0, 60)}…"`, HEDGE.test(field));
  }
}

// ---------------------------------------------------------------------------
// 3. No variety is named. The owner did not confirm any.
// ---------------------------------------------------------------------------
for (const banned of ["hayani", "haiany", "dark red", "purple", "almost-black", "almost black"]) {
  ok(`no unconfirmed date variety claimed: "${banned}"`, !lower.includes(banned));
}

// ---------------------------------------------------------------------------
// 4. The child policy is stated, as a rate and never as a figure.
// ---------------------------------------------------------------------------
const childLine = goodToKnow.find((g) => /children under 12/i.test(g)) ?? "";
ok("the child policy is in good-to-know", childLine !== "");
ok("it states half the adult rate", /half the adult rate/i.test(childLine));

// ---------------------------------------------------------------------------
// 5. No price anywhere. This product quotes by enquiry and must keep doing so.
// ---------------------------------------------------------------------------
ok("the product carries no price", farm.price.amount === null);
ok("no currency figure appears in the prose", !/[$€£]\s?\d/.test(prose));
ok("no 'per person' figure appears", !/\d+\s*(usd|eur|egp)\b/i.test(prose));

// ---------------------------------------------------------------------------
// 6. The day's programme is offered, never guaranteed.
// ---------------------------------------------------------------------------
ok(
  "the page says which activities run depends on season, weather and the farm",
  goodToKnow.some((g) => /depends on the season/i.test(g) && /weather/i.test(g))
);
for (const seasonal of ["sunset", "evening gathering"]) {
  const step = steps.find((s) => `${s.title} ${s.description}`.toLowerCase().includes(seasonal));
  ok(
    `the ${seasonal} is hedged where it is described`,
    step !== undefined &&
      /\b(subject to|dependent|depends|weather)\b/i.test(`${step.title} ${step.description}`)
  );
}

// ---------------------------------------------------------------------------
// 7. The food is examples, not a menu anyone has to honour.
// ---------------------------------------------------------------------------
const tableStep = steps.find((s) => /feteer|mahshi/i.test(s.description));
ok("the meal is described somewhere", tableStep !== undefined);
ok(
  "the meal is framed as examples, confirmed with the farm",
  tableStep !== undefined &&
    /\b(examples|not a fixed menu)\b/i.test(tableStep.description) &&
    /confirmed with the farm/i.test(tableStep.description)
);

// ---------------------------------------------------------------------------
// 8. The combined day names its three sites and admits it needs planning.
// ---------------------------------------------------------------------------
const combined = goodToKnow.find((g) => /Saqqara/i.test(g) && /combined/i.test(g)) ?? "";
ok("the combined itinerary is described", combined !== "");
for (const site of ["Bent Pyramid", "Red Pyramid", "Saqqara"]) {
  ok(`the combined day names the ${site}`, combined.includes(site));
}
ok("it offers hotel pickup and drop-off", /pickup and drop-off/i.test(combined));
ok(
  "it says the schedule is checked rather than promised",
  /early start/i.test(combined) && /(opening hours|driving times)/i.test(combined)
);

// ---------------------------------------------------------------------------
// 9. The location the owner gave.
// ---------------------------------------------------------------------------
ok("the location names the Saqqara Tourist Road", /Saqqara Tourist Road/i.test(farm.location ?? ""));
ok(
  "the 5 km reference point is on the page",
  goodToKnow.some((g) => /5\s?km/i.test(g) && /Saqqara/i.test(g))
);
// No map link has been confirmed for the farm. If one is ever added it must be
// a real URL somebody opened, not a search string assembled from the address.
ok("no invented map URL", !/maps\.(google|app\.goo)/i.test(prose));

// ---------------------------------------------------------------------------
// 10. The enquiry options reach the form — the Sanity-wins trap.
//
// A field added to the content file but missing from the GROQ projection or
// from hardenExperience is EMPTY in production for any product that has a
// Studio document, which this one does. It looks perfect locally. These three
// assertions are the only thing standing between that and a silent regression.
// ---------------------------------------------------------------------------
ok("the farm offers enquiry options", options.length > 0);
ok("the options cover the meal choice", options.some((o) => /breakfast/i.test(o)) && options.some((o) => /lunch/i.test(o)));
ok("the options cover the combined day", options.some((o) => /Saqqara/i.test(o)));
ok("the options cover a tailored itinerary", options.some((o) => /tailored itinerary/i.test(o)));
ok("no option carries a price", !options.some((o) => /[$€£]\s?\d/.test(o)));

const queries = readFileSync("src/sanity/queries.ts", "utf8");
const shape = readFileSync("src/lib/sanityShape.ts", "utf8");
const schema = readFileSync("src/sanity/schemaTypes/experience.ts", "utf8");
ok("enquiryOptions is projected by the experience detail query", /enquiryOptions/.test(queries));
ok("enquiryOptions falls back to the content file in hardenExperience", /enquiryOptions: arr\(/.test(shape));
ok("enquiryOptions is editable in the Studio schema", /name: "enquiryOptions"/.test(schema));

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`check-farm: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log(
  `check-farm: ok — the August-only date harvest is stated and no sentence promises fresh dates without it, ` +
    `no variety is invented, children under 12 are half the adult rate with no figure anywhere, the seasonal ` +
    `activities are hedged where they are described, the food is examples confirmed with the farm, the combined ` +
    `Dahshur-and-Saqqara day names its three sites and admits it needs checking, and the ${options.length} enquiry ` +
    `options survive the Sanity round trip.`
);
