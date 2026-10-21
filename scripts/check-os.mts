/**
 * Offline assertions for Egypt Eye OS.
 *
 * Written the way scripts/check-security.mts is: each block states what would
 * be true again if the thing it guards were undone, and every one of them was
 * run against a deliberately broken version to confirm it fails there. A
 * check that passes on the broken version checks nothing.
 *
 * The three properties that matter most are all here, because all three are
 * expensive to discover in production:
 *
 *  1. Money is counted once per booking, not once per day of service. The
 *     spreadsheet this replaces repeats the full price on every date row.
 *  2. A date is the same date in Cairo as on the server. An off-by-one here
 *     sends a driver on the wrong morning.
 *  3. No role can write past its remit, and the refusal is in the action
 *     rather than only in the markup.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  MAX_BOOKING_DAYS,
  addDays,
  compareFollowUps,
  daysBetween,
  describeFollowUp,
  expandDates,
  followUpState,
  formatDate,
  formatTime,
  isIsoDate,
  parseInclusions,
  remainingCents,
  todayInCairo,
  totalsForDays,
  usdToCents,
  whatsappMessage,
} from "../src/lib/os/model";
import {
  OS_ROLES,
  USER_ROLES,
  canEditContent,
  canEditLogistics,
  canEditMoney,
  canManageBookings,
  canManageLeads,
  canSeeMoney,
  isOsRole,
  type UserRole,
} from "../src/lib/auth/roles";

const problems: string[] = [];

function ok(condition: boolean, failure: string) {
  // This project has already shipped a guard that always passed because its
  // arguments were the other way round and a non-empty string is truthy.
  // Refusing anything but a boolean makes that mistake impossible here.
  if (typeof condition !== "boolean") {
    throw new TypeError(
      `ok() takes (condition, failure) and was given a ${typeof condition} first: ${String(condition)}`,
    );
  }
  if (!condition) problems.push(failure);
}

/**
 * The money part of model.ts, on its own.
 *
 * Scoped deliberately: a whole-file search for "* 100" would be satisfied by
 * any unrelated line, which is how one of this project's earlier guards came
 * to assert nothing at all.
 */
function modelMoneySection(): string {
  const src = readFileSync("src/lib/os/model.ts", "utf8");
  const start = src.indexOf("// Money — whole cents");
  const end = src.indexOf("// Follow-ups");
  if (start < 0 || end <= start) {
    problems.push("could not locate the money section of src/lib/os/model.ts to inspect it");
    return "";
  }
  return src.slice(start, end);
}

// ---------------------------------------------------------------------------
// 1. Dates are strings, and they mean the same thing everywhere.
// ---------------------------------------------------------------------------
ok(addDays("2026-10-21", 1) === "2026-10-22", "addDays broke on an ordinary day");
ok(addDays("2026-10-31", 1) === "2026-11-01", "addDays broke across a month boundary");
ok(addDays("2026-12-31", 1) === "2027-01-01", "addDays broke across a year boundary");
ok(addDays("2028-02-28", 1) === "2028-02-29", "addDays missed a leap day");
ok(addDays("2026-03-01", -1) === "2026-02-28", "addDays broke going backwards");

ok(daysBetween("2026-10-21", "2026-10-28") === 7, "daysBetween miscounted a week");
ok(daysBetween("2026-10-28", "2026-10-21") === -7, "daysBetween lost the sign");
ok(daysBetween("2026-10-21", "2026-10-21") === 0, "daysBetween made a day differ from itself");

// Across a spring-forward boundary the two dates are 23 hours apart in local
// time. Anything doing this arithmetic with local Dates and dividing by
// 86,400,000 rounds that to 0 and loses a day — which in the day-sheet strip
// is a date that silently cannot be opened.
ok(daysBetween("2026-03-28", "2026-03-29") === 1, "daysBetween lost a day across a DST change");
ok(daysBetween("2026-03-01", "2026-04-01") === 31, "daysBetween miscounted a month containing a DST change");

