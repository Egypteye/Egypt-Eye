import groq from "groq";

// Shared GROQ fragments/queries. Field selection lists explicitly, rather
// than `...`, so adding a Studio-only field never accidentally changes the
// site's data shape.

const ratingFields = groq`rating{score, count}`;
const priceFields = groq`price{amount, originalAmount, note}`;

// hidden != true (rather than hidden == false) so tours from before the
// field existed, where `hidden` is unset, still count as visible.
export const toursQuery = groq`*[_type == "tour" && hidden != true] | order(order asc) {
  "slug": slug.current, title, tagline, category, duration, lengthDays, cities,
  destinations, ${ratingFields}, badge, image, imageTone, description,
  highlights, included, excluded, itinerary, ${priceFields}
}`;

export const tourBySlugQuery = groq`*[_type == "tour" && slug.current == $slug && hidden != true][0] {
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
  image, imageTone, gallery, description, included
}`;

export const photoshootsQuery = groq`*[_type == "photoshoot"] | order(order asc) {
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  locations, image, imageTone, description, goodFor, included, addOns, delivery
}`;

export const photoshootBySlugQuery = groq`*[_type == "photoshoot" && slug.current == $slug][0] {
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  locations, image, imageTone, gallery, description, goodFor, included, addOns, delivery
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

export const customizePageQuery = groq`*[_type == "customizePage"][0] {
  eyebrow, headline, subtext, bannerImage,
  steps[]{title, body},
  formIntroEyebrow, formIntroTitle, formIntroDescription,
  formSections[]{title, fields[]{label, fieldKey, fieldType, required, placeholder, options, width}}
}`;

export const aboutPageQuery = groq`*[_type == "aboutPage"][0] {
  heroEyebrow, heroHeadline, heroImage,
  storyEyebrow, storyTitle,
  whatWeDoEyebrow, whatWeDoTitle, whatWeDoDescription,
  teamEyebrow, teamTitle, teamDescription, teamMembers
}`;

export const contactPageQuery = groq`*[_type == "contactPage"][0] {
  heroEyebrow, heroHeadline, heroImage,
  whatsappCardDescription, emailCardDescription, urgentCardDescription,
  policiesEyebrow, policiesTitle
}`;

// Signature Experiences — a distinct, emotionally-led product category from
// the tour catalog. Public queries only ever return "published" or
// "comingSoon" documents; "draft" and "archived" stay Studio-only.
const signatureExperienceFields = groq`
  status, order, "slug": slug.current, name, forWhom, emotionalHeadline,
  shortDescription, heroImage, heroImageTone, gallery, duration, groupSize,
  luxuryLevel, location, ${priceFields},
  whoIsThisForTitle, whoIsThisForBody, whyWeCreatedThisTitle, whyWeCreatedThisBody,
  experienceIntro, experienceHighlights[]{title, description, image},
  itineraryDays[]{
    dayNumber, title, description, image,
    items[]{time, title, duration, description, location, image, category, includedOrOptional, notes}
  },
  careTitle, careIntro, careItems,
  hosts[]->{"slug": slug.current, name, role, photo, bio, languages, experience, personality},
  faqs[]{question, answer},
  testimonials[]->{name, quote, context},
  seoTitle, seoDescription
`;

export const signatureExperiencesQuery = groq`*[_type == "signatureExperience" && status in ["published", "comingSoon"]] | order(order asc) {
  ${signatureExperienceFields}
}`;

export const signatureExperienceBySlugQuery = groq`*[_type == "signatureExperience" && slug.current == $slug && status in ["published", "comingSoon"]][0] {
  ${signatureExperienceFields}
}`;

export const allSignatureExperienceSlugsQuery = groq`*[_type == "signatureExperience" && status in ["published", "comingSoon"]].slug.current`;
