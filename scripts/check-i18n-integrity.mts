/**
 * Holds every shipped translation to the rule that a wrong translation is
 * worse than an untranslated one.
 *
 * The five generated dictionaries are 10,500 strings each and nobody on this
 * team reads Arabic or Russian, so a corrupt entry has no reader to catch it.
 * One did ship: the offline translator's protect-sentinel came back
 * transliterated, `restore()` did not notice, and "Egypt Eye" read as
 * "زكسوف" on every Arabic page and "Traduzione:" on every Italian one for
 * months. See src/i18n/protectedTerms.ts for the full account.
 *
 * Every fault this checks is mechanical — it compares the translation against
 * its own English source, so it needs no knowledge of the target language:
 *
 *   BRAND. The English contains "Egypt Eye" and the translation does not.
 *   PLACEHOLDER. "Up to {count} guests" lost its {count}, so the number never
 *     renders and the sentence is a promise with a hole in it.
 *   SENTINEL. A `Zqxvw0` token, or its Arabic transliteration, is still in
 *     the shipped text — proof that a restore silently failed.
 *   ARTIFACT. The whole translation is the target language's word for
 *     "translation".
 *   FORBIDDEN. A specific rendering already confirmed wrong, pinned so the
 *     next pipeline run cannot quietly put it back.
 *
 * Coverage is asserted too: a dictionary that cannot be read, or a manifest
 * that has gone empty, would make every assertion above pass on zero strings.
 */
import { existsSync, readFileSync } from "node:fs";
import {
  BRAND_TERMS,
  FORBIDDEN_RENDERINGS,
  verifyTranslation,
} from "../src/i18n/protectedTerms";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const LOCALES = ["ar", "fr", "es", "it", "ru"] as const;

type Dict = Record<string, string>;
const readJson = (path: string): Dict =>
  existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as Dict) : {};

const catalogue = readJson("src/i18n/generated/manifest.json");
const ui = readJson("src/i18n/generated/ui-manifest.json");

// ---------------------------------------------------------------------------
// 1. The corpus is actually there.
//
// Without this, every check below passes on an empty object. The thresholds
// are an order of magnitude under the real counts (9,595 and 907), so they
// catch a truncated or unparsed file without failing on ordinary growth.
// ---------------------------------------------------------------------------
ok(
  `the catalogue manifest has almost nothing in it (${Object.keys(catalogue).length} strings), ` +
    "so the checks below would pass by having nothing to check",
  Object.keys(catalogue).length > 5000
);
ok(
  `the interface manifest has almost nothing in it (${Object.keys(ui).length} strings)`,
  Object.keys(ui).length > 400
);

// ---------------------------------------------------------------------------
// 2. Every shipped translation, against its own English.
// ---------------------------------------------------------------------------
let compared = 0;
const byKind = new Map<string, number>();

for (const locale of LOCALES) {
  for (const [file, manifest] of [
    [`src/i18n/generated/${locale}.json`, catalogue],
    [`src/i18n/generated/ui/${locale}.json`, ui],
  ] as const) {
    ok(`${file} is missing — that locale ships entirely in English`, existsSync(file));
    const dict = readJson(file);

    for (const [key, translation] of Object.entries(dict)) {
      const english = manifest[key];
      // A key with no manifest entry is a stale translation of English that
      // has since been edited. Harmless: nothing looks it up, because the
      // edited English fingerprints differently.
      if (english === undefined) continue;
      compared++;

      for (const fault of verifyTranslation(english, translation, locale)) {
        byKind.set(fault.kind, (byKind.get(fault.kind) ?? 0) + 1);
        errors.push(
          `${locale} ${file.includes("/ui/") ? "interface" : "catalogue"} ${key} [${fault.kind}] ${fault.detail}\n` +
            `        EN: ${JSON.stringify(english.slice(0, 120))}\n` +
            `        ${locale.toUpperCase()}: ${JSON.stringify(translation.slice(0, 120))}`
        );
      }
    }
  }
}

ok(
  `only ${compared} translations were compared against their English — the manifests and the ` +
    "dictionaries are no longer keyed the same way, so this check is inspecting almost nothing",
  compared > 20000
);

// ---------------------------------------------------------------------------
// 3. The rule has teeth: there is English to protect in the first place.
//
// If no manifest string contained a brand term, the BRAND assertion above
// would be vacuous — it would pass on a dictionary where every brand name had
// been translated, because it would never find one to look at.
// ---------------------------------------------------------------------------
const brandSources = Object.values({ ...catalogue, ...ui }).filter((en) =>
  BRAND_TERMS.some((t) => en.includes(t))
);
ok(
  `no manifest string contains any of ${BRAND_TERMS.join(", ")}, so the brand assertion has ` +
    "nothing to test and would pass on a fully mistranslated dictionary",
  brandSources.length > 50
);

