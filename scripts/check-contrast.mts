/**
 * Computes the contrast of every gold-on-gold-wash pairing in the codebase,
 * because this bug has now been shipped twice and is invisible to review.
 *
 * `bg-gold/15` is a translucent wash. Whatever text sits on it is really
 * sitting on that wash composited over whatever is behind it — so the same
 * two class names pass on a white card and fail badly on the dark homepage
 * panels, and nothing in the markup says which surface a component will land
 * on. Badge shipped at 2.17:1 on `ink` and 1.23:1 on `nile`, and
 * InstantBookingBadge shipped at 3.97:1 on `sand-deep`. Lighthouse reported
 * the first two on 4 November 2026 and said nothing about the others, because
 * it only sees the surfaces it happens to render.
 *
 * So rather than trusting a reviewer's eye or an audit's coverage, this reads
 * the real token values out of globals.css, does the WCAG arithmetic, and
 * fails on any combination that cannot carry small text on the surfaces the
 * component is actually used on.
 */
import { readFileSync } from "node:fs";

const errors: string[] = [];

const css = readFileSync("src/app/globals.css", "utf8");

function token(name: string): string {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!m) throw new Error(`--color-${name} is not defined in globals.css`);
  return m[1];
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (c: number[]) => {
  const [r, g, b] = c.map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
function ratio(a: number[], b: number[]): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
/** The wash, composited: `bg-gold/15` over whatever is behind it. */
const over = (fg: number[], alpha: number, bg: number[]) =>
  fg.map((f, i) => Math.round(alpha * f + (1 - alpha) * bg[i]));

// WCAG AA for text under 18.66px bold / 24px regular. Every pill here is
// 10-12px, so this is the threshold, not the 3:1 large-text one.
const AA = 4.5;

const gold = rgb(token("gold"));

/**
 * The surfaces a `bg-gold/15` pill actually lands on. Light ones are the
 * cards; ink and nile are the two dark homepage panels.
 */
const SURFACES = {
  white: "#ffffff",
  "sand-dim": token("sand-dim"),
  "sand-deep": token("sand-deep"),
  ink: token("ink"),
  nile: token("nile"),
} as const;

const LIGHT = ["white", "sand-dim", "sand-deep"] as const;
const DARK = ["ink", "nile"] as const;

/**
 * Each pill, the token it uses, and the surfaces it is used on.
 *
 * Kept as data rather than scraped from the JSX: which surface a component
 * lands on is a fact about where it is rendered, which no regex can read off
 * the component itself. Adding a pill means adding a line here — and the
 * assertion below that every token named is one the stylesheet defines is
 * what stops that line being quietly wrong.
 */
const PILLS: { file: string; token: string; surfaces: readonly (keyof typeof SURFACES)[] }[] = [
  { file: "src/components/Badge.tsx", token: "gold-deep", surfaces: LIGHT },
  { file: "src/components/Badge.tsx", token: "cream", surfaces: DARK },
  { file: "src/components/InstantBookingBadge.tsx", token: "gold-deep", surfaces: LIGHT },
];

for (const pill of PILLS) {
  const source = readFileSync(pill.file, "utf8");
  if (!source.includes(`text-${pill.token}`)) {
    errors.push(
      `${pill.file} no longer uses text-${pill.token}; this check is measuring a pairing the ` +
        "component does not have, so its result means nothing"
    );
    continue;
  }
  for (const surfaceName of pill.surfaces) {
    const background = over(gold, 0.15, rgb(SURFACES[surfaceName]));
    const r = ratio(rgb(token(pill.token)), background);
    if (r < AA) {
      errors.push(
        `${pill.file}: text-${pill.token} on bg-gold/15 over ${surfaceName} is ${r.toFixed(2)}:1, ` +
          `under the ${AA}:1 that 11-12px bold text needs`
      );
    }
  }
}

// The pairing that keeps getting reached for, and keeps failing. Named
// explicitly so the failure message says why rather than just giving a
// number: gold-dark is the obvious-looking choice and is wrong on four of
// the five surfaces these pills appear on.
for (const file of ["src/components/Badge.tsx", "src/components/InstantBookingBadge.tsx"]) {
  const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");
  if (/bg-gold\/15[^"'`]*text-gold-dark|text-gold-dark[^"'`]*bg-gold\/15/.test(source)) {
    errors.push(
      `${file} pairs text-gold-dark with bg-gold/15. Measured: 4.71:1 over white, 4.43:1 over ` +
        "sand-dim, 3.97:1 over sand-deep, 2.17:1 over ink, 1.23:1 over nile — it only passes on " +
        "pure white. Use gold-deep on light surfaces and cream on dark."
    );
  }
}

// And gold-light, which is the intuitive fix for the dark panels and does not
// work: 4.01:1 on nile.
const darkPanelGoldLight = ratio(rgb(token("gold-light")), over(gold, 0.15, rgb(token("nile"))));
if (darkPanelGoldLight >= AA) {
  errors.push(
    `gold-light now measures ${darkPanelGoldLight.toFixed(2)}:1 on gold/15 over nile. It used to ` +
      "be 4.01:1, which is why Badge's dark tone uses cream. If a token changed, re-check that " +
      "choice rather than deleting this line."
  );
}

if (errors.length > 0) {
  console.error(`\ncheck-contrast: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

const measured = PILLS.flatMap((p) =>
  p.surfaces.map((s) => ratio(rgb(token(p.token)), over(gold, 0.15, rgb(SURFACES[s]))))
);
console.log(
  `check-contrast: ok — ${measured.length} gold-wash pairings measured against the real tokens, ` +
    `worst ${Math.min(...measured).toFixed(2)}:1 against a ${AA}:1 floor; neither pill pairs ` +
    "gold-dark with gold/15, and gold-light is still too weak for the dark panels."
);
