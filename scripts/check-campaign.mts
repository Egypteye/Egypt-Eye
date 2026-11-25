/**
 * Guards the "Shakira let you down? Egypt Eye got you." campaign.
 *
 * This campaign is unusually easy to break quietly, because almost everything
 * that matters about it is a fact rather than a behaviour. Six ways it goes
 * wrong, none of which errors or fails a build:
 *
 *   1. A DATE DRIFTS. The brief fixes the mapping exactly: package 1 is
 *      28 Nov alone, package 2 is 27–28, packages 3 and 4 are 26–28, and
 *      every one of them ends at the party on the 28th. A tidy-up that
 *      renumbers a day, or an "extend the campaign" edit that pushes a
 *      package past the party, sells a journey that cannot be run.
 *
 *   2. A SECOND PARTY APPEARS. There is ONE party. Four packages each
 *      ending at "the villa party" on four different evenings is the same
 *      words and a different, much more expensive, product.
 *
 *   3. THE GRAND EGYPTIAN MUSEUM FALLS OUT OF A GIZA DAY. Confirmed as part
 *      of this campaign, in writing, and not optional. It is one line in a
 *      shared stop list, so losing it from one package is a one-character
 *      edit nobody would notice.
 *
 *   4. A VENUE, A TIME OR A PRICE GETS PUBLISHED. The villa is not booked,
 *      no schedule is agreed and no price was supplied. A placeholder
 *      address on a page selling a night out is the single most damaging
 *      thing this campaign could ship, and a "$" typed into a card is a
 *      commitment on a live site taking card payments.
 *
 *   5. THE FELUCCA STOPS BEING MARKED AS UNCONFIRMED. It was specifically
 *      asked for and is specifically not yet arranged. Rendering it as a
 *      flat inclusion promises a boat.
 *
 *   6. THE ENQUIRY TRUSTS THE CLIENT. The package name, dates and duration
 *      must be looked up from the config by id. A body that can supply its
 *      own package name is a quote written against an itinerary nobody runs.
 *
 * Every assertion below was proven by reverting the thing it guards and
 * watching it go red (CLAUDE.md §4).
 */
import { readFileSync } from "node:fs";
import {
  CAMPAIGN_ACTIVE,
  CAMPAIGN_COPY,
  PACKAGES,
  PARTY_DATE,
  VILLA_PARTY,
  campaignDate,
  campaignFaqs,
  HERO_IMAGE,
  packageDateRange,
  partyIsUpcoming,
} from "../src/content/shakiraCampaign";
import { validateCampaignEnquiry } from "../src/lib/campaign/enquiry";
import { tours as localTours } from "../src/content/tours";
import { isHiddenTour } from "../src/content/hiddenTours";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const read = (path: string) => readFileSync(path, "utf8");

const PAGE = read("src/app/[locale]/(site)/shakira-got-you/page.tsx");
const FORM = read("src/app/[locale]/(site)/shakira-got-you/CampaignEnquiryForm.tsx");
const ROUTE = read("src/app/api/campaign-enquiry/route.ts");
const PROMO = read("src/components/CampaignHomePromo.tsx");
const HOME = read("src/app/[locale]/(site)/page.tsx");
const CONTENT = read("src/content/shakiraCampaign.ts");

// ---------------------------------------------------------------------------
// 1. The date mapping, exactly as the brief fixes it.
ok("the party is not 28 November 2026", PARTY_DATE === "2026-11-28");

const EXPECTED: Record<string, string[]> = {
  giza: ["2026-11-28"],
  "cairo-giza": ["2026-11-27", "2026-11-28"],
  "giza-fayoum-cairo": ["2026-11-26", "2026-11-27", "2026-11-28"],
  "giza-alexandria-cairo": ["2026-11-26", "2026-11-27", "2026-11-28"],
};

ok(
  `the campaign has ${PACKAGES.length} packages, not the four the brief specifies`,
  PACKAGES.length === 4
);

