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

export type Tour = {
  slug: string;
  title: string;
  tagline: string;
  category: "one-day" | "multi-day" | "jordan";
  duration: string;
  lengthDays: number; // approximate numeric length, used for duration filtering
  cities: number;
  destinations: string[];
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
  price: Price;
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
};

export type Testimonial = {
  name: string;
  quote: string;
  context?: string;
};

export type Story = {
  slug: string;
  title: string;
  excerpt: string;
  imageLabel?: string;
  image?: SanityImage;
  imageTone: ImageTone;
  body?: PortableTextBlock[];
  publishedAt?: string;
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
  heroImages?: { image?: SanityImage; tone?: ImageTone; label?: string }[];
  flyingDressImage?: { image?: SanityImage; tone?: ImageTone };
  redSeaImage?: { image?: SanityImage; tone?: ImageTone };
  ninePyramidsImage?: { image?: SanityImage; tone?: ImageTone };
  customizeImage?: { image?: SanityImage; tone?: ImageTone };
  destinationPhotos?: { name?: string; image?: SanityImage }[];
  pillars?: { title: string; description: string }[];
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
  heroImages: readonly { image?: SanityImage; tone: ImageTone; label?: string }[];
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
  seoTitle?: string;
  seoDescription?: string;
};
