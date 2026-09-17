import type { Dictionary } from "./en";

// German — "Sie" throughout, which is what a German traveler expects from a
// tour operator they are about to pay. Kept idiomatic rather than literal:
// "Reisen" not "Touren", "Fotoshooting" (the borrowed word Germans actually
// use), and "Was dich erwartet"-style headings avoided in favour of the
// formal register the rest of the copy keeps.
export const de: Dictionary = {
  language: {
    label: "Sprache",
    choose: "Sprache wählen",
    current: "Aktuelle Sprache",
  },

  nav: {
    more: "Mehr",
    toggleMenu: "Menü öffnen",
    myJourney: "Meine Reise",
    planMyTrip: "Reise planen",
    account: "Konto",
    skipToContent: "Zum Inhalt springen",
    byHref: {
      "/": "Startseite",
      "/explore-egypt": "Ägypten entdecken",
      "/signature-experiences": "Signature-Erlebnisse",
      "/tours": "Beliebteste Reisen",
      "/experiences": "Zusatzerlebnisse",
      "/photoshoots": "Fotoshootings",
      "/transfers": "Transfers",
      "/hotel-deals": "Hotelangebote",
      "/customize": "Reise zusammenstellen",
      "/stories": "Reisemagazin",
      "/partners": "Partner werden",
      "/testimonials": "Bewertungen",
      "/about": "Über uns",
    },
  },

  footer: {
    explore: "Entdecken",
    contact: "Kontakt",
    follow: "Folgen",
    partnerWithUs: "Partner werden",
    travelAgents: "Reisebüros",
    affiliateProgram: "Partnerprogramm",
    creators: "Creator & Influencer",
    travelerReviews: "Bewertungen",
    privacy: "Datenschutz",
    terms: "AGB",
    rightsReserved: "Alle Rechte vorbehalten.",
  },

  common: {
    bookOnWhatsApp: "Über WhatsApp buchen",
    emailEnquiry: "Anfrage per E-Mail",
    addToJourney: "Zu meiner Reise hinzufügen",
    inMyJourney: "In meiner Reise",
    viewTour: "Reise ansehen",
    viewDetails: "Details ansehen",
    seeDetails: "Details",
    seeFullExperience: "Das ganze Erlebnis ansehen",
    enquireForPricing: "Preis anfragen",
    perPerson: "pro Person",
    from: "ab",
    designYourTour: "Traumreise gestalten",
    readyHeading: "Bereit für Ihre eigene Ägypten-Geschichte?",
    readyBody: "Sagen Sie uns, was Ihnen vorschwebt — wir bauen eine private Reise darum herum.",
    backToAllTours: "Zurück zu allen Reisen",
    backToAllExperiences: "Zurück zu allen Erlebnissen",
    youMightAlsoLike: "Das könnte Ihnen auch gefallen",
    moreExperiences: "Weitere Erlebnisse zum Hinzufügen",
    gallery: "Galerie",
    aboutThisTour: "Über diese Reise",
    whatsIncluded: "Inbegriffen",
    notIncluded: "Nicht inbegriffen",
    itinerary: "Reiseverlauf",
    highlights: "Höhepunkte",
    goodToKnow: "Gut zu wissen",
    availableOn: "Buchbar bei",
    whereYoullGo: "Ihre Route",
    day: "Tag",
  },

  physical: {
    label: "Anstrengung",
    easy: "Leicht",
    moderate: "Mittel",
    active: "Aktiv",
    challenging: "Anspruchsvoll",
  },

  reviews: {
    chip: "Erlebnisbewertung",
    eyebrow: "Reisegeschichten",
    heading: "Was unsere Reisenden sagen",
    intro:
      "Jede Bewertung hier stammt von einer echten Egypt-Eye-Reise — keine erfundenen oder beispielhaften Zitate. Alle stehen auf dieser Seite; mit den Filtern grenzen Sie sie auf eine Kategorie oder eine einzelne Reise, ein Shooting oder eine Leistung ein.",
    all: "Alle Bewertungen",
    photoshoots: "Fotoshootings",
    tours: "Reisen",
    services: "Leistungen",
    filterByCategory: "Bewertungen nach Kategorie filtern",
    jumpTo: "Springen zu",
    anyProduct: "Beliebige Reise, Shooting oder Leistung",
    anyInCategory: "Alles in dieser Kategorie",
    clear: "Zurücksetzen",
    showingAll: "Alle Bewertungen, auch die neuesten",
    showingProduct: "Bewertungen zu {product}",
    showingCategory: "Alle Bewertungen: {category}",
    none: "Hier gibt es noch keine Bewertungen.",
    seeAll: "Alle Bewertungen ansehen",
    onTheWay: "Die Bewertungen sind unterwegs — schauen Sie bald wieder vorbei, oder",
    startPlanning: "planen Sie Ihre eigene Ägypten-Geschichte",
  },

  tours: {
    filterHeading: "Reisen filtern",
    searchPlaceholder: "Reisename oder Ziel...",
    tripType: "Reiseart",
    all: "Alle Reisen",
    oneDay: "Tagesausflüge",
    multiDay: "Mehrtagesreisen",
    jordan: "Ägypten & Jordanien",
    matchCount: "{count} Reisen gefunden",
    noMatches: "Keine Reisen passen zu dieser Suche.",
    clearFilters: "Filter zurücksetzen",
  },

  forms: {
    name: "Name",
    email: "E-Mail",
    phone: "Telefon",
    message: "Nachricht",
    send: "Senden",
    sending: "Wird gesendet…",
    sent: "Vielen Dank — wir melden uns in Kürze.",
    error: "Da ist etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns auf WhatsApp.",
    required: "Pflichtfeld",
    optional: "optional",
  },

  errors: {
    notFoundTitle: "Diese Seite konnten wir nicht finden",
    notFoundBody:
      "Die gesuchte Seite wurde verschoben oder hat nie existiert. Sehen Sie sich die Reisen an oder kehren Sie zur Startseite zurück.",
    backHome: "Zurück zur Startseite",
    browseTours: "Reisen ansehen",
    somethingWrong: "Etwas ist schiefgelaufen",
    somethingWrongBody: "Entschuldigung — das konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
    tryAgain: "Erneut versuchen",
  },

  seo: {
    homeTitle: "Private Ägypten-Reisen, Fotoshootings & Erlebnisse",
    localeSuffix: "",
  },
};
