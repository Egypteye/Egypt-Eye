import groq from "groq";

// Shared GROQ fragments/queries. Field selection lists explicitly, rather
// than `...`, so adding a Studio-only field never accidentally changes the
// site's data shape.

// A product's own `rating` is an optional manual override, set in Studio; a
// product without one falls back to the site-wide figure (see
// sanity/fetchers.ts). Every list that renders a product card selects it, so
// an override applies everywhere that product appears, not just on its page.
const ratingFields = groq`rating{score, count}`;
const priceFields = groq`price{amount, originalAmount, note}`;

// Lightweight tour card used wherever an Experience or Story links to a Tour.
const relatedTourFields = groq`
  "slug": slug.current, title, tagline, category, duration, lengthDays, cities,
  destinations, ${ratingFields}, badge, image, imageTone, ${priceFields}, physicalLevel
`;

// Lightweight Extra Experience card used wherever a Tour links to one.
const relatedExtraExperienceFields = groq`
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  image, imageTone, description, included, physicalLevel, bookable, depositUsd, paypalLink
`;

// hidden != true (rather than hidden == false) so tours from before the
// field existed, where `hidden` is unset, still count as visible.
export const toursQuery = groq`*[_type == "tour" && hidden != true] | order(order asc) {
  "slug": slug.current, title, tagline, category, duration, lengthDays, cities,
  destinations, travelStyle, featured, ${ratingFields}, badge, image, imageTone, description,
  highlights, included, excluded, itinerary, ${priceFields}, physicalLevel,
  titleTranslations, taglineTranslations, descriptionTranslations
}`;

// Shared by the single-slug and batched (`in $slugs`) variants below, so the
// two can never drift into returning different shapes for the same document.
const tourDetailFields = groq`
  "slug": slug.current, title, tagline, category, duration, lengthDays, cities,
  destinations, travelStyle, featured, ${ratingFields}, badge, image, imageTone, description,
  highlights, included, excluded, itinerary, physicalLevel, mapStops,
  faqs[]{question, answer},
  relatedExperiences[]->{${relatedExtraExperienceFields}},
  ${priceFields}, seo
`;

export const tourBySlugQuery = groq`*[_type == "tour" && slug.current == $slug && hidden != true][0] {
  ${tourDetailFields}
}`;

// Batched lookup for the My Journey shortlist — one request for every saved
// tour instead of one request per tour. Callers re-order the result to match
// the slugs they asked for; GROQ makes no ordering promise here.
export const toursBySlugsQuery = groq`*[_type == "tour" && slug.current in $slugs && hidden != true] {
  ${tourDetailFields}
}`;

export const experiencesQuery = groq`*[_type == "experience"] | order(order asc) {
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  image, imageTone, description, location, included, destinations, physicalLevel,
  bookable, depositUsd, paypalLink
}`;

const experienceDetailFields = groq`
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  image, imageTone, gallery, description, location,
  steps[]{title, description}, included, goodToKnow, destinations,
  physicalLevel, mapStops, bookable, depositUsd, paypalLink,
  relatedTours[]->{${relatedTourFields}},
  seo
`;

export const experienceBySlugQuery = groq`*[_type == "experience" && slug.current == $slug][0] {
  ${experienceDetailFields}
}`;

export const experiencesBySlugsQuery = groq`*[_type == "experience" && slug.current in $slugs] {
  ${experienceDetailFields}
}`;

export const photoshootsQuery = groq`*[_type == "photoshoot"] | order(order asc) {
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  locations, image, imageTone, description, goodFor, included, addOns, delivery, destinations, bookable, depositUsd, paypalLink,
  faqs[]{question, answer}
}`;

const photoshootDetailFields = groq`
  "slug": slug.current, title, duration, ${ratingFields}, ${priceFields},
  locations, image, imageTone, gallery, description, goodFor, included, addOns, delivery, destinations, bookable, depositUsd, paypalLink, seo,
  faqs[]{question, answer}
`;