const placeholderSources = Object.values({ ...catalogue, ...ui }).filter((en) => /\{[a-zA-Z]/.test(en));
ok(
  "no manifest string contains a {placeholder}, so the placeholder assertion is vacuous",
  placeholderSources.length > 20
);

ok(
  "FORBIDDEN_RENDERINGS is empty, so a rendering confirmed wrong could ship again unnoticed",
  FORBIDDEN_RENDERINGS.length > 0
);

// ---------------------------------------------------------------------------
// 4. The pipelines verify before they store.
//
// The data being clean today says nothing about the next run. Both
// translators must refuse a faulty string rather than write it, so a fresh
// `i18n:translate` cannot re-introduce what this check just cleaned up.
// ---------------------------------------------------------------------------
// Comments and docstrings are stripped first, and every assertion below
// anchors on a call or an assignment rather than on a name appearing
// somewhere. The first draft of this section did neither: it tested
// /unrestored|missing_sentinel/ against the raw file, and so it passed on a
// version where the function had been renamed and the call replaced with
// `missing_sentinel = []` — the words were still in a comment and in the
// stubbed variable. It was a guard that could not fail.
const stripTs = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");
const stripPy = (src: string) =>
  src.replace(/"""[\s\S]*?"""/g, " ").replace(/^\s*#.*$/gm, "").replace(/\s#.*$/gm, "");

const gemini = stripTs(readFileSync("scripts/i18n-translate.mts", "utf8"));
ok(
  "scripts/i18n-translate.mts does not pass the model's answer through verifyTranslation before " +
    "storing it, so the next run can put a mistranslated brand name straight back",
  /=\s*verifyTranslation\s*\(\s*texts\[i\]\s*,/.test(gemini)
);
ok(
  "scripts/i18n-translate.mts computes the faults and then stores the string anyway",
  /faults\.length\s*>\s*0[\s\S]{0,400}?return texts\[i\]/.test(gemini)
);

const argos = stripPy(readFileSync("scripts/i18n-translate-local.py", "utf8"));
ok(
  "scripts/i18n-translate-local.py does not call unrestored() on the model's output, so it cannot " +
    "tell that a protect-sentinel came back transliterated — the exact failure that shipped " +
    "“Traduzione:” as the Italian brand name and “زكسوف” as the Arabic one",
  /=\s*unrestored\s*\(\s*out\s*,\s*mapping\s*\)/.test(argos)
);
ok(
  "scripts/i18n-translate-local.py finds the unrestored sentinels and then returns the translation " +
    "anyway, instead of falling back to English",
  /if missing_sentinel\s*:[\s\S]{0,600}?return False, text/.test(argos)
);
ok(
  "scripts/i18n-translate-local.py no longer reads its protected terms from " +
    "src/i18n/protectedTerms.ts, so the Python list and the TypeScript one can drift apart",
  /PROTECTED_TERMS_SOURCE\s*\.\s*read_text\s*\(/.test(argos) &&
    /PROTECT_TERMS\s*=\s*load_protected_terms\s*\(\s*\)/.test(argos)
);

// Reading the list from one file is only half of it: the Python side scrapes
// the TypeScript with a regex, and a reformat here that the regex no longer
// matches stops that script dead. It exits loudly rather than translating
// unprotected, so this is not a silent failure — but it is still a broken
// build, and it is cheaper to catch it on this side.
const termsSource = readFileSync("src/i18n/protectedTerms.ts", "utf8");
for (const constName of ["BRAND_TERMS", "GLOSSARY_PREFERENCE_TERMS"]) {
  const shape = new RegExp(`export const ${constName} = \\[(.*?)\\] as const;`, "s");
  const match = shape.exec(termsSource);
  ok(
    `${constName} is no longer written in the \`export const ${constName} = […] as const;\` shape ` +
      "that scripts/i18n-translate-local.py scrapes it with, so that pipeline will refuse to run",
    match !== null && /"/.test(match[1])
  );
}

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  const summary = [...byKind].map(([k, n]) => `${n} ${k}`).join(", ");
  console.error(`\ncheck-i18n-integrity: ${errors.length} problem(s)${summary ? ` (${summary})` : ""}\n`);
  for (const e of errors.slice(0, 60)) console.error(`  ✗ ${e}`);
  if (errors.length > 60) console.error(`  … and ${errors.length - 60} more`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-i18n-integrity: ok — ${compared} translations across ${LOCALES.length} locales carry every ` +
    `{placeholder} and every one of ${BRAND_TERMS.length} brand names through from the English ` +
    `(${brandSources.length} source strings contain one); no unrestored protect-sentinel, no ` +
    `“Traduzione:” artifact and none of ${FORBIDDEN_RENDERINGS.length} pinned bad renderings ` +
    "survives; and both pipelines verify before they store."
);
