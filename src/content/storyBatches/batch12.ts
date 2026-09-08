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
    slug: "humanoid-robots-2026-ushabti-ancient-labor-figures",
    title: "Humanoid Robots Are Entering Factories in 2026. Egypt Buried an Army of Labor Robots 3,000 Years Ago.",
    category: "Tech & AI",
    tags: ["Humanoid Robots", "Tesla Optimus", "Figure AI", "Ushabti", "Ancient Egypt"],
    author: editorialTeam,
    excerpt:
      "Tesla's Optimus and Figure's humanoid robots are moving from demo to factory floor in 2026. Ancient Egypt mass-produced its own answer to the same idea — manufactured figures built specifically to labor autonomously — by the thousand.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1757927325524-ed1f9cc75e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "humanoid robots 2026",
    secondaryKeywords: ["Tesla Optimus 2026", "Figure AI robot", "ushabti figurines", "Tutankhamun tomb objects"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour"),
    seoTitle: "Humanoid Robots in 2026, and Egypt's 3,000-Year-Old Labor Figures",
    seoDescription:
      "Tesla Optimus and Figure's humanoid robots are moving into real factory work in 2026. Ancient Egypt mass-produced ushabti — figures built to labor autonomously — by the thousand, three millennia earlier.",
    body: [
      p(
        "Humanoid robots moved from stage demo toward real deployment in 2026. Tesla has over a thousand Optimus units in testing across its Fremont, Austin, and Berlin facilities, though Elon Musk has acknowledged they aren't yet doing materially useful work. Figure AI's Figure 03 has logged more than 30,000 work cycles at BMW's Spartanburg plant, and the company's valuation has reportedly reached $39 billion. Goldman Sachs projects the humanoid robot market could reach $38 billion by 2035."
      ),
      h2("Where Humanoid Robots Actually Stand in 2026"),
      ...bullets([
        "Tesla is running large-scale real-world testing of Optimus across three major facilities, with the company itself acknowledging the robots aren't yet performing materially useful factory work",
        "Figure AI's humanoid robot has logged tens of thousands of real work cycles in an actual BMW production environment, a genuinely significant proof point beyond a controlled demo",
        "Analysts project a market in the tens of billions of dollars within a decade, reflecting real investment even as consumer-ready, broadly capable humanoid robots remain years away",
      ]),
      callout(
        "The core premise behind every humanoid robot program in 2026 is identical: build a manufactured, humanlike figure that performs physical labor autonomously so a person doesn't have to. That premise is not new.",
        { title: "The Idea Behind the Hardware", tone: "Info" }
      ),
      h2("Egypt Buried an Army of Autonomous Laborers, by the Thousand"),
      p(
        "Ancient Egypt organized a massive, centuries-long manufacturing effort around exactly that premise — not with actuators, but with magic. Ushabti were small servant figurines placed in tombs, specifically inscribed with a spell (recorded as Chapter 6 of the Book of the Dead) commanding them to magically come to life and perform manual labor — plowing fields, digging canals, carrying burdens — on behalf of the deceased in the afterlife, so the person buried wouldn't have to do that work themselves. When called upon, the figure was meant to answer \"here I am\" and take up the task."
      ),
      p(
        "Tutankhamun's tomb alone contained 413 individual ushabti figures, plus an additional 71 overseer figures to supervise them — a fully staffed labor force, manufactured specifically to work autonomously on command, buried with a single teenage pharaoh. Across ancient Egypt more broadly, ushabti were produced by the millions over more than a thousand years, an entire dedicated industry built around one purpose: making a manufactured figure do the work a person didn't want to do."
      ),
      h2("Same Basic Premise, Completely Different Century"),
      p(
        "What's different in 2026 is the mechanism, not the ambition. Tesla and Figure are trying to make the premise literally, physically true — actuators, cameras, and neural networks standing in for a spell — but the underlying goal is the same one ancient Egypt organized a massive religious-industrial supply chain around: manufacture a helper that performs physical labor autonomously, so a human doesn't have to. It took three thousand years to get from a spell to a working prototype, but the ambition never changed."
      ),
      faq(
        [
          {
            question: "How many Tesla Optimus robots are currently deployed?",
            answer:
              "Tesla has over 1,000 Optimus units in testing across its Fremont, Austin, and Berlin facilities as of 2026, though the company has acknowledged the robots aren't yet performing materially useful factory work at scale.",
          },
          {
            question: "What are ushabti figurines?",
            answer:
              "Small ancient Egyptian funerary figurines placed in tombs and inscribed with a spell commanding them to magically labor on behalf of the deceased in the afterlife. Tutankhamun's tomb contained 413 ushabti plus 71 overseer figures.",
          },
          {
            question: "How far along is Figure AI's humanoid robot in real-world use?",
            answer:
              "Figure's Figure 03 robot has logged over 30,000 work cycles in an actual production environment at BMW's Spartanburg plant, one of the more significant real-world proof points for humanoid robots as of 2026.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "A carved figure meant to work by magic and a robot meant to work by motors and machine learning are separated by three thousand years and almost nothing else — the same very old idea, still being built."
      ),
      cta({
        title: "See the Originals",
        body: "Tutankhamun's own ushabti figures and the treasures buried alongside them — on display in Cairo.",
        buttonLabel: "See the Egyptian Museum Tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
      }),
    ],
  },

  {
    status: "published",
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
    slug: "longevity-technology-2026-egypt-defeat-death-ambition",
    title: "Longevity Biotech Wants to Rewrite Aging in 2026. Egypt Built an Entire Civilization Around the Same Ambition.",
    category: "Wellness & Longevity",
    tags: ["Longevity", "Biotech", "Anti-Aging", "Ancient Egypt Medicine", "Mummification"],
    author: editorialTeam,
    excerpt:
      "Epigenetic reprogramming trials and a longevity market headed toward $420 billion define 2026's anti-aging science. Egypt organized its entire civilization — medicine, religion, and a colossal funerary industry — around a version of the exact same refusal to accept death.",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1757927325474-17b89634e7ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-02-01",
    primaryKeyword: "longevity technology 2026",
    secondaryKeywords: ["epigenetic reprogramming 2026", "longevity biotech market", "Ebers Papyrus", "ancient Egyptian mummification"],
    seoTitle: "Longevity Science in 2026, and Egypt's Civilizational Answer to Death",
    seoDescription:
      "2026's longevity biotech — epigenetic reprogramming, senolytics, a market headed toward $420 billion — treats aging as solvable. Ancient Egypt organized an entire civilization around the identical underlying ambition.",
    body: [
      p(
        "Longevity science moved further from lab curiosity toward real clinical territory in 2026. Epigenetic reprogramming — resetting cells to a more youthful state without erasing their identity — has entered human trials, with companies like Insilico Medicine and NewLimit reporting early-stage results. The broader longevity biotech market is projected to reach roughly $420 billion by 2030, reflecting serious capital betting that aging itself is a treatable process rather than an inevitability."
      ),
      h2("Where Longevity Science Actually Stands in 2026"),
      ...bullets([
        "Epigenetic reprogramming has moved into human clinical trials, including Phase 2a work targeting specific aging-related pathways",
        "Senolytics (drugs that clear aging, dysfunctional cells) and mitochondrial-focused therapies continue advancing through earlier-stage trials",
        "The longevity biotech market is projected to reach approximately $420 billion by 2030, a scale of investment that reflects genuine confidence rather than speculative fringe interest",
      ]),
      callout(
        "The underlying premise across nearly all of 2026's longevity biotech is the same: aging is not an inevitable, fixed fact of biology, but a process that can be intervened on directly, at the cellular and genetic level, if enough is understood and enough resources are applied.",
        { title: "The Premise Behind the Investment", tone: "Info" }
      ),
      h2("Egypt Organized an Entire Civilization Around the Identical Ambition"),
      p(
        "Egypt's medical tradition was genuinely advanced for its era. The Ebers Papyrus, dating to around 1550 BC, is one of the oldest and most comprehensive surviving medical texts in human history, containing hundreds of remedies, diagnoses, and treatments spanning nearly every part of the body. The Edwin Smith Papyrus, drawing on even earlier material, is considered the world's oldest known surgical trauma text — describing case-by-case clinical assessment centuries before that became standard medical practice anywhere else."
      ),
      p(
        "But Egypt's more famous, more totalizing answer to mortality wasn't a medical treatment at all — it was mummification, and the enormous funerary industry built around it: a sustained, technically sophisticated, centuries-spanning national effort specifically aimed at defeating the body's decay and making a version of the person persist indefinitely."
      ),
      h2("Different Theory of the Problem, Same Underlying Goal"),
      p(
        "2026's longevity biotech treats aging as a biological process to be intervened on directly at the cellular and genetic level. Ancient Egypt treated death as a transition to be technically managed through preservation and ritual, not a biological process to be solved at all — genuinely different theories of the problem, built on entirely different understandings of the body. But the underlying human ambition driving both, across roughly 3,500 years, is identical: refuse to accept that decline and death are simply things that happen to a body, and organize serious, sustained, technically demanding effort against them instead."
      ),
      faq(
        [
          {
            question: "What is epigenetic reprogramming?",
            answer:
              "A longevity science technique that resets cells to a more youthful epigenetic state — how genes are expressed — without erasing the cell's identity. It moved into human clinical trials in 2026, including Phase 2a studies from companies like Insilico Medicine.",
          },
          {
            question: "How big is the longevity biotech market projected to be?",
            answer:
              "Approximately $420 billion by 2030, reflecting substantial investor confidence that aging can be directly intervened on as a biological process rather than treated as an inevitable fact of life.",
          },
          {
            question: "What was the Ebers Papyrus?",
            answer:
              "One of the oldest and most comprehensive surviving medical texts in human history, dating to around 1550 BC, containing hundreds of ancient Egyptian remedies, diagnoses, and treatments across nearly every part of the body.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The tools, the theory, and the timescale are completely different. The refusal underneath them — that decline and death don't simply have to be accepted as they come — is the same one driving a 2026 biotech lab and a 3,500-year-old embalmer's workshop alike."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "brain-computer-interface-2026-egypt-discarded-brain",
    title: "Neuralink Is Reading Signals Straight From the Brain in 2026. Ancient Egypt Threw the Brain Away.",
    category: "Tech & AI",
    tags: ["Brain-Computer Interface", "Neuralink", "Mummification", "Ancient Egypt Medicine"],
    author: editorialTeam,
    excerpt:
      "Roughly 21 people across four countries are living with Neuralink implants in 2026, controlling cursors and games by thought alone. Ancient Egyptian embalmers, by contrast, considered the brain worthless — and threw it away.",
    imageTone: "luxor",
    image: "https://images.unsplash.com/photo-1718647405578-122282c93919?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-01-01",
    primaryKeyword: "brain-computer interface 2026",
    secondaryKeywords: ["Neuralink 2026", "PRIME study participants", "ancient Egypt mummification brain", "canopic jars"],
    seoTitle: "Brain-Computer Interfaces in 2026, and Ancient Egypt's Opposite Verdict",
    seoDescription:
      "Roughly 21 people are living with Neuralink implants in 2026, controlling devices by thought. Ancient Egyptian embalmers considered the brain the one organ not worth preserving — and threw it away during mummification.",
    body: [
      p(
        "Brain-computer interfaces reached a genuine, if still early, human-trial milestone in 2026. Roughly 21 participants across the US, UK, Canada, and UAE are living with Neuralink implants through the company's PRIME study, using them to control a cursor, play games, and browse the web by thought alone. High-volume production of the implant itself is underway in 2026, alongside moves toward more automated surgical placement — though no BCI device is yet commercially available to the public."
      ),
      h2("Where Brain-Computer Interfaces Actually Stand in 2026"),
      ...bullets([
        "Approximately 21 participants are living with Neuralink implants across four countries as part of ongoing clinical trials",
        "Participants have demonstrated cursor control, gameplay, and web browsing controlled entirely by neural signals",
        "High-volume implant production and steps toward more automated surgical implantation are underway, though commercial availability remains a future milestone",
      ]),
      callout(
        "Every serious BCI program in 2026 is built on the same starting premise: the brain is the single most information-rich organ in the human body, and reading its signals directly is worth genuinely invasive surgery to achieve.",
        { title: "The Premise Behind the Surgery", tone: "Info" }
      ),
      h2("Ancient Egypt Didn't Think the Brain Was Worth Keeping"),
      p(
        "During mummification, Egyptian embalmers carefully preserved the organs believed essential to a person's identity and continued existence in the afterlife — the heart above all, considered the actual seat of intelligence, emotion, and moral judgment, and the organ literally weighed against the feather of Ma'at in the Book of the Dead's judgment scene. The brain, by contrast, was considered functionally unimportant. It was removed and discarded, typically by inserting a hooked instrument through the nostril to break through the ethmoid bone and pull the tissue out in pieces — a genuinely well-documented embalming step, attested across multiple studied mummies."
      ),
      h2("The Same Organ, a Completely Reversed Verdict"),
      p(
        "It's about as sharp a historical contrast as exists for 2026's BCI technology: a civilization that built one of history's most sophisticated body-preservation industries around the specific, confident belief that the brain was the one organ not worth keeping, set against a modern technology built entirely around treating the brain as the single most valuable organ in the body — worth surgically wiring directly into. Same organ, completely opposite verdict, roughly three and a half thousand years apart."
      ),
      faq(
        [
          {
            question: "How many people have Neuralink implants in 2026?",
            answer:
              "Roughly 21 participants across the US, UK, Canada, and UAE are living with Neuralink implants as part of the ongoing PRIME study, using them to control cursors, play games, and browse the web by thought.",
          },
          {
            question: "Why did ancient Egyptians remove the brain during mummification?",
            answer:
              "They didn't consider it important to a person's identity or afterlife — that role was assigned to the heart, which was carefully preserved and weighed in the Book of the Dead's judgment scene. The brain was typically removed through the nose with a hooked instrument and discarded.",
          },
          {
            question: "Is a brain-computer interface commercially available in 2026?",
            answer:
              "No — as of 2026, Neuralink and similar BCI technologies remain in clinical trials with a limited number of participants; no BCI device is yet commercially available to the general public.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The organ hasn't changed in three and a half thousand years. What's changed completely is the verdict on whether it's worth keeping — and, in 2026, worth wiring directly into."
      ),
    ],
  },

  {
    status: "published",
    featured: false,
    slug: "gene-editing-2026-tutankhamun-dna-family-tree",
    title: "Gene Editing Reached New Precision in 2026. We Already Know Exactly How Egypt's Royal Bloodline Was Engineered.",
    category: "Science & Space",
    tags: ["Gene Editing", "CRISPR", "Tutankhamun DNA", "Ancient Egypt Genetics"],
    author: editorialTeam,
    excerpt:
      "CRISPR reached new precision in 2026, correcting single disease-causing mutations directly. A 2010 genetic study already mapped, with striking precision, how Egypt's royal family tried to engineer its own bloodline — and what it cost them.",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1757927325206-ca6f2d8a208b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    publishedAt: "2026-09-08T09:00:00+02:00",
    contentReviewDate: "2027-02-01",
    primaryKeyword: "gene editing 2026",
    secondaryKeywords: ["CRISPR 2026 approved therapies", "Tutankhamun DNA study", "ancient Egypt royal genetics", "base editing 2026"],
    relatedTours: toursBySlug("egyptian-museum-coptic-cairo-tour"),
    seoTitle: "Gene Editing in 2026, and What We Already Know About Egypt's Royal DNA",
    seoDescription:
      "CRISPR reached new precision in 2026, correcting single mutations directly. A 2010 JAMA study already mapped how Egypt's royal family engineered its bloodline through marriage — and the genetic cost it carried.",
    body: [
      p(
        "Gene editing crossed further into real, precise medical practice in 2026. Two CRISPR therapies are FDA-approved: Casgevy, for sickle cell disease and beta-thalassemia, and EDIT-101, for a form of inherited blindness. Late-stage trials are underway for hereditary angioedema, familial hypercholesterolemia, Huntington's disease, and Duchenne muscular dystrophy, and in 2025 clinicians developed a bespoke base-editing therapy for an infant with a rare genetic disease in just six months — directly correcting the specific mutation causing his condition, rather than simply disabling the affected gene."
      ),
      h2("Where Gene Editing Actually Stands in 2026"),
      ...bullets([
        "Two CRISPR therapies, Casgevy and EDIT-101, are FDA-approved and treating patients",
        "Late-stage trials are progressing for hereditary angioedema, familial hypercholesterolemia, Huntington's disease, Duchenne muscular dystrophy, and CAR-T cancer treatments",
        "A 2025 case demonstrated a bespoke, patient-specific base-editing therapy developed and delivered in six months — direct mutation correction rather than gene disruption",
        "Delivery breakthroughs are shrinking the editing proteins involved, expanding treatment beyond cells modified outside the body",
      ]),
      callout(
        "The defining shift in 2026's gene editing isn't that it exists — CRISPR therapies have been approved since 2023. It's the precision: correcting one specific harmful mutation directly, for one specific patient, rather than broadly disabling a gene and hoping for the best.",
        { title: "The Real 2026 Milestone: Precision, Not Novelty", tone: "Info" }
      ),
      h2("We Already Know, Precisely, How Egypt's Royal Bloodline Was Engineered"),
      p(
        "A landmark 2010 study published in JAMA used genetic fingerprinting on eleven New Kingdom royal mummies to construct a five-generation family tree of Tutankhamun's immediate lineage. It confirmed that Tutankhamun's parents were full siblings, both children of Pharaoh Amenhotep III and Queen Tiye — a deliberate outcome of the royal practice of sibling marriage, aimed at preserving what was considered a pure, semi-divine bloodline. The same study found evidence of malaria infection and a painful bone disorder in Tutankhamun's foot, findings researchers connected to his death at a young age, and which plausibly compounded the health risks that come with a heavily inbred lineage."
      ),
      h2("A Very Different Kind of Genetic Intervention"),
      p(
        "It's a genuinely useful, very literal before-and-after. Ancient Egypt's royal family manipulated heredity through marriage choices, trying to engineer a specific desired outcome — a bloodline kept \"pure\" — with severe, measurable, unintended genetic costs across generations. That's precisely the kind of consequence 2026's precision gene editing exists specifically to avoid: correcting one harmful mutation directly in one patient, rather than gambling an entire family line on a marriage pattern and living with whatever genetic fallout resulted. And modern DNA sequencing of a 3,300-year-old royal mummy is itself, quietly, a genuinely cutting-edge application of the same broader genetic science now making 2026's therapies possible."
      ),
      faq(
        [
          {
            question: "What CRISPR gene therapies are FDA-approved in 2026?",
            answer:
              "Two: Casgevy, approved for sickle cell disease and beta-thalassemia, and EDIT-101, approved for a form of inherited blindness (Leber congenital amaurosis type 10). Several other therapies are in late-stage trials.",
          },
          {
            question: "What did the 2010 Tutankhamun DNA study find?",
            answer:
              "Published in JAMA, it used genetic fingerprinting on eleven royal mummies to build a five-generation family tree, confirming Tutankhamun's parents were full siblings and identifying evidence of malaria and a bone disorder that likely contributed to his early death.",
          },
          {
            question: "Why did Egypt's royal family practice sibling marriage?",
            answer:
              "To preserve what was considered a pure, semi-divine royal bloodline — a deliberate genetic strategy that, as confirmed by modern DNA analysis, carried measurable health costs across generations of the royal family.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The crudest possible version of controlling heredity — deciding who marries whom — sits right next to the most precise version yet attempted: editing one gene, in one patient, directly. Egypt's royal mummies, sequenced by modern science, quietly show us both."
      ),
      cta({
        title: "Meet the Family in the Data",
        body: "Tutankhamun's treasures, and the royal lineage modern genetics has mapped in remarkable detail — on display in Cairo.",
        buttonLabel: "See the Egyptian Museum Tour",
        buttonHref: "/tours/egyptian-museum-coptic-cairo-tour",
      }),
    ],
  },
];
