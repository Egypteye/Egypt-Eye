import type { Story } from "../types";
import { authors } from "../authors";
import { tours } from "../tours";
import { p, h2, bullets, callout, faq, cta } from "../storyBlocks";

const editorialTeam = authors[0];

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

// World-trends cohort, batch 9 of 10: science-backed skincare, fashion
// nostalgia generally, and three specific nostalgia waves — 2016, Y2K,
// and 80s/90s. Facts (2026 dermatology ingredient trends, the 20-year
// nostalgia-cycle research, Y2K fashion's 2026 resurgence) were verified
// via web search; the historical Egypt facts (the 2010 kohl study,
// Egyptomania, Thomas Cook's 1869 Nile tours, the 1999/2000 Giza
// millennium concert, and Michael Jackson's "Remember the Time") were
// each independently verified — see contentReviewDate on each story.

export const stories: Story[] = [
  {
    status: "published",
    featured: false,
    slug: "science-backed-skincare-2026-egyptian-kohl-study",
    title: "Skincare Went 'Science-Backed' in 2026. A 2010 Study Already Proved Ancient Egyptian Eye Makeup Actually Worked.",
    category: "Wellness & Longevity",
    tags: ["Skincare", "Dermatology", "Ancient Egyptian Kohl", "Science-Backed Beauty"],
    author: editorialTeam,
    excerpt:
      "2026's skincare industry is defined by ingredients backed by real clinical research, not marketing buzz. A 2010 peer-reviewed chemistry study already proved that ancient Egyptian eye makeup did something scientifically real.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1738226699315-d7323358d42b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-02-01",
    primaryKeyword: "science-backed skincare 2026",
    secondaryKeywords: ["skincare ingredients 2026", "ancient Egyptian kohl study", "kohl nitric oxide", "Cleopatra eye makeup science"],
    seoTitle: "Science-Backed Skincare in 2026, and a 2010 Study on Ancient Egyptian Makeup",
    seoDescription:
      "2026's skincare trends favor peptides, ceramides, and clinically backed actives over buzzwords. A 2010 chemistry study already proved ancient Egyptian eye makeup boosted a real immune response.",
    body: [
      p(
        "Skincare's biggest shift in 2026 isn't a single new ingredient — it's a change in what the industry is willing to claim without proof. Dermatologists are consistently steering consumers toward ceramides, niacinamide, peptides, bakuchiol, polyglutamic acid, and ectoin: actives with real clinical research behind them, not marketing language. As one industry summary put it, effective skincare in 2026 is \"never rooted in buzz, but in long-studied, clinically backed science.\""
      ),
      h2("What 'Science-Backed' Actually Means in 2026"),
      ...bullets([
        "Peptides — short amino acid chains that signal skin to produce collagen and elastin — have clinical studies confirming improved firmness and reduced fine lines with consistent use",
        "Ceramides, niacinamide, and polyglutamic acid are favored specifically for measurable skin-barrier support, not vague wellness claims",
        "New delivery systems are making gold-standard actives like retinol and vitamin C gentler while remaining clinically effective",
      ]),
      callout(
        "The industry's own self-description of 2026's shift is blunt: ingredients need to be backed by research, designed to solve a specific skin concern, and easy for a customer to actually understand — a real departure from a category that spent years selling on vibes.",
        { title: "The 2026 Standard, In One Line", tone: "Info" }
      ),
      h2("A 2010 Study Already Proved an Ancient Egyptian Formula Worked"),
      p(
        "In January 2010, French researchers published a study in the journal Analytical Chemistry analyzing 52 samples of ancient Egyptian eye cosmetics preserved in makeup containers held by the Louvre. They identified four specific lead-based compounds, including two — phosgenite and laurionite — that don't occur naturally in Egypt, meaning ancient Egyptians were deliberately synthesizing them through an actual manufacturing process, not simply grinding up a locally available mineral."
      ),
      p(
        "What the researchers found next is the part that actually matters here: these lead-based compounds increased nitric oxide production in human skin cells by 240%. Nitric oxide is a genuine immune-signaling agent, and the boost would plausibly have helped fight the bacterial eye infections endemic to the Nile's marshy floodplain — meaning ancient Egyptian eye makeup likely wasn't purely cosmetic. It was, in effect, a deliberately manufactured, physiologically active formulation, verified by peer-reviewed modern chemistry roughly 3,500 years after it was first applied."
      ),
      h2("What Makes This a Genuine Precedent, Not Just a Curiosity"),
      p(
        "To be clear: lead has no place in a modern skincare routine, and no dermatologist in 2026 would recommend it — the compound itself is exactly the kind of thing today's research-first standards exist to rule out. What makes the finding genuinely remarkable is the pattern it demonstrates: a beauty formulation, deliberately manufactured for a specific physiological reason rather than purely decorative appeal, verified by rigorous modern science to have actually done something real. That's about as literal an example of \"science-backed\" ancient beauty as exists anywhere in the archaeological record — proof, if odd proof, that the impulse behind 2026's skincare shift isn't new at all."
      ),
      faq(
        [
          {
            question: "What skincare ingredients are trending in 2026?",
            answer:
              "Dermatologists are favoring peptides, ceramides, niacinamide, bakuchiol, polyglutamic acid, and ectoin — actives backed by clinical research and targeted at specific skin concerns like barrier support and collagen production, rather than general wellness marketing.",
          },
          {
            question: "Did ancient Egyptian eye makeup actually work?",
            answer:
              "A 2010 study in Analytical Chemistry found that lead-based compounds in ancient Egyptian kohl, analyzed from samples in the Louvre, boosted nitric oxide production in skin cells by 240% — a real immune-boosting effect that plausibly helped fight bacterial eye infections common along the Nile.",
          },
          {
            question: "Were ancient Egyptian cosmetics naturally occurring or manufactured?",
            answer:
              "Both — but two of the four lead compounds identified in the 2010 study, phosgenite and laurionite, don't occur naturally in Egypt, meaning ancient Egyptians were deliberately synthesizing them through a genuine manufacturing process rather than simply using a local mineral.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Peer review is a modern invention. The instinct to formulate a beauty product for a real, physiological reason, and to actually get it right, clearly isn't."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "fashion-nostalgia-2026-egyptomania-cycles",
    title: "Fashion Runs on 20-Year Nostalgia Cycles in 2026. Egypt Has Been the World's Favorite Throwback for Two Centuries.",
    category: "Culture & Trends",
    tags: ["Fashion Nostalgia", "20-Year Cycle", "Egyptomania", "Tutmania"],
    author: editorialTeam,
    excerpt:
      "The fashion industry's \"20-year rule\" says nostalgia peaks roughly two decades after a trend's original heyday. Ancient Egypt has triggered genuine, sustained fashion revivals at least twice in the last 200 years — a nostalgia cycle all its own.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1663192365280-3b02f48b36a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "fashion nostalgia 2026",
    secondaryKeywords: ["20-year fashion cycle", "Egyptomania history", "Tutmania 1920s", "Egyptian revival fashion"],
    seoTitle: "Fashion Nostalgia in 2026, and Egypt's 200-Year Head Start",
    seoDescription:
      "Fashion's \"20-year rule\" says nostalgia peaks roughly two decades after a trend's heyday. Egypt has triggered genuine, sustained fashion and design revivals — Egyptomania — at least twice across two centuries.",
    body: [
      p(
        "The fashion industry has a working theory for why old trends resurface: the \"20-year rule.\" Nostalgia for a given era peaks roughly two decades after its original popularity — ten years is too soon to feel nostalgic, thirty years is too distant, but twenty years is exactly the time it takes for a child to grow up absorbing an era's aesthetic and reach adulthood with the creative and purchasing power to bring it back."
      ),
      h2("Why Nostalgia Cycles Actually Work"),
      ...bullets([
        "Optimal distinctiveness theory: a revived trend satisfies two competing human needs at once — feeling familiar and socially safe, while still reading as novel enough to signal individuality",
        "Movies, TV, and celebrities frequently revive older aesthetics, making them culturally relevant again to a new audience",
        "Social media and fast fashion have compressed what used to be a strict 20-year cycle down to months or even weeks in some categories",
      ]),
      callout(
        "The 20-year rule explains most fashion nostalgia. It doesn't explain a trend that keeps recurring across two centuries, tied to no single generation's specific childhood — which is exactly what makes ancient Egypt's own fashion influence so unusual.",
        { title: "The Exception the 20-Year Rule Can't Explain", tone: "Info" }
      ),
      h2("Egypt Has Been Running Its Own Nostalgia Cycle Since Napoleon"),
      p(
        "The first major wave of \"Egyptomania\" followed Napoleon's 1798–1801 Egyptian campaign and the subsequent publication of the vast Description de l'Égypte (1809–1829), which flooded Europe with detailed engravings of Egyptian monuments — directly shaping Empire-style furniture, architecture, and fashion motifs across the early 1800s. A second, even larger wave followed Howard Carter's 1922 discovery of Tutankhamun's tomb: \"Tutmania\" swept the Western world through the 1920s and 30s, with Egyptian motifs woven directly into Art Deco jewelry, cinema architecture, and fashion on a genuinely massive scale."
      ),
      h2("A Recurring Cycle All Its Own"),
      p(
        "Unlike a typical 20-year fashion cycle, Egyptomania has recurred repeatedly across more than two centuries — Napoleon's era, the 1920s Tut craze, and, as later pieces in this series cover, distinct pop-culture waves tied to the millennium and the early 1990s. What makes ancient Egypt uniquely durable as a nostalgia object is that it isn't tied to anyone's personal, lived childhood the way a typical 20-year-cycle trend is. It's cultural nostalgia rather than autobiographical nostalgia — which is likely exactly why it never really needs a fixed 20-year gap to come back around."
      ),
      faq(
        [
          {
            question: "What is the 20-year fashion cycle?",
            answer:
              "A widely observed pattern where nostalgia for a given era's fashion peaks roughly two decades after its original popularity — long enough for the generation that grew up with it to reach adulthood with the cultural and purchasing influence to revive it.",
          },
          {
            question: "What was Egyptomania?",
            answer:
              "A recurring wave of Western fashion, architecture, and design directly influenced by ancient Egyptian imagery, most notably following Napoleon's 1798–1801 Egyptian campaign and again after Howard Carter's 1922 discovery of Tutankhamun's tomb, which sparked the 1920s \"Tutmania\" craze.",
          },
          {
            question: "Why has Egypt triggered fashion revivals more than once?",
            answer:
              "Unlike a typical trend tied to one generation's specific childhood, ancient Egypt functions as cultural rather than autobiographical nostalgia — which appears to let it resurface repeatedly across more than 200 years rather than needing a fixed 20-year gap.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Most trends need twenty years and a specific generation's permission to come back. Egypt has never really needed either."
      ),
      cta({
        title: "See What Keeps Coming Back Into Fashion",
        body: "The real monuments behind two centuries of Egyptomania — still standing, still doing it.",
        buttonLabel: "Explore Egypt Tours",
        buttonHref: "/tours",
      }),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "2016-nostalgia-2026-egypt-oldest-bucket-list-destination",
    title: "Feeling Nostalgic for 2016 Is a Real 2026 Trend. Egypt Has Been the World's Bucket-List Nostalgia Since 1869.",
    category: "Culture & Trends",
    tags: ["2016 Nostalgia", "Micro-Nostalgia", "Thomas Cook", "Nile Cruise History"],
    author: editorialTeam,
    excerpt:
      "Nostalgia cycles have compressed so much that people now feel genuine nostalgia for 2016. Egypt has held the world's original \"bucket list\" spot in the travel imagination for over 150 years, since Thomas Cook's first Nile tour.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1761205930594-64096d9d2baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "2016 nostalgia 2026",
    secondaryKeywords: ["compressed nostalgia cycle", "Thomas Cook Nile tour 1869", "oldest bucket list destination", "mass tourism history Egypt"],
    seoTitle: "2016 Nostalgia in 2026, and Egypt's 150-Year Bucket-List Legacy",
    seoDescription:
      "Nostalgia cycles have compressed so far that 2016 already feels nostalgic in 2026. Egypt has held the world's original \"bucket list\" travel status for over 150 years, since Thomas Cook's first organized Nile tour.",
    body: [
      p(
        "Nostalgia cycles that once took twenty years to complete now run their course in months. It's genuinely common in 2026 to see people expressing real nostalgia for 2016 — a specific pre-algorithm social media aesthetic, particular meme formats, an internet culture barely a decade old but already treated as a distinct, closed-off era worth missing."
      ),
      h2("Why Nostalgia Cycles Compressed So Fast"),
      ...bullets([
        "Social media platforms now surface and recirculate an era's aesthetic within its own decade, rather than requiring a generation to grow up and rediscover it",
        "Fast content cycles mean a specific year, not just a decade, can develop its own distinct, nameable aesthetic worth feeling nostalgic about",
        "The underlying psychological mechanism — familiarity mixed with just enough novelty — still applies; only the timeline has shrunk",
      ]),
      callout(
        "What used to require a 20-year gap for genuine nostalgia to set in can now happen within a single decade — a real acceleration in how quickly an era gets treated as \"the past\" worth missing.",
        { title: "The Compression, In One Sentence", tone: "Info" }
      ),
      h2("Egypt Invented the Oldest Version of 'Bucket List' Travel"),
      p(
        "In February 1869, Thomas Cook led the first organized tour group to Egypt — 28 British travelers disembarking in Alexandria, timed alongside the Suez Canal's opening that same year. Within two decades, Cook had made Nile travel affordable to the British middle class for the first time, a river previously accessible only to the elite through privately chartered dahabiyya sailboats. The route became so associated with his company that it was informally nicknamed \"Cook's canal\" — and the shift from a three-month private sailing journey to a 20-day organized steamboat excursion is widely considered one of the foundational moments of organized mass tourism itself."
      ),
      h2("The Longest-Running 'Someday' List in Travel"),
      p(
        "The specific feeling behind a modern \"bucket list\" — longing for a trip not yet taken, imagining it before it happens — has been continuously attached to Egypt for more than 150 years, arguably longer than any other single destination has held that exact cultural role. While 2026's nostalgia cycles compress down to a matter of months, Egypt's place in that psychology — a lifelong \"go before you die\" destination — has held essentially steady since Victorian England first climbed aboard Cook's steamers."
      ),
      faq(
        [
          {
            question: "Why do people feel nostalgic for 2016 already in 2026?",
            answer:
              "Nostalgia cycles have compressed significantly due to social media's speed at recirculating and re-contextualizing an era's aesthetic — what once took a 20-year gap to feel nostalgic can now happen within a single decade, making even a specific recent year feel like a distinct, closed-off era.",
          },
          {
            question: "When did Thomas Cook start organized tours to Egypt?",
            answer:
              "In February 1869, when Thomas Cook led 28 British travelers on the first organized tour group to Egypt, arriving in Alexandria the same year the Suez Canal opened — a foundational moment in the history of mass tourism.",
          },
          {
            question: "What was 'Cook's canal'?",
            answer:
              "An informal nickname for the Nile, reflecting how thoroughly Thomas Cook & Sons had made Nile river travel accessible and affordable to Britain's middle class within two decades of the company's first Egypt tour in 1869 — a route previously reserved for the wealthy.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "2026's nostalgia moves fast enough to miss a specific year. Egypt has held the exact same spot on the world's collective \"someday\" list for over 150 years running — proof that some kinds of longing never really need updating."
      ),
      cta({
        title: "Stop Putting It on the List",
        body: "The same Nile, the same monuments Victorian travelers once saved a lifetime to see — plan your own trip.",
        buttonLabel: "Start Planning",
        buttonHref: "/customize",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "y2k-nostalgia-2026-jarre-pyramids-millennium-concert",
    title: "Y2K Fashion Is Everywhere in 2026. The Actual Millennium Was Rung In at the Foot of the Pyramids.",
    category: "Culture & Trends",
    tags: ["Y2K Nostalgia", "Millennium Concert", "Giza Pyramids", "Jean-Michel Jarre"],
    author: editorialTeam,
    excerpt:
      "Y2K fashion is one of 2026's dominant nostalgia trends, driven by Gen Z and TikTok. The actual turn of the millennium was marked by a 120,000-person concert staged directly at the foot of the Giza pyramids.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1541769740-098e80269166?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "Y2K nostalgia 2026",
    secondaryKeywords: ["Y2K fashion trend 2026", "Jean-Michel Jarre pyramids concert", "Giza millennium concert 1999", "Twelve Dreams of the Sun"],
    relatedTours: toursBySlug("giza-pyramids-sound-and-light-show"),
    seoTitle: "Y2K Nostalgia in 2026, and the Real Millennium Concert at Giza",
    seoDescription:
      "Y2K fashion is one of 2026's dominant nostalgia trends. The actual millennium turnover in 1999–2000 was marked by a 120,000-person Jean-Michel Jarre concert staged at the foot of the Giza pyramids.",
    body: [
      p(
        "Y2K fashion is one of 2026's most visible nostalgia trends, and it's arrived with real staying power rather than a passing moment. After years of sleek minimalism, Y2K's maximalist, rule-breaking energy reads as a genuine departure — low-rise cuts, bold color, deliberate excess — and Gen Z has embraced it heavily, amplified by TikTok, vintage resale culture, and celebrities wearing the era's silhouettes back into relevance."
      ),
      h2("Why Y2K Specifically Is Dominating 2026"),
      ...bullets([
        "It arrives as a direct break from years of flat, neutral minimalism dominating everyday fashion",
        "It fits the classic 20-year cycle almost exactly, landing right as the generation that grew up with it reaches adulthood",
        "It communicates freedom, optimism, and a playful disregard for rules — a specific emotional register other nostalgia trends don't quite offer",
      ]),
      callout(
        "Fashion is chasing Y2K's aesthetic in 2026 — the colors, the silhouettes, the optimism. The actual turn of the millennium had its own, far stranger real-world set piece, staged at one of the most recognizable locations on Earth.",
        { title: "The Real Millennium Eve, Not the Aesthetic", tone: "Info" }
      ),
      h2("The Real Y2K Moment Happened at Giza"),
      p(
        "On December 31, 1999, carrying overnight into January 1, 2000, musician Jean-Michel Jarre staged \"The Twelve Dreams of the Sun\" — a concert performed directly at the Giza Plateau, at UNESCO's invitation. Jarre had been asked to serve as a UNESCO Ambassador specifically to draw global media attention to Egyptian tourism, and the concert that resulted was staged as a Millennium Eve spectacle at the foot of the pyramids, attended by roughly 120,000 people and costing an estimated $9.5 million to produce."
      ),
      p(
        "It didn't go entirely to plan: heavy fog rolled in that night and made the pyramids nearly invisible, forcing organizers to abandon the planned laser light projections onto the monuments' faces. Even so, it remains one of the more genuinely memorable, globally broadcast set pieces of the actual millennium turnover — a real event, not an aesthetic, staged at a location three and a half thousand years older than the calendar flip it was marking."
      ),
      h2("A Fitting Backdrop for the Turn of the Millennium"),
      p(
        "Of all the places on Earth broadcasting millennium celebrations that night, few made as much intuitive sense as monuments already ancient by the time most of recorded history had even started — a genuinely apt symbolic choice, and one organizers leaned into deliberately when they picked Giza over any of the world's more conventional millennium venues."
      ),
      faq(
        [
          {
            question: "Why is Y2K fashion trending in 2026?",
            answer:
              "It's arriving right on schedule for fashion's classic 20-year nostalgia cycle, amplified heavily by Gen Z and TikTok, and it offers a maximalist, rule-breaking contrast to years of minimalist fashion that has dominated recently.",
          },
          {
            question: "What was the millennium concert at the pyramids?",
            answer:
              "Jean-Michel Jarre's \"The Twelve Dreams of the Sun,\" staged at UNESCO's invitation directly at the Giza Plateau on December 31, 1999 into January 1, 2000, attended by roughly 120,000 people at an estimated cost of $9.5 million.",
          },
          {
            question: "Why did UNESCO invite Jean-Michel Jarre to perform at Giza?",
            answer:
              "Jarre was serving as a UNESCO Ambassador specifically tasked with drawing global media attention to the Egyptian tourism industry, and was invited to conceive and perform a Millennium Eve concert at the pyramids as part of that role.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Fashion in 2026 is chasing Y2K's colors and silhouettes. The actual moment the millennium turned over already picked its own backdrop — and it's still standing at Giza, fog or no fog."
      ),
      cta({
        title: "See Giza After Dark",
        body: "Light and sound at the actual pyramids, the same monuments that hosted the real millennium's biggest stage.",
        buttonLabel: "See the Sound & Light Show",
        buttonHref: "/tours/giza-pyramids-sound-and-light-show",
      }),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "80s-90s-nostalgia-2026-michael-jackson-remember-the-time",
    title: "80s and 90s Nostalgia Is Peaking in 2026. One of the Era's Most Iconic Videos Was Basically a Love Letter to Ancient Egypt.",
    category: "Culture & Trends",
    tags: ["80s 90s Nostalgia", "Michael Jackson", "Remember the Time", "Pop Culture Egypt"],
    author: editorialTeam,
    excerpt:
      "80s and 90s nostalgia keeps resurfacing through reboots, reissues, and revived fashion silhouettes. One of the 90s' most talked-about music videos, Michael Jackson's \"Remember the Time,\" staged an all-Black ancient Egyptian royal court as its entire premise.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1693654547147-24d94b4ed4ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "80s 90s nostalgia 2026",
    secondaryKeywords: ["Remember the Time video", "Michael Jackson Egypt video", "Eddie Murphy pharaoh", "90s pop culture Egypt"],
    seoTitle: "80s/90s Nostalgia in 2026, and Michael Jackson's Ancient Egyptian Video",
    seoDescription:
      "80s and 90s nostalgia keeps resurfacing in 2026 through reboots and revived fashion. Michael Jackson's 1992 \"Remember the Time\" staged an entirely ancient Egyptian, all-Black royal court as its premise.",
    body: [
      p(
        "80s and 90s nostalgia has kept resurfacing through 2026 — reboots and reissues of the era's biggest media franchises, a real revival in film-camera and vinyl culture, and fashion silhouettes from both decades cycling back into relevance as the generations who grew up on them reach the age and purchasing power to bring their childhoods back. Few artifacts from that stretch have aged into more consistently referenced pop-culture touchstones than Michael Jackson's music videos from the era — and one of the most iconic of all was, quite deliberately, an ancient Egyptian production."
      ),
      h2("Why This Era's Nostalgia Keeps Resurfacing"),
      ...bullets([
        "Streaming platforms continue reissuing and rebooting 80s and 90s film and TV franchises, keeping the era's aesthetic in active circulation rather than left behind",
        "Physical, tactile formats from the era — vinyl, film cameras, analog silhouettes — carry a specific appeal against an increasingly digital, algorithmic present",
        "The generation that grew up on 80s and 90s media is now old enough to hold real cultural and purchasing influence, the same mechanism driving most 20-year nostalgia cycles",
      ]),
      callout(
        "Few 90s pop-culture artifacts get referenced as consistently, decades later, as Michael Jackson's \"Remember the Time\" — and its entire premise was built around staging ancient Egypt as a vision of Black royalty and civilization at the height of mainstream music television.",
        { title: "One of the Decade's Most-Referenced Videos", tone: "Highlight" }
      ),
      h2("One of the Era's Most-Remembered Videos Was Set in Ancient Egypt"),
      p(
        "Released January 14, 1992, \"Remember the Time\" was directed by John Singleton and choreographed by Fatima Robinson, with Singleton reportedly agreeing to direct only on the condition that Jackson commit to an all-Black cast and production. Set explicitly in ancient Egypt, it starred Eddie Murphy as Pharaoh Ramesses II, Iman as his queen, Magic Johnson in a cameo, and Jackson himself as a mystical sorcerer with a romantic past connected to the queen — filmed on the Universal Studios backlot but staged, unmistakably, as ancient Egyptian civilization."
      ),
      h2("Why That Specific Setting Mattered"),
      p(
        "The choice of ancient Egypt wasn't incidental — it was the entire point. Putting Eddie Murphy and Iman on the throne as rulers of an unmistakably advanced, visually opulent civilization was, for millions of viewers watching mainstream music television in 1992, a genuinely powerful image of Black royalty and achievement, deliberately built around ancient Egypt's real historical stature as an African civilization whose monuments and imagery already carried unmatched global cultural weight."
      ),
      faq(
        [
          {
            question: "When was Michael Jackson's 'Remember the Time' released?",
            answer:
              "January 14, 1992, as the second single from his album Dangerous. The music video was directed by John Singleton and choreographed by Fatima Robinson.",
          },
          {
            question: "Who starred in the 'Remember the Time' music video?",
            answer:
              "Eddie Murphy played Pharaoh Ramesses II, Iman played his queen, Magic Johnson made a cameo appearance, and Michael Jackson himself played a mystical sorcerer with a past connection to the queen — set explicitly in ancient Egypt with an all-Black cast and production.",
          },
          {
            question: "Why did the video's director require an all-Black cast?",
            answer:
              "Director John Singleton reportedly agreed to direct only if Jackson committed to an all-Black cast and production, using ancient Egypt's setting to present a deliberate, powerful image of Black royalty and civilization to a mainstream music television audience in 1992.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "80s and 90s nostalgia keeps circling back to the same handful of genuinely iconic moments — and one of the most enduring set its entire story inside a version of ancient Egypt, staged specifically because nowhere else carried quite the same weight."
      ),
    ],
  },
];
