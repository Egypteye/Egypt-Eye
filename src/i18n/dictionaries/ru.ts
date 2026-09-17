import type { Dictionary } from "./en";

// Russian — "вы" throughout, the register a Russian traveler expects from a
// tour operator. Idiomatic rather than literal: "экскурсии" for day trips
// and "туры" for multi-day, "фотосессия" (the word actually used, not a
// calque of "photoshoot"), and "Готовы написать свою историю" keeps the
// English line's warmth without the awkwardness of a direct rendering.
export const ru: Dictionary = {
  language: {
    label: "Язык",
    choose: "Выберите язык",
    current: "Текущий язык",
  },

  nav: {
    more: "Ещё",
    toggleMenu: "Открыть меню",
    myJourney: "Моя поездка",
    planMyTrip: "Спланировать поездку",
    account: "Аккаунт",
    skipToContent: "Перейти к содержанию",
    byHref: {
      "/": "Главная",
      "/explore-egypt": "Откройте Египет",
      "/signature-experiences": "Особые впечатления",
      "/tours": "Популярные туры",
      "/experiences": "Дополнительные впечатления",
      "/photoshoots": "Фотосессии",
      "/transfers": "Трансферы",
      "/hotel-deals": "Отели со скидкой",
      "/customize": "Составить свой тур",
      "/stories": "Истории",
      "/partners": "Партнёрам",
      "/testimonials": "Отзывы путешественников",
      "/about": "О нас",
    },
  },

  footer: {
    explore: "Разделы",
    contact: "Контакты",
    follow: "Мы в соцсетях",
    partnerWithUs: "Партнёрам",
    travelAgents: "Турагентствам",
    affiliateProgram: "Партнёрская программа",
    creators: "Блогерам и авторам",
    travelerReviews: "Отзывы путешественников",
    privacy: "Политика конфиденциальности",
    terms: "Условия использования",
    rightsReserved: "Все права защищены.",
  },

  common: {
    bookOnWhatsApp: "Забронировать в WhatsApp",
    emailEnquiry: "Отправить запрос",
    addToJourney: "Добавить в мою поездку",
    inMyJourney: "В моей поездке",
    viewTour: "Смотреть тур",
    viewDetails: "Подробнее",
    seeDetails: "Подробности",
    seeFullExperience: "Посмотреть впечатление целиком",
    enquireForPricing: "Узнать цену",
    perPerson: "с человека",
    from: "от",
    designYourTour: "Составить тур мечты",
    readyHeading: "Готовы написать свою историю о Египте?",
    readyBody: "Расскажите, что вы задумали, — и мы построим вокруг этого индивидуальный маршрут.",
    backToAllTours: "Ко всем турам",
    backToAllExperiences: "Ко всем впечатлениям",
    youMightAlsoLike: "Вам также может понравиться",
    moreExperiences: "Ещё впечатления, которые можно добавить",
    gallery: "Галерея",
    aboutThisTour: "Об этом туре",
    whatsIncluded: "Включено",
    notIncluded: "Не включено",
    itinerary: "Маршрут по дням",
    highlights: "Главное",
    goodToKnow: "Полезно знать",
    availableOn: "Доступно в",
    whereYoullGo: "Ваш маршрут",
    day: "День",
  },

  physical: {
    label: "Уровень нагрузки",
    easy: "Лёгкий",
    moderate: "Средний",
    active: "Активный",
    challenging: "Высокий",
  },

  reviews: {
    chip: "Оценка впечатления",
    eyebrow: "Истории путешественников",
    heading: "Что говорят наши путешественники",
    intro:
      "Каждый отзыв здесь — из настоящей поездки с Egypt Eye, без выдуманных или примерных цитат. Все они на этой странице; используйте фильтры, чтобы выбрать категорию либо конкретный тур, фотосессию или услугу.",
    all: "Все отзывы",
    photoshoots: "Фотосессии",
    tours: "Туры",
    services: "Услуги",
    filterByCategory: "Фильтровать отзывы по категории",
    jumpTo: "Перейти к",
    anyProduct: "Любой тур, фотосессия или услуга",
    anyInCategory: "Всё в этой категории",
    clear: "Сбросить",
    showingAll: "Все отзывы, включая самые новые",
    showingProduct: "Отзывы о «{product}»",
    showingCategory: "Все отзывы: {category}",
    none: "Здесь пока нет отзывов.",
    seeAll: "Смотреть все отзывы",
    onTheWay: "Отзывы уже в пути — загляните позже или",
    startPlanning: "начните планировать свою поездку в Египет",
  },

  tours: {
    filterHeading: "Фильтр туров",
    searchPlaceholder: "Название тура или направление...",
    tripType: "Тип поездки",
    all: "Все туры",
    oneDay: "Однодневные экскурсии",
    multiDay: "Многодневные туры",
    jordan: "Египет и Иордания",
    matchCount: "Найдено туров: {count}",
    noMatches: "По этому запросу туров не найдено.",
    clearFilters: "Сбросить фильтры",
  },

  forms: {
    name: "Имя",
    email: "Эл. почта",
    phone: "Телефон",
    message: "Сообщение",
    send: "Отправить",
    sending: "Отправляем…",
    sent: "Спасибо — мы скоро свяжемся с вами.",
    error: "Что-то пошло не так. Попробуйте ещё раз или напишите нам в WhatsApp.",
    required: "Обязательно",
    optional: "необязательно",
  },

  errors: {
    notFoundTitle: "Мы не нашли эту страницу",
    notFoundBody:
      "Страница, которую вы ищете, переехала или никогда не существовала. Посмотрите туры или вернитесь на главную.",
    backHome: "На главную",
    browseTours: "Смотреть туры",
    somethingWrong: "Что-то пошло не так",
    somethingWrongBody: "Извините, страница не загрузилась. Попробуйте ещё раз.",
    tryAgain: "Повторить",
  },

  seo: {
    homeTitle: "Индивидуальные туры, фотосессии и впечатления в Египте",
    localeSuffix: "",
  },
};
