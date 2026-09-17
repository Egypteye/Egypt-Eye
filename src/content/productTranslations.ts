import { DEFAULT_LOCALE, type Locale } from "@/i18n/locales";
import { localized } from "@/i18n/localizeContent";
import { transfersPage } from "./transfers";
import type { TransferCategoryInfo } from "./types";

/**
 * Translations for the products travelers actually land on.
 *
 * The per-locale CMS layer (see i18n/localizeContent.ts) reads a translation
 * off the document itself — `titleTranslations`, `taglineTranslations`,
 * `descriptionTranslations` — which is the right home for anything an editor
 * writes in Studio. These live here instead for two reasons:
 *
 *   1. The catalogue files are large (tours.ts alone is 3,500 lines), and
 *      inlining six languages beside every English string would triple them
 *      and make an ordinary price edit hard to read in a diff.
 *   2. Translation is its own job. Keeping it in one file means the whole
 *      translated surface can be reviewed, extended, or handed to a native
 *      speaker without touching the catalogue at all.
 *
 * Coverage is deliberately partial: the fourteen featured tours, every
 * photoshoot, and every transfer service — what a visitor arriving in their
 * own language is most likely to open. Anything not listed falls back to
 * English, which is a working page, not a broken one. A translation entered
 * in Studio always wins over the value here (see `withLocalTranslations` in
 * sanity/fetchers.ts), so this is a floor, never a ceiling.
 */

/** English is never stored — it stays in the catalogue's own field. */
export type TranslatedField = Partial<Record<Exclude<Locale, "en">, string>>;

export type ProductTranslation = {
  title?: TranslatedField;
  tagline?: TranslatedField;
  description?: TranslatedField;
};