for (const [id, dates] of Object.entries(EXPECTED)) {
  const pkg = PACKAGES.find((p) => p.id === id);
  ok(`package "${id}" is missing from the campaign`, pkg !== undefined);
  if (!pkg) continue;

  ok(
    `package "${id}" runs ${pkg.days.map((d) => d.date).join(", ")} — the brief fixes it at ${dates.join(", ")}`,
    pkg.days.length === dates.length && pkg.days.every((d, i) => d.date === dates[i])
  );
  ok(
    `package "${id}" says ${pkg.durationDays} days but has ${pkg.days.length} days of itinerary`,
    pkg.durationDays === pkg.days.length
  );
  // Nothing may be scheduled after the party. A package whose last day is
  // the 29th has quietly become a different product.
  ok(
    `package "${id}" does not end on the party date`,
    pkg.days[pkg.days.length - 1].date === PARTY_DATE
  );
  for (const day of pkg.days) {
    ok(
      `package "${id}" has a day on ${day.date}, after the party`,
      day.date <= PARTY_DATE
    );
  }
}

// ---------------------------------------------------------------------------
// 2. One party, on one date, at the end of every package.
const partyDays = PACKAGES.flatMap((p) => p.days.filter((d) => d.endsAtParty));
ok(
  `${partyDays.length} days are marked as ending at the party, for ${PACKAGES.length} packages — there must be exactly one each`,
  partyDays.length === PACKAGES.length
);
ok(
  "a day ending at the party is not on the party date — that is a second party",
  partyDays.every((d) => d.date === PARTY_DATE)
);
for (const pkg of PACKAGES) {
  const marked = pkg.days.filter((d) => d.endsAtParty);
  ok(`package "${pkg.id}" marks ${marked.length} days as ending at the party`, marked.length === 1);
  ok(
    `package "${pkg.id}" ends at the party on a day that is not its last`,
    pkg.days[pkg.days.length - 1].endsAtParty === true
  );
  // The party has to appear as a stop, not only as a flag, or the itinerary
  // a traveller reads never mentions the thing they came for.
  const stops = pkg.days[pkg.days.length - 1].stops.map((s) => s.label.toLowerCase());
  ok(
    `package "${pkg.id}" never names the villa party in its final day's stops`,
    stops.some((s) => s.includes("villa party"))
  );
}

// ---------------------------------------------------------------------------
// 3. The Grand Egyptian Museum is in every Giza day. Confirmed, not optional.
const gizaDays = PACKAGES.flatMap((p) =>
  p.days.filter((d) => d.place.toLowerCase().includes("giza")).map((d) => ({ pkg: p.id, day: d }))
);
ok("no package has a Giza day at all", gizaDays.length >= 4);
for (const { pkg, day } of gizaDays) {
  ok(
    `package "${pkg}" has a Giza day on ${day.date} with no Grand Egyptian Museum — it is confirmed for this campaign, not optional`,
    day.stops.some((s) => /grand egyptian museum/i.test(s.label))
  );
  ok(
    `package "${pkg}" has a Giza day on ${day.date} with no photoshoot`,
    day.stops.some((s) => /photoshoot/i.test(s.label))
  );
  ok(
    `package "${pkg}" has a Giza day on ${day.date} with no Pyramids`,
    day.stops.some((s) => /pyramids/i.test(s.label))
  );
}
// GEM must never be rendered as pending: it is confirmed.
for (const { pkg, day } of gizaDays) {
  const gem = day.stops.find((s) => /grand egyptian museum/i.test(s.label));
  ok(
    `package "${pkg}" marks the Grand Egyptian Museum as pending — it is confirmed`,
    gem?.pending === undefined
  );
}

// ---------------------------------------------------------------------------
// 4. No venue, no time, no price. Anywhere.
ok(
  "the villa is marked as confirmed — if that is true, fill in the venue fields; if not, this is now claiming a booking we do not have",
  VILLA_PARTY.venueConfirmed === false
);
ok("a venue name is published while the villa is unconfirmed", VILLA_PARTY.venueName === null);
ok("a venue address is published while the villa is unconfirmed", VILLA_PARTY.venueAddress === null);
ok("a start time is published while the schedule is unconfirmed", VILLA_PARTY.startsAt === null);
ok("an end time is published while the schedule is unconfirmed", VILLA_PARTY.endsAt === null);

