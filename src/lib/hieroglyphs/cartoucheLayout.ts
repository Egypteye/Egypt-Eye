// The geometry of the cartouche, as numbers rather than CSS.
//
// Separated from the component for the reason paypalBody.ts was separated
// from paypalClient.ts: a "use client" file is out of reach of the check
// scripts, and "the signs never spill out of the rope" is arithmetic that
// ought to be proven rather than eyeballed.
//
// Proportions follow the workshop's own card: an upright loop close to 1:3,
// with the ends of the rope tied off below it. A cartouche IS a loop of rope
// laid around a name — the tie at the foot is what makes it read as a piece
// of jewellery instead of a rounded rectangle, so it is drawn, not implied.

/** SVG user units. The whole drawing, including the tie below the loop. */
export const CARTOUCHE_VIEWBOX = { w: 120, h: 370 } as const;

/** The rope loop. `r` of half the width makes the ends true semicircles. */
export const LOOP = { x: 10, y: 6, w: 100, h: 330, r: 50 } as const;

/** Where the ends of the rope are tied. */
export const TIE_Y = 350;

/**
 * The band the signs may occupy.
 *
 * Inset from the loop on all four sides: the rounded ends steal width near
 * the top and bottom, and a sign touching the rope looks like a mistake.
 */
export const SAFE = { top: 26, bottom: 316, left: 26, right: 94 } as const;
export const SAFE_H = SAFE.bottom - SAFE.top;
export const SAFE_W = SAFE.right - SAFE.left;

/** Vertical rhythm: a sign's line box relative to its type size. */
export const LINE_RATIO = 1.1;

/** How much of its slot a sign's type size may claim. */
const HEIGHT_SHARE = 0.82;

/**
 * The type size for `count` signs stacked inside the loop.
 *
 * Limited by the width of the loop and by each sign's share of the height,
 * whichever is smaller — so a name longer than the cartouche holds shrinks to
 * fit rather than spilling over the rope. It is never truncated: the counter
 * says how many signs there really are, and the panel says plainly when that
 * is more than one cartouche can carry.
 *
 * Short names land on the width limit, which is deliberate. Letting one sign
 * swell to fill the whole loop would look like a different product.
 */
export function signFontSize(count: number): number {
  if (count <= 0) return 0;
  return Math.min((SAFE_H / count) * HEIGHT_SHARE, SAFE_W);
}

/** Where each sign's centre sits, top to bottom, centred as a block. */
export function signPositions(count: number): number[] {
  const line = signFontSize(count) * LINE_RATIO;
  const top = SAFE.top + (SAFE_H - line * count) / 2;
  return Array.from({ length: count }, (_, i) => top + line * i + line / 2);
}

/** True when every sign's line box stays inside the safe band. */
export function fitsInsideLoop(count: number): boolean {
  if (count <= 0) return true;
  const half = (signFontSize(count) * LINE_RATIO) / 2;
  return signPositions(count).every((y) => y - half >= SAFE.top - 0.01 && y + half <= SAFE.bottom + 0.01);
}
