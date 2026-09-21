import { DEFAULT_LOCALE, type Locale } from "@/i18n/locales";
import type { ResolvedListingPages } from "./types";

/**
 * The hero and intro copy on the seven catalogue listing pages, translated.
 *
 * Unlike a tour or a photoshoot, this copy has no per-document translation
 * fields to hang off: it's a single Sanity singleton whose English an editor
 * is likely to keep tuning. So each entry stores the English it was written
 * against, and a translation is only used while that English still matches —
 * see `say` below. Reword a headline in Studio and the site falls back to the
 * new English rather than shipping a confident translation of a sentence that
 * no longer exists.
 */

/** A set of translations, plus the English they were written against. */
type Phrase = { en: string } & Partial<Record<Exclude<Locale, "en">, string>>;

/**
 * The translation, but only while it still describes the English on the page.
 *
 * A mismatch is the normal, expected outcome of an editor improving the copy,
 * not an error — English is a correct page in every language, a stale
 * translation is not.
 */
function say(original: string, phrase: Phrase | undefined, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return original;
  if (!phrase || phrase.en !== original) return original;
  return phrase[locale] ?? original;
}

const tours = {
  heroEyebrow: {
    en: "Best Seller Tours",
    fr: "Nos circuits les plus vendus",
    es: "Circuitos más vendidos",
    it: "I tour più venduti",
    ru: "Самые популярные туры",
    ar: "الرحلات الأكثر مبيعًا",
  },
  heroTitle: {
    en: "Tours Across All Egypt & Jordan",
    fr: "Des circuits dans toute l'Égypte et la Jordanie",
    es: "Circuitos por todo Egipto y Jordania",
    it: "Tour in tutto l'Egitto e la Giordania",
    ru: "Туры по всему Египту и Иордании",
    ar: "رحلات في مصر والأردن كلّها",
  },
  sectionTitleTemplate: {
    en: "{count} private, guided itineraries",
    fr: "{count} itinéraires privés avec guide",
    es: "{count} itinerarios privados con guía",
    it: "{count} itinerari privati con guida",
    ru: "{count} частных маршрутов с гидом",
    ar: "{count} برنامجًا خاصًا مع مرشد",
  },
  sectionDescription: {
    en: "Every tour includes a private vehicle and an English-speaking guide. Search by destination, filter by trip length or travel style, or reach out and we'll help you choose.",
    fr: "Chaque circuit comprend un véhicule privé et un guide anglophone. Cherchez par destination, filtrez par durée ou par style de voyage, ou écrivez-nous et nous vous aiderons à choisir.",
    es: "Cada circuito incluye vehículo privado y guía de habla inglesa. Busca por destino, filtra por duración o estilo de viaje, o escríbenos y te ayudamos a elegir.",
    it: "Ogni tour include un veicolo privato e una guida di lingua inglese. Cerca per destinazione, filtra per durata o stile di viaggio, oppure scrivici e ti aiutiamo a scegliere.",
    ru: "В каждый тур входят личный транспорт и англоговорящий гид. Ищите по направлению, фильтруйте по длительности или стилю поездки — или напишите нам, и мы поможем выбрать.",
    ar: "كل رحلة تشمل سيارة خاصة ومرشدًا يتحدّث الإنجليزية. ابحث حسب الوجهة، أو صفِّ حسب المدة أو أسلوب السفر، أو راسلنا وسنساعدك على الاختيار.",
  },
} satisfies Record<string, Phrase>;

/**
 * Keyed by the English question rather than by position: an editor adding or
 * reordering FAQs in Studio must not silently move a translated answer under
 * a different question.
 */
