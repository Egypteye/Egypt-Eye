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
    slug: "photorealistic-video-games-2026-pyramid-laser-scan",
    title: "Video Games Got Photorealistic in 2026. Egypt's Monuments Were Laser-Scanned to the Centimetre Two Decades Earlier.",
    category: "Culture & Trends",
    tags: ["Video Games", "Photorealistic Graphics", "Unreal Engine 5", "Digital Preservation", "Great Pyramid"],
    author: editorialTeam,
    excerpt:
      "Unreal Engine 5's Nanite, Lumen, and path tracing make 2026's best games nearly indistinguishable from reality. Giza's monuments were already digitized to within a centimetre of accuracy, back in 2004, for an entirely different reason.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1541769740-098e80269166?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-02-01",
    primaryKeyword: "photorealistic video games 2026",
    secondaryKeywords: ["Unreal Engine 5 Nanite Lumen", "photogrammetry games", "Great Pyramid laser scan", "digital preservation Giza"],
    seoTitle: "Photorealistic Games in 2026, and Egypt's Own Centimetre-Accurate Digital Twin",
    seoDescription:
      "Unreal Engine 5's Nanite and Lumen make 2026 games look almost real. Giza's monuments were laser-scanned to within a centimetre back in 2004 — the same core technique, aimed at a completely different goal.",
    body: [
      p(
        "Video game graphics crossed a genuinely strange threshold in 2026. Unreal Engine 5's Nanite (virtualized geometry) and Lumen (real-time global illumination) have eliminated the old workarounds — light-baking, level-of-detail management — that used to separate a game's environments from something photographed. Path tracing is now standard in major releases, handling reflections, natural light bounce, and shadow accuracy the way a real camera lens would, and titles like Ninja Theory's Hellblade II combine photogrammetry-scanned real landscapes with MetaHuman-grade facial capture to close the gap even further."
      ),
      h2("How Real 'Real' Actually Looks Now"),
      ...bullets([
        "Characters show visible skin pores, individually simulated hair movement, and clothing that wrinkles and hangs the way real fabric does",
        "Path tracing renders reflections on metal, water, and glass, natural global illumination, and accurate shadows without artist-placed light sources",
        "Photogrammetry — scanning real-world locations to build game environments — is now a standard production technique, not a novelty",
        "DLSS 5 and PSSR make 4K resolution at 60 frames per second feel routine on current-generation consoles",
      ]),
      callout(
        "Ninja Theory built Hellblade II by combining photogrammetry-scanned Icelandic landscapes with MetaHuman-grade facial capture — explicitly aiming to make it the most photorealistic game ever produced. The techniques behind that ambition already had a twenty-year head start in an unrelated field.",
        { title: "The Same Toolkit, an Older Application", tone: "Info" }
      ),
      h2("Egypt's Monuments Were Already Digitized to the Centimetre"),
      p(
        "In 2004, the Scanning of the Pyramids Project applied high-resolution terrestrial laser scanning, combined with calibrated digital photography, to the Great Pyramid (Cheops) and the Sphinx at Giza. Using a RIEGL LMS Z420i laser scanner and a Nikon D100 camera, the project collected approximately 100 million individual measurements, achieving an accuracy of roughly one centimetre — and produced a full digital elevation model of the entire Giza plateau within a 1.3-kilometre radius of the Great Pyramid. It's essentially the identical core technique — high-resolution laser scanning combined with photogrammetry — that now underlies the photorealistic environments in games like Hellblade II, applied two decades earlier for a completely different purpose."
      ),
      h2("Two Different Reasons for the Same Technique"),
      p(
        "Games use laser scanning and photogrammetry to make a fictional world feel convincingly real. The 2004 Giza project used the identical toolkit to make sure the real world doesn't quietly disappear — creating a permanent, centimetre-accurate digital record specifically so structural anomalies could be monitored and the monuments' condition tracked over time, insurance against damage, decay, or disaster that no amount of photorealistic rendering could actually prevent. Same instruments, same underlying data-capture method, opposite motive: entertainment on one side, and preservation of something irreplaceable on the other."
      ),
      p(
        "As game engines get good enough to recreate the Giza plateau pixel for pixel, it's worth remembering the real plateau was already mapped to within a centimetre of precision, for a far more serious reason, well before most of today's photorealistic engines existed."
      ),
      faq(
        [
          {
            question: "What makes 2026's video games look photorealistic?",
            answer:
              "Unreal Engine 5's Nanite (virtualized geometry) and Lumen (real-time global illumination) systems, combined with path tracing for accurate reflections and shadows, and photogrammetry techniques that scan real-world locations and objects to build game environments and character models.",
          },
          {
            question: "When were the Giza pyramids laser-scanned?",
            answer:
              "The Scanning of the Pyramids Project in 2004 used high-resolution terrestrial laser scanning and photogrammetry to document the Great Pyramid and Sphinx, collecting approximately 100 million measurements at roughly 1-centimetre accuracy and producing a digital elevation model of the surrounding Giza plateau.",
          },
          {
            question: "Why was the Great Pyramid laser-scanned?",
            answer:
              "To create a permanent, highly accurate digital record for monitoring the monuments' structural condition over time and supporting their preservation — the same core scanning and photogrammetry techniques now used to build photorealistic video game environments, applied roughly two decades earlier for a documentation and conservation purpose.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A game engine chasing photorealism and a 2004 conservation project chasing precision ended up reaching for the exact same instruments — one to build a convincing illusion, the other to protect something that can't be rebuilt if it's lost."
      ),
      cta({
        title: "See the Real Thing",
        body: "No engine required — a full day at the actual Giza plateau, centimetre-accurate and still standing.",
        buttonLabel: "See the Giza Pyramids Tour",
        buttonHref: "/tours/1-day-giza-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "vr-ar-spatial-computing-2026-giza-sound-light-show",
    title: "VR and AR Finally Went Mainstream in 2026. Giza Has Been Running Immersive Storytelling Since 1961.",
    category: "Culture & Trends",
    tags: ["VR", "AR", "Spatial Computing", "Apple Vision Pro", "Sound and Light Show"],
    author: editorialTeam,
    excerpt:
      "The AR/VR market hit roughly $97 billion in 2026, with Apple's Vision Pro 2 and Meta's smart glasses leading the charge. Giza's Sound & Light Show, running continuously since 1961, was projecting narrative onto real physical space decades before the phrase \"spatial computing\" existed.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1667765460178-db9eae077f00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "VR AR spatial computing 2026",
    secondaryKeywords: ["Apple Vision Pro 2", "Meta Quest 2026", "spatial computing market", "Giza Sound and Light Show"],
    relatedTours: toursBySlug("giza-pyramids-sound-and-light-show"),
    seoTitle: "Spatial Computing in 2026, and Giza's 1961 Head Start",
    seoDescription:
      "The AR/VR market reached roughly $97 billion in 2026 with Apple's Vision Pro 2 and Meta's dominant Quest line. Giza's Sound & Light Show has been overlaying narrative onto real monuments since 1961.",
    body: [
      p(
        "Spatial computing crossed from novelty into genuine mainstream infrastructure in 2026. The combined augmented and virtual reality market reached an estimated $97.41 billion this year, on track for $268.58 billion by 2032, and more than 75% of Fortune 500 companies now use XR technology in some capacity — well beyond the gaming and entertainment use cases that defined the category a few years ago."
      ),
      h2("Where Spatial Computing Actually Stands in 2026"),
      ...bullets([
        "Apple released the Vision Pro 2 in January 2026 at $2,499 — 30% lighter, running an M4 Pro chip, with improved hand tracking and, notably, optional handheld controllers",
        "Meta continues to dominate VR headsets with roughly 43% market share through its Quest line, though its smart glasses revenue ($2.15 billion) surpassed Quest hardware revenue ($660 million) for the first time in 2025",
        "Industries well beyond gaming and retail — healthcare, education, industrial training — are now significant XR adopters",
      ]),
      callout(
        "A technology category that spent its first several years defined almost entirely by headset gaming has, in 2026, become something over three-quarters of the world's largest companies actively deploy — a genuinely fast maturation for consumer-facing hardware.",
        { title: "From Gaming Novelty to Enterprise Infrastructure", tone: "Info" }
      ),
      h2("Giza Has Been Running Its Own Version Since 1961"),
      p(
        "The Sound & Light Show at the Giza pyramids first launched in 1961, making it one of the earliest large-scale examples of this idea anywhere in the world — decades before anyone used the phrase \"spatial computing.\" Synchronized narration, music, and colored light are projected directly onto the Great Pyramid, the Sphinx, and the surrounding monuments after dark, using the real, physical structures themselves as the display surface to narrate thousands of years of history to a live audience seated right in front of them."
      ),
      h2("The Same Idea, Waiting on the Hardware to Catch Up"),
      p(
        "Strip away the terminology, and it's hard to find a cleaner definition of augmented reality than a narrative and visual layer projected directly onto real physical space rather than replacing it — which is precisely what Giza's show has done, communally, for a live audience, using theatrical light and sound instead of a headset, since a full sixty-five years before Apple's Vision Pro 2. What's genuinely changed with 2026's spatial computing boom isn't the core concept — it's that the same idea is now personal and portable rather than fixed to one specific plateau after sunset."
      ),
      faq(
        [
          {
            question: "How big is the AR/VR market in 2026?",
            answer:
              "The combined augmented and virtual reality market reached an estimated $97.41 billion in 2026, projected to grow to $268.58 billion by 2032 at an 18.4% compound annual growth rate.",
          },
          {
            question: "What is the Apple Vision Pro 2?",
            answer:
              "Released in January 2026 at $2,499, it's a 30% lighter successor to the original Vision Pro, running an M4 Pro chip with improved hand tracking and optional handheld controllers.",
          },
          {
            question: "When did the Giza Sound & Light Show start?",
            answer:
              "1961, making it one of the earliest large-scale examples of projecting a synchronized audiovisual narrative directly onto real physical monuments — the Great Pyramid, the Sphinx, and surrounding structures — for a live audience.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A headset that overlays a story onto your living room is 2026's spatial computing breakthrough. A pyramid that's had a story projected onto it, live, every night for over sixty years, got there first."
      ),
      cta({
        title: "See the Original Immersive Show",
        body: "Light and sound projected onto the actual pyramids and Sphinx — running since 1961, no headset required.",
        buttonLabel: "See the Sound & Light Show",
        buttonHref: "/tours/giza-pyramids-sound-and-light-show",
      }),
    ],
  },

  {
    status: "published",
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
    slug: "apple-ecosystem-2026-rosetta-stone-egypt",
    title: "Apple's Whole Chip Transition Strategy Is Named After a Rock Found in an Egyptian Ditch in 1799",
    category: "Culture & Trends",
    tags: ["Apple", "Rosetta Stone", "Apple Silicon", "Egyptology", "Technology History"],
    author: editorialTeam,
    excerpt:
      "Apple's 2026 lineup — its most ambitious product year in over a decade — still runs on core software named after the Rosetta Stone, discovered by accident near the Egyptian town of Rosetta in 1799.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1780838106313-eb04f08a38db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "Apple ecosystem 2026",
    secondaryKeywords: ["Apple Rosetta software", "Rosetta Stone history", "Apple Silicon transition", "Apple 2026 products"],
    seoTitle: "Apple's 2026 Ecosystem, and Why Its Chip Software Is Named After Egypt",
    seoDescription:
      "Apple's 2026 roadmap includes a foldable iPhone and AI glasses, but its most consequential infrastructure software is still named Rosetta — after the stone discovered near Rosetta, Egypt in 1799.",
    body: [
      p(
        "Apple is heading into what's widely described as its most ambitious product year in over a decade: more than 15 new devices across the iPhone, iPad, Apple Watch, Mac, and smart home lineup, its first foldable iPhone, and a planned preview of AI-powered glasses by late 2026 — all arriving as the company approaches its 50th anniversary and faces mounting pressure to show real results from years of AI promises."
      ),
      h2("What Apple Is Actually Building Toward in 2026"),
      ...bullets([
        "A foldable iPhone and notable Pro-series upgrades headline the 2026 lineup, alongside AI-powered glasses without a display, relying on built-in speakers and cameras",
        "Apple's AI strategy leans on-device: Neural Engines and NPUs across its A-series and M-series chips are optimized for low-latency, energy-efficient inference, emphasizing privacy over chasing the largest possible model",
        "Rather than competing directly with OpenAI and Google on raw model capability, Apple is reportedly integrating Google's Gemini models into Siri, leaning on its own strength in operating systems and platform integration instead",
      ]),
      callout(
        "Apple's 2026 AI bet isn't \"build the single smartest model\" — it's \"make AI run privately and instantly on hardware you already own,\" leaning on two decades of chip and OS integration rather than chasing a leaderboard it's chosen not to compete on directly.",
        { title: "A Deliberately Different AI Bet", tone: "Info" }
      ),
      h2("The Rosetta Stone, and Why Apple Named Software After It"),
      p(
        "In July 1799, French soldiers during Napoleon's Egyptian campaign discovered a large granite stele near the town of Rosetta (Rashid) in the Nile Delta. The stone carried a single decree inscribed in three scripts — hieroglyphic, Demotic, and Ancient Greek — and because scholars could already read the Greek, it became the key that finally let them decode hieroglyphic writing, which had been unreadable for well over a thousand years. Jean-François Champollion completed the decipherment in 1822, using the Rosetta Stone as his primary reference."
      ),
      p(
        "Apple's Rosetta (2005) and Rosetta 2 (2020) are named directly after it, and the naming genuinely fits the function: both pieces of software silently translate code written for one processor architecture into instructions a completely different, incompatible one can run — Rosetta for the PowerPC-to-Intel transition, Rosetta 2 for the Intel-to-Apple Silicon transition — the identical translation function the actual Rosetta Stone performed for two incompatible writing systems separated by disuse rather than by processor design."
      ),
      h2("A Small Detail That Says Something Bigger"),
      p(
        "It's a minor detail, but a real one: two of the most consequential infrastructure decisions in Apple's last twenty years — full processor-architecture transitions that could each have broken the entire existing software ecosystem if handled badly — were deliberately named after antiquity's most famous translation tool, discovered by accident in an Egyptian ditch. Heading into 2026's most ambitious product year in over a decade, Apple's own naming convention is a quiet reminder that even the newest technology stack tends to reach for the oldest available metaphor when it actually needs one that works."
      ),
      faq(
        [
          {
            question: "Why is Apple's Rosetta software named after the Rosetta Stone?",
            answer:
              "Because it performs the same core function — translation between two otherwise incompatible systems. The real Rosetta Stone let scholars translate hieroglyphic writing via its parallel Greek text; Apple's Rosetta and Rosetta 2 translate software code written for one processor architecture (PowerPC, then Intel) to run on a different one (Intel, then Apple Silicon).",
          },
          {
            question: "Where was the Rosetta Stone discovered?",
            answer:
              "Near the town of Rosetta (Rashid) in Egypt's Nile Delta, found by French soldiers during Napoleon's Egyptian campaign in July 1799. It is now held in the British Museum in London.",
          },
          {
            question: "What is Apple planning for 2026?",
            answer:
              "Apple's 2026 lineup is expected to include over 15 new devices, its first foldable iPhone, notable Pro-series upgrades, and a planned preview of AI-powered glasses by late 2026, alongside a shift toward on-device AI processing and reported integration of Google's Gemini models into Siri.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The Rosetta Stone itself sits in the British Museum, not Egypt — but the ditch it was found in, and the delta town that gave it its name, are still there. It's a strange kind of legacy for a piece of granite: quietly naming some of the most important software decisions a trillion-dollar company has ever made, two centuries after a soldier tripped over it."
      ),
    ],
  },

  {
    status: "published",
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