export const tourTranslations: Record<string, ProductTranslation> = {
  "cairo-giza-nile-cruise-signature-trip": {
    title: {
      de: "Kairo, Gizeh & Nilkreuzfahrt — die Signature-Reise",
      fr: "Le Caire, Gizeh et croisière sur le Nil — le circuit signature",
      es: "El Cairo, Guiza y crucero por el Nilo: el circuito insignia",
      it: "Il Cairo, Giza e crociera sul Nilo: il tour d'autore",
      ru: "Каир, Гиза и круиз по Нилу — фирменный тур",
      ar: "القاهرة والجيزة ورحلة نيلية — الرحلة المميّزة",
    },
    tagline: {
      de: "Kairo und Gizeh, danach eine private Nilkreuzfahrt von Assuan nach Luxor.",
      fr: "Le Caire et Gizeh, puis une croisière privée sur le Nil d'Assouan à Louxor.",
      es: "El Cairo y Guiza, y después un crucero privado por el Nilo de Asuán a Luxor.",
      it: "Il Cairo e Giza, poi una crociera privata sul Nilo da Assuan a Luxor.",
      ru: "Каир и Гиза, а затем частный круиз по Нилу из Асуана в Луксор.",
      ar: "القاهرة والجيزة، ثم رحلة نيلية خاصة من أسوان إلى الأقصر.",
    },
  },

  "1-day-giza-tour": {
    title: {
      de: "Gizeh an einem Tag: die Wunder der Antike",
      fr: "Gizeh en une journée : à la rencontre des merveilles antiques",
      es: "Guiza en un día: las maravillas del mundo antiguo",
      it: "Giza in un giorno: le meraviglie dell'antichità",
      ru: "Гиза за один день: чудеса Древнего Египта",
      ar: "الجيزة في يوم واحد: بين عجائب العالم القديم",
    },
    tagline: {
      de: "Pyramiden, Sphinx und ein kostenloses privates Fotoshooting — alles an einem Tag.",
      fr: "Pyramides, Sphinx et une séance photo privée offerte — le tout en une journée.",
      es: "Pirámides, Esfinge y una sesión de fotos privada gratuita, todo en un día.",
      it: "Piramidi, Sfinge e un servizio fotografico privato in omaggio, tutto in una giornata.",
      ru: "Пирамиды, Сфинкс и бесплатная частная фотосессия — всё за один день.",
      ar: "الأهرامات وأبو الهول وجلسة تصوير خاصة مجانية — كل ذلك في يوم واحد.",
    },
  },

  "red-sea-relaxation": {
    title: {
      de: "Ägypten zum Entspannen: das Rote Meer",
      fr: "L'Égypte détente : la mer Rouge",
      es: "Egipto en modo relax: el mar Rojo",
      it: "Egitto in modalità relax: il Mar Rosso",
      ru: "Египет в режиме отдыха: Красное море",
      ar: "مصر على مهل: البحر الأحمر",
    },
    tagline: {
      de: "Türkisfarbenes Wasser, weißer Sand und nichts auf dem Programm.",
      fr: "Eau turquoise, sable blanc et rien au programme.",
      es: "Agua turquesa, arena blanca y nada en la agenda.",
      it: "Acqua turchese, sabbia bianca e niente in programma.",
      ru: "Бирюзовая вода, белый песок и ни одного пункта в плане.",
      ar: "مياه فيروزية ورمال بيضاء ولا شيء على جدول اليوم.",
    },
  },

  "siwa-oasis": {
    title: {
      de: "Wüstenträume: die Oase Siwa",
      fr: "Rêves du désert : l'oasis de Siwa",
      es: "Sueños del desierto: el oasis de Siwa",
      it: "Sogni nel deserto: l'oasi di Siwa",
      ru: "Мечты пустыни: оазис Сива",
      ar: "أحلام الصحراء: واحة سيوة",
    },
    tagline: {
      de: "Ägyptens abgelegenste Oase — Salzseen, Dünen und ein Himmel voller Sterne.",
      fr: "L'oasis la plus isolée d'Égypte — lacs de sel, dunes et ciels étoilés.",
      es: "El oasis más remoto de Egipto: lagos salados, dunas y cielos estrellados.",
      it: "L'oasi più remota d'Egitto: laghi salati, dune e cieli stellati.",
      ru: "Самый отдалённый оазис Египта — солёные озёра, дюны и звёздное небо.",
      ar: "أبعد واحات مصر — بحيرات ملحية وكثبان وسماء مرصّعة بالنجوم.",
    },
  },

  "3-days-jordan": {
    title: {
      de: "3 Tage durch Jordaniens Wunder",
      fr: "3 jours à la découverte des merveilles de Jordanie",
      es: "3 días descubriendo las maravillas de Jordania",
      it: "3 giorni tra le meraviglie della Giordania",
      ru: "3 дня среди чудес Иордании",
      ar: "3 أيام بين عجائب الأردن",
    },
    tagline: {
      de: "Wadi Rum, Petra und das Tote Meer in einer einzigen privaten Reiseroute.",
      fr: "Le Wadi Rum, Pétra et la mer Morte en un seul itinéraire privé.",
      es: "Wadi Rum, Petra y el mar Muerto en un único itinerario privado.",
      it: "Wadi Rum, Petra e il Mar Morto in un unico itinerario privato.",
      ru: "Вади-Рам, Петра и Мёртвое море в одном частном маршруте.",
      ar: "وادي رم والبتراء والبحر الميت في برنامج خاص واحد.",
    },
  },

  "6-day-cairo-giza-luxor": {
    title: {
      de: "6 Tage: Kairo, Gizeh & Luxor",
      fr: "6 jours : Le Caire, Gizeh et Louxor",
      es: "6 días: El Cairo, Guiza y Luxor",
      it: "6 giorni: Il Cairo, Giza e Luxor",
      ru: "6 дней: Каир, Гиза и Луксор",
      ar: "6 أيام: القاهرة والجيزة والأقصر",
    },
    tagline: {
      de: "Pyramiden, Tempel und das Tal der Könige.",
      fr: "Pyramides, temples et la Vallée des Rois.",
      es: "Pirámides, templos y el Valle de los Reyes.",
      it: "Piramidi, templi e la Valle dei Re.",
      ru: "Пирамиды, храмы и Долина царей.",
      ar: "الأهرامات والمعابد ووادي الملوك.",
    },
  },

  "8-day-essential-egypt-nile-cruise": {
    title: {
      de: "8 Tage Ägypten kompakt + 5-tägige Nilkreuzfahrt",
      fr: "8 jours d'Égypte essentielle + croisière de 5 jours sur le Nil",
      es: "8 días de Egipto esencial + crucero de 5 días por el Nilo",
      it: "8 giorni di Egitto essenziale + crociera di 5 giorni sul Nilo",
      ru: "8 дней главного Египта + 5-дневный круиз по Нилу",
      ar: "8 أيام في قلب مصر + رحلة نيلية 5 أيام",
    },
    tagline: {
      de: "Kairo und Gizeh, danach fünf Tage auf dem Nil in Fünf-Sterne-Komfort.",
      fr: "Le Caire et Gizeh, puis cinq jours de croisière sur le Nil dans un confort 5 étoiles.",
      es: "El Cairo y Guiza, y después cinco días navegando el Nilo con confort de 5 estrellas.",
      it: "Il Cairo e Giza, poi cinque giorni di navigazione sul Nilo con comfort a 5 stelle.",
      ru: "Каир и Гиза, а затем пять дней по Нилу в комфорте пяти звёзд.",
      ar: "القاهرة والجيزة، ثم خمسة أيام على النيل بمستوى خمس نجوم.",
    },
  },

  "10-day-private-luxurious-trip": {
    title: {
      de: "10 Tage privat und luxuriös",
      fr: "10 jours en privé et en toute élégance",
      es: "10 días privados y de lujo",
      it: "10 giorni privati e di lusso",
      ru: "10 дней: частный люксовый тур",
      ar: "10 أيام خاصة وفاخرة",
    },
    tagline: {
      de: "Das ganze Land, privat, luxuriös und ohne Hetze.",
      fr: "Le pays entier, en privé, à un rythme paisible et cinq étoiles.",
      es: "El país entero, en privado, sin prisa y con cinco estrellas.",
      it: "Tutto il paese, in privato, senza fretta e a cinque stelle.",
      ru: "Вся страна — индивидуально, неспешно и на уровне пяти звёзд.",
      ar: "البلد كلها، بخصوصية تامة وإيقاع هادئ ومستوى خمس نجوم.",
    },
  },

  "jordan-5-day-highlights": {
    title: {
      de: "5 Tage Jordanien: Amman, Petra, Wadi Rum & das Tote Meer",
      fr: "5 jours en Jordanie : Amman, Pétra, le Wadi Rum et la mer Morte",
      es: "5 días en Jordania: Amán, Petra, Wadi Rum y el mar Muerto",
      it: "5 giorni in Giordania: Amman, Petra, Wadi Rum e il Mar Morto",
      ru: "5 дней в Иордании: Амман, Петра, Вади-Рам и Мёртвое море",
      ar: "5 أيام في الأردن: عمّان والبتراء ووادي رم والبحر الميت",
    },
    tagline: {
      de: "Jordaniens vier große Ziele — in Ruhe statt im Eiltempo.",
      fr: "Les quatre grands sites de Jordanie, à un rythme juste plutôt qu'au pas de course.",
      es: "Los cuatro grandes destinos de Jordania, con tiempo suficiente y sin prisas.",
      it: "Le quattro tappe principali della Giordania, con i tempi giusti invece che di corsa.",
      ru: "Четыре главные точки Иордании — в спокойном ритме, а не бегом.",
      ar: "محطات الأردن الأربع الكبرى بإيقاع مريح لا متعجّل.",
    },
  },

  "hot-air-balloon-luxor-east-bank-combo": {
    title: {
      de: "Ballonfahrt bei Sonnenaufgang & Luxors Ostufer",
      fr: "Montgolfière au lever du soleil et rive est de Louxor",
      es: "Globo al amanecer y orilla este de Luxor",
      it: "Mongolfiera all'alba e riva est di Luxor",
      ru: "Полёт на шаре на рассвете и Восточный берег Луксора",
      ar: "منطاد عند الشروق وضفة الأقصر الشرقية",
    },
    tagline: {
      de: "Das Niltal bei Morgengrauen von oben, danach die Tempel des Ostufers auf festem Boden.",
      fr: "La vallée du Nil vue d'en haut à l'aube, puis les temples de la rive est une fois redescendu.",
      es: "El valle del Nilo desde el aire al amanecer y, ya en tierra, los templos de la orilla este.",
      it: "La valle del Nilo dall'alto all'alba, poi i templi della riva est una volta a terra.",
      ru: "Долина Нила с высоты на рассвете, а после приземления — храмы Восточного берега.",
      ar: "وادي النيل من الأعلى عند الفجر، ثم معابد الضفة الشرقية بعد الهبوط.",
    },
  },

  "12-day-egypt-grand-tour": {
    title: {
      de: "12 Tage große Ägypten-Rundreise",
      fr: "Grand tour d'Égypte en 12 jours",
      es: "Gran circuito de Egipto en 12 días",
      it: "Gran tour dell'Egitto in 12 giorni",
      ru: "Большой тур по Египту, 12 дней",
      ar: "رحلة مصر الكبرى في 12 يومًا",
    },
    tagline: {
      de: "Kairo, eine komplette Nilkreuzfahrt und das Rote Meer — das ganze Land, in Ruhe.",
      fr: "Le Caire, une croisière complète sur le Nil et la mer Rouge — tout le pays, sans se presser.",
      es: "El Cairo, un crucero completo por el Nilo y el mar Rojo: el país entero, sin prisa.",
      it: "Il Cairo, una crociera completa sul Nilo e il Mar Rosso: tutto il paese, con calma.",
      ru: "Каир, полный круиз по Нилу и Красное море — вся страна в спокойном ритме.",
      ar: "القاهرة ورحلة نيلية كاملة والبحر الأحمر — البلد كلها بإيقاع هادئ.",
    },
  },

  "9-day-egypt-jordan-combo": {
    title: {
      de: "9 Tage Ägypten & Jordanien kombiniert",
      fr: "Combiné Égypte et Jordanie en 9 jours",
      es: "Combinado Egipto y Jordania en 9 días",
      it: "Combinato Egitto e Giordania in 9 giorni",
      ru: "Египет и Иордания за 9 дней",
      ar: "مصر والأردن في 9 أيام",
    },
    tagline: {
      de: "Pyramiden, Nil und Petra — zwei Länder, eine zusammenhängende Reise.",
      fr: "Les pyramides, le Nil et Pétra — deux pays, un seul voyage.",
      es: "Las pirámides, el Nilo y Petra: dos países en un solo viaje.",
      it: "Le piramidi, il Nilo e Petra: due paesi, un unico viaggio.",
      ru: "Пирамиды, Нил и Петра — две страны в одной связной поездке.",
      ar: "الأهرامات والنيل والبتراء — بلدان في رحلة واحدة متّصلة.",
    },
  },

  "14-day-egypt-jordan-classic-journey": {
    title: {
      de: "14 Tage Ägypten & Jordanien: die komplette klassische Reise",
      fr: "14 jours Égypte et Jordanie : le grand classique",
      es: "14 días por Egipto y Jordania: el gran clásico",
      it: "14 giorni tra Egitto e Giordania: il grande classico",
      ru: "14 дней по Египту и Иордании: полный классический маршрут",
      ar: "14 يومًا بين مصر والأردن: الرحلة الكلاسيكية الكاملة",
    },
    tagline: {
      de: "Pyramiden, eine komplette Nilkreuzfahrt, Abu Simbel und Petra — die klassische Route durch beide Länder.",
      fr: "Les pyramides, une croisière complète sur le Nil, Abou Simbel et Pétra — l'itinéraire classique à travers les deux pays.",
      es: "Las pirámides, un crucero completo por el Nilo, Abu Simbel y Petra: la ruta clásica por los dos países.",
      it: "Le piramidi, una crociera completa sul Nilo, Abu Simbel e Petra: l'itinerario classico attraverso i due paesi.",
      ru: "Пирамиды, полный круиз по Нилу, Абу-Симбел и Петра — классический маршрут по двум странам.",
      ar: "الأهرامات ورحلة نيلية كاملة وأبو سمبل والبتراء — المسار الكلاسيكي في البلدين.",
    },
  },

  "21-day-egypt-grand-explorer": {
    title: {
      de: "Ägypten in seiner ganzen Weite: die große 21-Tage-Reise",
      fr: "L'Égypte dans son entier : le grand voyage de 21 jours",
      es: "Egipto al completo: el gran viaje de 21 días",
      it: "Egitto al completo: il grande viaggio di 21 giorni",
      ru: "Египет целиком: большое 21-дневное путешествие",
      ar: "مصر كاملة: الرحلة الكبرى في 21 يومًا",
    },
    tagline: {
      de: "Kairo, Alexandria, Fayoum, eine komplette Nilkreuzfahrt, Abu Simbel sowie die Riffe und Berge des Sinai — alles, ganz in Ruhe.",
      fr: "Le Caire, Alexandrie, le Fayoum, une croisière complète sur le Nil, Abou Simbel et les récifs et montagnes du Sinaï — tout, sans se presser.",
      es: "El Cairo, Alejandría, El Fayum, un crucero completo por el Nilo, Abu Simbel y los arrecifes y montañas del Sinaí: todo, sin prisa.",
      it: "Il Cairo, Alessandria, il Fayyum, una crociera completa sul Nilo, Abu Simbel e le barriere e le montagne del Sinai: tutto, con calma.",
      ru: "Каир, Александрия, Фаюм, полный круиз по Нилу, Абу-Симбел и рифы с горами Синая — всё и без спешки.",
      ar: "القاهرة والإسكندرية والفيوم ورحلة نيلية كاملة وأبو سمبل وشعاب سيناء وجبالها — كل شيء وبلا عجلة.",
    },
  },
};

