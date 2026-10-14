import { readFileSync } from "node:fs";
import { ALL_SIGNS, spellName, glyphString, CARTOUCHE_CAPACITY } from "../src/lib/hieroglyphs/signs";

/**
 * Guards the hieroglyph data, and one mistake in particular.
 *
 * The first version of signs.ts had NINE wrong codepoints, because they were
 * written from memory rather than looked up. "Omar" rendered as a row of
 * seated men. It type-checked, it rendered, and it was completely wrong — the
 * kind of error that reaches a customer's engraved pendant.
 *
 * So every sign's glyph is checked against the codepoint Unicode itself
 * assigns to that Gardiner number. The table below was generated from
 * Python's unicodedata (the Unicode Character Database) with:
 *
 *   unicodedata.name(chr(cp)) == "EGYPTIAN HIEROGLYPH <code>"
 *
 * scanned across the Egyptian Hieroglyphs block, U+13000–U+1342F. Regenerate
 * it the same way if a sign is ever added.
 */
const EXPECTED: ReadonlyArray<readonly [string, number]> = [
  ["G1", 0x1313F],
  ["M17", 0x131CB],
  ["M17a", 0x131CC],
  ["D36", 0x1309D],
  ["G43", 0x13171],
  ["D58", 0x130C0],
  ["Q3", 0x132AA],
  ["I9", 0x13191],
  ["G17", 0x13153],
  ["N35", 0x13216],
  ["D21", 0x1308B],
  ["O4", 0x13254],
  ["V28", 0x1339B],
  ["O34", 0x13283],
  ["S29", 0x132F4],
  ["N37", 0x13219],
  ["N29", 0x1320E],
  ["V31", 0x133A1],
  ["W11", 0x133BC],
  ["X1", 0x133CF],
  ["D46", 0x130A7],
  ["I10", 0x13193],
  ["E23", 0x130ED],
];

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

// ---------------------------------------------------------------------------
// 1. Every sign is the glyph Unicode assigns to its Gardiner code.
// ---------------------------------------------------------------------------
const expected = new Map(EXPECTED);
for (const sign of ALL_SIGNS) {
  const want = expected.get(sign.gardiner);
  ok(`${sign.gardiner} is in the expected table`, want !== undefined);
  if (want === undefined) continue;
  const got = sign.glyph.codePointAt(0);
  ok(
    `${sign.gardiner} renders U+${want.toString(16).toUpperCase()} (${String.fromCodePoint(want)}), not U+${got?.toString(16).toUpperCase()} (${sign.glyph})`,
    got === want,
  );
  ok(`${sign.gardiner} is a single codepoint`, [...sign.glyph].length === 1);
}
ok("every expected sign is present in ALL_SIGNS", ALL_SIGNS.length === EXPECTED.length);

// ---------------------------------------------------------------------------
// 2. No sign is duplicated, and every one is inside the hieroglyph block.
// ---------------------------------------------------------------------------
ok("no two signs share a Gardiner code", new Set(ALL_SIGNS.map((s) => s.gardiner)).size === ALL_SIGNS.length);
ok("no two signs share a glyph", new Set(ALL_SIGNS.map((s) => s.glyph)).size === ALL_SIGNS.length);
for (const sign of ALL_SIGNS) {
  const cp = sign.glyph.codePointAt(0) ?? 0;
  ok(`${sign.gardiner} is inside the Egyptian Hieroglyphs block`, cp >= 0x13000 && cp <= 0x1342f);
}

// ---------------------------------------------------------------------------
// 3. Every letter is spellable, and signs are counted — not letters.
// ---------------------------------------------------------------------------
for (const letter of "abcdefghijklmnopqrstuvwxyz") {
  ok(`"${letter}" has a mapping`, spellName(letter).signCount >= 1);
}
// X is written with two signs, which is the whole reason the counter counts
// signs rather than letters.
ok("X is written with two signs, not one", spellName("x").signCount === 2);
ok("a four-letter name containing X needs five signs", spellName("maxi").signCount === 5);

// ---------------------------------------------------------------------------
// 4. Nothing is dropped silently.
// ---------------------------------------------------------------------------
const accented = spellName("Søren");
ok("an unwritable character is reported, not dropped", accented.unsupported.includes("ø"));
const arabic = spellName("\u0645\u062d\u0645\u062f");
ok("a name in another script produces no signs", arabic.signCount === 0);
ok("a name in another script is reported as unsupported", arabic.unsupported.length > 0);
ok("spaces and hyphens are not errors", spellName("Ana-Maria").unsupported.length === 0);
ok("an apostrophe is not an error", spellName("O'Neil").unsupported.length === 0);

// ---------------------------------------------------------------------------
// 5. Capacity is enforced on SIGNS and nothing over it reports as fitting.
// ---------------------------------------------------------------------------
ok("an empty name does not fit", !spellName("").fits);
ok("a four-sign name fits", spellName("Omar").fits && spellName("Omar").signCount === 4);
ok("a five-sign name does not fit", !spellName("Sarah").fits);
ok("capacity is reported back", spellName("Omar").capacity === CARTOUCHE_CAPACITY);
ok("a larger capacity can be passed in", spellName("Sarah", 8).fits);

