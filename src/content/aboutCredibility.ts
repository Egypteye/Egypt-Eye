// Real, sourced credibility material for the /about page.
//
// PROVENANCE — every entry below comes from one of exactly two places, and
// nothing here is illustrative, rounded up, or invented:
//
//   1. "deck" — Egypt Eye's own partner presentation
//      (Egypt_Eye_Travel_and_Tours_Presentation.pdf, 28 pages). Agency names,
//      trip months/years, VIP client names and roles, collaborators, hotel
//      partners, destinations and services are transcribed from its slides
//      verbatim. Where the deck gives no date or no destination for an entry,
//      the field is simply left out rather than guessed.
//
//   2. "client" — supplied directly by Egypt Eye. Only two entries are in
//      this category (Aubrey O'Day and Kenna Williams); both are flagged
//      inline. They do NOT appear in the deck, so if either is ever
//      questioned, this is the one file to check.
//
// The photographs referenced here are Egypt Eye's own trip photography,
// lifted from that same deck. Each is captioned with the group and date the
// deck assigns it — never re-labelled to suit a layout.
//
// If a fact changes, change it here. Nothing on the About page hardcodes a
// number: the "By the numbers" tiles are counted from these arrays at build
// time, so the page can never drift out of sync with the list it claims to
// be counting.

export type TripRecord = {
  /** Agency, travel group, or trip name exactly as the deck labels it. */
  group: string;
  /** Where the deck places the trip. Omitted when the deck doesn't say. */
  place?: string;
  /** Month + year exactly as the deck labels it. Omitted when undated. */
  when?: string;
  /** Photo from that trip, when the deck carries one. */
  photo?: string;
  /** Alt text describing the photo. */
  alt?: string;
  /**
   * The photo's own aspect ratio, as a CSS `aspect-ratio` value. These are
   * the deck's originals at their native crop — the mosaic lays them out in
   * columns and lets each one keep its shape rather than forcing every
   * traveler's photo into the same box.
   */
  ratio?: string;
};

// Travel agencies and travel groups Egypt Eye has hosted in Egypt & Jordan.
// One entry per group; where a group appears on several slides, the dated
// trip is kept and its extra appearances are noted in `also`.
export const agencyTrips: (TripRecord & { also?: string })[] = [
  {
    group: "The LA Adams Travel",
    place: "Luxor",
    when: "February 2022",
    photo: "/photos/about/la-adams-travel-luxor-columns.jpg",
    alt: "A traveler with The LA Adams Travel standing among the carved columns of a Luxor temple",
    ratio: "800 / 533",
  },
  {
    group: "Briana Trip",
    when: "May 2022",
    photo: "/photos/about/briana-trip-flying-dress.jpg",
    alt: "A flying-dress photoshoot in a blue gown against the Egyptian desert",
    ratio: "533 / 800",
  },
  {
    group: "Luv Travels",
    when: "January 2023",
  },
  {
    group: "Luxe Tribes",
    place: "Aswan",
    when: "January 2023",
    also: "February 2023",
    photo: "/photos/about/luxe-tribes-aswan.jpg",
    alt: "Two travelers with Luxe Tribes by the water in Aswan",
    ratio: "480 / 720",
  },
  {
    group: "Black Women Travel",
    when: "May 2023",
    also: "June 2023",
  },
  {
    group: "Tin Trips Travel",
    place: "Siwa",
    when: "July 2023",
    photo: "/photos/about/tin-trips-travel-siwa.jpg",
    alt: "A traveler floating in a turquoise salt pool in Siwa",
    ratio: "480 / 720",
  },
  {
    group: "Cherry Travel",
    when: "July 2023",
    photo: "/photos/about/cherry-travel-flying-dress.jpg",
    alt: "A flying-dress photoshoot in a white gown on a desert dune",
    ratio: "800 / 533",
  },
  {
    group: "Wandee Travel",
    place: "Fayoum",
    when: "October 2023",
    photo: "/photos/about/wandee-travel-fayoum.jpg",
    alt: "A traveler with Wandee Travel seated in a sunlit ochre archway in Fayoum",
    ratio: "427 / 640",
  },
  {
    group: "Jet Black Travel",
    when: "October 2023",
    photo: "/photos/about/jet-black-travel-cairo-night.jpg",
    alt: "A traveler with Jet Black Travel photographed at night against Cairo's city lights",
    ratio: "533 / 800",
  },
  {
    group: "Michelle Trip",
    when: "October 2023",
  },
  {
    group: "Alison Blogger",
    when: "October 2023",
  },
  {
    group: "Hubert Travels",
    place: "Alexandria",
    when: "November 2023",
    photo: "/photos/about/hubert-travels-alexandria.jpg",
    alt: "Three travelers with Hubert Travels on the Alexandria seafront",
    ratio: "480 / 640",
  },
  {
    group: "Distinctions Travel",
    place: "Giza",
    photo: "/photos/about/distinctions-travel-giza-horseback.jpg",
    alt: "A traveler with Distinctions Travel on horseback in front of the Giza pyramids",
    ratio: "576 / 720",
  },
  {
    group: "Larea Travel",
    place: "Cairo",
    photo: "/photos/about/larea-travel-cairo-bazaar.jpg",
    alt: "A traveler with Larea Travel among the lanterns of a Cairo bazaar",
    ratio: "533 / 800",
  },
  {
    group: "Liz Desiree Travel",
    place: "Cairo",
    photo: "/photos/about/liz-desiree-travel-nile.jpg",
    alt: "A group traveling with Liz Desiree Travel photographed together beside the Nile in Cairo",
    ratio: "800 / 533",
  },
  {
    group: "Kelly Travel",
    place: "Red Sea",
    photo: "/photos/about/kelly-travel-red-sea.jpg",
    alt: "Two travelers with Kelly Travel on a boat deck on the Red Sea",
    ratio: "480 / 640",
  },
  {
    group: "Stella Travels",
  },
];

