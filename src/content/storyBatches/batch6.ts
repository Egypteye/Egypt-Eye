import type { Story } from "../types";
import { authors } from "../authors";
import { tours } from "../tours";
import { p, h2, bullets, callout, faq, cta } from "../storyBlocks";

const editorialTeam = authors[0];

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

// World-trends cohort, batch 1 of 10: AI agents, AI-generated video, the AI
// jobs question, AI safety/regulation, and the US-China AI race. Facts tied
// to 2026 developments (Salesforce Agentforce numbers, the Sora API
// sunset, the EU AI Act's August 2026 provisions, DeepSeek V4, etc.) were
// verified via web search at the time of writing — see contentReviewDate
// on each story, which flags when those specific facts should be re-checked
// rather than trusted indefinitely.

export const stories: Story[] = [
  {
    status: "archived",
    featured: false,
    slug: "what-are-ai-agents-2026",
    title: "What Are AI Agents, Really? A Plain-English Guide",
    category: "Tech & AI",
    tags: ["AI Agents", "Agentic AI", "Automation", "Technology"],
    author: editorialTeam,
    excerpt:
      "Every company now claims to run \"AI agents.\" Here's what that actually means, what these systems are genuinely good at in 2026, and a useful stress test: could one plan a trip to Egypt?",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1708807472445-d33589e6b090?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-01T09:00:00+02:00",
    contentReviewDate: "2027-03-01",
    primaryKeyword: "what are AI agents",
    secondaryKeywords: ["agentic AI", "AI agents explained", "autonomous AI 2026", "AI agent examples"],
    seoTitle: "What Are AI Agents, Really? A 2026 Explainer",
    seoDescription:
      "Agentic AI has quietly gone from demo to default in a year. Here's what AI agents actually do, real 2026 examples, and where they still fall apart.",
    body: [
      p(
        "Somewhere in the last eighteen months, \"AI agent\" replaced \"AI-powered\" as the phrase every product page reaches for. It's used loosely enough now that it's worth being precise about what it actually means, because underneath the marketing there's a real, specific shift — and a real, specific set of things these systems still can't do."
      ),
      p(
        "A chatbot answers what you ask it. A copilot sits next to you and suggests the next line of code, or drafts a paragraph you'll edit. An agent is neither of those. It's given a goal — reconcile this month's invoices, screen these hundred resumes, resolve this customer's refund — and it plans the steps, calls the tools it needs, checks its own work, and adapts when something doesn't go as expected, largely without a human approving each individual step along the way. That last part is the whole distinction. Chatbots and copilots wait for you. Agents act, and report back."
      ),
      h2("This Stopped Being Theoretical in 2026"),
      p(
        "The clearest evidence isn't a research paper, it's a balance sheet. Salesforce's Agentforce platform — a pure-play bet on exactly this category — was reporting roughly $540 million in annual recurring revenue and more than 18,500 enterprise customers by early 2026, a genuinely fast climb for a product line that barely existed two years earlier. Gartner's own forecast for the year put it plainly: task-specific agents embedded in enterprise software were expected to jump from under 5% of applications to around 40%. That's not a niche experiment scaling up slowly. That's infrastructure."
      ),
      p(
        "Where it's actually landed, in practice, tends to be narrower and less dramatic than the demos suggest: an agent that resolves a routine support ticket end-to-end instead of routing it to a human, one that matches an invoice against a purchase order and flags the mismatch, one that screens an initial batch of resumes against a job spec, one that reallocates a delivery route when a shipment runs late. Useful, real, and — this is the part that gets left out of the pitch decks — still wrong often enough that more than 40% of agentic AI projects reportedly get cancelled or shelved before they ever reach production, usually once someone tries to plug the tidy demo into an actual company's messy systems and permissions."
      ),
      h2("The Stress Test: Could an Agent Plan a Trip to Egypt?"),
      p(
        "It's a genuinely useful way to feel out where this technology actually stands, because trip planning looks, on paper, like exactly the kind of multi-step task agents are built for: check flight windows, cross-reference site opening hours, sequence a route that doesn't backtrack across the country, book accommodation, adjust if something falls through. Hand that brief to a capable AI agent today and it will, in fact, produce something — a plausible-looking, evenly-paced itinerary with the right names in the right order."
      ),
      p(
        "What it won't know, because no public dataset teaches it, is that the road between Aswan and Abu Simbel used to require a police-escorted convoy at a fixed early-morning departure time, and that the rule changes without much notice. It won't know that a Nile cruise boat's cabin allocation on day one quietly decides how good your view is for the rest of the week, or that the \"best\" hot air balloon slot in Luxor is a function of that specific week's wind pattern, not a fixed daily schedule. It won't know which temple gets unbearable by 10am in July and needs to be first on the list, not third. It has no way to know that a supplier it's confidently booking you into has been unreliable for the last two months, because that's not written down anywhere an agent can read it — it lives in a phone call a human operator had last Tuesday."
      ),
      p(
        "None of that is a knock on the technology. It's just a precise description of the gap between pattern-matching across public information and the accumulated, current, on-the-ground judgment that comes from actually running trips through a specific country, this month, not last year's training data. An agent can assemble an itinerary. It can't yet tell you the one that's assembled is about to go wrong."
      ),
      callout(
        "The reliability gap shows up in the failure data too: reports through 2026 put agentic project cancellation rates above 40% once companies try to move past a controlled pilot — not because the models are bad, but because real-world systems, permissions, and edge cases are messier than a demo environment.",
        { title: "Why So Many Agent Projects Stall", tone: "Info" }
      ),
      h2("What Agents Are Actually Good At Right Now"),
      ...bullets([
        "Narrow, well-defined, repeatable tasks with a clear success condition — matching an invoice, screening a document against a checklist, drafting a first-pass reply",
        "Work where a wrong answer is cheap to catch and fix, not one where a mistake ships straight to a customer",
        "Domains with enormous amounts of clean, structured training data behind them — code, spreadsheets, standard business documents",
        "Freeing up the humans who used to do the repetitive 80% of a job, so they can spend more time on the judgment-heavy 20%",
      ]),
      p(
        "That last point is probably the most honest way to describe where things stand. The realistic version of \"AI agent\" in 2026 isn't a replacement for the person who used to do the whole job — it's a very fast, very tireless assistant that still needs someone experienced checking its work, especially anywhere the cost of being wrong is a ruined trip, a bad diagnosis, or a wrong invoice paid. We'll happily use an agent to draft a first-pass reply to a routine question. We would never let one confirm a Nile cruise cabin, adjust an itinerary around a closed site, or make the judgment call our reservations team makes on WhatsApp most days."
      ),
      faq(
        [
          {
            question: "What's the difference between an AI agent and a chatbot?",
            answer:
              "A chatbot answers what you ask it, one exchange at a time. An AI agent is given a goal and works through multiple steps toward it on its own — planning, using tools, checking its own output — before reporting back, generally without a human approving each individual step.",
          },
          {
            question: "Are AI agents actually being used by real companies in 2026?",
            answer:
              "Yes, widely, though usually for narrow, well-defined tasks rather than entire jobs. Salesforce's Agentforce alone reported around $540 million in annual recurring revenue and over 18,500 enterprise customers by early 2026, and Gartner projected roughly 40% of enterprise applications would include task-specific agents by year's end.",
          },
          {
            question: "Can an AI agent plan a full trip itinerary?",
            answer:
              "It can produce a plausible-looking one from public information. What it typically can't do is account for the current, on-the-ground realities that change week to week — convoy schedules, supplier reliability, seasonal timing at a specific site — the kind of knowledge that lives with a human team actually running trips right now.",
          },
          {
            question: "Why do so many AI agent projects get cancelled?",
            answer:
              "Multiple 2026 industry reports put agentic project cancellation rates above 40% once a company moves from a controlled pilot into real production systems — not usually because the underlying model is weak, but because real permissions, data, and edge cases are messier than a demo environment.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The honest read on agentic AI in 2026 is that it's real, it's already inside a huge share of enterprise software, and it's still fundamentally a tool for the parts of a job that follow a pattern. The parts that don't — the judgment calls, the current knowledge, the accumulated trust of doing something well for years — are exactly the parts a good human team is still built around."
      ),
      cta({
        title: "Plan It With People Who Actually Know",
        body: "Not an algorithm's best guess from public data — a team that's run this exact route this month, and adjusts when something changes.",
        buttonLabel: "Start Planning Your Trip",
        buttonHref: "/customize",
      }),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "ai-generated-video-2026-guide",
    title: "AI Video Got Frighteningly Good in 2026 — Here's What Changed",
    category: "Tech & AI",
    tags: ["AI Video", "Sora", "Veo", "Runway", "Technology", "Photography"],
    author: editorialTeam,
    excerpt:
      "Sora, Veo, Kling and Runway can now generate footage that passes for stock video at a glance. Here's what actually changed in 2026 — and why Egypt is one of the easiest places on Earth to fake.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1768732774706-c83796d38ef1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-01T09:00:00+02:00",
    contentReviewDate: "2027-02-01",
    primaryKeyword: "AI generated video 2026",
    secondaryKeywords: ["Sora vs Veo vs Kling", "AI video generator comparison", "AI travel video", "is this video AI generated"],
    relatedStories: [],
    seoTitle: "AI Video in 2026: What Actually Changed",
    seoDescription:
      "Sora, Veo 3, Kling and Runway compared for 2026 — and why iconic, overphotographed places like Egypt are the easiest subjects for AI video to fake convincingly.",
    body: [
      p(
        "For a couple of years, AI-generated video was easy to spot: a hand with the wrong number of fingers, a face that swam slightly out of shape, a shot that held together for three seconds before something in the background started to warp. In 2026, on the current generation of tools, that tell mostly disappeared. A default clip from a leading model can now look closer to licensed stock footage than to the uncanny-valley demos that made the rounds a year or two earlier — and that shift has real consequences well beyond the film industry it's usually discussed in."
      ),
      h2("Four Tools, No Single Winner"),
      p(
        "What's notable about where things landed in 2026 isn't that one model pulled ahead of the others — it's that they didn't. Veo 3.1 is generally considered the strongest all-around performer, with fabric movement, hair physics, and natural-scene lighting that reads as closer to real camera footage than anything else on the market, and it ships with native, synced audio rather than requiring a separate pass. Sora 2 holds its own lead in physical simulation — objects colliding, weight, momentum — the kind of thing that's easy to get subtly wrong and immediately looks fake when you do. Kling has become the value option, offering comparable output at a meaningfully lower cost. Runway, through its Gen-4 model, has focused less on chasing the most photoreal single shot and more on making AI video actually editable — a real timeline, real control over a generated clip after the fact — which matters enormously once you're trying to cut something together rather than just marvel at one output."
      ),
      p(
        "The practical result, reported widely by production teams working with these tools day to day, is that almost nobody is using just one model anymore. A common 2026 workflow pairs a fast, economical model for bulk background and continuity shots with a slower, higher-fidelity one reserved for the handful of hero shots that actually need to hold up to scrutiny — treating AI video generation less like a single magic button and more like a crew with different specialists for different jobs."
      ),
      callout(
        "OpenAI announced in 2026 that the standalone Sora web app and API would be discontinued later in the year, with the API sunset set for September 24. Even the tool that kicked off this wave of attention in 2024 wasn't a fixed destination — it's still a fast-moving, actively-being-rebuilt category, month to month.",
        { title: "Nothing Here Is Standing Still", tone: "Info" }
      ),
      h2("Why Egypt Is Unusually Easy to Fake"),
      p(
        "Here's the part that matters specifically for a place like this. These models learn from an enormous volume of existing footage and photography, and almost nothing on Earth has been photographed, filmed, painted, and referenced more relentlessly, for longer, than the pyramids at Giza, a felucca on the Nile at sunset, or a figure in flowing fabric against a desert dune. That's not a coincidence of geography — it's a direct consequence of how these systems are trained. The more a subject has been shot before, from every conceivable angle, in every lighting condition, the better an AI model gets at generating a convincing new version of it that was never actually filmed at all."
      ),
      p(
        "Put plainly: if you wanted to pick the single easiest travel subject on the planet for an AI video model to fake convincingly, ancient Egyptian monuments and Nile scenery would be near the top of the list. A generated \"drone flyover of the pyramids at golden hour\" or a fabricated \"flying dress spinning across the dunes\" is now trivially achievable, and to a casual scroll, indistinguishable from something a photographer actually stood in the desert and shot."
      ),
      h2("What That Actually Changes for Real Travel Content"),
      p(
        "It doesn't make real photography less impressive. If anything, it raises the value of proof — a shot with a specific person in it, on a specific date, with the specific light and dust and heat of that particular afternoon, is now worth more precisely because a convincing fake of the generic version costs nothing to produce. The flying-dress shoots we run in the dunes outside Giza and Fayoum, or a private morning at the pyramids before the site opens to the public, aren't valuable because the visual is rare anymore — AI made the generic visual free. They're valuable because they're real, verifiably yours, taken by a photographer who was actually there with you, on the day you were actually in Egypt."
      ),
      p(
        "That's the practical dividing line worth remembering as this technology keeps improving: a generated image of Egypt is now easy. A photograph of you in Egypt still isn't something any model can produce."
      ),
      faq(
        [
          {
            question: "What's the best AI video generator in 2026?",
            answer:
              "There's no single winner. Veo 3.1 leads on overall realism and natural motion with native audio, Sora 2 leads on physical simulation, Kling offers the strongest value for the quality, and Runway's Gen-4 leads on actual editability once a clip needs to be cut into something longer.",
          },
          {
            question: "Is the original Sora still available?",
            answer:
              "OpenAI announced the standalone Sora web app and API would be discontinued later in 2026, with the API access ending September 24, 2026 — a reminder that this category is still being actively rebuilt, not settled.",
          },
          {
            question: "Why is it easy for AI to generate convincing footage of the pyramids?",
            answer:
              "AI video models learn from the volume of existing footage of a subject. Few places on Earth have been photographed and filmed as extensively, from as many angles, as Giza and the Nile — which is exactly the kind of dataset that makes a subject easy for a model to convincingly recreate.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The tools got good fast, and they're not finished changing. What hasn't changed, and what a generated clip still can't manufacture, is having actually been somewhere — which is either the most old-fashioned thing you can say about travel in 2026, or the only thing left that still means something."
      ),
      cta({
        title: "Get the Real Shot",
        body: "A flying dress in the dunes, a private sunrise at the pyramids — shot by a real photographer, on your real trip.",
        buttonLabel: "See the Photoshoots",
        buttonHref: "/photoshoots",
      }),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "ai-jobs-what-ai-can-and-cant-replace",
    title: "The Jobs AI Is Actually Replacing (And the Ones It Isn't Close To)",
    category: "Tech & AI",
    tags: ["AI and Jobs", "Future of Work", "Automation", "Careers"],
    author: editorialTeam,
    excerpt:
      "The data on AI and employment in 2026 is messier than either \"robots are taking every job\" or \"nothing's really changing\" — and travel is a genuinely useful case study in where the line actually falls.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1713946598521-3a196fed3643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-02T09:00:00+02:00",
    contentReviewDate: "2027-03-01",
    primaryKeyword: "AI replacing jobs 2026",
    secondaryKeywords: ["which jobs will AI replace", "AI and employment", "AI job displacement data", "jobs safe from AI"],
    relatedStories: [],
    seoTitle: "Which Jobs Is AI Actually Replacing in 2026?",
    seoDescription:
      "2026's real employment data on AI: which roles are genuinely at risk, which are proving stubbornly hard to automate, and what travel — a very human industry — reveals about the line between them.",
    body: [
      p(
        "The headlines on AI and jobs in 2026 tend to split into two camps that don't talk to each other much: one insisting mass displacement is already well underway, the other pointing out that unemployment hasn't spiked the way a true mass-automation event would predict. Both are working from real data. The more useful question isn't which side is right — it's which specific kinds of work are actually changing, and which aren't, because the answer is a lot more specific than either headline suggests."
      ),
      h2("What the 2026 Numbers Actually Show"),
      p(
        "One consistent, striking data point: in March 2026, AI was cited as the single most common reason for U.S. layoffs for the first time on record, accounting for roughly a quarter of that month's job cuts, according to tracking from workforce data firms that monitor layoff announcements. That's a real, measurable shift — not a projection, an actual recorded month."
      ),
      p(
        "But the more revealing pattern sits underneath the headline number: AI appears to be suppressing new hiring, especially at the entry level, considerably more than it's eliminating existing, experienced positions. Roles built around structured, repetitive, well-documented tasks — data entry, first-pass document review, initial resume screening — are the ones actually shrinking. Analysts tracking HR functions specifically expect the large majority of recruitment screening and benefits administration work to be automated between 2025 and 2027. Separately, in occupational risk analyses that rank jobs by how exposed their core tasks are to current AI capability, translators and interpreters consistently land at or near the very top of the list — their work is text-in, text-out, high-volume, and exactly the shape of task large language models were built to handle."
      ),
      callout(
        "The World Economic Forum's own 2026 modeling, often cited only for its displacement figure, actually projects a net gain: roughly 92 million roles displaced by 2030, against about 170 million newly created — a net increase of nearly 80 million jobs globally, even as the mix of what those jobs look like shifts substantially.",
        { title: "The Number Usually Left Out of the Headline", tone: "Info" }
      ),
      h2("Where Travel Sits in All This"),
      p(
        "Travel is a genuinely useful test case, because it contains both kinds of work in the same industry, sometimes at the same company. A significant slice of it really is repeatable and pattern-based: answering the same handful of questions, checking availability against a calendar, confirming a booking. That's exactly the work AI already handles reasonably well, and a lot of the industry has quietly automated it over the last few years without much fanfare."
      ),
      p(
        "Then there's the other half — the half that doesn't compress into a pattern no matter how much data you feed a model. A guide deciding, in real time, that the group needs another twenty minutes at a tomb because of how the light is falling. A driver who knows which back route avoids a demonstration that started an hour ago and isn't on any map yet. A reservations team reading a slightly anxious WhatsApp message at midnight and understanding, correctly, that the traveler needs reassurance more than information. None of that is written down anywhere a model could learn it from, because it's generated fresh, in the moment, by someone who's actually there."
      ),
      ...bullets([
        "AI-exposed: standardized customer service scripts, routine document translation, first-pass itinerary drafts, availability checks",
        "Stubbornly hard to automate: reading a group's mood and adjusting a day's pace accordingly, judgment calls under changing conditions (weather, closures, delays), building the kind of trust a traveler needs to hand over their whole trip to a stranger",
      ]),
      h2("The Honest Version of \"AI-Proof\""),
      p(
        "Nothing is permanently immune to a technology that's still improving quickly — that's a bad promise to make about any job in 2026. But there's a meaningful, durable difference between work that's fundamentally about processing information and work that's fundamentally about being present, accountable, and adaptive in a specific place, in real time, for a specific person. The first kind keeps getting automated, gradually and unevenly. The second kind is exactly what people are still paying for when they book a private tour instead of assembling one from search results themselves — a real person who picks up the phone, or the WhatsApp thread, and actually answers."
      ),
      faq(
        [
          {
            question: "Is AI actually eliminating jobs in 2026, or just changing them?",
            answer:
              "Both, but unevenly. AI became the most-cited reason for U.S. layoffs for the first time in March 2026, yet the clearer pattern is that it's suppressing new hiring — especially entry-level roles — more than it's eliminating experienced positions outright.",
          },
          {
            question: "Which jobs are most at risk from AI?",
            answer:
              "Occupational risk analyses consistently place translators and interpreters at or near the top — their work is high-volume, text-based, and closely matches what large language models were trained to do. Standardized customer service and document-screening roles follow closely behind.",
          },
          {
            question: "Will AI create more jobs than it destroys?",
            answer:
              "The World Economic Forum's 2026 modeling projects a net gain — roughly 92 million roles displaced globally by 2030 against about 170 million newly created, a net increase of close to 80 million — even though the shift will be uneven across industries and skill levels.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The pattern holds up outside travel too, once you look past the headline number: AI is genuinely good at replacing the parts of a job that were always, honestly, a bit mechanical. It's nowhere close to replacing the parts that required someone to actually show up."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "ai-safety-abu-simbel-lesson-in-moving-fast",
    title: "AI Safety Is a New Debate. Egypt Already Lived a Version of It.",
    category: "Tech & AI",
    tags: ["AI Safety", "AI Regulation", "History", "Aswan High Dam", "Abu Simbel"],
    author: editorialTeam,
    excerpt:
      "The EU AI Act is now largely in force. The debate over who governs a powerful new technology, and who pays when it moves faster than the safeguards, isn't new — Egypt built and rescued a monument through exactly that story once already.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1633163893862-4cdc62de7d82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-03T09:00:00+02:00",
    contentReviewDate: "2027-02-01",
    primaryKeyword: "AI safety 2026",
    secondaryKeywords: ["EU AI Act", "AI regulation explained", "Abu Simbel relocation history", "Aswan High Dam history"],
    relatedTours: toursBySlug("aswan-abu-simbel-tour", "lake-nasser-cruise-aswan-abu-simbel", "aswan-nubian-village-philae-tour"),
    relatedStories: [],
    seoTitle: "AI Safety, and Egypt's Own Lesson in Moving Fast",
    seoDescription:
      "The EU AI Act took effect through 2026 as the world argues over who governs powerful new technology. Egypt already lived a version of that argument — at Abu Simbel.",
    body: [
      p(
        "Most of what's discussed under \"AI safety\" is really one underlying argument: a technology is developing capabilities faster than the rules meant to govern it, and everyone involved — the companies building it, the governments trying to regulate it, and the public living with the results — is negotiating who gets to decide what \"responsible\" actually means, and who pays the cost if it turns out they were wrong."
      ),
      h2("Where the Regulation Actually Stands in 2026"),
      p(
        "The European Union has, for now, gone furthest. The EU AI Act, first passed in 2024, has rolled out in stages, and most of its remaining major provisions took effect on August 2, 2026. It works on a tiered-risk model: certain uses are banned outright (social scoring systems, for instance), \"limited-risk\" applications like chatbots and deepfakes carry transparency requirements, and \"high-risk\" systems — anything touching biometrics, employment decisions, critical infrastructure, or law enforcement — face real obligations: mandatory risk assessments, human oversight, formal conformity checks, and incident reporting when something goes wrong."
      ),
      p(
        "The United States has taken a visibly different path. In March 2026, the White House put forward a national framework recommending that Congress preempt the growing patchwork of individual state AI laws with a single, lighter-touch federal standard — but that preemption effort has repeatedly stalled in Congress, and courts, not the executive branch alone, will ultimately decide how far it can reach. The practical result, for now: a single AI system operating globally can be simultaneously bound by the EU's strict tiered rules, a patchwork of individual U.S. state laws, and an evolving federal framework that hasn't settled yet — genuinely difficult terrain for anyone trying to build responsibly, and genuinely difficult to audit for anyone trying to hold them to it."
      ),
      h2("A Different Kind of Powerful Technology, Moved Fast, Once Before"),
      p(
        "Here's where Egypt's own history offers something more useful than the usual \"ancient wisdom meets modern technology\" framing this topic tends to get. In the 1950s and 60s, Egypt undertook one of the most consequential engineering projects of the twentieth century: the Aswan High Dam, a piece of infrastructure that would control the Nile's annual flood for the first time in human history, generate enormous amounts of electricity, and reshape the country's agricultural capacity for generations. It was, by any measure, transformative technology, built with real urgency, and there was no meaningful global framework in place to weigh its full costs before construction moved forward."
      ),
      p(
        "One of those costs was concrete and human: the dam's reservoir, Lake Nasser, would submerge a stretch of ancient Nubia, including two colossal rock-cut temples at Abu Simbel that Ramesses II had built roughly 3,300 years earlier — and would displace tens of thousands of Nubian people from land their communities had lived on for generations, a resettlement whose full social cost took decades to even begin to reckon with honestly."
      ),
      callout(
        "Between 1964 and 1968, in one of the largest engineering rescues UNESCO has ever coordinated, Abu Simbel's temples were cut into more than a thousand numbered blocks and reassembled sixty metres higher and two hundred metres back from the original site — inside an artificial mountain built specifically to preserve the alignment that lets sunlight reach the inner sanctuary on two mornings each year, just as it did in antiquity.",
        { title: "The Rescue, in Brief", tone: "Highlight" }
      ),
      p(
        "The relocation of the temples is the part of this story that gets told, because it's an extraordinary, genuinely uplifting feat of engineering and international cooperation — solving, after the fact, a problem the original project hadn't solved in advance. What gets told far less often is the other half: the Nubian resettlement was handled with nowhere near the same care, funding, or urgency as the monuments were, and communities who'd lived along that stretch of the Nile for centuries lost their villages with comparatively little of the same global attention or resourcing."
      ),
      h2("Why This Is the Sharper Parallel"),
      p(
        "That's the honest shape of the AI safety debate too, stripped of the science-fiction framing it usually gets dressed in. It was never really a question of whether a powerful new technology should exist — the dam got built, and modern AI models are, similarly, not going to be un-invented. The actual question, then and now, is whether the safeguards, the oversight, and the care for who bears the cost get built at the same speed as the capability itself, or whether they show up years later, as expensive, difficult repair work — like a UNESCO rescue mission cutting a temple into a thousand blocks after the water was already rising, rather than before."
      ),
      p(
        "The EU AI Act, for all its bureaucratic weight, is essentially an attempt to build the equivalent of that safeguard in advance rather than after the fact. Whether it — or whatever eventually emerges from the U.S.'s more fragmented approach — actually manages that in time is the real, unresolved question underneath every AI safety headline in 2026."
      ),
      faq(
        [
          {
            question: "What does the EU AI Act actually require in 2026?",
            answer:
              "Most of its major provisions took effect August 2, 2026. It bans certain \"unacceptable-risk\" uses like social scoring, requires transparency for limited-risk systems such as chatbots and deepfakes, and imposes strict obligations — risk assessments, human oversight, incident reporting — on high-risk systems used in biometrics, employment, critical infrastructure, and law enforcement.",
          },
          {
            question: "Does the US have a federal AI safety law?",
            answer:
              "Not yet, as of 2026. The White House proposed a framework in March 2026 recommending federal preemption of state AI laws, but Congress has repeatedly stalled on legislating it, and courts will ultimately decide how far executive action alone can reach.",
          },
          {
            question: "Why were the Abu Simbel temples moved?",
            answer:
              "The Aswan High Dam's reservoir, Lake Nasser, would have submerged the site. Between 1964 and 1968, UNESCO coordinated cutting both temples into over a thousand blocks and reassembling them 60 metres higher, on an artificial mountain built to preserve their original solar alignment.",
          },
          {
            question: "Can you actually visit Abu Simbel today?",
            answer:
              "Yes — it's a full-day excursion from Aswan, either by road convoy or increasingly by boat via Lake Nasser, and remains one of the most visually overwhelming sites in Egypt precisely because of the scale of the rescue that kept it intact.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Standing in front of Abu Simbel today, what's actually striking isn't just the scale of Ramesses II's original ambition — it's the visible seams in the stone where the 1960s rescue cut and rebuilt it, a physical record of a civilization moving fast on a powerful technology and, imperfectly, scrambling afterward to account for what it had put at risk. It's a genuinely useful thing to stand in front of, while this generation runs the same argument again."
      ),
      cta({
        title: "See the Rescue for Yourself",
        body: "The seams are still visible up close — a full-day excursion from Aswan to one of the most extraordinary engineering stories in Egypt.",
        buttonLabel: "Visit Abu Simbel",
        buttonHref: "/experiences/abu-simbel-excursion-aswan",
      }),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "us-china-ai-race-suez-canal-parallel",
    title: "The US-China AI Race, and What the Suez Canal Teaches About Chokepoints",
    category: "Tech & AI",
    tags: ["AI Geopolitics", "US-China", "DeepSeek", "History", "Suez Canal"],
    author: editorialTeam,
    excerpt:
      "DeepSeek's V4 model narrowed the US-China AI gap to months, not years, in 2026. Egypt has its own, older story about what happens when a chokepoint everyone depends on becomes the thing great powers fight over.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1635851801927-44c4d1c555af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-04T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "US China AI race",
    secondaryKeywords: ["DeepSeek 2026", "AI chip export controls", "Suez Canal history", "Suez Crisis 1956"],
    body: [
      p(
        "In April 2026, a Chinese AI lab called DeepSeek released a model — V4 — that mattered less for what it could do than for how quickly it had caught up to do it. NIST's own AI safety institute estimated, the following month, that DeepSeek's V4 Pro sat roughly eight months behind the American frontier. Eight months is not nothing. It is also not the multi-year lead the U.S. AI industry had been quietly assuming it held."
      ),
      h2("How Fast the Gap Actually Closed"),
      p(
        "The scale of what's shifted is easier to see in usage than in benchmark scores. By mid-2026, Chinese-developed models were reportedly processing around 61% of all tokens routed through OpenRouter, one of the largest neutral model-routing platforms in the industry — meaning the majority of a huge, real-world slice of AI traffic was already running on Chinese models, not American ones. Alibaba's open Qwen model family had passed a billion downloads and formed the technical base for something like 40% of new AI models built by outside developers on Hugging Face, the industry's largest open-model hub. This isn't a story about a lab in a lab. It's a story about actual global infrastructure quietly shifting under everyone's feet."
      ),
      p(
        "What makes it more remarkable is that it happened under active U.S. export restrictions specifically designed to prevent it. DeepSeek is widely reported to have trained V4 partly using smuggled Nvidia Blackwell chips, still formally banned for export to China, and — facing the reality that reliable access to the best foreign chips can't be assumed indefinitely — the company has begun designing its own AI inference chips, releasing a version of its V4-Flash model specifically optimized to run on Huawei's Ascend hardware instead of Nvidia's. Washington's answer, an interim final export rule reportedly expected around fall 2026, has shifted its own target too — aiming to restrict access to advanced models and platforms directly, not just the physical chips underneath them, an acknowledgment that controlling hardware alone hadn't been enough."
      ),
      callout(
        "None of this is settled or final — it's a live, moving negotiation between export controls, workarounds, and counter-workarounds, being renegotiated roughly every few months in 2026. Any specific figure here is a snapshot, not an endpoint.",
        { title: "A Fast-Moving Number, Not a Fixed One", tone: "Info" }
      ),
      h2("Egypt's Own Chokepoint Story"),
      p(
        "Strip away the AI-specific vocabulary and what's actually being fought over is a chokepoint — a single, narrow point of control that an enormous amount of global activity has to pass through, which makes whoever controls it disproportionately powerful relative to its physical size. Advanced AI chips and the models trained on them are the 2026 version of that idea. Egypt has been living at the center of the twentieth century's version of the exact same argument for well over a hundred years."
      ),
      p(
        "The Suez Canal opened in 1869, cut through Egyptian territory by a French-led company, and almost immediately became one of the most strategically valuable pieces of infrastructure on Earth — a single 120-mile channel controlling the shortest sea route between Europe and Asia, saving ships the entire journey around the southern tip of Africa. For nearly a century, control of that channel sat with foreign interests, not with Egypt itself, precisely because whoever held it held real leverage over global trade."
      ),
      p(
        "In 1956, Egyptian President Gamal Abdel Nasser nationalized the canal, reclaiming it as sovereign Egyptian infrastructure — and the reaction wasn't diplomatic protest, it was war. Britain, France, and Israel launched a joint military invasion within months, a crisis serious enough that it reshaped the entire postwar global order and, in the process, made unmistakably clear that the United States, not the old European colonial powers, was now the decisive force in world affairs. All of that, over control of a single waterway."
      ),
      h2("Same Shape, Different Chokepoint"),
      p(
        "That's the useful parallel, and it isn't decorative. A canal and a chip fabrication supply chain look nothing alike on the surface, but they occupy exactly the same strategic position: a narrow point that an enormous share of a much larger system depends on, which makes controlling it worth an outsized amount of political and economic energy — and worth going to genuinely extraordinary lengths to either hold onto or seize. The Suez Crisis was fought with warships. The AI chip race is being fought with export licenses, chip smuggling networks, and a Chinese lab quietly designing its own silicon rather than depend on a supply it can no longer be certain of. The instrument changed. The underlying logic — whoever controls the chokepoint controls the flow — did not."
      ),
      p(
        "It's also, worth noting, not a story with a permanent ending. The canal Britain and France went to war to control in 1956 has been fully, uncontested Egyptian sovereign infrastructure for nearly seventy years now — proof that today's fiercely contested chokepoint doesn't necessarily stay contested forever. Whether the current chip and model race settles the same way, or into something else entirely, is very much still being written."
      ),
      faq(
        [
          {
            question: "How close is China to the US in AI capability in 2026?",
            answer:
              "NIST's AI safety institute estimated in May 2026 that DeepSeek's V4 Pro model sat roughly eight months behind the American frontier — a gap widely described as \"months, not years,\" a significant narrowing from the multi-year lead often assumed just a couple of years earlier.",
          },
          {
            question: "Why is the Suez Canal historically significant?",
            answer:
              "Opened in 1869 and cutting the sea route between Europe and Asia dramatically shorter, the canal became one of the most strategically valuable pieces of infrastructure on Earth. Egypt's 1956 nationalization of it triggered the Suez Crisis, a war involving Britain, France, and Israel that reshaped the postwar global order.",
          },
          {
            question: "What is a geopolitical chokepoint?",
            answer:
              "A narrow point of control — physical or technological — that a disproportionately large system depends on, making whoever holds it strategically powerful relative to its actual size. The Suez Canal for 20th-century shipping and advanced AI chips for 21st-century AI development are two versions of the same underlying idea.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Chokepoints get fought over because they're small enough to seize and important enough to matter — that's been true of a canal in the desert for over a century, and it's true of a chip fabrication process today. Egypt just happens to have the more literal version standing at the crossing of two continents, still doing the job it was built for."
      ),
    ],
  },
];
