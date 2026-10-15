// The signs a cartouche is written with, and how a modern name is spelled
// using them.
//
// ─────────────────────────────────────────────────────────────────────────
// WHERE THIS DATA CAME FROM — READ THIS BEFORE EDITING
// ─────────────────────────────────────────────────────────────────────────
//
// From the workshop's own card: "New Pyramids for Kartouch Work Shop,
// Luxor - Cairo", photographed and sent by the owner. It is a two-sided
// laminated card — one side a letter-to-sign chart, the other a list the
// workshop calls "The Meaning of the Hieroglyphs".
//
// That card is the authority here, because it is what the engraver works
// from. Where it differs from textbook Egyptology this file follows the
// card, and `source` records which entries came from it.
//
// Three things on the card are deliberately NOT implemented, because they
// could not be read with certainty from a photograph of a laminated card:
//
//   * CH has its own sign (a red starburst with a tapered tail). It could
//     not be identified, so CH is written as C then H and `UNREADABLE`
//     below says so. It must not be guessed.
//   * The card shows TWO signs for H (twisted flax and reed shelter) and
//     TWO for N (red crown and water ripple). Only one of each is written;
//     the other is named in the note so nothing is hidden.
//   * ANKH, LOTOS, SCARAB and EYE are on the card as symbols rather than
//     letters. They are listed in SYMBOLS for reference but are never
//     added to a name on their own — whether a customer may add one, and
//     whether it costs a sign of the four, is a question for the workshop.
//
// An earlier version of this file was built from Gardiner's sign list alone
// because no chart had been supplied. The card disagreed with it in three
// places — O, I and X — and the card wins. Those are marked below.
//
// ─────────────────────────────────────────────────────────────────────────
// WHAT IS TRUE, AND WHAT IS A CONVENTION
// ─────────────────────────────────────────────────────────────────────────
//
// Hieroglyphs are not an alphabet. These signs stand for CONSONANT SOUNDS,
// and ancient Egyptian wrote almost no vowels. A cartouche spelling a modern
// name is a phonetic approximation using the same technique the Egyptians
// used for foreign names — which is how Ptolemy and Cleopatra were written,
// and how Champollion cracked the script.
//
// `depicts` is what the sign is a PICTURE of. `sound` is what it is read as.
// Those are different, and the UI must never present the picture as the
// meaning of the letter — an owl does not mean "M", it is read /m/.
//
// `meaning` is a third thing again: the workshop's own reading of the sign,
// off their card. "Wise Persone" for M is not Egyptology and not a
// translation. It is what the shop tells its customers, and the UI must
// attribute it to them rather than present it as history.

export type SignConfidence = "documented" | "convention";

/** Where an entry came from. The card outranks the textbook. */
export type SignSource = "workshop-card" | "convention";

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
 * A letter (or letter pair) → the sign(s) used for it.
 *
 * Some entries map to more than one sign, so the counter must count SIGNS,
 * not letters: a four-letter name can need five signs.
 */
export type LetterMapping = {
  letter: string;
  signs: Hieroglyph[];
  /** Set when the mapping is a trade convention rather than documented. */
  caveat?: string;
  /** The workshop's own reading of the sign, from their card. */
  meaning?: string;
  source: SignSource;
};

