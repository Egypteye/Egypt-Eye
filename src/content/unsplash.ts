// Shared helpers for the Unsplash photography used across the site.
//
// Photos are hot-linked from Unsplash's own CDN rather than re-hosted, which
// is what the Unsplash API Guidelines ask integrations to do. They reach the
// browser through next/image (same origin), so no CSP change is needed —
// images.unsplash.com only has to be in next.config.ts's remotePatterns.
//
// Every photo used anywhere on this site should carry an `UnsplashCredit` so
// the photographer and the original photo page stay identifiable later.
// Replacing any of them with Egypt Eye's own photography is an upgrade: swap
// the image and drop the credit.

export type UnsplashCredit = {
  source: "Unsplash";
  creator: string;
  /** The photo's page on Unsplash, not the raw file URL. */
  sourceUrl: string;
  license: "Unsplash License";
};

/**
 * Builds a sized Unsplash delivery URL from a photo's own path.
 *
 * `width` should be at least as wide as the largest slot the photo renders
 * in — 1600 covers a full-bleed detail hero; the small homepage tiles are
 * happy with far less, and next/image resizes down from whatever it gets.
 */
export function unsplashUrl(photoPath: string, width = 1600): string {
  return `https://images.unsplash.com/${photoPath}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${width}`;
}

export function unsplashCredit(creator: string, sourceUrl: string): UnsplashCredit {
  return { source: "Unsplash", creator, sourceUrl, license: "Unsplash License" };
}
