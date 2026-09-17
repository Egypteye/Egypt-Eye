/**
 * Fills the missing translations for a locale, using the Gemini key the site
 * already has for the AI concierge.
 *
 * Run: npm run i18n:translate -- --locale de
 *      npm run i18n:translate -- --all --limit 500
 *
 * Incremental and resumable by construction. It reads the manifest, subtracts
 * what the locale already has, and translates only the remainder — so a
 * content edit costs one batch rather than a re-translation of the site, and
 * an interrupted run picks up where it stopped. Everything already in the
 * locale file is left untouched, which is what protects the hand-written
 * translations (productTranslations.ts, the dictionaries) from being
 * overwritten by machine output.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "../src/i18n/locales.js";

const MODEL = "gemini-3.6-flash";
// Two corpora, one pipeline. The catalogue is server-only and large; the UI
// strings are small and also shipped to the browser, so they live apart — but
// they translate identically, which is what keeps "add a language" to one
// command rather than one command plus a few hundred hand-written keys.
const CORPORA = [
  { name: "catalogue", manifest: "src/i18n/generated/manifest.json", out: (l: string) => `src/i18n/generated/${l}.json` },
  { name: "interface", manifest: "src/i18n/generated/ui-manifest.json", out: (l: string) => `src/i18n/generated/ui/${l}.json` },
];
const BATCH_SIZE = 25;
const MAX_RETRIES = 4;

/**
 * What the translator must not get wrong.
 *
 * Product names are the business's own vocabulary and are marketed under
 * these names in every language — "Flying Dress" translated to
 * "Fliegendes Kleid" would be a product nobody searches for. Place names use
 * the exonym the target language actually uses (Gizeh, Guiza, Giza), which is
 * both what reads naturally and what people type into Google.
 */
const GLOSSARY = `
- "Egypt Eye", "Egypt Eye Travel & Tours" — the company. NEVER translate or transliterate.
- "Flying Dress" — a product name. Keep in English in every language.
- "My Journey", "Pharaoh's Challenge", "Signature Experience" — product names. Keep in English.
- "Nine Pyramids View" — a specific viewpoint. Keep in English.
- Place names: use the target language's normal exonym (Giza/Gizeh/Guiza/Giza/Гиза/الجيزة,
  Luxor/Luxor/Luxor/Луксор/الأقصر, Aswan, Cairo, Sharm El Sheikh, Wadi Rum, Petra).
- Currency: prices stay in USD and keep the $ symbol and the digits exactly as written.
`.trim();

const VOICE = `
Egypt Eye is a private tour operator, not a mass-market booking site. The
English copy is deliberately concrete and unhyped: it names real places, real
durations and real trade-offs, and it never says "unforgettable journey",
"nestled" or "immerse yourself". Carry that register across. Translate for a
traveller in the target country who is deciding where to spend real money —
idiomatic, specific, and in the polite register a tour operator would use
(Sie / vous / usted-neutral / Lei / вы / أنتم).
`.trim();

type Dict = Record<string, string>;

function readJson(path: string): Dict {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
}

const args = process.argv.slice(2);
function flag(name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}
const limit = Number(flag("limit") ?? Infinity);
const targets: Locale[] = args.includes("--all")
  ? LOCALES.map((l) => l.code).filter((c) => c !== DEFAULT_LOCALE)
  : [(flag("locale") ?? "") as Locale];

// Two ways to authenticate, because the key belongs to the site owner and not
// to whoever runs this:
//
//   GEMINI_API_KEY in the environment — the key is in this process.
//   --proxy-auth                       — the key is held outside the sandbox as
//                                        a cloud-environment API credential and
//                                        attached to the request after it
//                                        leaves. Nothing here ever sees it.
//
// Either way the key travels as the x-goog-api-key header rather than a `?key=`
// query parameter, so it stays out of URLs, logs and the proxy's access records.
const apiKey = process.env.GEMINI_API_KEY;
const proxyAuth = args.includes("--proxy-auth");
if (!apiKey && !proxyAuth) {
  console.error("No Gemini credential. Either:");
  console.error("  export GEMINI_API_KEY=...   (the same free key the AI concierge uses)");
  console.error("  or pass --proxy-auth if the key is stored as a cloud-environment");
  console.error("  API credential for generativelanguage.googleapis.com");
  process.exit(1);
}
if (targets.length === 0 || targets.some((t) => !LOCALES.some((l) => l.code === t) || t === DEFAULT_LOCALE)) {
  console.error(`Pass --locale <${LOCALES.map((l) => l.code).filter((c) => c !== "en").join("|")}> or --all`);
  process.exit(1);
}

