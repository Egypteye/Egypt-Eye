import type { Story } from "../types";
import { authors } from "../authors";
import { tours } from "../tours";
import { p, h2, bullets, callout, faq, cta } from "../storyBlocks";

const editorialTeam = authors[0];

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

// World-trends cohort, batch 3 of 10: oil prices, Middle East energy
// security, Red Sea shipping/supply chains, inflation, and the future of
// the US dollar. These lean into genuinely Egypt-native subject matter —
// the Suez Canal, the SUMED pipeline, and Nubian gold — rather than
// needing an invented parallel. Facts (the 2026 Strait of Hormuz crisis,
// oil price forecasts, Red Sea shipping recovery, US CPI, dollar reserve
// share) were verified via web search at the time of writing — see
// contentReviewDate on each story, since these are fast-moving figures.

export const stories: Story[] = [
  {
    status: "published",
    featured: false,
    slug: "oil-prices-2026-suez-two-crises",
    title: "Oil Prices in 2026 Are Being Set by Two Crises at Once — and Egypt Sits Between Them",
    category: "Geopolitics & Economy",
    tags: ["Oil Prices", "Strait of Hormuz", "Suez Canal", "OPEC", "Middle East"],
    author: editorialTeam,
    excerpt:
      "2026's oil price is being pulled by a Strait of Hormuz crisis on one side and a Red Sea shipping crisis on the other — and Egypt's Suez Canal sits at the exact intersection of both.",
    imageTone: "redsea",
    image: "https://images.unsplash.com/photo-1772129739451-efdfbb9c12a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2026-12-01",
    primaryKeyword: "oil prices 2026",
    secondaryKeywords: ["Strait of Hormuz crisis 2026", "OPEC forecast 2026", "Suez Canal oil", "Middle East oil prices"],
    seoTitle: "Oil Prices 2026: The Two Middle East Crises Setting the Number",
    seoDescription:
      "Brent forecasts cluster in the high $70s to high $80s for late 2026, shaped by a historic Strait of Hormuz disruption and a still-unsettled Red Sea. Egypt's Suez Canal sits between both.",
    body: [
      p(
        "Oil forecasts for late 2026 cluster in a fairly narrow band — J.P. Morgan projects Brent crude averaging around $86 a barrel in the third quarter, sliding to about $80 in the fourth and $78 by year-end, while the U.S. Energy Information Administration's own estimate sits close to $85 for Q3. Those numbers look almost calm on their own. What's actually setting them, underneath the calm, is two separate Middle East crises running at the same time — and Egypt happens to sit at the geographic hinge between both."
      ),
      h2("The Actual Shock Behind the Number"),
      p(
        "The larger of the two is the 2026 Strait of Hormuz crisis. After U.S. and Israeli strikes on Iran began on February 28, 2026, Iranian forces declared the Strait \"closed\" days later and began attacking commercial shipping attempting to transit it — a waterway barely 33 kilometres wide at its narrowest point, through which roughly a fifth of the world's oil, plus significant liquefied natural gas volumes, normally passes. The International Energy Agency characterized the resulting disruption as the largest in the history of the global oil market. A ceasefire in April broke down by July, and disruptions of roughly 0.6 million barrels per day are expected to persist through the rest of 2026, with most regional production only expected to return to pre-conflict levels in early 2027."
      ),
      callout(
        "OPEC has simultaneously trimmed its own 2026 demand growth forecast to about 580,000 barrels a day, down from 780,000 the month before — a reminder that prices in late 2026 are being pulled by tightening supply-side risk and softening demand-side expectations at the same time, in opposite directions.",
        { title: "Two Forces, Pulling Against Each Other", tone: "Info" }
      ),
      h2("Egypt's Odd Position, Caught Between Two Chokepoints"),
      p(
        "Here's what makes 2026 genuinely unusual: the Suez Canal, Egypt's own great maritime chokepoint, doesn't touch the Strait of Hormuz at all — it's an entirely separate stretch of geography, connecting the Red Sea to the Mediterranean rather than the Persian Gulf to the Arabian Sea. In theory, that should make Suez an obvious, unaffected alternative route for cargo trying to avoid Hormuz-related risk. In practice, the canal has been fighting its own, unrelated crisis for nearly three years: Houthi attacks on Red Sea shipping, ongoing since late 2023, have pushed most container traffic to reroute around the Cape of Good Hope rather than risk the Bab el-Mandeb Strait leading into the Red Sea and Suez. Only in the past few weeks, as of early September 2026, has Suez traffic shown genuine signs of recovery, with weekly transits reaching levels not seen since the start of 2024."
      ),
      p(
        "That leaves Egypt holding a strange, dual position in this specific story: geographically insulated from the crisis dominating the headlines, while simultaneously managing a separate, quieter crisis of its own that's kept its own canal from fully benefiting from being the obvious safe alternative."
      ),
      h2("What This Means for Prices Going Forward"),
      ...bullets([
        "OPEC+ supply discipline and lingering Hormuz-related disruption are pushing prices up",
        "Softening demand forecasts from both OPEC and the IEA are pulling prices down",
        "A still-fragile Red Sea recovery means shipping costs and insurance premiums remain unusually sensitive to headlines out of two separate Middle East waterways at once, not one",
      ]),
      p(
        "That combination is why most 2026 forecasts land in a band rather than a single confident number — anywhere from the high $70s to the high $80s a barrel through year-end, with the range itself being the honest answer. It's a rare moment where both of the Middle East's defining maritime chokepoints are live risk factors simultaneously, and Egypt's own waterway sits close enough to feel the effects of both without fully controlling either."
      ),
      faq(
        [
          {
            question: "What caused the 2026 Strait of Hormuz crisis?",
            answer:
              "U.S. and Israeli military strikes on Iran began February 28, 2026. Iranian forces declared the Strait of Hormuz closed days later and attacked commercial shipping attempting to transit it, disrupting roughly 20% of global oil supply in what the IEA called the largest supply disruption in the history of the global oil market.",
          },
          {
            question: "What is Brent crude oil forecast to cost by the end of 2026?",
            answer:
              "Forecasts cluster in the high $70s to high $80s per barrel — J.P. Morgan projects Brent averaging around $78 by Q4 2026 year-end, while the EIA's Q3 2026 estimate sits closer to $85, reflecting genuine uncertainty from overlapping supply and demand pressures.",
          },
          {
            question: "Does the Suez Canal crisis affect oil prices the same way as the Strait of Hormuz?",
            answer:
              "They're separate chokepoints. The Strait of Hormuz crisis directly disrupted oil supply leaving the Persian Gulf. The Suez Canal's ongoing disruption, driven by Houthi attacks on Red Sea shipping since late 2023, mainly affects shipping routes and costs rather than oil supply at its source, though both add to overall global shipping risk and cost.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Two of the world's great maritime chokepoints, both under strain in the same year, on opposite sides of the same country — it's a genuinely unusual moment in the region's economic history, and one the next few months of headlines are likely to keep testing."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "middle-east-energy-security-2026-sumed-pipeline",
    title: "Middle East Energy Security in 2026, and the 200-Mile Pipeline Egypt Built as an Insurance Policy",
    category: "Geopolitics & Economy",
    tags: ["Energy Security", "SUMED Pipeline", "Strait of Hormuz", "Ain Sokhna", "Egypt"],
    author: editorialTeam,
    excerpt:
      "The 2026 Strait of Hormuz crisis exposed how much of the world's oil depends on a single 33-kilometre channel. Egypt quietly built a structural hedge against exactly this kind of vulnerability decades ago.",
    imageTone: "redsea",
    image: "https://images.unsplash.com/photo-1755545760275-abd2f1b8ed2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "Middle East energy security 2026",
    secondaryKeywords: ["SUMED pipeline", "Strait of Hormuz oil", "Ain Sokhna", "Suez Mediterranean pipeline"],
    relatedTours: toursBySlug("ain-sokhna-private-yacht"),
    seoTitle: "Middle East Energy Security 2026: Egypt's SUMED Pipeline, Explained",
    seoDescription:
      "The 2026 Hormuz crisis disrupted a fifth of the world's oil supply. Egypt's 200-mile SUMED pipeline, built for a different reason entirely, has quietly functioned as a structural hedge for decades.",
    body: [
      p(
        "\"Energy security\" in most years is a fairly abstract phrase. In 2026, after Iranian forces effectively closed the Strait of Hormuz for weeks and disrupted what the International Energy Agency called the largest supply shock in the history of the global oil market, it stopped being abstract for anyone who buys fuel, insures a tanker, or plans a shipping route. The honest version of the phrase isn't just \"is there enough oil in the ground\" — it's \"can it physically get to where it needs to go if one route stops working.\""
      ),
      h2("What the Crisis Actually Exposed"),
      p(
        "Roughly a fifth of the world's oil, along with meaningful volumes of liquefied natural gas, normally moves through the Strait of Hormuz — a channel only about 33 kilometres wide at its narrowest point. When Iran declared it closed on March 4, 2026, and began attacking vessels attempting to transit, hundreds of ships and thousands of mariners were left effectively trapped in the Persian Gulf. Disruptions of roughly 0.6 million barrels a day are expected to persist through the end of 2026, with regional production only projected to return to pre-conflict averages in early 2027. A single narrow channel, and an outsized share of the global economy running through it — that's precisely the shape of vulnerability energy security is supposed to guard against."
      ),
      callout(
        "The IEA's own description of the disruption — the largest in the history of the global oil market — is a useful measure of just how much leverage a 33-kilometre channel can carry when there's no working alternative route for the oil that depends on it.",
        { title: "One Channel, an Outsized Share of the World's Oil", tone: "Info" }
      ),
      h2("Egypt's Quiet Insurance Policy: the SUMED Pipeline"),
      p(
        "Egypt built a structural hedge against a version of exactly this vulnerability decades before 2026, though not originally for that reason. The Suez-Mediterranean Pipeline — SUMED — runs roughly 320 kilometres overland from Ain Sokhna on Egypt's Red Sea coast to Sidi Kerir on the Mediterranean, and has carried crude oil across Egyptian territory since the 1970s. Its original purpose was more mundane than geopolitics: the largest crude carriers afloat, the VLCCs and ULCCs that move the bulk of the world's oil, are simply too large to transit the Suez Canal while fully loaded. SUMED solves that by letting a tanker offload at Ain Sokhna, pump its cargo overland across Egypt, and reload onto another vessel waiting at Sidi Kerir — moving well over a million barrels a day of capacity between the Gulf and Mediterranean markets without ever needing to fit through the canal itself."
      ),
      h2("Why That Matters Precisely When Hormuz Is the Story"),
      p(
        "SUMED doesn't touch the Strait of Hormuz — it's downstream of it, moving oil that has already safely exited the Persian Gulf. That's an important, honest caveat: SUMED isn't a hedge against a Hormuz closure itself, since the oil still has to get out of the Gulf in the first place. What it is, is a hedge against Suez's own separate vulnerability — the physical size limits of the canal — layered on top of the region's existing routing options. Built for one problem, it happens to also demonstrate the broader principle energy security actually runs on: no single chokepoint, no single pipeline, and no single strait is ever the whole answer. Real resilience is redundancy stacked on redundancy, built years before anyone needs it."
      ),
      faq(
        [
          {
            question: "What is the SUMED pipeline?",
            answer:
              "The Suez-Mediterranean Pipeline (SUMED) is a roughly 320-kilometre overland oil pipeline running from Ain Sokhna on Egypt's Red Sea coast to Sidi Kerir on the Mediterranean, built in the 1970s to let the largest crude tankers — too big to transit the Suez Canal fully loaded — move oil across Egypt instead.",
          },
          {
            question: "Does SUMED protect against a Strait of Hormuz closure?",
            answer:
              "Not directly — SUMED moves oil that has already exited the Persian Gulf, so it doesn't help if the Strait of Hormuz itself is blocked. What it does provide is a structural alternative to the Suez Canal's own size limitations, adding a layer of routing redundancy for oil moving between the Gulf and Mediterranean markets.",
          },
          {
            question: "How much oil does the Strait of Hormuz normally carry?",
            answer:
              "Roughly a fifth of the world's oil supply, plus significant volumes of liquefied natural gas, normally transits the Strait of Hormuz — a channel about 33 kilometres wide at its narrowest point, which is why its 2026 disruption was described by the IEA as the largest in the history of the global oil market.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Ain Sokhna, SUMED's Red Sea terminus, isn't just industrial infrastructure — it's also a genuinely relaxed stretch of Red Sea coast a couple of hours from Cairo, close enough for a private yacht day out without the flight time of Hurghada or Sharm. It's a strange, fitting detail that one of the region's quieter energy-security assets sits right next to one of its more low-key weekend escapes."
      ),
      cta({
        title: "See Ain Sokhna for Yourself",
        body: "A private yacht day on the same stretch of Red Sea coast that quietly keeps oil moving when the region's chokepoints are under strain.",
        buttonLabel: "See the Ain Sokhna Yacht Experience",
        buttonHref: "/experiences/ain-sokhna-private-yacht",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "red-sea-shipping-crisis-2026-suez-canal-recovery",
    title: "The Red Sea Shipping Crisis Is Finally Easing in 2026 — What Nearly Three Years of Disruption Actually Cost",
    category: "Geopolitics & Economy",
    tags: ["Suez Canal", "Red Sea Shipping", "Supply Chains", "Egypt Economy"],
    author: editorialTeam,
    excerpt:
      "After Houthi attacks pushed global shipping away from the Suez Canal starting in late 2023, September 2026 finally shows real, if fragile, signs of recovery — a direct story about Egypt's own economy.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1649872136245-6070c1a71349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2026-11-01",
    primaryKeyword: "Red Sea shipping crisis 2026",
    secondaryKeywords: ["Suez Canal traffic 2026", "Houthi attacks shipping", "supply chain disruption 2026", "Suez Canal recovery"],
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
    seoTitle: "Red Sea Shipping Crisis 2026: Is the Suez Canal Recovering?",
    seoDescription:
      "Nearly three years after Houthi attacks pushed shipping away from the Suez Canal, September 2026 shows the clearest recovery signs yet — though carriers still treat it as fragile, not settled.",
    body: [
      p(
        "This is one of the rarer stories in this series that doesn't need a historical parallel to make its Egypt connection — it's directly, currently an Egyptian economic story. The Suez Canal is one of the country's largest sources of foreign currency, and for nearly three years it's been fighting the most serious disruption to its traffic since the six-day closure of the 1967 war."
      ),
      h2("How the Crisis Started, and How Bad It Got"),
      p(
        "Houthi attacks on commercial shipping in the Red Sea and the Bab el-Mandeb Strait began in late 2023, tied to the war in Gaza, and by 2024 and 2025 had pushed the large majority of container shipping — especially the major Asia-Europe and Asia-US East Coast routes — to reroute entirely around the Cape of Good Hope rather than risk transiting toward the canal. That detour adds roughly ten to fourteen days and thousands of nautical miles to an affected voyage, a direct cost in fuel, time, and crew that shipping lines and, ultimately, consumers absorbed for years. As recently as July 2026, a renewed Houthi blockade shock pushed Bab el-Mandeb transit volumes down by almost a quarter from where they'd been."
      ),
      h2("What Nearly Three Years of This Actually Cost Egypt"),
      p(
        "Suez Canal revenue sits alongside tourism, remittances, and gas exports as one of Egypt's principal sources of foreign currency, and a multi-year stretch of ships choosing the long way around Africa instead of the canal has meant a real, sustained hit to that revenue stream — even as Egypt's other major foreign-currency earners, tourism among them, have continued largely unaffected by a crisis playing out hundreds of miles offshore."
      ),
      callout(
        "Suez Canal traffic in early September 2026 reached levels not seen since the start of 2024, holding for a second consecutive week — the clearest sign of genuine recovery the canal has seen since the crisis began, though most carriers are still treating Cape routing as their default rather than fully committing back to Suez.",
        { title: "The Clearest Recovery Signal Yet", tone: "Highlight" }
      ),
      h2("Why This Recovery Is Still Fragile, Not Settled"),
      p(
        "No attacks have been reported since a Bahri-owned tanker was hit off Yanbu on August 24, and shipping lines have cautiously begun returning to the Suez corridor. But most carriers running the major Asia-Europe and Asia-US East Coast services are still keeping Cape of Good Hope routing as their standard, defaulting back to Suez only when conditions look calm enough for an individual voyage — industry analysts have described the current state as a structured pause under tension, not a genuine de-escalation. A single renewed attack could reverse weeks of cautious recovery overnight."
      ),
      h2("Why the Rest of the World Is Watching This Number Too"),
      p(
        "Whether Suez traffic keeps recovering or snaps back to Cape routing isn't only an Egyptian economic story — it moves shipping costs, delivery timelines, and marine insurance premiums for a huge share of global trade between Asia and Europe. A canal that carries roughly 12 to 15% of world trade in ordinary years doesn't stay a local story for long, however localized its geography."
      ),
      faq(
        [
          {
            question: "Why did shipping stop using the Suez Canal?",
            answer:
              "Houthi attacks on commercial vessels in the Red Sea and Bab el-Mandeb Strait, which began in late 2023, made the approach to the Suez Canal too risky for most major shipping lines, which shifted to routing around the Cape of Good Hope instead — a detour that adds roughly 10 to 14 days to an affected voyage.",
          },
          {
            question: "Is Suez Canal traffic recovering in 2026?",
            answer:
              "Yes, cautiously — early September 2026 traffic reached levels not seen since the start of 2024, sustained for a second consecutive week, though most carriers are still defaulting to the longer Cape of Good Hope route rather than fully committing back to Suez.",
          },
          {
            question: "Does the Red Sea shipping crisis affect travel to Egypt?",
            answer:
              "No — the disruption affects international container and cargo shipping routes offshore. Tourist travel within Egypt, including Nile cruises and Red Sea resort travel, runs on entirely separate routes and has not been affected by the shipping crisis.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Nearly three years is a long time for any recovery to stay called \"cautious,\" and Egypt's canal revenue is the clearest real-world scoreboard for how this actually resolves — not a metaphor this time, just the thing itself, still very much in progress."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "inflation-2026-ancient-egypt-grain-reserves",
    title: "Inflation Cooled to 3.4% in 2026. Ancient Egypt Invented the Original Shock Absorber for This.",
    category: "Geopolitics & Economy",
    tags: ["Inflation", "US Economy", "Ancient Egypt", "Grain Storage", "Economic History"],
    author: editorialTeam,
    excerpt:
      "US inflation eased to 3.4% in 2026 as an energy shock faded. Three thousand years earlier, Egypt was already building state granaries for the exact same purpose: absorbing a shock before it could spiral.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1710886324980-997f7742f16c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2026-12-01",
    primaryKeyword: "inflation 2026",
    secondaryKeywords: ["US inflation rate 2026", "CPI 2026", "ancient Egypt grain storage", "economic history reserves"],
    relatedStories: [
      {
        slug: "ai-safety-abu-simbel-lesson-in-moving-fast",
        title: "AI Safety Is a New Debate. Egypt Already Lived a Version of It.",
        excerpt:
          "The EU AI Act is now largely in force. The debate over who governs a powerful new technology, and who pays when it moves faster than the safeguards, isn't new — Egypt built and rescued a monument through exactly that story once already.",
        imageTone: "desert",
        category: "Tech & AI",
      },
    ],
    seoTitle: "US Inflation 2026, and Ancient Egypt's Original Shock Absorber",
    seoDescription:
      "US CPI eased to 3.4% in July 2026 as an energy shock faded. Egypt's ancient state granaries were built to smooth the exact same kind of shortage-driven price shock, three thousand years earlier.",
    body: [
      p(
        "U.S. inflation eased to 3.4% for the twelve months ending in July 2026, down slightly from 3.5% the month before, with core inflation (excluding food and energy) at 2.5%. The details behind that headline number tell the more interesting story: gasoline prices were up 24.6% year-over-year, a notable deceleration from 26.7% the prior month, as the energy shock triggered by the year's Iran conflict continued gradually working its way out of the data."
      ),
      h2("What's Actually Driving the 2026 Numbers"),
      p(
        "Forecasters surveyed for the second-quarter 2026 outlook expect headline CPI inflation to average around 3.5% and core CPI around 2.9% on a fourth-quarter-over-fourth-quarter basis for the year — a picture of an economy still working off an energy-driven price shock rather than a broad-based inflation problem. The pattern is exactly what you'd expect after a sharp, geopolitically-triggered spike: a bad month, followed by a slow, bumpy return toward something closer to normal as the initial shock fades from the year-over-year comparison."
      ),
      callout(
        "Fuel oil prices were still up 39.1% year-over-year in July 2026, decelerating from 42.9% the month before — the clearest single data point that this inflation story is fundamentally an energy shock working its way through the system, not a broad economy-wide problem.",
        { title: "The Number That Explains the Rest", tone: "Info" }
      ),
      h2("A 3,000-Year-Old Version of the Same Problem"),
      p(
        "Ancient Egypt's entire economy revolved around a single, variable input: the Nile's annual flood. A strong flood meant abundant grain, the era's dominant staple commodity and closest equivalent to a currency in kind. A weak or failed flood meant scarcity, and scarcity meant exactly the kind of sharp, disruptive price shock modern economies now try to manage with interest rates and strategic reserves. Egypt's answer, well documented in administrative records from at least the Middle Kingdom onward and famously depicted in tomb and temple scenes of grain being measured, recorded, and stored — including at the granary complex attached to the Ramesseum at Thebes — was centrally organized state granaries: stockpile the surplus in good years specifically so it could be released during lean ones, smoothing the shock before it could spiral into full famine."
      ),
      p(
        "It's also, not coincidentally, the practice behind one of the most famous stories in the Hebrew Bible: Joseph advising Pharaoh to store grain through seven years of plenty in preparation for seven years of famine. Whatever its historical status as a specific event, the administrative logic it describes — a state stockpile built during abundance, deliberately released during scarcity — is genuinely, independently attested in Egyptian records as a real, recurring practice, not a literary invention."
      ),
      h2("Same Logic, Modern Tools"),
      ...bullets([
        "Ancient Egypt: grain stockpiled in state granaries during good Nile floods, released during poor ones, smoothing food-price shocks before they became famines",
        "Modern central banks: interest rate policy used to cool an economy running hot, or support one running cold, smoothing the broader price shock rather than a single commodity",
        "The US Strategic Petroleum Reserve: a literal modern descendant of the same instinct, created directly in response to the 1970s oil shocks — a stockpile built in calm periods specifically to be drawn down during a crisis",
      ]),
      p(
        "The underlying idea hasn't changed in three thousand years, only the commodity and the tools: nothing actually eliminates a shock when it hits. What determines how badly it hurts is whether a reserve — of grain, of oil, of monetary flexibility — was built ahead of time, before anyone needed it."
      ),
      faq(
        [
          {
            question: "What was the US inflation rate in 2026?",
            answer:
              "US CPI inflation eased to 3.4% for the twelve months ending July 2026, down from 3.5% the prior month, with core inflation (excluding food and energy) at 2.5%, as an energy price shock from the year's Iran conflict gradually faded from the data.",
          },
          {
            question: "Did ancient Egypt really store grain reserves?",
            answer:
              "Yes — Egyptian administrative records from at least the Middle Kingdom onward, along with tomb and temple depictions such as the granary complex at the Ramesseum, document centrally organized state grain storage, used to smooth price and supply shocks from the Nile flood's year-to-year variability.",
          },
          {
            question: "Is the Joseph and Pharaoh grain story historically accurate?",
            answer:
              "Its status as a specific historical event is debated among scholars, but the administrative practice it describes — a state grain stockpile built during abundant years and released during scarce ones — is independently and genuinely attested in ancient Egyptian records as a real, recurring policy.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Every time a monthly CPI report comes in a little cooler than expected, it's worth remembering that the underlying relief people feel is a very old one — the same relief a granary keeper on the Nile would have recognized, watching a lean year pass without turning into a famine."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "future-of-us-dollar-2026-nubian-gold-history",
    title: "Central Banks Are Buying Record Gold as the Dollar's Grip Loosens. Egypt Was Selling It First.",
    category: "Geopolitics & Economy",
    tags: ["US Dollar", "De-dollarization", "Gold Reserves", "Nubia", "Ancient Egypt"],
    author: editorialTeam,
    excerpt:
      "The dollar's share of global reserves has slid from 71% to 58% since 2000, as central banks stockpile gold instead. The \"land of gold\" that fed the ancient world's original reserve-asset economy was Nubia, in what's now southern Egypt.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1786438936222-cca1f5f5ca27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-02-01",
    primaryKeyword: "future of the US dollar 2026",
    secondaryKeywords: ["de-dollarization 2026", "central bank gold buying", "Nubia gold history", "dollar reserve currency status"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour"),
    seoTitle: "The US Dollar's Future in 2026, and Egypt's Original Gold Economy",
    seoDescription:
      "The dollar holds about 58% of global reserves in 2026, down from 71% in 2000, as central banks buy record gold. Ancient Nubia, in southern Egypt, was the gold source behind the Bronze Age's version of a reserve asset.",
    body: [
      p(
        "The US dollar still holds roughly 58% of global foreign exchange reserves in 2026 — down from about 71% in 2000, a real but gradual erosion rather than a collapse. What's filling part of that gap isn't another currency; it's gold. Central banks bought more than 1,000 tonnes of it in 2024 alone, the third consecutive year above that threshold, while countries including Russia, India, China, Brazil, and Malaysia have been actively building trade channels that don't route through the dollar at all."
      ),
      h2("Why the Dollar Is Still on Top, For Now"),
      p(
        "No single alternative currency currently matches the dollar's liquidity, market depth, or network effects — which is the honest reason its dominance is being described in 2026 as increasingly contested rather than actually ending. The dollar isn't losing its global role overnight. What's changed is that, for the first time in decades, a meaningful number of the world's central banks are openly hedging that bet, and the asset they're overwhelmingly choosing to hedge with is the oldest reserve asset there is."
      ),
      callout(
        "A 13-percentage-point slide in reserve share since 2000 — from roughly 71% to 58% — sounds gradual until you notice what's replacing it: not a rival currency, but gold, bought at a pace central banks haven't sustained in decades.",
        { title: "The Erosion, In One Number", tone: "Info" }
      ),
      h2("Egypt and Nubia's Original Gold Economy"),
      p(
        "Long before central banks and reserve currencies, the ancient Near East ran a version of the exact same instinct — and the gold behind it came overwhelmingly from one place. Nubia, the region stretching south along the Nile through what's now southern Egypt and Sudan, takes its name from a term widely connected to the ancient Egyptian word for gold, nbw. Egyptian texts and temple reliefs repeatedly record tribute and trade in Nubian gold flowing north for millennia, and by the New Kingdom, with much of Nubia under direct Egyptian control, the region was one of the richest gold-producing territories anywhere in the ancient world."
      ),
      p(
        "That gold wasn't only decorative. The Amarna Letters — 14th-century BC diplomatic correspondence between Egypt's pharaohs and the other great powers of the Bronze Age — record foreign kings explicitly asking Egypt for gold \"like sand, more numerous than grain,\" precisely because it functioned as trusted, portable, durable value that crossed borders in a way no single kingdom's own currency reliably could. Functionally, it was the Bronze Age's closest thing to a reserve asset, and Egypt controlled a significant share of the supply."
      ),
      h2("Same Instinct, Same Asset, Three Thousand Years Apart"),
      p(
        "Central banks stockpiling gold in 2026, specifically because they no longer want to depend entirely on trust in one government's currency, are reaching for the identical asset, for the identical underlying reason, that Bronze Age kings reached for when they wrote to Egypt asking for gold instead of promises. Its value has never depended on any single government's continued good behavior — which is exactly the property that made it valuable to a 14th-century-BC king, and exactly the property drawing central banks back to it now."
      ),
      faq(
        [
          {
            question: "What share of global reserves does the US dollar hold in 2026?",
            answer:
              "Roughly 58%, down from approximately 71% in 2000 — a gradual erosion rather than a collapse, with the dollar remaining the world's primary reserve currency and no single alternative currency matching its liquidity and market depth.",
          },
          {
            question: "Why are central banks buying so much gold?",
            answer:
              "As a hedge against over-reliance on any single currency's stability, particularly amid geopolitical tensions and fiscal concerns. Central banks bought over 1,000 tonnes of gold in 2024, a third consecutive year above that threshold.",
          },
          {
            question: "Why was Nubia called the land of gold?",
            answer:
              "Nubia's name is widely connected to nbw, the ancient Egyptian word for gold, reflecting its status through antiquity as one of the richest gold-producing regions in the ancient world, supplying Egypt and, through diplomatic exchange, other Bronze Age powers.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The dollar's dominance isn't ending in 2026 — every serious analysis of the numbers says so. But the instinct now pulling central banks toward gold is a genuinely old one, and its clearest ancient chapter is on permanent display in Cairo, in a museum full of the exact metal Bronze Age kings once begged Egypt for."
      ),
      cta({
        title: "See Where That Gold Ended Up",
        body: "Tutankhamun's treasures and the Egyptian Museum's gold collection — a direct look at the ancient world's original reserve asset.",
        buttonLabel: "See the Egyptian Museum Tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
      }),
    ],
  },
];
