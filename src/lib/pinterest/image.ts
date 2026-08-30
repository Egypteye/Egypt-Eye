import "server-only";
import { urlForImage } from "@/sanity/image";
import { siteUrl } from "@/content/seo";
import type { SanityImage } from "@/content/types";

// Pinterest requires a fully public, absolute image URL. urlForImage() already
// handles both a real Sanity-uploaded image and the plain-string Pexels-photo
// fallback most stories currently use — for the string case it hands back the
// bare path (e.g. "/photos/pexels-123.jpg"), which just needs the site origin
// prefixed to become something Pinterest can actually fetch.
export function resolvePinImageUrl(image: SanityImage | undefined): string | null {
  const resolved = urlForImage(image)?.width(1200).url();
  if (!resolved) return null;
  return resolved.startsWith("http") ? resolved : `${siteUrl}${resolved}`;
}
