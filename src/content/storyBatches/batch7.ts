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
    status: "archived",
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
    relatedStories: [],
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
    status: "archived",
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
    slug: "usurped-cartouches-erased-pharaohs",
    title: "Erased Pharaohs: How to Spot a Stolen Cartouche on a Temple Wall",
    category: "History & Culture",
    tags: ["Cartouches", "Ramesses II", "Hatshepsut", "Akhenaten", "Temples"],
    author: editorialTeam,
    excerpt:
      "Egyptian kings routinely chiselled out their predecessors' names and carved their own into the gap. Once a guide shows you the first recut cartouche, you will see them on every wall in Egypt.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1591040608370-e51e70b4b7ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "usurped cartouches",
    secondaryKeywords: ["erased pharaohs", "what is a cartouche", "Hatshepsut erased", "Ramesses II usurped monuments"],
    relatedTours: toursBySlug("luxor-east-bank-day-tour", "luxor-west-bank-day-tour"),
    seoTitle: "Usurped Cartouches: Reading Erased Names in Egypt",
    seoDescription:
      "Why Egyptian kings recut each other's names, how Hatshepsut and Akhenaten were erased, and the visual clues that let you spot a stolen cartouche while you are standing in front of it.",
    body: [
      p(
        "A cartouche is the oval loop that encircles a royal name in Egyptian writing — a rope, tied at one end, marking out everything the king's rule encloses. It is the single most useful thing a visitor can learn to recognise, and not only because it lets you find Ramesses on a wall. It lets you see where somebody has been removed."
      ),
      h2("Why Names Were Attacked"),
      p(
        "In Egyptian thought a name was not a label but a component of a person, on a par with the body and the ba. To keep existing, a name had to keep being written and spoken. Destroy every instance of it and you were not insulting someone's memory — you were attempting to end them retroactively."
      ),
      p(
        "That belief made inscriptions a battleground, and three episodes account for most of what you will see."
      ),
      h2("The Three You Will Meet"),
      ...bullets([
        "Hatshepsut — her images and names were systematically removed from monuments roughly two decades after her death, during the reign of her successor Thutmose III. The motive is still argued; a dynastic tidying-up of the succession is the current favourite over personal spite",
        "Akhenaten and the Amarna kings — after the return to orthodoxy their names were struck out, their city abandoned and their monuments dismantled for reuse. Tutankhamun's own erasure from king lists is part of the same clean-up, and is why his tomb went unrobbed and unnoticed",
        "Ramesses II — less erasure than appropriation. He recut earlier kings' cartouches with his own name on a scale nobody else matched, across monuments the length of Egypt",
      ]),
      callout(
        "Ramesses II carved his own inscriptions in deep sunk relief rather than shallow raised relief. The usual explanation is that it made them far harder for a successor to grind out and replace — a man who had appropriated that many monuments knew exactly how it was done.",
        { title: "Cutting Deep on Purpose", tone: "Info" }
      ),
      h2("What to Look For"),
      ...bullets([
        "A cartouche noticeably deeper than the ones beside it, or with a rougher, less finished surface inside the loop",
        "Signs that are cramped or spaced oddly, because a new name has been fitted into a space cut for a different one",
        "Ghosting — the faint outline of earlier signs still visible around or beneath the current ones, especially in raking morning light",
        "A blank, hacked-out oval with nothing carved in it at all, which is erasure without replacement",
        "Figures with the face and name chiselled away while the rest of the scene survives intact",
      ]),
      h2("Where to Practise"),
      p(
        "Karnak is the best training ground, simply because so many reigns built there and so many recut each other. Deir el-Bahari has the clearest Hatshepsut erasures. Luxor Temple and the Ramesseum will give you Ramesses II's deep-cut cartouches to compare against everything around them. Ask your guide to show you one confirmed example early in the day — after that you will find them yourself, which is much more satisfying."
      ),
      faq(
        [
          { question: "What is a cartouche?", answer: "An oval loop enclosing a royal name in Egyptian inscriptions, representing a knotted rope and symbolising everything the king's rule encircles." },
          { question: "Why were pharaohs' names erased?", answer: "Egyptians believed a name was part of a person and had to keep being written to keep them in existence. Erasing it was an attempt to end them retroactively, not merely to insult them." },
          { question: "Who erased Hatshepsut?", answer: "Her names and images were removed roughly twenty years after her death, during the reign of Thutmose III. The reasoning is debated, with dynastic succession now favoured over personal hostility." },
          { question: "Did Ramesses II steal other kings' monuments?", answer: "He recut earlier rulers' cartouches with his own name on an unmatched scale, and cut his own inscriptions unusually deep — generally read as a defence against the same thing being done to him." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Egyptian walls are not a fixed record. They are a document that successive owners edited, and the edits are still visible if you stand at the right angle to the light."
      ),
      cta({
        title: "Learn to Read the Walls",
        body: "Karnak and Luxor Temple with a guide who will show you the recut cartouches rather than walking past them.",
        buttonLabel: "See the East Bank tour",
        buttonHref: "/tours/luxor-east-bank-day-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "why-every-pharaoh-looks-the-same",
    title: "Why Every Pharaoh Looks Young, Calm and More or Less Identical",
    category: "History & Culture",
    tags: ["Royal Portraiture", "Akhenaten", "Canon of Proportions", "Statues", "Ancient Egypt"],
    author: editorialTeam,
    excerpt:
      "Three thousand years of royal statues and almost none of them are portraits. Egyptian kings were shown as an office, not a face — which is why the exceptions are so startling.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1568366715736-cf1bb3ea5a4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "why do pharaohs look the same",
    secondaryKeywords: ["Egyptian royal portraiture", "Akhenaten art style", "canon of proportions Egypt", "how to identify a pharaoh statue"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour", "luxor-east-bank-day-tour"),
    seoTitle: "Why Egyptian Pharaohs All Look the Same in Art",
    seoDescription:
      "Idealised royal images, a strict proportional canon, and regalia doing the work of a face — why Egyptian kings are hard to tell apart, and how to identify them anyway.",
    body: [
      p(
        "By the third museum room, most visitors have quietly noticed it. The kings all look alike — same age, same composure, same faintly amused expression, whether the man ruled for two years or sixty-seven. It is not a lack of skill. Egyptian sculptors could carve an unflinching likeness when the job called for it, and did, for officials. Kings were a different job."
      ),
      h2("An Office, Not a Man"),
      p(
        "The king was the guarantor of Maat — order, balance, the correct functioning of the world. What a royal image had to communicate was that the office was intact and functioning, permanently. A tired, ageing, individual face communicates the opposite. So the king is shown in his physical prime, composed, symmetrical, unbothered — regardless of biography."
      ),
      p(
        "Ramesses II ruled into his eighties and is nowhere depicted as an old man. Statues made in his sixth decade on the throne show the same athletic thirty-year-old as those from his first."
      ),
      h2("The Grid"),
      p(
        "Underneath the consistency is a proportional system. Artists laid out figures on a squared grid, with fixed numbers of squares from the ground to the knee, the shoulder, the hairline. Unfinished tomb walls still show the grid lines and the preliminary sketches, which is one of the most revealing things you can see in Egypt — the working method left exposed."
      ),
      p(
        "The canon shifted over time, most notably later in Egyptian history when the grid was recalculated, but within any period it held. Two sculptors in different workshops produced compatible figures because they were following the same arithmetic."
      ),
      callout(
        "Look for grid lines in unfinished tombs and quarry pieces. Once you have seen a half-drawn figure sitting on its squares, every finished wall in Egypt reads differently.",
        { title: "The Working Drawings Survive", tone: "Info" }
      ),
      h2("So How Do You Tell Them Apart?"),
      ...bullets([
        "The cartouche. This is the reliable method, and the reason learning to spot a cartouche is worth the ten minutes",
        "Regalia — the nemes headcloth, the white crown of Upper Egypt, the red crown of Lower Egypt, the combined double crown, the blue khepresh often worn in battle scenes",
        "Period style. Middle Kingdom royal faces are noticeably graver and more careworn than Old or New Kingdom ones — a genuine shift, and one of the few times individual character is allowed in",
        "Context and find spot, which is what museums rely on when a piece has lost its inscription",
      ]),
      h2("The Exception That Proves It"),
      p(
        "Then there is Akhenaten. Under him royal images change completely: elongated skull, heavy lips, narrow eyes, a soft belly and wide hips, and family scenes of the king with his queen and daughters on his lap. Whether it reflects an actual physical condition, a theological statement about the king as both father and mother of his people, or a deliberate rupture with everything before it, is still argued. What is not in doubt is how violently it breaks the rule — and how completely the rule reasserted itself once his reign ended."
      ),
      faq(
        [
          { question: "Why do all Egyptian pharaohs look the same?", answer: "Royal images represented the office rather than the individual, and had to show the king in permanent, ordered prime. A proportional grid kept figures consistent across workshops and centuries." },
          { question: "How do you identify a pharaoh in a statue?", answer: "Primarily by the cartouche containing his name. Regalia and period style narrow it down, but the inscription is the reliable identifier." },
          { question: "Why does Akhenaten look different?", answer: "Art under Akhenaten broke sharply with convention, showing elongated features and intimate family scenes. Explanations range from a medical condition to a theological statement, and the question is unresolved." },
          { question: "Did Egyptian artists ever make realistic portraits?", answer: "Yes — sculptures of officials and non-royal individuals can be strikingly individual, including signs of age and imperfection. The idealisation was specific to royal images." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "It is worth remembering in the museum that you are not looking at pictures of people. You are looking at three thousand years of an institution insisting, in stone, that everything was under control."
      ),
      cta({
        title: "See the Faces in Person",
        body: "Royal and private sculpture side by side in Cairo — the contrast is the whole point.",
        buttonLabel: "See the museum tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
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
    relatedStories: [],
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
