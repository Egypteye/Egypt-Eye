// Shared content types for tours, experiences, and photoshoots.
import type { Image as SanityImage, PortableTextBlock } from "sanity";

export type ImageTone = "giza" | "nile" | "desert" | "luxor" | "jordan" | "redsea";

export type Rating = {
  score: number;
  count: number;
} | null;

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
};

export type Price = {
  amount: number | null; // null = "Contact for pricing"
  originalAmount?: number;
  currency?: "USD";
  note?: string;
};

// Shared optional SEO override group — see src/sanity/schemaTypes/objects.ts's
// seoFields(). Frontend metadata generation falls back to the page's own
// title/description/photo when these are left blank.
export type PageSeo = {
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: SanityImage;
  noindex?: boolean;
};

export type Tour = {
  slug: string;
  title: string;
  tagline: string;
  category: "one-day" | "multi-day" | "jordan";
  duration: string;
  lengthDays: number; // approximate numeric length, used for duration filtering
  cities: number;
  destinations: string[];
  travelStyle?: string[];
  featured?: boolean;
  rating: Rating;
  badge?: string;
  imageLabel?: string;
  image?: SanityImage;
  imageTone: ImageTone;
  description: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary?: ItineraryDay[];
  relatedExperiences?: Experience[];
  price: Price;
  seo?: PageSeo;
};

export type Experience = {
  slug: string;
  title: string;
  duration: string;
  rating: Rating;
  price: Price;
  imageLabel?: string;
  image?: SanityImage;
  imageTone: ImageTone;
  gallery?: SanityImage[];
  description: string;
  included: string[];
  relatedTours?: Tour[];
  seo?: PageSeo;
};

export type Photoshoot = {
  slug: string;
  title: string;
  duration: string;
  rating: Rating;
  price: Price;
  locations: string[];
  imageLabel?: string;
  image?: SanityImage;
  imageTone: ImageTone;
  gallery?: SanityImage[];
  description: string;
  goodFor: string[];
  included: string[];
  addOns?: string[];
  delivery: string[];
  seo?: PageSeo;
};

export type Testimonial = {
  name: string;
  quote: string;
  context?: string;
};

export type Author = {
  slug: string;
  name: string;
  role?: string;
  photo?: SanityImage;
  bio?: string;
};

// A reusable countdown target — not eclipse-specific. `targetDateTime` is
// stored as an ISO string with its own UTC offset baked in (e.g.
// "2027-08-02T13:02:14+03:00"), so the countdown is correct for every
// visitor regardless of their own timezone.
export type EventCountdown = {
  slug?: string;
  name: string;
  targetDateTime: string;
  timezoneLabel?: string;
  locationName?: string;
  displayTitle?: string;
  supportingText?: string;
  backgroundImage?: SanityImage;
  backgroundTone: ImageTone;
  dayOfMessage?: string;
  endedMessage?: string;
  active: boolean;
};

export type StoryStatus = "draft" | "published" | "archived";

// Story body content blocks — a small set of reusable, non-eclipse-specific
// block types on top of standard Portable Text (paragraphs/headings/lists
// via `block`, and captioned photos via `image`), so future articles can be
// assembled visually in the Studio without code changes.
export type StoryQuoteBlock = {
  _type: "quoteBlock";
  _key: string;
  quote: string;
  attribution?: string;
};
export type StoryCalloutBlock = {
  _type: "calloutBlock";
  _key: string;
  title?: string;
  body: string;
  tone?: "Info" | "Safety" | "Highlight";
};
export type StoryGalleryBlock = {
  _type: "galleryBlock";
  _key: string;
  images?: SanityImage[];
};
export type StoryVideoEmbedBlock = {
  _type: "videoEmbedBlock";
  _key: string;
  url: string;
  caption?: string;
};
export type StoryCountdownBlock = {
  _type: "countdownBlock";
  _key: string;
  event?: EventCountdown;
};
export type StoryExperienceCardBlock = {
  _type: "experienceCardBlock";
  _key: string;
  eyebrow?: string;
  experience?: SignatureExperience;
};
export type StoryCtaBlock = {
  _type: "ctaBlock";
  _key: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
};
export type StoryFaqItem = {
  question: string;
  answer: string;
};
export type StoryFaqBlock = {
  _type: "faqBlock";
  _key: string;
  title?: string;
  faqs: StoryFaqItem[];
};

