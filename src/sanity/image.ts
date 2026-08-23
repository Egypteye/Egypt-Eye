import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImage } from "@/content/types";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

// Wraps a plain photo URL (a curated Pexels photo, used until a real Sanity
// upload replaces it) so it exposes the same chainable .width()/.height()/
// .url() surface Sanity's own image builder does — every call site stays
// agnostic to which kind of image source it's actually rendering.
function externalUrlBuilder(url: string) {
  const self = { width: () => self, height: () => self, url: () => url };
  return self;
}

export function urlForImage(source: SanityImage | undefined) {
  if (typeof source === "string") {
    return source ? externalUrlBuilder(source) : undefined;
  }
  if (!source?.asset?._ref) return undefined;
  return builder.image(source).auto("format").fit("max");
}
