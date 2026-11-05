/**
 * The strings a translator is not allowed to change, and the specific wrong
 * renderings that have already shipped.
 *
 * WHY THIS FILE EXISTS
 *
 * Both translation pipelines hide protected strings from the model and put
 * them back afterwards. `i18n-translate-local.py` does it literally: each
 * brand name and each `{placeholder}` is swapped for a sentinel `Zqxvw0`,
 * `Zqxvw1`, … before the offline Argos model sees the sentence, then swapped
 * back. `i18n-translate.mts` does it by instruction, in the prompt's GLOSSARY.
 *
 * Neither verified the result, and the offline model does not leave a
 * sentinel alone — it TRANSLITERATES it. `Zqxvw0` came back from the Arabic
 * model as "زكسوف", so `restore()` searched for an ASCII token that was no
 * longer there, found nothing, and returned the sentence with Arabic
 * gibberish where the brand name belonged. It reported success. The Italian
 * model did something different with the same input: handed a string that was
 * nothing but a sentinel, it answered "Traduzione:" — the Italian word for
 * "Translation:".
 *
 * What shipped, on a live site, for months:
 *
 *   - "Egypt Eye" read as "زكسوف" (≈ "Zaksouf") in 22 places on every Arabic
 *     page — the navbar, the newsletter, account signup, the affiliate and
 *     travel-agent programmes, the reservation confirmation, the chat
 *     assistant's own sentences.
 *   - "Egypt Eye" read as "Traduzione:" in 12 places on every Italian page,
 *     including the wordmark beside the logo. This is the symptom the owner
 *     reported; it was the smallest part of the problem.
 *   - 16 interface strings lost their `{placeholder}` entirely, so the value
 *     never rendered: "Up to {count} guests" became "حتى ضيوف زكسوف" — a
 *     guest limit with no number in it.
 *
 * So the lesson is not "pick a better sentinel". There is no token an NMT
 * model is guaranteed to pass through, and a prompt instruction is not a
 * guarantee either. The only thing that works is checking the output and
 * throwing it away when it is wrong — which is the rule this codebase already
 * states in `fingerprint.ts`: a wrong translation is worse than an
 * untranslated one. `verifyTranslation` below is that check, and
 * `scripts/check-i18n-integrity.mts` holds the committed dictionaries to it.
 */

/**
 * Names that must survive translation byte for byte, in every language.
 *
 * These are the company and its products as they are marketed, invoiced and
 * searched for. A traveller in Milan googles "Egypt Eye", not "Occhio
 * d'Egitto", so a translated brand name is both wrong and invisible.
 *
 * Deliberately short. Every entry here costs a translation when a model
 * declines to pass it through, so the list holds only names where a localized
 * rendering is a defect rather than a preference.
 */
export const BRAND_TERMS = [
  "Egypt Eye",
  "Flying Dress",
  "Nine Pyramids View",
] as const;

/**
 * Names the GLOSSARY asks to keep in English, where a localized rendering is
 * a branding decision rather than a bug — so they are documented here and
 * NOT enforced.
 *
 * "Pharaoh's Challenge" came back as "La sfida del Faraone", "Le défi du
 * pharaon", "Вызов фараона" and "تحدي فرعون". Those are competent
 * translations of a game's title. Whether the game is called the same thing
 * in every language is the owner's call, and deleting four languages' version
 * of it to enforce a line in a prompt would be making that call for them.
 *
 * Promote an entry to BRAND_TERMS only once the owner has said the English
 * name is the one that ships everywhere.
 */
export const GLOSSARY_PREFERENCE_TERMS = [
  "My Journey",
  "Pharaoh’s Challenge",
  "Signature Experience",
] as const;

/**
 * The sentinel `i18n-translate-local.py` substitutes protected strings with,
 * and the shapes it comes back in when the model has had a go at it.
 *
 * `Zqxvw0` has returned as `Zqxv0` (digit eaten), `Zqxvwh` (digit replaced by
 * the following letter) and as Arabic transliterations beginning "زكسوف". Any
 * of these in a shipped dictionary means a restore silently failed.
 */
export const SENTINEL_PATTERNS: readonly RegExp[] = [
  /Zqxv/i,
  /زكسوف/, // زكسوف
  /زاكسوف/, // زاكسوف
  /زككسف/, // زككسف
];

/**
 * A translation that is nothing but the target language's word for
 * "translation" — what the Argos Italian model returns when the whole input
 * was a sentinel and there was no sentence to translate.
 *
 * Anchored to the whole string on purpose. "Traduzione" inside a sentence is
 * an ordinary Italian word, and the Rosetta Stone articles use it correctly
 * dozens of times.
 */