// A separate hero shot of a full Luxe Tribes group at Giza — used in the
// page hero rather than the trip index, so it isn't double-counted.
export const groupHeroPhoto = {
  photo: "/photos/about/luxe-tribes-giza-group.jpg",
  alt: "A large group traveling with Luxe Tribes photographed together in front of the pyramids at Giza",
  caption: "Luxe Tribes · Giza",
};

// SOURCE: client, not the deck. Egypt Eye handled this trip and asked for it
// on the page; there is no photograph cleared for publication, so the block
// that renders it is typographic by design.
export const headlineVipGuest = {
  name: "Aubrey O'Day",
  role: "Recording artist & television personality",
  fact: "Egypt Eye planned and ran Aubrey O'Day's tour of Egypt end to end — itinerary, access, transport, and the team on the ground.",
};

// SOURCE: client, not the deck.
export const headlineAgencyPartner = {
  name: "Kenna Williams",
  role: "Travel agency owner",
  fact: "Kenna Williams' agency sends Egypt Eye more than 100 travelers a year — the same operator handling every one of them.",
};

// VIP clients, transcribed from the deck's "Our V.I.P Clients" slides. Names
// and role lines are exactly as the deck words them. Two of them carry the
// deck's own trip photography.
export const vipClients: { name: string; role: string; photo?: string; alt?: string; when?: string; place?: string }[] = [
  {
    name: "Sonakshi Sinha",
    role: "Bollywood actor",
    when: "December 2023",
    place: "Cairo",
    photo: "/photos/about/sonakshi-sinha-cairo.jpg",
    alt: "Sonakshi Sinha walking through a lantern-lit Cairo market street",
  },
  {
    name: "Zaheer",
    role: "Bollywood actor",
    place: "Giza",
    photo: "/photos/about/zaheer-giza-pyramids.jpg",
    alt: "Zaheer standing on the sand with the pyramids of Giza behind him",
  },
  { name: "Daniel Mann", role: "Luxury travel creator" },
  { name: "Abeille", role: "Master manifesting artist" },
  { name: "Melissa", role: "Artist" },
  { name: "Sandy", role: "Journalist" },
  { name: "GeeGee", role: "Fitness coach" },
  { name: "Mieka", role: "Video creator" },
  { name: "Lily Zaremba", role: "Public figure" },
  { name: "Victoria", role: "Top model & influencer" },
  { name: "Mijune", role: "Top Chef Canada presenter" },
  { name: "Alison", role: "Top model & influencer" },
  { name: "Tira", role: "Journalist" },
  { name: "Yliana", role: "Entrepreneurship" },
  { name: "Nikita", role: "Digital creator" },
  { name: "Michelle", role: "Mrs Mexico & Mrs Houston" },
  { name: "Coco", role: "Olympic star" },
  { name: "Moonie", role: "Olympic star" },
  { name: "Daniel Kim", role: "Public figure" },
  { name: "Yasin Cengiz", role: "Video creator" },
  { name: "Wande Akin", role: "Travel creator" },
];

// "Our Collaborators and our business partner we worked with before" — deck.
export const collaborators = [
  "LuxeTribes",
  "We Love Travel",
  "Tin Trips",
  "The Pynk Magazine",
  "Where Is Bre",
  "Vacay Till Sunday",
  "Liz Desir",
  "JetBlack Travel",
];

// "Hotels in Egypt" — the properties the deck lists Egypt Eye as booking
// guests into. Rendered as plain names, never as third-party logos.
export const hotelPartners = [
  "Steigenberger",
  "Fairmont Nile City",
  "Marriott Mena House",
  "Conrad Cairo",
  "Pyramids Oasis Hotel",
  "Great Pyramid Inn",
  "Jasmine Pyramids Hotel",
];

// "Our Destinations — Egypt .. and Jordan!" — deck.
export const coveredDestinations = {
  egypt: ["Giza", "Cairo", "Alexandria", "Red Sea", "Aswan", "Siwa", "Fayoum", "Luxor"],
  jordan: ["Petra", "Wadi Rum", "Dead Sea", "Khez Ali"],
};

// "Our Services" + "What We Offer" + "Our Trendy Giveaways" — deck. Wording
// is ours; every claim is one the deck makes.
export const groundOperations: { title: string; body: string }[] = [
  {
    title: "Private, never pooled",
    body: "Every tour runs as a private tour. Your group, your guide, your pace — not a coach filled with strangers.",
  },
  {
    title: "Modern air-conditioned vehicles",
    body: "Transport is our own, kept modern and air-conditioned, because Egypt is hot and a long transfer day shouldn't be the part you remember.",
  },
  {
    title: "Guides in your language",
    body: "Our guides speak the languages our travelers arrive with, so nothing about a 4,000-year-old room has to be explained twice.",
  },
  {
    title: "Support that answers at 3am",
    body: "Customer service runs 24/7. Flight moved, plan changed, something went wrong at the hotel — someone picks up.",
  },
  {
    title: "In-house content creators",
    body: "We keep expert content creators on the team. The photos and video from your trip are made by people who are actually on it with you.",
  },
  {
    title: "Flying dress shoots",
    body: "The desert and temple flying-dress shoots you've seen from Egypt — the gowns, the locations, the timing — are run by us, not outsourced.",
  },
  {
    title: "Gifts made for your travelers",
    body: "For agencies and groups: custom giveaways made for your clients — necklaces with their names in Arabic, photo albums, tote bags, passport covers, carrying your logo.",
  },
];
