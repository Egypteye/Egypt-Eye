import type { Story } from "../types";
import { authors } from "../authors";
import { tours } from "../tours";
import { p, h2, bullets, callout, faq, cta } from "../storyBlocks";

const editorialTeam = authors[0];

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

// World-trends cohort, batch 5 of 10: Russia-Ukraine, Israel-Palestine,
// the future of global geopolitics, football after the 2026 World Cup,
// and next-gen gaming. The two conflict pieces are deliberately narrow
// and factual — Egypt's own wheat-import exposure to the Russia-Ukraine
// war, and Egypt's specific, practical mediation and border role in the
// Gaza peace process — rather than commentary on the conflicts
// themselves. Facts were verified via web search at the time of
// writing — see contentReviewDate on each story, since these are all
// fast-moving situations.

export const stories: Story[] = [
  {
    status: "archived",
    featured: false,
    slug: "russia-ukraine-war-2026-egypt-wheat-bread",
    title: "The Russia-Ukraine War Is Still Reshaping Egypt's Bread, Four Years Later",
    category: "Geopolitics & Economy",
    tags: ["Russia Ukraine War", "Egypt Food Security", "Wheat", "Bread"],
    author: editorialTeam,
    excerpt:
      "Peace talks resumed in 2026, but Egypt — the world's largest wheat importer, buying most of its grain from Russia and Ukraine combined — has spent four years absorbing the war's economic effects regardless of how the fighting itself is going.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1761351108766-8ddf19b835ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2026-12-01",
    primaryKeyword: "Russia Ukraine war 2026",
    secondaryKeywords: ["Egypt wheat imports", "Egypt food security", "Russia Ukraine peace talks 2026", "world's largest wheat importer"],
    seoTitle: "Russia-Ukraine War 2026, and Its Real Cost to Egypt's Bread Supply",
    seoDescription:
      "2026 brought renewed Russia-Ukraine peace talks, but Egypt — the world's largest wheat importer — has spent four years absorbing the war's economic effects, regardless of the battlefield.",
    body: [
      p(
        "Diplomatic activity around the Russia-Ukraine war picked up again in 2026: a trilateral round of talks in Geneva in February became the first since the war began to put territorial questions directly on the table, and by early September, US envoys Steve Witkoff and Jared Kushner had travelled to Moscow for a three-hour meeting with President Putin, followed by talks in Kyiv. No breakthrough has been announced, and a Ukrainian counteroffensive that began in February 2026 continues across the eastern and southern fronts. Whatever the war's trajectory from here, one country has been absorbing its economic effects continuously since 2022, almost entirely independent of who's winning on the ground: Egypt."
      ),
      h2("Where the War Stands in 2026"),
      ...bullets([
        "A trilateral round of peace talks held in Geneva on February 17–18, 2026 marked the first time territorial issues were formally included in the negotiating agenda",
        "US envoys met with President Putin in Moscow in early September 2026 for over three hours, described by Russian officials as \"constructive\" though without an announced breakthrough",
        "A Ukrainian counteroffensive has been active since February 11, 2026, and President Putin has indicated he sees little reason to resume substantive talks until Russian forces control the rest of the Donbas",
      ]),
      callout(
        "Whatever the outcome on the battlefield, rebuilding stable, predictable Black Sea grain trade routes takes years, not months — meaning a country as exposed as Egypt is likely to feel this war's economic aftershocks for a long stretch after any actual ceasefire.",
        { title: "Why This Doesn't End When the Fighting Does", tone: "Info" }
      ),
      h2("The War Egypt Never Signed Up For, But Has Felt Every Year Since"),
      p(
        "Egypt is the world's largest wheat importer, buying roughly 12 to 13 million tons a year — wheat that makes up between 35% and 39% of the average Egyptian's caloric intake, and imports that typically cover around 62% of the country's total wheat use. Before 2022, Russia and Ukraine together supplied the overwhelming majority of that grain. When the invasion began, Egypt lost predictable access to a huge share of its single most important food import overnight, a genuinely serious food-security exposure for a country of over 100 million people where bread carries deep, longstanding social and political weight."
      ),
      p(
        "Four years on, the picture is still shifting rather than settled. Russia's share of Egypt's wheat imports fell from about 74% in 2024 to around 55% in 2025, with Ukraine's share rising from roughly 15% to more than 30% over the same period — a real diversification, but between the war's two direct combatants, not away from them. As of 2026, wheat prices in Egypt have surged to record highs, driven by a combination of rising fuel costs, a depreciating currency, and mounting logistics complications — with the country's underlying overdependence on the Black Sea region for its most essential food import still fully intact."
      ),
      h2("Why This Isn't a Story That Ends When the Guns Do"),
      p(
        "Even in the most optimistic scenario — a durable ceasefire negotiated this year — Egypt's exposure doesn't resolve on the same timeline. Trade relationships, shipping insurance, and reliable port logistics through the Black Sea take years to rebuild to pre-war stability, meaning the war's economic effects on Egypt's food supply are likely to outlast its active military phase by a considerable margin. It's a useful, sobering reminder that a war fought thousands of kilometres away doesn't require geographic proximity to reach a country's dinner table — it only requires that country to depend on the same grain the war is being fought over."
      ),
      faq(
        [
          {
            question: "Why does the Russia-Ukraine war affect Egypt so directly?",
            answer:
              "Egypt is the world's largest wheat importer, and before 2022 sourced the overwhelming majority of its roughly 12–13 million tons of annual wheat imports from Russia and Ukraine combined — grain that accounts for 35–39% of the average Egyptian's caloric intake.",
          },
          {
            question: "Has Egypt diversified its wheat suppliers since 2022?",
            answer:
              "Partially, but mostly between the war's two combatants — Russia's share of Egypt's wheat imports fell from about 74% in 2024 to around 55% in 2025, while Ukraine's share rose from roughly 15% to over 30% over the same period, leaving Egypt still heavily dependent on the Black Sea region overall.",
          },
          {
            question: "What is the current status of Russia-Ukraine peace talks in 2026?",
            answer:
              "Talks resumed with a Geneva round in February 2026 that for the first time included territorial issues, followed by a September 2026 meeting between US envoys and President Putin in Moscow. No breakthrough has been announced, and Russia has indicated it sees limited reason to negotiate substantively until it controls the rest of the Donbas.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The war's front lines are thousands of miles from Cairo. Its effect on what Egyptians pay for bread has never been distant at all."
      ),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "gaza-peace-process-2026-egypt-mediation-role",
    title: "Why Nearly Every Gaza Peace Plan Runs Through a Room in Egypt",
    category: "Geopolitics & Economy",
    tags: ["Gaza", "Egypt Diplomacy", "Rafah Crossing", "Sharm El-Sheikh", "Middle East Mediation"],
    author: editorialTeam,
    excerpt:
      "A ceasefire has held, unevenly, since October 2025, with its next phase still unresolved as of 2026. Egypt's specific, practical role in that process — as border, host, and primary mediator — has stayed constant regardless of the process's pace.",
    imageTone: "redsea",
    image: "https://images.unsplash.com/photo-1748667866987-fcbf24ff832f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2026-11-01",
    primaryKeyword: "Egypt Gaza mediation 2026",
    secondaryKeywords: ["Rafah crossing", "Sharm El-Sheikh talks", "Gaza ceasefire 2026", "Egypt Qatar Turkey mediators"],
    relatedStories: [],
    seoTitle: "Egypt's Role in the 2026 Gaza Peace Process, Explained",
    seoDescription:
      "The Gaza ceasefire's second phase remains unresolved as of 2026. Egypt's specific, practical role — as Gaza's only non-Israeli land border, as host of the Sharm El-Sheikh framework, and as lead mediator alongside Qatar and Turkey — has stayed constant.",
    body: [
      p(
        "A ceasefire between Israel and Hamas took effect on October 10, 2025, the first phase of a US-backed peace framework. As of 2026, its next phase remains unresolved: in July, Hamas agreed to a deal involving staged disarmament, contingent on an Israeli withdrawal it says hasn't been fulfilled, while a US-led \"Board of Peace\" announced an agreement on disarmament terms the same month without securing full implementation from either side. Whatever the process's pace, one part of it has stayed structurally constant throughout: Egypt's specific, practical role in making any of it physically possible."
      ),
      h2("Egypt's Specific, Practical Role"),
      ...bullets([
        "Egypt, Qatar, and Turkey have been the three principal mediators working alongside the US throughout the ceasefire process",
        "The Rafah crossing — Gaza's only land border that isn't with Israel — reopened for limited traffic in February 2026 under Egyptian and Israeli security coordination",
        "Cairo hosted Hamas, Egyptian, Qatari, and Turkish delegations for second-phase implementation talks in July 2026",
        "Egypt publicly warned in May 2026 that escalations risked unravelling the ceasefire, a recurring role as the process's most consistent outside voice",
      ]),
      callout(
        "Egypt is the only country besides Israel that borders Gaza at all — a plain geographic fact that makes it the mandatory physical conduit for humanitarian aid and any civilian movement not routed through an Israeli-controlled crossing, regardless of who is at the negotiating table on any given week.",
        { title: "A Role Rooted in Geography, Not Just Diplomacy", tone: "Info" }
      ),
      h2("A Role That Traces Back to Camp David"),
      p(
        "Egypt's position as the Arab world's primary formal interlocutor in this specific conflict isn't a recent development — it's a direct, nearly fifty-year legacy of the 1978 Camp David Accords and the 1979 Egypt-Israel peace treaty that followed. Since then, whatever the state of the broader conflict, Egypt has maintained direct, functioning channels with both Israeli and Palestinian sides that few other governments in the region have sustained continuously across five decades of intermittent war and negotiation."
      ),
      p(
        "As of this writing, the second phase of the current peace framework remains stalled, with both sides reportedly reluctant to move first on their respective commitments. Whatever happens next in that specific negotiation, Egypt's structural role in it — as border, host city for talks framed around commitments made at Sharm El-Sheikh, and lead mediator — isn't tied to that outcome. It's a function of geography and a half-century diplomatic relationship that would remain in place under any specific deal that eventually gets signed."
      ),
      faq(
        [
          {
            question: "What is Egypt's role in the Gaza peace process?",
            answer:
              "Egypt is one of three principal mediators, alongside Qatar and Turkey, working with the US on the Gaza ceasefire process, and controls the Rafah crossing — Gaza's only land border besides its border with Israel — making it the essential physical conduit for aid and civilian movement.",
          },
          {
            question: "What is the Rafah crossing?",
            answer:
              "Gaza's border crossing with Egypt, the only Gaza crossing not controlled by Israel. It reopened for limited traffic in February 2026 under Egyptian and Israeli security coordination, following the October 2025 ceasefire.",
          },
          {
            question: "Why has Egypt been a consistent mediator in this conflict for decades?",
            answer:
              "Egypt's mediating role traces back to the 1978 Camp David Accords and 1979 Egypt-Israel peace treaty, which established direct, sustained diplomatic channels with both Israeli and Palestinian sides that Egypt has maintained continuously for nearly fifty years.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Negotiations stall and restart, deadlines slip, and the specific terms under discussion keep changing. Egypt's seat at the table — set by its border, not by any particular round of talks — hasn't."
      ),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "future-of-geopolitics-2026-egypt-longest-running-power",
    title: "The World Is Sliding Into a 'Multipolar' Order in 2026. Egypt Has Survived a Dozen of Them Already.",
    category: "Geopolitics & Economy",
    tags: ["Geopolitics", "Multipolar World", "Ancient Egypt History", "World Order"],
    author: editorialTeam,
    excerpt:
      "Analysts in 2026 describe a world order shifting from unipolar to \"polycentric,\" with power dispersed across multiple competing centers. Egypt has already lived through a dozen versions of exactly that shift, under a dozen different ruling powers, across five thousand years.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1762945527140-4f45fcbf3c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "future of geopolitics 2026",
    secondaryKeywords: ["multipolar world order", "polycentric world 2026", "ancient Egypt history timeline", "Egypt civilizational continuity"],
    seoTitle: "The Multipolar World Order of 2026, and Egypt's 5,000-Year Precedent",
    seoDescription:
      "2026 analysts describe a shift from a unipolar to a polycentric world order. Egypt's own history — surviving under Persian, Greek, Roman, Arab, Ottoman, and modern powers — is the longest-running case study of exactly this kind of transition.",
    body: [
      p(
        "The language analysts are using to describe the 2026 world order has shifted noticeably from a year or two earlier. Rather than a straightforward \"multipolar\" order, some now describe an emerging \"multisphere\" arrangement — spheres of influence without fixed boundaries or shared norms to contain them — while the World Economic Forum's own analysts favor \"polycentric\": power dispersed across many centers rather than concentrated in one or two. Whatever the label, the underlying description is consistent: a single dominant power's ability to unilaterally set the global agenda is eroding, without any clean replacement structure yet in place."
      ),
      h2("What 'Multipolar' Actually Means in 2026"),
      ...bullets([
        "The United States remains the most influential single military and economic power, but its ability to unilaterally impose international agendas is described as increasingly constrained compared to the post-Cold War period",
        "China, Russia, the European Union, and various regional blocs are each independently shaping global events rather than deferring to a single hierarchy",
        "Global trade is becoming more regionalized and fragmented, increasingly shaped by domestic priorities rather than a shared international framework",
        "Analysts describe 2026's defining feature as fragility rather than collapse — a system too interconnected to break apart suddenly, but too strained to stabilize fully",
      ]),
      callout(
        "\"Zones of stability contract and contested regions expand — from the Arctic to the high seas, and from cyberspace to space itself\" is how one 2026 strategic outlook put it. It's a genuinely disorienting moment for any country trying to plan around a single dominant power's stated preferences.",
        { title: "The 2026 Strategic Outlook, in One Line", tone: "Info" }
      ),
      h2("Egypt Has Seen This Movie Before — Many Times"),
      ...bullets([
        "Independent Egyptian rule under the Old, Middle, and New Kingdoms — roughly three millennia, itself spanning multiple internal power shifts",
        "Persian Achaemenid conquest, beginning 525 BC",
        "Macedonian and Ptolemaic Greek rule, from Alexander the Great's conquest in 332 BC",
        "Roman, then Byzantine rule, from 30 BC",
        "The Arab and Islamic conquest, from 642 AD",
        "Ottoman rule, from 1517",
        "British occupation and protectorate status, 1882 to 1952",
        "The independent republic navigating Cold War bipolarity, and now a 2026 multipolar order",
      ]),
      h2("What Actually Explains the Continuity"),
      p(
        "Egypt's remarkable run isn't a story of consistently winning — it was repeatedly conquered, occupied, and ruled by outside powers for the majority of its recorded history. What explains its continuity as a functioning, coherent place worth ruling, across every single one of those transitions, is something more specific: geographic and economic indispensability. The Nile's agricultural output made Egypt worth controlling rather than emptying out for every ancient power that took it. The Suez Canal did the same for every modern one. Conquerors changed constantly. The underlying reason Egypt mattered to whoever currently held it changed remarkably little."
      ),
      p(
        "That's the genuinely useful lesson sitting underneath 2026's anxious multipolarity headlines: the current order isn't Egypt's first rodeo, or its tenth. Any country currently worrying about how to navigate a world with no single dominant center might reasonably study the one place that has already done it, under roughly a dozen different dominant powers, for five thousand years running."
      ),
      faq(
        [
          {
            question: "What does \"multipolar\" or \"polycentric\" world order mean in 2026?",
            answer:
              "It describes a shift away from a single dominant power (like the post-Cold War US-led order) toward power being dispersed across multiple independent centers — the US, China, Russia, the EU, and various regional blocs — each shaping global events without deferring to one hierarchy.",
          },
          {
            question: "How many different ruling powers has Egypt lived under?",
            answer:
              "At least seven major external powers across recorded history — Persian, Macedonian/Ptolemaic Greek, Roman/Byzantine, Arab/Islamic, Ottoman, and British rule — in addition to its own independent Old, Middle, and New Kingdom periods and its post-1952 republic.",
          },
          {
            question: "Why has Egypt persisted through so many different world orders?",
            answer:
              "Not through consistently winning conflicts, but through geographic and economic indispensability — the Nile's agricultural output historically, and the Suez Canal in the modern era — that made every successive ruling power need Egypt to keep functioning rather than emptying it out.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A world with no single dominant center is a genuinely unfamiliar situation for most of the countries currently worrying about it. It has been Egypt's default operating condition for most of its five-thousand-year history."
      ),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "egypt-2026-world-cup-historic-run",
    title: "Egypt's Historic 2026 World Cup Run, and What It Means for Egyptian Football Going Forward",
    category: "Culture & Trends",
    tags: ["2026 World Cup", "Egypt Football", "Mohamed Salah", "Pharaohs", "AFCON"],
    author: editorialTeam,
    excerpt:
      "Spain won the 2026 World Cup, but for Egypt, the tournament was already historic before the final kicked off — a first-ever knockout stage run, powered by a Mohamed Salah-inspired qualifying campaign for the ages.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1562493205-0c1659a3cf4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "Egypt 2026 World Cup",
    secondaryKeywords: ["Mohamed Salah World Cup", "Egypt round of 16", "2026 World Cup final result", "Egypt Argentina World Cup"],
    seoTitle: "Egypt's Historic 2026 World Cup Run, Explained",
    seoDescription:
      "Spain beat Argentina 1-0 to win the 2026 World Cup, but Egypt's own tournament — a Salah-inspired qualifying campaign and a first-ever Round of 16 appearance — was the more personal story for millions of fans.",
    body: [
      p(
        "Spain won the 2026 FIFA World Cup, beating Argentina 1-0 after extra time at MetLife Stadium on July 19, with substitute Ferran Torres scoring the winner in front of 80,663 fans — Spain's second title, against three-time champions Argentina. It was a fitting final for a tournament built to break records: the first World Cup hosted by three countries (the US, Mexico, and Canada), the most participating nations, the most matches ever played (104), the most goals scored (308), and more than 6.8 million fans in attendance across six weeks — a 90% jump over the previous attendance record."
      ),
      h2("How Egypt Got There"),
      p(
        "For Egypt, though, the tournament's real story had already been written before the final whistle blew anywhere. Egypt clinched qualification with a 3-0 win over Djibouti, securing top spot in their group with a match to spare, on the back of a near-flawless campaign under coach Hossam Hassan — 19 goals scored across nine qualifying matches, nine of them from Mohamed Salah alone. It marked Egypt's fourth-ever World Cup appearance, following 1934, 1990, and 2018, and their return to the tournament after missing the 2022 edition entirely."
      ),
      h2("The Historic Run Itself"),
      ...bullets([
        "Group stage: a 1-1 draw with Belgium, a 3-1 win over New Zealand, and a 1-1 draw with Iran — Egypt finished unbeaten with five points",
        "Round of 32: a penalty-shootout win over Australia, sending Egypt into the knockout stage",
        "Round of 16: a dramatic 3-2 loss to eventual runners-up Argentina in Atlanta on July 7 — Egypt led 2-0 through goals from Yasser Ibrahim and Mostafa Zico before a late Argentine fightback, including a goal from Lionel Messi himself, turned the match in the final minutes",
      ]),
      callout(
        "In 2018, Egypt left the World Cup without a single point. In 2026, they finished the group stage unbeaten and reached the Round of 16 for the first time in the country's football history — a genuine, measurable leap forward, decided in the end by a five-minute spell against one of the tournament's eventual finalists.",
        { title: "The Real Measure of Progress", tone: "Highlight" }
      ),
      h2("What This Means for Egyptian Football Going Forward"),
      p(
        "None of this happened in a vacuum. Egypt remains the most successful nation in Africa Cup of Nations history, with a record seven titles — more than any other country on the continent — so the football pedigree behind this World Cup run was never really in question. What 2026 represented was that domestic pedigree finally translating onto the World Cup stage itself, with Mohamed Salah, already one of the most recognizable footballers on the planet through his Liverpool career, cementing his role as a genuine generational figure for the sport in Egypt specifically."
      ),
      p(
        "None of that football culture is confined to the national team, either. Cairo's Al Ahly and Zamalek rivalry is regularly ranked among the fiercest derbies anywhere in world football, and matchday in the capital — regardless of how the Pharaohs are doing on the world stage in any given cycle — is one of the more genuine windows into everyday Egyptian passion a visitor can walk into."
      ),
      faq(
        [
          {
            question: "Who won the 2026 World Cup?",
            answer:
              "Spain, defeating three-time champions Argentina 1-0 after extra time in the final at MetLife Stadium on July 19, 2026, with substitute Ferran Torres scoring the winning goal in front of 80,663 fans.",
          },
          {
            question: "How far did Egypt go in the 2026 World Cup?",
            answer:
              "Egypt reached the Round of 16 for the first time in its history, finishing the group stage unbeaten (draws with Belgium and Iran, a win over New Zealand) and beating Australia on penalties in the Round of 32, before losing 3-2 to eventual runners-up Argentina in a dramatic comeback match.",
          },
          {
            question: "How many goals did Mohamed Salah score in World Cup qualifying?",
            answer:
              "Nine goals across Egypt's nine qualifying matches, as Egypt secured their fourth-ever World Cup appearance (after 1934, 1990, and 2018) with a dominant campaign, scoring 19 goals in total and clinching qualification with a 3-0 win over Djibouti.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A country doesn't need to win the tournament for a World Cup to matter enormously. For Egypt in 2026, reaching a stage the national team had never reached before did more for the sport at home than most finals ever could."
      ),
      cta({
        title: "Feel Cairo's Football Culture Firsthand",
        body: "Matchday energy, historic rivalries, and a football obsession that runs as deep as anywhere on the continent — part of what makes a Cairo visit come alive.",
        buttonLabel: "Explore Cairo",
        buttonHref: "/explore-egypt/cairo",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "senet-ancient-egyptian-board-game",
    title: "Senet: The 5,000-Year-Old Board Game Found in Tutankhamun's Tomb",
    category: "History & Culture",
    tags: ["Senet", "Board Games", "Tutankhamun", "Daily Life", "Ancient Egypt"],
    author: editorialTeam,
    excerpt:
      "Thirty squares in three rows, played with casting sticks rather than dice, and buried with pharaohs — because by the New Kingdom, winning at senet had come to mean something about the afterlife.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1568366715736-cf1bb3ea5a4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "senet game",
    secondaryKeywords: ["oldest board game", "ancient Egyptian games", "senet rules", "Tutankhamun senet board"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour", "luxor-west-bank-day-tour"),
    seoTitle: "Senet: Ancient Egypt's Board Game, and How It Was Played",
    seoDescription:
      "A thirty-square board played for around three thousand years, buried with Tutankhamun, and eventually understood as a journey through the afterlife. What survives, and what does not.",
    body: [
      p(
        "Among the objects packed into Tutankhamun's tomb — the chariots, the shrines, the mask — were four game boards. Not symbols of games. Actual boards, with drawers for the pieces. The Egyptians thought a king would want something to play."
      ),
      h2("The Board"),
      ...bullets([
        "Thirty squares, arranged in three rows of ten, played in a boustrophedon path that snakes back and forth",
        "Two players, each with a set of pieces — commonly five a side, though sets vary",
        "No dice. Movement was decided by throwing sticks flat on one side and rounded on the other, or by knucklebones, and counting how they landed",
        "The last few squares are usually marked with signs, and are clearly special — the endgame turned on them",
      ]),
      p(
        "Boards survive in every material and at every quality, from inlaid ebony and ivory to squares scratched into a temple roof by bored workmen. It was played by everyone."
      ),
      h2("How Old"),
      p(
        "Depictions and boards go back to the Predynastic and Early Dynastic periods, which puts the game somewhere around five thousand years old and makes it one of the earliest board games known anywhere. It stayed in play for roughly three thousand years afterwards — a run no modern game has come close to."
      ),
      callout(
        "Nobody knows the rules. No Egyptian text sets them out, because everybody already knew them. What we have are reconstructions built from board layouts, from the marked squares, and from scenes showing play in progress — plausible, playable, and unverifiable.",
        { title: "The Rules Are Lost", tone: "Info" }
      ),
      h2("How a Game Became a Religious Idea"),
      p(
        "Early on, senet appears to be simply a game — tomb scenes show couples playing, and the pleasure is the point. By the New Kingdom something has shifted. The board's path is being read as the journey of the dead through the underworld, the marked squares as hazards and gateways, and the opponent, in some depictions, as unseen."
      ),
      p(
        "Chapter seventeen of the Book of the Dead has the deceased playing senet, and tomb paintings show the dead at the board with no visible partner. Winning is no longer just winning. It is a demonstration that the player can navigate what comes next."
      ),
      h2("Where to See a Board"),
      p(
        "Complete sets are displayed in the Cairo collections, including Tutankhamun's. Look for the drawer in the base — the pieces stored inside, which is why any survived at all. In Luxor, keep an eye on flat stone surfaces at temple sites: informal boards scratched by workmen turn up in places that were never meant to have them, which is the most human thing at most of those sites."
      ),
      faq(
        [
          { question: "What is senet?", answer: "An ancient Egyptian board game played on thirty squares in three rows of ten, with movement determined by throwing sticks or knucklebones. It was played for roughly three thousand years." },
          { question: "How old is senet?", answer: "Boards and depictions go back around five thousand years, to the Predynastic and Early Dynastic periods, making it one of the oldest known board games." },
          { question: "Do we know the rules of senet?", answer: "No. No Egyptian text records them. Modern reconstructions are based on board layouts, marked squares and scenes of play, and are plausible rather than proven." },
          { question: "Why was senet buried with the dead?", answer: "By the New Kingdom the board's path had come to represent the journey through the underworld, and playing — and winning — was understood as a sign the deceased could navigate it." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A game so ordinary that workmen scratched it into stone at lunchtime, and so important that a king was buried with four sets, in case."
      ),
      cta({
        title: "See Tutankhamun's Boards",
        body: "The game sets from the tomb, alongside everything else that was packed for the journey.",
        buttonLabel: "See the museum tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
      }),
    ],
  },
];