const tourFaqs: Record<string, { question: Phrase; answer: Phrase }> = {
  "How many days do I need in Egypt?": {
    question: {
      en: "How many days do I need in Egypt?",
      fr: "Combien de jours faut-il prévoir en Égypte ?",
      es: "¿Cuántos días necesito en Egipto?",
      it: "Quanti giorni servono per l'Egitto?",
      ru: "Сколько дней нужно на Египет?",
      ar: "كم يومًا أحتاج في مصر؟",
    },
    answer: {
      en: "Most first-time travelers find 10 days the sweet spot — enough time for Cairo and Giza plus a proper Nile stretch between Luxor and Aswan, without every hour being scheduled. A week is workable if you accept choosing between Cairo and the Nile Valley rather than both. Two weeks or more lets you add Alexandria, the Red Sea, or a desert oasis without rushing the rest.",
      fr: "Pour un premier voyage, 10 jours sont le bon équilibre : assez de temps pour Le Caire et Gizeh, plus une vraie portion du Nil entre Louxor et Assouan, sans que chaque heure soit programmée. Une semaine reste jouable si vous acceptez de choisir entre Le Caire et la vallée du Nil plutôt que les deux. À partir de deux semaines, vous pouvez ajouter Alexandrie, la mer Rouge ou une oasis du désert sans précipiter le reste.",
      es: "Para un primer viaje, 10 días suelen ser el punto justo: tiempo suficiente para El Cairo y Guiza más un tramo real del Nilo entre Luxor y Asuán, sin tener cada hora programada. Una semana funciona si aceptas elegir entre El Cairo y el valle del Nilo en lugar de verlo todo. A partir de dos semanas puedes añadir Alejandría, el mar Rojo o un oasis del desierto sin acelerar el resto.",
      it: "Per un primo viaggio 10 giorni sono la misura giusta: tempo a sufficienza per Il Cairo e Giza più un tratto vero di Nilo tra Luxor e Assuan, senza avere ogni ora programmata. Una settimana funziona se accetti di scegliere tra Il Cairo e la valle del Nilo invece di vedere entrambi. Da due settimane in su puoi aggiungere Alessandria, il Mar Rosso o un'oasi nel deserto senza correre sul resto.",
      ru: "Тем, кто едет впервые, обычно хватает 10 дней: достаточно на Каир и Гизу плюс полноценный отрезок Нила между Луксором и Асуаном, и при этом не каждый час расписан. Неделя тоже работает, если вы готовы выбрать между Каиром и долиной Нила, а не брать и то и другое. Две недели и больше позволяют добавить Александрию, Красное море или оазис в пустыне, не подгоняя остальное.",
      ar: "معظم من يزور مصر لأول مرة يجد أن 10 أيام هي المدة المثالية — تكفي للقاهرة والجيزة مع مسار نيلي حقيقي بين الأقصر وأسوان، دون أن تكون كل ساعة مرتّبة سلفًا. أسبوع واحد ممكن إن قبلت الاختيار بين القاهرة ووادي النيل بدل الاثنين معًا. أما أسبوعان فأكثر فيتيحان إضافة الإسكندرية أو البحر الأحمر أو واحة صحراوية دون استعجال بقية الرحلة.",
    },
  },

  "What's the difference between a private and a group tour?": {
    question: {
      en: "What's the difference between a private and a group tour?",
      fr: "Quelle différence entre un circuit privé et un circuit en groupe ?",
      es: "¿Qué diferencia hay entre un circuito privado y uno en grupo?",
      it: "Che differenza c'è tra un tour privato e uno di gruppo?",
      ru: "Чем частный тур отличается от группового?",
      ar: "ما الفرق بين الرحلة الخاصة والرحلة الجماعية؟",
    },
    answer: {
      en: "Every tour on this page is private: your own vehicle, your own English-speaking Egyptologist, and a schedule that moves at your pace rather than a bus timetable. It costs more than joining a group, but it's the difference between seeing a site and actually experiencing it — no waiting on 20 other people to finish photos.",
      fr: "Tous les circuits de cette page sont privés : votre propre véhicule, votre propre égyptologue anglophone et un rythme qui suit le vôtre plutôt qu'un horaire de bus. C'est plus cher que de rejoindre un groupe, mais c'est la différence entre voir un site et le vivre vraiment — sans attendre que vingt autres personnes finissent leurs photos.",
      es: "Todos los circuitos de esta página son privados: tu propio vehículo, tu propio egiptólogo de habla inglesa y un ritmo marcado por ti y no por el horario de un autobús. Cuesta más que apuntarse a un grupo, pero es la diferencia entre ver un sitio y vivirlo de verdad, sin esperar a que otras veinte personas terminen sus fotos.",
      it: "Tutti i tour di questa pagina sono privati: il tuo veicolo, il tuo egittologo di lingua inglese e un ritmo che segue il tuo e non l'orario di un pullman. Costa più che unirsi a un gruppo, ma è la differenza tra vedere un sito e viverlo davvero, senza aspettare che altre venti persone finiscano le foto.",
      ru: "Все туры на этой странице — индивидуальные: ваш собственный транспорт, ваш египтолог со знанием английского и расписание, которое идёт в вашем темпе, а не по автобусному графику. Это дороже, чем присоединиться к группе, но это разница между «увидеть памятник» и по-настоящему его прожить — и не ждать, пока двадцать человек доснимут свои фото.",
      ar: "كل رحلة في هذه الصفحة خاصة: سيارتك وحدك، وعالِم مصريات يتحدّث الإنجليزية معك وحدك، وبرنامج يسير بإيقاعك لا بجدول أتوبيس. تكلفتها أعلى من الانضمام إلى مجموعة، لكنها الفرق بين أن ترى الموقع وأن تعيشه فعلًا — دون انتظار عشرين شخصًا حتى ينتهوا من التقاط صورهم.",
    },
  },

  "Can I customize one of these tours?": {
    question: {
      en: "Can I customize one of these tours?",
      fr: "Puis-je personnaliser l'un de ces circuits ?",
      es: "¿Puedo personalizar alguno de estos circuitos?",
      it: "Posso personalizzare uno di questi tour?",
      ru: "Можно ли изменить один из этих туров?",
      ar: "هل يمكنني تعديل إحدى هذه الرحلات؟",
    },
    answer: {
      en: "Yes. Every itinerary here is a starting point, not a fixed package — swap a destination, add an experience, or change the pace, and we'll rebuild it around you. If nothing here matches what you have in mind, use Customize Your Tour to start from a blank page instead.",
      fr: "Oui. Chaque itinéraire présenté ici est un point de départ, pas un forfait figé : changez une destination, ajoutez une expérience ou modifiez le rythme, et nous reconstruisons le circuit autour de vous. Si rien ne correspond à ce que vous avez en tête, passez par « Composer mon circuit » pour partir d'une page blanche.",
      es: "Sí. Cada itinerario de aquí es un punto de partida, no un paquete cerrado: cambia un destino, añade una experiencia o ajusta el ritmo y lo reconstruimos a tu medida. Si nada de esto encaja con lo que tienes en mente, usa «Diseña tu circuito» y empezamos desde cero.",
      it: "Sì. Ogni itinerario qui è un punto di partenza, non un pacchetto fisso: cambia una destinazione, aggiungi un'esperienza o modifica il ritmo e lo ricostruiamo intorno a te. Se nulla corrisponde a quello che hai in mente, usa «Crea il tuo tour» e partiamo da una pagina bianca.",
      ru: "Да. Любой маршрут здесь — отправная точка, а не фиксированный пакет: замените направление, добавьте впечатление или измените темп, и мы соберём поездку заново вокруг вас. Если ничего из этого не подходит, откройте «Составить свой тур» и начнём с чистого листа.",
      ar: "نعم. كل برنامج هنا نقطة بداية لا باقة جاهزة — بدّل وجهة، أو أضف تجربة، أو غيّر الإيقاع، وسنعيد بناء الرحلة حولك. وإن لم يناسبك أي منها، ابدأ من «صمّم رحلتك» بصفحة بيضاء.",
    },
  },

  "What's included in the price?": {
    question: {
      en: "What's included in the price?",
      fr: "Qu'est-ce qui est compris dans le prix ?",
      es: "¿Qué incluye el precio?",
      it: "Che cosa è incluso nel prezzo?",
      ru: "Что входит в стоимость?",
      ar: "ما الذي يشمله السعر؟",
    },
    answer: {
      en: "Every tour includes private transportation and a private guide as standard; most also include entrance fees and lunch. Flights, hotels, and your Egypt visa are handled separately so you can book accommodation and airfare on your own terms — each tour page lists exactly what's included and what isn't.",
      fr: "Chaque circuit comprend d'office le transport privé et un guide privé ; la plupart incluent aussi les droits d'entrée et le déjeuner. Les vols, les hôtels et votre visa pour l'Égypte restent à part, afin que vous réserviez hébergement et billets à vos conditions — chaque page de circuit détaille précisément ce qui est inclus et ce qui ne l'est pas.",
      es: "Todos los circuitos incluyen de serie transporte privado y guía privado; la mayoría añade además las entradas y el almuerzo. Los vuelos, los hoteles y el visado de Egipto van aparte, para que reserves alojamiento y billetes a tu manera: cada página de circuito detalla exactamente qué incluye y qué no.",
      it: "Ogni tour include di base il trasporto privato e una guida privata; la maggior parte comprende anche i biglietti d'ingresso e il pranzo. Voli, hotel e visto per l'Egitto restano separati, così prenoti alloggio e biglietti alle tue condizioni: ogni pagina di tour indica con precisione cosa è incluso e cosa no.",
      ru: "В каждый тур по умолчанию входят личный транспорт и персональный гид; в большинство — ещё и входные билеты и обед. Перелёты, отели и египетская виза оплачиваются отдельно, чтобы вы бронировали жильё и билеты на своих условиях — на странице каждого тура точно указано, что включено, а что нет.",
      ar: "كل رحلة تشمل أساسًا مواصلات خاصة ومرشدًا خاصًا، ومعظمها يشمل كذلك رسوم الدخول والغداء. أما الطيران والفنادق وتأشيرة مصر فتُرتَّب على حدة حتى تحجز إقامتك وتذاكرك بشروطك — وصفحة كل رحلة توضّح بدقة ما يشمله السعر وما لا يشمله.",
    },
  },
};

