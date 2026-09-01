// Shared content types for tours, experiences, and photoshoots.
import type { Image as SanityImageRef, PortableTextBlock } from "sanity";

export type ImageTone = "giza" | "nile" | "desert" | "luxor" | "jordan" | "redsea";

// A photo source: either a real Sanity-uploaded image, or a plain URL to a
// licensed photo (e.g. a curated Pexels photo) used until a real upload
// replaces it. urlForImage() in sanity/image.ts understands both.
export type SanityImage = SanityImageRef | string;

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
  destinations?: string[];
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
  destinations?: string[];
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
  };
  socials?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    pinterest?: string;
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
  // Editable, but changing an `href` here without matching a real page path
  // breaks that nav link — see the Studio field description.
  nav?: { label?: string; href?: string }[];
  trustBadges?: { icon?: "shield" | "coin" | "chat"; title?: string; body?: string }[];
  destinations?: { name?: string; days?: number; tone?: ImageTone; tourSlug?: string }[];
  interests?: {
    label?: string;
    kind?: "tour" | "experience" | "photoshoot" | "inquiry";
    slug?: string;
  }[];
  footer?: {
    exploreLabel?: string;
    contactLabel?: string;
    followLabel?: string;
    whatsappPrefix?: string;
    location?: string;
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

export type Destination = {
  name: string;
  days: number;
  tone: ImageTone;
  tourSlug: string;
};

// A richer, standalone destination profile powering the "Explore Egypt" map —
// distinct from the lightweight `Destination` above (which only feeds the
// homepage panel + Customize form chips). Tours/Experiences/Photoshoots/
// Stories are matched to a hub by comparing their own `destinations`/`
// locations` string tags against `matchNames` (case-sensitive), so the
// relationship is driven entirely by those existing tag fields — no new
// reference field to keep in sync.
// The fixed set of "what kind of trip are you in the mood for" tags used to
// filter the Explore Egypt map — shared between DestinationHub.mood and
// EgyptCity.mood so both full destinations and not-yet-offered cities can be
// highlighted by the same mood buttons.
export type Mood = "history" | "beaches" | "desert" | "diving" | "nile" | "coast";

export type DestinationHub = {
  slug: string;
  name: string;
  region?: string;
  tagline: string;
  intro: string;
  matchNames: string[];
  mapX: number; // 0-100, position on the stylized map (left %)
  mapY: number; // 0-100, position on the stylized map (top %)
  mood?: Mood[];
  image?: SanityImage;
  imageTone: ImageTone;
  order: number;
};

// A real Egyptian city shown on the Explore Egypt map that Egypt Eye doesn't
// (yet) run tours in — no dedicated page, just a marker with a "not yet
// offered" note so the map reads as a complete, honest map of the country
// rather than only the places currently for sale.
export type EgyptCity = {
  slug: string;
  name: string;
  region: string;
  mapX: number;
  mapY: number;
  mood: Mood[];
};

export type Interest = {
  label: string;
  kind: "tour" | "experience" | "photoshoot" | "inquiry";
  slug?: string;
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
  };
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube?: string;
    pinterest?: string;
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
  trustBadges: readonly { icon: "shield" | "coin" | "chat"; title: string; body: string }[];
  destinations: readonly Destination[];
  interests: readonly Interest[];
  footer: {
    exploreLabel: string;
    contactLabel: string;
    followLabel: string;
    whatsappPrefix: string;
    location: string;
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
};

export type ContactPage = {
  heroEyebrow?: string;
  heroHeadline?: string;
  heroImage?: { image?: SanityImage; tone?: ImageTone };
  whatsappCardDescription?: string;
  emailCardDescription?: string;
  policiesEyebrow?: string;
  policiesTitle?: string;
};

export type ResolvedContactPage = {
  heroEyebrow: string;
  heroHeadline: string;
  heroImage: { image?: SanityImage; tone: ImageTone };
  whatsappCardDescription: string;
  emailCardDescription: string;
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

// Singleton — every static marketing block on the homepage that isn't
// already covered by Site Settings (hero slides, trust stats) or a live
// content query (Best Seller Tours' cards, Reviews' testimonials, FAQ items,
// Stories' cards). Each block mirrors one homepage section 1:1.
export type Homepage = {
  popularTours?: { eyebrow?: string; title?: string; description?: string; primaryButtonLabel?: string; secondaryButtonLabel?: string };
  destinationsSection?: { eyebrow?: string; title?: string; description?: string };
  flyingDress?: { badge?: string; title?: string; body?: string; buttonLabel?: string };
  redSea?: { badge?: string; title?: string; body?: string; buttonLabel?: string };
  ninePyramids?: { eyebrow?: string; title?: string; description?: string; buttonLabel?: string };
  photoshootsSection?: { eyebrow?: string; title?: string; description?: string };
  customCta?: { eyebrow?: string; title?: string; description?: string; buttonLabel?: string };
  reviewsSection?: { eyebrow?: string; title?: string };
  faqSection?: { eyebrow?: string; title?: string };
  storiesSection?: { eyebrow?: string; title?: string; linkLabel?: string };
  finalCta?: { title?: string; body?: string; buttonLabel?: string };
};

export type ResolvedHomepage = {
  popularTours: { eyebrow: string; title: string; description: string; primaryButtonLabel: string; secondaryButtonLabel: string };
  destinationsSection: { eyebrow: string; title: string; description: string };
  flyingDress: { badge: string; title: string; body: string; buttonLabel: string };
  redSea: { badge: string; title: string; body: string; buttonLabel: string };
  ninePyramids: { eyebrow: string; title: string; description: string; buttonLabel: string };
  photoshootsSection: { eyebrow: string; title: string; description: string };
  customCta: { eyebrow: string; title: string; description: string; buttonLabel: string };
  reviewsSection: { eyebrow: string; title: string };
  faqSection: { eyebrow: string; title: string };
  storiesSection: { eyebrow: string; title: string; linkLabel: string };
  finalCta: { title: string; body: string; buttonLabel: string };
};

// Singleton — hero + intro copy for the 5 catalog listing pages
// (/tours, /experiences, /photoshoots, /signature-experiences, /stories),
// none of which had a CMS-backed source before. `tours.sectionTitleTemplate`
// keeps the live tour count dynamic via a literal "{count}" placeholder
// the page replaces at render time, rather than freezing a stale number.
export type ListingPages = {
  tours?: {
    heroEyebrow?: string;
    heroTitle?: string;
    sectionTitleTemplate?: string;
    sectionDescription?: string;
    faqs?: { question: string; answer: string }[];
  };
  experiences?: { heroEyebrow?: string; heroTitle?: string; sectionTitle?: string; sectionDescription?: string };
  photoshoots?: { heroEyebrow?: string; heroTitle?: string; sectionTitle?: string; sectionDescription?: string };
  signatureExperiences?: {
    heroEyebrow?: string;
    heroTitle?: string;
    heroDescription?: string;
    collectionEyebrow?: string;
    collectionTitleSingular?: string;
    collectionTitlePlural?: string;
    collectionDescription?: string;
  };
  exploreEgypt?: { heroEyebrow?: string; heroTitle?: string; heroDescription?: string };
  stories?: {
    heroEyebrow?: string;
    heroTitle?: string;
    heroDescription?: string;
    emptyStateText?: string;
    moreStoriesEyebrow?: string;
    moreStoriesTitle?: string;
    readStoryLabel?: string;
  };
};

export type ResolvedListingPages = {
  tours: {
    heroEyebrow: string;
    heroTitle: string;
    sectionTitleTemplate: string;
    sectionDescription: string;
    faqs: readonly { question: string; answer: string }[];
  };
  experiences: { heroEyebrow: string; heroTitle: string; sectionTitle: string; sectionDescription: string };
  photoshoots: { heroEyebrow: string; heroTitle: string; sectionTitle: string; sectionDescription: string };
  signatureExperiences: {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    collectionEyebrow: string;
    collectionTitleSingular: string;
    collectionTitlePlural: string;
    collectionDescription: string;
  };
  exploreEgypt: { heroEyebrow: string; heroTitle: string; heroDescription: string };
  stories: {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    emptyStateText: string;
    moreStoriesEyebrow: string;
    moreStoriesTitle: string;
    readStoryLabel: string;
  };
};

// Transfers — private airport/hotel/intercity car transfers within Cairo &
// Giza, plus hourly/daily private-driver hire. This is local-only config
// (not wired through Sanity/queries.ts/fetchers.ts like the catalog types
// above): it's a pricing matrix a developer maintains, not editorial copy
// a marketer edits, so src/content/transfers.ts is the single source of
// truth. Pricing logic that reads this data lives in src/lib/transferPricing.ts.

export type TransferVehicleId = "sedan" | "suv" | "van" | "minibus" | "vip";

export type TransferVehicle = {
  id: TransferVehicleId;
  name: string;
  tagline: string;
  passengers: number; // max seated passengers
  luggage: number; // max standard suitcases
};

export type TransferCategory = "airport" | "hotel" | "intercity" | "private-driver" | "custom";

export type TransferCategoryInfo = {
  id: TransferCategory;
  label: string;
  description: string;
};

// A selectable pickup/destination point. "Intercity" zones (Alexandria,
// Ain Sokhna, Fayoum) get their own per-destination pricing table since
// distance varies a lot between them; "Cairo & Giza" zones share the two
// flat tiers below (airport / hotel) since they're all a short drive
// apart. `isCustom` marks the "Other — I'll specify" option, which always
// routes to a quote request regardless of category.
export type TransferZone = {
  id: string;
  label: string;
  group: "Cairo & Giza" | "Intercity";
  isCustom?: boolean;
};

export type TransferTierPricing = Partial<Record<TransferVehicleId, number>>;

export type TransferIntercityPricing = {
  zoneId: string;
  prices: Partial<Record<TransferVehicleId, number>>;
};

export type TransferPrivateDriverRate = {
  vehicle: TransferVehicleId;
  hourly: number;
  daily: number; // a standard 8-10 hour day
};

export type TransfersPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  categories: readonly TransferCategoryInfo[];
  vehicles: readonly TransferVehicle[];
  zones: readonly TransferZone[];
  tierPricing: { airport: TransferTierPricing; hotel: TransferTierPricing };
  intercityPricing: readonly TransferIntercityPricing[];
  privateDriverRates: readonly TransferPrivateDriverRate[];
  included: readonly string[];
  faqs: readonly Faq[];
};
