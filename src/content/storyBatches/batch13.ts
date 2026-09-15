import type { Story } from "../types";
import { authors } from "../authors";
import { tours } from "../tours";
import { p, h2, bullets, callout, faq, cta } from "../storyBlocks";

const editorialTeam = authors[0];

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

// World-trends cohort, batch 8 of 10: space exploration, Mars/human
// spaceflight, climate change, functional wellness drinks, and
// longevity fitness. Facts (Artemis II's April 2026 lunar flyby,
// Starship's 2026 Mars ambitions, 2026 global temperature and heat
// records, the 2026 functional beverage market, and 2026 longevity
// exercise research) were verified via web search at the time of
// writing — see contentReviewDate on each story.

export const stories: Story[] = [
  {
    status: "published",
    featured: false,
    slug: "ancient-egyptian-astronomy",
    title: "How the Egyptians Read the Sky, and Built Temples to Match It",
    category: "History & Culture",
    tags: ["Astronomy", "Sirius", "Dendera", "Calendar", "Temples"],
    author: editorialTeam,
    excerpt:
      "A 365-day calendar, a clock made of stars painted inside coffin lids, and a new year announced by one star rising just before dawn. Egyptian astronomy was practical before it was anything else.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "ancient Egyptian astronomy",
    secondaryKeywords: ["Egyptian calendar", "Sirius heliacal rising Egypt", "Dendera zodiac", "Egyptian star clocks"],
    relatedTours: toursBySlug("dendera-abydos-day-tour", "luxor-east-bank-day-tour"),
    seoTitle: "Ancient Egyptian Astronomy: Calendar, Stars and Temples",
    seoDescription:
      "The 365-day civil calendar, the decan star clocks on coffin lids, the heliacal rising of Sirius that announced the flood, and the Dendera zodiac — Egyptian sky-watching, explained.",
    body: [
      p(
        "Egyptian astronomy was not stargazing. It was scheduling. A civilisation whose entire agricultural economy depended on a river that flooded once a year needed to know when — and the sky was the only reliable notice board available."
      ),
      h2("The Star That Started the Year"),
      p(
        "Sirius, which the Egyptians called Sopdet, spends part of each year lost in the sun's glare. Its heliacal rising — the first morning it becomes visible again just before dawn — fell close to the beginning of the Nile inundation. That coincidence made it the most important astronomical event in the Egyptian year, and the anchor for the calendar."
      ),
      h2("A Calendar That Drifted on Purpose"),
      ...bullets([
        "Twelve months of thirty days, divided into three seasons of four months each — inundation, emergence and harvest",
        "Five additional days at the end, the epagomenal days, on which five gods were held to have been born",
        "That gives 365 days with no leap day, so the civil calendar slipped against the solar year by roughly a day every four years",
        "Over about 1,460 years it drifts all the way round and returns — a cycle Egyptologists still use to help date events",
      ]),
      p(
        "The Egyptians were fully aware of the slippage. They simply ran a fixed administrative calendar alongside observation of the sky, which is a solution any accountant would recognise."
      ),
      h2("Clocks Made of Stars"),
      p(
        "The night was divided using decans: thirty-six star groups that rise in succession through the year, each marking an hour of darkness as it appears. Tables of them were painted on the inside of Middle Kingdom coffin lids — diagonal star clocks, so the dead could keep track of the hours. Priests used sighting instruments, the merkhet and a slotted palm rib, to line up on stars for temple observations and orientation."
      ),
      callout(
        "The Dendera zodiac, from the ceiling of a chapel at the temple of Hathor, is the most famous Egyptian sky map — and it is late, from the Ptolemaic or Roman period, mixing Egyptian decans with Babylonian and Greek zodiac signs. What you see at Dendera today is a cast; the original was removed to France in 1821 and is in the Louvre.",
        { title: "About the Dendera Zodiac", tone: "Info" }
      ),
      h2("Buildings Pointed at the Sky"),
      p(
        "Temple foundation rituals included an act called the stretching of the cord, in which the king and a priestess laid out the ground plan using sightings taken on the stars. The results are visible: the Great Pyramid is aligned to true north with an accuracy that still impresses surveyors, and the axis at Abu Simbel was set so that sunlight reaches the sanctuary twice a year."
      ),
      p(
        "Karnak's main axis, and the way the sun behaves along it around the winter solstice, has generated a large and occasionally overheated literature. Treat confident claims about precise stellar alignments carefully — some are well evidenced, many are not — but the basic point holds: these buildings were laid out by people watching the sky."
      ),
      faq(
        [
          { question: "How many days were in the ancient Egyptian calendar?", answer: "365 — twelve months of thirty days across three seasons, plus five epagomenal days at the year's end. With no leap day, it drifted against the solar year by about a day every four years." },
          { question: "Why was Sirius important to the Egyptians?", answer: "Its heliacal rising, the first dawn appearance after weeks of invisibility, fell close to the start of the Nile flood, making it the key marker of the new year." },
          { question: "What are decans?", answer: "Thirty-six star groups that rise in sequence through the year. The Egyptians used them to divide the night into hours, and painted tables of them inside coffin lids as star clocks." },
          { question: "Is the Dendera zodiac ancient Egyptian?", answer: "It is from the Ptolemaic or Roman period and blends Egyptian decans with Babylonian and Greek zodiac signs. The original is in the Louvre; a cast is displayed at Dendera." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "They were not looking for meaning in the stars so much as a date. That they got a working calendar, a night clock and buildings aligned to true north out of it is what makes the achievement worth the detour to Dendera."
      ),
      cta({
        title: "See the Ceiling at Dendera",
        body: "One of the best-preserved painted ceilings in Egypt, on a day trip most Nile itineraries leave out.",
        buttonLabel: "See the Dendera tour",
        buttonHref: "/tours/dendera-abydos-day-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "hatshepsut-expedition-to-punt",
    title: "Hatshepsut's Expedition to Punt, Told on the Walls at Deir el-Bahari",
    category: "History & Culture",
    tags: ["Hatshepsut", "Deir el-Bahari", "Punt", "Luxor West Bank", "New Kingdom"],
    author: editorialTeam,
    excerpt:
      "A colonnade at Deir el-Bahari carries the illustrated report of a trading voyage sent south around 1470 BC — the ships, the cargo, the houses on stilts, and the ruler of Punt with his wife. Nobody is certain where they went.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1591040608370-e51e70b4b7ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "Hatshepsut expedition to Punt",
    secondaryKeywords: [
      "Land of Punt",
      "Deir el-Bahari reliefs",
      "Hatshepsut temple Luxor",
      "ancient Egyptian trade",
    ],
    relatedTours: toursBySlug("valley-of-the-kings-hatshepsut-temple-tour", "luxor-west-bank-day-tour"),
    seoTitle: "Hatshepsut's Punt Expedition and Its Reliefs at Deir el-Bahari",
    seoDescription:
      "Around 1470 BC Hatshepsut sent five ships south to the land of Punt and had the whole voyage carved onto her temple. What the reliefs show, and why the destination is still debated.",
    body: [
      p(
        "Most visitors to Deir el-Bahari photograph the terraces from the approach, walk up, look at the colonnades and leave. The reliefs on the south side of the middle colonnade are worth stopping at, because they are something genuinely unusual in Egyptian art: an illustrated expedition report."
      ),
      h2("What Was Sent, and When"),
      p(
        "In roughly the ninth year of her reign — around 1470 BC — Hatshepsut dispatched a fleet of five ships to the land the Egyptians called Punt. Egypt had traded with Punt on and off for centuries by then; what makes this voyage exceptional is not that it happened but that Hatshepsut had the entire thing carved onto the walls of her mortuary temple in narrative sequence."
      ),
      h2("What the Walls Show"),
      ...bullets([
        "The ships themselves — rigging, oars, steering gear — in enough detail that naval historians still use the reliefs as a source on Egyptian seagoing vessels",
        "Punt's houses, shown raised on stilts and reached by ladders, among palms",
        "The ruler of Punt, named as Parahu, and his wife Ati, whose distinctive physique is one of the most discussed depictions in Egyptian art",
        "The cargo being loaded: ebony, ivory, gold, animal skins, live baboons, and above all myrrh",
        "Living incense trees, roots balled and carried in baskets slung on poles, being brought back to be planted at the temple",
      ]),
      callout(
        "The trees are the detail that lingers. Hatshepsut did not just import incense — she imported the plants, to grow at Deir el-Bahari. Pits that may have held them have been identified on the temple terrace. It is a very long way to go for a garden.",
        { title: "They Brought Back the Trees", tone: "Info" }
      ),
      h2("Where Was Punt?"),
      p(
        "This is the part nobody can close. Punt lay south and east of Egypt, reached by sea, and the goods that came from it — myrrh, ebony, ivory, gold, exotic animals — point to the southern Red Sea region. The main candidates are the coast of modern Eritrea and eastern Sudan, and the Horn of Africa more broadly. Analysis of mummified baboons from Egyptian contexts has been used to argue for particular regions, and the question remains genuinely open."
      ),
      p(
        "What is not in doubt is the seamanship. This was a round trip down the Red Sea and back, with cargo, in vessels built for it — launched from a Red Sea port after the ships were carried in pieces across the desert from the Nile."
      ),
      h2("Seeing the Reliefs"),
      ...bullets([
        "They are on the middle terrace, south colonnade — ask your guide directly, because it is easy to walk past on the way to the upper level",
        "Go early. Deir el-Bahari sits in a natural amphitheatre of rock that holds heat brutally by late morning",
        "The temple is normally combined with the Valley of the Kings and the Colossi of Memnon in one West Bank morning",
      ]),
      faq(
        [
          {
            question: "What was the land of Punt?",
            answer:
              "A trading partner of ancient Egypt lying south and east, reached by sea, and the source of myrrh, ebony, ivory, gold and exotic animals. Its exact location is still debated — most candidates lie around the southern Red Sea, in modern Eritrea, eastern Sudan or the Horn of Africa.",
          },
          {
            question: "When did Hatshepsut send the expedition to Punt?",
            answer:
              "Around 1470 BC, roughly the ninth year of her reign. Five ships made the voyage.",
          },
          {
            question: "Where can you see the Punt reliefs?",
            answer:
              "On the south side of the middle colonnade at Hatshepsut's mortuary temple at Deir el-Bahari, on the Luxor West Bank.",
          },
          {
            question: "What did the expedition bring back?",
            answer:
              "Myrrh and other incense, ebony, ivory, gold, animal skins and live baboons — and living incense trees with their roots packed in baskets, intended for planting at the temple.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A queen sent five ships into waters her scribes could barely describe, and when they came back she had the whole voyage carved on her temple — the boats, the houses, the trees, the people. Three and a half thousand years later we can still read the shipping manifest but cannot agree on the destination."
      ),
      cta({
        title: "Stand in Front of the Reliefs",
        body: "A private West Bank morning at Deir el-Bahari and the Valley of the Kings, timed to beat the heat and the coaches.",
        buttonLabel: "See the West Bank tour",
        buttonHref: "/tours/valley-of-the-kings-hatshepsut-temple-tour",
      }),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "climate-change-2026-egypt-old-kingdom-megadrought",
    title: "2026 Is on Track to Be One of the Hottest Years on Record. Egypt Already Lived Through a Climate Collapse, 4,200 Years Ago.",
    category: "Science & Space",
    tags: ["Climate Change", "Extreme Heat 2026", "Old Kingdom Egypt", "Nile Floods", "4.2-Kiloyear Event"],
    author: editorialTeam,
    excerpt:
      "2026 is on track to be among the four hottest years on record, with an 86% chance a year before 2030 surpasses 2024's record. Egypt already lived through a real climate collapse roughly 4,200 years ago, when the Nile flood itself failed.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1711278366623-f835e06f1438?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2026-12-01",
    primaryKeyword: "climate change 2026",
    secondaryKeywords: ["hottest year on record 2026", "4.2 kiloyear event", "Old Kingdom Egypt collapse", "Nile flood drought"],
    seoTitle: "Climate Change in 2026, and Egypt's Own 4,200-Year-Old Precedent",
    seoDescription:
      "2026 is on track to be among the four hottest years on record globally. Egypt's Old Kingdom lived through a real climate-driven collapse roughly 4,200 years ago, when the Nile flood itself failed for years running.",
    body: [
      p(
        "2026 has been a hot year by any measure. The UN's World Meteorological Organization puts the odds at 86% that at least one year between 2026 and 2030 will surpass 2024 as the hottest ever recorded, and 91% that global temperatures will temporarily exceed 1.5°C above pre-industrial levels in at least one of the next five years. 2026 itself is expected to be the fourth consecutive year to exceed 1.4°C of warming. June 2026 was the hottest June on record for Western Europe, with some locations running as much as 8°C above the 1991–2020 average, and record heat fueled deadly wildfires across Chile's Biobío and Ñuble regions, killing at least 21 people and forcing tens of thousands to evacuate."
      ),
      h2("The 2026 Numbers"),
      ...bullets([
        "86% chance at least one year between 2026 and 2030 surpasses 2024 as the hottest year on record",
        "91% likelihood of temporarily exceeding 1.5°C of warming in at least one of the next five years",
        "June 2026 was the hottest June on record for Western Europe, with some areas up to 8°C above the historical average",
      ]),
      callout(
        "Meteorologists attribute 2026's extreme heat to a combination of factors compounding each other: human-driven climate change, a strengthening El Niño, exceptionally warm oceans, and persistent atmospheric weather patterns — not any single cause acting alone.",
        { title: "Why 2026's Heat Is Compounding, Not Isolated", tone: "Info" }
      ),
      h2("Egypt Already Lived Through a Version of This, 4,200 Years Ago"),
      p(
        "Between roughly 2200 and 1900 BC, an abrupt climate shift known as the 4.2-kiloyear BP aridification event triggered a widespread megadrought across the Mediterranean, west Asia, the Indus Valley, and northeast Africa — evidence for which comes from radiocarbon-dated lakebed sediments, coral records, ice cores, tree rings, and cave formations. In Egypt specifically, the Nile's flow plummeted to a 200-year minimum around 2200 BC, and consecutive years of low floods, confirmed by ancient nilometer records and modern sediment studies, cut harvests by as much as half."
      ),
      p(
        "The consequences were real and severe. Widespread famine followed, and Egypt's Old Kingdom, one of the most centralized and sophisticated states of its era, collapsed around 2181 BC — ushering in the First Intermediate Period, a genuine era of political fragmentation, internal conflict, and hardship that historical sources connect directly to the sustained failure of the flood the entire civilization's food supply depended on."
      ),
      h2("What the Comparison Actually Teaches"),
      p(
        "This isn't a claim that 2026's warming leads directly to societal collapse — the scale, mechanisms, and modern resilience are all genuinely different. What it is is a real historical case study demonstrating that when the specific hydrological system a civilization built its entire food supply around fails for a sustained stretch, the consequences are severe and measurable, even for one of the most sophisticated, centralized states of its time. It's a sobering data point on how much depends on climate staying within the range history has actually tested."
      ),
      faq(
        [
          {
            question: "How hot is 2026 expected to be?",
            answer:
              "2026 is expected to be the fourth consecutive year to exceed 1.4°C of warming above pre-industrial levels, with an 86% chance that at least one year between 2026 and 2030 surpasses 2024 as the hottest year on record globally.",
          },
          {
            question: "What was the 4.2-kiloyear event?",
            answer:
              "An abrupt climate shift roughly 2200–1900 BC that triggered a widespread megadrought across the Mediterranean, west Asia, the Indus Valley, and northeast Africa, contributing to the collapse of Egypt's Old Kingdom around 2181 BC when the Nile flood failed for years running.",
          },
          {
            question: "How did the Nile flood failure affect Old Kingdom Egypt?",
            answer:
              "Around 2200 BC, Nile flow dropped to a 200-year minimum, and consecutive years of low floods cut harvests by as much as half, contributing to widespread famine and the political fragmentation of the First Intermediate Period that followed the Old Kingdom's collapse.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The Nile flood was, for millennia, the single input Egyptian civilization could least afford to lose. It failed once, catastrophically, roughly 4,200 years ago — a real, documented reminder of what happens when a climate system a society depends on stops behaving the way it always has."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "ancient-egyptian-beer",
    title: "Ancient Egyptian Beer: Daily Wage, Daily Bread, and Medicine",
    category: "History & Culture",
    tags: ["Beer", "Food and Drink", "Daily Life", "Hierakonpolis", "Ancient Egypt"],
    author: editorialTeam,
    excerpt:
      "Beer was not a treat in ancient Egypt. It was payment, nutrition, offering and the base for a large part of the medical pharmacopoeia — and it was being brewed at industrial scale before the pyramids.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1590133324192-1df305deea6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "ancient Egyptian beer",
    secondaryKeywords: ["Egyptian brewing history", "beer as wages Egypt", "Ebers Papyrus remedies", "ancient Egyptian food"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour", "islamic-coptic-cairo-walking-tour"),
    seoTitle: "Ancient Egyptian Beer: Wages, Nutrition and Medicine",
    seoDescription:
      "How Egyptians brewed, why beer was paid as wages, what the medical papyri prescribed it for, and what excavated breweries reveal about the scale of production.",
    body: [
      p(
        "Every account of ancient Egyptian daily life mentions that workers were paid in bread and beer, and most leave it there as a curiosity. It is worth taking literally. Beer was a staple food, a unit of payment, a temple offering and the standard vehicle for medicine — and the state organised its production accordingly."
      ),
      h2("Brewing at Scale, Very Early"),
      p(
        "Excavations at Hierakonpolis in Upper Egypt uncovered installations for brewing on a scale well beyond a household, dating to the Predynastic period — several centuries before the first pyramid. Vats capable of producing hundreds of litres at a time indicate organised production for a workforce or an institution, right at the point Egypt was becoming a unified state."
      ),
      h2("What It Was Actually Like"),
      ...bullets([
        "Thick, cloudy and low in alcohol by modern standards — closer to a soupy grain drink than to anything on a modern bar",
        "Nutritious enough to be a genuine part of the diet rather than an indulgence, which is the key to understanding it as a wage",
        "Made from emmer wheat and barley; the long-standing textbook account has lightly baked bread crumbled into water to ferment, though excavated evidence increasingly points to direct malting and mashing",
        "Strained before drinking, or drunk through a filter, because of the suspended grain",
        "Brewed largely by women in domestic contexts and by organised labour in institutional ones",
      ]),
      h2("Beer as Payment"),
      p(
        "Ration lists from work sites record daily allocations of bread and beer by rank. This is not a metaphor for wages: grain and its products were the currency in which labour was compensated, and the Deir el-Medina strike under Ramesses III happened because those rations arrived late. When the beer stopped, work stopped."
      ),
      callout(
        "The Ebers Papyrus and other medical texts prescribe beer constantly — as the liquid in which remedies were mixed and taken. Its role there is closest to a syrup base: the delivery mechanism for whatever the physician was actually administering.",
        { title: "Beer in the Medical Papyri", tone: "Info" }
      ),
      h2("A Genuinely Odd Finding"),
      p(
        "One frequently cited study identified tetracycline — an antibiotic — in human bone from a population in Nubia dating to roughly the fourth to sixth centuries AD, and argued it entered the diet through grain contaminated with a soil bacterium, most plausibly via beer. It is a striking result, and worth stating precisely: it concerns Nubia in the Roman and post-Roman period, not pharaonic Egypt, and the argument is contested. It is not evidence that Egyptians brewed antibiotics on purpose."
      ),
      h2("Where to See the Evidence"),
      p(
        "Museum collections hold brewing models — small wooden figures shown mashing, straining and pouring, placed in tombs so the work would continue in the afterlife. Tomb paintings show the whole sequence. Both are more informative than any object, because they record the process step by step for people who already knew how it went."
      ),
      faq(
        [
          { question: "Did ancient Egyptians drink beer every day?", answer: "Yes. It was a dietary staple across social levels, issued as part of daily rations at work sites and consumed by adults and children alike." },
          { question: "Were Egyptian workers paid in beer?", answer: "Grain and its products, bread and beer, were the standard form of compensation. Ration lists record daily allocations by rank, and late rations caused the recorded strike at Deir el-Medina." },
          { question: "What did ancient Egyptian beer taste like?", answer: "Thick and cloudy, low in alcohol, and closer to a grain-based food than a modern beer. It was strained or drunk through a filter because of suspended solids." },
          { question: "Was Egyptian beer used as medicine?", answer: "It was the usual liquid base in which remedies were mixed and administered in texts such as the Ebers Papyrus — a vehicle for the active ingredients rather than the treatment itself." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A society that paid its tomb-builders in beer, offered it to its gods and dissolved its medicines in it was not being indulgent. It had simply built its economy on the one thing the Nile reliably produced."
      ),
      cta({
        title: "See How Egypt Ate and Drank",
        body: "Brewing models, granary scenes and the everyday objects of Egyptian life, in the Cairo collections.",
        buttonLabel: "See the museum tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "beni-hasan-tombs-wrestling-scenes",
    title: "Beni Hasan: The Tomb Walls Covered in Wrestling",
    category: "History & Culture",
    tags: ["Beni Hasan", "Middle Kingdom", "Minya", "Middle Egypt", "Off the Beaten Path"],
    author: editorialTeam,
    excerpt:
      "Cut into a cliff in Middle Egypt are Middle Kingdom tombs whose walls carry hundreds of wrestling holds, painted in sequence. Almost no tour goes there, which is most of the appeal.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "Beni Hasan tombs",
    secondaryKeywords: [
      "Beni Hasan wrestling scenes",
      "Middle Kingdom tombs Egypt",
      "Minya Egypt tombs",
      "off the beaten path Egypt",
    ],
    relatedTours: toursBySlug("dendera-abydos-day-tour", "16-day-egypt-hidden-gems"),
    seoTitle: "Beni Hasan: Middle Egypt's Wrestling Tombs",
    seoDescription:
      "Middle Kingdom rock-cut tombs above the Nile in Minya, where the walls carry hundreds of paired wrestling figures — and a caravan of Asiatic traders that historians still argue about.",
    body: [
      p(
        "There is a stretch of cliff on the east bank of the Nile, about halfway between Cairo and Luxor, that almost no visitor to Egypt sees. Thirty-nine rock-cut tombs were carved into it around four thousand years ago for the governors of the region. Four are open. Two of them are covered, wall to wall, in wrestling."
      ),
      h2("Where and When"),
      p(
        "Beni Hasan sits in the Minya governorate in Middle Egypt, a part of the country most itineraries fly straight over on the way south. The tombs belong to the Middle Kingdom — broadly the 11th and 12th dynasties, around 2000 to 1800 BC — and were cut for nomarchs, the provincial governors who ran their districts with a good deal of independence from the crown."
      ),
      p(
        "That independence shows in the tombs. These are not royal burials following a fixed programme. They are the tombs of powerful regional families, and what they chose to put on the walls is closer to a record of provincial life than to the funerary theology you see in the Valley of the Kings."
      ),
      h2("The Wrestling"),
      p(
        "The tombs of Baqet III and his son Kheti carry the scenes everyone comes for. Across the walls, in ordered rows, pairs of wrestlers are painted working through hold after hold — some two hundred pairs in a single tomb. The two figures in each pair are painted in contrasting colours, which is what makes the scenes readable: you can follow whose limb is whose through a throw."
      ),
      ...bullets([
        "The pairs are sequential rather than decorative — they document positions, transitions and outcomes in order",
        "Contrasting body colours separate the two wrestlers, a solution to a genuine visual problem that anyone who has tried to photograph a grapple will appreciate",
        "Alongside the wrestling are scenes of military training and siege, suggesting the governors kept and drilled their own forces",
      ]),
      callout(
        "The scenes are regularly described as the most detailed record of an organised combat sport surviving from the ancient world. Whether they were training manuals, a display of the governor's fighting men, or something between the two is still argued about — the tombs do not say.",
        { title: "What Were They For?", tone: "Info" }
      ),
      h2("The Other Famous Wall"),
      p(
        "In the tomb of Khnumhotep II is a scene that has generated more scholarly literature than the wrestling: a group of foreigners, labelled as Aamu, arriving with their families, livestock and goods, wearing distinctive coloured woollen clothing quite unlike Egyptian dress. It is one of the earliest detailed Egyptian depictions of people from the Levant, and it has been pulled into arguments about trade, migration and biblical chronology for over a century. Standing in front of it, what registers first is simply how carefully individual the figures are."
      ),
      h2("Going There"),
      ...bullets([
        "Beni Hasan is reached from Minya, roughly a four-hour drive south of Cairo, and there is a short climb from the road up to the tomb terrace",
        "It is normally visited as part of a longer Middle Egypt route rather than as a day trip from anywhere",
        "The site is quiet in a way almost nowhere else in Egypt is — it is entirely normal to have a tomb to yourself",
        "Access arrangements in Middle Egypt change from time to time and are worth confirming when you plan rather than assuming",
      ]),
      faq(
        [
          {
            question: "What is Beni Hasan known for?",
            answer:
              "Middle Kingdom rock-cut tombs whose painted walls carry hundreds of paired wrestling figures shown in sequence, along with military scenes and a much-discussed depiction of Asiatic traders arriving in Egypt.",
          },
          {
            question: "How old are the Beni Hasan tombs?",
            answer:
              "They date to the Middle Kingdom, broadly the 11th and 12th dynasties, around 2000 to 1800 BC — considerably older than the New Kingdom tombs at Luxor.",
          },
          {
            question: "Where is Beni Hasan?",
            answer:
              "On the east bank of the Nile in the Minya governorate of Middle Egypt, roughly halfway between Cairo and Luxor.",
          },
          {
            question: "Can you visit Beni Hasan?",
            answer:
              "Yes. Four of the thirty-nine tombs are open. It is usually included in a longer Middle Egypt itinerary rather than visited on its own, and access arrangements are worth confirming close to the date.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Egypt's headline sites are extraordinary and busy. Beni Hasan is extraordinary and empty, and the walls are covered in people throwing each other around — which is not what most visitors expect a four-thousand-year-old tomb to be about."
      ),
      cta({
        title: "Build a Middle Egypt Route",
        body: "Beni Hasan, Amarna, Dendera and Abydos sit on a stretch of the Nile most itineraries skip. We plan these privately, at your pace.",
        buttonLabel: "Plan a custom itinerary",
        buttonHref: "/customize",
      }),
    ],
  },
];
