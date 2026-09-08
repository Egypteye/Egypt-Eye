import type { Story } from "../types";
import { authors } from "../authors";
import { tours } from "../tours";
import { p, h2, bullets, callout, faq, cta } from "../storyBlocks";

const editorialTeam = authors[0];

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

// World-trends cohort, batch 2 of 10: AI company valuations, vibe coding,
// deepfakes, AI influencers, and AI photography. Facts tied to 2026
// developments (Anthropic/OpenAI funding rounds, vibe-coding adoption
// data, deepfake fraud figures, virtual-influencer market sizing, the
// stock photography collapse) were verified via web search at the time
// of writing — see contentReviewDate on each story.

export const stories: Story[] = [
  {
    status: "published",
    featured: false,
    slug: "ai-company-valuations-2026-explained",
    title: "Anthropic, OpenAI, and the Trillion-Dollar Question: Are AI Valuations for Real?",
    category: "Tech & AI",
    tags: ["AI Valuations", "OpenAI", "Anthropic", "Tech Economy", "Egypt History"],
    author: editorialTeam,
    excerpt:
      "Anthropic hit a $965 billion valuation in 2026, OpenAI $852 billion. Egypt ran this exact experiment 160 years earlier, with cotton instead of chips — and the ending is worth knowing before you read the next funding headline.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1774425329088-36801b6f09be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-05T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "AI company valuations 2026",
    secondaryKeywords: ["Anthropic valuation", "OpenAI valuation", "AI bubble 2026", "Egyptian cotton boom history"],
    relatedStories: [
      {
        slug: "us-china-ai-race-suez-canal-parallel",
        title: "The US-China AI Race, and What the Suez Canal Teaches About Chokepoints",
        excerpt:
          "Compute and chips are becoming the strategic chokepoint of the 21st century the way a canal was for the 20th. Egypt's own history with the most fought-over waterway on Earth is a sharper lens on the AI race than it first sounds.",
        imageTone: "nile",
        category: "Tech & AI",
      },
    ],
    seoTitle: "AI Valuations in 2026: Anthropic, OpenAI, and a 160-Year-Old Warning",
    seoDescription:
      "Anthropic and OpenAI are worth close to a trillion dollars each on 2026's numbers. Egypt's 1860s cotton boom ran the identical bet once already — and showed exactly how it ends.",
    body: [
      p(
        "In late May 2026, Anthropic closed a funding round that valued the company at $965 billion, edging past OpenAI's own $852 billion mark from three months earlier. Both companies filed to go public within a week of each other that June. Neither number is a typo, and neither is close to settled — Anthropic's valuation alone had roughly tripled since February, when it was worth a comparatively modest $380 billion. The pace of that climb is the actual story, more than the size of the number itself."
      ),
      h2("The Numbers, Plainly"),
      p(
        "Anthropic's valuation is backed by real, fast-growing revenue: its annualized run rate went from about $14 billion in February 2026 to roughly $47 billion by May — close to tripling in three months, which puts its valuation at around 20.5 times revenue. OpenAI's $852 billion valuation sits on approximately $25 billion of revenue, a steeper 34 times multiple, and one built while the company was reportedly still running an operating margin around negative 122% — spending far more than it earns for every dollar of revenue it books."
      ),
      p(
        "None of that makes either company a fraud or a certain failure. Fast-growing, capital-intensive technology companies routinely run deep losses while they scale — Amazon did it for years. What it does make these valuations is exactly what analysts mean when they call a price \"priced for perfection\": a bet that stays rational only if the current pace of growth keeps compounding roughly as it has, without a serious interruption, for years."
      ),
      callout(
        "A 34x revenue multiple isn't inherently irrational — but it only survives contact with reality if growth keeps compounding at 2026's pace. History's clearest lesson about bets like that is what happens to the multiple, and to whoever is left holding it, the moment the growth curve so much as flattens.",
        { title: "What \"Priced for Perfection\" Actually Means", tone: "Info" }
      ),
      h2("Egypt's Own Trillion-Dollar Bet — Paid in Cotton, Not Compute"),
      p(
        "Here's a genuinely useful parallel, and it isn't a metaphor stretched to fit — it's Egypt's actual economic history. When the American Civil War broke out in 1861, the Union naval blockade of Confederate ports cut off the world's dominant source of raw cotton almost overnight. Textile mills across Europe needed a new supplier fast, and Egypt, already growing high-quality long-staple cotton along the Nile, was perfectly positioned to fill the gap. Egyptian cotton exports and prices exploded — by some estimates, cotton revenues more than quadrupled within a few years, an economic windfall on the scale of a modern tech boom."
      ),
      p(
        "Egypt's ruler at the time, and then his successor Khedive Ismail, treated that windfall as a permanent floor rather than a temporary spike, and borrowed enormous sums from European banks against future cotton earnings to fund an ambitious modernization program — railways, palaces, and a share of the financing behind the Suez Canal itself, under construction through the same decade. It looked, for a few years, like an unstoppable growth curve funding an unstoppable transformation."
      ),
      h2("Then the War Ended"),
      p(
        "In 1865, the American Civil War ended, Confederate cotton returned to global markets, and prices collapsed. Egypt's export revenue, the thing the entire borrowing spree had been priced against, fell away almost as fast as it had appeared — but the debts taken out against it didn't shrink to match. Egypt spent the following years borrowing further just to service its existing loans, a debt spiral that ended in 1876 with the country effectively bankrupt, its finances placed under direct European creditor control, and by 1882, British troops occupying the country outright — a foreign occupation that traced a straight line back to a boom that had been treated as permanent."
      ),
      h2("Same Shape, Different Commodity"),
      ...bullets([
        "A genuine, extraordinary windfall, driven by a real external shock (a war disrupting the usual supply)",
        "Enormous borrowing and investment made against the assumption that the windfall's growth curve would simply continue",
        "A valuation, in both cases, that only worked if conditions kept holding roughly as they were",
        "A reckoning, when conditions changed, that landed hardest on whoever was most leveraged against the old assumption",
      ]),
      p(
        "This isn't a prediction that AI valuations are about to collapse the way 1860s cotton prices did — the comparison isn't that literal, and the companies involved today aren't a 19th-century monarchy borrowing against a single agricultural export. What the parallel actually offers is a sharper way to read the headlines: a stunning, real, revenue-backed growth curve and an unsustainable bet priced against that curve's indefinite continuation can be the exact same thing, right up until the moment they aren't. Egypt found that out with cotton. Whether today's AI valuations find it out with compute is the open question sitting underneath every one of 2026's funding headlines."
      ),
      faq(
        [
          {
            question: "How much is Anthropic worth in 2026?",
            answer:
              "Anthropic closed a funding round in late May 2026 valuing it at $965 billion, on an annualized revenue run rate of roughly $47 billion — a jump from a $380 billion valuation just three months earlier.",
          },
          {
            question: "How much is OpenAI worth in 2026?",
            answer:
              "OpenAI was valued at $852 billion after a $122 billion funding round in March 2026, on approximately $25 billion of revenue and a reported operating margin around negative 122%.",
          },
          {
            question: "What was the Egyptian cotton boom?",
            answer:
              "When the American Civil War's Union blockade cut off Confederate cotton exports starting in 1861, Egypt became a leading global supplier and prices surged. Egypt's rulers borrowed heavily against that windfall; when the war ended in 1865 and cotton prices collapsed, the resulting debt crisis led to European financial control by 1876 and British occupation by 1882.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Extraordinary valuations built on the assumption that today's growth rate is tomorrow's baseline aren't a new invention of Silicon Valley term sheets. Egypt ran the experiment in cotton a century and a half ago, at a scale that reshaped the country's entire sovereignty. It's worth remembering exactly how that one ended, while the current one is still being written."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "vibe-coding-2026-great-pyramid-precision",
    title: "Vibe Coding Is Everywhere in 2026. The Great Pyramid Was Never Vibe-Built.",
    category: "Tech & AI",
    tags: ["Vibe Coding", "AI Coding Tools", "Software Development", "Great Pyramid of Giza"],
    author: editorialTeam,
    excerpt:
      "92% of developers now use AI coding tools daily, and only 29% trust what those tools produce. The Great Pyramid of Giza was built to a precision that still holds four and a half thousand years later — with zero tolerance for \"we'll fix it later.\"",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1544815521-80841127c00f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-05T09:00:00+02:00",
    contentReviewDate: "2027-03-01",
    primaryKeyword: "vibe coding 2026",
    secondaryKeywords: ["what is vibe coding", "AI coding tools statistics", "Great Pyramid precision", "vibe coding risks"],
    relatedTours: toursBySlug("1-day-giza-tour"),
    seoTitle: "Vibe Coding in 2026, and the Precision the Great Pyramid Never Compromised On",
    seoDescription:
      "AI-generated code jumped from 10% to 46% of all code written in three years, while developer trust in it dropped to 29%. The Great Pyramid of Giza offers the sharpest possible contrast.",
    body: [
      p(
        "\"Vibe coding\" — writing software by describing what you want to an AI tool in plain language and accepting most of what it generates without close review — went from a niche joke to the default way a huge share of code gets written in barely two years. It's worth being precise about both halves of that story in 2026: how fast the adoption happened, and how uneasy the people doing it actually are about it."
      ),
      h2("The Numbers Behind the Buzzword"),
      p(
        "Ninety-two percent of U.S. developers now report using AI coding tools daily, and the share of all newly written code that's AI-generated has risen from about 10% in 2023 to roughly 46% in 2026 — essentially flipping, in three years, from a minor assist to the majority contributor on a huge amount of software being shipped. Search interest in the term \"vibe coding\" itself spiked by roughly 6,700% over the same stretch, and the tools category is growing at a 38% compound annual rate, more than double the 16% growth of the traditional developer-tools market it's eating into."
      ),
      h2("The Trust Paradox"),
      p(
        "Here's the part that gets left out of the adoption headlines: usage and confidence have moved in opposite directions. Only 29% of developers say they trust the code these tools produce — down from around 40% just a year earlier, even as usage climbed toward near-universal. The reasons aren't abstract. Studies tracking AI-assisted commits have found the resulting code contains roughly 1.7 times more major issues than human-written code, and close to 45% of sampled AI-generated code contains at least one OWASP Top-10 class security vulnerability — the kind of flaw that turns into a real breach, not a cosmetic bug."
      ),
      callout(
        "Adoption and trust moved in opposite directions at the same time: near-universal daily use, alongside a drop in developer confidence from about 40% to 29% in a single year. That gap is the honest headline underneath \"vibe coding won.\"",
        { title: "Usage Up, Confidence Down", tone: "Info" }
      ),
      h2("What the Great Pyramid Got Right, Without Any of This"),
      p(
        "The Great Pyramid of Giza has a base that's level to within roughly 2.1 centimetres across a span of 230 metres, and its four sides are aligned to true north with an accuracy of about a twentieth of a degree — a tolerance that modern engineers still study, achieved with no laser levels, no satellites, nothing resembling today's surveying instruments. It was built by a workforce organized into overseen, accountable teams, with structural decisions that had to hold at civilization-defining scale, on the first attempt, because there was no version 1.1."
      ),
      h2("Two Completely Different Bets on Speed"),
      p(
        "That's not a coincidence of ancient diligence versus modern shortcuts — it's two entirely different relationships with the cost of being wrong. Vibe coding's whole premise rests on the assumption that a mistake is cheap and reversible: ship it, watch what breaks, patch it, ship again. That's often a genuinely reasonable bet for a feature flag, a UI tweak, an internal tool. It is a catastrophic bet for anything where \"patch it after\" isn't actually available — a payment system, an authentication layer, a database migration, anything safety-critical. The pyramid's builders were operating permanently in that second mode: there was no patch release for a cracked foundation stone forty courses up. Every decision had to be right the first time, because the medium — quarried stone, moved by hand, stacked by the hundred-thousand-ton — offered no version control."
      ),
      p(
        "None of this is an argument that vibe coding is a mistake. It's an argument that knowing which mode you're actually in matters more than the productivity headlines suggest. For the disposable and the reversible, moving fast and fixing later is a legitimate, often smart trade-off. For anything foundational — the parts of a system everything else depends on — the standard that held up a 4,500-year-old monument to within two centimetres is still the right one: get it right before you build the next layer on top, because by the time you're forty courses up, going back isn't an option anymore."
      ),
      faq(
        [
          {
            question: "What is vibe coding?",
            answer:
              "Vibe coding refers to writing software mostly by describing the desired outcome to an AI tool in natural language and accepting much of the generated code with limited manual review or architectural planning, rather than writing and reviewing it line by line.",
          },
          {
            question: "How much code is AI-generated in 2026?",
            answer:
              "Roughly 46% of newly written code is AI-generated as of 2026, up from about 10% in 2023, with 92% of U.S. developers reporting daily use of AI coding tools.",
          },
          {
            question: "Is AI-generated code less secure?",
            answer:
              "Studies in 2026 found AI co-authored code contains roughly 1.7 times more major issues than human-written code, and around 45% of sampled AI-generated code contains at least one OWASP Top-10 class security vulnerability — a significant reason developer trust in these tools has dropped even as usage has risen.",
          },
          {
            question: "How precisely was the Great Pyramid of Giza built?",
            answer:
              "Its base is level to within about 2.1 centimetres across a 230-metre span, and its sides are aligned to true north within roughly 0.05 degrees — achieved without any modern surveying instruments, a tolerance that still impresses engineers studying it today.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Standing at the base of the Great Pyramid, what's striking isn't just the scale — it's the certainty that whoever set those first foundation stones knew there was no fixing them later. That's a genuinely useful thing to think about the next time \"ship it and see\" feels like the obvious move."
      ),
      cta({
        title: "See the Precision Up Close",
        body: "Four and a half thousand years old, level to within two centimetres — a full day at the only Wonder of the Ancient World still standing.",
        buttonLabel: "See the Giza Pyramids Tour",
        buttonHref: "/tours/1-day-giza-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "deepfakes-2026-ancient-egypt-usurped-cartouches",
    title: "Deepfakes Are a New Crime. Rewriting Someone Else's Image Is an Old One.",
    category: "Tech & AI",
    tags: ["Deepfakes", "AI Fraud", "Ancient Egypt", "Ramesses II", "Hatshepsut"],
    author: editorialTeam,
    excerpt:
      "An estimated 8 million deepfakes now circulate online, and humans catch high-quality fakes barely a quarter of the time. Ancient Egypt ran a slower version of the same fraud in solid stone — and one queen's erased face is still visible today.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1761560358030-8f73346f0a1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-06T09:00:00+02:00",
    contentReviewDate: "2027-02-01",
    primaryKeyword: "deepfakes 2026",
    secondaryKeywords: ["deepfake statistics 2026", "deepfake fraud", "Hatshepsut erased", "Ramesses II usurped monuments"],
    relatedTours: toursBySlug("valley-of-the-kings-hatshepsut-temple-tour", "luxor-east-bank-day-tour"),
    seoTitle: "Deepfake Statistics 2026, and Ancient Egypt's Own Identity Fraud",
    seoDescription:
      "8 million deepfakes circulate online in 2026, up 16x since 2023. Long before AI, Egyptian rulers erased and rewrote each other's carved identities — and the evidence is still on the temple walls.",
    body: [
      p(
        "An estimated 8 million deepfakes are now circulating online, up from roughly 500,000 in 2023 — a sixteenfold increase in under three years, growing at close to 900% annually. Deepfake fraud now accounts for about 6.5% of all fraud attempts globally, up from a mere 0.1% in 2022, and CEO-impersonation deepfake scams alone are now reportedly attempted against approximately 400 companies every single day."
      ),
      h2("How Bad the Detection Problem Actually Is"),
      p(
        "The uncomfortable part isn't just how many fakes exist — it's how bad humans are at catching them. A 2025 study by the identity-verification firm iProov tested 2,000 consumers against a mix of real and deepfaked images and video, and found that only 0.1% correctly identified every single fake and every genuine item — meaning 999 out of every 1,000 people failed the test. For high-quality video deepfakes specifically, human detection accuracy sits at around 24.5%: worse than a coin flip. US deepfake-related fraud losses reached an estimated $1.1 billion in 2025."
      ),
      callout(
        "The detection market is scaling fast — from $5.5 billion in 2023 toward a projected $15.7 billion by 2026, a 42% annual growth rate — but 63% of organizations still haven't invested any budget in deepfake defense, and 80% have no formal response protocol at all.",
        { title: "Defense Is Growing, But Not Fast Enough", tone: "Info" }
      ),
      h2("Ancient Egypt Had Its Own Version of Identity Fraud"),
      p(
        "Long before a laptop could fabricate a face, Egypt had already worked out how to fabricate — and erase — a ruler's identity, carved directly into stone. Ramesses II, arguably ancient Egypt's most prolific self-promoter, routinely usurped monuments and statues originally built for earlier pharaohs: his workers would re-chisel the cartouches — the oval hieroglyphic seals carrying a ruler's name — on existing statues and reliefs, replacing a predecessor's identity with his own, effectively claiming someone else's completed work and someone else's legacy as his."
      ),
      p(
        "The reverse happened too, and it's better documented: after Hatshepsut's death, one of ancient Egypt's few female pharaohs, her successor Thutmose III — for reasons historians still debate, whether personal, political, or dynastic — ordered much of her image and her cartouches chiseled off temple walls, her statues smashed or buried, and her name largely omitted from later official king lists. Visitors to her mortuary temple at Deir el-Bahari today can still see the exact spots where her figure and name were deliberately cut away, the damage as legible as the reliefs that survived intact beside it."
      ),
      h2("Same Motive, Radically Different Tool"),
      ...bullets([
        "Then: rewriting or erasing someone's identity to claim their achievements, or deny their legitimacy, required a mason, a chisel, and years of labor on a single monument",
        "Now: a deepfake can fabricate a convincing false identity, or discredit a real one, in minutes, and distribute it to millions within hours",
        "The underlying vulnerability being exploited hasn't changed at all — people trust what appears to be attributed to a specific face or a specific name",
        "What changed by many orders of magnitude is speed, reach, and how little skill or resource it now takes to attempt it",
      ]),
      p(
        "That's the genuinely useful way to think about the deepfake problem: it isn't a new kind of deception, it's an ancient one — recarving whose name sits on the work, whose face sits on the achievement — running at a speed and scale no chisel could ever match. A usurped cartouche altered a single monument, discoverable by anyone who compared it closely enough to the surrounding stone. A modern deepfake can alter what millions believe before anyone gets the chance to look closely at all."
      ),
      faq(
        [
          {
            question: "How many deepfakes exist online in 2026?",
            answer:
              "An estimated 8 million deepfakes circulate online as of 2026, up from roughly 500,000 in 2023 — a sixteenfold increase in under three years, with deepfake content growing at close to 900% annually.",
          },
          {
            question: "How good are humans at spotting deepfakes?",
            answer:
              "Poorly. A 2025 iProov study found only 0.1% of 2,000 participants correctly identified every real and fake item shown to them, and human accuracy at detecting high-quality video deepfakes specifically sits at around 24.5%.",
          },
          {
            question: "Why was Hatshepsut's image erased from Egyptian monuments?",
            answer:
              "After her death, her successor Thutmose III ordered much of Hatshepsut's image and cartouches removed from temple walls and her name largely left off later official king lists — a deliberate erasure whose damage is still visible today at her mortuary temple, Deir el-Bahari.",
          },
          {
            question: "Did ancient Egyptian pharaohs usurp each other's monuments?",
            answer:
              "Yes — Ramesses II in particular is well documented re-carving the cartouches on existing statues and monuments originally built for earlier pharaohs, replacing their names with his own to claim the completed work as his.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Stand in front of Hatshepsut's temple today and the erased cartouches are still readable as erasures — a 3,500-year-old identity fraud left visibly unresolved in the stone. It's a strange, useful thing to have in mind the next time a convincing video shows up in your feed."
      ),
      cta({
        title: "See the Erasure for Yourself",
        body: "Hatshepsut's temple at Deir el-Bahari, and the Karnak and Luxor reliefs carrying Ramesses II's own version of events — a full day on Luxor's east and west banks.",
        buttonLabel: "See the Valley of the Kings & Hatshepsut Tour",
        buttonHref: "/tours/valley-of-the-kings-hatshepsut-temple-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "ai-influencers-2026-pharaoh-propaganda",
    title: "AI Influencers Are the Newest Curated Persona. Pharaohs Invented the Genre.",
    category: "Culture & Trends",
    tags: ["AI Influencers", "Virtual Influencers", "Marketing", "Ramesses II", "Battle of Kadesh"],
    author: editorialTeam,
    excerpt:
      "Virtual influencers are a $15.9 billion market in 2026, out-engaging human creators three to one. Ramesses II ran the same playbook 3,300 years earlier — broadcasting one curated version of himself across every temple wall in Egypt.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1502250493741-939d1c76eaad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-06T09:00:00+02:00",
    contentReviewDate: "2027-03-01",
    primaryKeyword: "AI influencers 2026",
    secondaryKeywords: ["virtual influencer market 2026", "AI influencer statistics", "Battle of Kadesh", "Ramesses II propaganda"],
    relatedTours: toursBySlug("luxor-east-bank-day-tour"),
    seoTitle: "AI Influencers in 2026, and Ramesses II's 3,300-Year-Old Version of the Same Playbook",
    seoDescription:
      "The virtual influencer market is worth $15.9 billion in 2026 and out-performing human creators on engagement. Ramesses II built the same kind of curated persona — carved into temple walls across Egypt.",
    body: [
      p(
        "The virtual influencer market — entirely computer-generated personalities, built with AI, 3D design, and animation, complete with invented backstories and consistent \"personalities\" — is projected to be worth $15.9 billion in 2026, growing at a 41.7% compound annual rate. These aren't a novelty act anymore: 73% of surveyed brands globally now use them in some capacity, up from 60% just the prior year, and beauty and personal care brands lead adoption at 89%."
      ),
      h2("The Business Case for a Persona That Doesn't Exist"),
      p(
        "The reason isn't just novelty — it's performance. Virtual influencer campaigns post average engagement rates of 5.67%, roughly three times the 1.89% rate human creators typically achieve, and about 58% of US consumers now report following at least one virtual influencer, with 35% of Gen Z saying they've bought a product an AI persona promoted. CMOs are reportedly planning to allocate up to 30% of influencer marketing budgets to virtual personas in 2026, and brands crossing the 25% allocation threshold report 41% higher returns than those who don't."
      ),
      callout(
        "A synthetic persona now out-engages the median human creator by roughly three to one — a genuinely striking number for a \"person\" who doesn't exist, wasn't ever tired, off-brand, or unavailable for a shoot, and can post in a dozen languages simultaneously.",
        { title: "The Engagement Gap, In One Number", tone: "Info" }
      ),
      h2("Egypt's Original Curated Persona"),
      p(
        "The impulse behind a virtual influencer — build a consistent, idealized, unwaveringly on-brand character and broadcast it everywhere your audience looks — is not remotely new. Ramesses II ran a version of the exact same strategy roughly 3,300 years ago, and the Battle of Kadesh is the cleanest example on record."
      ),
      p(
        "In 1274 BC, Ramesses led Egyptian forces against the Hittite Empire at Kadesh, in what modern historians generally agree was, at best, a tactical draw — Ramesses' own forces were caught in an ambush and nearly overrun, saved only by the arrival of reinforcements, and the campaign's broader strategic objective was never achieved. That is not, however, how Egypt ever heard about it."
      ),
      h2("The Same Story, Carved on Every Available Channel"),
      p(
        "Ramesses had his own account of Kadesh — as a singular, decisive personal triumph, the pharaoh single-handedly rallying his army through sheer divine favor — inscribed in monumental relief and text at Abydos, Karnak, Luxor Temple, the Ramesseum, and Abu Simbel: essentially every major temple complex under his authority, each one functioning as a broadcast channel the way a feed does today. The same curated persona, the same edited version of events, repeated across every surface available to him until it became, for most practical purposes, the official record."
      ),
      p(
        "What's genuinely different about 2026's version isn't the impulse to build and broadcast an idealized persona for public consumption — that's exactly what a pharaoh's propaganda program and a virtual influencer's content calendar are both doing. What's different is that the persona itself can now be entirely synthetic rather than merely exaggerated, and it can be generated and distributed to millions within a day, rather than commissioned from stonemasons and carved over years across an empire's worth of temple walls."
      ),
      faq(
        [
          {
            question: "How big is the AI/virtual influencer market in 2026?",
            answer:
              "The virtual influencer market is projected at $15.9 billion in 2026, growing at a 41.7% compound annual rate, with 73% of surveyed brands globally using virtual influencers in some capacity.",
          },
          {
            question: "Do AI influencers actually perform better than human creators?",
            answer:
              "On engagement, yes on average — virtual influencer campaigns post around 5.67% average engagement versus roughly 1.89% for human creators, though this varies significantly by platform, niche, and audience.",
          },
          {
            question: "What actually happened at the Battle of Kadesh?",
            answer:
              "Fought in 1274 BC between Ramesses II's Egyptian forces and the Hittite Empire, most historians consider it a tactical draw at best — Ramesses was nearly overrun by an ambush before reinforcements arrived — despite Ramesses commissioning temple inscriptions across Egypt describing it as a decisive personal victory.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A pharaoh needed an empire's worth of stonemasons and decades to build and broadcast a persona. A brand in 2026 needs a render farm and an afternoon. The instinct being served is, remarkably, exactly the same one — and it's carved in plain sight on temple walls across Luxor for anyone who wants to see where the genre actually started."
      ),
      cta({
        title: "Read the Original Version",
        body: "Ramesses II's own account of Kadesh, carved across Karnak and Luxor Temple — a full day on Luxor's east bank.",
        buttonLabel: "See the Luxor East Bank Tour",
        buttonHref: "/tours/luxor-east-bank-day-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "ai-photography-2026-premium-vs-commodity",
    title: "AI Ended Stock Photography. It Made Real Photoshoots More Valuable.",
    category: "Tech & AI",
    tags: ["AI Photography", "Stock Photography", "Photography Industry", "Photoshoots"],
    author: editorialTeam,
    excerpt:
      "Stock photographers' collective earnings collapsed from $1.47 billion to $31 million in seven years. What AI actually killed was commodity photography — and it drew a sharper line than ever around what a real, personal photoshoot is worth.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1755121719255-c33cbc04c90f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-07T09:00:00+02:00",
    contentReviewDate: "2027-02-01",
    primaryKeyword: "AI photography 2026",
    secondaryKeywords: ["stock photography collapse", "AI vs photographers", "will AI replace photographers", "flying dress photoshoot Egypt"],
    relatedStories: [
      {
        slug: "ai-generated-video-2026-guide",
        title: "AI Video Got Frighteningly Good in 2026 — Here's What Changed",
        excerpt:
          "Sora, Veo, Kling and Runway can now generate footage that passes for stock video at a glance. Here's what actually changed in 2026 — and why Egypt is one of the easiest places on Earth to fake.",
        imageTone: "luxor",
        category: "Tech & AI",
      },
    ],
    seoTitle: "AI and Photography in 2026: What Actually Collapsed, and What Got More Valuable",
    seoDescription:
      "Stock photography revenue fell 98% in seven years as AI ate the commodity end of the market. Premium, personal, occasion-based photography is doing the opposite — and it's exactly what a real photoshoot delivers.",
    body: [
      p(
        "The stock photography industry was worth roughly $14 billion in 2019. By 2026, it's worth about $3.2 billion — and the photographers who used to supply it have been hit even harder: their collective earnings from stock sales fell from an estimated $1.47 billion in 2019 to around $31 million in 2026, a 98% collapse in seven years. That is not a gradual decline. That is a market that AI-generated imagery essentially replaced."
      ),
      h2("The Collapse, By the Numbers"),
      p(
        "It's worth being precise about which part of photography actually collapsed, because the headline number makes it sound like the whole profession is disappearing — and it isn't. The U.S. Bureau of Labor Statistics projects photographer employment will stay roughly flat through 2032, not shrink dramatically. What's disappeared almost entirely is the market for generic, interchangeable images: basic stock photos, standardized commercial shots, the kind of image that looked like a thousand other images already in the same library. AI-powered tools now generate that category faster and cheaper than any human photographer or agency ever could, and automated systems handle a lot of the routine commercial capture work that used to require a crew."
      ),
      callout(
        "The industry's own read on where the line falls: work that's \"interchangeable\" or \"invisible\" — generic stock, standardized commercial shots — is the part AI has essentially taken over. Weddings, real events, editorial work, and genuine fine art photography are holding strong, in many cases growing.",
        { title: "The Line, According to the Industry", tone: "Info" }
      ),
      h2("What 'Premium' Actually Means Now"),
      p(
        "That line isn't really about technical skill anymore — AI-generated images can match or exceed a human photographer's technical polish in plenty of situations, and the gap keeps closing. The line is about presence. A generic image of a woman in a flowing dress on a desert dune, generated on demand, costs nothing and takes seconds. A photograph of a specific person, in the actual dunes outside Giza or Fayoum, on the actual morning they were there, with real sand still caught in the fabric an hour later, is not something any model can retroactively produce — because it didn't happen inside a model. It happened."
      ),
      p(
        "That's the exact distinction our own photoshoots are built around — the flying-dress sessions in the dunes, a private sunrise session at the pyramids before the site opens to the public, a proposal staged in front of the Great Pyramid itself. None of those are valuable because the visual concept is rare anymore; AI made the generic version of almost every one of those visuals freely available to anyone with a prompt. They're valuable for the reason the industry data actually points to: they're personal, occasion-based, and real — a specific photographer, with a specific client, on a specific day that actually happened in Egypt, not a plausible simulation of one."
      ),
      h2("The Honest Read for Anyone Booking a Photographer in 2026"),
      p(
        "If what you need is a generic, interchangeable image — a stock background, a standard product shot — AI now does that job faster and for a fraction of the cost, and there's little reason to fight that shift. If what you're actually after is a record of something that happened to you, specifically, somewhere that means something, the collapse of the commodity end of the market hasn't devalued that work. If anything, it's clarified exactly why it was never really competing with a stock photo in the first place."
      ),
      faq(
        [
          {
            question: "Is AI replacing professional photographers?",
            answer:
              "Not broadly — the U.S. Bureau of Labor Statistics projects photographer employment will stay roughly flat through 2032. What's collapsed is specifically the commodity end of the market: generic stock photography and standardized commercial shots, where stock photographers' collective earnings fell about 98% between 2019 and 2026.",
          },
          {
            question: "Why has stock photography collapsed so severely?",
            answer:
              "AI image generators can now produce generic, interchangeable images — the kind that used to fill stock libraries — faster and cheaper than photographing and licensing them, driving the stock photography market from roughly $14 billion in 2019 to about $3.2 billion in 2026.",
          },
          {
            question: "What kind of photography is holding up best against AI?",
            answer:
              "Premium, personal, occasion-based work — weddings, real events, editorial photography, and fine art — because its value comes from documenting a specific real moment, something no AI model can manufacture after the fact.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "AI made the generic version of almost any image free. What it can't touch is the one thing a real photoshoot has always actually been selling: proof that you were there, on that morning, in that light, in Egypt."
      ),
      cta({
        title: "Get the Real, Not the Generic",
        body: "A flying dress in the dunes, a private sunrise at the pyramids — shot by a real photographer, on your real trip.",
        buttonLabel: "See the Photoshoots",
        buttonHref: "/photoshoots",
      }),
    ],
  },
];
