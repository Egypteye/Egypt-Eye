import groq from "groq";

// Shared GROQ fragments/queries. Field selection lists explicitly, rather
// than `...`, so adding a Studio-only field never accidentally changes the
// site's data shape.

const ratingFields = groq`rating{score, count}`;
const priceFields = groq`price{amount, originalAmount, note}`;

export const toursQuery = groq`*[_type == "tour"] | order(order asc) {
  "slug": slug.current, title, tagline, category, duration, lengthDays, cities,
  destinations, ${ratingFields}, badge, image, imageTone, description,
  highlights, included, excluded, itinerary, ${priceFields}
}`;

export const tourBySlugQuery = groq`*[_type == "tour" && slug.current == $slug][0] {
  "slug": slug.current, title, tagline, category, duration, lengthDays, cities,
  destinations, ${ratingFields}, badge, image, imageTone, description,
  highlights, included, excluded, itinerary, ${priceFields}
}`;

export const experiencesQuery = groq`*[_type == "experience"] | order(order asc) {
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  image, imageTone, description, included
}`;

export const experienceBySlugQuery = groq`*[_type == "experience" && slug.current == $slug][0] {
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  image, imageTone, description, included
}`;

export const photoshootsQuery = groq`*[_type == "photoshoot"] | order(order asc) {
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  locations, image, imageTone, description, goodFor, included, addOns, delivery
}`;

export const photoshootBySlugQuery = groq`*[_type == "photoshoot" && slug.current == $slug][0] {
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  locations, image, imageTone, description, goodFor, included, addOns, delivery
}`;

export const testimonialsQuery = groq`*[_type == "testimonial"] | order(order asc) {
  name, quote, context
}`;

export const storiesQuery = groq`*[_type == "story"] | order(publishedAt desc) {
  "slug": slug.current, title, excerpt, image, imageTone, publishedAt
}`;

export const storyBySlugQuery = groq`*[_type == "story" && slug.current == $slug][0] {
  "slug": slug.current, title, excerpt, image, imageTone, body, publishedAt
}`;

export const faqsQuery = groq`*[_type == "faqItem"] | order(order asc) {
  question, answer
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0] {
  name, shortName, tagline, heroHeadline, heroSubheadline, description, positioning,
  contact, socials, pillars, policies, heroImages[]{image, tone, label},
  flyingDressImage, redSeaImage, ninePyramidsImage, customizeImage,
  destinationPhotos[]{name, image}
}`;
