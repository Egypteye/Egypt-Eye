import type { Dictionary } from "./en";

// Spanish — neutral/peninsular "tú" avoided in favour of an impersonal
// register that reads naturally in both Spain and Latin America, since both
// are real markets and "vosotros" would exclude half of them. "Circuitos"
// for multi-day tours, "excursiones" for day trips, and "sesión de fotos"
// rather than the English borrowing.
export const es: Dictionary = {
  language: {
    label: "Idioma",
    choose: "Elige tu idioma",
    current: "Idioma actual",
  },

  nav: {
    more: "Más",
    toggleMenu: "Abrir menú",
    myJourney: "Mi viaje",
    planMyTrip: "Planificar mi viaje",
    account: "Cuenta",
    skipToContent: "Ir al contenido",
    byHref: {
      "/": "Inicio",
      "/explore-egypt": "Descubre Egipto",
      "/signature-experiences": "Experiencias exclusivas",
      "/tours": "Circuitos más solicitados",
      "/experiences": "Experiencias adicionales",
      "/photoshoots": "Sesiones de fotos",
      "/transfers": "Traslados",
      "/hotel-deals": "Ofertas de hoteles",
      "/customize": "Diseña tu circuito",
      "/stories": "Revista",
      "/partners": "Colabora con nosotros",
      "/testimonials": "Opiniones de viajeros",
      "/about": "Quiénes somos",
    },
  },

  footer: {
    explore: "Explorar",
    contact: "Contacto",
    follow: "Síguenos",
    partnerWithUs: "Colabora con nosotros",
    travelAgents: "Agencias de viajes",
    affiliateProgram: "Programa de afiliados",
    creators: "Creadores e influencers",
    travelerReviews: "Opiniones de viajeros",
    privacy: "Política de privacidad",
    terms: "Términos del servicio",
    rightsReserved: "Todos los derechos reservados.",
  },

  common: {
    bookOnWhatsApp: "Reservar por WhatsApp",
    emailEnquiry: "Enviar una consulta",
    addToJourney: "Añadir a mi viaje",
    inMyJourney: "En mi viaje",
    viewTour: "Ver circuito",
    viewDetails: "Ver detalles",
    seeDetails: "Detalles",
    seeFullExperience: "Ver la experiencia completa",
    enquireForPricing: "Consultar precio",
    perPerson: "por persona",
    from: "desde",
    designYourTour: "Diseña el viaje de tus sueños",
    readyHeading: "¿Listo para escribir tu propia historia en Egipto?",
    readyBody: "Cuéntanos qué tienes en mente y construiremos un itinerario privado a tu medida.",
    backToAllTours: "Volver a todos los circuitos",
    backToAllExperiences: "Volver a todas las experiencias",
    youMightAlsoLike: "También te puede interesar",
    moreExperiences: "Más experiencias para añadir",
    gallery: "Galería",
    aboutThisTour: "Sobre este circuito",
    whatsIncluded: "Incluye",
    notIncluded: "No incluye",
    itinerary: "Itinerario",
    highlights: "Lo mejor",
    goodToKnow: "Conviene saber",
    availableOn: "Disponible en",
    whereYoullGo: "Tu recorrido",
    day: "Día",
  },

  physical: {
    label: "Nivel de esfuerzo",
    easy: "Fácil",
    moderate: "Moderado",
    active: "Activo",
    challenging: "Exigente",
  },

  reviews: {
    chip: "Valoración de la experiencia",
    eyebrow: "Historias de viajeros",
    heading: "Lo que dicen nuestros viajeros",
    intro:
      "Cada opinión procede de un viaje real con Egypt Eye: ninguna cita inventada ni de ejemplo. Están todas en esta página; usa los filtros para acotarlas a una categoría o a un circuito, sesión o servicio concreto.",
    all: "Todas las opiniones",
    photoshoots: "Sesiones de fotos",
    tours: "Circuitos",
    services: "Servicios",
    filterByCategory: "Filtrar opiniones por categoría",
    jumpTo: "Ir a",
    anyProduct: "Cualquier circuito, sesión o servicio",
    anyInCategory: "Todo en esta categoría",
    clear: "Quitar filtro",
    showingAll: "Todas las opiniones, incluidas las más recientes",
    showingProduct: "Opiniones sobre {product}",
    showingCategory: "Todas las opiniones: {category}",
    none: "Aquí todavía no hay opiniones.",
    seeAll: "Ver todas las opiniones",
    onTheWay: "Las opiniones están en camino: vuelve pronto o",
    startPlanning: "empieza a planificar tu viaje a Egipto",
  },

  tours: {
    filterHeading: "Filtrar circuitos",
    searchPlaceholder: "Nombre del circuito o destino...",
    tripType: "Tipo de viaje",
    all: "Todos los circuitos",
    oneDay: "Excursiones de un día",
    multiDay: "Circuitos de varios días",
    jordan: "Egipto y Jordania",
    matchCount: "{count} circuitos encontrados",
    noMatches: "Ningún circuito coincide con esa búsqueda.",
    clearFilters: "Borrar filtros",
  },

  forms: {
    name: "Nombre",
    email: "Correo electrónico",
    phone: "Teléfono",
    message: "Mensaje",
    send: "Enviar",
    sending: "Enviando…",
    sent: "Gracias: nos pondremos en contacto muy pronto.",
    error: "Algo ha fallado. Inténtalo de nuevo o escríbenos por WhatsApp.",
    required: "Obligatorio",
    optional: "opcional",
  },

  errors: {
    notFoundTitle: "No encontramos esa página",
    notFoundBody:
      "La página que buscas se ha movido o nunca existió. Echa un vistazo a los circuitos o vuelve al inicio.",
    backHome: "Volver al inicio",
    browseTours: "Ver circuitos",
    somethingWrong: "Algo ha fallado",
    somethingWrongBody: "Lo sentimos, no se ha podido cargar. Inténtalo de nuevo.",
    tryAgain: "Reintentar",
  },

  seo: {
    homeTitle: "Circuitos privados, sesiones de fotos y experiencias en Egipto",
    localeSuffix: "",
  },
};
