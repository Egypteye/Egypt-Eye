/**
 * The small pill above a heading — "First Flying Dresses in Egypt", a tour's
 * duration, a weekly trip's category.
 *
 * It takes a tone because it is used on two kinds of surface and one colour
 * cannot serve both. The background is always `gold/15`, a translucent wash,
 * so what the text actually sits on is the wash composited over whatever is
 * behind it — and that is a different colour on a white card than on the
 * dark `ink` and `nile` panels on the homepage.
 *
 * Measured, not guessed. With the original single `text-gold-dark`:
 *
 *   gold/15 over ink        2.17:1   fail
 *   gold/15 over nile       1.23:1   fail badly
 *   gold/15 over sand-deep  3.97:1   fail
 *   gold/15 over sand-dim   4.43:1   fail, marginally
 *   gold/15 over white      4.71:1   pass
 *
 * The text is 12px and bold, which is not "large text" under WCAG, so the
 * threshold is 4.5:1 and four of those five surfaces were below it.
 * Lighthouse reported the two dark ones on 4 November 2026; the light ones
 * were failing too and nothing had flagged them.
 *
 * `gold-light` is NOT the fix for the dark tone — it measures 4.01:1 on the
 * nile panel, which still fails. Cream does: 11.35:1 on ink, 6.45:1 on nile.
 */
export function Badge({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  /** "dark" for the ink and nile panels, where gold text cannot carry. */
  tone?: "light" | "dark";
}) {
  const palette = tone === "dark" ? "text-cream" : "text-gold-deep";
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide ${palette}`}
    >
      {children}
    </span>
  );
}
