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
    slug: "ancient-egyptian-kohl-eye-makeup",
    title: "Egyptian Kohl: The Eye Makeup That Turned Out to Be Doing Something",
    category: "History & Culture",
    tags: ["Kohl", "Cosmetics", "Ancient Egypt", "Archaeology", "Louvre"],
    author: editorialTeam,
    excerpt:
      "The black line around every painted Egyptian eye was made from compounds that do not occur in nature and had to be manufactured. A 2010 analysis suggested why.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "ancient Egyptian kohl",
    secondaryKeywords: ["Egyptian eye makeup", "kohl ingredients", "Eye of Horus makeup", "ancient Egyptian cosmetics"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour", "islamic-coptic-cairo-walking-tour"),
    seoTitle: "Egyptian Kohl: What It Was Made Of, and What It Did",
    seoDescription:
      "Egyptian eye paint contained lead compounds that had to be synthesised deliberately. What a 2010 analysis found, and why the result is interesting rather than a recommendation.",
    body: [
      p(
        "The heavy black eye line is the single most recognisable thing about ancient Egyptian appearance — on coffins, on temple walls, on every reconstruction ever filmed. It has usually been explained as either pure decoration or as glare reduction, on the reasoning that it works for a modern athlete under floodlights. The chemistry turns out to be stranger than either."
      ),
      h2("What Kohl Was Made Of"),
      p(
        "Analysis of cosmetic samples in the Louvre's Egyptian collection identified four lead-based compounds. Two of them, galena and cerussite, occur naturally. The other two, laurionite and phosgenite, essentially do not — not in any quantity that would let you simply collect them."
      ),
      p(
        "They had to be made. The process involved wet chemistry over a period of weeks, and Egyptian texts describe preparations consistent with it. That is a deliberate, laborious manufacturing step for a cosmetic, which raises the obvious question of why anyone would bother."
      ),
      h2("The 2010 Finding"),
      p(
        "A study published in 2010 by researchers working with the Louvre collection proposed an answer. At very low concentrations, lead ions were found to stimulate nitric oxide production in the skin cells they tested. Nitric oxide is part of the immune response, and the researchers suggested this could have helped the eye resist infection — a real concern in a marshy, fly-heavy river valley where eye disease was endemic."
      ),
      callout(
        "This is a finding about ancient practice, not a suggestion. Lead is a cumulative neurotoxin, lead-based kohl remains a documented cause of poisoning where it is still sold, and nothing in the research implies these preparations were safe. The interest is that the Egyptians appear to have been manufacturing a compound for an effect, not that the compound was a good idea.",
        { title: "Not a Recommendation", tone: "Safety" }
      ),
      h2("The Rest of What Kohl Did"),
      ...bullets([
        "Reduced glare from a sun that is genuinely punishing on the desert edge — the same principle as the smear under a modern outfielder's eyes",
        "Marked status and occasion; kohl pots, applicators and mirrors are common grave goods across social levels",
        "Carried religious weight through association with the Eye of Horus, the restored eye that stands for healing and wholeness",
        "Was worn by men and women alike, which surprises visitors more than it should",
      ]),
      h2("Where to See It"),
      p(
        "Cosmetic kits survive in quantity — kohl pots in stone, faience and glass, thin applicator sticks, palettes for grinding, and mirrors of polished bronze. The Cairo collections hold sets that came out of ordinary burials as well as royal ones, and the ordinary ones are often the more affecting: someone's actual makeup bag, packed for eternity."
      ),
      faq(
        [
          { question: "What was ancient Egyptian kohl made from?", answer: "Lead-based compounds — galena and cerussite, which occur naturally, along with laurionite and phosgenite, which essentially do not and had to be synthesised deliberately." },
          { question: "Did Egyptian eye makeup have a medical purpose?", answer: "A 2010 analysis suggested the lead compounds could stimulate an immune response in skin cells, potentially helping resist eye infection. It is a hypothesis about ancient practice, not a health claim — lead remains toxic." },
          { question: "Did Egyptian men wear kohl?", answer: "Yes. Eye paint was worn across genders and social levels, and cosmetic equipment appears in male and female burials alike." },
          { question: "Is kohl connected to the Eye of Horus?", answer: "Yes. The restored eye of Horus was a symbol of healing and wholeness, and eye paint carried that protective association alongside its practical and decorative roles." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A civilisation that spent weeks synthesising a compound to put around its eyes was doing something more considered than fashion — even if, by any modern measure, it was doing it with the wrong element."
      ),
      cta({
        title: "See the Cosmetic Kits",
        body: "Kohl pots, applicators and bronze mirrors from real burials, in the Cairo collections.",
        buttonLabel: "See the museum tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "egyptomania-history",
    title: "Egyptomania: Two Centuries of the World Copying Egypt",
    category: "History & Culture",
    tags: ["Egyptomania", "Art Deco", "Tutankhamun", "Suez Canal", "Napoleon"],
    author: editorialTeam,
    excerpt:
      "Obelisks in Rome, sphinxes on Georgian furniture, Art Deco cinemas, a Vegas pyramid. Egypt has been the world's most reliably recycled aesthetic for two thousand years, and each revival says more about the borrower.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "Egyptomania",
    secondaryKeywords: ["Egyptian revival style", "Art Deco Egypt influence", "Tutankhamun 1922 influence", "Egyptian Revival architecture"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour", "5-day-giza-cairo-alexandria"),
    seoTitle: "Egyptomania: Every Wave of Egyptian Revival, Explained",
    seoDescription:
      "From Roman obelisks to Napoleon's expedition, the 1869 Suez Canal, Tutankhamun in 1922 and Art Deco — the recurring waves of Egyptian revival and what set each one off.",
    body: [
      p(
        "There is a specific look that means \"ancient and mysterious\" in Western visual shorthand — lotus columns, winged discs, sphinxes flanking a doorway, a stepped silhouette. It has been in continuous circulation for two thousand years, and it comes back roughly whenever Egypt is in the news. The revivals are worth knowing about because they shape what visitors expect before they arrive."
      ),
      h2("Rome Got There First"),
      p(
        "The Romans did not imitate Egypt so much as take it. After the annexation, obelisks were shipped to Rome and re-erected; the cult of Isis spread through the empire; Egyptian motifs entered Roman decoration. Rome still holds more standing ancient obelisks than Egypt does, which is a fact worth sitting with."
      ),
      h2("Napoleon Turns It Into a Discipline"),
      p(
        "The 1798 French expedition brought scholars as well as soldiers, and the multi-volume Description de l'Égypte that followed put accurate images of Egyptian monuments in front of European readers for the first time. Furniture, architecture and interiors absorbed it almost immediately. Champollion's decipherment in 1822 turned fascination into a field."
      ),
      h2("1869: The Canal"),
      p(
        "The opening of the Suez Canal made Egypt a fixture of European attention and travel. Verdi's Aida was commissioned in connection with the new Cairo opera house and premiered there in 1871 — an Italian opera about ancient Egypt, staged in modern Egypt, for an audience arriving on the new steamship routes. Organised tourism to Egypt dates from roughly this moment."
      ),
      callout(
        "Every wave has been set off by an event rather than by a change in taste: a conquest, a canal, a tomb, an exhibition. Egyptian style does not gradually come back into fashion — something happens, and it returns all at once.",
        { title: "The Pattern", tone: "Highlight" }
      ),
      h2("1922: The Tomb"),
      p(
        "Howard Carter opened Tutankhamun's tomb into a world with mass-circulation newspapers and photography, and the result was the largest of all the revivals. Within a few years the motifs were in fashion, jewellery, packaging, and above all architecture — the Egyptian strand of Art Deco runs through cinemas, department stores and apartment buildings across Europe and America, and many of them are still standing."
      ),
      h2("And Since"),
      ...bullets([
        "The Treasures of Tutankhamun touring exhibitions of the 1960s and 70s drew enormous crowds and set off a second, smaller wave",
        "The 1990s brought Egypt back through film and television, with a distinctly supernatural slant that has proved hard to dislodge",
        "Las Vegas built a black glass pyramid with a beam from its apex, which is either the low point or the logical conclusion",
        "Museum openings and major exhibitions continue to produce reliable spikes of interest",
      ]),
      h2("Why It Matters When You Visit"),
      p(
        "Most visitors arrive carrying two centuries of accumulated imagery — curses, secret chambers, a general atmosphere of the occult. Almost none of it comes from Egypt. It comes from Rome, from Paris, from Hollywood. The actual sites are stranger and more concrete than the borrowed version: administrative, bureaucratic, obsessed with agriculture and record-keeping. Letting go of the revival is what lets the real thing land."
      ),
      faq(
        [
          { question: "What is Egyptomania?", answer: "The recurring Western fascination with ancient Egyptian imagery and design, running from Roman times to the present, and expressed in architecture, fashion, film and decorative arts." },
          { question: "What caused the 1920s Egyptian revival?", answer: "The opening of Tutankhamun's tomb in 1922, reported worldwide through mass newspapers and photography. Its motifs fed directly into Art Deco architecture and design." },
          { question: "Why are there Egyptian obelisks in Rome?", answer: "The Romans transported obelisks from Egypt after annexing it and re-erected them in the city. Rome holds more standing ancient obelisks than Egypt itself." },
          { question: "Is the mummy's curse a real Egyptian belief?", answer: "No. It is a modern invention, popularised by press coverage after 1922 and by fiction and film since. Egyptian tomb inscriptions include warnings, but nothing resembling the curse of popular culture." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Egypt is the only ancient culture the modern world keeps redecorating with. That is a compliment of a sort, and it is also why so many first-time visitors are quietly surprised by what is actually there."
      ),
      cta({
        title: "See the Original",
        body: "The objects that set off two centuries of imitation, in the collections they were excavated into.",
        buttonLabel: "See the museum tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
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
    slug: "jarre-pyramids-millennium-concert",
    title: "The Night the Millennium Was Rung In at the Foot of the Pyramids",
    category: "History & Culture",
    tags: ["Jean-Michel Jarre", "Giza", "Concerts", "Millennium", "Modern Egypt"],
    author: editorialTeam,
    excerpt:
      "On 31 December 1999, Jean-Michel Jarre staged a concert on the Giza plateau to carry the world into the new millennium. It was not the first spectacle at the pyramids and it will not be the last.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1667765460178-db9eae077f00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "Jean-Michel Jarre pyramids concert",
    secondaryKeywords: ["millennium concert Giza", "concerts at the pyramids", "Twelve Dreams of the Sun", "events at Giza plateau"],
    relatedTours: toursBySlug("giza-pyramids-sound-and-light-show", "1-day-giza-tour"),
    seoTitle: "Jean-Michel Jarre's Millennium Concert at the Pyramids",
    seoDescription:
      "The Twelve Dreams of the Sun, staged on the Giza plateau on 31 December 1999 — and the longer history of using the pyramids as the world's most demanding stage.",
    body: [
      p(
        "There were a great many millennium events, and almost none of them are remembered. The exception is the one staged in front of the pyramids, partly because of what was performed and mostly because of where."
      ),
      h2("The Twelve Dreams of the Sun"),
      p(
        "Jean-Michel Jarre had spent two decades making a speciality of enormous outdoor spectacles at landmarks — vast crowds, projection onto buildings, lasers, fireworks synchronised to electronic music. Giza on the last night of 1999 was the logical destination for that career. The piece was built around the passage of a night into a new day, timed so that the music ran through midnight and towards the sunrise behind the plateau."
      ),
      p(
        "Reported attendance figures for that night vary enormously depending on the source, which is normal for open-desert events, so treat any precise number you read with caution. What is not in dispute is the setting: monuments four and a half thousand years old lit from the ground, and an audience out on the sand in front of them."
      ),
      h2("Giza Has Always Been a Stage"),
      ...bullets([
        "The Sound & Light Show has projected narration and light onto the same monuments every night since 1961",
        "Verdi's Aida, written in connection with the opening of the Suez Canal era and premiered in Cairo in 1871, established the template of grand performance built around Egyptian setting",
        "The pyramids have hosted concerts, festivals and broadcast events repeatedly since, and continue to",
        "The plateau's appeal to producers is obvious and unusual: a backdrop that needs no set, no lighting rig behind it, and no explanation",
      ]),
      callout(
        "Staging anything at Giza involves the Ministry of Tourism and Antiquities and strict conditions on what may be attached to, aimed at or built near the monuments. The constraints are why these events are rare, and why each one becomes a marker in Egypt's modern cultural history.",
        { title: "Why It Doesn't Happen Often", tone: "Info" }
      ),
      h2("What It Says About the Place"),
      p(
        "There is something worth noticing in the choice. Asked to mark the turn of a millennium — a Western calendrical event with no Egyptian significance whatsoever — the instinct was to do it at Giza. The pyramids have become the world's default shorthand for deep time, so much so that a civilisation that had nothing to do with the Gregorian calendar ends up hosting its most-watched turning point."
      ),
      p(
        "Ramesses II would have understood the logic perfectly. Put the important thing where the monuments are, and let the monuments do the arguing."
      ),
      faq(
        [
          { question: "Who performed at the pyramids for the millennium?", answer: "Jean-Michel Jarre staged The Twelve Dreams of the Sun on the Giza plateau on 31 December 1999, running through midnight and towards sunrise." },
          { question: "Are concerts held at the pyramids?", answer: "Yes, though rarely. Events at Giza require approval from Egypt's antiquities authorities and operate under strict conditions on what can be built or aimed at the monuments." },
          { question: "Can you see the pyramids lit up at night?", answer: "Yes — the Sound & Light Show has run at Giza since 1961 and projects light and narration onto the Sphinx and the pyramids every evening." },
          { question: "How many people attended the millennium concert?", answer: "Reported figures vary widely between sources, as they usually do for open-desert events. No single number is reliably established." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Whatever you make of the music, the choice of venue was correct. Nowhere else on earth makes a thousand years feel like a short interval."
      ),
      cta({
        title: "See Giza After Dark",
        body: "The nightly Sound & Light Show — the permanent version of what draws producers to the plateau.",
        buttonLabel: "See the evening tour",
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