const SIGNS = {
  vulture:   { gardiner: "G1",  glyph: "\u{1313F}", sound: "ꜣ", depicts: "an Egyptian vulture", note: "A breathy sound English does not have. Stands in for A.", confidence: "documented" },
  reed:      { gardiner: "M17", glyph: "\u{131CB}", sound: "j / i", depicts: "a flowering reed", note: "A y-like sound. The card uses the single reed for E.", confidence: "documented" },
  twoReeds:  { gardiner: "M17a",glyph: "\u{131CC}", sound: "y", depicts: "two flowering reeds", note: "The doubled reed. The card uses it for both I and Y.", confidence: "documented" },
  quail:     { gardiner: "G43", glyph: "\u{13171}", sound: "w", depicts: "a quail chick", note: "One sign for both U and W, as the card shows them together.", confidence: "documented" },
  lasso:     { gardiner: "V4",  glyph: "\u{1336F}", sound: "wꜣ", depicts: "a lasso", note: "The card's sign for O.", confidence: "convention" },
  foot:      { gardiner: "D58", glyph: "\u{130C0}", sound: "b", depicts: "a lower leg and foot", note: "Read as B.", confidence: "documented" },
  stool:     { gardiner: "Q3",  glyph: "\u{132AA}", sound: "p", depicts: "a reed stool", note: "Read as P.", confidence: "documented" },
  viper:     { gardiner: "I9",  glyph: "\u{13191}", sound: "f", depicts: "a horned viper", note: "One sign for both F and V, as the card shows them together.", confidence: "documented" },
  owl:       { gardiner: "G17", glyph: "\u{13153}", sound: "m", depicts: "an owl", note: "Read as M.", confidence: "documented" },
  water:     { gardiner: "N35", glyph: "\u{13216}", sound: "n", depicts: "a ripple of water", note: "Read as N. The card shows the red crown of Lower Egypt beside it; both are read N, and the workshop may use either.", confidence: "documented" },
  mouth:     { gardiner: "D21", glyph: "\u{1308B}", sound: "r", depicts: "a mouth", note: "Read as R.", confidence: "documented" },
  shelter:   { gardiner: "O4",  glyph: "\u{13254}", sound: "h", depicts: "a reed shelter", note: "Read as H. The card shows a twisted wick of flax beside it; that is the heavier H, and the workshop may use either.", confidence: "documented" },
  cloth:     { gardiner: "S29", glyph: "\u{132F4}", sound: "s", depicts: "a folded cloth", note: "Read as S.", confidence: "documented" },
  bolt:      { gardiner: "O34", glyph: "\u{13283}", sound: "s / z", depicts: "a door bolt", note: "The card's sign for Z.", confidence: "documented" },
  pool:      { gardiner: "N37", glyph: "\u{13219}", sound: "š", depicts: "a garden pool", note: "SH is one sign on the card, not S followed by H.", confidence: "documented" },
  tether:    { gardiner: "V13", glyph: "\u{1337F}", sound: "ṯ", depicts: "a tethering rope", note: "TH is one sign on the card, not T followed by H.", confidence: "documented" },
  placenta:  { gardiner: "Aa1", glyph: "\u{1340D}", sound: "ḫ", depicts: "a disc crossed with lines, usually read as a placenta", note: "KH is one sign on the card, not K followed by H. A rasping sound, like the ch in loch.", confidence: "documented" },
  hill:      { gardiner: "N29", glyph: "\u{1320E}", sound: "q", depicts: "a slope of a hill", note: "A K made at the back of the throat. Read as Q.", confidence: "documented" },
  basket:    { gardiner: "V31", glyph: "\u{133A1}", sound: "k", depicts: "a basket with a handle", note: "One sign for C, K and X, as the card groups them.", confidence: "documented" },
  jarStand:  { gardiner: "W11", glyph: "\u{133BC}", sound: "g", depicts: "a stand for a jar", note: "Read as G.", confidence: "documented" },
  loaf:      { gardiner: "X1",  glyph: "\u{133CF}", sound: "t", depicts: "a loaf of bread", note: "Read as T.", confidence: "documented" },
  hand:      { gardiner: "D46", glyph: "\u{130A7}", sound: "d", depicts: "a hand", note: "Read as D.", confidence: "documented" },
  cobra:     { gardiner: "I10", glyph: "\u{13193}", sound: "ḏ", depicts: "a cobra at rest", note: "A DJ sound. The card's sign for J.", confidence: "documented" },
  lion:      { gardiner: "E23", glyph: "\u{130ED}", sound: "rw / l", depicts: "a reclining lion", note: "Egyptian had no L of its own. Scribes used this lion for L when writing Greek and Roman names, and the card does the same.", confidence: "convention" },
} satisfies Record<string, Hieroglyph>;

/** Every distinct sign, for a reference panel. */
export const ALL_SIGNS: Hieroglyph[] = Object.values(SIGNS);

