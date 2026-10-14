// The uniliteral ("alphabetic") Egyptian signs, and how a modern name is
// spelled with them.
//
// ─────────────────────────────────────────────────────────────────────────
// WHERE THIS DATA CAME FROM — READ THIS BEFORE EDITING
// ─────────────────────────────────────────────────────────────────────────
//
// It did NOT come from the supplier reference photographs. Those images are a
// product catalogue from a Cairo cartouche workshop — item numbers, metal
// combinations (Silver Gold, Frame Gold, Gold Gold, Double Face), bracelets,
// and three photographs of finished pendants. They contain no legend, no
// letter labels and no phonetic values: there is no letter-to-sign mapping in
// them to extract. Reading signs off a finished pendant and inferring an
// alphabet from it would be guesswork, and some of what is visible there is
// decorative border (repeated ankhs) rather than part of a name at all.
//
// So this list is built from the standard documented uniliteral sign set —
// Gardiner's sign list, the same set every Egyptology textbook uses — and
// every entry records its Gardiner code so it can be checked against a
// reference rather than taken on trust.
//
// ─────────────────────────────────────────────────────────────────────────
// WHAT IS TRUE, AND WHAT IS A CONVENTION
// ─────────────────────────────────────────────────────────────────────────
//
// Hieroglyphs are not an alphabet. These ~25 signs stand for CONSONANT
// SOUNDS, and ancient Egyptian wrote almost no vowels. A cartouche spelling a
// modern name is a phonetic approximation using the same technique the
// Egyptians themselves used for foreign names — which is exactly how Ptolemy
// and Cleopatra were written, and how Champollion cracked the script.
//
// That means some English letters have a genuine documented equivalent and
// some do not. `confidence` records which:
//
//   "documented"  the sign really carries that sound in Middle Egyptian
//   "convention"  no true equivalent; this is the substitution the trade and
//                 most tourist cartouches use, and the UI says so
//
// The category page already tells customers this, correctly: "Two people who
// spell a name differently can end up with the same cartouche, and that is
// correct rather than a mistake." Nothing here may contradict that.
//
// `depicts` is what the sign is a PICTURE of. `sound` is what it is read as.
// Those are different things and the UI must never present the picture as the
// meaning of the letter — an owl does not mean "M", it is read /m/.

export type SignConfidence = "documented" | "convention";

export type Hieroglyph = {
  /** Gardiner sign-list code — the checkable reference. */
  gardiner: string;
  /** The character itself. Unicode Egyptian Hieroglyphs block (U+13000–U+1342F). */
  glyph: string;
  /** Egyptological transliteration of the sound. */
  sound: string;
  /** What the sign is a picture of. Not its meaning as a letter. */
  depicts: string;
  /** One plain sentence for a customer, no jargon. */
  note: string;
  confidence: SignConfidence;
};

/**
 * English letter → the sign(s) used for it.
 *
 * Some letters map to more than one sign (X is written as two). The counter
 * must therefore count SIGNS, not letters — a four-letter name can need five
 * signs, and the brief is explicit that these must not be confused.
 */
export type LetterMapping = {
  letter: string;
  signs: Hieroglyph[];
  /** Set when the mapping is a trade convention rather than documented. */
  caveat?: string;
};

