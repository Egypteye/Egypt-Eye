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
