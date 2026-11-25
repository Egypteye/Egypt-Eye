/**
 * Guards conversion tracking, whose failure mode is a report full of zeros.
 *
 * This check exists because of a real incident. GA4 was installed on
 * 1 November 2026 with page views and nothing else, and on 25 November the
 * owner asked why conversions had dropped. They had not dropped: not one
 * form, button or WhatsApp link had ever sent GA4 an event, so "Qualified
 * leads: 0" and "Converted leads: 0" every day for twenty-four days were
 * empty by construction rather than by decline.
 *
 * Nothing errored. Nothing failed a build. The reports were simply measuring
 * a site that never spoke. Five ways it silently returns to that state:
 *
 *   1. A CONVERSION FORM STOPS REPORTING. Someone refactors a submit handler
 *      and the trackLead call goes with it. The form still works, the lead
 *      still arrives, and the funnel quietly loses a surface.
 *
 *   2. THE WHATSAPP LISTENER IS UNMOUNTED. It is one component in the layout
 *      covering the site's biggest conversion route — three of the six CTAs
 *      on a tour page. Remove it and that route goes dark everywhere at once.
 *
 *   3. A LEAD IS COUNTED ON CLICK RATHER THAN ON SUCCESS. Abandoned and
 *      rejected submissions become conversions, and the numbers stop
 *      reconciling with the inbox.
 *
 *   4. THE HONEYPOT'S FAKE SUCCESS IS TRACKED. EnquiryModal shows bots the
 *      same confirmation as humans. Counting it puts bot traffic directly
 *      into the conversion figures.
 *
 *   5. PERSONAL DATA REACHES GOOGLE. These are the forms that collect names,
 *      emails and phone numbers. Google's terms forbid carrying them and an
 *      account found doing so can be purged.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { LEAD_SOURCES } from "../src/lib/analytics/leads";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};
const read = (p: string) => readFileSync(p, "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(full)) out.push(full);
  }
  return out;
}

const files = walk("src");

// ---------------------------------------------------------------------------
// 1. Every conversion surface still reports.
//
// Named explicitly rather than discovered, because the failure being guarded
// against is a surface going quiet — and a discovered list would shrink along
// with it and keep passing.
const MUST_TRACK: { file: string; source: string }[] = [
  { file: "src/components/EnquiryModal.tsx", source: LEAD_SOURCES.tourEnquiry },
  { file: "src/app/[locale]/(site)/customize/CustomizeForm.tsx", source: LEAD_SOURCES.customize },
  { file: "src/app/[locale]/(site)/transfers/TransferBookingForm.tsx", source: LEAD_SOURCES.transfer },
  { file: "src/components/ShopVisitForm.tsx", source: LEAD_SOURCES.shopVisit },
  { file: "src/app/[locale]/(site)/hotel-deals/RateRequestButton.tsx", source: LEAD_SOURCES.hotelRate },
  { file: "src/app/[locale]/(site)/collaborate/CollaborateForm.tsx", source: LEAD_SOURCES.collaborate },
  { file: "src/app/[locale]/(site)/travel-agents/TravelAgentForm.tsx", source: LEAD_SOURCES.travelAgent },
  { file: "src/app/[locale]/(site)/affiliate/AffiliateForm.tsx", source: LEAD_SOURCES.affiliate },
  { file: "src/components/TreasureRequestForm.tsx", source: LEAD_SOURCES.treasureRequest },
  { file: "src/components/NewsletterSignup.tsx", source: LEAD_SOURCES.newsletter },
  { file: "src/components/TripDepartures.tsx", source: LEAD_SOURCES.tripSeat },
];

for (const { file, source } of MUST_TRACK) {
  const src = read(file);
  ok(`${file} no longer calls trackLead — that conversion surface is unmeasured`, /trackLead\s*\(/.test(src));
  ok(
    `${file} does not report as "${source}" — the funnel cannot compare surfaces that are named inconsistently`,
    src.includes(source) || new RegExp(`LEAD_SOURCES\\.\\w+`).test(src)
  );
}

// ---------------------------------------------------------------------------
// 2. The WhatsApp listener is mounted. One component, the biggest route.
const layout = read("src/app/[locale]/layout.tsx");
ok(
  "OutboundTracker is not mounted in the layout — every WhatsApp, mailto and tel click on the site goes uncounted",
  /<OutboundTracker\s*\/>/.test(layout)
);
const trackerRaw = read("src/components/OutboundTracker.tsx");
// Comments STRIPPED before asserting. The first version of this check passed
// with `closest("a")` removed from the code, because the comment explaining
// why it is there still contained the string.
const tracker = trackerRaw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
ok("OutboundTracker does not listen for wa.me links", /wa\.me/.test(tracker));
ok(
  "OutboundTracker stopped using closest('a') — these links wrap spans and SVGs, so the click target is a child and every nested button would be missed",
  /closest\(\s*["']a["']\s*\)/.test(tracker)
);
ok(
  "OutboundTracker no longer listens in the capture phase — some of these anchors sit inside components that stop propagation",
  /addEventListener\(\s*["']click["']\s*,\s*\w+\s*,\s*true\s*\)/.test(tracker)
);

// ---------------------------------------------------------------------------
// 3 & 4. Leads are counted on success, and never on the honeypot's fake one.
const modal = read("src/components/EnquiryModal.tsx");
const honeypotAt = modal.indexOf('if ((form.get("company") as string)?.trim())');
const firstTrack = modal.indexOf("trackLead(");
ok(
  "EnquiryModal tracks a lead at or before the honeypot branch — bot submissions would be counted as conversions",
  honeypotAt === -1 || (firstTrack > honeypotAt + 200)
);
ok(
  "EnquiryModal tracks the lead before the response is checked — abandoned and rejected attempts would count",
  modal.indexOf("if (!res.ok)") < firstTrack
);

for (const { file } of MUST_TRACK) {
  const src = read(file);
  const t = src.indexOf("trackLead(");
  const okCheck = Math.max(src.indexOf("if (!res.ok)"), src.indexOf("res.ok"));
  ok(
    `${file} calls trackLead before it knows the server accepted the submission`,
    t === -1 || okCheck === -1 || okCheck < t
  );
}

// ---------------------------------------------------------------------------
// 5. No personal data is ever handed to Google.
//
// Scans every trackLead / trackEvent / trackOutboundContact call in the app
// for the field names these forms collect. Deliberately matches the ARGUMENT
// text rather than the whole file: a component is allowed to have a variable
// called `email`, it just may not pass it.
const PII = ["name", "email", "phone", "message", "notes", "whatsapp", "handle", "address"];
for (const file of files) {
  // The analytics library DEFINES these helpers, so its own signatures
  // (`function trackEvent(name: string, ...)`) look like calls passing a
  // visitor's name. This scan is about callers; the library's own contents
  // are asserted separately in section 6.
  if (file.replace(/\\/g, "/").includes("src/lib/analytics/")) continue;
  const src = read(file);
  const calls = src.match(/track(?:Lead|Event|OutboundContact)\s*\([\s\S]{0,400}?\)\s*;/g) ?? [];
  for (const call of calls) {
    // The registry constants legitimately contain these words (e.g.
    // LEAD_SOURCES.newsletter). Strip them before looking.
    const args = call.replace(/LEAD_SOURCES\.\w+/g, "").replace(/"[a-z_]*_?(?:source|channel)"/g, "");
    for (const field of PII) {
      ok(
        `${file} passes "${field}" to analytics — Google's terms forbid carrying personal data`,
        !new RegExp(`\\b${field}\\s*:|\\bform\\.get\\(["']${field}|\\b(?:draft|values|data)\\.${field}\\b`, "i").test(args)
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 6. generate_lead stays the event name.
//
// It is a GA4 RECOMMENDED event, which is why it can be marked a key event in
// the UI without custom definitions. Renaming it to something bespoke would
// leave the owner — who does not use the GA4 console — with reports that stay
// empty for exactly the reason this check exists.
const leads = read("src/lib/analytics/leads.ts");
ok(
  'the lead event is no longer named "generate_lead" — GA4 would need a hand-built custom definition before it counts',
  /trackEvent\(\s*["']generate_lead["']/.test(leads)
);
ok("the lead event carries no lead_source, so surfaces cannot be compared", /lead_source:/.test(leads));
ok(
  "outbound contact is reported as generate_lead — a WhatsApp tap is not a confirmed lead and would inflate the funnel",
  !/trackEvent\(\s*["']generate_lead["'][\s\S]{0,200}contact_channel/.test(leads)
);

// Every source in the registry is distinct; two surfaces sharing a label
// silently merge in every report built on it.
const values = Object.values(LEAD_SOURCES);
ok("two lead sources share a label, so their reports merge", new Set(values).size === values.length);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-lead-tracking: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-lead-tracking: ok — ${MUST_TRACK.length} conversion surfaces each report a named lead, every one only ` +
    `after the server accepted it, the honeypot's fake success is excluded, the WhatsApp listener is mounted and ` +
    `still catches nested anchors in the capture phase, the event stays GA4's recommended generate_lead, and no ` +
    `call anywhere passes a visitor's name, email, phone or message to Google.`
);