export type StoryBodyBlock =
  | PortableTextBlock
  | StoryQuoteBlock
  | StoryCalloutBlock
  | StoryGalleryBlock
  | StoryVideoEmbedBlock
  | StoryCountdownBlock
  | StoryExperienceCardBlock
  | StoryCtaBlock
  | StoryFaqBlock;

// Lightweight shape used for "related story" teasers — everything a
// StoryCard needs, without requiring the full Story (status, body, etc.).
export type StoryCardData = {
  slug: string;
  title: string;
  excerpt: string;
  image?: SanityImage;
  imageTone: ImageTone;
  category?: string;
};

export type Story = {
  status: StoryStatus;
  featured: boolean;
  slug: string;
  title: string;
  category?: string;
  tags?: string[];
  author?: Author;
  excerpt: string;
  imageLabel?: string;
  image?: SanityImage;
  imageTone: ImageTone;
  body?: StoryBodyBlock[];
  relatedExperience?: SignatureExperience;
  relatedTours?: Tour[];
  relatedStories?: StoryCardData[];
  destinations?: string[];
  badge?: "none" | "editorsPick" | "mostHelpful" | "popular";
  publishedAt?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  contentReviewDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImage;
  canonicalUrl?: string;
  noindex?: boolean;
};

export type Faq = {
  question: string;
  answer: string;
};

export type SiteSettings = {
  name?: string;
  shortName?: string;
  tagline?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  description?: string;
  positioning?: string;
  contact?: {
    email?: string;
    whatsapp?: string;
    whatsappLink?: string;
    urgentBooking?: string;
  };
  socials?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  heroImages?: {
    image?: SanityImage;
    tone?: ImageTone;
    headline?: string;
    subtext?: string;
    linkLabel?: string;
    linkHref?: string;
  }[];
  flyingDressImage?: { image?: SanityImage; tone?: ImageTone };
  redSeaImage?: { image?: SanityImage; tone?: ImageTone };
  ninePyramidsImage?: { image?: SanityImage; tone?: ImageTone };
  customizeImage?: { image?: SanityImage; tone?: ImageTone };
  destinationPhotos?: { name?: string; image?: SanityImage }[];
  pillars?: { title: string; description: string }[];
  // Optional, real-numbers-only stats for the homepage trust bar. A field
  // left unset hides that tile rather than showing a placeholder — never
  // fabricate a value here.
  trustStats?: {
    yearsInEgypt?: number;
    happyGuestsLabel?: string;
    reviewPlatformName?: string;
    reviewPlatformRating?: number;
    reviewPlatformReviewCount?: number;
    reviewPlatformUrl?: string;
  };
  policies?: {
    deposit?: string;
    currency?: string;
    children?: { age: string; price: string }[];
    childrenNote?: string;
    voucher?: string;
    cancellation?: string;
  };
};

// Fully-resolved site settings (local fallback merged with any Sanity
// overrides) — widened to plain string/array types since the local
// fallback's `as const` literal types are too narrow once Sanity content
// (arbitrary strings) is merged in.
export type ResolvedSiteSettings = {
  name: string;
  shortName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  description: string;
  positioning: string;
  contact: {
    email: string;
    whatsapp: string;
    whatsappLink: string;
    urgentBooking: string;
  };
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  nav: readonly { label: string; href: string }[];
  heroImages: readonly {
    image?: SanityImage;
    tone: ImageTone;
    headline?: string;
    subtext?: string;
    linkLabel?: string;
    linkHref?: string;
  }[];
  flyingDressImage: { image?: SanityImage; tone: ImageTone };
  redSeaImage: { image?: SanityImage; tone: ImageTone };
  ninePyramidsImage: { image?: SanityImage; tone: ImageTone };
  customizeImage: { image?: SanityImage; tone: ImageTone };
  destinationPhotos: readonly { name?: string; image?: SanityImage }[];
  policies: {
    deposit: string;
    currency: string;
    children: readonly { age: string; price: string }[];
    childrenNote: string;
    voucher: string;
    cancellation: string;
  };
  pillars: readonly { title: string; description: string }[];
  trustStats?: {
    yearsInEgypt?: number;
    happyGuestsLabel?: string;
    reviewPlatformName?: string;
    reviewPlatformRating?: number;
    reviewPlatformReviewCount?: number;
    reviewPlatformUrl?: string;
  };
};

export type CustomizeFormFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "chips"
  | "chips-destinations"
  | "chips-interests";

export type CustomizeFormField = {
  label: string;
  fieldKey: string;
  fieldType: CustomizeFormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  width?: "full" | "half";
};

export type CustomizeFormSection = {
  title: string;
  fields: CustomizeFormField[];
};

