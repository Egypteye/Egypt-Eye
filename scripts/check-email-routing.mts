/**
 * Guards which inbox each public form lands in.
 *
 * Every form on the site sent to one address — info@egypteyetravel.com, the
 * Reservations team's inbox. Creator collaboration applications went there
 * too, so Reservations triaged and forwarded them by hand and collaborations
 * queued behind trip bookings.
 *
 * Splitting a queue is easy to do and easy to undo by accident: the route
 * reads `site.contact`, and anyone writing `to: site.contact.email` — the
 * line every other route in the directory uses, and the obvious thing to
 * copy — silently sends collaborations back to Reservations. Nothing errors,
 * the email still arrives, and the only symptom is a team wondering why the
 * applications stopped. So the wiring is asserted rather than trusted.
 *
 * The address itself lives in `src/content/site.ts` and in the Studio schema,
 * because of the rule in CLAUDE.md: a field present in the content file but
 * missing from the Studio schema reads as empty in production once a
 * siteSettings document exists. `contact` is merged rather than replaced in
 * getSiteSettingsInner, so a local-only field does survive today — but only
 * until someone adds a blank `collaborationsEmail` in Studio, which would
 * then win. Having the field in both places is what makes the address
 * editable by the owner, who has no terminal.
 */
import { readFileSync } from "node:fs";
import { site } from "../src/content/site";
import { collaborationRecipient } from "../src/lib/email/recipients";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

// ---------------------------------------------------------------------------
// The resolver itself, executed rather than read.
ok(
  "collaborationRecipient ignores the dedicated inbox and returns the general one",
  collaborationRecipient({ email: "general@x.com", collaborationsEmail: "team@x.com" }) ===
    "team@x.com"
);
ok(
  "collaborationRecipient returns undefined instead of falling back when the field is absent",
  collaborationRecipient({ email: "general@x.com" }) === "general@x.com"
);
for (const blank of ["", "   "]) {
  ok(
    `collaborationRecipient returns ${JSON.stringify(blank)} rather than falling back to the general inbox`,
    collaborationRecipient({ email: "general@x.com", collaborationsEmail: blank }) ===
      "general@x.com"
  );
}
ok(
  "collaborationRecipient does not trim the address, so a stray space would be sent to Resend",
  collaborationRecipient({ email: "general@x.com", collaborationsEmail: " team@x.com " }) ===
    "team@x.com"
);

// ---------------------------------------------------------------------------
// The configured address. A collaborations inbox equal to the general one is
// the bug this check exists to catch, not a valid configuration.
const collab = site.contact.collaborationsEmail;
ok("src/content/site.ts sets no collaborations inbox", typeof collab === "string" && collab.trim() !== "");
ok(
  "the collaborations inbox is the same address as the general contact inbox — the queues are not actually split",
  typeof collab === "string" && collab.trim().toLowerCase() !== site.contact.email.trim().toLowerCase()
);
ok(
  `the collaborations inbox ${JSON.stringify(collab)} is not a valid email address`,
  typeof collab === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collab.trim())
);

// ---------------------------------------------------------------------------
// The route has to ASK for the collaborations inbox. This is the assertion
// that catches the copy-paste regression.
const route = stripComments(
  readFileSync("src/app/api/collaborate-apply/route.ts", "utf8")
);
ok(
  "collaborate-apply does not import collaborationRecipient",
  /collaborationRecipient/.test(route)
);
ok(
  "collaborate-apply sends to site.contact.email — collaborations are going to Reservations again",
  !/to:\s*site\.contact\.email/.test(route)
);
ok(
  "collaborate-apply does not pass site.contact through collaborationRecipient",
  /to:\s*collaborationRecipient\(\s*site\.contact\s*\)/.test(route)
);

// ---------------------------------------------------------------------------
// The owner edits this in Studio, not in code. Without the schema field the
// address is developer-only, and a later blank in Studio would override it.
const schema = stripComments(
  readFileSync("src/sanity/schemaTypes/siteSettings.ts", "utf8")
);
ok(
  "Site Settings → Contact has no collaborationsEmail field, so the owner cannot change the address without a developer",
  /name:\s*"collaborationsEmail"/.test(schema)
);

// ---------------------------------------------------------------------------
// The other routes must NOT have been dragged along. Only collaborations move.
const reservationRoutes = [
  "src/app/api/enquiry/route.ts",
  "src/app/api/reservations/route.ts",
  "src/app/api/transfer-request/route.ts",
  "src/app/api/travel-agent-apply/route.ts",
];
for (const file of reservationRoutes) {
  const src = stripComments(readFileSync(file, "utf8"));
  ok(
    `${file} no longer sends to the general contact inbox — only collaborations were meant to move`,
    /site\.contact\.email/.test(src)
  );
  ok(
    `${file} was switched to the collaborations inbox by mistake`,
    !/collaborationRecipient/.test(src)
  );
}

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-email-routing: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-email-routing: ok — creator applications go to ${collaborationRecipient(site.contact)} ` +
    `and fall back to ${site.contact.email} if that is ever blanked, the route asks for the ` +
    `collaborations inbox rather than hardcoding one, the owner can change it in Studio, and ` +
    `the ${reservationRoutes.length} reservation routes checked still go to ${site.contact.email}.`
);