export const ARTIFACT_ONLY =
  /^\s*(traduzione|traduction|traducci[oó]n|translation|перевод|ترجمة)\s*:?\s*$/i;

/** Interpolation tokens, which must appear in the translation unchanged. */
export const PLACEHOLDER_RE = /\{[a-zA-Z][a-zA-Z0-9_]*\}/g;

/**
 * Renderings observed in a shipped dictionary and confirmed wrong.
 *
 * These are not brand terms and not sentinel failures — they are the offline
 * model mistranslating a short proper noun, which it does because a two-token
 * place name looks like a word it knows. "Aswan" became "Aspetto"
 * ("Appearance"); "Siwa" became "Si'." (it heard "Sì"); "Edfu" was truncated
 * to "Ed"; "Saqqara" grew a third q; French turned "Wadi Rum" into "Rhum
 * Wadi", reading Rum as the drink and reordering it.
 *
 * Recorded as forbidden VALUES rather than corrected ones, because the fix is
 * to drop the entry and fall back to English — which the GLOSSARY already
 * asks for by naming Aswan, Wadi Rum, Petra, Cairo and Sharm El Sheikh with
 * no per-language variant. Asserting the right exonym in five languages would
 * be asserting something nobody here has checked; asserting that "Aswan" is
 * not "Aspetto" needs no such claim.
 */
export const FORBIDDEN_RENDERINGS: readonly {
  locale: string;
  english: string;
  wrong: string;
  why: string;
}[] = [
  { locale: "it", english: "Aswan", wrong: "Aspetto", why: "Italian for “Appearance”, not a place" },
  { locale: "it", english: "Siwa", wrong: "Si'.", why: "read as the adverb “sì”" },
  { locale: "it", english: "Edfu", wrong: "Ed", why: "truncated to a conjunction" },
  { locale: "it", english: "Saqqara", wrong: "Saqqqara", why: "misspelled" },
  { locale: "fr", english: "Wadi Rum", wrong: "Rhum Wadi", why: "“Rum” read as the drink, and reordered" },
];

export type TranslationFault =
  | { kind: "artifact"; detail: string }
  | { kind: "sentinel"; detail: string }
  | { kind: "brand"; detail: string }
  | { kind: "placeholder"; detail: string }
  | { kind: "forbidden"; detail: string };

function tokens(text: string): string[] {
  return (text.match(PLACEHOLDER_RE) ?? []).slice().sort();
}

/**
 * Why a translation is unusable, or an empty list if it is fine.
 *
 * Pure and dependency-free so both pipelines, the check script and a future
 * Studio-side validator can all apply the same rule — per CLAUDE.md #6, the
 * logic that has to be tested lives where a check script can reach it.
 *
 * `locale` is only needed for FORBIDDEN_RENDERINGS; everything else is
 * language-independent.
 */
export function verifyTranslation(
  english: string,
  translation: string,
  locale: string
): TranslationFault[] {
  const faults: TranslationFault[] = [];

  if (ARTIFACT_ONLY.test(translation)) {
    faults.push({
      kind: "artifact",
      detail: `the translation is only the word for “translation” (${JSON.stringify(translation)})`,
    });
  }

  for (const pattern of SENTINEL_PATTERNS) {
    if (pattern.test(translation)) {
      faults.push({
        kind: "sentinel",
        detail: `an unrestored protect-sentinel is still in the text (${pattern.source})`,
      });
      break;
    }
  }

  for (const term of BRAND_TERMS) {
    if (english.includes(term) && !translation.includes(term)) {
      faults.push({ kind: "brand", detail: `the English contains ${JSON.stringify(term)} and the translation does not` });
    }
  }

  const want = tokens(english);
  if (want.length > 0) {
    const got = tokens(translation);
    if (want.join("|") !== got.join("|")) {
      faults.push({
        kind: "placeholder",
        detail: `placeholders [${want.join(", ")}] became [${got.join(", ") || "none"}]`,
      });
    }
  }

  for (const rule of FORBIDDEN_RENDERINGS) {
    if (rule.locale === locale && english.trim() === rule.english && translation.trim() === rule.wrong) {
      faults.push({
        kind: "forbidden",
        detail: `${JSON.stringify(rule.english)} → ${JSON.stringify(rule.wrong)}: ${rule.why}`,
      });
    }
  }

  return faults;
}