const SIGNS = {
  vulture:   { gardiner: "G1",  glyph: "\u{1313F}", sound: "ꜣ", depicts: "an Egyptian vulture", note: "A breathy sound English does not have. Stands in for A.", confidence: "documented" },
  reed:      { gardiner: "M17", glyph: "\u{131CB}", sound: "j / i", depicts: "a flowering reed", note: "A y-like sound, used for I and E.", confidence: "documented" },
  twoReeds:  { gardiner: "M17a",glyph: "\u{131CC}", sound: "y", depicts: "two flowering reeds", note: "The doubled reed, read as Y.", confidence: "documented" },
  arm:       { gardiner: "D36", glyph: "\u{1309D}", sound: "ꜥ", depicts: "a forearm", note: "A sound made deep in the throat. Used for A and O.", confidence: "documented" },
  quail:     { gardiner: "G43", glyph: "\u{13171}", sound: "w", depicts: "a quail chick", note: "Read as W or U.", confidence: "documented" },
  foot:      { gardiner: "D58", glyph: "\u{130C0}", sound: "b", depicts: "a lower leg and foot", note: "Read as B.", confidence: "documented" },
  stool:     { gardiner: "Q3",  glyph: "\u{132AA}", sound: "p", depicts: "a reed stool", note: "Read as P.", confidence: "documented" },
  viper:     { gardiner: "I9",  glyph: "\u{13191}", sound: "f", depicts: "a horned viper", note: "Read as F.", confidence: "documented" },
  owl:       { gardiner: "G17", glyph: "\u{13153}", sound: "m", depicts: "an owl", note: "Read as M.", confidence: "documented" },
  water:     { gardiner: "N35", glyph: "\u{13216}", sound: "n", depicts: "a ripple of water", note: "Read as N.", confidence: "documented" },
  mouth:     { gardiner: "D21", glyph: "\u{1308B}", sound: "r", depicts: "a mouth", note: "Read as R.", confidence: "documented" },
  shelter:   { gardiner: "O4",  glyph: "\u{13254}", sound: "h", depicts: "a reed shelter", note: "Read as H.", confidence: "documented" },
  wick:      { gardiner: "V28", glyph: "\u{1339B}", sound: "ḥ", depicts: "a twisted wick of flax", note: "A heavier H, made further back in the throat.", confidence: "documented" },
  bolt:      { gardiner: "O34", glyph: "\u{13283}", sound: "s / z", depicts: "a door bolt", note: "Read as S or Z.", confidence: "documented" },
  cloth:     { gardiner: "S29", glyph: "\u{132F4}", sound: "s", depicts: "a folded cloth", note: "The other S, and the one most often used.", confidence: "documented" },
  pool:      { gardiner: "N37", glyph: "\u{13219}", sound: "š", depicts: "a garden pool", note: "Read as SH.", confidence: "documented" },
  hill:      { gardiner: "N29", glyph: "\u{1320E}", sound: "q", depicts: "a slope of a hill", note: "A K made at the back of the throat. Read as Q.", confidence: "documented" },
  basket:    { gardiner: "V31", glyph: "\u{133A1}", sound: "k", depicts: "a basket with a handle", note: "Read as K.", confidence: "documented" },
  jarStand:  { gardiner: "W11", glyph: "\u{133BC}", sound: "g", depicts: "a stand for a jar", note: "Read as G.", confidence: "documented" },
  loaf:      { gardiner: "X1",  glyph: "\u{133CF}", sound: "t", depicts: "a loaf of bread", note: "Read as T.", confidence: "documented" },
  hand:      { gardiner: "D46", glyph: "\u{130A7}", sound: "d", depicts: "a hand", note: "Read as D.", confidence: "documented" },
  cobra:     { gardiner: "I10", glyph: "\u{13193}", sound: "ḏ", depicts: "a cobra at rest", note: "A DJ sound. Used for J.", confidence: "documented" },
  lion:      { gardiner: "E23", glyph: "\u{130ED}", sound: "rw / l", depicts: "a reclining lion", note: "Egyptian had no L of its own. Scribes used this lion for L when writing Greek and Roman names, and cartouches still do.", confidence: "convention" },
} satisfies Record<string, Hieroglyph>;

/** Every distinct sign, for a reference panel. */
export const ALL_SIGNS: Hieroglyph[] = Object.values(SIGNS);

const CONVENTION = {
  c: "Egyptian had no C. Hard C (as in Carl) is written with the basket K; soft C (as in Cecilia) with the folded cloth S.",
  e: "Egyptian wrote almost no vowels. E is written with the reed, the closest available sound.",
  o: "Egyptian had no O. The quail chick, read W or U, is the usual stand-in.",
  v: "Egyptian had no V. The horned viper, read F, is used — V and F are closely related sounds.",
  x: "X has no single sign. It is written as two: the basket K followed by the folded cloth S.",
  l: "Egyptian had no L of its own. The reclining lion was used for L when writing foreign names, and still is.",
  u: "U is written with the quail chick, the same sign used for W.",
} as const;

/**
 * The mapping. Lowercase single letters only — the caller normalises first.
 *
 * Deliberately a flat object rather than something clever: when the full
 * collection arrives this is the one thing that gets replaced, and it should
 * be obvious to anyone opening the file how to replace it.
 */