export const photoshootBySlugQuery = groq`*[_type == "photoshoot" && slug.current == $slug][0] {
  ${photoshootDetailFields}
}`;

export const photoshootsBySlugsQuery = groq`*[_type == "photoshoot" && slug.current in $slugs] {
  ${photoshootDetailFields}
}`;

export const destinationHubsQuery = groq`*[_type == "destinationHub"] | order(order asc) {
  "slug": slug.current, name, region, tagline, intro, matchNames, mapX, mapY, mood, image, imageTone, order
}`;

const destinationHubFields = groq`
  "slug": slug.current, name, region, tagline, intro, matchNames, mapX, mapY, mood, image, imageTone, order
`;

export const destinationHubBySlugQuery = groq`*[_type == "destinationHub" && slug.current == $slug][0] {
  ${destinationHubFields}
}`;

export const destinationHubsBySlugsQuery = groq`*[_type == "destinationHub" && slug.current in $slugs] {
  ${destinationHubFields}
}`;

const testimonialFields = groq`
  name, quote, title, context, score, featured, themes, photos,
  "subjectSlug": subject->slug.current,
  source{platform, url, reviewedAt}
`;

export const testimonialsCountQuery = groq`count(*[_type == "testimonial"])`;

/**
 * One slice of the review pool, fetched a page at a time — see
 * getTestimonialsInner in sanity/fetchers.ts for why it is sliced at all.
 *
 * The bounds are interpolated rather than passed as `$params` on purpose:
 * they are integers this file's own caller computes, and a literal slice is
 * the form GROQ has always accepted. A dynamic review count is not worth
 * betting the whole reviews section on a parameterised slice behaving.
 *
 * `order(order asc, _id asc)` matters more than it looks. Reviews imported in
 * a batch can share an `order`, and without a unique tie-break the sequence
 * within a tie is undefined — so two slices of one pool could return the same
 * review twice and miss another entirely. `_id` makes the ordering total,
 * which is what lets the slices partition the pool exactly.
 */
export const testimonialsPageQuery = (from: number, to: number) =>
  groq`*[_type == "testimonial"] | order(order asc, _id asc) [${Math.trunc(from)}...${Math.trunc(to)}] {
  ${testimonialFields}
}`;

// Lightweight experience summary used wherever a Story links to a
// Signature Experience — a card teaser, not the full detail-page payload.
const relatedExperienceFields = groq`
  "slug": slug.current, name, forWhom, emotionalHeadline, shortDescription,
  heroImage, heroImageTone, duration, groupSize, luxuryLevel, status, ${priceFields}
`;

const storyCardFields = groq`
  status, featured, "slug": slug.current, title, category, tags, excerpt,
  image, imageTone, publishedAt,
  author->{"slug": slug.current, name, role, photo, bio}
`;

// hidden published only for the public list/detail — "draft" and "archived"
// stay Studio-only.
export const storiesQuery = groq`*[_type == "story" && status == "published"] | order(publishedAt desc) {
  ${storyCardFields}
}`;

export const storyBySlugQuery = groq`*[_type == "story" && slug.current == $slug && status == "published"][0] {
  ${storyCardFields},
  body[]{
    ...,
    _type == "countdownBlock" => { "event": event-> },
    _type == "experienceCardBlock" => { "experience": experience->{${relatedExperienceFields}} }
  },
  relatedExperience->{${relatedExperienceFields}},
  relatedTours[]->{${relatedTourFields}},
  relatedStories[]->{"slug": slug.current, title, excerpt, image, imageTone, category},
  destinations, badge,
  seoTitle, seoDescription, ogImage, canonicalUrl, noindex
}`;