export const photoshootTranslations: Record<string, ProductTranslation> = {
  "exclusive-pyramids-photoshoot": {
    title: {
      de: "Exklusives Fotoshooting an den Pyramiden",
      fr: "Séance photo exclusive aux pyramides",
      es: "Sesión de fotos exclusiva en las pirámides",
      it: "Servizio fotografico esclusivo alle piramidi",
      ru: "Эксклюзивная фотосессия у пирамид",
      ar: "جلسة تصوير حصرية عند الأهرامات",
    },
    description: {
      de: "Ein privates, professionell geführtes Fotoshooting an den Pyramiden von Gizeh — für Reisende, die kinoreife, Instagram-fertige Erinnerungen wollen und keine Schnappschüsse.",
      fr: "Une séance photo privée, dirigée par un professionnel, aux pyramides de Gizeh — pour les voyageurs qui veulent des souvenirs cinématographiques, prêts pour Instagram, et pas de simples clichés.",
      es: "Una sesión de fotos privada y dirigida por un profesional en las pirámides de Guiza, pensada para quien quiere recuerdos cinematográficos listos para Instagram y no simples instantáneas.",
      it: "Un servizio fotografico privato, diretto da un professionista, alle piramidi di Giza: per chi vuole ricordi cinematografici pronti per Instagram, non semplici scatti.",
      ru: "Частная фотосессия у пирамид Гизы с профессиональной режиссурой кадра — для тех, кому нужны кинематографичные снимки, готовые к публикации, а не случайные фото.",
      ar: "جلسة تصوير خاصة بإدارة مصوّر محترف عند أهرامات الجيزة — لمن يريد صورًا سينمائية جاهزة للنشر، لا مجرد لقطات عابرة.",
    },
  },

  "flying-dress-photoshoot": {
    title: {
      de: "Flying-Dress-Fotoshooting in den Sanddünen",
      fr: "Séance photo Flying Dress dans les dunes",
      es: "Sesión Flying Dress en las dunas",
      it: "Servizio fotografico Flying Dress tra le dune",
      ru: "Фотосессия Flying Dress среди дюн",
      ar: "جلسة الفستان الطائر بين الكثبان",
    },
    description: {
      de: "Ägyptens erstes Flying-Dress-Erlebnis — ein ausdrucksstarkes Shooting im Editorial-Stil, in einem fließenden Kleid in Ihrer Wunschfarbe, mitten in den Sanddünen der Wüste, geführt von unseren Fotografen an geheimen, menschenleeren Orten.",
      fr: "La première expérience Flying Dress d'Égypte — une séance spectaculaire, dans l'esprit d'un éditorial de mode, en robe fluide de la couleur de votre choix, au milieu des dunes du désert, dirigée par nos photographes dans des lieux secrets et déserts.",
      es: "La primera experiencia Flying Dress de Egipto: una sesión espectacular, de estilo editorial, con un vestido vaporoso del color que elijas, entre las dunas del desierto y dirigida por nuestros fotógrafos en lugares secretos y sin gente.",
      it: "La prima esperienza Flying Dress d'Egitto: uno shooting d'effetto, in stile editoriale, con un abito fluente del colore che preferisci, tra le dune del deserto e diretto dai nostri fotografi in luoghi segreti e senza folla.",
      ru: "Первый в Египте опыт Flying Dress — эффектная съёмка в журнальном стиле: струящееся платье выбранного вами цвета, песчаные дюны пустыни и наши фотографы, которые ведут кадр в секретных местах вдали от толпы.",
      ar: "أول تجربة فستان طائر في مصر — جلسة تصوير لافتة بأسلوب المجلات، بفستان منساب باللون الذي تختارينه، بين كثبان الصحراء وبإدارة مصوّرينا في مواقع سرّية بعيدة عن الزحام.",
    },
  },

  "fayoum-flying-dress-photoshoot": {
    title: {
      de: "Flying-Dress-Fotoshooting in Fayoum",
      fr: "Séance photo Flying Dress au Fayoum",
      es: "Sesión Flying Dress en El Fayum",
      it: "Servizio fotografico Flying Dress nel Fayyum",
      ru: "Фотосессия Flying Dress в Фаюме",
      ar: "جلسة الفستان الطائر في الفيوم",
    },
    description: {
      de: "Das Flying-Dress-Erlebnis draußen am Wadi El Rayan und am Magic Lake in Fayoum — ein fließendes Kleid in Ihrer Wunschfarbe vor dem Wasser und den Dünen der Oase, geführt von unseren Fotografen, fernab der Menschenmengen.",
      fr: "L'expérience Flying Dress au Wadi El Rayan et au Magic Lake, dans le Fayoum — une robe fluide de la couleur de votre choix face à l'eau et aux dunes de l'oasis, dirigée par nos photographes loin de la foule.",
      es: "La experiencia Flying Dress en Wadi El Rayan y el Lago Mágico de El Fayum: un vestido vaporoso del color que elijas frente al agua y las dunas del oasis, dirigido por nuestros fotógrafos lejos de la gente.",
      it: "L'esperienza Flying Dress al Wadi El Rayan e al Magic Lake, nel Fayyum: un abito fluente del colore che preferisci davanti all'acqua e alle dune dell'oasi, diretto dai nostri fotografi lontano dalla folla.",
      ru: "Опыт Flying Dress в Вади-эль-Райян и на Волшебном озере в Фаюме — струящееся платье выбранного цвета на фоне воды и дюн оазиса, съёмка с нашими фотографами вдали от толпы.",
      ar: "تجربة الفستان الطائر عند وادي الريان والبحيرة السحرية في الفيوم — فستان منساب باللون الذي تختارينه أمام مياه الواحة وكثبانها، بإدارة مصوّرينا بعيدًا عن الزحام.",
    },
  },

  "jumping-horse-photoshoot": {
    title: {
      de: "Fotoshooting mit springendem Pferd",
      fr: "Séance photo cheval au saut",
      es: "Sesión de fotos con caballo en salto",
      it: "Servizio fotografico con cavallo in salto",
      ru: "Фотосессия с лошадью в прыжке",
      ar: "جلسة تصوير مع الحصان القافز",
    },
    description: {
      de: "Ein energiegeladenes Action-Shooting am Nine Pyramids View — Sie und ein trainiertes Pferd mitten im Sprung vor den Pyramiden, von unseren Fotografen geführt und exakt auf den Moment getimt.",
      fr: "Une séance photo pleine d'énergie au Nine Pyramids View — vous et un cheval dressé en plein saut devant les pyramides, avec nos photographes qui dirigent la scène et déclenchent au bon instant.",
      es: "Una sesión de acción llena de energía en el Nine Pyramids View: tú y un caballo adiestrado en pleno salto frente a las pirámides, con nuestros fotógrafos dirigiendo y midiendo el instante exacto.",
      it: "Uno shooting d'azione ad alta energia al Nine Pyramids View: tu e un cavallo addestrato in pieno salto davanti alle piramidi, con i nostri fotografi che dirigono la scena e scelgono l'istante giusto.",
      ru: "Энергичная экшн-съёмка на площадке Nine Pyramids View — вы и обученная лошадь в прыжке на фоне пирамид, наши фотографы ставят кадр и ловят нужный момент.",
      ar: "جلسة تصوير حركية مفعمة بالطاقة عند إطلالة الأهرامات التسعة — أنت وحصان مدرَّب في لحظة القفز أمام الأهرامات، بإدارة مصوّرينا والتقاط اللحظة في توقيتها.",
    },
  },

  "running-horse-video-jumping-horse-photoshoot": {
    title: {
      de: "Video mit galoppierendem Pferd + Fotoshooting mit springendem Pferd",
      fr: "Vidéo cheval au galop + séance photo cheval au saut",
      es: "Vídeo de caballo al galope + sesión de caballo en salto",
      it: "Video del cavallo al galoppo + servizio con cavallo in salto",
      ru: "Видео скачущей лошади + фотосессия с лошадью в прыжке",
      ar: "فيديو الحصان الجامح + جلسة تصوير الحصان القافز",
    },
    description: {
      de: "Das Fotoshooting mit springendem Pferd am Nine Pyramids View, kombiniert mit einem kinoreifen Video des galoppierenden Pferdes — in vollem Galopp vor den Pyramiden, gefilmt und inszeniert von unserem Team.",
      fr: "La séance photo du cheval au saut au Nine Pyramids View, complétée par une vidéo cinématographique du cheval au galop — pleine course devant les pyramides, filmée et dirigée par notre équipe.",
      es: "La sesión del caballo en salto en el Nine Pyramids View, combinada con un vídeo cinematográfico del caballo al galope: a plena carrera con las pirámides de fondo, filmado y dirigido por nuestro equipo.",
      it: "Il servizio fotografico con il cavallo in salto al Nine Pyramids View, abbinato a un video cinematografico del cavallo al galoppo: in piena corsa con le piramidi sullo sfondo, girato e diretto dal nostro team.",
      ru: "Фотосессия с лошадью в прыжке на площадке Nine Pyramids View вместе с кинематографичным видео: лошадь в полном галопе на фоне пирамид, съёмка и режиссура — наша команда.",
      ar: "جلسة تصوير الحصان القافز عند إطلالة الأهرامات التسعة، مع فيديو سينمائي لحصان في عدوٍ كامل والأهرامات في الخلفية، من تصوير وإخراج فريقنا.",
    },
  },

  "pyramids-proposal-romance-setup": {
    title: {
      de: "Romantisches Heiratsantrag-Setup an den Pyramiden",
      fr: "Demande en mariage romantique face aux pyramides",
      es: "Pedida de mano romántica frente a las pirámides",
      it: "Proposta di matrimonio romantica davanti alle piramidi",
      ru: "Романтическое предложение руки у пирамид",
      ar: "إعداد رومانسي لطلب الزواج أمام الأهرامات",
    },
    description: {
      de: "Ein privates, liebevoll gestaltetes Setting für den Heiratsantrag mit Blick auf die Pyramiden von Gizeh — romantische Dekoration, Blumen und Kerzenlicht, alles fertig aufgebaut, bevor Sie eintreffen, damit nur noch der Moment selbst bleibt. Der Preis richtet sich nach Aufbau und Stil Ihrer Wahl. Buchbar nur auf Anfrage — unser Team stimmt Aufbau, Styling und Preis direkt mit Ihnen ab.",
      fr: "Un décor privé, soigneusement mis en scène pour votre demande en mariage, face aux pyramides de Gizeh — décoration romantique, fleurs et bougies, installées et prêtes avant votre arrivée, pour qu'il ne reste que le moment lui-même. Le tarif dépend de l'installation et du style choisis. Uniquement sur demande — notre équipe confirme avec vous l'installation, la mise en scène et le prix.",
      es: "Un montaje privado y cuidadosamente decorado para tu pedida de mano con las pirámides de Guiza de fondo: decoración romántica, flores y velas, todo listo antes de que llegues para que solo quede el momento. El precio depende del montaje y el estilo que elijas. Solo por consulta: nuestro equipo confirma contigo el montaje, la decoración y el precio.",
      it: "Un allestimento privato e curato nei dettagli per la tua proposta di matrimonio, con vista sulle piramidi di Giza: decorazioni romantiche, fiori e candele, già pronti prima del tuo arrivo, così resta solo il momento. Il prezzo dipende dall'allestimento e dallo stile che scegli. Solo su richiesta: il nostro team conferma con te allestimento, stile e prezzo.",
      ru: "Частная, со вкусом оформленная площадка для предложения руки с видом на пирамиды Гизы — романтичный декор, цветы и свечи, всё расставлено до вашего приезда, чтобы остался только сам момент. Цена зависит от выбранного оформления и стиля. Только по запросу — оформление, стиль и стоимость наша команда согласует с вами напрямую.",
      ar: "إعداد خاص ومنسّق بعناية لطلب الزواج بإطلالة على أهرامات الجيزة — زينة رومانسية وورود وإضاءة الشموع، جاهزة قبل وصولك حتى لا يتبقّى سوى اللحظة نفسها. السعر يعتمد على الإعداد والأسلوب الذي تختاره. الحجز بالاستفسار فقط — يؤكّد فريقنا معك الإعداد والتنسيق والسعر مباشرة.",
    },
  },
};