const MAP: Record<string, LetterMapping> = {
  a: { letter: "A", signs: [SIGNS.vulture] },
  b: { letter: "B", signs: [SIGNS.foot] },
  c: { letter: "C", signs: [SIGNS.basket], caveat: CONVENTION.c },
  d: { letter: "D", signs: [SIGNS.hand] },
  e: { letter: "E", signs: [SIGNS.reed], caveat: CONVENTION.e },
  f: { letter: "F", signs: [SIGNS.viper] },
  g: { letter: "G", signs: [SIGNS.jarStand] },
  h: { letter: "H", signs: [SIGNS.shelter] },
  i: { letter: "I", signs: [SIGNS.reed] },
  j: { letter: "J", signs: [SIGNS.cobra] },
  k: { letter: "K", signs: [SIGNS.basket] },
  l: { letter: "L", signs: [SIGNS.lion], caveat: CONVENTION.l },
  m: { letter: "M", signs: [SIGNS.owl] },
  n: { letter: "N", signs: [SIGNS.water] },
  o: { letter: "O", signs: [SIGNS.quail], caveat: CONVENTION.o },
  p: { letter: "P", signs: [SIGNS.stool] },
  q: { letter: "Q", signs: [SIGNS.hill] },
  r: { letter: "R", signs: [SIGNS.mouth] },
  s: { letter: "S", signs: [SIGNS.cloth] },
  t: { letter: "T", signs: [SIGNS.loaf] },
  u: { letter: "U", signs: [SIGNS.quail], caveat: CONVENTION.u },
  v: { letter: "V", signs: [SIGNS.viper], caveat: CONVENTION.v },
  w: { letter: "W", signs: [SIGNS.quail] },
  x: { letter: "X", signs: [SIGNS.basket, SIGNS.cloth], caveat: CONVENTION.x },
  y: { letter: "Y", signs: [SIGNS.twoReeds] },
  z: { letter: "Z", signs: [SIGNS.bolt] },
};

/**
 * How many signs one cartouche holds.
 *
 * Four, as the business states. It is a single constant because
 * docs/boutique.md still lists "how many characters a cartouche can carry" as
 * an open question with the workshop — when a per-product answer arrives this
 * is the one place that changes, and spellName() takes it as an argument so a
 * larger pendant can pass its own.
 */
export const CARTOUCHE_CAPACITY = 4;

export type SpelledLetter = {
  input: string;
  mapping: LetterMapping | null;
};

export type Spelling = {
  /** Per input letter, in order, including the ones with no sign. */
  letters: SpelledLetter[];
  /** Only the signs that will actually be engraved, in order. */
  signs: Hieroglyph[];
  signCount: number;
  capacity: number;
  fits: boolean;
  /** Characters that cannot be written at all, de-duplicated, in order. */
  unsupported: string[];
  /** True once anything has been typed that produced a sign. */
  hasContent: boolean;
};

/**
 * Spell a name.
 *
 * Pure, synchronous, and the single authority on what a name becomes — the
 * preview, the counter, the validation message and the text handed to the
 * enquiry form all read this one result, so they cannot disagree with each
 * other.
 *
 * Unsupported characters are REPORTED, never dropped silently. The brief is
 * explicit about that and it is also the only honest behaviour: a customer
 * whose name quietly lost a letter would find out when the pendant arrived.
 */
export function spellName(input: string, capacity: number = CARTOUCHE_CAPACITY): Spelling {
  const letters: SpelledLetter[] = [];
  const signs: Hieroglyph[] = [];
  const unsupported: string[] = [];

  // Spaces, hyphens and apostrophes are not written in a cartouche, and they
  // are not "unsupported" either — they simply do not appear. Treating them
  // as errors would tell someone their own name is invalid.
  const IGNORED = new Set([" ", "-", "'", "’", "."]);

  for (const raw of [...input]) {
    if (IGNORED.has(raw)) continue;
    // Accents are folded to the base letter: José spells as J-O-S-E. The
    // sound is what matters here, and an é is not an unwritable character
    // in any sense a customer would recognise — it is an e.
    const key = raw
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    const mapping = MAP[key];
    if (mapping) {
      letters.push({ input: raw.toUpperCase(), mapping });
      signs.push(...mapping.signs);
    } else {
      letters.push({ input: raw, mapping: null });
      if (!unsupported.includes(raw)) unsupported.push(raw);
    }
  }

  const cap = Math.max(1, Math.floor(capacity) || CARTOUCHE_CAPACITY);
  return {
    letters,
    signs,
    signCount: signs.length,
    capacity: cap,
    fits: signs.length > 0 && signs.length <= cap,
    unsupported,
    hasContent: signs.length > 0,
  };
}

/** The signs as one string, for the preview and for the enquiry. */
export function glyphString(spelling: Spelling): string {
  return spelling.signs.map((s) => s.glyph).join("");
}

/**
 * One line describing the spelling, for the enquiry email and the admin desk.
 * e.g. 'OMAR → 𓅱𓅓𓄿𓂋 (w, m, ꜣ, r) — 4 of 4 signs'
 */
export function describeSpelling(name: string, spelling: Spelling): string {
  if (!spelling.hasContent) return "";
  const sounds = spelling.signs.map((s) => s.sound).join(", ");
  return `${name.trim().toUpperCase()} → ${glyphString(spelling)} (${sounds}) — ${spelling.signCount} of ${spelling.capacity} signs`;
}
