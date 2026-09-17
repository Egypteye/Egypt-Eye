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


  pages: {
    "/": {
      title: "Circuitos privados y experiencias de viaje en Egipto",
      description:
        "Circuitos privados con guía por Egipto — El Cairo, Luxor, Asuán y el mar Rojo — con fotografía profesional incluida. Itinerarios a medida y atención personalizada.",
    },
    "/tours": {
      title: "Circuitos privados por Egipto y Jordania",
      description:
        "Circuitos privados con guía por Egipto y Jordania — excursiones de un día, itinerarios de varios días y cruceros por el Nilo. Vehículo privado y guía incluidos.",
    },
    "/photoshoots": {
      title: "Sesiones de fotos en las pirámides y Flying Dress en Egipto",
      description:
        "Paquetes de fotografía profesional en Egipto, incluida la sesión exclusiva en las pirámides de Guiza y la primera experiencia Flying Dress del país.",
    },
    "/experiences": {
      title: "Qué hacer en Egipto — actividades y experiencias adicionales",
      description:
        "Paseos en camello en Guiza, kayak en el Nilo, safaris 4x4 en El Fayum, globo sobre Luxor y días de isla en el mar Rojo — las actividades de Egypt Eye, por destino.",
    },
    "/signature-experiences": {
      title: "Experiencias exclusivas",
      description:
        "Experiencias de viaje diseñadas en torno a una persona y una necesidad concretas: el destino es parte de la respuesta, no el plan entero.",
    },
    "/explore-egypt": {
      title: "Descubre Egipto — mapa interactivo de destinos",
      description:
        "Un mapa interactivo de los destinos imprescindibles de Egipto — El Cairo, Luxor, Asuán y la costa del mar Rojo — con los circuitos y experiencias que hay realmente en cada uno.",
    },
    "/transfers": {
      title: "Traslados privados en El Cairo y Guiza",
      description:
        "Reserva un traslado privado de aeropuerto, hotel o entre ciudades en El Cairo y Guiza: elige el vehículo y pide presupuesto en unos clics.",
    },
    "/hotel-deals": {
      title: "Ofertas de hoteles en Egipto",
      description:
        "Hoteles con tarifas de socio de Egypt Eye vigentes en El Cairo, Guiza y la costa del mar Rojo.",
    },
    "/customize": {
      title: "Diseña tu circuito",
      description:
        "Cuéntanos tus fechas, tus intereses y tu ritmo: diseñaremos un itinerario privado por Egipto o Jordania a tu medida.",
    },
    "/stories": {
      title: "Historias de viaje por Egipto",
      description:
        "Textos de viaje de Egypt Eye: la historia, los lugares y los momentos poco frecuentes que merecen un viaje.",
    },
    "/about": {
      title: "Sobre Egypt Eye — quién viaja con nosotros y quién nos confía su viaje",
      description:
        "Agencias de viajes, actores de Bollywood, olímpicos y creadores han puesto su viaje a Egipto en manos de Egypt Eye. Las agencias, los huéspedes, los viajes y las fechas, en una página.",
    },
    "/partners": {
      title: "Colabora con nosotros",
      description:
        "Tres formas de trabajar con Egypt Eye: el programa para agencias de viajes, el programa de afiliados y las colaboraciones con creadores e influencers.",
    },
    "/travel-agents": {
      title: "Programa para agencias de viajes",
      description:
        "Únete al programa para agencias de Egypt Eye: tarifas de socio, un especialista dedicado y apoyo completo en las reservas por Egipto y Jordania.",
    },
    "/affiliate": {
      title: "Programa de afiliados",
      description:
        "Gana una comisión recomendando los circuitos privados de Egypt Eye por Egipto y Jordania. Tu propio código, seguimiento de reservas en tiempo real y pagos mensuales.",
    },
    "/collaborate": {
      title: "Colabora con Egypt Eye",
      description:
        "Creadores de contenido e influencers: solicita colaborar con Egypt Eye en viajes patrocinados, alianzas de contenido y cobertura de prensa por Egipto y Jordania.",
    },
    "/privacy": {
      title: "Política de privacidad",
      description:
        "Cómo Egypt Eye Travel & Tours recoge, usa y protege los datos personales que compartes al reservar un viaje o una sesión de fotos.",
    },
    "/terms": {
      title: "Términos del servicio",
      description:
        "Las condiciones de reserva, pago, cancelación y responsabilidad que se aplican a cada viaje, traslado y sesión de fotos de Egypt Eye Travel & Tours.",
    },
    "/pharaoh-challenge": {
      title: "Pharaoh's Challenge — juega y gana",
      description:
        "Cinco cámaras inspiradas en el Antiguo Egipto, un solo intento y un descuento que crece cuanto más avanzas. Juega al Pharaoh's Challenge.",
    },
  },

  seo: {
    homeTitle: "Circuitos privados, sesiones de fotos y experiencias en Egipto",
    // Appended to every tour page title, after an em dash.
    privateTourSuffix: "Circuito privado",
    localeSuffix: "",
  },
};
