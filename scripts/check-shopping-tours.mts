import { readFileSync } from "node:fs";
import {
  SHOPPING_TOURS_PATH,
  VISIT_HOURS_KNOWN,
  visitAreaBySlug,
  visitAreas,
  hasConfirmedShoppingTour,
  shoppingAreas,
  shoppingToursPage,
} from "../src/content/shoppingTours";
import { FOOTER_SECTIONS } from "../src/content/navGroups";

// The shopping-tour page, and the promises it must not make.
//
// Giza, Old Cairo and Khan el-Khalili are real places, so naming them is
// reporting. Everything past that — which workshops, how long, what it costs,
// who picks you up, which days it runs — is a commercial arrangement nobody
// has confirmed. This file is what stops one appearing by accident.

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const page = readFileSync("src/app/[locale]/(site)/shopping-tours/page.tsx", "utf8");
const prose = [
  shoppingToursPage.title,
  shoppingToursPage.intro,
  ...shoppingToursPage.body.map((b) => `${b.title} ${b.body}`),
  ...shoppingAreas.map((a) => `${a.name} ${a.about} ${a.knownFor.join(" ")}`),
].join(" ");

// ---------------------------------------------------------------------------
// 1. The two areas exist and are described as PLACES, not as products.
// ---------------------------------------------------------------------------
ok("both areas are present", shoppingAreas.length === 2);
ok("Giza is one of them", shoppingAreas.some((a) => a.slug === "giza"));
ok("Old Cairo is the other", shoppingAreas.some((a) => a.slug === "old-cairo"));
ok("every area says what the quarter makes", shoppingAreas.every((a) => a.knownFor.length >= 3));
ok("every area has a slug and a name", shoppingAreas.every((a) => a.slug.length > 1 && a.name.length > 1));
ok("no area slug is repeated", new Set(shoppingAreas.map((a) => a.slug)).size === shoppingAreas.length);

// ---------------------------------------------------------------------------
// 2. NOTHING COMMERCIAL IS INVENTED.
//
//    This is the whole reason the file exists. Until an area is confirmed it
//    carries no itinerary, no duration, no price, no inclusions, no pickup
//    and no availability — and the page shows none of those either.
// ---------------------------------------------------------------------------
const unconfirmed = shoppingAreas.filter((a) => !a.confirmed);
ok("no area is confirmed yet", unconfirmed.length === shoppingAreas.length);
ok("nothing is confirmed site-wide", !hasConfirmedShoppingTour());

for (const a of unconfirmed) {
  ok(`${a.slug} has no invented duration`, a.duration === undefined);
  ok(`${a.slug} has no invented price`, a.price === undefined);
  ok(`${a.slug} has no invented itinerary`, (a.itinerary ?? []).length === 0);
  ok(`${a.slug} has no invented inclusions`, (a.included ?? []).length === 0);
  ok(`${a.slug} has no invented pickup`, a.pickup === undefined);
  ok(`${a.slug} has no invented availability`, a.availability === undefined);
}

