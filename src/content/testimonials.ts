import type { Testimonial } from "./types";

// Intentionally empty. Only genuine, collected customer reviews belong here
// or in Sanity's Testimonials list — never invented or illustrative quotes.
// The homepage Reviews section hides itself automatically while this list
// (and the CMS) are empty (see getTestimonials in sanity/fetchers.ts and the
// conditional render in app/(site)/page.tsx). Add real reviews as they come
// in, either here or directly in Studio under "Testimonials".
export const testimonials: Testimonial[] = [];
