import type { Dictionary } from "./en";

// Italian — courteous second person singular, which is how Italian travel
// sites address a prospective guest without sounding either cold or overly
// familiar. "Tour" is left as the borrowing Italians actually use, while
// "servizio fotografico" is preferred over the English "photoshoot".
export const it: Dictionary = {
  language: {
    label: "Lingua",
    choose: "Scegli la lingua",
    current: "Lingua attuale",
  },

  nav: {
    more: "Altro",
    toggleMenu: "Apri il menu",
    myJourney: "Il mio viaggio",
    planMyTrip: "Pianifica il viaggio",
    account: "Account",
    skipToContent: "Vai al contenuto",
    byHref: {
      "/": "Home",
      "/explore-egypt": "Scopri l'Egitto",
      "/signature-experiences": "Esperienze esclusive",
      "/tours": "Tour più richiesti",
      "/experiences": "Esperienze extra",
      "/photoshoots": "Servizi fotografici",
      "/transfers": "Transfer",
      "/hotel-deals": "Offerte hotel",
      "/customize": "Crea il tuo tour",
      "/stories": "Racconti",
      "/partners": "Diventa partner",
      "/testimonials": "Recensioni",
      "/about": "Chi siamo",
    },
  },

  footer: {
    explore: "Esplora",
    contact: "Contatti",
    follow: "Seguici",
    partnerWithUs: "Diventa partner",
    travelAgents: "Agenzie di viaggio",
    affiliateProgram: "Programma affiliati",
    creators: "Creator e influencer",
    travelerReviews: "Recensioni",
    privacy: "Informativa sulla privacy",
    terms: "Termini di servizio",
    rightsReserved: "Tutti i diritti riservati.",
  },

  common: {
    bookOnWhatsApp: "Prenota su WhatsApp",
    emailEnquiry: "Invia una richiesta",
    addToJourney: "Aggiungi al mio viaggio",
    inMyJourney: "Nel mio viaggio",
    viewTour: "Vedi il tour",
    viewDetails: "Vedi i dettagli",
    seeDetails: "Dettagli",
    seeFullExperience: "Scopri l'esperienza completa",
    enquireForPricing: "Richiedi il prezzo",
    perPerson: "a persona",
    from: "da",
    designYourTour: "Crea il viaggio dei tuoi sogni",
    readyHeading: "Pronto a scrivere la tua storia in Egitto?",
    readyBody: "Raccontaci cosa hai in mente e costruiremo un itinerario privato su misura.",
    backToAllTours: "Torna a tutti i tour",
    backToAllExperiences: "Torna a tutte le esperienze",
    youMightAlsoLike: "Potrebbe interessarti anche",
    moreExperiences: "Altre esperienze da aggiungere",
    gallery: "Galleria",
    aboutThisTour: "Questo tour",
    whatsIncluded: "Incluso",
    notIncluded: "Non incluso",
    itinerary: "Itinerario",
    highlights: "Da non perdere",
    goodToKnow: "Buono a sapersi",
    availableOn: "Disponibile con",
    whereYoullGo: "Il percorso",
    day: "Giorno",
  },

  physical: {
    label: "Livello di impegno",
    easy: "Facile",
    moderate: "Medio",
    active: "Attivo",
    challenging: "Impegnativo",
  },

  reviews: {
    chip: "Valutazione dell'esperienza",
    eyebrow: "Racconti di viaggio",
    heading: "Cosa dicono i nostri viaggiatori",
    intro:
      "Ogni recensione viene da un viaggio reale con Egypt Eye: nessuna citazione inventata o di esempio. Sono tutte in questa pagina; usa i filtri per restringerle a una categoria o a un singolo tour, servizio fotografico o servizio.",
    all: "Tutte le recensioni",
    photoshoots: "Servizi fotografici",
    tours: "Tour",
    services: "Servizi",
    filterByCategory: "Filtra le recensioni per categoria",
    jumpTo: "Vai a",
    anyProduct: "Qualsiasi tour, servizio fotografico o servizio",
    anyInCategory: "Tutto in questa categoria",
    clear: "Azzera",
    showingAll: "Tutte le recensioni, comprese le più recenti",
    showingProduct: "Recensioni di {product}",
    showingCategory: "Tutte le recensioni: {category}",
    none: "Qui non ci sono ancora recensioni.",
    seeAll: "Vedi tutte le recensioni",
    onTheWay: "Le recensioni stanno arrivando — torna presto, oppure",
    startPlanning: "inizia a progettare il tuo viaggio in Egitto",
  },

  tours: {
    filterHeading: "Filtra i tour",
    searchPlaceholder: "Nome del tour o destinazione...",
    tripType: "Tipo di viaggio",
    all: "Tutti i tour",
    oneDay: "Escursioni in giornata",
    multiDay: "Tour di più giorni",
    jordan: "Egitto e Giordania",
    matchCount: "{count} tour trovati",
    noMatches: "Nessun tour corrisponde a questa ricerca.",
    clearFilters: "Rimuovi i filtri",
  },

  forms: {
    name: "Nome",
    email: "Email",
    phone: "Telefono",
    message: "Messaggio",
    send: "Invia",
    sending: "Invio in corso…",
    sent: "Grazie — ti risponderemo a breve.",
    error: "Qualcosa è andato storto. Riprova o scrivici su WhatsApp.",
    required: "Obbligatorio",
    optional: "facoltativo",
  },

  errors: {
    notFoundTitle: "Non siamo riusciti a trovare questa pagina",
    notFoundBody:
      "La pagina che cerchi è stata spostata o non è mai esistita. Dai un'occhiata ai tour o torna alla home.",
    backHome: "Torna alla home",
    browseTours: "Sfoglia i tour",
    somethingWrong: "Qualcosa è andato storto",
    somethingWrongBody: "Ci dispiace, il caricamento non è riuscito. Riprova.",
    tryAgain: "Riprova",
  },


  pages: {
    "/": {
      title: "Tour privati ed esperienze di viaggio in Egitto",
      description:
        "Tour privati con guida in tutto l'Egitto — Il Cairo, Luxor, Assuan e il Mar Rosso — con servizio fotografico professionale incluso. Itinerari su misura e assistenza dedicata.",
    },
    "/tours": {
      title: "Tour privati in Egitto e Giordania",
      description:
        "Tour privati con guida in Egitto e Giordania — escursioni in giornata, itinerari di più giorni e crociere sul Nilo. Ogni tour include veicolo privato e guida.",
    },
    "/photoshoots": {
      title: "Servizi fotografici alle piramidi e Flying Dress in Egitto",
      description:
        "Pacchetti fotografici professionali in Egitto, tra cui il servizio esclusivo alle piramidi di Giza e la prima esperienza Flying Dress del paese.",
    },
    "/experiences": {
      title: "Cosa fare in Egitto — attività ed esperienze extra",
      description:
        "Giri in cammello a Giza, kayak sul Nilo, safari 4x4 nel Fayyum, mongolfiera su Luxor e giornate tra le isole del Mar Rosso — le attività di Egypt Eye, per destinazione.",
    },
    "/signature-experiences": {
      title: "Esperienze esclusive",
      description:
        "Esperienze di viaggio costruite attorno a una persona e a un'esigenza precisa: la destinazione è parte della risposta, non tutto il progetto.",
    },
    "/explore-egypt": {
      title: "Scopri l'Egitto — mappa interattiva delle destinazioni",
      description:
        "Una mappa interattiva delle destinazioni imperdibili dell'Egitto — Il Cairo, Luxor, Assuan e la costa del Mar Rosso — con i tour e le esperienze davvero disponibili in ciascuna.",
    },
    "/transfers": {
      title: "Transfer privati al Cairo e a Giza",
      description:
        "Prenota un transfer privato dall'aeroporto, dall'hotel o tra città al Cairo e a Giza: scegli il veicolo e richiedi un preventivo in pochi clic.",
    },
    "/hotel-deals": {
      title: "Offerte hotel in Egitto",
      description:
        "Hotel con tariffe partner Egypt Eye in corso al Cairo, a Giza e sulla costa del Mar Rosso.",
    },
    "/customize": {
      title: "Crea il tuo tour",
      description:
        "Raccontaci date, interessi e ritmo del viaggio: costruiremo un itinerario privato in Egitto o Giordania su misura per te.",
    },
    "/stories": {
      title: "Racconti di viaggio dall'Egitto",
      description:
        "Scritti di viaggio di Egypt Eye: la storia, i luoghi e i momenti rari attorno ai quali vale la pena costruire un viaggio.",
    },
    "/about": {
      title: "Chi è Egypt Eye — chi viaggia con noi e chi ci affida il viaggio",
      description:
        "Agenzie di viaggio, attori di Bollywood, olimpionici e creator hanno affidato a Egypt Eye il loro viaggio in Egitto. Le agenzie, gli ospiti, i viaggi e le date, in una pagina.",
    },
    "/partners": {
      title: "Diventa partner",
      description:
        "Tre modi per lavorare con Egypt Eye: il programma per agenzie di viaggio, il programma affiliati e le collaborazioni con creator e influencer.",
    },
    "/travel-agents": {
      title: "Programma partner per agenzie di viaggio",
      description:
        "Entra nel programma per agenzie di Egypt Eye: tariffe partner dedicate, un referente personale e supporto completo alle prenotazioni in Egitto e Giordania.",
    },
    "/affiliate": {
      title: "Programma affiliati",
      description:
        "Guadagna una commissione consigliando i tour privati di Egypt Eye in Egitto e Giordania. Un codice tutto tuo, prenotazioni tracciate in tempo reale e pagamenti mensili.",
    },
    "/collaborate": {
      title: "Collabora con Egypt Eye",
      description:
        "Creator e influencer: candidatevi per viaggi sponsorizzati, collaborazioni di contenuto e servizi stampa in Egitto e Giordania.",
    },
    "/privacy": {
      title: "Informativa sulla privacy",
      description:
        "Come Egypt Eye Travel & Tours raccoglie, utilizza e protegge i dati personali che condividi prenotando un viaggio o un servizio fotografico.",
    },
    "/terms": {
      title: "Termini di servizio",
      description:
        "Le condizioni di prenotazione, pagamento, cancellazione e responsabilità valide per ogni viaggio, transfer e servizio fotografico di Egypt Eye Travel & Tours.",
    },
    "/pharaoh-challenge": {
      title: "Pharaoh's Challenge — gioca e vinci",
      description:
        "Cinque camere ispirate all'Antico Egitto, un solo tentativo e uno sconto che cresce man mano che avanzi. Gioca alla Pharaoh's Challenge.",
    },
  },

  seo: {
    homeTitle: "Tour privati, servizi fotografici ed esperienze in Egitto",
    localeSuffix: "",
  },
};