ok(isIsoDate("2026-10-21"), "isIsoDate rejected a real date");
ok(!isIsoDate("2026-02-30"), "isIsoDate accepted 30 February — it would reach Postgres as a cast error");
ok(!isIsoDate("2026-13-01"), "isIsoDate accepted a thirteenth month");
ok(!isIsoDate("21/10/2026"), "isIsoDate accepted a day-first date");
ok(!isIsoDate(""), "isIsoDate accepted an empty string");
ok(!isIsoDate("2026-10-21T00:00:00Z"), "isIsoDate accepted a timestamp, which Postgres would store as a different day");

// ---------------------------------------------------------------------------
// 2. "Today" is today in Cairo.
//
// Vercel runs in UTC. At 00:30 Cairo time it is still 22:30 UTC the previous
// day, so anything reading the server's own date shows the wrong day sheet
// and calls a follow-up overdue a day early. Both assertions below fail if
// todayInCairo() goes back to new Date().toISOString().slice(0, 10).
// ---------------------------------------------------------------------------
const lateCairoNight = new Date("2026-10-21T22:30:00Z"); // 00:30 on the 22nd in Cairo
ok(
  todayInCairo(lateCairoNight) === "2026-10-22",
  `todayInCairo returned ${todayInCairo(lateCairoNight)} half an hour after midnight in Cairo — the day sheet would be yesterday's`,
);
const earlyCairoMorning = new Date("2026-10-22T04:00:00Z"); // 06:00 in Cairo
ok(
  todayInCairo(earlyCairoMorning) === "2026-10-22",
  "todayInCairo is wrong at 6am Cairo, which is exactly when the day sheet is read",
);
ok(isIsoDate(todayInCairo()), "todayInCairo did not return a YYYY-MM-DD string");

// ---------------------------------------------------------------------------
// 3. A multi-day booking becomes one row per day.
//
// This is the shape read straight off the operations sheet: the four-day trip
// appears on four date tabs. Operations' unit is a day of service.
// ---------------------------------------------------------------------------
const fourDays = expandDates("2026-10-19", "2026-10-22");
ok(fourDays.length === 4, `a 19th-to-22nd booking produced ${fourDays.length} day rows, not 4`);
ok(
  fourDays.join(",") === "2026-10-19,2026-10-20,2026-10-21,2026-10-22",
  "expandDates did not produce every date inclusive of both ends",
);
ok(expandDates("2026-10-19", "2026-10-19").length === 1, "a single-day booking did not produce exactly one day");
ok(new Set(fourDays).size === fourDays.length, "expandDates produced a duplicate date");

let rejectedBackwards = false;
try {
  expandDates("2026-10-22", "2026-10-19");
} catch {
  rejectedBackwards = true;
}
ok(rejectedBackwards, "expandDates accepted an end date before the start date");

let rejectedAbsurd = false;
try {
  expandDates("2026-01-01", "2030-01-01");
} catch {
  rejectedAbsurd = true;
}
ok(rejectedAbsurd, `expandDates accepted a span longer than ${MAX_BOOKING_DAYS} days — a typo would insert thousands of rows`);

// ---------------------------------------------------------------------------
// 4. Money is counted once per booking, however many days it spans.
//
// THE central property. On the sheet being replaced, the Glow girls' four-day
// booking repeats $3,680 on all four date tabs; reading down the column makes
// the business look four times its size. Remove the de-duplication in
// totalsForDays and the first assertion here reports 14,720.
// ---------------------------------------------------------------------------
// The real figures from the sheet, in cents: $3,680 with a $1,000 deposit.
const glowGirls = { bookingId: "glow", totalCents: 368_000, depositCents: 100_000 };
const fourDaySheet = [glowGirls, glowGirls, glowGirls, glowGirls];