export type CustomizeStep = { title: string; body: string };

// Sanity-fetched shape — everything optional, since the singleton may be
// only partially filled in (or not exist yet).
export type CustomizePage = {
  eyebrow?: string;
  headline?: string;
  subtext?: string;
  bannerImage?: { image?: SanityImage; tone?: ImageTone };
  steps?: CustomizeStep[];
  formIntroEyebrow?: string;
  formIntroTitle?: string;
  formIntroDescription?: string;
  formSections?: CustomizeFormSection[];
};

// Fully-resolved (local fallback merged with any Sanity overrides).
export type ResolvedCustomizePage = {
  eyebrow: string;
  headline: string;
  subtext: string;
  bannerImage: { image?: SanityImage; tone: ImageTone };
  steps: readonly CustomizeStep[];
  formIntroEyebrow: string;
  formIntroTitle: string;
  formIntroDescription: string;
  formSections: readonly CustomizeFormSection[];
};

export type AboutPage = {
  heroEyebrow?: string;
  heroHeadline?: string;
  heroImage?: { image?: SanityImage; tone?: ImageTone };
  storyEyebrow?: string;
  storyTitle?: string;
  whatWeDoEyebrow?: string;
  whatWeDoTitle?: string;
  whatWeDoDescription?: string;
  teamEyebrow?: string;
  teamTitle?: string;
  teamDescription?: string;
  teamMembers?: string[];
};

export type ResolvedAboutPage = {
  heroEyebrow: string;
  heroHeadline: string;
  heroImage: { image?: SanityImage; tone: ImageTone };
  storyEyebrow: string;
  storyTitle: string;
  whatWeDoEyebrow: string;
  whatWeDoTitle: string;
  whatWeDoDescription: string;
  teamEyebrow: string;
  teamTitle: string;
  teamDescription: string;
  teamMembers: readonly string[];
};

export type ContactPage = {
  heroEyebrow?: string;
  heroHeadline?: string;
  heroImage?: { image?: SanityImage; tone?: ImageTone };
  whatsappCardDescription?: string;
  emailCardDescription?: string;
  urgentCardDescription?: string;
  policiesEyebrow?: string;
  policiesTitle?: string;
};

export type ResolvedContactPage = {
  heroEyebrow: string;
  heroHeadline: string;
  heroImage: { image?: SanityImage; tone: ImageTone };
  whatsappCardDescription: string;
  emailCardDescription: string;
  urgentCardDescription: string;
  policiesEyebrow: string;
  policiesTitle: string;
};

// ---------------------------------------------------------------------------
// Signature Experiences — a curated, emotionally-led product category
// distinct from the tour catalog. See src/sanity/schemaTypes/signatureExperience.ts.

export type Host = {
  slug: string;
  name: string;
  role: string;
  photo?: SanityImage;
  bio: string;
  languages?: string[];
  experience?: string;
  personality?: string;
};

export type SignatureItineraryItem = {
  time: string;
  title: string;
  duration?: string;
  description: string;
  location?: string;
  image?: SanityImage;
  category?: string;
  includedOrOptional?: "included" | "optional";
  notes?: string;
};

export type SignatureItineraryDay = {
  dayNumber: number;
  title: string;
  description?: string;
  image?: SanityImage;
  items: SignatureItineraryItem[];
};

export type ExperienceHighlight = {
  title: string;
  description: string;
  image?: SanityImage;
};

export type ExperienceFaq = {
  question: string;
  answer: string;
};

export type ExperienceStatus = "draft" | "comingSoon" | "published" | "archived";

export type SignatureExperience = {
  status: ExperienceStatus;
  order: number;
  slug: string;
  name: string;
  forWhom: string;
  emotionalHeadline: string;
  shortDescription: string;
  heroImage?: SanityImage;
  heroImageTone: ImageTone;
  gallery?: SanityImage[];
  duration: string;
  groupSize: string;
  luxuryLevel?: string;
  location?: string;
  price: Price;
  whoIsThisForTitle: string;
  whoIsThisForBody: string;
  whyWeCreatedThisTitle: string;
  whyWeCreatedThisBody: string;
  experienceIntro?: string;
  experienceHighlights: ExperienceHighlight[];
  itineraryDays: SignatureItineraryDay[];
  careTitle: string;
  careIntro?: string;
  careItems: string[];
  hosts?: Host[];
  faqs?: ExperienceFaq[];
  testimonials?: Testimonial[];
  relatedStory?: StoryCardData;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: SanityImage;
  noindex?: boolean;
};
