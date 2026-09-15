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
    slug: "how-abu-simbel-was-moved",
    title: "How Abu Simbel Was Cut Into Pieces and Moved Up a Cliff",
    category: "History & Culture",
    tags: ["Abu Simbel", "Ramesses II", "Aswan High Dam", "UNESCO", "Nubia"],
    author: editorialTeam,
    excerpt:
      "The temples you stand in front of at Abu Simbel are not where Ramesses II put them. Between 1964 and 1968 the entire site was sawn into blocks, lifted 65 metres up the cliff, and rebuilt inside a hollow artificial mountain — to save it from the lake now behind you.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1539768942893-daf53e448371?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "how Abu Simbel was moved",
    secondaryKeywords: [
      "Abu Simbel relocation",
      "Abu Simbel UNESCO campaign",
      "Aswan High Dam temples",
      "Abu Simbel sun alignment",
    ],
    relatedTours: toursBySlug("aswan-abu-simbel-tour", "lake-nasser-cruise-aswan-abu-simbel"),
    seoTitle: "How Abu Simbel Was Moved to Save It From the Nile",
    seoDescription:
      "Between 1964 and 1968 both Abu Simbel temples were cut into numbered blocks and rebuilt 65 metres higher, inside a hollow concrete mountain, ahead of the rising Lake Nasser. How it was done, and what changed.",
    body: [
      p(
        "Almost everyone who visits Abu Simbel is told, at some point during the walk up from the coach park, that the temples were moved. It tends to land as a piece of trivia. It is worth slowing down on, because the thing you are about to walk into is a full-size reconstruction — every block cut, lifted, carried and set back down by hand within living memory, and put together so precisely that you cannot see the joins without being shown where to look."
      ),
      h2("Why the Temples Had to Move"),
      p(
        "Egypt began building the Aswan High Dam in 1960. The dam did what it was designed to do — control the Nile flood, generate power, and store water through low years — and in doing so created Lake Nasser, one of the largest reservoirs on earth. The Nubian valley behind the dam would fill. Abu Simbel, cut into a sandstone cliff on the west bank by Ramesses II in the 13th century BC, sat squarely inside the future lake bed."
      ),
      p(
        "UNESCO launched an international appeal in 1960 to rescue the monuments of Nubia. Around fifty countries contributed. Abu Simbel was the largest and most difficult piece of that campaign, and the one everybody remembers."
      ),
      h2("How the Move Was Actually Done"),
      ...bullets([
        "Between 1964 and 1968, both the Great Temple of Ramesses II and the smaller temple of his queen Nefertari were sawn apart into large blocks, each numbered and recorded before it was lifted",
        "The blocks weighed on the order of twenty to thirty tonnes each, and there were over a thousand of them across the two temples",
        "A coffer dam held the rising water back from the working face while the cutting went on",
        "Everything was carried to new ground 65 metres higher and around 200 metres back from the original cliff face",
        "The cliff itself does not exist at the new site. Both temples now stand inside artificial domed mountains of concrete, built to carry the weight and shaped to look like the hillside that was left behind",
      ]),
      callout(
        "The saw cuts are still there. Guides will point them out on the facade — faint seams running through the figures of Ramesses. Once you have seen one you start seeing them everywhere, which is the moment the scale of what was done tends to land properly.",
        { title: "Look for the Seams", tone: "Info" }
      ),
      h2("The One Thing That Could Not Be Moved Perfectly"),
      p(
        "The Great Temple was aligned so that on two mornings a year the rising sun reaches down the full length of the axis and lights the seated gods in the sanctuary at the back — with Ptah, a god of the underworld, left in shadow. Getting a rebuilt temple to keep an alignment like that, on new ground and a new orientation, was the hardest part of the engineering brief, and it was very nearly achieved: the illumination still happens twice a year, in February and October, but a day later in each case than it did before the move."
      ),
      p(
        "It is a small discrepancy and, if anything, it makes the achievement more impressive rather than less. The dates still draw crowds; if you want to be there for one of them, plan a long way ahead, because everyone else has the same idea."
      ),
      h2("What to Know Before You Go"),
      ...bullets([
        "Abu Simbel is about 280km south-west of Aswan, near the Sudanese border — most visitors come by road from Aswan, by short flight, or on a Lake Nasser cruise",
        "The road journey is long and usually starts very early, which is worth knowing if you are travelling with children or anyone who struggles with heat",
        "There are two temples, not one. The smaller temple of Nefertari is often rushed and rewards the extra twenty minutes",
        "Photography rules inside the temples change from time to time — check on the day rather than relying on an older account",
      ]),
      faq(
        [
          {
            question: "Why was Abu Simbel moved?",
            answer:
              "The Aswan High Dam, begun in 1960, created Lake Nasser, and the reservoir would have submerged the temples where they stood. A UNESCO campaign backed by around fifty countries funded and organised the rescue.",
          },
          {
            question: "When was Abu Simbel relocated?",
            answer:
              "The work ran from 1964 to 1968. Both temples were cut into numbered blocks, moved 65 metres higher and roughly 200 metres back, and rebuilt inside artificial mountains.",
          },
          {
            question: "Is Abu Simbel still aligned with the sun?",
            answer:
              "Yes. Sunlight still reaches the sanctuary twice a year, in February and October, though each event now falls a day later than it did before the temples were moved.",
          },
          {
            question: "Can you see where the temples were cut?",
            answer:
              "Yes — fine seams are visible across the facade and interior once you know to look for them. Guides normally point out the clearest ones on the colossi at the entrance.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Ramesses II built Abu Simbel to be permanent, into a cliff, facing the sunrise. Three thousand years later it was taken apart and put back together further up the hill so it could go on being permanent. Standing in front of it, both facts are true at once."
      ),
      cta({
        title: "See Abu Simbel for Yourself",
        body: "Private trips from Aswan by road or air, and Lake Nasser cruises that arrive at the temples from the water.",
        buttonLabel: "See Abu Simbel tours",
        buttonHref: "/tours/aswan-abu-simbel-tour",
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