const experiences = {
  heroEyebrow: {
    en: "Extra Experiences",
    fr: "Expériences complémentaires",
    es: "Experiencias adicionales",
    it: "Esperienze extra",
    ru: "Дополнительные впечатления",
    ar: "تجارب إضافية",
  },
  heroTitle: {
    en: "Make Any Tour More Memorable",
    fr: "Rendez n'importe quel circuit plus mémorable",
    es: "Haz que cualquier circuito se recuerde más",
    it: "Rendi ogni tour più memorabile",
    ru: "Сделайте любой тур запоминающимся",
    ar: "اجعل أي رحلة أكثر رسوخًا في الذاكرة",
  },
  sectionTitle: {
    en: "Activities across Egypt, by destination",
    fr: "Des activités dans toute l'Égypte, par destination",
    es: "Actividades por todo Egipto, por destino",
    it: "Attività in tutto l'Egitto, per destinazione",
    ru: "Активности по всему Египту — по направлениям",
    ar: "أنشطة في أنحاء مصر، حسب الوجهة",
  },
  sectionDescription: {
    en: "Everything from a one-hour camel ride at Giza to two nights camping in the White Desert. Add one to a tour, or build a trip around it — every activity below is one we run ourselves.",
    fr: "De la balade à dos de chameau d'une heure à Gizeh aux deux nuits de bivouac dans le Désert Blanc. Ajoutez-en une à un circuit, ou construisez le voyage autour — toutes les activités ci-dessous, nous les opérons nous-mêmes.",
    es: "Desde un paseo en camello de una hora en Guiza hasta dos noches de acampada en el Desierto Blanco. Añade una a un circuito o monta el viaje a su alrededor: todas las actividades de abajo las operamos nosotros mismos.",
    it: "Da un giro in cammello di un'ora a Giza a due notti in campo nel Deserto Bianco. Aggiungine una a un tour, o costruisci il viaggio attorno: tutte le attività qui sotto le gestiamo noi.",
    ru: "От часовой прогулки на верблюде в Гизе до двух ночей в лагере в Белой пустыне. Добавьте активность к туру или постройте поездку вокруг неё — всё, что ниже, мы проводим сами.",
    ar: "من جولة على الجمل لمدة ساعة في الجيزة إلى ليلتين في مخيّم بالصحراء البيضاء. أضف نشاطًا إلى رحلتك أو ابنِ الرحلة حوله — كل نشاط بالأسفل ننظّمه بأنفسنا.",
  },
} satisfies Record<string, Phrase>;