export const faqsQuery = groq`*[_type == "faqItem"] | order(order asc) {
  question, answer
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0] {
  defaultDepositUsd,
  name, shortName, tagline, heroHeadline, heroSubheadline, description, positioning,
  contact, socials, pillars, policies, trustStats, reviewsOverride,
  heroImages[]{image, tone, headline, subtext, linkLabel, linkHref},
  flyingDressImage, redSeaImage, ninePyramidsImage, customizeImage,
  destinationPhotos[]{name, image},
  nav[]{label, href},
  trustBadges[]{icon, title, body},
  destinations[]{name, days, tone, tourSlug},
  interests[]{label, kind, slug},
  footer
}`;

export const homepageQuery = groq`*[_type == "homepage"][0] {
  popularTours, destinationsSection, flyingDress, redSea, ninePyramids,
  photoshootsSection, customCta, reviewsSection, faqSection, storiesSection, finalCta
}`;

export const listingPagesQuery = groq`*[_type == "listingPages"][0] {
  tours{heroEyebrow, heroTitle, sectionTitleTemplate, sectionDescription, faqs[]{question, answer}},
  experiences, photoshoots,
  signatureExperiences, exploreEgypt, stories
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
  whatWeDoEyebrow, whatWeDoTitle, whatWeDoDescription
}`;

export const contactPageQuery = groq`*[_type == "contactPage"][0] {
  heroEyebrow, heroHeadline, heroImage,
  whatsappCardDescription, emailCardDescription,
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
  relatedStory->{"slug": slug.current, title, excerpt, image, imageTone, category},
  seoTitle, seoDescription, canonicalUrl, ogImage, noindex
`;

export const signatureExperiencesQuery = groq`*[_type == "signatureExperience" && status in ["published", "comingSoon"]] | order(order asc) {
  ${signatureExperienceFields}
}`;

export const signatureExperienceBySlugQuery = groq`*[_type == "signatureExperience" && slug.current == $slug && status in ["published", "comingSoon"]][0] {
  ${signatureExperienceFields}
}`;

export const allSignatureExperienceSlugsQuery = groq`*[_type == "signatureExperience" && status in ["published", "comingSoon"]].slug.current`;

// ---------------------------------------------------------------------------
// Take Egypt Home. Hidden products are filtered in GROQ rather than in the
// page, so a hidden piece cannot leak through a surface that forgot to check.
// ---------------------------------------------------------------------------
const treasureImageFields = groq`image{..., "alt": alt, "caption": caption}`;

export const treasureCategoriesQuery = groq`*[_type == "treasureCategory" && active != false] | order(order asc) {
  "slug": slug.current, title, titleTranslations, eyebrow, heroHeadline, heroSub,
  active, order, ${treasureImageFields}, imageTone, cardHook, cardBlurb,
  story[]{title, body},
  beforeYouArrive[]{title, description},
  inEgypt{title, body, steps[]{title, description}},
  trust, faqs[]{question, answer}, seo
}`;

export const treasureProductsQuery = groq`*[_type == "treasureProduct" && status != "hidden"] | order(order asc) {
  "slug": slug.current, "category": category->slug.current, name, nameTranslations,
  blurb, blurbTranslations, description, placeholder, status, availability, featured, order,
  ${treasureImageFields}, imageTone, gallery[]{..., "alt": alt, "caption": caption},
  price{amount, originalAmount, note},
  variants[]{label, price{amount, originalAmount, note}, availability},
  options[]{label, price{amount, originalAmount, note}, note},
  specs[]{label, value}, tags, faqs[]{question, answer}, seo
}`;

export const takeEgyptHomePageQuery = groq`*[_type == "takeEgyptHomePage"][0] {
  heroEyebrow, heroTitle, heroSubtitle, heroImage{..., "alt": alt}, intro,
  categoriesTitle, categoriesEyebrow, journeysTitle,
  giftsTitle, giftsBody, giftsCtaLabel,
  "featuredProductSlugs": featuredProducts[]->slug.current,
  faqs[]{question, answer}, seo
}`;
