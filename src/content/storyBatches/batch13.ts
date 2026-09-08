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
    slug: "mars-human-spaceflight-2026-hatshepsut-punt-expedition",
    title: "Starship Is Aiming for Mars by the End of 2026. Egypt Once Sent Its Own Flagship Expedition Into the Unknown.",
    category: "Science & Space",
    tags: ["Mars", "SpaceX Starship", "Human Spaceflight", "Hatshepsut", "Land of Punt"],
    author: editorialTeam,
    excerpt:
      "SpaceX aims to send an uncrewed Starship toward Mars by the end of 2026, with crewed landings possibly following by 2029. Egypt organized its own flagship expedition into a half-known, half-mythical land 3,500 years earlier — and immortalized it in stone.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1705680757279-98fa1fe46853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2026-12-01",
    primaryKeyword: "Mars human spaceflight 2026",
    secondaryKeywords: ["SpaceX Starship Mars 2026", "Artemis III delay", "Hatshepsut Punt expedition", "Deir el-Bahari reliefs"],
    relatedTours: toursBySlug("hurghada-red-sea-diving-snorkeling"),
    seoTitle: "Mars and Human Spaceflight in 2026, and Egypt's Own Flagship Expedition",
    seoDescription:
      "SpaceX aims to send an uncrewed Starship toward Mars by the end of 2026. Egypt's own flagship expedition into the half-mythical Land of Punt, under Hatshepsut, is a striking ancient parallel.",
    body: [
      p(
        "SpaceX pushed further toward operational spaceflight in 2026, flying more than 20 integrated Starship test and operational missions by April, with both booster and upper stage now being caught, refurbished, and reflown. Elon Musk has said an uncrewed Starship will head toward Mars by the end of 2026, carrying a Tesla Optimus robot, with human landings possibly following \"as soon as 2029\" — though most independent analysts consider 2031 more realistic. Meanwhile, NASA's own crewed Artemis III lunar landing, which depends on Starship's human landing system, has slipped to no earlier than 2027, with an uncrewed test landing now targeted for 2027 and the crewed mission for 2028."
      ),
      h2("Where Things Actually Stand"),
      ...bullets([
        "SpaceX flew 20-plus integrated Starship missions by April 2026, with reusable booster and upper-stage recovery becoming increasingly routine",
        "Musk's stated goal is an uncrewed Starship departure toward Mars by the end of 2026, with human landings targeted for as soon as 2029, though 2031 is considered more realistic by outside analysts",
        "NASA's crewed Artemis III lunar landing, which depends on Starship, has slipped to no earlier than 2027",
      ]),
      callout(
        "Repeated schedule slips are the norm for a mission of this ambition, not an exception — true of Artemis III's lunar landing date, and just as true, historically, of nearly every flagship exploratory mission a civilization has ever attempted.",
        { title: "Slipping Schedules Are the Pattern, Not the Exception", tone: "Info" }
      ),
      h2("Egypt's Own Flagship Expedition Into the Unknown"),
      p(
        "Around 1479–1458 BC, in roughly the ninth year of her reign, Pharaoh Hatshepsut organized a massive maritime expedition to the Land of Punt — a distant, semi-legendary trading partner most historians place somewhere in the Horn of Africa, known to Egypt mostly through earlier, sporadic contact. It was, by the standards of its era, a genuine journey into the barely known, and Hatshepsut had it documented in extraordinary relief detail on the walls of her mortuary temple at Deir el-Bahari — ships loading and unloading, cargo being weighed and recorded, and the expedition's return."
      ),
      p(
        "The reliefs record what came back: myrrh, whole living myrrh and frankincense trees intended for transplanting in Egypt, gold, ebony, leopard skins, exotic animals including baboons and monkeys, and more. Each of the 31 incense trees required four to six men to carry to the cargo ships — the kind of granular, celebrated logistical detail a civilization records only when a mission matters enormously to how it sees itself."
      ),
      h2("Same Motive Underneath the Mission"),
      p(
        "Reaching a distant, barely-known place and bringing back something the home civilization has never had before isn't a new kind of ambition — it's one of the oldest reasons a civilization organizes its resources around a single flagship mission. Hatshepsut's court immortalized live trees carried off a ship as a defining achievement of her reign, a permanent record of prestige and legitimacy. It's not so different from what a first human footprint on Mars would mean for whichever program actually gets there — a distant, difficult destination, reached and documented specifically because reaching it changes how the reaching civilization sees itself."
      ),
      faq(
        [
          {
            question: "When is SpaceX planning to send Starship to Mars?",
            answer:
              "Elon Musk has stated an uncrewed Starship will depart for Mars by the end of 2026, carrying a Tesla Optimus robot, with crewed landings potentially following as soon as 2029, though most independent analysts consider 2031 more realistic.",
          },
          {
            question: "What was the Land of Punt?",
            answer:
              "A semi-legendary trading partner of ancient Egypt, most historians place it somewhere in the Horn of Africa. Pharaoh Hatshepsut organized a major maritime expedition there around 1479–1458 BC, documented in extraordinary relief detail at her mortuary temple, Deir el-Bahari.",
          },
          {
            question: "Has NASA's Artemis III Moon landing been delayed?",
            answer:
              "Yes — the crewed Artemis III lunar landing, which depends on SpaceX's Starship human landing system, has slipped to no earlier than 2027, with an uncrewed test landing now targeted for 2027 and the crewed mission for 2028.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A civilization's flagship expedition into the unknown, whether it's a fleet of ships toward a half-mythical land or a rocket toward a genuinely uninhabited planet, has always been about more than the cargo it brings back. Egypt understood that well enough to carve the whole voyage in stone."
      ),
      cta({
        title: "Set Sail on the Same Sea",
        body: "The Red Sea, Egypt's own gateway to distant expeditions since Hatshepsut's era — a day of diving and snorkeling from Hurghada.",
        buttonLabel: "See the Hurghada Red Sea Day",
        buttonHref: "/tours/hurghada-red-sea-diving-snorkeling",
      }),
    ],
  },

  {
    status: "published",
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
    slug: "longevity-fitness-2026-beni-hasan-wrestling-egypt",
    title: "Exercise Is 2026's Single Best-Proven Longevity Intervention. Egypt Documented Organized Training 4,000 Years Ago.",
    category: "Wellness & Longevity",
    tags: ["Longevity Fitness", "VO2 Max", "Zone 2 Training", "Beni Hasan", "Ancient Egyptian Wrestling"],
    author: editorialTeam,
    excerpt:
      "A 750,000-person study found each 1-MET rise in VO2 max cuts all-cause mortality risk by 13–15%. Egypt's tomb of Baqet III at Beni Hasan recorded nearly 400 pairs of wrestlers in specific holds and techniques, one of history's most systematic records of organized physical training.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1574788175517-f06058bae147?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "longevity fitness 2026",
    secondaryKeywords: ["VO2 max longevity", "zone 2 training", "Beni Hasan wrestling scenes", "ancient Egyptian physical training"],
    seoTitle: "Longevity Fitness in 2026, and Egypt's 4,000-Year-Old Training Record",
    seoDescription:
      "A 750,000-person study found VO2 max fitness cuts long-term mortality risk by up to 80%. Egypt's tomb of Baqet III at Beni Hasan documented nearly 400 pairs of wrestlers in specific holds roughly 4,000 years earlier.",
    body: [
      p(
        "Of everything longevity science has studied, the evidence for exercise itself keeps coming back as the single most consistently proven intervention. A large-scale study of roughly 750,000 US veterans found that each 1-MET increase in VO2 max — a measure of cardiorespiratory fitness — was associated with a 13–15% reduction in all-cause mortality risk, and that high cardiorespiratory fitness overall is linked to roughly 80% lower long-term mortality risk compared to low fitness."
      ),
      h2("What 2026's Research Actually Recommends"),
      ...bullets([
        "Zone 2 training — sustained effort at roughly 60–70% of maximum heart rate, where the body primarily burns fat and can still hold a conversation — improves mitochondrial density, cardiac stroke volume, and fat-burning capacity",
        "A large 2018 JAMA study of over 120,000 patients found combining 180–240 minutes of Zone 2 cardio weekly with 2–3 resistance training sessions produced the strongest longevity outcomes of any protocol studied",
        "The consistent recommendation: 3–4 weekly sessions of 45–60 minutes of Zone 2 cardio, paired with regular strength training",
      ]),
      callout(
        "Compared to nearly every other longevity intervention under active research in 2026 — supplements, reprogramming, senolytics — consistent aerobic and strength training remains the single most rigorously evidenced, and it's also the one requiring no new technology whatsoever.",
        { title: "The Best-Evidenced Longevity Intervention Needs No New Technology", tone: "Info" }
      ),
      h2("Egypt Documented Organized Training 4,000 Years Ago"),
      p(
        "The tomb of Baqet III at Beni Hasan, dating to around 2000 BC, contains what is likely the first and most comprehensive illustrated record of organized physical training anywhere in the ancient world: nearly 400 individual pairs of wrestlers, painted in dynamic, systematic sequence, depicting a genuinely wide range of specific holds, throws, and techniques — grips and manoeuvres recognizable in contemporary wrestling today. It isn't a scattered handful of combat scenes; it's a methodical, almost instructional-looking catalogue of technique, painted with a level of detail that suggests real, organized physical training culture behind it."
      ),
      h2("Same Underlying Insight, Four Thousand Years Apart"),
      p(
        "What both eras have converged on, separated by roughly four thousand years and radically different scientific frameworks, is the same basic insight: structured, repeated physical exertion — not a supplement, not a passive treatment, but actual sustained physical effort — is one of the most powerful things available for how a body performs and how long it holds up. Egypt didn't have VO2 max testing or a JAMA study, but it clearly organized real training culture around the same underlying premise 2026's most rigorous longevity research keeps confirming."
      ),
      faq(
        [
          {
            question: "What is the single best-proven longevity intervention according to 2026 research?",
            answer:
              "Cardiorespiratory fitness, measured via VO2 max. A study of roughly 750,000 US veterans found each 1-MET increase in VO2 max cut all-cause mortality risk by 13–15%, with high fitness overall linked to about 80% lower long-term mortality risk than low fitness.",
          },
          {
            question: "What is Zone 2 training?",
            answer:
              "Sustained aerobic exercise at roughly 60–70% of maximum heart rate, intense enough to train the body but light enough to hold a conversation. It's linked to increased mitochondrial density, improved cardiac stroke volume, and better fat-burning capacity.",
          },
          {
            question: "What do the Beni Hasan wrestling scenes depict?",
            answer:
              "The tomb of Baqet III at Beni Hasan, dating to around 2000 BC, depicts nearly 400 pairs of wrestlers in a systematic range of specific holds and techniques — considered the first and most comprehensive illustrated record of organized wrestling and physical training in world history.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The most rigorously evidenced longevity intervention available in 2026 doesn't require a lab, a supplement, or a new technology — just structured, sustained physical effort. Egypt was already recording exactly that discipline, in remarkable technical detail, four thousand years ago."
      ),
    ],
  },
];
