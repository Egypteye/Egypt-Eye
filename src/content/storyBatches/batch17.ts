import type { Story } from "../types";
import { authors } from "../authors";
import { p, pl, h2, h3, bullets, callout, faq, cta, toursBySlug } from "../storyBlocks";
import { unsplashUrl, unsplashCredit } from "../unsplash";

const editorialTeam = authors[0];

// The sanctuary series — the owner's own articles on the holy of holies.
//
// WHY THESE ARE FRAMED ON THE CONCEPT AND NOT THE TEMPLES
//
// They arrived titled "…Karnak and Edfu" and "…Luxor Temple and Abydos
// Temple", and published that way each one would have competed with a guide
// this site already has. All six temples in the series are already covered:
// karnak-temple-complete-guide, edfu-and-kom-ombo-temples-guide,
// philae-temple-aswan-high-dam-guide, dendera-and-abydos-temples-guide,
// luxor-temple-guide and abydos-temple-of-seti-guide, 1,574 to 1,800 words
// each. Two of our own pages bidding for "karnak temple" is not more
// coverage, it is split coverage — and the stories library is already the
// site's weakest section by CTR, so adding near-duplicates to it makes the
// measured problem worse.
//
// What the six guides do NOT contain is the subject these articles are
// actually about: the phrase "holy of holies" appears in none of them. So the
// series is positioned on the concept — what the inner sanctuary was, how the
// architecture enforced it, what the priests did in there — with the temples
// as the evidence, and each piece linking out to the guide for the temple
// itself. Different search intent, and it feeds the existing pages instead of
// bidding against them.
//
// SOURCES AND FACTS
//
// The copy is the owner's, reformatted: headings de-numbered for the web
// ("1. The Holy of Holies…" reads as a document, not an article), the inline
// `<a href>` HTML they had written converted to real Portable Text links
// (raw HTML in a span renders as visible angle brackets), and an FAQ built
// only from questions the body already answers. No fact was added. The two
// outbound links to egymonuments.gov.eg are theirs and are kept — that is the
// Ministry of Tourism and Antiquities' own site.
//
// COVER PHOTOS
//
// The owner supplied six temple photographs with these articles and
// confirmed they were saved from websites, so they are deliberately NOT used:
// a file under /photos is treated by scripts/check-story-images.mts as Egypt
// Eye's own work needing no credit, and putting someone else's photograph
// there would publish it as ours. Licensed Unsplash covers are used instead,
// credited. Replacing them with Egypt Eye's own photography of these
// sanctuaries is an upgrade — swap the image and drop the credit.
//
// The third article in the series, on Philae, is held back: its file is named
// for Dendera but its text is about the Temple of Dendur, which is a
// different monument and stands in the Metropolitan Museum in New York. That
// needs the owner's answer, not a guess.