const totals = totalsForDays(fourDaySheet);
ok(
  totals.totalCents === 368_000,
  `a four-day booking totalled ${totals.totalCents} instead of 368000 — the money is being counted once per day again`,
);
ok(totals.bookings === 1, `a four-day booking counted as ${totals.bookings} bookings`);
ok(totals.depositCents === 100_000, "the deposit was multiplied by the number of days");
ok(totals.remainingCents === 268_000, "the outstanding balance was multiplied by the number of days");

// Two genuinely different bookings on one day DO add up.
const mixedDay = totalsForDays([
  { bookingId: "a", totalCents: 30_000, depositCents: 10_000 },
  { bookingId: "b", totalCents: 45_000, depositCents: 45_000 },
]);
ok(mixedDay.totalCents === 75_000, `two bookings on one day totalled ${mixedDay.totalCents} instead of 75000`);
ok(mixedDay.bookings === 2, "two distinct bookings were collapsed into one");
ok(mixedDay.remainingCents === 20_000, "the collectable balance for a mixed day is wrong");
ok(totalsForDays([]).totalCents === 0, "an empty day sheet did not total zero");

ok(remainingCents(368_000, 100_000) === 268_000, "remainingCents got a plain subtraction wrong");
ok(remainingCents(100, 100) === 0, "a fully paid booking does not show as nothing to collect");

// Integers all the way down. Every total above is exact because nothing in
// the money path multiplies or divides by 100 — the single conversion from a
// typed dollar figure happens in the action, through the project's own
// usdToCents(). Put a `* 100` back into the model's money section and the
// rounding errors it exists to prevent come back with it.
const moneySection = modelMoneySection();
for (const arithmetic of ["* 100", "/ 100", "Math.round"]) {
  ok(
    !moneySection.includes(arithmetic),
    `src/lib/os/model.ts's money section does "${arithmetic}" — money is whole cents here, and a scaling step is where a rounding error gets in`,
  );
}

// And the conversion itself defers to the house authority rather than being
// re-derived, per the single-authority rule for money.
ok(usdToCents(3680) === 368_000, "usdToCents is no longer the conversion being used");
ok(usdToCents(36.8) === 3_680, "usdToCents got a two-decimal price wrong");
ok(usdToCents(25.005) === null, "a sub-cent price was rounded into something nobody typed instead of refused");
ok(usdToCents(-5) === null, "a negative price was accepted");
ok(usdToCents(Number.NaN) === null, "NaN was accepted as a price");