const photoshoots = {
  heroEyebrow: {
    en: "Photoshoot Packages",
    fr: "Forfaits séance photo",
    es: "Paquetes de sesión de fotos",
    it: "Pacchetti fotografici",
    ru: "Пакеты фотосессий",
    ar: "باقات جلسات التصوير",
  },
  heroTitle: {
    en: "Travel, Professionally Captured",
    fr: "Votre voyage, capturé par des professionnels",
    es: "Tu viaje, capturado por profesionales",
    it: "Il tuo viaggio, catturato da professionisti",
    ru: "Ваше путешествие в профессиональных кадрах",
    ar: "رحلتك بعدسة محترفة",
  },
  sectionTitle: {
    en: "Our signature products",
    fr: "Nos produits signature",
    es: "Nuestros productos insignia",
    it: "I nostri prodotti d'autore",
    ru: "Наши фирменные предложения",
    ar: "منتجاتنا المميّزة",
  },
  sectionDescription: {
    en: "Egypt Eye began as a travel company — but our photography is what travelers remember most. Every package includes a private photographer and professional editing.",
    fr: "Egypt Eye a commencé comme une agence de voyage — mais ce dont les voyageurs se souviennent le plus, c'est de nos photos. Chaque forfait comprend un photographe privé et une retouche professionnelle.",
    es: "Egypt Eye empezó como una empresa de viajes, pero lo que más recuerdan los viajeros son nuestras fotos. Cada paquete incluye un fotógrafo privado y edición profesional.",
    it: "Egypt Eye è nata come agenzia di viaggi, ma quello che i viaggiatori ricordano di più sono le nostre foto. Ogni pacchetto include un fotografo privato e una post-produzione professionale.",
    ru: "Egypt Eye начинался как туристическая компания — но больше всего путешественники запоминают наши фотографии. В каждый пакет входят личный фотограф и профессиональная обработка.",
    ar: "بدأت Egypt Eye كشركة سفر — لكن ما يبقى في ذاكرة المسافرين أكثر هو صورنا. كل باقة تشمل مصوّرًا خاصًا ومعالجة احترافية للصور.",
  },
} satisfies Record<string, Phrase>;

