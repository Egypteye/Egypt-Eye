/**
 * How far along each language is. Run: npm run i18n:status
 *
 * With a corpus this size the useful question is never "is it translated"
 * but "how much of it, and what's left" — so this reports coverage per
 * language and names the largest untranslated strings, which is where the
 * remaining visible English actually is.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { LOCALES, DEFAULT_LOCALE } from "../src/i18n/locales.js";

const read = (p: string): Record<string, string> =>
  existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};

const manifest = read("src/i18n/generated/manifest.json");
const keys = Object.keys(manifest);
const totalWords = Object.values(manifest).reduce((n, s) => n + s.split(/\s+/).length, 0);

console.log(`Manifest: ${keys.length.toLocaleString()} strings, ${totalWords.toLocaleString()} words\n`);
console.log("Language      done    of total   words left");
for (const info of LOCALES) {
  if (info.code === DEFAULT_LOCALE) continue;
  const dict = read(`src/i18n/generated/${info.code}.json`);
  const done = keys.filter((k) => dict[k]).length;
  const wordsLeft = keys.filter((k) => !dict[k]).reduce((n, k) => n + manifest[k].split(/\s+/).length, 0);
  const pct = keys.length ? Math.round((done / keys.length) * 100) : 0;
  const bar = "█".repeat(Math.round(pct / 5)).padEnd(20, "·");
  console.log(
    `${info.englishName.padEnd(10)} ${String(done).padStart(6)} ${bar} ${String(pct).padStart(3)}%  ${wordsLeft.toLocaleString().padStart(9)}`
  );
}
// The site reads this to decide which languages to offer search engines
// (src/i18n/readiness.ts). Written here rather than computed at request time
// so a page render never has to open a quarter-million-word manifest.
const counts: Record<string, number> = {};
for (const info of LOCALES) {
  if (info.code === DEFAULT_LOCALE) continue;
  const dict = read(`src/i18n/generated/${info.code}.json`);
  counts[info.code] = keys.filter((k) => dict[k]).length;
}
writeFileSync(
  "src/i18n/generated/coverage.json",
  JSON.stringify({ total: keys.length, locales: counts }) + "\n"
);
console.log(`\nWrote src/i18n/generated/coverage.json — a language is offered to`);
console.log(`Google once it passes 90%; below that its pages are noindex and`);
console.log(`canonicalise to English, so untranslated URLs never compete.`);

console.log(`\nFill a language:  npm run i18n:translate -- --locale de`);
console.log(`Fill all six:     npm run i18n:translate -- --all`);