/** Keyed by transfer category id, not slug — see content/transfers.ts. */
export const transferCategoryTranslations: Record<string, { label: TranslatedField; description: TranslatedField }> = {
  airport: {
    label: {
      de: "Flughafentransfer",
      fr: "Transfert aéroport",
      es: "Traslado al aeropuerto",
      it: "Transfer aeroporto",
      ru: "Трансфер в аэропорт",
      ar: "تنقّل المطار",
    },
    description: {
      de: "Privater Transfer von oder zum Flughafen Kairo, mit Flugüberwachung und einem Fahrer, der in der Ankunftshalle wartet.",
      fr: "Prise en charge ou dépose privée à l'aéroport international du Caire, avec suivi du vol et un chauffeur qui vous attend aux arrivées.",
      es: "Recogida o entrega privada en el Aeropuerto Internacional de El Cairo, con seguimiento del vuelo y un conductor esperándote en llegadas.",
      it: "Prelievo o accompagnamento privato all'aeroporto internazionale del Cairo, con monitoraggio del volo e un autista che ti aspetta agli arrivi.",
      ru: "Индивидуальная встреча или доставка в Международный аэропорт Каира: мы следим за рейсом, а водитель ждёт в зоне прилёта.",
      ar: "استقبال أو توصيل خاص في مطار القاهرة الدولي، مع متابعة الرحلة وسائق في انتظارك بصالة الوصول.",
    },
  },
  hotel: {
    label: {
      de: "Hoteltransfer",
      fr: "Transfert hôtel",
      es: "Traslado de hotel",
      it: "Transfer hotel",
      ru: "Трансфер от отеля",
      ar: "تنقّل الفنادق",
    },
    description: {
      de: "Direkte Transfers von Hotel zu Hotel oder von Ihrem Hotel zu jeder Sehenswürdigkeit in Kairo und Gizeh.",
      fr: "Transferts d'un point à un autre entre hôtels, ou de votre hôtel vers n'importe quel site du Caire ou de Gizeh.",
      es: "Traslados directos entre hoteles, o desde tu hotel a cualquier punto de interés de El Cairo o Guiza.",
      it: "Transfer diretti da hotel a hotel, o dal tuo hotel a qualsiasi attrazione del Cairo e di Giza.",
      ru: "Поездки от точки до точки между отелями или от вашего отеля к любой достопримечательности Каира и Гизы.",
      ar: "تنقّلات مباشرة بين الفنادق، أو من فندقك إلى أي معلم في القاهرة أو الجيزة.",
    },
  },
  intercity: {
    label: {
      de: "Überlandtransfer",
      fr: "Transfert entre villes",
      es: "Traslado entre ciudades",
      it: "Transfer tra città",
      ru: "Междугородний трансфер",
      ar: "تنقّل بين المدن",
    },
    description: {
      de: "Private Einzeltransfers zwischen Kairo/Gizeh und Alexandria, Ain Sokhna oder Fayoum.",
      fr: "Transferts privés aller simple entre Le Caire/Gizeh et Alexandrie, Ain Sokhna ou le Fayoum.",
      es: "Traslados privados de ida entre El Cairo/Guiza y Alejandría, Ain Sokhna o El Fayum.",
      it: "Transfer privati di sola andata tra Il Cairo/Giza e Alessandria, Ain Sokhna o il Fayyum.",
      ru: "Индивидуальные трансферы в одну сторону между Каиром/Гизой и Александрией, Айн-Сохной или Фаюмом.",
      ar: "تنقّلات خاصة باتجاه واحد بين القاهرة/الجيزة والإسكندرية أو العين السخنة أو الفيوم.",
    },
  },
  "private-driver": {
    label: {
      de: "Privatfahrer",
      fr: "Chauffeur privé",
      es: "Conductor privado",
      it: "Autista privato",
      ru: "Личный водитель",
      ar: "سائق خاص",
    },
    description: {
      de: "Buchen Sie Fahrer und Fahrzeug stunden- oder tageweise — für volle Flexibilität in Kairo und Gizeh.",
      fr: "Réservez un chauffeur et un véhicule à l'heure ou à la journée, pour une liberté totale au Caire et à Gizeh.",
      es: "Contrata conductor y vehículo por horas o por días, con total libertad de movimiento por El Cairo y Guiza.",
      it: "Prenota autista e veicolo a ore o a giornata, per muoverti in totale libertà tra Il Cairo e Giza.",
      ru: "Водитель и автомобиль в почасовую или дневную аренду — полная свобода передвижения по Каиру и Гизе.",
      ar: "استأجر سائقًا وسيارة بالساعة أو باليوم، لتتحرّك بحرية كاملة في القاهرة والجيزة.",
    },
  },
  custom: {
    label: {
      de: "Individueller Transfer",
      fr: "Transfert sur mesure",
      es: "Traslado a medida",
      it: "Transfer su misura",
      ru: "Трансфер на заказ",
      ar: "تنقّل حسب الطلب",
    },
    description: {
      de: "Routen mit mehreren Stopps, ungewöhnliche Abholorte oder alles, was oben nicht steht — sagen Sie uns einfach, was Sie brauchen.",
      fr: "Itinéraires à plusieurs arrêts, points de prise en charge inhabituels ou tout autre besoin — dites-nous ce qu'il vous faut.",
      es: "Rutas con varias paradas, puntos de recogida poco habituales o cualquier cosa fuera de lo anterior: cuéntanos qué necesitas.",
      it: "Percorsi con più tappe, punti di ritiro insoliti o qualsiasi cosa non elencata qui sopra: dicci di cosa hai bisogno.",
      ru: "Маршруты с несколькими остановками, нестандартные точки подачи или что-то ещё — расскажите, что вам нужно.",
      ar: "مسارات بعدة محطات، أو نقاط انطلاق غير معتادة، أو أي شيء خارج ما سبق — أخبرنا بما تحتاجه.",
    },
  },
};

/**
 * The five transfer services, in the reader's language.
 *
 * Transfers are the one commercial surface with no Sanity document behind it —
 * the categories live in `content/transfers.ts` because the quote engine is
 * built on their ids. So they can't ride the fetcher's translation layer, and
 * get their own resolver instead. Both the page and the booking form call it,
 * which is also why it takes the locale rather than reading root params: the
 * form is a Client Component.
 */
export function localizedTransferCategories(locale: Locale): TransferCategoryInfo[] {
  if (locale === DEFAULT_LOCALE) return [...transfersPage.categories];
  return transfersPage.categories.map((category) => {
    const translation = transferCategoryTranslations[category.id];
    return {
      ...category,
      label: localized(category.label, translation?.label, locale),
      description: localized(category.description, translation?.description, locale),
    };
  });
}
