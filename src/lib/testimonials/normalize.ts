// Shared duplicate-detection key for Testimonial documents — used by both
// the Bulk Add Reviews Studio tool (to skip re-adding a review that's
// already there) and the /api/dedupe-testimonials cleanup route (to find
// duplicates already live). Case, punctuation, and whitespace differences
// shouldn't count as a "different" review, so both are normalized away.
export function normalizeReviewText(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function reviewDuplicateKey(name: string | undefined, quote: string | undefined): string {
  return `${normalizeReviewText(name)}|||${normalizeReviewText(quote)}`;
}