// ---------------------------------------------------------------------------
// 5b. Accents fold to the base letter, so an accented name is spelled rather
//     than reported as a row of unwritable characters.
// ---------------------------------------------------------------------------
ok("Jose and Jos\u00e9 spell identically", glyphString(spellName("Jose")) === glyphString(spellName("Jos\u00e9")));
ok("an accented letter is not called unsupported", spellName("Jos\u00e9").unsupported.length === 0);
ok("\u00fc folds to u", glyphString(spellName("M\u00fcller")) === glyphString(spellName("Muller")));
ok("a digit IS still reported", spellName("Ana 7").unsupported.join("") === "7");

// ---------------------------------------------------------------------------
// 6. A known spelling, end to end.
// ---------------------------------------------------------------------------
ok("OMAR spells quail-owl-vulture-mouth", glyphString(spellName("Omar")) === "\u{13171}\u{13153}\u{1313F}\u{1308B}");

// ---------------------------------------------------------------------------
// 7. The wiring. The panel is reachable, and the spelling the workshop
//    receives is derived on the SERVER from the submitted name rather than
//    posted up by the browser — so a tampered form cannot send one name and
//    a different set of signs.
//
//    Each assertion is anchored to the one place that can satisfy it. An
//    earlier guard in this project read a whole file and passed because some
//    other function happened to contain the string it was looking for.
// ---------------------------------------------------------------------------
const page = readFileSync("src/app/[locale]/(site)/boutique/[category]/page.tsx", "utf8");
const route = readFileSync("src/app/api/treasure-request/route.ts", "utf8");
const studio = readFileSync("src/components/CartoucheNameStudio.tsx", "utf8");

ok("the page imports the studio", /import \{ CartoucheNameStudio \} from "@\/components\/CartoucheNameStudio"/.test(page));
ok(
  "the studio renders only for cartouches",
  /category\.slug === "cartouches" && \([\s\S]{0,400}?<CartoucheNameStudio \/>/.test(page),
);

// The route must call spellName on what WAS SUBMITTED. Matching the call
// alone would also pass if the name came off the request body as a spelling.
const derived = route.slice(route.indexOf("const nameField"), route.indexOf("const nameField") + 600);
ok("the route reads the name field off the category", /const nameField = category\.personalization\.find/.test(derived));
ok("the route re-reads the submitted name", /const submitted = clean\(form\.get\(nameField\.name\)/.test(derived));
ok("the route derives the spelling from it", /describeSpelling\(submitted, spellName\(submitted\)\)/.test(derived));
ok("the spelling is attached to the emailed answers", /answers\.push\(\{ label: "Hieroglyphic spelling"/.test(derived));

// The panel must not become a second order form, and must not quietly
// promise a purchase the site cannot take. Everything in the Boutique is
// an enquiry: nothing is priced and nothing is charged.
ok("the studio writes into the enquiry's own field", studio.includes('const FIELD_ID = "treasure-cartoucheName"'));
ok(
  "the studio names no price and offers no checkout",
  !/USD|EGP|\$\d|\bprices?\b|\bcost\b|add to (cart|basket)|buy now/i.test(studio),
);
ok("the studio says the layout is not final", /not a proof|workshop sets the final layout/i.test(studio));

// ---------------------------------------------------------------------------
// 8. The font. Almost nothing ships a face covering U+13000 — Windows has
//    Segoe UI Historic, macOS, iOS and Android have nothing — so without a
//    self-hosted webfont every sign on this page is an empty box. It WAS an
//    empty box in a real browser before this was wired, which is the only
//    reason this guard exists.
// ---------------------------------------------------------------------------
const layout = readFileSync("src/app/[locale]/layout.tsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

ok("the layout loads a hieroglyph face", /Noto_Sans_Egyptian_Hieroglyphs\(\{[\s\S]{0,300}?\}\)/.test(layout));
ok(
  "it is loaded with the hieroglyph subset",
  /Noto_Sans_Egyptian_Hieroglyphs\(\{[\s\S]{0,300}?subsets: \["egyptian-hieroglyphs"\]/.test(layout),
);
ok(
  "it is exposed as --font-hieroglyph",
  /Noto_Sans_Egyptian_Hieroglyphs\(\{[\s\S]{0,300}?variable: "--font-hieroglyph"/.test(layout),
);
ok("the variable reaches the document", /notoHieroglyphs\.variable/.test(layout));
ok("a .font-hieroglyph rule exists", /\.font-hieroglyph \{[\s\S]{0,300}?var\(--font-hieroglyph\)/.test(css));
// Both places that print a sign must carry the class. The oval alone passing
// would leave every explanation card as tofu.
const glyphRenders = studio.match(/\{glyphs \|\||\{signs\.map\(\(s\) => s\.glyph\)/g) ?? [];
ok("both sign renderings exist", glyphRenders.length === 2);
ok(
  "the cartouche itself uses the face",
  /className="font-hieroglyph[^"]*"[\s\S]{0,200}?\{glyphs \|\|/.test(studio),
);
ok(
  "the explanation cards use the face",
  /className="font-hieroglyph[^"]*"[\s\S]{0,300}?\{signs\.map\(\(s\) => s\.glyph\)/.test(studio),
);

if (errors.length > 0) {
  console.error(`\ncheck-hieroglyphs: ${errors.length} failure(s)\n`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-hieroglyphs: ok \u2014 all ${ALL_SIGNS.length} signs match the codepoint Unicode assigns their Gardiner number, ` +
    "every letter is spellable, unwritable characters are reported rather than dropped, and capacity counts signs not letters.",
);