const signatureExperiences = {
  heroEyebrow: {
    en: "Signature Experiences",
    fr: "Expériences signature",
    es: "Experiencias exclusivas",
    it: "Esperienze esclusive",
    ru: "Особые впечатления",
    ar: "تجارب مميّزة",
  },
  heroTitle: {
    en: "Built Around How You Want to Feel — Not Just Where You Want to Go",
    fr: "Conçues autour de ce que vous voulez ressentir — pas seulement de l'endroit où vous voulez aller",
    es: "Diseñadas en torno a cómo quieres sentirte, no solo a dónde quieres ir",
    it: "Costruite attorno a come vuoi sentirti, non solo a dove vuoi andare",
    ru: "Собраны вокруг того, что вы хотите почувствовать, а не только куда поехать",
    ar: "مصمَّمة حول الشعور الذي تبحث عنه، لا حول الوجهة وحدها",
  },
  heroDescription: {
    en: "A different kind of product from our tours. Each Signature Experience is designed around a specific person and a specific need — the destination is part of the solution, not the whole plan.",
    fr: "Un produit différent de nos circuits. Chaque Expérience signature est conçue autour d'une personne précise et d'un besoin précis — la destination fait partie de la réponse, pas de tout le plan.",
    es: "Un producto distinto de nuestros circuitos. Cada Experiencia exclusiva se diseña en torno a una persona concreta y una necesidad concreta: el destino es parte de la respuesta, no el plan entero.",
    it: "Un prodotto diverso dai nostri tour. Ogni Esperienza esclusiva è costruita attorno a una persona precisa e a un'esigenza precisa: la destinazione è parte della risposta, non tutto il progetto.",
    ru: "Формат, отличный от наших туров. Каждое «Особое впечатление» собрано вокруг конкретного человека и конкретной задачи — направление здесь часть ответа, а не весь план.",
    ar: "منتج مختلف عن رحلاتنا. كل تجربة مميّزة مصمَّمة حول شخص بعينه واحتياج بعينه — والوجهة جزء من الإجابة لا الخطة كلها.",
  },
  collectionEyebrow: {
    en: "The Collection",
    fr: "La collection",
    es: "La colección",
    it: "La collezione",
    ru: "Коллекция",
    ar: "المجموعة",
  },
  collectionTitleSingular: {
    en: "Our first Signature Experience",
    fr: "Notre première Expérience signature",
    es: "Nuestra primera Experiencia exclusiva",
    it: "La nostra prima Esperienza esclusiva",
    ru: "Наше первое «Особое впечатление»",
    ar: "أول تجربة مميّزة لدينا",
  },
  collectionTitlePlural: {
    en: "Signature Experiences",
    fr: "Expériences signature",
    es: "Experiencias exclusivas",
    it: "Esperienze esclusive",
    ru: "Особые впечатления",
    ar: "تجارب مميّزة",
  },
  collectionDescription: {
    en: "Each one starts with a person, not a place — read through and see which one was built with you in mind.",
    fr: "Chacune commence par une personne, pas par un lieu — parcourez-les et voyez laquelle a été pensée pour vous.",
    es: "Cada una empieza por una persona, no por un lugar: léelas y descubre cuál se creó pensando en ti.",
    it: "Ognuna parte da una persona, non da un luogo: leggile e scopri quale è stata pensata per te.",
    ru: "Каждое начинается с человека, а не с места — прочитайте и найдите то, что придумано именно для вас.",
    ar: "كل واحدة تبدأ من إنسان لا من مكان — اقرأها واكتشف أيّها صُمِّم من أجلك.",
  },
} satisfies Record<string, Phrase>;

