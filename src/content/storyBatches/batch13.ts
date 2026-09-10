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
    slug: "space-exploration-2026-egypt-ancient-astronomy",
    title: "Space Exploration Keeps Pushing Outward in 2026. Egypt Was Mapping the Sky 3,500 Years Before Anyone Left It.",
    category: "Science & Space",
    tags: ["Space Exploration", "Artemis II", "Ancient Egyptian Astronomy", "Senenmut", "Star Charts"],
    author: editorialTeam,
    excerpt:
      "Artemis II carried four astronauts around the Moon in April 2026, part of a genuinely active year for space exploration. Egypt was systematically observing, recording, and building around the stars roughly 3,500 years before anyone left the ground.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1729335511904-9b8690184935?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "space exploration 2026",
    secondaryKeywords: ["Artemis II 2026", "ancient Egyptian astronomy", "Senenmut star ceiling", "pyramid stellar alignment"],
    seoTitle: "Space Exploration in 2026, and Egypt's 3,500-Year-Old Sky Maps",
    seoDescription:
      "Artemis II flew four astronauts around the Moon in April 2026. Egypt's own astronomical tradition — star ceilings, calendar-defining observations, and star-aligned monuments — predates spaceflight by roughly 3,500 years.",
    body: [
      p(
        "Space exploration had a genuinely active year in 2026. Artemis II carried four astronauts around the Moon in April, the first crewed lunar mission in over half a century, a major milestone on the path back toward the lunar surface. Commercial landers, expanding satellite constellations, and new space telescopes have kept 2026 a busy year for humanity's outward reach — even as the more ambitious goals, crewed lunar landings and eventual Mars missions, keep sliding a bit further down the calendar."
      ),
      h2("A Genuinely Active Year in Orbit and Beyond"),
      ...bullets([
        "Artemis II flew four astronauts on a crewed lunar flyby in April 2026, the first crewed mission beyond low Earth orbit in decades",
        "Commercial lunar landers and expanding satellite mega-constellations continued reshaping how routinely humanity operates beyond Earth's atmosphere",
        "New space telescopes and observation platforms kept extending how much of the sky can be systematically surveyed and recorded",
      ]),
      callout(
        "Every major space program in 2026 shares one unglamorous foundation: systematic, sustained observation of the sky, recorded carefully enough that a civilization can plan its biggest projects around what it sees. That foundation is a lot older than rocketry.",
        { title: "The Unglamorous Foundation Under Every Launch", tone: "Info" }
      ),
      h2("Egypt Was Already Mapping the Sky, 3,500 Years Before Liftoff"),
      p(
        "The tomb of Senenmut, steward to Hatshepsut, contains one of the oldest known astronomical ceilings in human history, dating to around 1473 BC. It depicts constellations, decan stars, and a lunar calendar system that Egyptian astronomers used to track time — a genuinely systematic star chart, painted onto stone roughly three and a half millennia before anyone could act on what it recorded by actually leaving the ground."
      ),
      p(
        "That observational tradition wasn't decorative — it was load-bearing for the entire civilization. The heliacal rising of Sirius (Sothis), observed and recorded with enough precision to predict, marked the start of the Egyptian year and reliably signaled the coming Nile flood the whole economy depended on. And Egypt's monumental architecture was built around the same observational discipline: the Great Pyramid's precise alignment to true north, and the narrow shafts within it theorized by some Egyptologists to target specific stars including Orion's Belt and Sirius, reflect generations of careful, repeated stellar observation translated directly into stone."
      ),
      h2("Same Impulse, Radically Different Reach"),
      p(
        "Watching the sky, recording what's observed with real precision, and building a civilization's biggest projects around those observations is not a modern invention. Egypt organized its calendar, its religion, and its most monumental architecture around exactly that impulse, thousands of years before anyone could turn the observation into a trip. The instruments have changed beyond recognition. The underlying discipline — look carefully, record precisely, build around what you find — hasn't."
      ),
      faq(
        [
          {
            question: "What happened with Artemis II in 2026?",
            answer:
              "Artemis II carried four astronauts on a crewed flyby of the Moon in April 2026, the first crewed mission beyond low Earth orbit in over half a century, and a major milestone on NASA's path toward a future crewed lunar landing.",
          },
          {
            question: "What is the Senenmut star ceiling?",
            answer:
              "An astronomical ceiling in the tomb of Senenmut, steward to Pharaoh Hatshepsut, dating to around 1473 BC. It's one of the oldest known star charts in human history, depicting constellations, decan stars, and a lunar calendar system.",
          },
          {
            question: "How did ancient Egyptians use astronomy practically?",
            answer:
              "They tracked the heliacal rising of the star Sirius (Sothis) to predict the annual Nile flood and mark the start of their calendar year, and aligned major monuments like the Great Pyramid to true north and, by some theories, to specific stars using sustained stellar observation.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Every rocket launched in 2026 depends, ultimately, on the same discipline a Theban tomb ceiling was already demonstrating three and a half thousand years ago: look up, record what's there, and build accordingly."
      ),
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
    slug: "functional-drinks-2026-egypt-medicinal-beer",
    title: "Functional Beverages Are a Booming 2026 Wellness Category. Egypt Was Prescribing Medicinal Drinks 3,500 Years Ago.",
    category: "Wellness & Longevity",
    tags: ["Functional Beverages", "Wellness Drinks", "Ancient Egyptian Beer", "Ebers Papyrus"],
    author: editorialTeam,
    excerpt:
      "The US functional beverage market is projected to reach $67–70 billion in 2026, led by prebiotic sodas and adaptogenic drinks. Ancient Egyptian medicine was formulating its own version of a functional drink — beer mixed with specific herbs, prescribed for specific ailments — 3,500 years earlier.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1722684526676-aee4b65b0af7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "functional beverages 2026",
    secondaryKeywords: ["prebiotic soda 2026", "functional beverage market", "ancient Egyptian beer medicine", "Ebers Papyrus remedies"],
    seoTitle: "Functional Beverages in 2026, and Egypt's 3,500-Year-Old Medicinal Beer",
    seoDescription:
      "The US functional beverage market is projected to reach $67–70 billion in 2026. Ancient Egyptian medicine was prescribing beer mixed with specific herbs for specific ailments roughly 3,500 years before the category had a name.",
    body: [
      p(
        "\"Functional beverages\" — drinks formulated to do more than quench thirst — became one of 2026's clearer wellness growth categories. The US functional beverage market is projected to reach $67–70 billion this year, growing at a 7–9% compound annual rate, as the category shifts from general wellness marketing toward drinks formulated for specific, targeted outcomes."
      ),
      h2("What's Actually Driving 2026's Functional Drink Boom"),
      ...bullets([
        "\"Brain fuel\" nootropic drinks, built around ingredients like ashwagandha, rhodiola, and ginseng, are increasingly replacing plain caffeine for mental clarity and stress relief",
        "Prebiotic and probiotic sodas — led by brands like Olipop and Poppi — are the fastest-growing category, positioned as a healthier alternative to traditional soft drinks; PepsiCo launched its first prebiotic cola in July 2026",
        "The \"sober curious\" movement is driving demand for adaptogenic, alcohol-free relaxation beverages",
      ]),
      callout(
        "The defining shift in 2026's functional beverage market isn't that people are drinking something \"healthy\" — it's that drinks are increasingly formulated for a specific, targeted physiological outcome (gut health, cognitive clarity, stress relief) rather than marketed around vague wellness language.",
        { title: "From General Wellness to Targeted Formulation", tone: "Info" }
      ),
      h2("Egypt Was Formulating Its Own Version 3,500 Years Ago"),
      p(
        "Beer was a genuine dietary staple in ancient Egypt — nutrient-dense, calorically significant, and, importantly, safer to drink than untreated river water. But Egyptian medicine went well beyond treating beer as simple nourishment. The Ebers Papyrus, dating to around 1550 BC, records specific medicinal formulations built on a beer base — beer mixed with particular herbs and other ingredients, prescribed for specific ailments, in specific combinations, by practitioners working from an established body of documented remedies."
      ),
      p(
        "That's a genuinely direct precedent for what a 2026 functional beverage actually is: not a drink consumed purely for pleasure or basic nourishment, but one formulated with a specific ingredient combination aimed at a specific physiological outcome, prescribed with intention rather than habit."
      ),
      h2("Same Formula, Completely Different Century"),
      p(
        "The specific ingredients have changed beyond recognition — ashwagandha and prebiotic fiber in place of whatever herbs an Egyptian physician had on hand — but the underlying idea that a drink can be deliberately formulated to do a specific job for the body, beyond simply tasting good, is not a 2026 invention. Egyptian medicine was already treating beverages as a delivery mechanism for targeted remedies three and a half thousand years before \"functional beverage\" became a marketing category with its own multi-billion-dollar market size."
      ),
      faq(
        [
          {
            question: "How big is the functional beverage market in 2026?",
            answer:
              "The US functional beverage market is projected to reach $67–70 billion in 2026, growing at a 7–9% compound annual rate, driven by prebiotic sodas, nootropic \"brain fuel\" drinks, and adaptogenic relaxation beverages.",
          },
          {
            question: "Did ancient Egyptians use beer medicinally?",
            answer:
              "Yes — the Ebers Papyrus, dating to around 1550 BC, records specific medicinal formulations combining beer with particular herbs, prescribed for specific ailments, representing a genuine precedent for the modern idea of a beverage formulated for a targeted physiological purpose.",
          },
          {
            question: "What are the biggest functional beverage trends in 2026?",
            answer:
              "Prebiotic and probiotic sodas (led by brands like Olipop and Poppi, with PepsiCo entering the category in July 2026), nootropic \"brain fuel\" drinks built around adaptogens like ashwagandha and rhodiola, and alcohol-free adaptogenic relaxation beverages tied to the \"sober curious\" movement.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A $70 billion market for drinks formulated to do a specific job for the body sounds like a distinctly 2026 idea. Egyptian medicine was already writing the formulas down 3,500 years before anyone thought to put them in a can."
      ),
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
