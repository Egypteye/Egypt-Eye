import type { Story } from "../types";
import { authors } from "../authors";
import { tours } from "../tours";
import { p, h2, bullets, callout, faq, cta } from "../storyBlocks";

const editorialTeam = authors[0];

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

// World-trends cohort, batch 7 of 10: humanoid robots, robots in
// everyday life, longevity technology, brain-computer interfaces, and
// gene editing. Facts (2026 humanoid robot deployments, CES 2026 home
// robots, longevity biotech trials, Neuralink's 2026 status, CRISPR
// approvals and trials) were verified via web search at the time of
// writing — see contentReviewDate on each story. The gene-editing piece
// handles the 2010 JAMA Tutankhamun genetic study factually and without
// sensationalizing the inbreeding findings.

export const stories: Story[] = [
  {
    status: "published",
    featured: false,
    slug: "ushabti-figures-egypt",
    title: "Ushabti: The Little Figures Buried to Do Your Work Forever",
    category: "History & Culture",
    tags: ["Ushabti", "Shabti", "Book of the Dead", "Egyptian Museum", "Burial"],
    author: editorialTeam,
    excerpt:
      "The small mummiform figures in every museum case are not idols or portraits. They are substitute labourers, inscribed with the spell that makes them answer when the afterlife calls your name.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1568366715736-cf1bb3ea5a4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "ushabti",
    secondaryKeywords: ["what are shabti figures", "ushabti meaning", "Egyptian tomb figures", "Tutankhamun shabti"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour", "luxor-museum-mummification-museum-tour"),
    seoTitle: "Ushabti Figures: What They Were Actually For",
    seoDescription:
      "The mummiform servant figures buried in Egyptian tombs, the spell inscribed on them, why sets ran to 401, and what they tell you about the afterlife Egyptians expected.",
    body: [
      p(
        "Every Egyptian collection has a case of them: small standing figures, wrapped like mummies, arms crossed, often blue-green faience, sometimes hundreds together. Most visitors read them as idols or as portraits of the dead. They are neither. They are staff."
      ),
      h2("The Problem They Solved"),
      p(
        "The Egyptian afterlife was an idealised Egypt — fields, a river, a harvest. That is a pleasant prospect until you remember that fields in Egypt meant conscripted labour: clearing irrigation canals, moving sand, working the land when the state called you up. The Field of Reeds came with the same obligations."
      ),
      p(
        "The solution was to send a workforce. A ushabti was a substitute body, animated on demand, that would step forward and take the summons in your place."
      ),
      h2("The Spell"),
      p(
        "Most carry a version of chapter six of the Book of the Dead, inscribed down the front. It addresses the figure directly: if the deceased is called on to do any work in the realm of the dead — to cultivate the fields, to fill the canals with water, to carry sand from east to west — the figure is to say \"here I am\" and do it. The name ushabti is usually connected to a verb meaning to answer. They are, quite literally, the answerers."
      ),
      callout(
        "A full set is 401 figures: one worker for each day of the year, plus thirty-six overseers, one for every ten workers. It is a management structure, buried. Tutankhamun was sent with over four hundred.",
        { title: "Why 401", tone: "Info" }
      ),
      h2("How to Read Them in a Case"),
      ...bullets([
        "Look for the tools — many hold hoes, picks and a basket slung over the shoulder, which is the giveaway that this is agricultural labour",
        "Overseer figures are often dressed differently, in the kilt of a living Egyptian rather than mummy wrappings, and carry a whip",
        "The material tells you about the owner: royal and elite figures in stone, faience or wood; cheaper burials with crude, hastily moulded ones",
        "The inscription usually names the owner, which is how museums attribute isolated figures to specific tombs",
      ]),
      h2("What They Are Evidence Of"),
      p(
        "Ushabti are one of the clearest windows onto ordinary Egyptian expectations. They tell you the afterlife was understood as a real place with a real economy, that the state's demands were expected to follow you into it, and that people prepared for that eventuality with exactly the practicality they applied to everything else. Whole workshops existed to produce them, at every price point."
      ),
      faq(
        [
          { question: "What is a ushabti?", answer: "A small mummiform figure buried with the dead to perform agricultural labour on their behalf in the afterlife. The name is generally connected to a verb meaning to answer." },
          { question: "What is written on ushabti figures?", answer: "Usually a version of chapter six of the Book of the Dead, instructing the figure to answer and carry out any labour demanded of its owner in the realm of the dead." },
          { question: "How many ushabti were buried with a person?", answer: "It varied enormously. A full set is 401 — one worker per day of the year plus thirty-six overseers — but many burials contained only a handful, and poorer ones none." },
          { question: "Are ushabti and shabti the same thing?", answer: "Broadly yes. Shabti, shawabti and ushabti are terms used across different periods for figures serving the same purpose, and museums use them somewhat interchangeably." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "It is a very Egyptian solution: not to argue that eternity should be free of obligations, but to bring enough labour to cover them."
      ),
      cta({
        title: "See Them in Person",
        body: "The Cairo collections hold ushabti from royal and ordinary burials alike — the contrast between them is the interesting part.",
        buttonLabel: "See the museum tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
      }),
    ],
  },

  {
    status: "archived",
    featured: false,
    slug: "robots-everyday-life-2026-shaduf-oldest-labor-saving-device",
    title: "Home Robots Are Learning to Do Your Laundry in 2026. Egypt's Oldest Labor-Saving Machine Is Still Working Today.",
    category: "Tech & AI",
    tags: ["Home Robots", "Consumer Robotics", "Shaduf", "Ancient Egypt", "Nile Irrigation"],
    author: editorialTeam,
    excerpt:
      "LG's CLoiD empties the dishwasher, SwitchBot's Onero H1 folds laundry, and 1X's NEO ships to US homes in 2026. Egypt's shaduf, a simple lever irrigation device roughly 4,000 years old, is still doing its original job today, unmodified.",
    imageTone: "nile",
    image: "https://images.unsplash.com/photo-1711278265096-d54515b78257?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "robots everyday life 2026",
    secondaryKeywords: ["home robots 2026", "1X NEO robot", "shaduf irrigation", "oldest labor-saving device"],
    seoTitle: "Home Robots in 2026, and Egypt's Still-Working 4,000-Year-Old Machine",
    seoDescription:
      "LG's CLoiD, SwitchBot's Onero H1, and 1X's NEO are bringing chore-doing robots into 2026 homes. Egypt's shaduf, a roughly 4,000-year-old irrigation lever, is likely the oldest labor-saving machine still doing its original job.",
    body: [
      p(
        "Home robotics moved from passive automation toward genuine physical action in 2026, most visibly at CES. LG's CLoiD empties dishwashers, folds laundry, and handles light cooking tasks. SwitchBot's Onero H1 navigates homes, grasps objects, and performs chores like filling coffee machines and organizing clothes. 1X's NEO robot, priced at $20,000 to own or $499 a month, began US deliveries in 2026, and Samsung's rolling Ballie robot is slated for a mid-to-late 2026 launch."
      ),
      h2("What's Actually Landing in Homes in 2026"),
      ...bullets([
        "The clearest shift is from passive assistance (a robot vacuum) toward genuine physical action — machines that clean, fold, and cook rather than just automate",
        "Industry analysts describe 2026 as \"the first real consumer-entry point, not mass adoption\" — the robots genuinely helping people today are mostly specialized single-task machines (vacuuming, mopping, mowing), not general-purpose humanoids",
        "Adoption is concentrated in the US and Europe, driven partly by aging populations and rising demand for convenience at home",
      ]),
      callout(
        "The honest 2026 assessment from robotics analysts: specialized, narrowly-focused robots are winning over general-purpose humanoid helpers, at least for now — a single machine that reliably does one job beats an impressive robot that does many jobs unreliably.",
        { title: "Specialized Beats General-Purpose, For Now", tone: "Info" }
      ),
      h2("Egypt's Labor-Saving Machine Has Been Running for About 4,000 Years"),
      p(
        "The shaduf is about as simple as machines get: a long pole balanced on a post, a bucket on one end and a counterweight on the other, letting one person lift water from the Nile to irrigate fields at a fraction of the effort manual carrying would take. It's attested in Egyptian art from at least the New Kingdom, roughly 3,500 years ago, and possibly earlier — and remarkably, it's still in active daily use today by farmers along parts of the Nile and across other parts of the region, doing precisely the job it was built for, unmodified."
      ),
      p(
        "That makes the shaduf a strong candidate for the oldest continuously-used labor-saving machine on Earth still performing its original function."
      ),
      h2("Different Century, Same Practical Test"),
      p(
        "The honest test for a 2026 home robot isn't how impressive its demo looks — it's whether it reliably performs the one specific chore it's built for, day after day, without constant human intervention. That's the exact test the shaduf has been passing for roughly four thousand years running. It's a genuinely useful reality check on the gap between an impressive robot demo and a machine that's still quietly doing its job a very long time later."
      ),
      faq(
        [
          {
            question: "What home robots launched in 2026?",
            answer:
              "Notable 2026 home robots include LG's CLoiD (dishwasher emptying, laundry folding, light cooking), SwitchBot's Onero H1 humanoid robot, 1X's NEO ($20,000 or $499/month, US deliveries starting 2026), and Samsung's rolling Ballie robot.",
          },
          {
            question: "What is a shaduf?",
            answer:
              "A simple counterweighted lever device used to lift water from the Nile for irrigation, attested in Egyptian art from at least the New Kingdom period (roughly 3,500 years ago) and still in active daily use by farmers in parts of Egypt today.",
          },
          {
            question: "Are home robots widely adopted in 2026?",
            answer:
              "Not yet at mass-market scale — industry analysts describe 2026 as the first real consumer-entry point rather than mass adoption, with specialized single-task robots (vacuums, mops, mowers) still outperforming general-purpose humanoid helpers in real households.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Every 2026 home robot demo is chasing the same basic promise a simple wooden lever on the Nile has already kept, uninterrupted, for roughly four thousand years."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "ancient-egyptian-afterlife-beliefs",
    title: "What the Egyptians Actually Believed Happened After You Died",
    category: "History & Culture",
    tags: ["Afterlife", "Book of the Dead", "Field of Reeds", "Maat", "Ancient Egypt"],
    author: editorialTeam,
    excerpt:
      "Not a heaven, and not a reward for faith. The Egyptian afterlife was a place you could fail to reach — through a judgement, a set of passwords, and a monster waiting beside the scales.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1590133324192-1df305deea6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "ancient Egyptian afterlife",
    secondaryKeywords: ["weighing of the heart", "Field of Reeds", "Book of the Dead", "Egyptian gods of the dead"],
    relatedTours: toursBySlug("luxor-west-bank-day-tour", "valley-of-the-kings-hatshepsut-temple-tour"),
    seoTitle: "The Ancient Egyptian Afterlife, Explained",
    seoDescription:
      "The ka, the ba and the akh, the weighing of the heart against the feather of Maat, and the Field of Reeds — what Egyptians expected after death, and why it changes how tombs read.",
    body: [
      p(
        "Walk into a decorated tomb without knowing what the Egyptians expected to happen after death and the paintings are beautiful nonsense. Know the outline and every wall turns into instructions."
      ),
      h2("A Person Was Several Things"),
      ...bullets([
        "The body — which had to survive, because the other parts needed somewhere to return to",
        "The ka, a life force that came into being with you and needed sustaining after death, which is what the food offerings in tombs are for",
        "The ba, closest to what we would call personality, shown as a bird with a human head, able to leave the tomb by day",
        "The akh, the transfigured, effective spirit a person became if everything went right",
        "The name, which had to keep being spoken — erasing someone's name from a monument was an attempt to end them",
      ]),
      h2("The Judgement"),
      p(
        "The dead were brought before Osiris, and the heart — kept in the body precisely for this — was placed on a scale against a feather representing Maat: truth, order, the way things should be. Anubis worked the balance. Thoth recorded the result. Crouching beside the scales was Ammit, part crocodile, part lion, part hippopotamus, waiting to eat the hearts that failed."
      ),
      p(
        "A failed judgement did not mean punishment in an afterlife. It meant no afterlife at all — the second death, annihilation. That is the threat the whole funerary industry existed to avert."
      ),
      callout(
        "Spell 30B of the Book of the Dead is addressed to the deceased's own heart, asking it not to speak against him in the hall of judgement. It was inscribed on scarab amulets placed over the chest. The Egyptians were not confident the heart would lie for them.",
        { title: "A Word With Your Own Heart", tone: "Info" }
      ),
      h2("What the Book of the Dead Actually Is"),
      p(
        "Not a book and not a scripture. It is a loose collection of spells, drawn from a much older tradition, copied onto papyrus and buried with the dead — closer to a phrasebook and route guide than to a holy text. Different people bought different selections. Spells identify the gatekeepers, supply the correct answers, protect against dangers along the way, and ensure the deceased can eat, drink, breathe and move."
      ),
      h2("Where You End Up"),
      p(
        "The Field of Reeds — Aaru — is the destination, and it is strikingly unmystical: an idealised Egypt, with a river, fields, a good harvest, a house, family. Not transcendence. The same life, without the interruptions. Which is also why ushabti figures were buried in such numbers, since even paradise came with agricultural labour to be done."
      ),
      faq(
        [
          { question: "What was the weighing of the heart?", answer: "The judgement of the dead, in which the heart was weighed against the feather of Maat before Osiris. Anubis operated the scales, Thoth recorded the verdict, and the monster Ammit devoured hearts that failed." },
          { question: "What is the Field of Reeds?", answer: "Aaru, the Egyptian afterlife — an idealised version of Egypt itself, with fields, a river and family, rather than a spiritual paradise." },
          { question: "Is the Book of the Dead a religious book?", answer: "No. It is a collection of spells copied onto papyrus and buried with the dead, functioning as a practical guide to navigating the afterlife. Selections varied from person to person." },
          { question: "What happened if you failed the judgement?", answer: "Not punishment but annihilation — the second death. The heart was eaten and the person ceased to exist, which is what the entire funerary apparatus was designed to prevent." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "It is a system built by people who liked their lives and wanted them to continue. Every tomb you walk into was a bet that the arrangements would hold."
      ),
      cta({
        title: "Read the Walls Yourself",
        body: "The Valley of the Kings and the West Bank tombs, with a guide who translates the scenes rather than just naming them.",
        buttonLabel: "See the West Bank tour",
        buttonHref: "/tours/luxor-west-bank-day-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "how-mummification-worked",
    title: "Mummification, Step by Step — and Why the Brain Was Thrown Away",
    category: "History & Culture",
    tags: ["Mummification", "Canopic Jars", "Natron", "Ancient Egypt", "Burial"],
    author: editorialTeam,
    excerpt:
      "Seventy days, a great deal of natron, and a set of decisions about which parts of a person mattered. The Egyptians kept the liver, lungs, stomach and intestines. They discarded the brain.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1608817576203-3c27ed168bd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "how mummification worked",
    secondaryKeywords: ["Egyptian mummification process", "canopic jars", "why did Egyptians remove the brain", "natron mummification"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour", "luxor-museum-mummification-museum-tour"),
    seoTitle: "How Egyptian Mummification Actually Worked",
    seoDescription:
      "The seventy-day process, what natron did, which organs went into canopic jars, why the heart stayed and the brain did not — and where to see the evidence in Egypt.",
    body: [
      p(
        "Mummification was not a mystical rite performed in secret. It was a trade, with price tiers, a standard timetable and a workshop, and it ran in Egypt for well over three thousand years. What it preserved, and what it threw out, tells you exactly what the Egyptians thought a person was made of."
      ),
      h2("Why Preserve the Body at All"),
      p(
        "Egyptian belief held that a person was several things at once: the body, the ka or life force, the ba — roughly the personality, shown as a bird with a human head — and the akh, the transfigured being that survives. The ba travelled by day and returned to the body at night. If the body was gone, it had nothing to return to. Preservation was not sentiment; it was the physical requirement for continued existence."
      ),
      h2("The Process"),
      ...bullets([
        "The brain was removed first, usually through the nose using a hooked instrument, and discarded",
        "An incision in the left side of the abdomen allowed the lungs, liver, stomach and intestines to be taken out, dried separately and placed in four canopic jars",
        "The heart was left in the body — it was the seat of intelligence, memory and character, and would be needed at judgement",
        "The body cavity was cleaned, packed and covered in natron, a naturally occurring salt from Wadi Natrun that draws out moisture; this stage took around forty days",
        "The dried body was oiled, resinated, padded to restore its shape, and wrapped in linen with amulets set between the layers",
        "The whole sequence conventionally took seventy days from death to burial",
      ]),
      callout(
        "Canopic jars have four lids because the organs were placed under the protection of the four sons of Horus: Imsety guarded the liver, Hapy the lungs, Duamutef the stomach and Qebehsenuef the intestines. It is the earliest system of labelled organ storage anyone devised.",
        { title: "Why Four Jars", tone: "Info" }
      ),
      h2("The Brain"),
      p(
        "The organ modern readers find hardest to explain away is the one the Egyptians simply removed and did not keep. There is no jar for it, no protective deity, no spell for its preservation. The heart, by contrast, is everywhere in the funerary literature — weighed against the feather of Maat, protected by amulets, addressed directly in spells warning it not to testify against its owner."
      ),
      p(
        "The Egyptians located thought, memory, emotion and moral character in the heart. On that model the brain was packing material, and there was no more reason to keep it than the fluid drained from the body cavity. They were wrong about the anatomy and entirely consistent about the theology."
      ),
      h2("Not Everyone Got the Same Treatment"),
      p(
        "Herodotus, writing in the fifth century BC, describes three grades of service at very different prices — the full procedure for those who could afford it, a cheaper version using injected oils to dissolve the organs in place, and a basic cleansing and drying for the poor. The archaeological record broadly supports the existence of tiers. Most Egyptians were never mummified at all."
      ),
      faq(
        [
          { question: "How long did mummification take?", answer: "Conventionally seventy days from death to burial, with around forty of those spent drying the body in natron." },
          { question: "Why did Egyptians remove the brain?", answer: "They believed thought, memory and character resided in the heart. The brain had no role in that model, so it was extracted — usually through the nose — and discarded rather than preserved." },
          { question: "What went in canopic jars?", answer: "The lungs, liver, stomach and intestines, each under the protection of one of the four sons of Horus. The heart stayed in the body." },
          { question: "What is natron?", answer: "A naturally occurring mixture of sodium salts, collected from places such as Wadi Natrun, used to draw moisture out of the body. It was the essential preservative in the process." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Everything about the process points at one conclusion: they were not preserving a corpse, they were maintaining an address. The body had to remain recognisable so that the parts of the person still in motion could find their way back to it."
      ),
      cta({
        title: "See the Real Thing",
        body: "The Mummification Museum in Luxor and the Cairo collections hold the tools, the jars and the results.",
        buttonLabel: "See the Luxor museums tour",
        buttonHref: "/tours/luxor-museum-mummification-museum-tour",
      }),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "tutankhamun-dna-family-tree",
    title: "What Tutankhamun's DNA Revealed About His Family — and His Death",
    category: "History & Culture",
    tags: ["Tutankhamun", "Akhenaten", "Valley of the Kings", "Egyptian Museum", "Archaeology"],
    author: editorialTeam,
    excerpt:
      "A 2010 genetic study put names to the mummies around Tutankhamun, identified his likely parents, and found malaria in his bloodstream. It also started an argument that has not finished.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1568366715736-cf1bb3ea5a4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-06-01",
    primaryKeyword: "Tutankhamun DNA",
    secondaryKeywords: ["Tutankhamun family tree", "who were Tutankhamun's parents", "how did Tutankhamun die", "Tutankhamun mummy study"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour", "luxor-west-bank-day-tour"),
    seoTitle: "Tutankhamun's DNA: His Parents, His Health, His Death",
    seoDescription:
      "The 2010 study that tested Tutankhamun and ten related mummies — what it concluded about his parentage, his club foot and the malaria in his system, and what Egyptologists still dispute.",
    body: [
      p(
        "Tutankhamun was a minor king who died young and would be a footnote if his tomb had been robbed like all the others. Because it was not, he is the most examined human being from the ancient world — and in 2010 a team led by Zahi Hawass published the results of testing his mummy and ten others for DNA and disease. It is still the most consequential thing anyone has done with an Egyptian mummy."
      ),
      h2("What the Study Found"),
      ...bullets([
        "The mummy from tomb KV55 was identified as Tutankhamun's father — most likely Akhenaten, the king who moved Egypt's religion to a single sun god",
        "A mummy known as the Younger Lady, from a cache in KV35, was identified as his mother — and as a full sister of his father",
        "Tutankhamun had a badly deformed left foot, along with bone tissue that had died from lack of blood supply, which explains the walking sticks buried with him",
        "DNA from Plasmodium falciparum, the parasite that causes the most dangerous form of malaria, was present in his body",
        "The two mummified foetuses found in his tomb were confirmed as his daughters",
      ]),
      p(
        "The picture that emerges is not the golden boy king of the exhibition posters. It is a teenager who could not walk unaided, from a family that had been marrying within itself for generations, carrying a serious infection when he died at around nineteen."
      ),
      callout(
        "The walking sticks in the tomb had been read for decades as symbols of authority. The scan and the DNA together suggest a far more ordinary explanation: he needed them.",
        { title: "The Sticks Were Not Ceremonial", tone: "Info" }
      ),
      h2("What Is Still Argued About"),
      p(
        "Ancient DNA is difficult, and Egyptian mummies are among the hardest material to work with — heat, natron and three thousand years degrade genetic material badly, and modern contamination is a constant risk. Several specialists have questioned whether the sequences were robust enough to support the family identifications, and whether the KV55 mummy is Akhenaten at all rather than another royal male of the period."
      ),
      p(
        "The malaria finding has been challenged on similar grounds, and the cause of death remains open: a leg fracture shortly before death, an inherited disorder, the infection, or some combination. What is not seriously disputed any more is the older theory that he was murdered by a blow to the head — the damage behind the skull is now generally attributed to the embalming process and to Howard Carter's team removing the mummy from its resin-fused coffin."
      ),
      h2("Where to See the Evidence"),
      ...bullets([
        "Tutankhamun's own mummy remains in his tomb, KV62, in the Valley of the Kings — the only king still lying where he was buried",
        "The tomb goods, including the walking sticks and the golden mask, are the centrepiece of the Grand Egyptian Museum collection",
        "The royal mummies from the KV35 cache, including the Younger Lady, are displayed in Cairo",
      ]),
      faq(
        [
          { question: "Who were Tutankhamun's parents?", answer: "The 2010 study identified the KV55 mummy as his father, most likely Akhenaten, and the Younger Lady from the KV35 cache as his mother — who was also a full sister of his father. Both identifications remain debated among specialists." },
          { question: "How did Tutankhamun die?", answer: "There is no settled answer. The 2010 study found malaria parasites and severe bone disease in his foot, and a leg fracture shortly before death has been proposed as a contributing factor. The old murder theory is no longer widely held." },
          { question: "Did Tutankhamun have a club foot?", answer: "Yes. Imaging showed a deformed left foot with bone tissue that had died from lack of blood supply, consistent with the 130 walking sticks buried with him." },
          { question: "Can you see Tutankhamun's mummy?", answer: "Yes — it remains in tomb KV62 in the Valley of the Kings, the only pharaoh still in his own burial chamber. His grave goods are displayed in Cairo." },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Nothing else in Egyptology gives you a person this precisely: parentage, illnesses, the shape of a foot, the parasite in the blood. It is also a reminder of how little we know about everyone else."
      ),
      cta({
        title: "See the Tomb and the Treasures",
        body: "The Valley of the Kings and the Cairo collections, on a private itinerary that gives both the time they need.",
        buttonLabel: "See Luxor West Bank tours",
        buttonHref: "/tours/luxor-west-bank-day-tour",
      }),
    ],
  },
];