// A price on the page, in any of the shapes one actually gets typed.
for (const [label, source] of [
  ["the campaign page", PAGE],
  ["the campaign config", CONTENT],
  ["the enquiry form", FORM],
  ["the homepage band", PROMO],
] as const) {
  ok(
    `${label} contains a price — none was supplied, and a figure on a live travel page is a commitment`,
    !/\$\s?\d|\bUSD\s?\d|\bfrom \$|\d+\s?(?:USD|EUR|EGP)\b/.test(source)
  );
}

// Invented scarcity, in the forms this brief explicitly forbids.
const SCARCITY = [
  /only \d+ (?:spaces?|places?|seats?|spots?) left/i,
  /\d+ (?:spaces?|places?|seats?|spots?) (?:remaining|left)/i,
  /book(?:ing)? (?:by|before) \w+ \d+/i,
  /limited (?:spaces|places|availability)/i,
  /selling out/i,
];
for (const pattern of SCARCITY) {
  ok(
    `the campaign page claims scarcity (${pattern}) — no capacity or deadline was ever supplied`,
    !pattern.test(PAGE) && !pattern.test(CONTENT)
  );
}

// Accommodation and flights are not sold here, and the page has to say so.
ok(
  "the campaign never states that flights and accommodation are arranged by travellers",
  /flights and accommodation are arranged independently by travellers/i.test(CONTENT)
);
ok("the scope statement is never rendered on the page", PAGE.includes("CAMPAIGN_COPY.scope"));
// Egypt Eye sells tours. Asserted as the AFFIRMATIVE forms a marketer would
// actually write, because the FAQ legitimately contains the words "flights"
// and "accommodation" in its questions — matching the bare nouns would have
// made this pass or fail for the wrong reason.
//
// (An earlier version of this block ended in `|| true`, which is to say it
// asserted nothing at all. CLAUDE.md §4 exists because of edits like that.)
const SELLS_WHAT_IT_DOES_NOT = [
  /accommodation (?:is )?included/i,
  /(?:hotel|flights?) (?:is |are )?included/i,
  /includes? (?:your )?(?:hotel|accommodation|flights?|airfare)/i,
  /all[- ]inclusive/i,
  /hotel stay/i,
  /airport hotel package/i,
];
// The FAQ's own questions are "Is accommodation included?" and "Are flights
// included?", which match on purpose — so the questions come out of the
// corpus and the ANSWERS stay in. What is asserted is that nothing the
// campaign says claims to include them.
const CLAIMS_CORPUS = [
  CONTENT.replace(/^\s*question:.*$/gm, ""),
  PAGE,
  PROMO,
].join("\n");
for (const bad of SELLS_WHAT_IT_DOES_NOT) {
  ok(
    `the campaign advertises something it does not sell (${bad}) — Egypt Eye provides tours only`,
    !bad.test(CLAIMS_CORPUS)
  );
}

// The independence disclaimer is required, and must reach the page.
// The VALUE, not the file. Grepping the source passed with the disclaimer
// gutted, because the FAQ answer repeats the same sentence a hundred lines
// lower — the assertion was reading the wrong copy of the wording.
ok(
  "CAMPAIGN_COPY.disclaimer is not an independence disclaimer",
  /not affiliated with, sponsored by or endorsed by shakira/i.test(CAMPAIGN_COPY.disclaimer)
);
ok(
  "the disclaimer does not name the concert organisers",
  /concert organisers/i.test(CAMPAIGN_COPY.disclaimer)
);
ok(
  "the disclaimer is never rendered on the campaign page",
  (PAGE.match(/CAMPAIGN_COPY\.disclaimer/g) ?? []).length >= 1
);

