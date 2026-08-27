import type { Story } from "../types";
import { authors } from "../authors";
import { tours } from "../tours";
import { p, h2, bullets, callout, faq, cta } from "../storyBlocks";

const editorialTeam = authors[0];

function toursBySlug(...slugs: string[]) {
  return slugs.map((slug) => tours.find((t) => t.slug === slug)).filter((t): t is (typeof tours)[number] => Boolean(t));
}

export const stories: Story[] = [
  {
    status: "published",
    featured: false,
    slug: "egypt-beyond-the-pyramids-hidden-gems",
    title: "Egypt Beyond the Pyramids: Places Most Tourists Never See",
    category: "Travel Guides",
    tags: ["Hidden Gems", "Off the Beaten Path", "Fayoum", "Siwa", "Alexandria"],
    author: editorialTeam,
    excerpt:
      "Most first-time visitors never get past Giza, Luxor, and a Nile cruise. Here's the Egypt beyond that itinerary — Fayoum's dunes, Siwa's springs, Alexandria's Mediterranean edge — and why it's worth the extra days.",
    imageTone: "desert",
    image: "/photos/pexels-36754304.jpg",
    publishedAt: "2026-08-27T09:00:00+02:00",
    primaryKeyword: "hidden gems Egypt",
    secondaryKeywords: [
      "Egypt off the beaten path",
      "places to visit in Egypt besides pyramids",
      "Fayoum Egypt",
      "Siwa Oasis",
      "Alexandria Egypt travel",
    ],
    relatedTours: toursBySlug("fayoum-nature-tour", "siwa-oasis", "alexandria-day-trip", "white-desert-safari-bahariya"),
    seoTitle: "Egypt Beyond the Pyramids: Hidden Gems Tourists Miss",
    seoDescription:
      "Fayoum's dunes, Siwa's springs, Alexandria's coastline — the Egypt most travelers never see, and why it deserves a place on your itinerary.",
    relatedStories: [
      {
        slug: "western-desert-oases-guide",
        title: "The Western Desert Oases: Siwa, Bahariya, Dakhla, and Kharga",
        excerpt:
          "Egypt's Western Desert holds a string of oases most itineraries never reach — hot springs, salt lakes, and a landscape unlike anywhere else in the country.",
        imageTone: "desert",
        category: "Travel Guides",
      },
      {
        slug: "siwa-oasis-travel-guide",
        title: "Siwa Oasis: Egypt's Most Remote Escape",
        excerpt: "A distinct Berber culture, salt lakes, and one of the quietest corners of Egypt's Western Desert.",
        imageTone: "desert",
        category: "Travel Guides",
      },
      {
        slug: "ultimate-egypt-bucket-list",
        title: "The Ultimate Egypt Bucket List: 20 Experiences to Try",
        excerpt: "From the Great Pyramid to a flying dress photoshoot in the desert — 20 once-in-a-lifetime Egypt experiences worth building a trip around.",
        imageTone: "giza",
        category: "Travel Guides",
      },
    ],
    body: [
      p(
        "Overtourism has become one of the defining travel stories of the past few years. Venice caps day-trippers, Barcelona residents protest cruise crowds with water pistols, and Bali's most-photographed rice terraces now come with a queue. In response, a growing share of travelers have started doing the opposite of what an algorithm suggests: actively avoiding the ten most-Instagrammed spots in a country and asking a more useful question instead — what does everyone skip, and why?"
      ),
      p(
        "Egypt is a strange case to bring into that conversation, because on paper it looks like the textbook overtourism example. The Pyramids of Giza pull in visitors by the millions, Luxor's temples can feel like a procession line by mid-morning, and a standard Nile cruise route repeats itself across dozens of near-identical itineraries. But that reputation is mostly a symptom of how narrow a slice of the country most first-time visitors actually see, not evidence that Egypt itself is used up. Step outside the well-worn Cairo–Luxor–Aswan corridor and the crowds thin out fast — not because the places are lesser, but because they've never made it onto the standard itinerary.",
      ),
      h2("Why Most Itineraries Never Leave the Nile Valley"),
      p(
        "Ask a first-time visitor to sketch their Egypt trip and you'll get some version of the same route almost every time: land in Cairo, see the pyramids at Giza, fly to Luxor for the temples and the Valley of the Kings, cruise or drive down to Aswan, maybe squeeze in Abu Simbel. It's a genuinely excellent route, and there's a reason it's the default — it hits the sites that made Egypt famous in the first place. But it's also only one geography out of several, built around the Nile because the Nile is where ancient Egypt concentrated its monuments, not because it's the whole country."
      ),
      p(
        "West of the Nile sits a different Egypt entirely: the Western Desert, a network of oases, salt lakes, and chalk formations that most visitors never budget a single day for, simply because it wasn't on the list anyone handed them. North, the Mediterranean coast offers a version of Egypt shaped by Greek, Roman, and Ottoman layers rather than pharaonic ones. Neither requires abandoning the classic route — both are genuinely addable, if you know what they involve."
      ),
      h2("Fayoum: The Closest Genuine Escape From Cairo"),
      p(
        "Fayoum is the easiest of these to underrate, precisely because it's so close to Cairo that it doesn't sound exotic enough to bother with. It's roughly a two-hour drive southwest of the city, built around Lake Qarun and the depression that holds it, and it packs an unreasonable amount of landscape variety into a single day trip. Wadi El Rayan holds Egypt's only waterfalls — modest by global standards, but genuinely striking set against the desert around them — along with a second, quieter lake favored by windsurfers for its steady wind. Beyond the water, the dunes push right up against cultivated farmland in a way that makes for one of the more photogenic transitions in the country, desert to green fields in the space of a few hundred meters."
      ),
      p(
        "What makes Fayoum worth naming specifically is how little it costs an itinerary to include it. This isn't a destination that needs its own flight or an extra hotel night — it's a single well-organized day trip from Cairo, which means it slots into almost any existing plan without reshuffling anything else."
      ),
      h2("Siwa: Egypt's Most Remote Oasis"),
      p(
        "Siwa sits close to the Libyan border, roughly nine to ten hours from Cairo by road, and that distance is exactly why it still feels like a discovery rather than a stop. The oasis has its own Berber culture and its own language, distinct from Arabic-speaking Egypt, along with mudbrick ruins at the old Shali fortress, natural salt lakes so buoyant that floating in them takes no effort at all, and Cleopatra's Spring, a freshwater pool that's been drawing visitors for a very long time. Beyond the palm groves, the Great Sand Sea begins — one of the largest unbroken expanses of sand dunes on the planet, and a serious draw for anyone who wants a proper desert safari rather than a token camel photo."
      ),
      p(
        "Siwa asks more of a trip than Fayoum does. Getting there and back properly takes a multi-day commitment, not a single long day, which is exactly why it stays off most standard itineraries — it needs its own dedicated block of time, usually three days, built around the journey as much as the destination."
      ),
      h2("Alexandria: A Different Egypt Altogether"),
      p(
        "Alexandria breaks the pattern in a different way. Where Fayoum and Siwa are desert stories, Alexandria is a Mediterranean one — founded by Alexander the Great, later home to the ancient world's most famous library, and shaped since by Greek, Roman, and Ottoman rule layered on top of each other along a genuine coastline. The Qaitbay Citadel stands on the site of the vanished Pharos lighthouse, one of the ancient Seven Wonders, and the modern Bibliotheca Alexandrina reimagines that lost library as a striking piece of contemporary architecture worth visiting on its own merits."
      ),
      p(
        "It's about a three-hour drive north from Cairo, which puts it comfortably within day-trip range, though it rewards an overnight stay if your schedule allows one — the corniche at sunset, with the sea on one side and a hundred-plus years of belle-époque buildings on the other, is a genuinely different register of Egypt from anything the Nile Valley offers."
      ),
      h2("Hidden in Plain Sight: Old Cairo"),
      p(
        "Not every underused corner of Egypt requires leaving Cairo at all. Islamic Cairo and Coptic Cairo sit within the same city as Giza's pyramids, yet most itineraries give them a rushed afternoon at best, if anything. Al-Azhar Mosque, the winding lanes around it, and the Hanging Church in Coptic Cairo hold roughly a thousand years of architecture that has nothing to do with the pharaonic sites most visitors fly in for — and because it doesn't fit the mental picture of \"ancient Egypt,\" it gets skipped by travelers who'd genuinely enjoy it."
      ),
      h2("The White Desert: Formations Unlike Anywhere Else"),
      p(
        "Further into the Western Desert, past the Bahariya Oasis, the White Desert protects a landscape of chalk-white rock formations carved by centuries of wind into shapes that look almost sculpted — mushrooms, a sphinx-like silhouette, formations locals and guides have given names to over the years. Camping here overnight, with a fire and a sky largely free of light pollution, is one of the more genuinely memorable nights available anywhere in the country, and it's still uncommon enough that you're unlikely to share the site with more than a handful of other groups."
      ),
      p("A quick sense of what each of these actually requires, time-wise, if you're weighing them against a fixed number of days:"),
      ...bullets([
        "Fayoum — a single long day trip from Cairo, no extra hotel night required",
        "Alexandria — a full day trip from Cairo, or an easy overnight if you want an unhurried evening on the corniche",
        "Islamic and Coptic Cairo — a half to full day, addable to any Cairo stay without extra transport",
        "White Desert / Bahariya — two days, one night, including desert camping",
        "Siwa — three days minimum, given the distance from Cairo",
      ]),
      callout(
        "None of these require cutting Giza, Luxor, or Aswan from a first trip. They're additions, not substitutions — the kind of days that turn a standard itinerary into one that actually reflects how varied the country is.",
        { title: "Good to Know", tone: "Info" }
      ),
      faq(
        [
          {
            question: "What are the best hidden gems in Egypt besides the pyramids?",
            answer:
              "Fayoum's Wadi El Rayan waterfalls and desert lake, the Siwa Oasis near the Libyan border, Alexandria's Mediterranean coastline, Islamic and Coptic Cairo's old city, and the White Desert's chalk formations are the strongest answers — each offers a genuinely different Egypt from the Nile Valley circuit.",
          },
          {
            question: "Is Fayoum worth visiting from Cairo?",
            answer:
              "Yes, and it's one of the easiest additions to make. It's about a two-hour drive from Cairo, doable as a single day trip, and covers waterfalls, a desert lake, and dunes that press right up against farmland.",
          },
          {
            question: "How many days do you need for Siwa Oasis?",
            answer:
              "Three days is the realistic minimum, given it's roughly nine to ten hours from Cairo by road. That covers the drive, time in the oasis itself for the salt lakes and Shali fortress, and at least a partial trip into the Great Sand Sea.",
          },
          {
            question: "Is Alexandria worth a day trip from Cairo?",
            answer:
              "Yes. It's about three hours each way, which makes it a comfortable long day trip, though an overnight stay lets you catch the corniche at sunset without rushing back to Cairo the same evening.",
          },
          {
            question: "Do off-the-beaten-path destinations in Egypt require more planning?",
            answer:
              "Some do. Fayoum and Alexandria are straightforward day trips that fit into almost any existing itinerary. Siwa and the White Desert need dedicated multi-day blocks and are easiest to arrange through a private tour, since public transport options thin out considerably once you're off the Nile Valley route.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "The pyramids earned their reputation, and no first Egypt trip should skip them. But treating Giza, Luxor, and a Nile cruise as the entire country leaves out a lot of what actually makes Egypt worth a longer stay — a waterfall two hours from Cairo, a Berber oasis near the Libyan border, a coastline that looks nothing like the Nile Valley at all. The extra days it takes to reach them are, for a lot of travelers, where the trip actually starts to feel like theirs."
      ),
      cta({
        title: "See the Egypt Most Visitors Miss",
        body: "Fayoum, Siwa, the Western Desert — we can build these into your itinerary, not just Giza and Luxor.",
        buttonLabel: "Explore the Fayoum Nature Tour",
        buttonHref: "/tours/fayoum-nature-tour",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "digital-detox-in-egypt",
    title: "What If You Took a Digital Detox in Egypt?",
    category: "Travel Guides",
    tags: ["Digital Detox", "Siwa", "Fayoum", "Desert Travel"],
    author: editorialTeam,
    excerpt:
      "No signal in the Sahara, sunrise over a 3,000-year-old temple, a night sky without a single glowing screen in sight. Here's what an intentional digital detox in Egypt actually looks like.",
    imageTone: "desert",
    image: "/photos/pexels-12437205.jpg",
    publishedAt: "2026-08-27T09:20:00+02:00",
    primaryKeyword: "digital detox Egypt",
    secondaryKeywords: [
      "Egypt desert retreat",
      "unplug travel Egypt",
      "Siwa oasis detox",
      "disconnect vacation",
      "Fayoum desert camping",
    ],
    relatedTours: toursBySlug("siwa-oasis", "fayoum-wadi-el-rayan-waterfalls-tour", "quad-bike-stargazing-desert-night"),
    seoTitle: "A Digital Detox in Egypt: Desert, Nile, and Silence",
    seoDescription:
      "No signal in the Sahara, sunrise over ancient temples, nights under real stars — why Egypt might be one of the world's best places to unplug.",
    relatedStories: [
      {
        slug: "egypts-ancient-connection-to-wellness",
        title: "Egypt's Ancient Connection to Wellness — And How to Try It",
        excerpt:
          "Long before 'wellness travel' was a category, ancient Egyptians were formalizing bathing, oils, and healing rituals into daily life. Here's that history, and how to find its modern equivalent along the Red Sea and in the desert.",
        imageTone: "redsea",
        category: "Culture",
      },
      {
        slug: "siwa-oasis-travel-guide",
        title: "Siwa Oasis: Egypt's Most Remote Escape",
        excerpt: "A distinct Berber culture, salt lakes, and one of the quietest corners of Egypt's Western Desert.",
        imageTone: "desert",
        category: "Travel Guides",
      },
      {
        slug: "is-the-white-desert-worth-visiting",
        title: "Is the White Desert Worth Visiting?",
        excerpt:
          "Chalk formations carved by wind into shapes unlike anything else in Egypt, with a night of camping under some of the darkest skies in the country — here's what it actually involves.",
        imageTone: "desert",
        category: "Travel Guides",
      },
    ],
    body: [
      p(
        "Screen-time reports have become a genre of their own bad news — the average person now checks a phone well over a hundred times a day, and a growing body of research ties that constant low-level connectivity to measurably worse sleep, attention, and mood. The response, for a meaningful slice of travelers, hasn't been another app that promises to fix the problem. It's been leaving the problem's habitat entirely: booking trips built around places where a phone simply can't do very much, and treating that limitation as the whole point rather than an inconvenience to work around."
      ),
      p(
        "\"Digital detox\" retreats have become their own travel category as a result — cabins in Scandinavia with no wifi by design, meditation centers that lock phones in a safe at check-in, entire resorts marketed on the promise of silence. Egypt rarely comes up in that conversation, which is a genuine gap, because large parts of the country already have exactly what those retreats are trying to manufacture. It's just not marketed that way, because for the people who live there, it was never a wellness feature to begin with — it's simply what the desert and the river have always been like."
      ),
      h2("Where the Signal Actually Runs Out"),
      p(
        "In most of Cairo, Luxor, or a Red Sea resort town, connectivity is fine — you'll get 4G at your hotel and probably at most of the sites in between. That changes fast once you head into the Western Desert. Coverage in Siwa is patchy at best and disappears entirely once you're out among the dunes of the Great Sand Sea; the same goes for stretches of the White Desert near Bahariya, and for the deeper reaches of a Fayoum desert excursion once you're off the paved road. This isn't framed as a feature by most tour operators — it's simply a fact of the terrain, the same reason satellite phones exist for serious desert expeditions. But for a traveler who's been trying and failing to put their own phone down at home, that patchiness does the job for them, without requiring a single ounce of willpower."
      ),
      h2("A Night Sky With Nothing Competing for Your Attention"),
      p(
        "Take away the notifications and what's left, at night in the desert, is a sky with an unusual amount of detail in it. Egypt's Western Desert sits far enough from any major city's light pollution that the Milky Way is visible to the naked eye on a clear night — not a faint smudge, but a genuinely wide band across the sky. A quad-biking and stargazing evening in the dunes near Cairo builds this in deliberately, pairing an adrenaline ride into the sand at sunset with a telescope session once the sky is fully dark; a night camping in the White Desert or out in Siwa gets you the same thing over a longer, slower stretch of time, without a screen anywhere nearby to compete with it."
      ),
      h2("Sunrise Before the Crowds and the Notifications Both Arrive"),
      p(
        "There's a particular kind of quiet that exists at a major Egyptian temple in the twenty minutes before opening, when the site is still empty and the light is still low. Watching the sun come up over Karnak's columns or the Valley of the Kings' cliffs, before a single tour bus has pulled in, is as close as a monument-heavy itinerary gets to a meditative moment — and because it happens early enough that most people's phones are still on the nightstand, it tends to stay that way for longer than you'd expect."
      ),
      h2("The Nile at the Pace of a Sail, Not an Engine"),
      p(
        "A traditional felucca — Egypt's classic wooden sailboat, still used on the Nile much as it has been for centuries — runs on wind, not a motor, which means no engine noise, no scheduled stops, and generally no wifi to speak of. An hour or two on one, drifting past the riverbank at whatever pace the wind allows, is a small, easy way to build genuine stillness into a trip that otherwise moves at a temple-a-day pace. It's not marketed as a wellness activity. It's just what sailing a felucca has always been."
      ),
      callout(
        "None of this requires telling your hotel or your travel companions you're \"doing a detox.\" Most of Egypt's Western Desert and its quieter stretches of Nile simply don't have reliable signal — the disconnection happens on its own, which for a lot of travelers is easier to actually stick to than a deliberate phone-free pledge.",
        { title: "Good to Know", tone: "Info" }
      ),
      h2("What to Actually Plan Around"),
      p("A few practical notes if you're building a trip with this in mind, rather than stumbling into it by accident:"),
      ...bullets([
        "Download offline maps and any translation apps before heading into Siwa or the White Desert — signal there is genuinely unreliable, not just slow",
        "Tell anyone who needs to reach you in advance that you'll be unreachable for a stretch, rather than explaining it in the moment",
        "Bring a physical book, journal, or camera that isn't your phone — the appeal fades fast if you're just staring at the same device with the signal bars grayed out",
        "Pair a desert night with a felucca sail or an early temple visit rather than one alone, so the unplugged stretch of the trip runs longer than a single evening",
        "Charge everything before you leave signal range — some desert camps run on generators with limited outlet access",
      ]),
      faq(
        [
          {
            question: "Does Egypt have phone signal in the desert?",
            answer:
              "Coverage is inconsistent once you're well outside major towns. Siwa Oasis and the Great Sand Sea, the deeper parts of the White Desert near Bahariya, and stretches of the Fayoum desert away from the paved road all commonly lose signal, while Cairo, Luxor, and the main Red Sea resort towns stay well connected.",
          },
          {
            question: "Is Siwa Oasis good for a digital detox?",
            answer:
              "Yes — it's one of the more remote inhabited places in Egypt, roughly nine to ten hours from Cairo by road, with patchy signal in town and none at all once you're out among the dunes, plus genuinely dark night skies.",
          },
          {
            question: "What's the best Egypt activity for stargazing without a city's light pollution?",
            answer:
              "A dedicated quad-biking and stargazing evening in the desert dunes near Cairo, or an overnight camp in the White Desert or Siwa, all get you well clear of city light pollution — the White Desert and Siwa options add more distance and darker skies, at the cost of a longer trip.",
          },
          {
            question: "Can you do a felucca sail without it feeling like a tourist gimmick?",
            answer:
              "Yes, particularly on a shorter, unhurried sail rather than a rushed group stop — the boat genuinely runs on wind, not an engine, and an hour or two adrift on the river is a real change of pace, not a staged photo op.",
          },
          {
            question: "How many days should a digital detox stretch of an Egypt trip be?",
            answer:
              "Even one or two days built around a desert night and a Nile sail makes a noticeable difference. A dedicated Siwa or White Desert trip, at three days or two days respectively, gives the disconnection more room to actually settle in.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "None of this is marketed as wellness travel in Egypt, and that's arguably why it works as well as it does — nobody's trying to sell you on the silence, it's just genuinely there, in the parts of the country that were never built around a signal tower in the first place. A phone that stops working somewhere past Siwa's edge of town isn't a flaw in the trip. For a lot of travelers, it's the best part of it."
      ),
      cta({
        title: "Go Somewhere the Signal Can't Follow",
        body: "A night in the Siwa Oasis or the Western Desert is as close to fully disconnecting as travel gets.",
        buttonLabel: "Explore the Siwa Oasis Trip",
        buttonHref: "/tours/siwa-oasis",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "egypts-ancient-connection-to-wellness",
    title: "Egypt's Ancient Connection to Wellness — And How to Experience It Today",
    category: "Culture",
    tags: ["Wellness Travel", "Red Sea", "Ancient Egypt", "Desert"],
    author: editorialTeam,
    excerpt:
      "Long before 'wellness travel' was a category, ancient Egyptians were formalizing bathing, oils, and healing rituals into daily life. Here's that history, and how to find its modern equivalent along the Red Sea and in the desert.",
    imageTone: "redsea",
    image: "/photos/pexels-28494110.jpg",
    publishedAt: "2026-08-27T09:40:00+02:00",
    primaryKeyword: "wellness travel Egypt",
    secondaryKeywords: [
      "Egypt wellness retreat",
      "Red Sea relaxation",
      "ancient Egyptian beauty rituals",
      "desert wellness",
      "Egypt spa travel",
    ],
    relatedTours: toursBySlug("red-sea-relaxation", "soma-bay-watersports-relaxation", "siwa-oasis"),
    seoTitle: "Egypt's Ancient Wellness Traditions, and How to Try Them",
    seoDescription:
      "Ancient Egyptians pioneered bathing rituals, oils, and natural healing. Here's that legacy, and how to experience Egypt's version of wellness travel today.",
    relatedStories: [
      {
        slug: "el-gouna-and-soma-bay-guide",
        title: "El Gouna and Soma Bay: Egypt's Purpose-Built Red Sea Resorts",
        excerpt:
          "Two planned resort towns on the Red Sea coast, built for lagoons, watersports, and a slower pace than Hurghada or Sharm — here's what each actually offers.",
        imageTone: "redsea",
        category: "Travel Guides",
      },
      {
        slug: "mummification-process-explained",
        title: "How Ancient Egyptian Mummification Actually Worked",
        excerpt: "A 70-day process, canopic jars, and why the brain was the one organ they didn't bother preserving.",
        imageTone: "giza",
        category: "Ancient Egypt",
      },
      {
        slug: "digital-detox-in-egypt",
        title: "What If You Took a Digital Detox in Egypt?",
        excerpt:
          "No signal in the Sahara, sunrise over a 3,000-year-old temple, a night sky without a single glowing screen in sight. Here's what an intentional digital detox in Egypt actually looks like.",
        imageTone: "desert",
        category: "Travel Guides",
      },
    ],
    body: [
      p(
        "Wellness travel has grown into one of the largest categories in tourism, worth hundreds of billions of dollars globally and expanding faster than travel spending overall. Spa hotels, retreat centers, and entire resort towns now market themselves primarily on restoration rather than sightseeing — the promise isn't a checklist of attractions, it's a body and mind that feel better on the way home than they did on the way in. Most of that industry borrows its language from wellness traditions in India, Japan, and Scandinavia. Rarely mentioned in the same breath: Egypt, a country that was formalizing bathing rituals, therapeutic oils, and natural treatments thousands of years before the word \"spa\" existed."
      ),
      p(
        "That omission is a genuine gap, because the historical record here isn't vague. Ancient Egyptians left behind an unusually detailed paper trail — literally, on papyrus — describing how they used natural ingredients and routines for the body in ways that read, with some translation, like an early wellness manual."
      ),
      h2("What the Historical Record Actually Shows"),
      p(
        "Ancient Egyptian use of oils and unguents is well documented, both in medical papyri like the Ebers Papyrus and in the archaeological record — jars of scented oils and fats have survived in tombs, meant to keep skin conditioned against Egypt's dry heat. Honey shows up repeatedly in these same texts, used topically as well as in food, valued for properties that modern research has since taken seriously enough to study honey's use in wound care. Natron, a naturally occurring salt mixture harvested from dry lakebeds, played a central role in mummification, but it was also used more broadly for cleansing — a precursor, in a rough sense, to the mineral-rich salt treatments that modern spas now sell as a novelty."
      ),
      p(
        "It's worth being precise here rather than romantic: this was a real, practical set of routines for a hot, arid climate — moisturizing against dryness, treating wounds and skin conditions with what was available, bathing as regular practice rather than occasion. It wasn't medicine in the modern clinical sense, and it's worth resisting the urge to overstate ancient claims into modern medical ones. What's genuinely documented is enough on its own: a culture that took bodily care seriously, systematized it, and wrote it down for later generations to follow."
      ),
      h2("Bathing as Daily Practice, Not Luxury"),
      p(
        "Cleanliness held real cultural and religious weight in ancient Egypt — priests in particular were required to bathe multiple times a day as part of ritual purity, and bathing more broadly was tied to both practical hygiene and spiritual life in a way that gave it more weight than it holds in a lot of ancient societies. That combination — physical care treated as inseparable from wellbeing rather than as an indulgence layered on top of it — is close to the exact pitch modern wellness tourism makes today, several thousand years later."
      ),
      h2("Where This History Meets a Modern Trip"),
      p(
        "The clearest modern equivalent to those salt-based ancient treatments sits in Siwa Oasis, where natural salt lakes — genuinely comparable in mineral concentration to the Dead Sea — are still used today much as they likely were centuries ago. Floating in one requires no effort at all; the water does the work. It's not a manufactured spa experience built for tourists — the lakes were there long before tourism was, and Siwans have used them for generations."
      ),
      p(
        "Along the Red Sea coast, the connection is more about pace than direct historical lineage. Purpose-built resort towns like El Gouna and Soma Bay were designed from the ground up for slower travel — lagoons, calm water, and considerably less nightlife than Hurghada or Sharm El Sheikh nearby. A day built around Soma Bay's quieter stretch of coast, or a Red Sea day with genuinely nothing scheduled beyond the water and the sand, gives a trip the kind of unhurried block of time that the ancient bathing culture, in its own way, treated as essential rather than optional."
      ),
      p(
        "The desert plays its own role here too. Egypt's dry climate has long been associated, informally, with relief for certain skin and respiratory conditions — the same dry heat that made oils and moisturizing routines a practical necessity for ancient Egyptians is part of why some travelers today report genuine relief from time spent in it. This is worth stating carefully rather than as a medical claim: the climate is real and documented, the anecdotal benefits are widely reported, and neither substitutes for a doctor's advice, but the pattern itself has a long, continuous history behind it."
      ),
      p("A few specific ways this history shows up in a modern Egypt trip, concretely:"),
      ...bullets([
        "Floating in Siwa's natural salt lakes — mineral-rich water still used by locals, not a manufactured tourist attraction",
        "An unhurried day on the Red Sea coast, in a resort town like El Gouna or Soma Bay built specifically for a slower pace",
        "Time in the dry desert climate itself, informally associated for centuries with relief from certain skin and joint conditions",
        "Locally made oils and honey-based products, still sold in markets much as their ancient equivalents would have been",
        "A felucca sail or quiet Nile stretch, offering the same kind of unstructured, restorative time as a modern retreat's open schedule",
      ]),
      callout(
        "Historical use of natron, oils, and honey is well documented in Egyptology, but none of it should be read as modern medical advice. Enjoy the Red Sea coast and Siwa's salt lakes for what they genuinely are — beautiful, restorative places with real history behind them — rather than as a treatment for a specific condition.",
        { title: "Good to Know", tone: "Info" }
      ),
      faq(
        [
          {
            question: "Did ancient Egyptians really have wellness rituals?",
            answer:
              "Yes, well documented in medical papyri like the Ebers Papyrus and in the archaeological record — natural oils and unguents for the skin, honey used both topically and medicinally, and natron salt used in cleansing, alongside a bathing culture tied closely to religious practice.",
          },
          {
            question: "Are Siwa's salt lakes similar to the Dead Sea?",
            answer:
              "They're genuinely comparable in mineral concentration, and floating in them works the same way — the water's density does the work. They're natural lakes still used by the local community today, not a built spa facility.",
          },
          {
            question: "Which is more relaxing, El Gouna or Soma Bay?",
            answer:
              "Both are purpose-built resort towns designed for a slower pace than Hurghada or Sharm El Sheikh. Soma Bay tends to be the quieter of the two, with fewer crowds; El Gouna offers a bit more infrastructure and dining variety around its lagoons.",
          },
          {
            question: "Is Egypt a good wellness travel destination?",
            answer:
              "It's a genuinely underused one. Between Siwa's natural salt lakes, a documented ancient history of bathing and oil-based skin care, and Red Sea resort towns built specifically for slow, unstructured time, the pieces are all there — Egypt simply isn't marketed under the wellness-travel label the way other destinations are.",
          },
          {
            question: "Can you visit Siwa and the Red Sea coast on the same trip?",
            answer:
              "It's possible but requires planning, since they sit on opposite sides of the country with different travel times from Cairo. Most travelers pick one to pair with a classic Nile Valley itinerary rather than attempting both on a single trip.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "None of this requires treating ancient Egypt as a wellness brand it never asked to be. What's actually there is simpler and more interesting than that: a culture that took the body seriously enough to write down what worked, in a climate and a landscape that still offer close to the same things today. A few unhurried days on the Red Sea, or an afternoon floating in Siwa's salt lakes, isn't a spa gimmick borrowed from somewhere else. It's closer to the original."
      ),
      cta({
        title: "Build In Time to Actually Rest",
        body: "A few unhurried days on the Red Sea coast, after the temples and the traffic, changes the whole shape of a trip.",
        buttonLabel: "Explore the Red Sea Relaxation Trip",
        buttonHref: "/tours/red-sea-relaxation",
      }),
    ],
  },
  {
    status: "published",
    featured: false,
    slug: "egypt-through-local-eyes-khan-el-khalili",
    title: "Egypt Through Local Eyes: What Khan El-Khalili Really Is",
    category: "Behind the Scenes",
    tags: ["Egypt Through Local Eyes", "Khan el-Khalili", "Old Cairo", "Local Culture"],
    author: editorialTeam,
    excerpt:
      "The first in an ongoing series looking at Egypt through a local lens: what Khan el-Khalili actually is once you get past the souvenir stalls lining its main lane.",
    imageTone: "giza",
    image: "/photos/pexels-18991500.jpg",
    publishedAt: "2026-08-27T10:00:00+02:00",
    primaryKeyword: "Khan el Khalili local guide",
    secondaryKeywords: [
      "Egypt through local eyes",
      "Old Cairo local life",
      "Khan el Khalili tourist mistakes",
      "authentic Cairo experience",
      "local Egyptian perspective travel",
    ],
    relatedTours: toursBySlug("khan-el-khalili-food-walking-tour", "islamic-coptic-cairo-walking-tour"),
    seoTitle: "Egypt Through Local Eyes: Khan El-Khalili, Explained",
    seoDescription:
      "The first in a local-perspective series: what Khan el-Khalili actually is beneath the souvenir stalls, and how to experience it the way Cairenes do.",
    relatedStories: [
      {
        slug: "the-egypt-you-dont-see-on-instagram",
        title: "The Egypt You Don't See on Instagram",
        excerpt:
          "Behind the pyramid selfies and staged sunsets is a country that goes on living, cooking, arguing, and trading exactly as it has for centuries. Here's the Egypt that never makes it into a travel feed.",
        imageTone: "giza",
        category: "Behind the Scenes",
      },
      {
        slug: "islamic-and-coptic-cairo-walking-guide",
        title: "Islamic and Coptic Cairo: A Walking Guide to Old Cairo",
        excerpt:
          "Beyond the Pyramids, Cairo holds a thousand years of Islamic architecture and some of Christianity's oldest surviving churches — both walkable, both often skipped.",
        imageTone: "giza",
        category: "Travel Guides",
      },
      {
        slug: "best-markets-and-bazaars-in-egypt",
        title: "The Best Markets & Bazaars in Egypt",
        excerpt: "Beyond Khan el-Khalili — Aswan's souk, Luxor's local markets, and Alexandria's antique trade, and what makes each one worth the detour.",
        imageTone: "giza",
        category: "Culture",
      },
    ],
    body: [
      p(
        "Something has shifted in how people plan trips. The generic \"Top 10 Things To Do\" listicle, the same 15 photos recycled across a hundred near-identical travel blogs, the influencer reel that shows a place for eleven seconds without saying anything true about it — travelers have grown visibly tired of all of it, and search behavior shows the shift plainly: more people now specifically look for local guides, resident perspectives, and \"how locals actually do this\" content rather than trusting another ranked list written by someone who spent two days in a city."
      ),
      p(
        "That distrust is well earned, and nowhere does it show more clearly than at a place like Khan el-Khalili, Cairo's most famous bazaar. Almost every generic Egypt guide mentions it, usually in the same handful of words — \"historic market,\" \"great for souvenirs,\" \"haggle for a good price\" — and almost none of them explain what the place actually is, why it exists where it does, or how to spend real time in it well. So this is the first entry in an ongoing series we're calling Egypt Through Local Eyes, where each installment takes one place or one custom that tourists routinely misunderstand and explains it the way someone who actually lives here would. Khan el-Khalili is where it starts, because it might be the single most misunderstood place in the country."
      ),
      h2("What Khan el-Khalili Actually Is"),
      p(
        "Khan el-Khalili isn't a tourist market that happens to be old — it's a working market that predates mass tourism by centuries and simply absorbed tourism into an already-functioning economy. It was established in the late 1300s under the Mamluk Sultanate, built on the site of an earlier Fatimid mausoleum, and has operated continuously as a trading hub ever since — first for caravans moving goods along trade routes through Cairo, later for the city's own residents buying and selling everyday goods, and only in the last century or so as a place foreign visitors go for souvenirs. That order matters: the market existed for Cairenes long before it existed for tourists, and in its back lanes, it still does."
      ),
      h2("The Difference Between the Main Lane and Everything Around It"),
      p(
        "Almost every visitor's experience of Khan el-Khalili is the same narrow stretch — the main tourist lane, lined with shops selling papyrus prints, alabaster figurines, and t-shirts, priced for foreigners and staffed by vendors fluent in exactly the sales pitch that works on them. It's not fake, exactly, but it's a specific, curated slice of the market built for a specific audience, and treating it as the whole of Khan el-Khalili is like judging an entire city by its airport gift shop."
      ),
      p(
        "Walk a few streets deeper and the market changes register entirely. The spice sellers on the surrounding lanes sell to Cairo households doing their actual weekly shopping, not tourists — sacks of cumin, dried hibiscus for karkade tea, saffron sold by weight rather than in a decorative tin. The goldsmiths' district nearby has operated as Cairo's jewelry-buying center for generations, still the place many Egyptian families go for a wedding purchase. Coppersmiths still hammer trays and lanterns by hand in small workshops tucked into side alleys, a craft that's been dwindling but hasn't disappeared. And El Fishawy, one of Cairo's oldest coffeehouses, has been serving tea and coffee in the same spot for roughly two and a half centuries — full of Egyptians as much as visitors, mirrors on every wall, conversation as much a part of the order as the drink itself."
      ),
      h2("What Tourists Consistently Get Wrong"),
      p(
        "The most common mistake is treating Khan el-Khalili purely as a souvenir mall — a place to grab a magnet and a scarf and move on within twenty minutes. That approach misses almost everything interesting about the market, because the interesting parts require walking further and slowing down, not rushing through the loudest section and leaving."
      ),
      p(
        "The second mistake is haggling badly, either not at all or aggressively in a way that reads as rude rather than customary. Bargaining is a normal, expected part of buying in Khan el-Khalili, treated by both sides as something close to a conversation rather than a confrontation — a vendor's first price is rarely their real price, but the process works best with a bit of warmth and patience rather than a hard opening lowball or, at the other extreme, simply accepting whatever number comes first out of discomfort with negotiating at all."
      ),
      p(
        "The third, and maybe most overlooked, mistake is missing what the market sits next to. Al-Hussein Mosque, one of Cairo's most significant religious sites, borders the market directly, and the wider historic core around it — the medieval gates, the mosques and madrasas along Al-Muizz Street — is easily walkable from the same spot. Visitors who see Khan el-Khalili as an isolated shopping stop, rather than one piece of a much larger historic district, walk right past most of what makes the neighborhood worth the trip in the first place."
      ),
      p("A short list of what actually changes a Khan el-Khalili visit from a rushed stop into real time well spent:"),
      ...bullets([
        "Walk past the main tourist lane deliberately, not just wherever the crowd happens to funnel you",
        "Sit for tea at El Fishawy rather than treating it as a five-minute photo stop",
        "Bargain with good humor, not aggression — it's a shared custom, not a contest",
        "Set aside time for Al-Hussein Mosque and the surrounding historic streets, not just the market stalls",
        "Go with at least a rough sense of what a fair local price actually looks like, so a good-faith negotiation doesn't feel like guesswork",
      ]),
      callout(
        "Fridays bring Al-Hussein Mosque's midday prayers, which draw large local crowds to the immediate area around the market — a genuinely interesting time to be nearby if you're respectful about it, but not the easiest window for unhurried shopping.",
        { title: "Good to Know", tone: "Info" }
      ),
      faq(
        [
          {
            question: "Is Khan el-Khalili just for tourists?",
            answer:
              "No. Its main tourist-facing lane is aimed at visitors, but the surrounding streets — spice sellers, goldsmiths, coppersmiths — still function as a working market for Cairo residents, much as they have for centuries.",
          },
          {
            question: "How old is Khan el-Khalili?",
            answer:
              "It dates to the late 1300s, established under the Mamluk Sultanate on the site of an earlier Fatimid-era mausoleum, and has operated continuously as a trading hub since.",
          },
          {
            question: "Is it rude to haggle in Khan el-Khalili?",
            answer:
              "No — it's the expected, normal way to buy in the market, treated by vendors as routine rather than confrontational. Approaching it as a friendly back-and-forth, rather than a hard lowball or a full-price payment out of discomfort, gets the best result and the better experience on both sides.",
          },
          {
            question: "What's near Khan el-Khalili worth visiting?",
            answer:
              "Al-Hussein Mosque sits directly beside the market, and the wider historic district — Al-Muizz Street's medieval gates, mosques, and madrasas — is easily walkable from the same spot, making the market one part of a larger Old Cairo visit rather than a standalone stop.",
          },
          {
            question: "How much time should I spend at Khan el-Khalili?",
            answer:
              "A rushed visit can be done in twenty minutes, but that only covers the main tourist lane. Give it two to three unhurried hours, ideally with a guide who knows the surrounding streets, to actually experience the spice sellers, the goldsmiths, tea at El Fishawy, and the historic core around it.",
          },
        ],
        "Frequently Asked Questions"
      ),
      p(
        "Khan el-Khalili rewards exactly the kind of attention a generic top-ten list never gives it — a market that's been trading since before Columbus reached the Americas, still doing real business behind its tourist-facing front. That's the whole premise of this series: the places everyone thinks they already understand usually have more going on a few streets past where the guidebooks stop looking."
      ),
      cta({
        title: "Walk It With Someone Who Knows It",
        body: "A local guide changes Khan el-Khalili from a souvenir stop into what it actually is — come see for yourself.",
        buttonLabel: "Walk Old Cairo With a Local Guide",
        buttonHref: "/tours/islamic-coptic-cairo-walking-tour",
      }),
    ],
  },
];