// The page must GATE on the flag, not merely happen to have nothing to show.
ok("the page gates the commercial detail", /area\.confirmed \? \(/.test(page));
ok("an unconfirmed area says the day is built per trip", /settled in the conversation rather than fixed here/.test(page));

// ---------------------------------------------------------------------------
// 3. No partnership, no vetting, no authenticity guarantee, no fixed price.
//
//    Run against the prose with comments stripped — a guard that matches its
//    own explanatory comment has caught this project out three times.
// ---------------------------------------------------------------------------
const claims: [string, RegExp][] = [
  ["partner or partnership", /\bpartners?\b|\bpartnership\b/i],
  ["vetted or approved", /\bvetted\b|\bapproved\b|\bcertified\b|\bendorsed\b/i],
  ["guaranteed authenticity", /\bguarantee\w*\b|\bauthentic\w*\b|\bgenuine\b/i],
  ["best or only in Cairo", /\bbest in\b|\bonly\b.*\bin Cairo\b|\bfinest\b/i],
  ["a fixed price", /\bfixed price\b|\bfrom \$\d|\bonly \$\d/i],
  ["a fixed schedule", /\bevery (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b|\bdaily departures?\b/i],
  ["a named shop", /\bEmporium\b|\bBazaar of\b|\bWorkshop of\b/i],
];
for (const [what, pattern] of claims) {
  ok(`the copy claims no ${what}`, !pattern.test(prose));
  ok(`the page claims no ${what}`, !pattern.test(code(page)));
}

// One positive claim IS made and must stay, because it is both true and the
// reason a traveller should believe the rest.
ok("the page says we take no cut", /do not take a cut/i.test(prose));
ok("and that you pay the shop directly", /pay the shop directly/i.test(prose));
ok("and admits where we have not been", /if we have not been somewhere ourselves/i.test(prose));

// ---------------------------------------------------------------------------
// 4. The CTA is an enquiry, not a checkout — there is no product to sell yet.
// ---------------------------------------------------------------------------
ok("the action is an enquiry", /Ask about a shopping day/.test(page));
ok("there is no buy button", !/Buy now|Book now|Pay now|Add to cart/i.test(code(page)));
ok("asking is free and says so", /Nothing is charged for asking/.test(page));

// ---------------------------------------------------------------------------
// 5. The page is reachable. A CTA pointing at a dead link was the specific
//    thing the brief ruled out.
// ---------------------------------------------------------------------------
ok("the path is the one the page is built at", SHOPPING_TOURS_PATH === "/shopping-tours");
const footerLinks = FOOTER_SECTIONS.flatMap((g) => g.links.map((l) => l.href));
ok("the footer links to it", footerLinks.includes(SHOPPING_TOURS_PATH));
const sitemap = readFileSync("src/lib/sitemapEntries.ts", "utf8");
ok("the sitemap includes it", sitemap.includes("/shopping-tours"));
const category = readFileSync("src/app/[locale]/(site)/boutique/[category]/page.tsx", "utf8");
ok("the Boutique points at it", /SHOPPING_TOURS_PATH/.test(category));
ok(
  "and only where the category has an in-person path",
  /\{category\.inEgypt && \([\s\S]{0,900}?SHOPPING_TOURS_PATH/.test(category),
);

// ---------------------------------------------------------------------------
// 6. The private shop visit.
//
//    A REQUEST, never an appointment. Nobody has supplied the shop's opening
//    hours, so a page that told a traveller to turn up at eleven on Thursday
//    would be inventing one.
// ---------------------------------------------------------------------------
const form = readFileSync("src/components/ShopVisitForm.tsx", "utf8");
const route = readFileSync("src/app/api/shop-visit/route.ts", "utf8");
const templates = readFileSync("src/lib/email/templates.ts", "utf8");

ok("opening hours are recorded as unknown", VISIT_HOURS_KNOWN === false);
ok("two areas are offered", visitAreas.length === 2);
ok("Old Cairo is one", Boolean(visitAreaBySlug("old-cairo")));
ok("Giza is the other", Boolean(visitAreaBySlug("giza")));
// The owner asked for Giza as an AREA, because several shops are in reach.
ok("Giza is described as an area, not an address", /around the pyramids/i.test(visitAreaBySlug("giza")!.name));
ok("Giza holds several shops", (visitAreaBySlug("giza")?.pins.length ?? 0) >= 3);
ok("every pin has a map link", visitAreas.every((a) => a.pins.every((pin) => pin.mapUrl.startsWith("https://"))));

// THE PINS ARE TEAM-ONLY. A map link to a third party's shop sitting on our
// page reads as a partnership, and we have claimed none.
ok("the page passes only slug, name and blurb to the form", /areas=\{visitAreas\.map\(\(a\) => \(\{ slug: a\.slug, name: a\.name, blurb: a\.blurb \}\)\)\}/.test(category));
ok("no map link is rendered in the category page", !/maps\.app\.goo\.gl/.test(category));
ok("no map link is rendered in the form", !/maps\.app\.goo\.gl|mapUrl/.test(form));
ok("the pins go in the team email only", /mapUrls/.test(templates));
const customerEmail = templates.slice(
  templates.indexOf("export function shopVisitCustomerEmail"),
  templates.indexOf("export function shopVisitTeamEmail")
);
ok("the customer email carries no map link", !/mapUrls/.test(customerEmail));

// It is a request. Said in the form, and in both emails.
ok("the form says it is not a booking", /A request, not a booking/.test(form));
ok("the success state repeats it", /Nothing is booked and no time is held/.test(form));
ok("the emails share one not-confirmed line", /VISIT_NOT_CONFIRMED/.test(templates));
ok("that line denies a booking", /This is a request, not a booking/.test(templates));
ok("no opening hour is stated anywhere", !/\b(open|opens|closing|closes) (at|from) \d/i.test(code(form) + code(category)));

// Success is only reported once the team's email actually went out.
ok("a failed team email is an error, not a thank-you", /if \(!delivered\) \{[\s\S]{0,400}?status: 502/.test(route));
ok("the customer receipt is sent after, and cannot fail the request", route.indexOf("shopVisitTeamEmail") < route.indexOf("shopVisitCustomerEmail"));
ok("the area is looked up server-side, not trusted", /visitAreaBySlug\(areaSlug\) \?\? visitAreas\[0\]/.test(route));
ok("the route is rate limited", /bucket: "shop-visit"/.test(route));
ok("the honeypot is the shared one", /text\(body\.company/.test(route));
ok("the client ip comes from the proxy helper", /key: getClientIp\(request\)/.test(route));

// The visit is offered where choosing in person is the better answer, and
// not bolted onto every category.
// Anchored to the visit section itself: the file has an earlier
// `category.inEgypt` block, so a loose match would prove the wrong one.
const visitAt = category.indexOf('<section id="visit"');
ok("the visit section exists", visitAt > 0);
ok(
  "and renders only where the category has an in-person path",
  /\{category\.inEgypt && \(\s*$/.test(category.slice(Math.max(0, visitAt - 200), visitAt).trimEnd() + "\n"),
);
ok("the form is inside it", category.indexOf("ShopVisitForm", visitAt) > visitAt);
ok("it is anchored where the product pages link", /id="visit"/.test(category));

if (errors.length > 0) {
  console.error(`\ncheck-shopping-tours: ${errors.length} failure(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  "check-shopping-tours: ok — two real quarters described as places, no itinerary, duration, price, inclusion, " +
    "pickup or schedule invented for either, no partnership, vetting or authenticity claimed, the action is an " +
    "enquiry rather than a checkout, and the page is reachable from the footer, the sitemap and the Boutique.",
);