async function translateBatch(texts: string[], locale: Locale): Promise<string[]> {
  const info = LOCALES.find((l) => l.code === locale)!;
  const prompt = `You are translating the website of Egypt Eye, a private Egyptian tour operator, from English into ${info.englishName}.

${VOICE}

GLOSSARY — apply exactly:
${GLOSSARY}

RULES:
- Return ONLY a JSON array of strings, the same length and order as the input array.
- Translate each string independently. Some are full paragraphs, some are two-word labels; a short one is a UI label and must stay short.
- Preserve any {placeholder} tokens, markdown, punctuation style and leading/trailing spacing exactly.
- Preserve numbers, durations and prices exactly as written.
- If a string is a proper noun or already correct in ${info.englishName}, return it unchanged.
- Never add commentary, quotes around the array, or markdown fences.

INPUT:
${JSON.stringify(texts, null, 0)}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "x-goog-api-key": apiKey } : {}),
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
          }),
        }
      );
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      // A rejected key is permanent: retrying it four times per batch, for
      // hundreds of batches, just takes longer to tell you the key is wrong.
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        const body = await res.text();
        console.error(`\n\nGemini rejected the credential (HTTP ${res.status}).`);
        console.error(
          proxyAuth
            ? "  Check the cloud-environment API credential: host generativelanguage.googleapis.com,\n" +
              "  custom header x-goog-api-key with no prefix."
            : "  Check GEMINI_API_KEY. Get one free at aistudio.google.com/apikey."
        );
        console.error(`  ${body.slice(0, 300)}\n`);
        process.exit(1);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);

      const json = await res.json();
      const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const parsed = JSON.parse(raw.replace(/^```(?:json)?|```$/g, "").trim());
      if (!Array.isArray(parsed) || parsed.length !== texts.length) {
        throw new Error(`expected ${texts.length} items, got ${Array.isArray(parsed) ? parsed.length : typeof parsed}`);
      }
      return parsed.map((v, i) => (typeof v === "string" && v.trim() ? v : texts[i]));
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.warn(`    batch failed after ${MAX_RETRIES} tries (${(err as Error).message}) — left in English`);
        return texts;
      }
      // Exponential backoff: the free tier rate-limits, and a whole-catalogue
      // run will hit it. Waiting is always better than dropping a batch.
      await new Promise((r) => setTimeout(r, 2000 * 2 ** (attempt - 1)));
    }
  }
  return texts;
}

for (const corpus of CORPORA) {
  const manifest = readJson(corpus.manifest);
  if (Object.keys(manifest).length === 0) {
    console.warn(`${corpus.manifest} is empty — run "npm run i18n:extract" first. Skipping.`);
    continue;
  }

  for (const locale of targets) {
    const file = corpus.out(locale);
    const existing = readJson(file);
    const missing = Object.entries(manifest).filter(([key]) => !existing[key]);
    const todo = missing.slice(0, Number.isFinite(limit) ? limit : undefined);

    const info = LOCALES.find((l) => l.code === locale)!;
    console.log(
      `\n${info.englishName} / ${corpus.name}: ${Object.keys(existing).length}/${Object.keys(manifest).length} done, ` +
        `${missing.length} missing, translating ${todo.length}`
    );
    if (todo.length === 0) continue;

    for (let i = 0; i < todo.length; i += BATCH_SIZE) {
      const batch = todo.slice(i, i + BATCH_SIZE);
      const out = await translateBatch(batch.map(([, text]) => text), locale);
      batch.forEach(([key], n) => {
        // An unchanged string means the model declined or the batch failed;
        // storing it would mark it "done" and it would never be retried.
        if (out[n] !== batch[n][1]) existing[key] = out[n];
      });

      // Written every batch, sorted, so an interrupted run loses nothing and
      // the diff stays reviewable.
      const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => (a < b ? -1 : 1)));
      writeFileSync(file, JSON.stringify(sorted, null, 0) + "\n");

      const done = Math.min(i + BATCH_SIZE, todo.length);
      process.stdout.write(`\r  ${done}/${todo.length} (${Math.round((done / todo.length) * 100)}%)`);
    }
    const total = Object.keys(manifest).length;
    const have = Object.keys(readJson(file)).length;
    console.log(`\n  \u2192 ${file}: ${have}/${total} (${Math.round((have / total) * 100)}%)`);
  }
}
