// Browser smoke test for the cartouche name studio.
//
// The static guarantees live in scripts/check-hieroglyphs.mts, which runs
// offline in `npm run check`. This one needs a server, so it is separate:
//
//   npm run dev                       # then, in another shell
//   npm run smoke:cartouche
//   SMOKE_BASE=https://egypteyetravel.com npm run smoke:cartouche
//
// It drives a real Chromium: types names, reads the signs back off the page,
// and checks that the button actually writes into the enquiry's own field.
//
// Note on the wait before the first keystroke: a fill that lands before React
// hydrates is overwritten by the component's empty state, which looks exactly
// like a broken feature and is in fact a broken test. Ask first.

import { chromium } from "playwright-core";

const BASE = process.env.SMOKE_BASE || "http://localhost:3000";
const URL = `${BASE}/boutique/cartouches`;
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium" });
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const fails = [];
const ok = (label, cond) => { console.log(`${cond ? "PASS" : "FAIL"}  ${label}`); if (!cond) fails.push(label); };

const failed = [];
p.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
await p.goto(URL, { waitUntil: "load", timeout: 120000 });
const field = p.locator("#treasure-cartoucheName");
const input = p.getByLabel("Your name", { exact: true });
await input.waitFor({ timeout: 60000 });
// Wait for hydration before typing. A fill that lands before React attaches
// is overwritten by the component's own empty state, which looks exactly
// like a broken feature and is in fact a broken test.
await p.waitForFunction(() => {
  const el = document.querySelector('[role="img"][aria-label*="cartouche"], [role="img"][aria-label*="hieroglyphic"]');
  return Boolean(el);
}, null, { timeout: 60000 });
const oval = p.locator('[role="img"]').filter({ hasNot: p.locator("x-none") }).first();
const typeName = async (v) => {
  for (let i = 0; i < 3; i++) {
    await input.fill(v);
    await p.waitForTimeout(400);
    if ((await input.inputValue()) === v && (await oval.getAttribute("aria-label")) !== "An empty cartouche") return;
  }
};

// ---- 1. a name that fits -------------------------------------------------
await typeName("Omar");
ok("Omar renders the four expected signs", (await oval.innerText()).replace(/\s/g, "") === "\u{13171}\u{13153}\u{1313F}\u{1308B}");
ok("the counter reads 4 of 4", (await p.getByText(/^4 of 4 signs$/).count()) === 1);
const cards = await p.locator("li").filter({ hasText: /read as/ }).count();
ok("one card per letter (4)", cards === 4);
const body = await p.locator("section[aria-labelledby=cartouche-studio]").innerText();
ok("a card explains what a sign is a picture of", /A picture of/.test(body));
ok("no card claims a sign means an English letter", !/means the letter|letter “?[a-z]”? in hieroglyph/i.test(body));
ok("no price or checkout appears in the panel", !/\$\d|USD|EGP|add to (cart|basket)/i.test(body));
ok("the panel says the layout is not final", /not a proof/i.test(body));

// ---- 2. carry into the enquiry ------------------------------------------
ok("the enquiry field starts empty", (await field.inputValue()) === "");
await p.getByRole("button", { name: /Use this name in my enquiry/ }).click();
await p.waitForTimeout(600);
ok("the enquiry field now holds the name", (await field.inputValue()) === "Omar");
ok("the confirmation line appears", (await p.getByText(/Added to the form below/).count()) === 1);
ok("the field is focused", await field.evaluate((el) => el === document.activeElement));
// It must still be editable afterwards — a DOM write that React fights back
// on would be worse than no button at all.
await field.fill("Omar Ali");
ok("the field is still editable after the write", (await field.inputValue()) === "Omar Ali");

// ---- 3. a name that does NOT fit ---------------------------------------
await typeName("Mohamed");
const over = await p.locator("section[aria-labelledby=cartouche-studio]").innerText();
ok("over capacity is stated, not hidden", /is more than one cartouche holds/.test(over));
ok("the real sign count is shown", /7 of 4 signs/.test(over));
ok("nothing claims it fits", !/Mohamed fits/i.test(over));
ok("the glyphs are still shown in full", (await oval.innerText()).replace(/\s/g, "").length >= 7);

// ---- 4. an unwritable character ----------------------------------------
// z IS writable (the door bolt), so a name with z must NOT report an error.
await typeName("Zaid");
const zaid = await p.locator("section[aria-labelledby=cartouche-studio]").innerText();
ok("z is spelled, not reported as unwritable", !/no hieroglyphic sign/i.test(zaid));

// An accented letter folds to its base letter rather than erroring.
await typeName("Jos\u00e9");
const jose = await p.locator("section[aria-labelledby=cartouche-studio]").innerText();
ok("an accented name is spelled", !/no hieroglyphic sign/i.test(jose) && /4 of 4 signs/.test(jose));

// A digit genuinely has no sign and must be reported, never dropped.
await typeName("Ana 7");
const digit = await p.locator("section[aria-labelledby=cartouche-studio]").innerText();
ok("a digit is reported as having no sign", /no hieroglyphic sign/i.test(digit));
ok("the unwritable character is named back", /are not shown: *7/.test(digit));
ok("the letters around it are still spelled", /3 of 4 signs/.test(digit));

// ---- 5. clear -----------------------------------------------------------
await p.getByRole("button", { name: /^Clear$/ }).click();
await p.waitForTimeout(200);
ok("clearing returns to the empty state", (await p.getByText(/Up to 4 signs/).count()) === 1);
ok("the empty cartouche has its own label", (await p.getByRole("img", { name: /empty cartouche/ }).count()) === 1);

// console errors
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
await p.reload({ waitUntil: "domcontentloaded" });
await p.waitForTimeout(1500);
ok("no page errors", errs.length === 0);
if (errs.length) console.log(errs);
console.log("failed responses:", failed.length ? failed.slice(0, 6) : "none");

await b.close();
console.log(fails.length ? `\n${fails.length} FAILURE(S)` : "\nall green");
process.exit(fails.length ? 1 : 0);