const exploreEgypt = {
  heroEyebrow: {
    en: "Explore Egypt",
    fr: "Découvrir l'Égypte",
    es: "Descubre Egipto",
    it: "Scopri l'Egitto",
    ru: "Откройте Египет",
    ar: "اكتشف مصر",
  },
  heroTitle: {
    en: "One Country, Thirteen Unforgettable Places to Start",
    fr: "Un pays, treize lieux inoubliables pour commencer",
    es: "Un país, trece lugares inolvidables por los que empezar",
    it: "Un paese, tredici luoghi indimenticabili da cui partire",
    ru: "Одна страна и тринадцать мест, с которых стоит начать",
    ar: "بلد واحد وثلاثة عشر مكانًا لا يُنسى للبداية",
  },
  heroDescription: {
    en: "Tap a destination on the map to see the real tours, experiences, photoshoots, and stories we offer there — then add whatever catches your eye to My Journey.",
    fr: "Touchez une destination sur la carte pour voir les circuits, expériences, séances photo et récits que nous y proposons réellement — puis ajoutez ce qui vous plaît à « Mon voyage ».",
    es: "Toca un destino en el mapa para ver los circuitos, experiencias, sesiones de fotos e historias que ofrecemos realmente allí, y añade a «Mi viaje» todo lo que te llame la atención.",
    it: "Tocca una destinazione sulla mappa per vedere i tour, le esperienze, i servizi fotografici e i racconti che offriamo davvero lì, poi aggiungi al «Mio viaggio» tutto ciò che ti colpisce.",
    ru: "Нажмите на точку на карте, чтобы увидеть туры, впечатления, фотосессии и истории, которые у нас там действительно есть, — и добавьте понравившееся в «Мою поездку».",
    ar: "اضغط على وجهة في الخريطة لترى الرحلات والتجارب وجلسات التصوير والمقالات التي نقدّمها هناك فعلًا — ثم أضف ما يلفتك إلى «رحلتي».",
  },
} satisfies Record<string, Phrase>;

const stories = {
  heroEyebrow: {
    en: "Stories",
    fr: "Magazine",
    es: "Revista",
    it: "Racconti",
    ru: "Истории",
    ar: "مقالات",
  },
  heroTitle: {
    en: "The Journal",
    fr: "Le journal",
    es: "El diario",
    it: "Il diario",
    ru: "Журнал",
    ar: "المجلّة",
  },
  heroDescription: {
    en: "Editorial travel writing from Egypt Eye — the history, the places, and the rare moments worth building a trip around.",
    fr: "Les écrits de voyage d'Egypt Eye — l'histoire, les lieux et les moments rares autour desquels construire un séjour.",
    es: "Textos de viaje de Egypt Eye: la historia, los lugares y los momentos poco frecuentes que merecen un viaje.",
    it: "Scritti di viaggio di Egypt Eye: la storia, i luoghi e i momenti rari attorno ai quali vale la pena costruire un viaggio.",
    ru: "Путевые тексты Egypt Eye: история, места и редкие моменты, ради которых стоит спланировать поездку.",
    ar: "كتابات سفر من Egypt Eye — التاريخ والأماكن واللحظات النادرة التي تستحق أن تُبنى حولها رحلة.",
  },
  emptyStateText: {
    en: "Stories are coming soon.",
    fr: "Les récits arrivent bientôt.",
    es: "Las historias llegan pronto.",
    it: "I racconti arrivano presto.",
    ru: "Истории скоро появятся.",
    ar: "المقالات في الطريق قريبًا.",
  },
  moreStoriesEyebrow: {
    en: "More Stories",
    fr: "Plus de récits",
    es: "Más historias",
    it: "Altri racconti",
    ru: "Ещё истории",
    ar: "مقالات أخرى",
  },
  moreStoriesTitle: {
    en: "Continue Exploring",
    fr: "Poursuivre la lecture",
    es: "Sigue explorando",
    it: "Continua a esplorare",
    ru: "Продолжить чтение",
    ar: "واصل الاستكشاف",
  },
  readStoryLabel: {
    en: "Read the story",
    fr: "Lire le récit",
    es: "Leer la historia",
    it: "Leggi il racconto",
    ru: "Читать историю",
    ar: "اقرأ المقال",
  },
} satisfies Record<string, Phrase>;

