import type { Story } from "../types";
import { authors } from "../authors";
import { tours } from "../tours";
import { p, h2, bullets, callout, faq, cta } from "../storyBlocks";

const editorialTeam = authors[0];

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

// World-trends cohort, batch 6 of 10: photorealistic video games,
// VR/AR/spatial computing, the future of smartphones, Apple's 2026
// ecosystem, and Tesla's autonomous driving push. Facts (Unreal Engine 5
// photorealism, the 2026 AR/VR market and Vision Pro 2, foldable phone
// shipment data, Apple's 2026 product roadmap, Tesla's 2026 robotaxi
// rollout) were verified via web search at the time of writing — see
// contentReviewDate on each story.

export const stories: Story[] = [
  {
    status: "published",
    featured: false,
    slug: "scanning-the-great-pyramid",
    title: "Scanning the Great Pyramid: What the Surveys Have Actually Found",
    category: "History & Culture",
    tags: ["Great Pyramid", "ScanPyramids", "Archaeology", "Giza", "Muon Imaging"],
    author: editorialTeam,
    excerpt:
      "Cosmic-ray detectors have been looking through the Great Pyramid since 2015, and they have found two spaces nobody knew about. What that does and does not mean.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "ScanPyramids",
    secondaryKeywords: ["Great Pyramid hidden chamber", "muon scan pyramid", "big void Great Pyramid", "Great Pyramid corridor discovery"],
    relatedTours: toursBySlug("1-day-giza-tour", "3-day-cairo-giza"),
    seoTitle: "ScanPyramids: What Muon Imaging Found Inside Giza",
    seoDescription:
      "The void above the Grand Gallery, the corridor behind the north-face chevrons, and how cosmic-ray muon imaging sees through solid limestone without touching it.",
    body: [
      p(
        "The Great Pyramid has been measured, surveyed and speculated about for two centuries, and the honest position for most of that time was that we knew its inside as well as we ever would without taking it apart. Since 2015 that has changed, using a technique that involves neither drilling nor digging."
      ),
      h2("How You Look Through a Pyramid"),
      p(
        "Cosmic rays striking the upper atmosphere produce muons, particles that rain down constantly and pass through solid rock. They are absorbed slightly more by stone than by air. Put detectors inside and around a structure, count muons arriving from every direction over months, and denser regions cast a shadow while empty ones let more through."
      ),
      p(
        "It is medical imaging logic applied to architecture, with the sky as the source. Nothing is touched, and the pyramid is not disturbed."
      ),
      h2("What They Found"),
      ...bullets([
        "The ScanPyramids mission began in 2015, bringing together Egyptian authorities, Cairo University and several international research institutions",
        "In 2017 the team reported a large void above the Grand Gallery — on the order of thirty metres long, comparable in scale to the gallery itself. It was published in Nature and independently corroborated by more than one detector technology",
        "In 2023 a corridor of around nine metres was confirmed behind the chevron blocks on the north face, close to the original entrance, and an endoscope was passed through a joint to see inside it",
      ]),
      callout(
        "Both are spaces, not rooms. No burial, no objects, no inscriptions have been found in either. Headlines routinely upgrade them to hidden chambers, which is not what the researchers reported.",
        { title: "A Void Is Not a Chamber", tone: "Info" }
      ),
      h2("What They Might Be"),
      p(
        "The leading explanations are structural. Relieving spaces above the King's Chamber already demonstrate that the builders used voids to redistribute load, and the big void may be more of the same on a larger scale. Another line of argument is that it is a construction feature — an internal ramp or a working space left in place. The north-face corridor is most often read as a device to relieve pressure over the entrance, or as connected to how the entrance was originally arranged."
      ),
      p(
        "Nothing rules out something more interesting, and nothing supports it either. The pyramid is a tomb whose burial chamber we already have; the base rate for undiscovered treasure inside it is low."
      ),
      h2("Why It Matters for Visitors"),
      p(
        "Practically, nothing has changed about what you can walk into — the void and the corridor are not accessible and are unlikely to be. What has changed is the frame. The Great Pyramid is not a solved object in a display case. It is an active research site, with work ongoing, and there is a reasonable chance that something in the guidebook you carry will be out of date within a decade."
      ),
      faq(
        [
          { question: "What is ScanPyramids?", answer: "A research mission begun in 2015 using muon imaging and other non-invasive techniques to survey the interior of Egyptian pyramids without excavation, run by Egyptian authorities with international partners." },
          { question: "What did they find in the Great Pyramid?", answer: "A large void above the Grand Gallery, reported in 2017 and roughly thirty metres long, and a corridor of about nine metres behind the chevrons on the north face, confirmed in 2023." },
          { question: "Is the void a hidden chamber?", answer: "No burial, objects or inscriptions have been found. Researchers describe it as a void; structural or construction-related explanations are currently favoured." },
          { question: "How does muon imaging work?", answer: "Cosmic rays produce muons that pass through rock and are absorbed more by dense material than by air. Detectors count them over months, and empty spaces show up as regions where more muons arrive." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Four and a half thousand years of visitors, and it turns out we were standing next to two spaces nobody had noticed. It is a good argument for humility about what else is still in there."
      ),
      cta({
        title: "Stand at the North Face",
        body: "A private Giza day with time at the entrance, the chevrons and the interior — not a forty-minute stop.",
        buttonLabel: "See the Giza tour",
        buttonHref: "/tours/1-day-giza-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "giza-sound-and-light-show-guide",
    title: "The Giza Sound & Light Show: What It Actually Is",
    category: "Travel Guides",
    tags: ["Giza", "Sound and Light Show", "Sphinx", "Evening", "Planning"],
    author: editorialTeam,
    excerpt:
      "An evening show that has been projecting light and narration onto the Sphinx and the pyramids since 1961. What it is, what it isn't, who tends to enjoy it, and how to fit it around the rest of a day at Giza.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1667765460178-db9eae077f00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-03-01",
    primaryKeyword: "Giza sound and light show",
    secondaryKeywords: [
      "pyramids sound and light show",
      "Giza at night",
      "Sphinx light show",
      "things to do in Giza in the evening",
    ],
    relatedTours: toursBySlug("giza-pyramids-sound-and-light-show", "1-day-giza-tour"),
    seoTitle: "The Giza Sound & Light Show: An Honest Guide",
    seoDescription:
      "What the Sound & Light Show at the Giza pyramids is really like — running since 1961, narrated in several languages, and worth an evening for some visitors more than others.",
    body: [
      p(
        "Almost every Giza itinerary is built around the morning. The plateau at dawn is the photograph everyone came for, and by early afternoon most people are back at the hotel with sore feet. The Sound & Light Show is the reason to come back after dark, and it divides opinion more than almost anything else on an Egypt trip — which is a good argument for knowing what it is before you book."
      ),
      h2("What Happens"),
      p(
        "You sit in a tiered outdoor seating area facing the Sphinx, with the three pyramids behind it. Once it is properly dark, coloured light is projected onto the monuments themselves while a recorded narration — the Sphinx does the talking — runs through several thousand years of Egyptian history, with music underneath. The whole thing lasts under an hour."
      ),
      p(
        "The show has been running in some form since 1961, which makes it one of the oldest continuously staged productions of its kind anywhere. It has been reworked and re-equipped over the decades, but the format has not fundamentally changed: real monuments as the screen, a narrated story, and an audience sitting in the open air in front of them."
      ),
      h2("Who Tends to Love It, and Who Doesn't"),
      ...bullets([
        "Families with children, who usually respond to it far better than to a third temple in the heat",
        "Anyone who wants to see the pyramids lit at night without the daytime crowds and haze",
        "First-time visitors who like a narrative thread through the history rather than dates from a guide",
        "Less suited to travellers who want a contemporary, high-production spectacle — the tone is closer to classic theatre than to a modern projection-mapping show",
        "Less suited to anyone already exhausted, since it is an extra outing at the end of a long day",
      ]),
      callout(
        "Show times, ticket prices and the language schedule change from season to season and are worth confirming close to the date rather than relying on an older write-up. The narration runs in several languages on a rotating timetable, so the language matters as much as the time when you are choosing which night to go.",
        { title: "Check Before You Commit", tone: "Info" }
      ),
      h2("Practical Notes"),
      ...bullets([
        "It is outdoors and unheated. Desert nights get genuinely cold from late autumn through early spring — bring a layer even if the day was hot",
        "Seating is open-air tiered benches; there is no cover if the weather turns",
        "The view is of the Sphinx with the pyramids behind, so seats nearer the centre give the best perspective on the projection",
        "It pairs naturally with an early dinner in Giza rather than with a full second day of sightseeing",
      ]),
      h2("Is It Worth It?"),
      p(
        "If you have one night in Cairo, a rooftop dinner with a pyramid view is probably the better use of it. If you have two or three, and especially if you are travelling with children or with someone who found the daytime heat hard going, the show earns its place. It is also the only sanctioned way to be sitting in front of the Sphinx after dark, which is worth something on its own regardless of what you make of the script."
      ),
      faq(
        [
          {
            question: "How long is the Giza Sound & Light Show?",
            answer:
              "Under an hour. Allow extra time either side for arrival, seating and getting back to your transport.",
          },
          {
            question: "When did the show start?",
            answer:
              "1961. It has been re-equipped and revised many times since, but has run in essentially the same format — narration and light projected onto the monuments themselves — for over sixty years.",
          },
          {
            question: "What language is the narration in?",
            answer:
              "Several languages run on a rotating schedule across the week. Which language plays on a given night is set by that timetable, so confirm it when you book rather than assuming.",
          },
          {
            question: "Is it suitable for children?",
            answer:
              "Generally yes, and it is often the part of a Giza day that younger visitors enjoy most. It is outdoors and after dark, so bring warm layers outside the summer months.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "It is not a modern immersive experience and does not pretend to be. It is a piece of mid-century theatre staged against the only backdrop that could carry it, and it has been running long enough that a fair number of people in the audience are bringing children to something they were brought to themselves."
      ),
      cta({
        title: "See the Pyramids After Dark",
        body: "A private evening at the Sound & Light Show, with transfers from your hotel and back.",
        buttonLabel: "See the evening tour",
        buttonHref: "/tours/giza-pyramids-sound-and-light-show",
      }),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "future-of-smartphones-2026-papyrus-portable-information",
    title: "Smartphones in 2026 Are Foldable and AI-Native. Egypt Invented the First Portable Information Device 5,000 Years Ago.",
    category: "Culture & Trends",
    tags: ["Smartphones", "Foldable Phones", "AI Chips", "Papyrus", "Ancient Egypt"],
    author: editorialTeam,
    excerpt:
      "Foldable phone shipments are projected to jump 41–47% in 2026 as AI chips move from bolted-on to baked-in. Papyrus, invented in Egypt roughly 5,000 years ago, solved an almost identical problem: how to make information light, portable, and fast to move.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1608546043931-6c9678ea9feb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-02-01",
    primaryKeyword: "future of smartphones 2026",
    secondaryKeywords: ["foldable phones 2026", "AI-native smartphones", "papyrus history", "ancient Egypt information technology"],
    seoTitle: "Smartphones in 2026, and Egypt's 5,000-Year-Old Portability Breakthrough",
    seoDescription:
      "Foldable phone shipments are projected to jump 41–47% in 2026 as AI moves on-device. Papyrus, invented in Egypt around 3000 BC, was the ancient world's own breakthrough in portable information technology.",
    body: [
      p(
        "Smartphones in 2026 are converging on two big shifts at once: foldable form factors are finally becoming mainstream rather than niche, and AI has moved from a marketed add-on feature to something built into the chip from the ground up. Analysts project global foldable phone shipments will reach 24 to 25 million units in 2026, a 41% to 47% jump over 2025's roughly 17 million — driven partly by Apple's long-anticipated entry into the category."
      ),
      h2("What 'Next-Gen' Actually Means in 2026"),
      ...bullets([
        "New processors — Qualcomm's Snapdragon 8 Gen 5, ARM's Lumex, Google's Tensor G5 — are built from the ground up for on-device \"edge\" AI rather than having AI features added afterward",
        "Dedicated AI chips are now standard in flagship phones, handling real-time photo enhancement, voice recognition, and predictive text entirely on-device",
        "Foldable, book-style designs with near-creaseless screens are becoming the practical standard rather than an experimental niche",
      ]),
      callout(
        "The shift analysts keep pointing to isn't a single new feature — it's AI moving from \"bolted-on\" (a separate app or cloud service) to \"baked-in\" (silicon designed around it from the start). It's a genuinely different kind of upgrade than a faster processor or a better camera.",
        { title: "Bolted-On vs. Baked-In", tone: "Info" }
      ),
      h2("Egypt's Own Portability Breakthrough, About 5,000 Years Earlier"),
      p(
        "Papyrus, made from a reed plant that grew abundantly along the Nile, was first produced in Egypt as early as around 3000 BC, and it solved a version of the exact same engineering problem smartphones are still solving today: how to make information as light, thin, and portable as possible. Compared to what came before it — heavy clay tablets, carved stone — papyrus was a genuine breakthrough: thin sheets that could be joined into long rolls, light enough to carry across huge distances, and durable enough to survive the trip. Egypt exported papyrus across the ancient Mediterranean world for millennia, effectively exporting the ancient world's dominant portable information technology, the way a chip design or an operating system gets licensed and exported today."
      ),
      h2("Same Problem, Completely Different Materials"),
      p(
        "Every generation ends up re-solving the identical underlying engineering problem: how to store and move information on the smallest, lightest, most durable physical medium available, with the fastest possible access to it. Papyrus solved it with a reed and a Nile floodplain. 2026 solves it with folding glass, an AI chip running inference locally rather than in the cloud, and a data connection. The materials are unrecognizable. The ambition — make information genuinely portable — has been running, essentially uninterrupted, since roughly 3000 BC."
      ),
      faq(
        [
          {
            question: "How much will foldable phone shipments grow in 2026?",
            answer:
              "Global foldable phone shipments are projected to reach 24 to 25 million units in 2026, a 41% to 47% increase over 2025's estimated 17 million units, driven partly by Apple's anticipated entry into the category.",
          },
          {
            question: "What does 'AI-native' mean for 2026 smartphones?",
            answer:
              "It refers to processors like Qualcomm's Snapdragon 8 Gen 5 and Google's Tensor G5 being designed from the ground up around on-device AI inference, rather than having AI features added on top of a chip designed for other purposes.",
          },
          {
            question: "What is papyrus and why was it significant?",
            answer:
              "Papyrus is a writing material made from a reed plant native to the Nile, first produced in Egypt around 3000 BC. It was a major portability breakthrough over clay tablets and stone — thin, light, and durable enough to be traded across the ancient Mediterranean world.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A folding phone with an on-device AI chip and a 3,000-BC reed scroll are separated by five thousand years of material science and almost nothing else — the same basic human ambition to make information portable, running on whatever the best available technology happened to be."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "rosetta-stone-what-it-says",
    title: "The Rosetta Stone: What It Actually Says, and Why It Isn't in Egypt",
    category: "History & Culture",
    tags: ["Rosetta Stone", "Hieroglyphs", "Champollion", "Ptolemaic Egypt", "Repatriation"],
    author: editorialTeam,
    excerpt:
      "It is the most visited object in the British Museum and one of the least read. The Rosetta Stone is a tax decree — and the reason anyone alive today can read a hieroglyph at all.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1608817576203-3c27ed168bd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "what does the Rosetta Stone say",
    secondaryKeywords: [
      "Rosetta Stone translation",
      "who deciphered hieroglyphs",
      "Rosetta Stone British Museum",
      "Rosetta Stone repatriation",
    ],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour", "alexandria-day-trip"),
    seoTitle: "What the Rosetta Stone Says, and Why It's in London",
    seoDescription:
      "A priestly decree from 196 BC, written three times over, found near Rashid in 1799 and deciphered in 1822. What the Rosetta Stone actually records, and how it left Egypt.",
    body: [
      p(
        "The Rosetta Stone is the object most people can name before they know anything else about ancient Egypt, and the one whose actual contents almost nobody can describe. It is not a key, a code or a dictionary. It is a slab of granodiorite carrying the same administrative announcement three times, in three different writing systems — and that redundancy is the whole point."
      ),
      h2("What It Says"),
      p(
        "The text is a decree issued by a council of priests assembled at Memphis in 196 BC, in the ninth year of the reign of Ptolemy V Epiphanes, a Greek-speaking king of Egypt who had come to the throne as a child. It confirms the honours to be paid to him in the temples, records tax concessions and an amnesty, and orders that the decree itself be carved and set up in temples across the country."
      ),
      p(
        "Read plainly, it is a piece of state administration: a young king shoring up support with the priesthood, and the priesthood publicising the arrangement. Copies were made and distributed, which is why other, more fragmentary versions of the same decree have since been found elsewhere in Egypt."
      ),
      h2("Why Three Scripts"),
      ...bullets([
        "Hieroglyphic — the formal script of monuments and religious texts, at the top of the stone and the most damaged section",
        "Demotic — the everyday cursive script used for administration and daily life in this period, occupying the middle and best-preserved band",
        "Ancient Greek — the language of the Ptolemaic court and government, at the bottom",
      ]),
      p(
        "The decree was published in all three because Egypt in 196 BC ran in all three. That bureaucratic thoroughness is what made the stone useful two thousand years later: scholars could already read Ancient Greek fluently, and the Greek text told them what the other two must say."
      ),
      h2("How It Was Found, and How It Left"),
      p(
        "French soldiers came across it in July 1799 while rebuilding fortifications at Fort Julien, near the town of el-Rashid — Rosetta to Europeans — in the western Delta, during Napoleon's campaign in Egypt. It was almost certainly not in its original position; blocks from older monuments were routinely reused as building material."
      ),
      p(
        "When the French forces capitulated to the British in 1801, the antiquities collected by the expedition passed to Britain under the terms of the surrender. The stone reached London and has been on display in the British Museum since 1802, where it remains the museum's most visited object. Egypt has repeatedly requested its return, most prominently through campaigns led by former antiquities minister Zahi Hawass; the museum has not agreed to it."
      ),
      callout(
        "Deciphering it took another two decades. Thomas Young made real progress on the Demotic and identified the royal names in cartouches. Jean-François Champollion announced the breakthrough in 1822, recognising that the script recorded sounds as well as ideas — a realisation helped by his knowledge of Coptic, the last stage of the Egyptian language.",
        { title: "Twenty-Three Years to Read", tone: "Info" }
      ),
      h2("What It Means for What You See in Egypt"),
      p(
        "Every hieroglyphic caption you read on a temple wall in Luxor or Aswan, every royal name a guide picks out of a cartouche, every dated inscription in a museum case, descends from that 1822 breakthrough. Before it, Egypt's own written record was mute; travellers stood in front of the same walls you will and could only guess. It is worth carrying that thought around Karnak — that the ability to read the building you are standing in is barely two hundred years old."
      ),
      faq(
        [
          {
            question: "What does the Rosetta Stone actually say?",
            answer:
              "It records a decree issued by priests at Memphis in 196 BC confirming honours for the young king Ptolemy V, along with tax concessions and an amnesty, and ordering that the decree be set up in temples throughout Egypt.",
          },
          {
            question: "Why is the Rosetta Stone written three times?",
            answer:
              "In hieroglyphic, Demotic and Ancient Greek — the three scripts in official use in Egypt at the time. Because scholars could already read the Greek, it gave them a way into the other two.",
          },
          {
            question: "Who deciphered the hieroglyphs?",
            answer:
              "Jean-François Champollion announced the decipherment in 1822, building on earlier progress by Thomas Young. Champollion's knowledge of Coptic was central to recognising that the script recorded sounds.",
          },
          {
            question: "Where is the Rosetta Stone now?",
            answer:
              "In the British Museum in London, where it has been displayed since 1802. Egypt has made repeated requests for its return.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A committee of priests wanted a tax arrangement recorded where everyone could read it, so they had it written out three times. It is the most consequential act of bureaucratic over-communication in history."
      ),
      cta({
        title: "See the Objects That Stayed",
        body: "The Egyptian Museum holds decrees, stelae and papyri from the same world — read today only because of what that one slab unlocked.",
        buttonLabel: "See the museum tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
      }),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "tesla-autonomous-driving-2026-way-of-horus-ancient-road",
    title: "Tesla's Robotaxis Are Learning America's Roads in 2026. Egypt Engineered the World's First Reliably Mapped Road 3,500 Years Ago.",
    category: "Tech & AI",
    tags: ["Tesla", "Autonomous Driving", "Robotaxi", "Way of Horus", "Ancient Egypt"],
    author: editorialTeam,
    excerpt:
      "Tesla began unsupervised robotaxi rides in four US cities in 2026, still working through route-planning errors. New Kingdom Egypt solved a primitive version of the same problem 3,500 years ago, with a precisely engineered desert road.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1601532400311-b1c7cc03fd65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2026-12-01",
    primaryKeyword: "Tesla autonomous driving 2026",
    secondaryKeywords: ["Tesla robotaxi 2026", "Tesla FSD unsupervised", "Way of Horus ancient road", "New Kingdom Egypt infrastructure"],
    relatedTours: toursBySlug("st-catherine-monastery-sinai-tour"),
    seoTitle: "Tesla's 2026 Robotaxi Rollout, and Egypt's 3,500-Year-Old Precedent",
    seoDescription:
      "Tesla launched unsupervised robotaxi rides in four US cities in 2026, still working through navigation errors. New Kingdom Egypt engineered a precisely mapped desert road for the same underlying problem, 3,500 years earlier.",
    body: [
      p(
        "Tesla's robotaxi ambitions moved from demo to real deployment in 2026. Production Cybercabs began engineering test drives on public roads, and by July, unsupervised rides had launched in Austin, Miami, Orlando, and Tampa. A broader rollout of unsupervised Full Self-Driving for owners who purchased the feature is scheduled to begin in Q4 2026, starting in geographies where the system has already proven itself — a gradual, validated expansion rather than a single nationwide switch."
      ),
      h2("Where Robotaxis Actually Stand in 2026"),
      ...bullets([
        "Independent testing by AMCI Testing found Tesla's camera-only FSD system has improved significantly in vehicle control and lane positioning, but still shows route-planning mistakes and occasional glitches",
        "Unsupervised rides launched in four US cities in July 2026, with a broader owner rollout planned for Q4 2026 in validated geographies",
        "Tesla has begun Cybercab production, its purpose-built autonomous EV designed as the dedicated workhorse of the robotaxi fleet",
      ]),
      callout(
        "The core challenge AMCI's evaluators kept flagging wasn't raw driving skill — it was reliability in unpredictable, unmapped situations. Good control, good lane positioning, and still, occasionally, the wrong call about where to actually go.",
        { title: "The Hard Part Isn't Driving. It's Predictability.", tone: "Info" }
      ),
      h2("Egypt Engineered a Precisely Mapped Corridor 3,500 Years Ago"),
      p(
        "New Kingdom Egypt built a version of the identical underlying solution roughly 3,500 years earlier, for an equally unforgiving environment. The \"Way of Horus\" was a heavily fortified military and trade road running along the northern coast of the Sinai Peninsula, connecting Egypt to Canaan — documented in detail in reliefs from the reign of Seti I (around the 1290s BC) at Karnak, which depict a sequence of fortresses and wells spaced at consistent, reliable intervals along the route. It wasn't simply a path worn into the sand. It was engineered infrastructure: known stopping points, known water sources, known distances between them, built specifically so an army — or a trading caravan — could cross an otherwise lethal open desert predictably and repeatably, without needing to rediscover the route, or gamble on finding water, every single time."
      ),
      h2("Same Underlying Problem: Make an Unpredictable Environment Predictable"),
      p(
        "Tesla's 2026 robotaxi challenge is a modern version of the identical category of problem: an unpredictable physical environment — city streets, edge cases, unmapped construction, an unexpected pedestrian — needs to become reliably navigable by something other than a human improvising moment to moment. New Kingdom Egypt solved a more primitive version of that exact problem with fixed, known infrastructure — forts, wells, marked distances — that converted an unreliable, dangerous stretch of desert into something repeatable. The tools are separated by 3,500 years and an almost unimaginable gap in technology, but the underlying engineering goal is identical: build enough known, reliable structure into an environment that predictable, repeatable travel becomes possible without requiring a uniquely skilled human to improvise it fresh every time."
      ),
      faq(
        [
          {
            question: "Where has Tesla launched unsupervised robotaxi rides in 2026?",
            answer:
              "Unsupervised rides launched in Austin, Miami, Orlando, and Tampa in July 2026, with a broader rollout of unsupervised Full Self-Driving for owners planned for Q4 2026, starting in geographies where the system has already demonstrated reliability.",
          },
          {
            question: "What is the Way of Horus?",
            answer:
              "A heavily fortified ancient Egyptian road running along the northern Sinai coast, connecting Egypt to Canaan, documented in New Kingdom reliefs (notably from Seti I's reign, circa 1290s BC) showing fortresses and wells spaced at reliable intervals to make desert crossing predictable and repeatable.",
          },
          {
            question: "What problems does Tesla's FSD still have in 2026?",
            answer:
              "Independent testing by AMCI Testing found the camera-only system has improved substantially in vehicle control and lane positioning, but continues to show route-planning mistakes and occasional glitches — reliability in unpredictable situations remains the central challenge.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Making an unpredictable environment reliably crossable isn't a new engineering problem — it's one of the oldest ones there is. Egypt just happened to solve an early version of it with forts and wells, thirty-five centuries before anyone needed to solve it with cameras and neural networks."
      ),
      cta({
        title: "Cross the Same Desert, the Modern Way",
        body: "St. Catherine's Monastery and Mount Sinai — reliable, guided desert travel across the same peninsula the Way of Horus once mapped.",
        buttonLabel: "See the Sinai Tour",
        buttonHref: "/tours/st-catherine-monastery-sinai-tour",
      }),
    ],
  },
];