/**
 * The symbols on the card that are not letters.
 *
 * Listed so they are not lost, and NOT written into a name. Whether a
 * customer may add one, and whether it uses up one of the signs the
 * cartouche holds, is an open question with the workshop.
 */
export const SYMBOLS: { name: string; glyph: string; gardiner: string; workshopMeaning: string }[] = [
  { name: "Ankh",         glyph: "\u{132F9}", gardiner: "S34", workshopMeaning: "Long Life" },
  { name: "Scarab",       glyph: "\u{131A3}", gardiner: "L1",  workshopMeaning: "Good Luck" },
  { name: "Eye of Horus", glyph: "\u{13080}", gardiner: "D10", workshopMeaning: "Protection" },
];

/**
 * On the card but not implemented, because it could not be read from the
 * photograph. Named rather than guessed.
 */
export const UNREADABLE = [
  {
    label: "CH",
    why: "The card gives CH its own sign — a red starburst with a tapered tail — which could not be identified from the photograph. CH is written here as C then H until the workshop confirms it.",
  },
] as const;

const CONVENTION = {
  c: "Egyptian had no C. The card writes C, K and X with the same basket.",
  e: "Egyptian wrote almost no vowels. The card writes E with the single reed, the closest available sound.",
  i: "The card writes I with the doubled reed — the same sign it uses for Y.",
  o: "Egyptian had no O. The card uses the lasso for it.",
  v: "Egyptian had no V. The card writes V with the horned viper, the same sign as F — closely related sounds.",
  x: "The card writes X with the basket, the same sign as C and K.",
  l: "Egyptian had no L of its own. The reclining lion was used for L when writing foreign names, and the card does the same.",
  u: "The card writes U with the quail chick, the same sign as W.",
} as const;

/**
 * The mapping, straight off the workshop's card.
 *
 * Deliberately a flat object rather than something clever: this is the one
 * thing that gets replaced when the workshop sends a correction, and it
 * should be editable by anyone who can read the card.
 *
 * `meaning` is the workshop's own wording from the reverse of the card,
 * quoted as they wrote it. The card has no entry for Q, so Q has no meaning
 * here rather than an invented one.
 *
 * Keys of two characters are DIGRAPHS and are matched before single letters,
 * because SH, TH and KH are each one sign on the card. Spelling them as two
 * would both draw the wrong signs and overstate how much room a name needs.
 */