const bookingActionsSrc = readFileSync("src/app/os/bookings/actions.ts", "utf8");
ok(
  /usdToCents\(/.test(bookingActionsSrc),
  "the booking actions no longer convert through usdToCents() — a second conversion is a second answer about money",
);
ok(
  !/\* 100|\/ 100/.test(bookingActionsSrc),
  "the booking actions scale money by hand instead of deferring to usdToCents()",
);

// ---------------------------------------------------------------------------
// 5. The money is stored on the booking, and the day table has no price
//    column to disagree with it.
//
// Asserted against the migration itself, because this is a schema property:
// adding total_cents to os_booking_days would reintroduce exactly the bug
// section 4 guards against, and no amount of correct arithmetic would help.
// ---------------------------------------------------------------------------
const migration = readFileSync("supabase/migrations/0025_os_simple.sql", "utf8");

const dayTableStart = migration.indexOf("create table if not exists public.os_booking_days");
const dayTableEnd = migration.indexOf("create index if not exists os_booking_days_service_date_idx");
ok(dayTableStart >= 0 && dayTableEnd > dayTableStart, "could not locate os_booking_days in the migration to inspect it");
const dayTable = migration.slice(Math.max(dayTableStart, 0), dayTableEnd > dayTableStart ? dayTableEnd : undefined);

for (const column of ["total_cents", "deposit_cents", "remaining_cents", "total_usd", "deposit_usd", "price"]) {
  ok(
    !new RegExp(`\\b${column}\\b`).test(dayTable),
    `os_booking_days declares ${column} — money on a day row is the duplication this schema exists to remove`,
  );
}

ok(
  /remaining_cents integer generated always as \(total_cents - deposit_cents\) stored/.test(migration),
  "remaining_cents is no longer a generated integer column — a hand-maintained third number is how a sheet comes to claim a paid guest owes money",
);

// Money is whole cents in every other table here (amount_cents in 0022), and
// a numeric column would reintroduce the string-to-float coercion on the way
// into JavaScript that integers make impossible.
ok(
  !/(total|deposit|remaining)_cents\s+numeric/.test(migration),
  "an OS money column is numeric rather than integer cents",
);
ok(
  !/^\s*(total|deposit|remaining)_usd\s+(numeric|integer|bigint|real|double)/m.test(migration),
  "an OS money column is declared in dollars — every money column in this project is whole cents",
);
ok(
  /constraint os_bookings_deposit_within_total check \(deposit_cents <= total_cents\)/.test(migration),
  "nothing stops a deposit larger than the total, which makes remaining_cents negative on every screen",
);
ok(
  /constraint os_booking_days_unique_date unique \(booking_id, service_date\)/.test(migration),
  "a booking can hold two rows for one date again — re-saving its days would send the crew out twice",
);
// The booking reference must not be able to collide. Postgres lpad truncates
// a too-long input, so lpad(nextval(...), 4, '0') hands booking 10,000 the
// same 'EE-1000' as booking 1,000 — and the unique index then refuses it,
// with nothing on screen saying why bookings stopped being created.
ok(
  /greatest\(4, length\(n::text\)\)/.test(migration),
  "the booking reference is padded to a fixed width again — lpad truncates, so the ten-thousandth booking would collide with the thousandth",
);
ok(
  !/default 'EE-' \|\| lpad\(nextval/.test(migration),
  "the booking reference is generated inline with lpad(nextval(...)) — that form truncates past four digits",
);

ok(
  /constraint os_bookings_cancelled_has_reason/.test(migration),
  "a booking can be cancelled with no reason, leaving an unexplained gap in the day sheet",
);

// RLS with no policies is the whole access model: these tables must be
// unreachable with an anon key, whatever a browser claims about itself.
for (const table of ["os_leads", "os_bookings", "os_booking_days"]) {
  ok(
    new RegExp(`alter table public\\.${table} enable row level security`).test(migration),
    `${table} does not enable row level security — an anon key could read every guest's phone number`,
  );
  ok(
    !new RegExp(`create policy[^;]*on public\\.${table}`).test(migration),
    `${table} has a client RLS policy — OS data is server-only, reached through requireOsStaff() and the service role`,
  );
}

ok(
  /check \(role in \('customer', 'admin', 'reservations', 'operations', 'social'\)\)/.test(migration),
  "the profiles role constraint no longer admits the OS roles — operations and social accounts cannot be created",
);

// ---------------------------------------------------------------------------
// 6. Roles. The allow-list, and the limits of each one.
// ---------------------------------------------------------------------------
ok(!isOsRole("customer"), "a customer account can reach the OS — that is every traveller on the site");
ok(!isOsRole("anonymous") && !isOsRole("") && !isOsRole(undefined), "isOsRole accepted something that is not a role");
for (const role of OS_ROLES) ok(isOsRole(role), `${role} is in OS_ROLES but isOsRole rejects it`);

// Every role in USER_ROLES must have a decided answer for every permission,
// so adding one to the constraint without thinking about the OS cannot
// quietly grant it something.
const PERMISSIONS: [string, (role: UserRole) => boolean][] = [
  ["canManageBookings", canManageBookings],
  ["canEditMoney", canEditMoney],
  ["canSeeMoney", canSeeMoney],
  ["canEditLogistics", canEditLogistics],
  ["canEditContent", canEditContent],
  ["canManageLeads", canManageLeads],
];

for (const [name, predicate] of PERMISSIONS) {
  ok(
    predicate("customer") === false,
    `${name} grants a customer account access — the role every site visitor has`,
  );
  ok(predicate("admin") === true, `${name} refuses an admin`);
}

// Operations: the day is theirs, the price is not.
ok(canEditLogistics("operations"), "operations cannot set a pick-up time, driver or guide");
ok(canSeeMoney("operations"), "operations cannot see the balance their driver collects in cash");
ok(!canEditMoney("operations"), "operations can re-price a sale");
ok(!canManageBookings("operations"), "operations can create or cancel a booking");
ok(!canManageLeads("operations"), "operations can edit the reservations desk's follow-up list");

// Social: the content columns, and nothing else.
ok(canEditContent("social"), "the social team cannot record the photographer or the content data");
ok(!canSeeMoney("social"), "the social team can see what a booking was sold for");
ok(!canEditMoney("social"), "the social team can change what a booking is worth");
ok(!canEditLogistics("social"), "the social team can change a day's driver and pick-up time");
ok(!canManageBookings("social"), "the social team can create or cancel a booking");

// Reservations: the desk that sold it owns it.
ok(canManageBookings("reservations"), "the reservations desk cannot create a booking");
ok(canEditMoney("reservations"), "the reservations desk cannot set a price");
ok(canManageLeads("reservations"), "the reservations desk cannot work its own follow-up list");
ok(canEditLogistics("reservations"), "the reservations desk cannot fill in a day it just sold");

ok(
  USER_ROLES.includes("operations") && USER_ROLES.includes("social"),
  "USER_ROLES no longer matches the database constraint",
);

// ---------------------------------------------------------------------------
// 7. Every OS page and every OS action checks the role server-side.
//
// The layout's redirect is not enough and must never be mistaken for the
// gate: a server action is a POST endpoint reachable without rendering the
// page whose form normally submits to it. Asserted structurally because the
// alternative is a live session.
// ---------------------------------------------------------------------------
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const osFiles = walk("src/app/os");

for (const file of osFiles.filter((f) => f.endsWith("page.tsx"))) {
  const text = readFileSync(file, "utf8");
  ok(
    /requireOsStaff\s*\(/.test(text),
    `${file} does not call requireOsStaff() — it would render guest data to whoever asked`,
  );
  ok(
    /export const dynamic = "force-dynamic"/.test(text),
    `${file} may be statically prerendered, which would serve one person's day sheet to everybody`,
  );
}

// Every exported server action, in every "use server" file under /os.
for (const file of osFiles) {
  const text = readFileSync(file, "utf8");
  if (!text.startsWith('"use server"')) continue;

  const exported = [...text.matchAll(/export async function (\w+)/g)].map((m) => m[1]);
  ok(exported.length > 0, `${file} is a "use server" module with no exported actions — did the file move?`);

  for (const name of exported) {
    const start = text.indexOf(`export async function ${name}`);
    const nextExport = text.indexOf("export async function", start + 1);
    const body = text.slice(start, nextExport === -1 ? undefined : nextExport);
    ok(
      /await requireOsStaff\(\)/.test(body),
      `${file}: ${name}() does not await requireOsStaff() — it is a POST endpoint anyone can call`,
    );
    ok(
      /can(ManageBookings|EditMoney|EditLogistics|EditContent|ManageLeads)\(user\.role\)/.test(body),
      `${file}: ${name}() checks that the caller is OS staff but not what their role may change`,
    );
  }
}

// The money action and the logistics action must stay separate, or operations
// submitting a pick-up time could carry a changed price with it.
const bookingActions = readFileSync("src/app/os/bookings/actions.ts", "utf8");
const logisticsStart = bookingActions.indexOf("export async function updateDayLogistics");
const logisticsEnd = bookingActions.indexOf("export async function updateDayContent");
ok(logisticsStart >= 0 && logisticsEnd > logisticsStart, "could not locate updateDayLogistics to inspect it");
const logisticsBody = bookingActions.slice(Math.max(logisticsStart, 0), logisticsEnd > logisticsStart ? logisticsEnd : undefined);
for (const column of ["total_cents", "deposit_cents"]) {
  ok(
    !logisticsBody.includes(column),
    `updateDayLogistics writes ${column} — operations would be able to re-price a booking by saving a day`,
  );
}

const contentStart = bookingActions.indexOf("export async function updateDayContent");
const contentEnd = bookingActions.indexOf("export async function addBookingDay");
const contentBody = bookingActions.slice(Math.max(contentStart, 0), contentEnd > contentStart ? contentEnd : undefined);
for (const column of ["total_cents", "deposit_cents", "pickup_time", "operator_name", "guide_name"]) {
  ok(
    !contentBody.includes(column),
    `updateDayContent writes ${column} — the social team would be able to change the money or the logistics`,
  );
}

// Nothing in the OS may reach the database without going through the module
// that is marked server-only.
const osDataSource = readFileSync("src/lib/os/data.ts", "utf8");
ok(
  osDataSource.startsWith('import "server-only";'),
  "src/lib/os/data.ts is no longer server-only — a client component importing it would ship the service-role path into the browser",
);

// The model must stay importable without a request, which is what lets this
// file assert any of the above.
const modelSource = readFileSync("src/lib/os/model.ts", "utf8");
for (const forbidden of ["server-only", "next/headers", "@/lib/supabase"]) {
  ok(
    !modelSource.includes(forbidden),
    `src/lib/os/model.ts references ${forbidden} — the rules must stay assertable offline`,
  );
}

const rolesSource = readFileSync("src/lib/auth/roles.ts", "utf8");
ok(
  !/^import /m.test(rolesSource),
  "src/lib/auth/roles.ts has gained an import — it must stay dependency-free so the permission rules can be asserted without a database",
);

// ---------------------------------------------------------------------------
// 8. /os is exempt from the locale rewrite, and not as a loose prefix.
//
// Without the exemption every OS URL 404s. With a bare startsWith("/os") a
// public page such as /oasis-tours would also be exempted and silently drop
// out of the translated tree — the mistake that lost /photoshoots once.
// ---------------------------------------------------------------------------
const proxySource = readFileSync("src/proxy.ts", "utf8");
ok(
  /pathname === "\/os" \|\|/.test(proxySource) && /pathname\.startsWith\("\/os\/"\)/.test(proxySource),
  "/os is not exempt from the locale rewrite as an exact path plus a slash-terminated prefix — either every OS URL 404s, or an unrelated /os* page leaves the translated tree",
);
ok(
  !/pathname\.startsWith\("\/os"\)(?!\/)/.test(proxySource.replace(/pathname\.startsWith\("\/os\/"\)/g, "")),
  "src/proxy.ts exempts /os as a bare prefix, which also exempts pages like /oasis-tours",
);

ok(
  /disallow: \[[^\]]*"\/os"/.test(readFileSync("src/app/robots.ts", "utf8")),
  "robots.txt no longer disallows /os — internal booking URLs would be offered to crawlers",
);

// The OS needs its own root layout, because the site's moved under [locale].
const osLayout = readFileSync("src/app/os/layout.tsx", "utf8");
ok(/<html/.test(osLayout) && /<body/.test(osLayout), "src/app/os/layout.tsx is not a root layout — /os would render with no <html> or <body>");
ok(/import "\.\.\/globals\.css"/.test(osLayout), "src/app/os/layout.tsx does not import globals.css — /os would render unstyled");

// ---------------------------------------------------------------------------
// 9. No OS screen pretends to do something it cannot.
//
// The booking hand-off is a copyable message, not a Send button, because
// posting into a WhatsApp group needs the paid WhatsApp Business Cloud API and
// nothing here is configured for it.
// ---------------------------------------------------------------------------
const bookingPage = readFileSync("src/app/os/bookings/[ref]/page.tsx", "utf8");
ok(
  /CopyButton/.test(bookingPage),
  "the booking hand-off no longer offers the message to copy",
);
ok(
  !/Send to WhatsApp|Send to group|sendWhatsApp/i.test(bookingPage),
  "the booking screen has a Send button — the OS has no WhatsApp Business API credentials, so it would do nothing",
);

// The hand-off message states the total, the deposit and the balance, so
// rendering it unconditionally would hand the social team in one block
// exactly what the rest of the page withholds from them. Remove the
// !showMoney guard and this fails.
ok(
  /const handoff = !showMoney\s*\?\s*null/.test(bookingPage),
  "the crew hand-off message is built for every role — it states the money, so a role that cannot see the money must not be given it here either",
);
ok(
  /\{handoff \? \(/.test(bookingPage),
  "the hand-off panel is rendered unconditionally rather than only when there is a message to show",
);

// ---------------------------------------------------------------------------
// 10. The hand-off message carries what the crew is actually missing today.
// ---------------------------------------------------------------------------
const message = whatsappMessage(
  {
    ref: "EE-0007",
    guestName: "Fernando",
    guestPhone: "+20 100 000 0000",
    pax: 2,
    serviceType: "Tour",
    source: "Egypt Eye",
    totalCents: 368_000,
    depositCents: 100_000,
    notes: "Vegetarian lunch",
  },
  [
    {
      serviceDate: "2026-10-20",
      serviceType: "Photoshoot",
      serviceLocation: "Pyramids of Giza",
      pickupTime: "06:30:00",
      pickupLocation: "Marriott Mena House",
      operatorName: "David",
      guideName: "Mena",
      inclusions: ["Camel", "Pro Reels"],
      notes: null,
    },
    // Deliberately out of order and missing its pick-up time.
    {
      serviceDate: "2026-10-19",
      serviceType: "Tour",
      serviceLocation: "Old Cairo",
      pickupTime: null,
      pickupLocation: null,
      operatorName: null,
      guideName: null,
      inclusions: [],
      notes: "Felucca day",
    },
  ],
);

ok(message.includes("EE-0007"), "the hand-off message does not name the booking");
ok(message.includes("Fernando") && message.includes("+20 100 000 0000"), "the hand-off message is missing the guest or their number");
ok(
  message.includes("TO COLLECT: $2680"),
  `the hand-off message does not state the balance to collect:\n${message}`,
);
ok(!message.includes("$3680.00"), "the hand-off message formats a whole-dollar total with trailing zeros");
const firstDay = message.indexOf("Mon, 19 Oct 2026");
const secondDay = message.indexOf("Tue, 20 Oct 2026");
ok(firstDay >= 0 && secondDay >= 0, `the hand-off message does not date its days readably:\n${message}`);
ok(
  firstDay < secondDay,
  "the hand-off message lists the days out of order — the crew reads it top to bottom",
);
ok(
  message.includes("Pick-up: to be confirmed"),
  "a missing pick-up time is silently omitted rather than flagged — it is the main reason the crew calls the desk at 6am",
);
ok(message.includes("Includes: Camel, Pro Reels"), "the inclusions are missing from the hand-off message");
ok(message.includes("Driver: David") && message.includes("Guide: Mena"), "the crew's own names are missing from the hand-off message");

const paidUp = whatsappMessage(
  {
    ref: "EE-0008",
    guestName: "Nika",
    guestPhone: null,
    pax: 2,
    serviceType: null,
    source: null,
    totalCents: 40_000,
    depositCents: 40_000,
    notes: null,
  },
  [],
);
ok(
  paidUp.includes("Paid in full — collect nothing."),
  "a fully paid booking does not tell the driver to collect nothing, which invites them to ask for money twice",
);
ok(!paidUp.includes("TO COLLECT"), "a fully paid booking still says there is money to collect");

// ---------------------------------------------------------------------------
// 11. Follow-ups: overdue first, and the words are the ones a person uses.
// ---------------------------------------------------------------------------
const today = "2026-10-21";
ok(followUpState("2026-10-18", today) === "overdue", "a date three days past is not overdue");
ok(followUpState(today, today) === "today", "today's follow-up is not due today");
ok(followUpState("2026-10-23", today) === "soon", "a follow-up in two days is not 'soon'");
ok(followUpState("2026-10-28", today) === "soon", "a follow-up in seven days fell outside the week");
ok(followUpState("2026-11-29", today) === "later", "a follow-up next month is not 'later'");
ok(followUpState(null, today) === "unscheduled", "a lead with no next date is not reported as unscheduled");

const queue = [
  { name: "later", nextFollowUpOn: "2026-11-15" },
  { name: "unscheduled", nextFollowUpOn: null },
  { name: "today", nextFollowUpOn: today },
  { name: "very overdue", nextFollowUpOn: "2026-10-01" },
  { name: "soon", nextFollowUpOn: "2026-10-23" },
  { name: "overdue", nextFollowUpOn: "2026-10-20" },
].sort((a, b) => compareFollowUps(a, b, today));

ok(
  queue.map((l) => l.name).join(" > ") === "very overdue > overdue > today > soon > later > unscheduled",
  `the follow-up queue is in the wrong order: ${queue.map((l) => l.name).join(" > ")}`,
);

ok(describeFollowUp(today, today) === "Today", "describeFollowUp does not say 'Today'");
ok(describeFollowUp("2026-10-22", today) === "Tomorrow", "describeFollowUp does not say 'Tomorrow'");
ok(describeFollowUp("2026-10-20", today) === "1 day overdue", "describeFollowUp pluralised a single overdue day");
ok(describeFollowUp("2026-10-18", today) === "3 days overdue", "describeFollowUp miscounted the overdue days");
ok(describeFollowUp(null, today) === "No follow-up set", "describeFollowUp invented a date for a lead that has none");

// ---------------------------------------------------------------------------
// 12. Small things that would corrupt the data quietly.
// ---------------------------------------------------------------------------
ok(
  formatDate("2026-10-19") === "Mon, 19 Oct 2026",
  `formatDate returned "${formatDate("2026-10-19")}" — dates must stay day-first with a named month, so 10/11 can never be read as the wrong day`,
);
ok(formatTime("06:30:00") === "06:30", "a Postgres time renders with seconds on the day sheet");
ok(formatTime(null) === null, "a missing pick-up time was turned into something that reads as a real time");

ok(parseInclusions("Camel, Pro Reels").join("|") === "Camel|Pro Reels", "parseInclusions did not split on commas");
ok(parseInclusions("Camel\nPro Reels").join("|") === "Camel|Pro Reels", "parseInclusions did not split on new lines");
ok(parseInclusions("Camel, ,  Camel ").join("|") === "Camel", "parseInclusions kept a blank or a duplicate — the array stops being countable");
ok(parseInclusions("Camel, camel").length === 1, "parseInclusions treats a case difference as a second inclusion");
ok(parseInclusions("").length === 0, "an empty inclusions field did not produce an empty array");

if (problems.length > 0) {
  console.error("check-os FAILED:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  "check-os: ok — a multi-day booking's money is counted once rather than once per day, dates mean the same thing " +
    "in Cairo as on the server, os_booking_days has no price column to disagree with the booking, every OS page and " +
    "action checks the role server-side and no role can write past its remit, /os is exempt from the locale rewrite " +
    "without taking unrelated pages with it, and the crew hand-off is a real copyable message rather than a Send " +
    "button with nothing behind it.",
);
