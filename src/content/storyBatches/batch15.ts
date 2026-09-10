import type { Story } from "../types";
import { authors } from "../authors";
import { tours } from "../tours";
import { p, h2, bullets, callout, faq, cta } from "../storyBlocks";

const editorialTeam = authors[0];

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

// World-trends cohort, batch 10 of 10 — the final batch, completing the
// 50-article cohort. Covers cinematic/authentic content, TikTok and
// Instagram as search engines, creator-economy communities, serialized
// short-form video, and human authenticity vs AI content. The final
// story here (human-authenticity-vs-ai-content) fulfills a forward
// reference made from batch6's ai-generated-video-2026-guide article.
// Facts (Instagram's 2026 authenticity-first algorithm shift, Gen Z's
// social search behavior, the 2026 creator-membership economy, and
// TikTok's 2026 microdrama push) were verified via web search; the
// historical Egypt facts (tomb genre scenes, temple reliefs as a visual
// information system, the Deir el-Medina workers' village and its 1157
// BC strike, the Tale of Sinuhe, and scarab/seal authentication) were
// each independently verified.

export const stories: Story[] = [
  {
    status: "published",
    featured: false,
    slug: "cinematic-authentic-content-2026-egypt-tomb-art-duality",
    title: "Raw, Unpolished Video Is Beating Cinematic Perfection in 2026. Egyptian Tomb Art Had the Same Split 4,000 Years Ago.",
    category: "Culture & Trends",
    tags: ["Authentic Content", "Lo-Fi Video", "Ancient Egyptian Art", "Tomb Painting"],
    author: editorialTeam,
    excerpt:
      "Instagram announced in 2026 that its algorithm would favor raw, real human content over polished production. Egyptian tomb art drew the exact same line four thousand years earlier — between rigid, idealized formality and surprisingly lively, unposed genre scenes.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1696513553699-e0145ea0d4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "authentic content trend 2026",
    secondaryKeywords: ["lo-fi video 2026", "Instagram authenticity algorithm", "ancient Egyptian tomb art genre scenes", "raw content vs polished"],
    seoTitle: "Authentic, Lo-Fi Content in 2026, and Egyptian Art's Own Formal-vs-Raw Divide",
    seoDescription:
      "Instagram's 2026 algorithm now favors raw, real content over polished production, with 85% of Gen Z engaging more with lo-fi video. Egyptian tomb art split along the exact same line four thousand years ago.",
    body: [
      p(
        "Polished production lost real ground in 2026. On New Year's Eve 2025, Instagram CEO Adam Mosseri announced that the platform's algorithm would prioritize raw, real human content over heavily produced work through 2026 — and the data backs the shift: 85% of Gen Z now engage more with authentic, lo-fi video than with polished corporate content, and highly produced videos are measurably losing engagement to handheld, unscripted footage shot on a phone."
      ),
      h2("Why Raw Content Is Winning"),
      ...bullets([
        "AI tools made flawless, polished visuals cheap and abundant, which paradoxically made visible human imperfection the actual differentiator",
        "Lo-fi content deliberately embraces camera shake, natural lighting, and unscripted dialogue — signals that read as \"a real person made this\"",
        "Instagram's own 2026 algorithm change formally rewards this kind of content over studio-level production",
      ]),
      callout(
        "The logic driving 2026's authenticity wave is almost a direct inversion of decades of content strategy: once perfection became cheap and automatable, imperfection became the premium signal.",
        { title: "When Perfection Gets Cheap, Imperfection Gets Valuable", tone: "Info" }
      ),
      h2("Egyptian Tomb Art Had the Same Split, 4,000 Years Ago"),
      p(
        "Ancient Egyptian art operated under two distinct, deliberately different registers at once. The formal register — a pharaoh or tomb owner depicted according to the rigid, unchanging canon of proportions, eternally youthful, posed in strict profile, idealized rather than individual — was the era's equivalent of maximum production polish: composed, formal, meant to project timeless perfection rather than a specific, lived moment."
      ),
      p(
        "Running alongside it, in the same tombs, was something genuinely different: genre scenes of everyday life — fishing, dancing, harvest, servants at work, animals captured mid-motion — rendered with real observational looseness, asymmetry, and personality that the formal register never allowed. These weren't accidents or lesser craftsmanship; they were a deliberate, parallel visual mode, valued specifically because they captured something true to life that the idealized formal canon structurally couldn't."
      ),
      h2("The Same Two Registers, Completely Different Tools"),
      p(
        "That's a genuinely direct ancestor of 2026's content split. Egyptian tomb decoration didn't choose between formal perfection and lively, true-to-life observation — it used both, deliberately, for different purposes, in the same space. 2026's content algorithms are re-discovering essentially the same instinct: polish has its place, but the unscripted, imperfect, visibly real register carries a kind of trust and immediacy that no amount of formal composure can substitute for — then, in painted limestone, and now, in a vertical video shot on a phone."
      ),
      faq(
        [
          {
            question: "Why is Instagram favoring raw, unpolished content in 2026?",
            answer:
              "CEO Adam Mosseri announced on New Year's Eve 2025 that Instagram's algorithm would prioritize authentic, real human content through 2026, reflecting data showing 85% of Gen Z engage more with lo-fi video than with polished corporate content.",
          },
          {
            question: "What are ancient Egyptian tomb genre scenes?",
            answer:
              "Lively, naturalistic depictions of everyday activities — fishing, dancing, harvest, animals — found alongside the formal, idealized depictions of tomb owners and pharaohs. They used a deliberately looser, more observational visual style than the rigid formal canon.",
          },
          {
            question: "Did ancient Egyptian art have both formal and informal styles?",
            answer:
              "Yes — formal depictions of pharaohs and tomb owners followed a strict, idealized canon of proportions, while genre scenes of daily life in the same tombs used a much more naturalistic, dynamic style, functioning as two deliberate, parallel visual registers.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A tomb wall painted four thousand years ago already knew what 2026's algorithm just relearned: polish and truth aren't the same register, and sometimes the second one is the one people actually trust."
      ),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "tiktok-instagram-search-engine-2026-egypt-visual-information",
    title: "Gen Z Searches TikTok and Instagram as Much as Google in 2026. Egypt's Information System Was Already Overwhelmingly Visual.",
    category: "Culture & Trends",
    tags: ["Social Search", "TikTok Search", "Gen Z", "Ancient Egyptian Temple Reliefs"],
    author: editorialTeam,
    excerpt:
      "67% of Gen Z now use Instagram for search, 62% use TikTok, and 61% use Google — nearly identical shares. Ancient Egypt's dominant information system was already overwhelmingly visual, built for a population that mostly couldn't read.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1667070796001-a8bda82bd3a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "TikTok Instagram search engine 2026",
    secondaryKeywords: ["Gen Z search behavior 2026", "social search statistics", "ancient Egyptian temple reliefs visual", "hieroglyphs literacy"],
    seoTitle: "TikTok and Instagram as Search Engines in 2026, and Egypt's Visual Precedent",
    seoDescription:
      "67% of Gen Z now use Instagram for search and 62% use TikTok — nearly matching Google's 61%. Ancient Egypt's own information system was already overwhelmingly visual, built for a mostly non-literate population.",
    body: [
      p(
        "Search behavior genuinely fragmented in 2026. Rather than replacing Google outright, Gen Z now splits its search activity nearly evenly across platforms: 67% use Instagram for search, 62% use TikTok, and 61% use Google — remarkably close shares, with each platform serving a different kind of query. Google still wins for factual, transactional, high-stakes searches; TikTok and Instagram win for discovery-driven, visual, lifestyle-oriented ones."
      ),
      h2("How Gen Z Actually Splits Its Searching"),
      ...bullets([
        "65% of Gen Z say they've used TikTok specifically as a search engine, and 77% use it to find products",
        "41% of Gen Z now default to social media first for online searches, rather than a traditional search engine",
        "The split isn't platform replacement — it's task-specific: visual, exploratory search on social platforms, factual and transactional search still on Google",
      ]),
      callout(
        "The real 2026 shift isn't \"TikTok killed Google\" — it's that an entire generation now treats visual, video-based discovery as a completely legitimate, default search method, not a novelty layered on top of typing a query into a text box.",
        { title: "Not a Replacement — a New Default Mode", tone: "Info" }
      ),
      h2("Egypt's Information System Was Already Overwhelmingly Visual"),
      p(
        "Literacy in ancient Egypt was genuinely rare, largely confined to trained scribes and a narrow administrative and priestly class — most of the population could not read hieroglyphic or hieratic text at all. That fact shaped the entire public information system: temple walls, tomb chapels, and public monuments were covered in detailed, sequential visual imagery specifically because images, not text, were how the overwhelming majority of ordinary Egyptians actually received religious, historical, and civic information."
      ),
      p(
        "Even hieroglyphic writing itself sat closer to image than to abstract script — a system built from recognizable pictures of birds, tools, and human figures, readable in part visually even by those without full literacy. The entire public-facing information layer of Egyptian civilization was, by necessity and by design, discovery through images first, text a distant second."
      ),
      h2("The Same Basic Preference, Radically Different Medium"),
      p(
        "Gen Z choosing video and image-based search over typed text in 2026 isn't a rejection of literacy — it's a modern, voluntary version of the same practical preference ancient Egypt had no choice but to build its entire public information system around: for most people, most of the time, an image conveys what's needed faster and more directly than a block of text does. Egypt just had considerably less choice about which medium won."
      ),
      faq(
        [
          {
            question: "How much does Gen Z use TikTok and Instagram for search in 2026?",
            answer:
              "67% of Gen Z use Instagram for search, 62% use TikTok, and 61% use Google — nearly identical shares, with 65% specifically saying they've used TikTok as a search engine and 41% defaulting to social media first for online searches.",
          },
          {
            question: "Why was ancient Egyptian public information so visual?",
            answer:
              "Literacy was rare in ancient Egypt, largely confined to trained scribes and administrators. Temple walls, tombs, and public monuments relied on detailed visual imagery specifically because most ordinary Egyptians couldn't read hieroglyphic or hieratic text at all.",
          },
          {
            question: "Are hieroglyphs pictures or writing?",
            answer:
              "Both — hieroglyphic writing is a genuine, sophisticated writing system, but it's built from recognizable pictorial signs (birds, tools, human figures), giving it a partly visual, partly literate character unlike a purely abstract alphabet.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Gen Z searching TikTok before Google feels like a distinctly 2026 behavior. The underlying preference for image over text as the default way to actually understand something is a great deal older than the platforms currently serving it."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "deir-el-medina-village-that-built-the-tombs",
    title: "Deir el-Medina: The Village That Built the Valley of the Kings",
    category: "History & Culture",
    tags: ["Deir el-Medina", "Luxor West Bank", "Valley of the Kings", "Ramesses III", "Daily Life"],
    author: editorialTeam,
    excerpt:
      "The men who cut the royal tombs lived together in one walled village a short walk away. They left tens of thousands of notes behind — sick days, loans, quarrels, and the first recorded strike in history.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1590133324192-1df305deea6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "Deir el-Medina",
    secondaryKeywords: [
      "workers village Valley of the Kings",
      "first recorded strike in history",
      "Deir el-Medina tombs",
      "Luxor West Bank sites",
    ],
    relatedTours: toursBySlug("luxor-west-bank-day-tour", "2-day-luxor-tour"),
    seoTitle: "Deir el-Medina: The Village Behind the Valley of the Kings",
    seoDescription:
      "The walled village of the workmen who cut and decorated the royal tombs at Luxor — and the ostraca they left behind, including the record of the first known strike, under Ramesses III.",
    body: [
      p(
        "Everyone goes to the Valley of the Kings. Very few people walk the short distance over the ridge to the place where the men who made it lived. Deir el-Medina is one of the most valuable archaeological sites in Egypt for a reason that has nothing to do with gold: it is the best-documented ordinary community anywhere in the ancient world."
      ),
      h2("A Village Built for One Job"),
      p(
        "The Egyptians called it Set Maat — the Place of Truth. It was a purpose-built settlement, walled, on the Luxor West Bank, housing the draughtsmen, stonecutters, plasterers and painters who cut and decorated the royal tombs, along with their families. It was occupied for roughly four centuries, across the New Kingdom, and the men who lived there worked in the valleys on a rota, sleeping in huts nearer the tombs during the working week and coming home on their days off."
      ),
      p(
        "You can still walk the main street. The house plans are legible — narrow, terraced, opening off a single lane inside the enclosure wall. It is a small place, and its smallness is the point: everyone knew everyone, and everything got written down."
      ),
      h2("What They Left Behind"),
      p(
        "Papyrus was expensive. Limestone flakes and broken pottery were not, and the village sat on a hillside made of them. The workmen used those flakes — ostraca — as notepaper, and tens of thousands survive."
      ),
      ...bullets([
        "Attendance registers, with the reason each man was absent — illness, a family funeral, brewing beer, a scorpion sting, an argument with his wife",
        "Loans, IOUs and property disputes between neighbours",
        "Wills, marriage arrangements and divorce settlements",
        "Complaints about the quality of the rations, and about each other",
        "Practice sketches, drafts of scenes, and drawings that were clearly done for fun",
      ]),
      callout(
        "Almost everything we know about ancient Egypt comes from tombs and temples — the version of life the elite wanted preserved. Deir el-Medina is the exception: an unglamorous, unedited record of what ordinary working people were actually doing, arguing about and worrying over, written by themselves.",
        { title: "Why It Matters So Much", tone: "Info" }
      ),
      h2("The First Strike on Record"),
      p(
        "In the twenty-ninth year of the reign of Ramesses III — around 1157 BC — the rations that paid the workforce stopped arriving on time. Grain was the wage; late grain meant hungry families. The men downed tools, walked out of the work sites and staged sit-ins at the mortuary temples, refusing to move until they were paid."
      ),
      p(
        "A scribe named Amennakht recorded the whole affair, and the account survives on what is now known as the Turin Strike Papyrus. It is the earliest documented labour strike in human history, and it reads exactly like one: grievances stated, officials stalling, partial payment offered, the men going back out again when it did not hold."
      ),
      h2("Their Own Tombs"),
      p(
        "The workmen decorated royal tombs for a living, and then decorated their own. The village necropolis climbs the slope above the houses, and the small chapels and burial chambers there are among the most vividly painted spaces in Egypt — the tomb of Sennedjem in particular, with its intense colour and its scenes of the owner and his wife working the fields of the afterlife. They are small, they are crowded, and they were made by people who cut royal tombs all week and then did this on their own time."
      ),
      h2("Visiting"),
      ...bullets([
        "Deir el-Medina is on the Luxor West Bank, close to the Valley of the Queens and easily added to a West Bank morning",
        "Entry to the decorated tombs is usually a separate ticket from the village site — check what your ticket covers before you climb",
        "The tombs are small, steep and hot; they empty out much faster than the Valley of the Kings",
        "Allow longer than you think for the village itself. Walking the street is the part that stays with people",
      ]),
      faq(
        [
          {
            question: "What is Deir el-Medina?",
            answer:
              "The walled village on the Luxor West Bank that housed the workmen and families who cut and decorated the royal tombs in the Valley of the Kings and Valley of the Queens during the New Kingdom.",
          },
          {
            question: "What was the first recorded strike in history?",
            answer:
              "A walkout by the Deir el-Medina workforce in the twenty-ninth year of Ramesses III, around 1157 BC, after their grain rations arrived late. It was recorded by the scribe Amennakht and survives on the Turin Strike Papyrus.",
          },
          {
            question: "What are ostraca?",
            answer:
              "Flakes of limestone and broken pottery used as cheap writing material. Tens of thousands survive from Deir el-Medina, covering everything from attendance records to personal disputes and practice sketches.",
          },
          {
            question: "Can you visit Deir el-Medina?",
            answer:
              "Yes. The village and several of the workmen's own decorated tombs are open, and it sits close enough to the Valley of the Queens to be added to a standard West Bank itinerary.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The Valley of the Kings tells you what the pharaohs wanted said about themselves. Deir el-Medina, a twenty-minute walk away, tells you who was hungover, who owed whom a sack of grain, and what happened when the wages were late. Both are worth your morning."
      ),
      cta({
        title: "Add Deir el-Medina to Your West Bank Day",
        body: "Most itineraries run the Valley of the Kings and leave. A private day has room for the village the tomb-makers lived in.",
        buttonLabel: "See the West Bank tour",
        buttonHref: "/tours/luxor-west-bank-day-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "serialized-short-form-content-2026-tale-of-sinuhe",
    title: "TikTok Is Betting Big on One-Minute Cliffhanger Dramas in 2026. Egypt's Favorite Story Ran on the Same Format 4,000 Years Ago.",
    category: "Culture & Trends",
    tags: ["Microdramas", "TikTok Short Drama", "Tale of Sinuhe", "Ancient Egyptian Literature"],
    author: editorialTeam,
    excerpt:
      "The global short-drama market could reach $3 billion in 2026, built on one-to-three-minute serialized episodes and cliffhanger endings. The Tale of Sinuhe was ancient Egypt's own serialized hit — copied and recopied by scribes for 750 years.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1608546043931-6c9678ea9feb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "serialized short-form content 2026",
    secondaryKeywords: ["TikTok microdrama 2026", "short drama market 2026", "Tale of Sinuhe", "ancient Egyptian literature"],
    seoTitle: "Serialized Short-Form Content in 2026, and Egypt's 4,000-Year-Old Version",
    seoDescription:
      "TikTok launched a dedicated microdrama feed in 2026, part of a global short-drama market projected to hit $3 billion. The Tale of Sinuhe was ancient Egypt's own serialized favorite, copied by scribes for 750 years.",
    body: [
      p(
        "Serialized, bite-sized drama became a real content category in 2026, not just a novelty. In January, TikTok rolled out PineDrama, a dedicated app for scripted microdramas, in the US and Brazil, and is now testing a separate short-drama feed inside its main app. US short-drama app revenue hit roughly $700 million in 2025 alone, nearly quadruple the year before, and the global short-drama market outside China is projected to reach $3 billion in 2026."
      ),
      h2("What Actually Defines a 2026 Microdrama"),
      ...bullets([
        "Vertical, 9:16 format episodes typically running 60 to 180 seconds, built specifically for mobile viewing",
        "Structured around cliffhanger endings designed to pull viewers directly into the next episode",
        "Major studios and production companies are now writing and producing for the format specifically, not repurposing longer content down to size",
      ]),
      callout(
        "The format's core mechanic isn't new storytelling technology — it's simply serialization compressed to its smallest reliable unit: enough story to matter, cut off at exactly the point that guarantees the next episode gets watched.",
        { title: "The Mechanic Behind the Format", tone: "Info" }
      ),
      h2("Egypt's Favorite Story Ran on the Same Format"),
      p(
        "The Tale of Sinuhe, composed in the Middle Kingdom, recounts a royal courtier who flees Egypt under mysterious circumstances, lives for years in foreign lands, and eventually returns home in old age — a gripping first-person adventure that was, by a wide margin, ancient Egypt's most popular literary work. It survives today in far more copies than any other Egyptian literary narrative — at least five papyri and roughly 30 ostraca — because scribal schools used it as a standard training text for centuries, especially during Ramesside times. Some surviving copies date up to 750 years after the original composition, an almost unheard-of publishing lifespan for any single story."
      ),
      h2("The Same Instinct, a Radically Different Delivery Window"),
      p(
        "Sinuhe wasn't consumed in a single sitting the way a modern reader might binge a short novel — it was studied, copied, and re-copied piece by piece by generations of trainee scribes, its episodes and turns absorbed gradually across a career of practice rather than devoured in one pass. That's not identical to a 90-second TikTok cliffhanger, but it shares the underlying instinct 2026's microdrama boom is chasing: a story doesn't need to be told all at once to hold an audience for centuries. It needs to be worth returning to, one piece at a time."
      ),
      faq(
        [
          {
            question: "How big is the short-drama market in 2026?",
            answer:
              "The global short-drama market, excluding China, is projected to reach $3 billion in 2026, following US short-drama app revenue of roughly $700 million in 2025 — nearly four times the prior year.",
          },
          {
            question: "What is the Tale of Sinuhe?",
            answer:
              "Ancient Egypt's most popular literary work, composed in the Middle Kingdom, following a royal courtier who flees Egypt and eventually returns home in old age. It survives in more copies — at least five papyri and 30 ostraca — than any other ancient Egyptian literary narrative.",
          },
          {
            question: "How long was the Tale of Sinuhe copied and studied?",
            answer:
              "Scribal schools used it as a standard training text for centuries, especially during Ramesside times, with some surviving copies dating up to 750 years after the story's original Middle Kingdom composition.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "TikTok is betting that a story cut into small enough pieces can hold an audience indefinitely. Egypt's own favorite story already proved that, one scribe's copy at a time, for the better part of a millennium."
      ),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "human-authenticity-vs-ai-content",
    title: "Why \"This Looks Real\" Became the Highest Compliment on the Internet",
    category: "Culture & Trends",
    tags: ["AI Content", "Human Authenticity", "Ancient Egyptian Seals", "Digital Trust"],
    author: editorialTeam,
    excerpt:
      "As AI-generated content gets harder to spot, unmistakably human, unmistakably real footage has become its own kind of currency. Here's why authenticity became a selling point rather than a given — and how ancient Egypt built technology to solve the exact same problem.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1786438936222-cca1f5f5ca27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "human authenticity vs AI content 2026",
    secondaryKeywords: ["AI content trust 2026", "proof of authenticity", "ancient Egyptian scarab seals", "digital authenticity verification"],
    relatedStories: [],
    seoTitle: "Human Authenticity vs AI Content in 2026, and Egypt's Ancient Answer",
    seoDescription:
      "As AI-generated content becomes harder to detect, unmistakably real, human-made content has become its own form of currency. Ancient Egypt built real technology — scarab and cylinder seals — to solve the exact same authenticity problem.",
    body: [
      p(
        "Somewhere across the last few years, \"this looks real\" quietly became one of the highest compliments the internet pays anything. It's a strange inversion: for most of media history, looking real was simply the baseline, the unremarkable default. In 2026, with AI-generated video, images, and voices routinely passing casual inspection, unmistakable, verifiable realness has become something scarce enough to be worth pointing out — and worth paying a premium for."
      ),
      h2("Why Authenticity Became a Selling Point"),
      ...bullets([
        "As AI-generated content approaches indistinguishable quality, the cost of producing a convincing fake collapses toward zero",
        "That collapse doesn't devalue realness — it does the opposite, because anything genuinely, verifiably real now signals effort, risk, and presence that a generated equivalent structurally can't",
        "Platforms, brands, and creators have all started explicitly marketing verified authenticity as a feature, not assuming audiences will simply take it for granted",
      ]),
      callout(
        "Once a convincing fake costs nothing to produce, proof that something is genuinely real stops being a footnote and becomes the actual product — a fundamental reordering of what \"content\" is even supposed to prove.",
        { title: "When Fakes Are Free, Proof Becomes the Product", tone: "Info" }
      ),
      h2("Egypt Already Built Technology to Solve This Exact Problem"),
      p(
        "Long before anyone needed to prove a video was real, ancient Egypt needed to prove a document, a sealed container, or a tomb closure hadn't been tampered with — and it built genuine technology to do it. A scarab or cylinder seal, carved with a unique design tied to a specific official or authority, was pressed into wet clay or mud sealing a jar, a papyrus document, or a doorway. Breaking that seal without authorization was immediately, visibly obvious — the sealing itself was the proof that whatever it protected was exactly what it claimed to be, untouched since the moment it was sealed."
      ),
      p(
        "That's a genuinely direct ancestor of what verification technology is racing to rebuild in 2026: a reliable, tamper-evident way to prove something is exactly what it claims to be, from a source that can be trusted, unaltered since the moment it was made real. Egypt's version worked with wet clay and a carved stone. Ours needs cryptographic signatures and provenance metadata. The underlying problem — how do you prove this hasn't been faked or altered — is the same one, running continuously since the first scarab seal was pressed into a jar of grain."
      ),
      h2("What Actually Changed, and What Didn't"),
      p(
        "What's genuinely new in 2026 is the scale and speed at which a convincing fake can now be produced — not the underlying anxiety about trusting what you're looking at, which is, it turns out, a very old problem indeed. A photograph of a specific person, in a specific place, on a specific real day, still can't be generated after the fact by any model — it can only be captured, the way a scarab seal could only be broken, not counterfeited without leaving a mark. That's precisely why unmistakably real content has become a form of currency in 2026: not because realness got better, but because faking it got so cheap that the real thing needed a name for what it always quietly was."
      ),
      faq(
        [
          {
            question: "Why has 'looking real' become a selling point in 2026?",
            answer:
              "As AI-generated video, images, and voices have become harder to distinguish from genuine content, the cost of producing a convincing fake has collapsed — making unmistakably real, verifiable content scarce and valuable precisely because it can't be manufactured the same cheap way.",
          },
          {
            question: "How did ancient Egyptians verify that something was authentic and untampered?",
            answer:
              "Using scarab or cylinder seals carved with a unique design, pressed into wet clay or mud sealing a document, jar, or doorway. Breaking the seal without authorization was immediately visible, making the intact seal itself proof the contents hadn't been altered.",
          },
          {
            question: "What is the modern equivalent of an ancient Egyptian seal?",
            answer:
              "Cryptographic signatures, content provenance metadata, and verification technology now being developed to prove digital content is genuine and unaltered — solving essentially the same authenticity problem ancient sealing technology addressed for physical documents and goods.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The internet spent 2026 relearning a lesson ancient Egypt built real technology around thousands of years earlier: once a convincing forgery becomes easy, proving something is genuinely real stops being assumed — and starts being worth something."
      ),
      cta({
        title: "See the Real Thing, In Person",
        body: "No verification needed — a photographer who was actually there, on your actual trip, in the actual desert.",
        buttonLabel: "See the Photoshoots",
        buttonHref: "/photoshoots",
      }),
    ],
  },
];
