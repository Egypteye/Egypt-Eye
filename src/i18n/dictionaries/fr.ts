import type { Dictionary } from "./en";

// French — "vous" throughout. Idiomatic rather than word-for-word:
// "circuits" is the term French travel buyers use for multi-day tours,
// "séance photo" for a shoot, and "Prêt à écrire votre propre histoire"
// keeps the warmth of the English without the calque that "histoire d'Égypte"
// would produce.
export const fr: Dictionary = {
  language: {
    label: "Langue",
    choose: "Choisissez votre langue",
    current: "Langue actuelle",
  },

  nav: {
    more: "Plus",
    toggleMenu: "Ouvrir le menu",
    myJourney: "Mon voyage",
    planMyTrip: "Planifier mon voyage",
    account: "Compte",
    skipToContent: "Aller au contenu",
    byHref: {
      "/": "Accueil",
      "/explore-egypt": "Découvrir l'Égypte",
      "/signature-experiences": "Expériences signature",
      "/tours": "Circuits les plus demandés",
      "/experiences": "Expériences complémentaires",
      "/photoshoots": "Séances photo",
      "/transfers": "Transferts",
      "/hotel-deals": "Offres hôtels",
      "/customize": "Composer mon circuit",
      "/stories": "Magazine",
      "/partners": "Devenir partenaire",
      "/testimonials": "Avis voyageurs",
      "/about": "À propos",
    },
  },

  footer: {
    explore: "Explorer",
    contact: "Contact",
    follow: "Nous suivre",
    partnerWithUs: "Devenir partenaire",
    travelAgents: "Agences de voyage",
    affiliateProgram: "Programme d'affiliation",
    creators: "Créateurs & influenceurs",
    travelerReviews: "Avis voyageurs",
    privacy: "Politique de confidentialité",
    terms: "Conditions générales",
    rightsReserved: "Tous droits réservés.",
  },

  common: {
    bookOnWhatsApp: "Réserver sur WhatsApp",
    emailEnquiry: "Envoyer une demande",
    addToJourney: "Ajouter à mon voyage",
    inMyJourney: "Dans mon voyage",
    viewTour: "Voir le circuit",
    viewDetails: "Voir les détails",
    seeDetails: "Détails",
    seeFullExperience: "Voir l'expérience complète",
    enquireForPricing: "Demander le tarif",
    perPerson: "par personne",
    from: "à partir de",
    designYourTour: "Composer le voyage de vos rêves",
    readyHeading: "Prêt à écrire votre propre histoire en Égypte ?",
    readyBody: "Dites-nous ce que vous avez en tête et nous construirons un circuit privé autour.",
    backToAllTours: "Retour à tous les circuits",
    backToAllExperiences: "Retour à toutes les expériences",
    youMightAlsoLike: "Vous aimerez peut-être aussi",
    moreExperiences: "D'autres expériences à ajouter",
    gallery: "Galerie",
    aboutThisTour: "À propos de ce circuit",
    whatsIncluded: "Inclus",
    notIncluded: "Non inclus",
    itinerary: "Itinéraire",
    highlights: "Points forts",
    goodToKnow: "Bon à savoir",
    availableOn: "Disponible sur",
    whereYoullGo: "Votre itinéraire",
    day: "Jour",
  },

  physical: {
    label: "Niveau d'effort",
    easy: "Facile",
    moderate: "Modéré",
    active: "Actif",
    challenging: "Exigeant",
  },

  reviews: {
    chip: "Avis sur l'expérience",
    eyebrow: "Récits de voyageurs",
    heading: "Ce que disent nos voyageurs",
    intro:
      "Chaque avis provient d'un vrai voyage avec Egypt Eye — aucune citation inventée ou illustrative. Ils sont tous sur cette page ; utilisez les filtres pour les restreindre à une catégorie ou à un circuit, une séance photo ou un service précis.",
    all: "Tous les avis",
    photoshoots: "Séances photo",
    tours: "Circuits",
    services: "Services",
    filterByCategory: "Filtrer les avis par catégorie",
    jumpTo: "Aller à",
    anyProduct: "Tout circuit, séance ou service",
    anyInCategory: "Tout dans cette catégorie",
    clear: "Réinitialiser",
    showingAll: "Tous les avis, y compris les plus récents",
    showingProduct: "Avis sur {product}",
    showingCategory: "Tous les avis : {category}",
    none: "Aucun avis ici pour le moment.",
    seeAll: "Voir tous les avis",
    onTheWay: "Les avis arrivent — revenez bientôt, ou",
    startPlanning: "commencez à planifier votre voyage en Égypte",
  },

  tours: {
    filterHeading: "Filtrer les circuits",
    searchPlaceholder: "Nom du circuit ou destination...",
    tripType: "Type de voyage",
    all: "Tous les circuits",
    oneDay: "Excursions à la journée",
    multiDay: "Circuits de plusieurs jours",
    jordan: "Égypte & Jordanie",
    matchCount: "{count} circuits trouvés",
    noMatches: "Aucun circuit ne correspond à cette recherche.",
    clearFilters: "Effacer les filtres",
  },

  forms: {
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    message: "Message",
    send: "Envoyer",
    sending: "Envoi…",
    sent: "Merci — nous vous recontactons très vite.",
    error: "Une erreur est survenue. Réessayez ou écrivez-nous sur WhatsApp.",
    required: "Obligatoire",
    optional: "facultatif",
  },

  errors: {
    notFoundTitle: "Nous n'avons pas trouvé cette page",
    notFoundBody:
      "La page que vous cherchez a été déplacée ou n'a jamais existé. Parcourez les circuits ou revenez à l'accueil.",
    backHome: "Retour à l'accueil",
    browseTours: "Parcourir les circuits",
    somethingWrong: "Une erreur est survenue",
    somethingWrongBody: "Désolé — le chargement a échoué. Veuillez réessayer.",
    tryAgain: "Réessayer",
  },


  pages: {
    "/": {
      title: "Circuits privés et expériences de voyage en Égypte",
      description:
        "Circuits privés guidés à travers l'Égypte — Le Caire, Louxor, Assouan et la mer Rouge — avec photographie professionnelle incluse. Itinéraires sur mesure, accompagnement personnalisé.",
    },
    "/tours": {
      title: "Circuits privés en Égypte et en Jordanie",
      description:
        "Circuits privés guidés en Égypte et en Jordanie — excursions à la journée, itinéraires de plusieurs jours et croisières sur le Nil. Véhicule privé et guide inclus.",
    },
    "/photoshoots": {
      title: "Séances photo aux pyramides et Flying Dress en Égypte",
      description:
        "Forfaits photo professionnels en Égypte, dont la séance exclusive aux pyramides de Gizeh et la première expérience Flying Dress du pays.",
    },
    "/experiences": {
      title: "Que faire en Égypte — activités et expériences complémentaires",
      description:
        "Balades à dos de chameau à Gizeh, kayak sur le Nil, safaris 4x4 au Fayoum, montgolfière au-dessus de Louxor et journées en mer Rouge — les activités Egypt Eye, par destination.",
    },
    "/signature-experiences": {
      title: "Expériences signature",
      description:
        "Des expériences égyptiennes conçues autour d'une personne et d'un besoin précis — la destination fait partie de la réponse, pas de tout le plan.",
    },
    "/explore-egypt": {
      title: "Découvrir l'Égypte — carte interactive des destinations",
      description:
        "Une carte interactive des destinations incontournables d'Égypte — Le Caire, Louxor, Assouan et la côte de la mer Rouge — avec les circuits et expériences réellement proposés sur place.",
    },
    "/transfers": {
      title: "Transferts privés au Caire et à Gizeh",
      description:
        "Réservez un transfert privé depuis l'aéroport, l'hôtel ou entre villes au Caire et à Gizeh — choisissez votre véhicule et demandez un devis en quelques clics.",
    },
    "/hotel-deals": {
      title: "Offres hôtelières en Égypte",
      description:
        "Des hôtels aux tarifs partenaires Egypt Eye en vigueur au Caire, à Gizeh et sur la côte de la mer Rouge.",
    },
    "/customize": {
      title: "Composer votre circuit",
      description:
        "Dites-nous vos dates, vos envies et votre rythme — nous concevons un itinéraire privé en Égypte ou en Jordanie autour de vous.",
    },
    "/stories": {
      title: "Récits de voyage en Égypte",
      description:
        "Les écrits de voyage d'Egypt Eye — l'histoire, les lieux et les moments rares autour desquels construire un séjour.",
    },
    "/about": {
      title: "À propos d'Egypt Eye — qui voyage avec nous, et qui nous fait confiance",
      description:
        "Agences de voyage, acteurs de Bollywood, athlètes olympiques et créateurs ont confié leur séjour en Égypte à Egypt Eye. Les agences, les invités, les voyages et les dates — sur une page.",
    },
    "/partners": {
      title: "Devenir partenaire",
      description:
        "Trois façons de travailler avec Egypt Eye : le programme partenaires agences, le programme d'affiliation et les collaborations avec créateurs et influenceurs.",
    },
    "/travel-agents": {
      title: "Programme partenaires agences de voyage",
      description:
        "Rejoignez le programme agences d'Egypt Eye : tarifs partenaires dédiés, un interlocuteur attitré et un accompagnement complet en Égypte et en Jordanie.",
    },
    "/affiliate": {
      title: "Programme d'affiliation",
      description:
        "Gagnez une commission en recommandant les circuits privés d'Egypt Eye en Égypte et en Jordanie. Votre code de parrainage, un suivi en temps réel et des versements mensuels.",
    },
    "/collaborate": {
      title: "Collaborer avec Egypt Eye",
      description:
        "Créateurs et influenceurs — candidatez pour des voyages sponsorisés, des partenariats de contenu et des reportages en Égypte et en Jordanie.",
    },
    "/privacy": {
      title: "Politique de confidentialité",
      description:
        "Comment Egypt Eye Travel & Tours collecte, utilise et protège les données personnelles que vous communiquez en réservant un voyage ou une séance photo.",
    },
    "/terms": {
      title: "Conditions générales",
      description:
        "Les conditions de réservation, de paiement, d'annulation et de responsabilité applicables à chaque voyage, transfert et séance photo Egypt Eye Travel & Tours.",
    },
    "/pharaoh-challenge": {
      title: "Pharaoh's Challenge — jouez et gagnez",
      description:
        "Cinq salles inspirées de l'Égypte ancienne, une seule tentative et une remise qui grandit à mesure que vous avancez. Jouez au Pharaoh's Challenge.",
    },
  },

  seo: {
    homeTitle: "Circuits privés, séances photo et expériences en Égypte",
    // Appended to every tour page title, after an em dash.
    privateTourSuffix: "Circuit privé",
    localeSuffix: "",
  },
};