/**
 * The listing-page copy in the reader's language.
 *
 * Applied in `getListingPages` so every one of the seven pages that reads this
 * singleton is translated at the same boundary the rest of the catalogue is.
 */
export function localizedListingPages(
  pages: ResolvedListingPages,
  locale: Locale
): ResolvedListingPages {
  if (locale === DEFAULT_LOCALE) return pages;

  return {
    tours: {
      heroEyebrow: say(pages.tours.heroEyebrow, tours.heroEyebrow, locale),
      heroTitle: say(pages.tours.heroTitle, tours.heroTitle, locale),
      sectionTitleTemplate: say(pages.tours.sectionTitleTemplate, tours.sectionTitleTemplate, locale),
      sectionDescription: say(pages.tours.sectionDescription, tours.sectionDescription, locale),
      faqs: pages.tours.faqs.map((faq) => {
        const entry = tourFaqs[faq.question];
        return {
          question: say(faq.question, entry?.question, locale),
          answer: say(faq.answer, entry?.answer, locale),
        };
      }),
    },
    experiences: {
      heroEyebrow: say(pages.experiences.heroEyebrow, experiences.heroEyebrow, locale),
      heroTitle: say(pages.experiences.heroTitle, experiences.heroTitle, locale),
      sectionTitle: say(pages.experiences.sectionTitle, experiences.sectionTitle, locale),
      sectionDescription: say(pages.experiences.sectionDescription, experiences.sectionDescription, locale),
    },
    photoshoots: {
      heroEyebrow: say(pages.photoshoots.heroEyebrow, photoshoots.heroEyebrow, locale),
      heroTitle: say(pages.photoshoots.heroTitle, photoshoots.heroTitle, locale),
      sectionTitle: say(pages.photoshoots.sectionTitle, photoshoots.sectionTitle, locale),
      sectionDescription: say(pages.photoshoots.sectionDescription, photoshoots.sectionDescription, locale),
    },
    signatureExperiences: {
      heroEyebrow: say(pages.signatureExperiences.heroEyebrow, signatureExperiences.heroEyebrow, locale),
      heroTitle: say(pages.signatureExperiences.heroTitle, signatureExperiences.heroTitle, locale),
      heroDescription: say(pages.signatureExperiences.heroDescription, signatureExperiences.heroDescription, locale),
      collectionEyebrow: say(pages.signatureExperiences.collectionEyebrow, signatureExperiences.collectionEyebrow, locale),
      collectionTitleSingular: say(
        pages.signatureExperiences.collectionTitleSingular,
        signatureExperiences.collectionTitleSingular,
        locale
      ),
      collectionTitlePlural: say(
        pages.signatureExperiences.collectionTitlePlural,
        signatureExperiences.collectionTitlePlural,
        locale
      ),
      collectionDescription: say(
        pages.signatureExperiences.collectionDescription,
        signatureExperiences.collectionDescription,
        locale
      ),
    },
    exploreEgypt: {
      heroEyebrow: say(pages.exploreEgypt.heroEyebrow, exploreEgypt.heroEyebrow, locale),
      heroTitle: say(pages.exploreEgypt.heroTitle, exploreEgypt.heroTitle, locale),
      heroDescription: say(pages.exploreEgypt.heroDescription, exploreEgypt.heroDescription, locale),
    },
    stories: {
      heroEyebrow: say(pages.stories.heroEyebrow, stories.heroEyebrow, locale),
      heroTitle: say(pages.stories.heroTitle, stories.heroTitle, locale),
      heroDescription: say(pages.stories.heroDescription, stories.heroDescription, locale),
      emptyStateText: say(pages.stories.emptyStateText, stories.emptyStateText, locale),
      moreStoriesEyebrow: say(pages.stories.moreStoriesEyebrow, stories.moreStoriesEyebrow, locale),
      moreStoriesTitle: say(pages.stories.moreStoriesTitle, stories.moreStoriesTitle, locale),
      readStoryLabel: say(pages.stories.readStoryLabel, stories.readStoryLabel, locale),
    },
  };
}