const MAP: Record<string, LetterMapping> = {
  // Digraphs first — see spellName().
  sh: { letter: "SH", signs: [SIGNS.pool],     source: "workshop-card" },
  th: { letter: "TH", signs: [SIGNS.tether],   source: "workshop-card" },
  kh: { letter: "KH", signs: [SIGNS.placenta], source: "workshop-card" },

  a: { letter: "A", signs: [SIGNS.vulture],  meaning: "Powerful and Strong Person", source: "workshop-card" },
  b: { letter: "B", signs: [SIGNS.foot],     meaning: "Travelling Every Where",     source: "workshop-card" },
  c: { letter: "C", signs: [SIGNS.basket],   meaning: "Full of Good Qualities", caveat: CONVENTION.c, source: "workshop-card" },
  d: { letter: "D", signs: [SIGNS.hand],     meaning: "Friendly & Helpful",         source: "workshop-card" },
  e: { letter: "E", signs: [SIGNS.reed],     meaning: "Fair & Just", caveat: CONVENTION.e, source: "workshop-card" },
  f: { letter: "F", signs: [SIGNS.viper],    meaning: "Clever Person",              source: "workshop-card" },
  g: { letter: "G", signs: [SIGNS.jarStand], meaning: "Stable",                     source: "workshop-card" },
  h: { letter: "H", signs: [SIGNS.shelter],  meaning: "Diplomatic Person",          source: "workshop-card" },
  i: { letter: "I", signs: [SIGNS.twoReeds], meaning: "Like the Straight Way", caveat: CONVENTION.i, source: "workshop-card" },
  j: { letter: "J", signs: [SIGNS.cobra],    meaning: "Intelligent & Bossy",        source: "workshop-card" },
  k: { letter: "K", signs: [SIGNS.basket],   meaning: "Full of Good Qualities",     source: "workshop-card" },
  l: { letter: "L", signs: [SIGNS.lion],     meaning: "Controlling & bossy", caveat: CONVENTION.l, source: "workshop-card" },
  m: { letter: "M", signs: [SIGNS.owl],      meaning: "Wise Persone",               source: "workshop-card" },
  n: { letter: "N", signs: [SIGNS.water],    meaning: "Flexible",                   source: "workshop-card" },
  o: { letter: "O", signs: [SIGNS.lasso],    meaning: "Funny & adventurous", caveat: CONVENTION.o, source: "workshop-card" },
  p: { letter: "P", signs: [SIGNS.stool],    meaning: "Creative Person",            source: "workshop-card" },
  // The card's alphabet has Q; its meanings list does not. No meaning invented.
  q: { letter: "Q", signs: [SIGNS.hill],     source: "workshop-card" },
  r: { letter: "R", signs: [SIGNS.mouth],    meaning: "Talk too much",              source: "workshop-card" },
  s: { letter: "S", signs: [SIGNS.cloth],    meaning: "Independent one",            source: "workshop-card" },
  t: { letter: "T", signs: [SIGNS.loaf],     meaning: "Eats too much",              source: "workshop-card" },
  u: { letter: "U", signs: [SIGNS.quail],    meaning: "Like Children Stubborn", caveat: CONVENTION.u, source: "workshop-card" },
  v: { letter: "V", signs: [SIGNS.viper],    meaning: "Clever Person", caveat: CONVENTION.v, source: "workshop-card" },
  w: { letter: "W", signs: [SIGNS.quail],    meaning: "Like Children Stubborn",     source: "workshop-card" },
  x: { letter: "X", signs: [SIGNS.basket],   meaning: "Full of Good Qualities", caveat: CONVENTION.x, source: "workshop-card" },
  y: { letter: "Y", signs: [SIGNS.twoReeds], meaning: "Fair & Justful",             source: "workshop-card" },
  z: { letter: "Z", signs: [SIGNS.bolt],     meaning: "Close Link to family",       source: "workshop-card" },
};

/** The two-character keys, longest-match-first, derived rather than repeated. */
const DIGRAPHS = Object.keys(MAP).filter((k) => k.length === 2);

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
 * Unsupported characters are REPORTED, never dropped silently. A customer
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

  // Accents fold to the base letter: José spells as J-O-S-E. The sound is
  // what matters, and an é is not an unwritable character in any sense a
  // customer would recognise — it is an e.
  const fold = (ch: string) =>
    ch
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  const chars = [...input];
  let i = 0;
  while (i < chars.length) {
    const raw = chars[i];
    if (IGNORED.has(raw)) {
      i += 1;
      continue;
    }

    // SH, TH and KH are one sign each on the card, so a two-character match
    // is tried before the single letter. Without this, Sharon would draw the
    // wrong signs AND claim to need one more than it does.
    const pair = i + 1 < chars.length ? fold(raw) + fold(chars[i + 1]) : "";
    if (pair && DIGRAPHS.includes(pair)) {
      const mapping = MAP[pair];
      letters.push({ input: (raw + chars[i + 1]).toUpperCase(), mapping });
      signs.push(...mapping.signs);
      i += 2;
      continue;
    }

    const mapping = MAP[fold(raw)];
    if (mapping) {
      letters.push({ input: raw.toUpperCase(), mapping });
      signs.push(...mapping.signs);
    } else {
      letters.push({ input: raw, mapping: null });
      if (!unsupported.includes(raw)) unsupported.push(raw);
    }
    i += 1;
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
 * One line for the workshop, e.g.
 * 'OMAR → 𓍯𓅓𓄿𓂋 (wꜣ, m, ꜣ, r) — 4 of 4 signs'
 */
export function describeSpelling(name: string, spelling: Spelling): string {
  if (!spelling.hasContent) return "";
  const sounds = spelling.signs.map((s) => s.sound).join(", ");
  return `${name.trim().toUpperCase()} → ${glyphString(spelling)} (${sounds}) — ${spelling.signCount} of ${spelling.capacity} signs`;
}