// ---------------------------------------------------------------------------
// 5. The felucca stays marked as unconfirmed.
const feluccaStops = PACKAGES.flatMap((p) =>
  p.days.flatMap((d) => d.stops.filter((s) => /felucca/i.test(s.label)).map((s) => ({ pkg: p.id, s })))
);
ok(
  "the Nile felucca appears in no package — it was specifically requested for the Cairo day",
  feluccaStops.length >= 1
);
for (const { pkg, s } of feluccaStops) {
  ok(
    `package "${pkg}" lists the felucca as a flat inclusion — it is subject to operational confirmation, and rendering it plainly promises a boat`,
    typeof s.pending === "string" && s.pending.trim().length > 0
  );
}
// And the qualifier has to be rendered, not just stored.
// Both halves, separately. A single /stop\.pending/ grep passed when the
// CONDITION was neutered to `{false && (` — the value `{stop.pending}` further
// down still matched it, so the assertion was satisfied by the wrong line.
ok(
  "the page does not test a stop's `pending` before rendering it",
  /\{stop\.pending && \(/.test(PAGE)
);
ok(
  "the page never renders a stop's `pending` text, so every unconfirmed activity reads as included",
  /\{stop\.pending\}/.test(PAGE)
);

// ---------------------------------------------------------------------------
// 6. The enquiry is validated server-side and the package is looked up, never
//    trusted. These run the real function rather than reading the route.
const valid = {
  packageId: "giza",
  name: "Test Traveller",
  email: "t@example.com",
  phone: "+201234567890",
  travellers: "2 adults",
};
const accepted = validateCampaignEnquiry(valid);
ok("a complete, valid enquiry was refused", accepted.ok === true);
if (accepted.ok) {
  ok(
    "the resolved package name was not looked up from the config",
    accepted.value.packageName === PACKAGES[0].name
  );
  ok(
    "the resolved dates were not derived from the itinerary",
    accepted.value.packageDates === `${packageDateRange(PACKAGES[0])} 2026`
  );
  ok(
    "the party date carried to the team is not the campaign's party date",
    accepted.value.partyDate === `${campaignDate(PARTY_DATE)} 2026`
  );
}

// An unknown package is refused rather than passed through.
for (const bad of ["", "   ", "unknown-package", "giza; drop table", "GIZA"]) {
  ok(
    `an enquiry naming package ${JSON.stringify(bad)} was accepted`,
    validateCampaignEnquiry({ ...valid, packageId: bad }).ok === false
  );
}
// A client-supplied package NAME must never be able to override the lookup.
const spoofed = validateCampaignEnquiry({
  ...valid,
  // Deliberately extra fields the type does not declare, as a hostile body
  // would carry them.
  ...({ packageName: "Free Elite Package", packageDates: "1 January", partyDate: "whenever" } as object),
});
ok(
  "a body carrying its own packageName was able to set it — the team's email would quote an itinerary nobody runs",
  spoofed.ok === true && spoofed.value.packageName === PACKAGES[0].name
);

for (const bad of ["", "   ", "not-an-email", "a@b", "@example.com"]) {
  ok(
    `an enquiry with email ${JSON.stringify(bad)} was accepted`,
    validateCampaignEnquiry({ ...valid, email: bad }).ok === false
  );
}
for (const field of ["name", "phone", "travellers"] as const) {
  ok(
    `an enquiry with no ${field} was accepted`,
    validateCampaignEnquiry({ ...valid, [field]: "   " }).ok === false
  );
}
ok(
  "a non-string package id was accepted",
  validateCampaignEnquiry({ ...valid, packageId: 1 as unknown }).ok === false
);

// The route has to actually use it, store before sending, and carry the kind
// the migration permits.
ok("the campaign route does not call validateCampaignEnquiry", /validateCampaignEnquiry\s*\(/.test(ROUTE));
ok(
  "the campaign route records the enquiry under a kind other than 'campaign'",
  /kind:\s*"campaign"/.test(ROUTE)
);
// The CALL sites, not the import lines. Comparing bare identifiers passed on
// the broken ordering purely because `sendEmail` is imported above
// `recordEnquiry` — the assertion was reading the import block.
const storeAt = ROUTE.indexOf("await recordEnquiry({");
const sendAt = ROUTE.indexOf("await sendEmail({");
ok("the campaign route never calls recordEnquiry", storeAt !== -1);
ok("the campaign route never calls sendEmail", sendAt !== -1);
ok(
  "the campaign route sends before it stores — a refused send would lose the lead entirely",
  storeAt !== -1 && sendAt !== -1 && storeAt < sendAt
);
ok("the campaign route is not rate limited", /checkRateLimit\s*\(/.test(ROUTE));
ok("the campaign route has no honeypot", /body\.company/.test(ROUTE));
ok(
  "the campaign route keeps accepting enquiries after the campaign is switched off",
  /CAMPAIGN_ACTIVE/.test(ROUTE)
);
const MIGRATION = read("supabase/migrations/0039_enquiries_campaign_kind.sql");
ok(
  "migration 0039 does not permit the 'campaign' kind the route writes",
  /'campaign'/.test(MIGRATION)
);
for (const kind of ["tour_enquiry", "flying_dresses", "transfer", "shop_visit"]) {
  ok(
    `migration 0039 drops the existing '${kind}' kind — every historical row of that kind would fail the new constraint`,
    MIGRATION.includes(`'${kind}'`)
  );
}

// ---------------------------------------------------------------------------
// 6b. Every package card points at a REAL, VISIBLE tour that has a picture.
//
// This shipped broken. Package 3 pointed at wadi-el-hitan-whale-valley-safari,
// which is in content/hiddenTours.ts — a product the site deliberately
// withholds. getTours() filters hidden tours out, so the lookup returned
// nothing and the card rendered as a bare gold gradient beside three
// photographs. Nothing errored; the page just looked unfinished.
//
// The second half matters as much as the first: a campaign card is marketing
// for a tour, and pointing one at a withheld product advertises something the
// business has decided not to sell.
for (const pkg of PACKAGES) {
  const tour = localTours.find((t) => t.slug === pkg.imageSlug);
  ok(
    `package "${pkg.id}" points at tour "${pkg.imageSlug}", which does not exist`,
    tour !== undefined
  );
  ok(
    `package "${pkg.id}" points at "${pkg.imageSlug}", a HIDDEN tour — getTours() filters it out, so the card falls back to a bare gradient`,
    !isHiddenTour(pkg.imageSlug)
  );
  ok(
    `package "${pkg.id}" points at "${pkg.imageSlug}", which carries no image`,
    typeof tour?.image === "string" ? tour.image.length > 0 : tour?.image !== undefined
  );
}

// The hero needs its own picture for the same reason — and it must not be a
// tour lookup that can be filtered away underneath it.
ok("the hero has no image", HERO_IMAGE.url.startsWith("https://"));
ok("the hero image has no alt text", HERO_IMAGE.alt.trim().length > 10);
ok("the hero photograph is not credited", HERO_IMAGE.credit.trim().length > 0);
ok("the page does not render the hero image", PAGE.includes("HERO_IMAGE.url"));

// ---------------------------------------------------------------------------
// 7. The homepage stays the homepage.
ok("the campaign band is not on the homepage", /<CampaignHomePromo\s*\/>/.test(HOME));
// It must be the LAST thing rendered. The brief is explicit that the campaign
// must not dominate the homepage; a band that drifts up the page breaks that
// without breaking anything else.
const bandAt = HOME.indexOf("<CampaignHomePromo />");
const afterBand = HOME.slice(bandAt + "<CampaignHomePromo />".length);
ok(
  "the campaign band is no longer the last section on the homepage",
  !/<section/.test(afterBand)
);
ok(
  "the homepage band does not link to the campaign page",
  PROMO.includes("CAMPAIGN_COPY.path")
);
ok(
  "the homepage band renders even when the campaign is switched off",
  /if \(!CAMPAIGN_ACTIVE\) return null/.test(PROMO)
);
// The campaign must not have been added to the navigation.
const NAV = read("src/content/navGroups.ts");
const SITE = read("src/content/site.ts");
ok(
  "the campaign has been added to the navigation — it is a four-day campaign, not a section of the site",
  !NAV.includes(CAMPAIGN_COPY.path) && !SITE.includes(CAMPAIGN_COPY.path)
);

// ---------------------------------------------------------------------------
// 8. SEO: a derived canonical, no Event schema, and no stale sitemap entry.
ok(
  "the campaign page writes its own canonical instead of using alternatesFor — this is how the duplicate-canonical incident happened",
  /alternatesFor\(/.test(PAGE) && !/canonical:\s*["'`]/.test(PAGE)
);
ok(
  "the campaign page publishes Event structured data — an Event with no confirmed location or startDate is exactly the misleading markup Google penalises",
  !/"@type":\s*"Event"/.test(PAGE) && !/tripDepartureEventJsonLd/.test(PAGE)
);
ok("the campaign page publishes no FAQ structured data", /faqJsonLd\(/.test(PAGE));
const SITEMAP = read("src/lib/sitemapEntries.ts");
// The conditional spread itself. `SITEMAP.includes("CAMPAIGN_ACTIVE")` passed
// with the gate replaced by `...(true ? [`, because the import line still
// carried the identifier.
ok(
  "the sitemap offers the campaign unconditionally — a retired campaign spends crawl budget on a page that says it has ended",
  /\.\.\.\(CAMPAIGN_ACTIVE\s*\n?\s*\?/.test(SITEMAP)
);
ok("the sitemap does not list the campaign page at all", SITEMAP.includes("CAMPAIGN_COPY.path"));

// ---------------------------------------------------------------------------
// 9. The FAQ answers the twelve questions, and the required answer is exact.
const faqs = campaignFaqs();
ok(`the FAQ has ${faqs.length} entries, not the twelve the brief lists`, faqs.length === 12);
ok("an FAQ entry has an empty question or answer", faqs.every((f) => f.question.trim() && f.answer.trim()));
const ticket = faqs.find((f) => /proof of a shakira concert ticket/i.test(f.question));
ok("the FAQ never addresses whether a concert ticket is required", ticket !== undefined);
ok(
  "the concert-ticket answer is not the required wording — the campaign must not imply a ticket is needed",
  ticket?.answer ===
    "No. The experience is open to travellers generally. You do not need to provide proof of a concert ticket."
);
ok(
  "the FAQ never states that this is not an official Shakira event",
  faqs.some((f) => /not affiliated with, sponsored by or endorsed by shakira/i.test(f.answer))
);
ok(
  "the FAQ claims the venue is confirmed while VILLA_PARTY says it is not",
  faqs.some((f) => /venue confirmed/i.test(f.question) && /not yet/i.test(f.answer))
);

// ---------------------------------------------------------------------------
// 10. Analytics carries no personal data.
//
// Google's terms forbid it and an account found carrying it can be purged —
// and this form collects exactly the fields that would do it.
for (const [label, source] of [
  ["the enquiry form", FORM],
  ["the homepage tracker", read("src/components/CampaignPromoTracker.tsx")],
] as const) {
  const calls = source.match(/trackEvent\([\s\S]*?\}\s*\)/g) ?? [];
  ok(`${label} sends no analytics events at all`, label !== "the enquiry form" || calls.length > 0);
  for (const call of calls) {
    for (const field of ["name", "email", "phone", "notes", "travellers"]) {
      ok(
        `${label} passes the visitor's ${field} to analytics — Google's terms forbid it`,
        !new RegExp(`${field}\\s*:|form\\.get\\(["']${field}`).test(call)
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 11. partyIsUpcoming has to actually turn over. A campaign page still saying
//     "join us" in December is worse than one that has been taken down.
ok(
  "partyIsUpcoming is false the morning of the party",
  partyIsUpcoming(new Date("2026-11-28T06:00:00Z")) === true
);
ok(
  "partyIsUpcoming is still true in December",
  partyIsUpcoming(new Date("2026-12-01T00:00:00Z")) === false
);
ok(
  "partyIsUpcoming is false well before the campaign launches",
  partyIsUpcoming(new Date("2026-01-01T00:00:00Z")) === true
);
ok("CAMPAIGN_ACTIVE is false while the campaign is meant to be running", CAMPAIGN_ACTIVE === true);

// Dates are formatted in one place, from the ISO values, so the page cannot
// display a day that disagrees with the itinerary it came from.
ok("campaignDate does not format the party date as 28 November", campaignDate(PARTY_DATE) === "28 November");
ok(
  "packageDateRange does not derive a range from the itinerary",
  packageDateRange(PACKAGES[2]) === "26–28 November"
);
ok(
  "packageDateRange does not collapse a single-day package",
  packageDateRange(PACKAGES[0]) === "28 November"
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-campaign: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-campaign: ok — four packages on the fixed 26/27/28 November mapping, every one ending at ONE ` +
    `party on ${campaignDate(PARTY_DATE)}, the Grand Egyptian Museum confirmed in every Giza day, the ` +
    `felucca marked unconfirmed and rendered as such, no venue, no time, no price and no invented ` +
    `scarcity anywhere, the enquiry's package looked up server-side rather than trusted, the homepage ` +
    `band last and removable, a derived canonical with no Event schema, and no personal data in analytics.`
);
