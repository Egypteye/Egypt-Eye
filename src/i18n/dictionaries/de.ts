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


  pages: {
    "/": {
      title: "Private Ägypten-Reisen & Reiseerlebnisse",
      description:
        "Private, geführte Reisen durch Ägypten — Kairo, Luxor, Assuan und das Rote Meer — mit professioneller Fotografie inklusive. Individuelle Routen, persönliche Betreuung.",
    },
    "/tours": {
      title: "Private Reisen durch Ägypten & Jordanien",
      description:
        "Private, geführte Reisen durch Ägypten und Jordanien — Tagesausflüge, Mehrtagesrouten und Nilkreuzfahrten. Jede Reise mit privatem Fahrzeug und Guide.",
    },
    "/photoshoots": {
      title: "Fotoshootings an den Pyramiden & Flying Dress in Ägypten",
      description:
        "Professionelle Fotoshooting-Pakete in Ägypten, darunter das exklusive Pyramiden-Shooting und Ägyptens erstes Flying-Dress-Erlebnis.",
    },
    "/experiences": {
      title: "Was man in Ägypten unternehmen kann — Aktivitäten & Zusatzerlebnisse",
      description:
        "Kamelritte in Giza, Kajak auf dem Nil, 4x4-Safaris im Fayoum, Ballonfahrten über Luxor und Inseltage am Roten Meer — die Aktivitäten von Egypt Eye, nach Ziel sortiert.",
    },
    "/signature-experiences": {
      title: "Signature-Erlebnisse",
      description:
        "Kuratierte Ägypten-Erlebnisse, entworfen um einen bestimmten Menschen und ein bestimmtes Bedürfnis — das Ziel ist Teil der Antwort, nicht der ganze Plan.",
    },
    "/explore-egypt": {
      title: "Ägypten entdecken — interaktive Reisekarte",
      description:
        "Eine interaktive Karte der wichtigsten Ziele Ägyptens — Kairo, Luxor, Assuan und die Küste des Roten Meeres — mit den Reisen und Erlebnissen, die es dort wirklich gibt.",
    },
    "/transfers": {
      title: "Private Transfers in Kairo & Giza",
      description:
        "Buchen Sie einen privaten Flughafen-, Hotel- oder Überlandtransfer in Kairo und Giza — Fahrzeug wählen und in wenigen Klicks ein Angebot anfordern.",
    },
    "/hotel-deals": {
      title: "Hotelangebote in Ägypten",
      description:
        "Hotels mit aktuellen Egypt-Eye-Partnerraten in Kairo, Giza und an der Küste des Roten Meeres.",
    },
    "/customize": {
      title: "Reise zusammenstellen",
      description:
        "Sagen Sie uns Ihre Termine, Interessen und Ihr Tempo — wir entwerfen eine private Route durch Ägypten oder Jordanien um Sie herum.",
    },
    "/stories": {
      title: "Reisegeschichten aus Ägypten",
      description:
        "Redaktionelle Reisetexte von Egypt Eye — die Geschichte, die Orte und die seltenen Momente, um die sich eine Reise lohnt.",
    },
    "/about": {
      title: "Über Egypt Eye — wer mit uns reist und wer uns vertraut",
      description:
        "Reisebüros, Bollywood-Schauspieler, Olympioniken und Creator haben Egypt Eye ihre Ägyptenreise anvertraut. Die Agenturen, die Gäste, die Reisen und die Daten — auf einer Seite.",
    },
    "/partners": {
      title: "Partner werden",
      description:
        "Drei Wege, mit Egypt Eye zu arbeiten: das Partnerprogramm für Reisebüros, das Affiliate-Programm und Kooperationen mit Creatorn und Influencern.",
    },
    "/travel-agents": {
      title: "Partnerprogramm für Reisebüros",
      description:
        "Werden Sie Teil des Egypt-Eye-Reisebüroprogramms: besondere Partnerraten, ein fester Ansprechpartner und volle Buchungsunterstützung für Ägypten und Jordanien.",
    },
    "/affiliate": {
      title: "Partnerprogramm",
      description:
        "Verdienen Sie Provision, indem Sie die privaten Ägypten- und Jordanien-Reisen von Egypt Eye empfehlen. Eigener Empfehlungscode, live verfolgte Buchungen, monatliche Auszahlung.",
    },
    "/collaborate": {
      title: "Mit Egypt Eye zusammenarbeiten",
      description:
        "Creator und Influencer — bewerben Sie sich für gesponserte Reisen, Content-Kooperationen und Pressebegleitung in Ägypten und Jordanien.",
    },
    "/privacy": {
      title: "Datenschutz",
      description:
        "Wie Egypt Eye Travel & Tours die personenbezogenen Daten erhebt, verwendet und schützt, die Sie bei der Buchung einer Reise oder eines Shootings angeben.",
    },
    "/terms": {
      title: "AGB",
      description:
        "Die Buchungs-, Zahlungs-, Stornierungs- und Haftungsbedingungen für jede Reise, jeden Transfer und jedes Fotoshooting von Egypt Eye Travel & Tours.",
    },
    "/pharaoh-challenge": {
      title: "Pharaoh's Challenge — spielen und gewinnen",
      description:
        "Fünf von Altägypten inspirierte Kammern, ein Versuch und ein Rabatt, der mit jeder Kammer wächst. Spielen Sie die Pharaoh's Challenge.",
    },
  },

  seo: {
    homeTitle: "Private Ägypten-Reisen, Fotoshootings & Erlebnisse",
    localeSuffix: "",
  },
};
