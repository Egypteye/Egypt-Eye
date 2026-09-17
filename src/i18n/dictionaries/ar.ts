import type { Dictionary } from "./en";

// Arabic — Modern Standard, pitched at Gulf and regional travelers rather
// than a literal rendering of the English. A few deliberate choices:
// "رحلات" for tours rather than the calque "جولات", "جلسة تصوير" for a
// photoshoot because that is what people actually book it as, and the
// second-person plural throughout, which reads as courteous in Gulf usage
// without tipping into the stiff formality of contract Arabic.
export const ar: Dictionary = {
  language: {
    label: "اللغة",
    choose: "اختر لغتك",
    current: "اللغة الحالية",
  },

  nav: {
    more: "المزيد",
    toggleMenu: "فتح القائمة",
    myJourney: "رحلتي",
    planMyTrip: "خطّط رحلتك",
    account: "حسابي",
    skipToContent: "تخطّي إلى المحتوى",
    byHref: {
      "/": "الرئيسية",
      "/explore-egypt": "اكتشف مصر",
      "/signature-experiences": "تجارب مميّزة",
      "/tours": "الرحلات الأكثر طلبًا",
      "/experiences": "تجارب إضافية",
      "/photoshoots": "جلسات تصوير مميّزة",
      "/transfers": "التنقّلات",
      "/hotel-deals": "عروض الفنادق",
      "/customize": "صمّم رحلتك",
      "/stories": "مقالات",
      "/partners": "كن شريكًا",
      "/testimonials": "آراء المسافرين",
      "/about": "من نحن",
    },
  },

  footer: {
    explore: "استكشف",
    contact: "تواصل معنا",
    follow: "تابعنا",
    partnerWithUs: "كن شريكًا",
    travelAgents: "وكلاء السفر",
    affiliateProgram: "برنامج العمولة",
    creators: "صنّاع المحتوى",
    travelerReviews: "آراء المسافرين",
    privacy: "سياسة الخصوصية",
    terms: "شروط الخدمة",
    rightsReserved: "جميع الحقوق محفوظة.",
  },

  common: {
    bookOnWhatsApp: "احجز عبر واتساب",
    emailEnquiry: "أرسل استفسارًا",
    addToJourney: "أضف إلى رحلتي",
    inMyJourney: "في رحلتي",
    viewTour: "عرض الرحلة",
    viewDetails: "عرض التفاصيل",
    seeDetails: "التفاصيل",
    seeFullExperience: "اطّلع على التجربة كاملة",
    enquireForPricing: "استفسر عن السعر",
    perPerson: "للفرد",
    from: "تبدأ من",
    designYourTour: "صمّم رحلة أحلامك",
    readyHeading: "جاهز لتكتب حكايتك في مصر؟",
    readyBody: "أخبرنا بما يدور في ذهنك وسنبني لك برنامجًا خاصًا حوله.",
    backToAllTours: "العودة إلى كل الرحلات",
    backToAllExperiences: "العودة إلى كل التجارب",
    youMightAlsoLike: "قد يعجبك أيضًا",
    moreExperiences: "تجارب أخرى يمكنك إضافتها",
    gallery: "معرض الصور",
    aboutThisTour: "عن هذه الرحلة",
    whatsIncluded: "يشمل",
    notIncluded: "لا يشمل",
    itinerary: "البرنامج",
    highlights: "أبرز ما فيها",
    goodToKnow: "معلومات تهمّك",
    availableOn: "متاحة ضمن",
    whereYoullGo: "أين ستذهب",
    day: "اليوم",
  },

  physical: {
    label: "مستوى الجهد",
    easy: "سهل",
    moderate: "متوسط",
    active: "نشِط",
    challenging: "شاق",
  },

  reviews: {
    chip: "تقييم التجربة",
    eyebrow: "حكايات المسافرين",
    heading: "ماذا يقول مسافرونا",
    intro:
      "كل رأي هنا من رحلة حقيقية مع Egypt Eye — لا اقتباسات مُختلقة أو توضيحية. جميعها في هذه الصفحة؛ استخدم عوامل التصفية لعرض فئة بعينها أو رحلة أو جلسة تصوير أو خدمة محدّدة.",
    all: "كل الآراء",
    photoshoots: "جلسات التصوير",
    tours: "الرحلات",
    services: "الخدمات",
    filterByCategory: "تصفية الآراء حسب الفئة",
    jumpTo: "انتقل إلى",
    anyProduct: "أي رحلة أو جلسة تصوير أو خدمة",
    anyInCategory: "كل ما في هذه الفئة",
    clear: "إلغاء التصفية",
    showingAll: "كل الآراء، بما فيها الأحدث",
    showingProduct: "آراء عن {product}",
    showingCategory: "كل آراء {category}",
    none: "لا توجد آراء هنا بعد.",
    seeAll: "عرض كل الآراء",
    onTheWay: "الآراء في طريقها إلينا — عد قريبًا، أو",
    startPlanning: "ابدأ بتخطيط حكايتك في مصر",
  },

  tours: {
    filterHeading: "تصفية الرحلات",
    searchPlaceholder: "اسم الرحلة أو الوجهة...",
    tripType: "نوع الرحلة",
    all: "كل الرحلات",
    oneDay: "رحلات اليوم الواحد",
    multiDay: "رحلات متعدّدة الأيام",
    jordan: "مصر والأردن",
    matchCount: "{count} رحلة مطابقة",
    noMatches: "لا توجد رحلات مطابقة لهذا البحث.",
    clearFilters: "مسح عوامل التصفية",
  },

  forms: {
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    message: "رسالتك",
    send: "إرسال",
    sending: "جارٍ الإرسال…",
    sent: "شكرًا لك — سنتواصل معك قريبًا.",
    error: "حدث خطأ ما. حاول مرة أخرى أو راسلنا على واتساب.",
    required: "مطلوب",
    optional: "اختياري",
  },

  errors: {
    notFoundTitle: "لم نتمكّن من العثور على هذه الصفحة",
    notFoundBody:
      "الصفحة التي تبحث عنها انتقلت أو لم تكن موجودة أصلًا. جرّب تصفّح الرحلات أو العودة إلى الصفحة الرئيسية.",
    backHome: "العودة إلى الرئيسية",
    browseTours: "تصفّح الرحلات",
    somethingWrong: "حدث خطأ ما",
    somethingWrongBody: "عذرًا، لم يتم التحميل. من فضلك حاول مرة أخرى.",
    tryAgain: "حاول مرة أخرى",
  },

  seo: {
    homeTitle: "رحلات خاصة وجلسات تصوير وتجارب في مصر",
    localeSuffix: "",
  },
};
