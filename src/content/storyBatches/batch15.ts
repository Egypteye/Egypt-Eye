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
    slug: "how-to-read-egyptian-tomb-art",
    title: "How to Read Egyptian Tomb Art: A Visitor's Guide to the Walls",
    category: "Travel Guides",
    tags: ["Tomb Art", "Hieroglyphs", "Luxor", "Valley of the Kings", "Planning"],
    author: editorialTeam,
    excerpt:
      "Egyptian painting is not bad perspective. It is a different system, and it is consistent. Learn five rules before you go and the walls stop being decoration and start being sentences.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1591040608370-e51e70b4b7ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "how to read Egyptian tomb art",
    secondaryKeywords: ["Egyptian art conventions", "Egyptian tomb paintings meaning", "why Egyptian figures face sideways", "Valley of the Kings art"],
    relatedTours: toursBySlug("luxor-west-bank-day-tour", "valley-of-the-kings-hatshepsut-temple-tour"),
    seoTitle: "How to Read Egyptian Tomb Art Before You Visit",
    seoDescription:
      "Registers, hierarchy of scale, composite view, colour conventions and the false door — the five rules that turn Egyptian tomb walls from decoration into something you can actually read.",
    body: [
      p(
        "The most common reaction inside a decorated tomb is a slight, unspoken disappointment. The paintings are beautiful but they look stiff, and the figures seem to have been drawn by someone who had not worked out perspective. Neither impression survives ten minutes of knowing what the rules were."
      ),
      h2("1. Read in Registers"),
      p(
        "Scenes are organised into horizontal bands, each with its own ground line. A wall is not one picture; it is several strips of related action stacked up, usually read from the bottom. Once you see the bands, the apparent clutter resolves into sequence — sowing in one, harvesting in the next, threshing above that."
      ),
      h2("2. Size Means Status, Not Distance"),
      p(
        "The tomb owner is the largest figure on the wall. His wife is often slightly smaller, children smaller again, and servants and labourers smallest of all. Nothing recedes into the background because nothing is meant to. A scale difference is a statement about rank, not about how far away someone was standing."
      ),
      h2("3. Every Part From Its Clearest Angle"),
      p(
        "The famous twisted pose is a deliberate composite: head in profile because a profile is unmistakable, eye shown frontally because that is how an eye reads, shoulders square on to show both arms, hips and legs turned back to profile with both feet visible. It is not a failure to foreshorten. It is a rule that each part of a body should be shown in the aspect that identifies it best — an inventory rather than a snapshot."
      ),
      callout(
        "That is also why the same convention lasted three thousand years with so little change. It was not a style anyone was trying to improve on; it was a system for recording things accurately and permanently, and it worked.",
        { title: "Why It Never Changed", tone: "Highlight" }
      ),
      h2("4. Colour Is Code"),
      ...bullets([
        "Men are conventionally painted a dark red-brown, women a paler yellow — a convention about outdoor and indoor life rather than a record of actual complexions",
        "Green and blue carry connotations of fertility, rebirth and the Nile; Osiris is often green-skinned for exactly that reason",
        "Black is the colour of the fertile silt and so of regeneration, not of death or evil",
        "Yellow stands in for gold, and therefore for the flesh of the gods",
      ]),
      h2("5. Know What a False Door Is"),
      p(
        "In many tombs, especially older ones, you will find a carved doorway that leads nowhere — recessed panels, a lintel, sometimes a figure of the owner stepping through. It is not decoration and not an unfinished exit. It is the threshold through which the ka was to pass to receive offerings, with the offering table set in front of it. It is the functional centre of the whole chapel."
      ),
      h2("Royal Tombs Versus Private Ones"),
      p(
        "The difference catches people out. Private tombs are full of daily life — farming, fishing, baking, music, hunting in the marshes — because the owner wanted that life to continue. Royal tombs in the Valley of the Kings are almost entirely religious, covered in funerary texts and the sun's night journey. If you want to see how Egyptians actually lived, the nobles' tombs and Deir el-Medina repay a visit far more than the royal valley does."
      ),
      faq(
        [
          { question: "Why do Egyptian figures face sideways?", answer: "Each part of the body is shown from the angle that identifies it most clearly — head and legs in profile, eye and shoulders frontal. It is a deliberate system for recording, not a failure of perspective." },
          { question: "Why are some figures bigger than others?", answer: "Scale indicates status. The tomb owner is largest, family smaller, servants smallest. It has nothing to do with distance." },
          { question: "What is a false door?", answer: "A carved doorway leading nowhere, through which the ka of the deceased was believed to pass to receive offerings left at the table in front of it." },
          { question: "Why do royal and private tombs look so different?", answer: "Private tombs show daily life the owner hoped to continue; royal tombs are covered in funerary religious texts. For scenes of ordinary Egyptian life, the nobles' tombs are the better visit." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Spend twenty minutes on these five rules before your West Bank morning and you will spend that morning reading rather than looking. It is the single highest-return preparation anyone can do for an Egypt trip."
      ),
      cta({
        title: "Go With Someone Who Translates",
        body: "A private West Bank day with time in the nobles' tombs, not just the royal valley.",
        buttonLabel: "See the West Bank tour",
        buttonHref: "/tours/luxor-west-bank-day-tour",
      }),
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
    slug: "tale-of-sinuhe",
    title: "The Tale of Sinuhe: Egypt's Favourite Story for a Thousand Years",
    category: "History & Culture",
    tags: ["Tale of Sinuhe", "Middle Kingdom", "Egyptian Literature", "Senwosret I", "Papyrus"],
    author: editorialTeam,
    excerpt:
      "A court official overhears something he should not, panics, and runs. What follows was copied and recopied by Egyptian scribes for a millennium — the closest thing the ancient world had to a bestseller.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1590133324192-1df305deea6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "Tale of Sinuhe",
    secondaryKeywords: ["ancient Egyptian literature", "Middle Kingdom stories", "Sinuhe summary", "Egyptian papyrus texts"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour", "luxor-east-bank-day-tour"),
    seoTitle: "The Tale of Sinuhe: Ancient Egypt's Best-Known Story",
    seoDescription:
      "Written around 1875 BC and copied for a thousand years afterwards — what happens in the Tale of Sinuhe, why Egyptian scribes could not leave it alone, and what it reveals about how Egyptians saw the world.",
    body: [
      p(
        "Most of what survives from ancient Egypt was written to be permanent: tomb inscriptions, temple dedications, king lists. The Tale of Sinuhe is different. It is a story, written to be enjoyed, and Egyptian scribes copied it out for something like a thousand years — on papyrus rolls, on limestone flakes, as a school exercise. More copies survive than of anything else in Egyptian literature."
      ),
      h2("What Happens"),
      p(
        "Sinuhe is an official in the household of a royal wife, on campaign in Libya, when word arrives that the king, Amenemhat I, has died. He overhears something about the succession — the text is deliberately vague about what — and is seized by a terror he cannot afterwards explain. He runs."
      ),
      p(
        "He crosses the eastern frontier, nearly dies of thirst in the desert, and is taken in by a chieftain in Retjenu, in the Levant. There he prospers: he marries, has sons, becomes wealthy, commands troops, and defeats a local champion in single combat. He has, by any measure, done extremely well abroad."
      ),
      p(
        "And he is miserable. The heart of the story is his growing dread of dying outside Egypt and being buried in a sheepskin rather than properly, in his own land. Eventually the new king, Senwosret I, sends word inviting him home. Sinuhe returns, is received at court, is given a house and a tomb, and the story closes with him waiting for death in the right country."
      ),
      callout(
        "The single-combat scene — Sinuhe against a champion of Retjenu, the whole district watching, one arrow to the neck — is the passage most often quoted, and has been compared to David and Goliath more times than it deserves. The comparison is loose; the appeal of a duel narrative is simply universal.",
        { title: "The Fight Everyone Remembers", tone: "Info" }
      ),
      h2("Why Egyptians Kept Copying It"),
      ...bullets([
        "It is genuinely well written — the prose shifts register between narrative, poetry and formal letter, and scribes clearly used it as a model of style",
        "It flatters the monarchy without being propaganda: the king is generous, the exile is forgiven, the natural order reasserts itself",
        "It works as an argument for Egypt itself. A man succeeds abroad by every material measure and still cannot bear to be buried there",
        "It has a psychologically real protagonist. Sinuhe's panic is never justified or explained away, and he spends the whole story being quietly ashamed of it",
      ]),
      h2("Where It Survives"),
      p(
        "The best-preserved copies are on papyri now in Berlin, with substantial further portions on other papyri and on dozens of ostraca — the limestone flakes scribes and students wrote on. The wide spread of those fragments across sites and centuries is what tells us it was read, not merely archived: this was a text people learned, quoted and set as homework."
      ),
      faq(
        [
          { question: "What is the Tale of Sinuhe about?", answer: "An Egyptian court official who flees the country in panic after the death of Amenemhat I, prospers in exile in the Levant, and spends years longing to return to Egypt so he can be buried properly. The king eventually recalls him." },
          { question: "When was the Tale of Sinuhe written?", answer: "In the Middle Kingdom, around 1875 BC, during or shortly after the reign of Senwosret I. It continued to be copied for roughly a thousand years." },
          { question: "Why is the Tale of Sinuhe important?", answer: "It survives in more copies than any other work of Egyptian literature, was used as a model of style by scribes, and gives a rare view of how Egyptians thought about exile, home and a proper burial." },
          { question: "Where can you see the Tale of Sinuhe?", answer: "The principal papyrus copies are in Berlin, with fragments in other collections. Egyptian museums display comparable literary papyri and the ostraca that scribes practised on." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Four thousand years on, the thing that makes it work is unchanged: a man who ran for reasons he cannot articulate, did well, and wanted to go home anyway."
      ),
      cta({
        title: "See What Egyptians Actually Wrote",
        body: "Literary papyri, scribal palettes and the ostraca of everyday writing, in the Cairo collections.",
        buttonLabel: "See the museum tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
      }),
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