export const stories: Story[] = [
  {
    status: "published",
    featured: false,
    slug: "holy-of-holies-egyptian-temples",
    title: "The Holy of Holies: Inside the Sanctuaries of Karnak and Edfu",
    category: "Ancient Egypt",
    tags: ["Temples", "Karnak", "Edfu", "Ancient Religion", "Sacred Architecture"],
    author: editorialTeam,
    excerpt:
      "Every Egyptian temple was built around one room almost nobody was allowed to enter. Here is what the inner sanctuary was for, how the architecture kept people out of it, and what survives of it at Karnak and Edfu.",
    imageTone: "luxor",
    image: unsplashUrl("photo-1764686623258-24f22391cc33"),
    imageCredit: unsplashCredit(
      "Dave Meckler",
      "https://unsplash.com/photos/massive-ancient-stone-columns-in-a-dimly-lit-hall-dbD727mKjUs"
    ),
    publishedAt: "2026-11-04T00:00:00.000Z",
    primaryKeyword: "holy of holies ancient egyptian temple",
    secondaryKeywords: [
      "egyptian temple sanctuary",
      "naos ancient egypt",
      "karnak sanctuary",
      "edfu temple sanctuary",
      "sacred barque of amun",
    ],
    relatedTours: toursBySlug("2-day-luxor-tour", "8-day-essential-egypt-nile-cruise", "6-day-cairo-giza-luxor"),
    seoTitle: "The Holy of Holies in Ancient Egyptian Temples",
    seoDescription:
      "What the innermost sanctuary of an Egyptian temple was for, who was allowed inside, and what survives of it at Karnak and Edfu — including Edfu's granite naos.",
    relatedStories: [
      {
        slug: "egyptian-temple-rituals-and-symbolism",
        title: "What the Priests Actually Did: Ritual and Symbolism in Egypt's Sanctuaries",
        excerpt:
          "Sacred darkness, daily offerings, the Opet procession and the mysteries of Osiris — the ritual life of the Egyptian sanctuary, at Luxor Temple and Abydos.",
        imageTone: "luxor",
        category: "Ancient Egypt",
      },
      {
        slug: "karnak-temple-complete-guide",
        title: "Karnak Temple: A Complete Guide",
        excerpt:
          "The largest religious complex ever built — what to see, how long it takes, and how to visit Karnak without rushing it.",
        imageTone: "luxor",
        category: "Travel Guides",
      },
      {
        slug: "edfu-and-kom-ombo-temples-guide",
        title: "Edfu and Kom Ombo Temples: What to Expect",
        excerpt:
          "Two Ptolemaic temples most travellers see from a Nile cruise, and what makes each one worth the stop.",
        imageTone: "nile",
        category: "Travel Guides",
      },
    ],
    body: [
      p(
        "Deep inside the magnificent temples of ancient Egypt, beyond monumental gateways, enormous columns, and decorated halls, existed some of the most sacred spaces of the ancient world. These innermost chambers, often described as the Holy of Holies, were the spiritual heart of Egyptian temples and the dwelling places of the gods."
      ),
      p(
        "Unlike the open courtyards where religious ceremonies and public activities could take place, the inner sanctuary was a restricted area reserved for priests performing sacred rituals. It housed the divine cult statue, usually protected inside a shrine known as the naos."
      ),
      p(
        "Although the expression Sanctum Sanctorum is Latin rather than an ancient Egyptian religious term, it provides a useful description of these mysterious inner sanctuaries."
      ),
      p(
        "Two remarkable examples can be explored at the Temple of Amun at Karnak and the Temple of Horus at Edfu. Both monuments reveal how ancient Egyptian architects transformed sacred buildings into symbolic representations of the divine universe."
      ),

      h2("The Holy of Holies in Ancient Egyptian Temples"),
      p(
        "Ancient Egyptians considered temples to be the earthly houses of their gods. The Egyptian expression Hut-Netjer means “House of the God.”"
      ),
      p(
        "At the center of this sacred building stood the sanctuary, where the principal deity's cult statue was kept. This statue was not regarded merely as a sculpture. Through religious consecration and ritual, it became the focus of the deity's presence within the temple."
      ),
      p(
        "The sanctuary was generally inaccessible to ordinary visitors. Specially authorized priests entered to perform daily ceremonies, including purification, offerings, prayers, and the presentation of incense."
      ),
      p(
        "The architectural arrangement of many Egyptian temples reflected this sacred hierarchy. Visitors passed through monumental pylons, open courtyards, and hypostyle halls before reaching increasingly restricted inner chambers."
      ),
      p("The farther one moved into the temple, the closer one approached its most sacred space."),

      h2("The Sacred Sanctuary of Karnak Temple"),
      pl([
        "Located on the eastern bank of the Nile at Luxor, the ",
        { text: "Karnak Temple Complex", href: "https://egymonuments.gov.eg/archaeological-sites/karnak/" },
        " was one of the most important religious centers in ancient Egypt.",
      ]),
      p(
        "Its principal temple was dedicated to Amun-Ra, the powerful god who became one of the most prominent deities in the Egyptian pantheon."
      ),
      p(
        "Karnak was expanded by successive pharaohs over many centuries, creating an extraordinary complex of pylons, courtyards, halls, obelisks, and sacred chambers."
      ),
      p("At the heart of the Temple of Amun was the sanctuary associated with the god's divine image."),
      p(
        "The sacred statue was kept within a shrine and received daily offerings from the priesthood. These rituals included presenting food, burning incense, pouring sacred liquids, and dressing the divine image."
      ),
      p(
        "The sanctuary was not intended to be a public gathering place. Its restricted access emphasized the sacred nature of the god's earthly residence."
      ),
      pl([
        "If you are planning to stand in it yourself, our ",
        { text: "complete guide to Karnak", href: "/stories/karnak-temple-complete-guide" },
        " covers what to see, how long the complex takes, and when to arrive to have the Hypostyle Hall to yourself.",
      ]),

      h3("The Great Hypostyle Hall and the Journey Toward the Sanctuary"),
      p("One of the most impressive architectural features of Karnak is its Great Hypostyle Hall."),
      p(
        "Its enormous columns, decorated with religious inscriptions and scenes, created a monumental transition between the outer temple spaces and the more sacred inner areas."
      ),
      p(
        "The hall was filled with symbolic imagery inspired by the natural world. Papyrus-shaped columns recalled the vegetation of the primordial landscape, while the decorated ceilings represented the heavens."
      ),
      p(
        "Beyond this magnificent hall, the architecture became more enclosed and restricted as visitors approached the sanctuary."
      ),
      p(
        "This progression reflected the Egyptian understanding of the temple as a sacred representation of creation, with the innermost chamber symbolizing the divine center of the universe."
      ),

      h3("The Sacred Barque of Amun"),
      p("Another important element of Karnak's religious life was the sacred barque of Amun."),
      p(
        "This ceremonial boat carried the god's portable shrine during religious processions. During important festivals, priests carried the barque through the temple and sometimes beyond its walls."
      ),
      p(
        "One of the most significant celebrations was the Opet Festival, when the sacred images of the Theban gods traveled between Karnak and Luxor."
      ),
      p(
        "The procession symbolized divine renewal and reinforced the relationship between the gods, the pharaoh, and the people of Egypt."
      ),

      h2("The Holy of Holies in Edfu Temple"),
      pl([
        "Located on the western bank of the Nile in Upper Egypt, the ",
        { text: "Temple of Horus at Edfu", href: "https://egymonuments.gov.eg/monuments/temple-of-edfu/" },
        " is among the best-preserved ancient Egyptian temples.",
      ]),
      p(
        "Dedicated to Horus of Behedet, its construction began in 237 BC under Ptolemy III and was completed in 57 BC under Ptolemy XII."
      ),
      p(
        "Unlike many older temples that survive only partially, Edfu preserves much of its original architectural arrangement and extensive religious decoration."
      ),
      p("Its layout provides an exceptional opportunity to understand how ancient Egyptians organized sacred space."),
      p(
        "Visitors passed through the monumental pylon and courtyard, then entered the hypostyle halls before reaching the increasingly restricted inner chambers."
      ),
      p(
        "At the innermost point stood the sanctuary, containing a remarkable granite naos associated with an earlier phase of the temple's sacred furnishings."
      ),
      p("This shrine was connected with the divine image of Horus and the religious ceremonies performed by the priests."),

      h3("The Sanctuary and the Divine Presence of Horus"),
      p("The innermost sanctuary of Edfu was the spiritual center of the temple."),
      p(
        "Here, the cult image of Horus received daily offerings and ritual attention. The ceremonies were performed by priests following established religious traditions."
      ),
      p(
        "The surrounding walls preserve detailed inscriptions and reliefs describing religious festivals, divine mythology, offerings, and the relationship between Horus and the Egyptian king."
      ),
      p("These inscriptions make Edfu one of the most valuable monuments for studying ancient Egyptian religious practices."),
      p(
        "The sanctuary also demonstrates the importance of the king's relationship with the gods. The pharaoh was traditionally portrayed as the intermediary responsible for maintaining divine order and ensuring that the gods continued to protect Egypt."
      ),
      pl([
        "Edfu is a scheduled stop on most Nile cruises between Luxor and Aswan — our ",
        { text: "guide to Edfu and Kom Ombo", href: "/stories/edfu-and-kom-ombo-temples-guide" },
        " covers both temples and how long you actually get at each.",
      ]),

      h2("The Spiritual Meaning of the Sacred Inner Chamber"),
      p(
        "Although Karnak and Edfu were built in different historical periods, their sanctuaries shared important religious characteristics."
      ),
      p(
        "The innermost chamber represented the divine residence, while its restricted access emphasized the difference between sacred and ordinary space."
      ),
      p("Its darkness and enclosed architecture contributed to the atmosphere of mystery surrounding the cult statue."),
      p(
        "The sanctuary also reflected the Egyptian concept of Ma'at, the principle of truth, balance, justice, and cosmic order."
      ),
      p(
        "Through daily offerings and religious ceremonies, priests symbolically maintained the relationship between the gods and the universe."
      ),
      p(
        "In this sense, the Holy of Holies was much more than a hidden room. It was the spiritual center of the temple and a place where Egyptian religious beliefs, royal authority, and cosmic symbolism came together."
      ),

      callout(
        "The sanctuary was designed to be dark, and it still is. If you want to see the granite naos at Edfu or the inner chambers at Karnak properly, go early or late — the difference between midday glare at the entrance and low light inside is most of why photographs of these rooms disappoint people.",
        { title: "Seeing it for yourself", tone: "Info" }
      ),

      h2("In Short"),
      p(
        "The Holy of Holies in ancient Egyptian temples reveals the extraordinary religious imagination behind Egypt's monumental architecture."
      ),
      p(
        "The sacred sanctuary of Amun at Karnak and the inner shrine of Horus at Edfu demonstrate how temples were designed as divine residences, with their innermost chambers reserved for the most important religious rituals."
      ),
      p(
        "Through their sacred shrines, cult statues, ceremonial barques, and elaborate inscriptions, these monuments preserve valuable evidence of ancient Egyptian beliefs about divine presence and cosmic order."
      ),
      p(
        "Today, Karnak and Edfu remain two of the most remarkable places to explore the sacred architecture of ancient Egypt and understand the mysterious world that existed behind the temples' monumental walls."
      ),

      faq(
        [
          {
            question: "What was the Holy of Holies in an ancient Egyptian temple?",
            answer:
              "The innermost chamber of the temple, which held the principal deity's cult statue inside a shrine known as a naos. Egyptians understood the temple as Hut-Netjer, the “House of the God”, and this room as the god's actual residence within it. “Holy of Holies” and “Sanctum Sanctorum” are later descriptions rather than ancient Egyptian terms, but they describe the function accurately.",
          },
          {
            question: "Who was allowed inside the sanctuary?",
            answer:
              "Only specially authorized priests. They entered to perform daily ceremonies — purification, offerings, prayers, the presentation of incense, pouring sacred liquids and dressing the divine image. Ordinary visitors could reach the courtyards, but not the inner chambers.",
          },
          {
            question: "Why is Edfu's sanctuary important?",
            answer:
              "Edfu is among the best-preserved ancient Egyptian temples, so its original architectural arrangement survives largely intact — pylon, courtyard, hypostyle halls, then progressively restricted inner chambers. At the innermost point stands a granite naos from an earlier phase of the temple's furnishings, and the surrounding walls carry some of the most detailed religious inscriptions anywhere in Egypt.",
          },
          {
            question: "What was the sacred barque of Amun?",
            answer:
              "A ceremonial boat that carried the god's portable shrine during processions. At major festivals priests carried it through the temple and sometimes beyond its walls. The best known of these was the Opet Festival, when the sacred images of the Theban gods travelled between Karnak and Luxor.",
          },
          {
            question: "Can you still see these sanctuaries today?",
            answer:
              "Yes. Karnak's sanctuary area and Edfu's inner chambers are both accessible as part of a normal visit. Karnak sits on the east bank at Luxor; Edfu is on the west bank in Upper Egypt and is a scheduled stop on most Nile cruises between Luxor and Aswan.",
          },
        ],
        "Questions About Egypt's Temple Sanctuaries"
      ),

      cta({
        title: "See the Sanctuaries With an Egyptologist",
        body: "Karnak and Edfu both reward someone who can read the walls. Our private Luxor and Nile cruise itineraries are guided by licensed Egyptologists, at your own pace rather than a bus schedule.",
        buttonLabel: "Explore Luxor and Nile Tours",
        buttonHref: "/tours",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "egyptian-temple-rituals-and-symbolism",
    title: "What the Priests Actually Did: Ritual and Symbolism in Egypt's Sanctuaries",
    category: "Ancient Egypt",
    tags: ["Temples", "Luxor Temple", "Abydos", "Opet Festival", "Osiris", "Ancient Religion"],
    author: editorialTeam,
    excerpt:
      "Sacred darkness, daily offerings, a god carried out of his temple once a year, and the mysteries of Osiris. What happened inside Egypt's inner sanctuaries — at Luxor Temple and the Temple of Seti I at Abydos.",
    imageTone: "luxor",
    image: unsplashUrl("photo-1761056981183-3faf66a62d6e"),
    imageCredit: unsplashCredit(
      "Fatih Beki",
      "https://unsplash.com/photos/ancient-egyptian-columns-against-a-bright-sky-WpPHr8iQrL8"
    ),
    publishedAt: "2026-11-04T00:00:00.000Z",
    primaryKeyword: "ancient egyptian temple rituals",
    secondaryKeywords: [
      "opet festival",
      "seven sanctuaries seti i",
      "osiris mysteries abydos",
      "egyptian temple symbolism",
      "luxor temple sanctuary",
    ],
    relatedTours: toursBySlug("2-day-luxor-tour", "6-day-cairo-giza-luxor", "8-day-essential-egypt-nile-cruise"),
    seoTitle: "Ancient Egyptian Temple Rituals and Sanctuary Symbolism",
    seoDescription:
      "What priests did inside Egypt's sanctuaries — daily offerings, sacred darkness, the Opet Festival at Luxor, and the seven sanctuaries of Seti I at Abydos.",
    relatedStories: [
      {
        slug: "holy-of-holies-egyptian-temples",
        title: "The Holy of Holies: Inside the Sanctuaries of Karnak and Edfu",
        excerpt:
          "Every Egyptian temple was built around one room almost nobody was allowed to enter. What the inner sanctuary was for, and what survives of it at Karnak and Edfu.",
        imageTone: "luxor",
        category: "Ancient Egypt",
      },
      {
        slug: "luxor-temple-guide",
        title: "Luxor Temple: What to Know Before You Go",
        excerpt:
          "The temple in the middle of modern Luxor, still connected to Karnak by the Avenue of Sphinxes — and why it is best seen after dark.",
        imageTone: "luxor",
        category: "Travel Guides",
      },
      {
        slug: "abydos-temple-of-seti-guide",
        title: "Abydos and the Temple of Seti I",
        excerpt:
          "One of the finest relief carvings in Egypt, in a temple most itineraries skip. What is there and how to reach it.",
        imageTone: "nile",
        category: "Travel Guides",
      },
    ],
    body: [
      p(
        "Behind the monumental walls of ancient Egyptian temples existed mysterious sacred chambers where priests performed rituals dedicated to the gods. These inner sanctuaries, often described as the Holy of Holies, represented the most sacred areas of Egyptian religious architecture."
      ),
      p(
        "Ancient Egyptians believed that temples were the earthly residences of the gods. Their innermost chambers housed divine cult statues and provided spaces for ceremonies intended to maintain cosmic order and renew the relationship between humanity and the divine."
      ),
      p(
        "Two remarkable examples of this religious tradition can be found at Luxor Temple and Abydos Temple. Both monuments reveal the importance of sacred architecture, royal rituals, divine symbolism, and the mysterious world of ancient Egyptian priesthood."
      ),
      pl([
        "This is the companion to our piece on ",
        { text: "the Holy of Holies at Karnak and Edfu", href: "/stories/holy-of-holies-egyptian-temples" },
        ", which covers what the sanctuary was and how the architecture enclosed it. This one is about what went on inside.",
      ]),

      h2("Luxor Temple: The Sacred House of Amun"),
      p(
        "Located on the eastern bank of the Nile in modern Luxor, Luxor Temple was one of the most important religious monuments of ancient Thebes."
      ),
      p(
        "The temple was primarily dedicated to the rejuvenation of kingship and the divine power of Amun, particularly in his form as Amun-Min. Its major construction phases were associated with Amenhotep III and Ramesses II."
      ),
      p(
        "Unlike Karnak, which developed as a vast religious complex, Luxor Temple had a particularly important connection with royal renewal ceremonies and the annual Opet Festival."
      ),

      h3("The Inner Sanctuary of Luxor Temple"),
      p("At the heart of Luxor Temple were sacred chambers associated with the divine cult and royal rituals."),
      p(
        "The innermost rooms were reserved for priests and religious ceremonies. They contained sacred objects and spaces connected with the divine images of the temple's gods."
      ),
      p(
        "The sanctuary was approached through a sequence of courtyards and columned halls, creating a gradual transition from public architectural spaces to restricted sacred areas."
      ),
      p("This arrangement reflected the Egyptian belief that the temple was a miniature representation of the divine universe."),

      h3("The Opet Festival and Divine Renewal"),
      p("One of the most important celebrations connected with Luxor Temple was the Opet Festival."),
      p(
        "During this annual festival, the sacred barques of Amun, Mut, and Khonsu traveled from Karnak to Luxor Temple. The procession was accompanied by religious ceremonies and celebrations."
      ),
      p("The journey symbolized the renewal of divine power and the rejuvenation of kingship."),
      p("At Luxor Temple, the rituals reinforced the pharaoh's divine legitimacy and his relationship with Amun."),
      p(
        "The festival demonstrates that Egyptian sanctuaries were not isolated chambers. They were connected to a larger religious landscape through processions, festivals, and ceremonial movement."
      ),
      pl([
        "The Avenue of Sphinxes the procession used has been restored, and you can walk it. Our ",
        { text: "guide to Luxor Temple", href: "/stories/luxor-temple-guide" },
        " covers the site itself, and why it is worth returning to after dark.",
      ]),

      h2("Abydos Temple: The Sacred Sanctuary of Osiris"),
      p(
        "Abydos, located in Sohag Governorate in Upper Egypt, was one of the most important religious centers of ancient Egypt."
      ),
      p("The site was particularly associated with Osiris, the god of the afterlife, resurrection, and regeneration."),
      p(
        "For thousands of years, Abydos attracted pilgrims who wished to participate in religious ceremonies connected with the mysteries of Osiris."
      ),
      p("Among its most remarkable monuments is the Temple of Seti I, constructed during the New Kingdom."),
      p(
        "The temple was dedicated to several major Egyptian deities, including Osiris, Isis, Horus, Amun-Ra, Ptah, and Ra-Horakhty."
      ),

      h3("The Seven Sanctuaries of Seti I"),
      p(
        "One of the most distinctive architectural features of the Temple of Seti I is its arrangement of seven sanctuaries. Each sanctuary was dedicated to a particular deity:"
      ),
      ...bullets([
        "Osiris",
        "Isis",
        "Horus",
        "Amun-Ra",
        "Ra-Horakhty",
        "Ptah",
        "Seti I in his deified royal aspect",
      ]),
      p("These sacred chambers were among the most important areas of the temple."),
      p(
        "Their walls contain beautifully preserved reliefs showing the king presenting offerings to the gods and participating in religious ceremonies."
      ),
      p("The arrangement demonstrates the importance of multiple divine cults within a single temple complex."),

      h3("The Osiris Mysteries and Sacred Rituals"),
      p("Abydos was particularly famous for religious ceremonies associated with the death and resurrection of Osiris."),
      p(
        "According to Egyptian mythology, Osiris was murdered by his brother Seth and restored through the actions of Isis, who protected and revived him."
      ),
      p("His resurrection became a central symbol of regeneration and the possibility of life after death."),
      p(
        "Religious celebrations at Abydos included processions and dramatic ceremonies representing important events in the mythology of Osiris."
      ),
      p(
        "The temple and surrounding sacred landscape therefore became closely connected with ideas of death, resurrection, divine protection, and eternal life."
      ),
      p("For ancient Egyptians, Abydos was more than a place of worship. It was a sacred destination associated with the hope of spiritual renewal."),
      pl([
        "Abydos sits well north of Luxor and takes a dedicated day to reach — our ",
        { text: "guide to Abydos and the Temple of Seti I", href: "/stories/abydos-temple-of-seti-guide" },
        " covers the drive, what is open, and whether it is worth the hours.",
      ]),

      h2("The Secrets and Symbolism of Egyptian Sanctuaries"),
      p("The inner sanctuaries of Luxor and Abydos reveal several important aspects of ancient Egyptian religious thought."),
      ...bullets([
        "Divine presence — the cult statue represented the sacred focus of the deity's presence within the temple.",
        "Ma'at and cosmic order — daily offerings and ceremonies symbolically maintained the balance and harmony of the universe.",
        "Sacred darkness — restricted light and enclosed chambers emphasized the separation between ordinary life and the divine world.",
        "Royal legitimacy — the pharaoh's participation in temple rituals reinforced his responsibility to maintain the relationship between the gods and Egypt.",
        "Death and renewal — the Osiris traditions at Abydos connected temple worship with resurrection and eternal life.",
      ]),
      p(
        "These elements transformed the sanctuary into much more than an architectural room. It became the symbolic center of a religious system connecting gods, kings, priests, and the cosmos."
      ),

      callout(
        "Abydos is a long drive from Luxor and most group itineraries leave it out, which is exactly why the reliefs in the seven sanctuaries are in the condition they are. If the carving is what you came to Egypt for, it is worth the day.",
        { title: "Worth the detour", tone: "Highlight" }
      ),

      h2("In Short"),
      p("Luxor Temple and Abydos Temple reveal two fascinating dimensions of ancient Egyptian sacred architecture."),
      p(
        "At Luxor, the sanctuary was closely connected with divine kingship, the Opet Festival, and the renewal of royal power. At Abydos, the sacred chambers reflected the mysteries of Osiris, resurrection, and eternal life."
      ),
      p(
        "Together, these monuments demonstrate how ancient Egyptian sanctuaries combined architecture, religious rituals, mythology, and cosmic symbolism."
      ),
      p(
        "Their inner chambers remain among the most fascinating places for understanding the spiritual world of ancient Egypt and the extraordinary role of temples in maintaining the relationship between humanity and the gods."
      ),

      faq(
        [
          {
            question: "What did priests do inside an Egyptian temple sanctuary?",
            answer:
              "They performed the daily cult service for the god's statue: purification, offerings of food, burning incense, prayers, pouring sacred liquids and dressing the divine image. The point was not private devotion but the maintenance of Ma'at — truth, balance, justice and cosmic order — on behalf of Egypt.",
          },
          {
            question: "What was the Opet Festival?",
            answer:
              "An annual festival in which the sacred barques of Amun, Mut and Khonsu travelled in procession from Karnak to Luxor Temple, accompanied by ceremonies and celebrations. It symbolised the renewal of divine power and the rejuvenation of kingship, and it reinforced the pharaoh's legitimacy and his relationship with Amun.",
          },
          {
            question: "What are the seven sanctuaries at Abydos?",
            answer:
              "The Temple of Seti I contains seven sanctuaries side by side, each dedicated to a different deity: Osiris, Isis, Horus, Amun-Ra, Ra-Horakhty, Ptah, and Seti I in his deified royal aspect. Their walls carry exceptionally well preserved reliefs of the king making offerings to the gods.",
          },
          {
            question: "Why was Abydos associated with Osiris?",
            answer:
              "Abydos was the principal cult centre of Osiris, god of the afterlife, resurrection and regeneration. In Egyptian mythology Osiris was murdered by his brother Seth and restored through the actions of Isis, and his resurrection became the central symbol of life after death. Pilgrims came to Abydos for thousands of years to take part in ceremonies connected with those mysteries.",
          },
          {
            question: "Why were Egyptian sanctuaries kept dark?",
            answer:
              "Deliberately. Restricted light and enclosed architecture marked the separation between ordinary life and the divine world, and the darkness was part of the atmosphere surrounding the cult statue. It is also why these rooms photograph poorly in the middle of the day.",
          },
        ],
        "Questions About Egyptian Temple Ritual"
      ),

      cta({
        title: "Luxor, Abydos and the Temples In Between",
        body: "Abydos needs a day of its own and a guide who can read the reliefs. We build private Luxor itineraries around what you actually want to see rather than a fixed coach route.",
        buttonLabel: "See Private Luxor Tours",
        buttonHref: "/tours",
      }),
    ],
  },
];
