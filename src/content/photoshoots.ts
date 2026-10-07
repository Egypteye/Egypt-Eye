import { unsplashUrl } from "./unsplash";
import type { Photoshoot } from "./types";

// Photoshoot Packages — Egypt Eye's signature products.

export const photoshoots: Photoshoot[] = [
  {
    slug: "exclusive-pyramids-photoshoot",
    title: "Exclusive Pyramids Photoshoot",
    duration: "1–2 hours",
    price: { amount: 75, originalAmount: 100, currency: "USD" },
    locations: ["Giza Pyramids", "Nine Pyramids View"],
    imageLabel: "Pyramids Photoshoot",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1566288623394-377af472d81b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "A private, professionally directed photoshoot at the Pyramids of Giza — built for travelers who want cinematic, Instagram-ready memories, not just snapshots.",
    goodFor: ["Solo travelers", "Couples", "Families", "Influencers & content creators"],
    included: [
      "Private professional photographer",
      "Professional camera equipment",
      "Private transportation",
      "Parking & road tolls",
      "80+ edited pictures",
      "24-hour follow-up service",
    ],
    addOns: [
      "Professional video Reel",
      "Arabian horse photography",
      "Camel experience",
      "Group photoshoot",
    ],

    // The booking popup's dropdown. Giza is shot in the morning: the light is
    // usable and the plateau is bearable to walk on, which is why there is no
    // afternoon slot to offer. "Request another time" is always available in
    // the popup itself, so this is the shortlist rather than the limit.
    timeSlots: ["9:00 AM", "11:00 AM"],

    // Priced extras, selectable while booking. These overlap the prose
    // `addOns` list above on purpose: that list is what the page describes,
    // this one is what a customer can actually tick and be quoted for.
    //
    // Settled with the balance, never taken with the deposit — the PayPal
    // payment link is one fixed amount per tier and cannot charge a variable
    // total. See lib/booking/extras.ts.
    extras: [
      { label: "Camel Ride", priceUsd: 25 },
      { label: "Running Horse Ride", priceUsd: 60 },
      { label: "Jumping Horse", priceUsd: 25 },
      { label: "Egyptian Scarf", priceUsd: 20 },
      { label: "Video Reels", priceUsd: 25 },
    ],
    delivery: [
      "80+ edited pictures",
      "Raw, unedited photos the same day",
      "Optional larger gallery: 100+ high-resolution edited images within 5 days",
    ],
    faqs: [
      {
        question: "How long is the session, and how many photos do I get?",
        answer:
          "One to two hours at Giza. You receive 80+ edited pictures, plus the raw, unedited files the same day. If you want a larger set, there is an optional gallery of 100+ high-resolution edited images delivered within five days.",
      },
      {
        question: "Where exactly do you shoot?",
        answer:
          "Two locations: the Pyramids of Giza themselves, and the Nine Pyramids View, the vantage point that lines all nine up in a single frame. Private transport between them, parking and road tolls are included.",
      },
      {
        question: "Can I add a horse or a camel?",
        answer:
          "Yes. Arabian horse photography, a camel experience, a professional video Reel and a group photoshoot are all available as add-ons. Tell us when you book so we can build the time in.",
      },
      {
        question: "Do I need to know how to pose?",
        answer:
          "No. The photographer directs the whole session. Bring shoes you can walk in \\u2014 the ground around the plateau is uneven sand and stone \\u2014 and a second outfit if you want one, since a two-hour session has room for a change.",
      },
    ],
    destinations: ["Giza"],
  },
  {
    slug: "flying-dress-photoshoot",
    title: "Sand Dunes Flying Dress Photoshoot",
    duration: "1 hour",
    price: { amount: 199, originalAmount: 250, currency: "USD" },
    locations: ["Sand Dunes"],
    imageLabel: "Flying Dress in the Sand Dunes",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1771480432108-f4dc7bee6461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "Egypt's first Flying Dress experience — a dramatic, editorial-style shoot in a flowing dress of your chosen color, out among the desert's sand dunes, directed by our photographers at secret, uncrowded locations away from the crowds.",
    goodFor: [
      "Solo travelers",
      "Engagements & proposals",
      "Couples",
      "Fashion shoots",
      "Personal content",
    ],
    included: [
      "Flying dress in your chosen color",
      "Professional photographer & posing direction",
      "Private transportation, pickup and return",
      "Secret, less crowded locations",
      "Edited images",
      "Egyptian souvenir",
    ],
    addOns: ["High-end retouching upgrade"],
    delivery: ["Professionally edited image gallery", "Optional high-end retouching"],
    faqs: [
      {
        question: "Do I need to bring the dress?",
        answer:
          "No. The flying dress is included, in the colour you choose. Tell us which when you book.",
      },
      {
        question: "How long is it, and where?",
        answer:
          "One hour among the desert's sand dunes, at locations we keep off the usual route so you are not shooting around other people. Private transport there and back is included.",
      },
      {
        question: "I have never modelled. Will I know what to do?",
        answer:
          "You do not need to. The photographer directs the entire session \\u2014 where to stand, how to hold the dress, when to move \\u2014 and the dress does most of the work once the wind catches it.",
      },
      {
        question: "What do I get afterwards?",
        answer:
          "A professionally edited image gallery, and an Egyptian souvenir to take home. High-end retouching is available as an upgrade.",
      },
    ],
    destinations: ["Giza"],
  },
  {
    slug: "fayoum-flying-dress-photoshoot",
    title: "Fayoum Flying Dress Photoshoot",
    duration: "1 hour",
    price: { amount: 219, originalAmount: 270, currency: "USD" },
    locations: ["Fayoum — Wadi El Rayan & the Magic Lake"],
    imageLabel: "Flying Dress in Fayoum",
    imageTone: "desert",
    image: "https://images.unsplash.com/photo-1762604407380-87bff2e28eca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "The Flying Dress experience out at Fayoum's Wadi El Rayan and the Magic Lake — a flowing dress of your chosen color against the oasis's water and dunes, directed by our photographers away from the crowds.",
    goodFor: [
      "Solo travelers",
      "Engagements & proposals",
      "Couples",
      "Fashion shoots",
      "Personal content",
    ],
    included: [
      "Flying dress in your chosen color",
      "Professional photographer & posing direction",
      "Private transportation, pickup and return from Cairo",
      "Wadi El Rayan & Magic Lake access",
      "Edited images",
      "Egyptian souvenir",
    ],
    addOns: ["High-end retouching upgrade"],
    delivery: ["Professionally edited image gallery", "Optional high-end retouching"],
    faqs: [
      {
        question: "How far is Fayoum from Cairo?",
        answer:
          "Roughly a two-hour drive each way. Private transport, pickup and return from Cairo are included, so the journey is part of the booking rather than something to arrange separately.",
      },
      {
        question: "How is this different from the sand dunes shoot?",
        answer:
          "The setting. The dunes session is pure desert; Fayoum puts the dress against water \\u2014 Wadi El Rayan and the Magic Lake \\u2014 with dunes behind. Access to both sites is included here.",
      },
      {
        question: "Is the dress included?",
        answer:
          "Yes, in the colour you choose, along with the photographer and posing direction throughout the hour.",
      },
      {
        question: "What do I receive?",
        answer:
          "A professionally edited image gallery and an Egyptian souvenir. High-end retouching is an optional upgrade.",
      },
    ],
    destinations: ["Fayoum"],
  },
  {
    slug: "jumping-horse-photoshoot",
    title: "Jumping Horse Photoshoot",
    duration: "1–2 hours",
    price: { amount: 120, originalAmount: 150, currency: "USD" },
    locations: ["Giza Pyramids", "Nine Pyramids View"],
    imageLabel: "Jumping Horse at the Pyramids",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1782938397690-fca3ac1a3158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "A high-energy, action photoshoot at the Nine Pyramids View — you and a trained horse mid-jump against the Pyramids, directed and timed by our photographers for the shot.",
    goodFor: ["Solo travelers", "Couples", "Equestrians", "Influencers & content creators"],
    included: [
      "Private transfer to the Pyramids area",
      "Access to the Nine Pyramids View",
      "Trained horse & professional handler",
      "Private professional photographer",
      "Edited images",
    ],
    addOns: ["Horse riding experience through the desert"],
    delivery: ["Professionally edited image gallery", "Raw, unedited photos the same day"],
    faqs: [
      {
        question: "Do I have to ride the horse?",
        answer:
          "No. A professional handler is with the horse throughout, and the shot is built around you and the horse in frame together. If you do want to ride, a desert riding experience is available as an add-on.",
      },
      {
        question: "Is the horse trained for this?",
        answer:
          "Yes. A trained horse and its handler are included, and the jump is timed by the photographer rather than left to chance \\u2014 which is what the one-to-two-hour window is for.",
      },
      {
        question: "Where is the Nine Pyramids View?",
        answer:
          "A vantage point in the Giza desert where all nine pyramids of the plateau line up in one frame. Private transfer there and access are both included.",
      },
      {
        question: "When do I get the photos?",
        answer:
          "The raw, unedited files the same day, and a professionally edited gallery after that.",
      },
    ],
    destinations: ["Giza"],
  },
  {
    slug: "running-horse-video-jumping-horse-photoshoot",
    title: "Running Horse Video + Jumping Horse Photoshoot",
    duration: "1–2 hours",
    price: { amount: 160, originalAmount: 195, currency: "USD" },
    locations: ["Giza Pyramids", "Nine Pyramids View"],
    imageLabel: "Running Horse at the Pyramids",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1778402634289-f434588c4e68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "The Jumping Horse Photoshoot at the Nine Pyramids View, paired with a cinematic running-horse video — the horse in full gallop with the Pyramids in the background, filmed and directed by our team.",
    goodFor: ["Solo travelers", "Couples", "Equestrians", "Influencers & content creators"],
    included: [
      "Private transfer to the Pyramids area",
      "Access to the Nine Pyramids View",
      "Trained horse & professional handler",
      "Private professional photographer",
      "Jumping horse photoshoot with the Pyramids",
      "Edited images",
    ],
    addOns: ["Running horse video experience with the Pyramids in the background"],
    delivery: ["Professionally edited image gallery", "Raw, unedited photos the same day"],
    faqs: [
      {
        question: "What does this add over the jumping horse photoshoot?",
        answer:
          "A cinematic video of the horse at full gallop with the Pyramids behind it, filmed and directed by our team, on top of the same jumping-horse stills.",
      },
      {
        question: "How long does it take?",
        answer:
          "One to two hours at the Nine Pyramids View \\u2014 the same window as the stills-only session, since the video is filmed in the same setup.",
      },
      {
        question: "Is riding involved?",
        answer:
          "Not unless you want it to be. A trained horse and handler are included, and the galloping shots are theirs to run.",
      },
      {
        question: "What do I receive?",
        answer:
          "The raw, unedited photos the same day, a professionally edited image gallery, and the running-horse video.",
      },
    ],
    destinations: ["Giza"],
  },
  {
    slug: "pyramids-proposal-romance-setup",
    title: "Pyramids Proposal Romance Setup",
    duration: "1 hour",
    price: { amount: 150, currency: "USD" },
    locations: ["Giza Pyramids", "Nine Pyramids View"],
    imageLabel: "Pyramids Proposal Setup",
    imageTone: "giza",
    image: "https://images.unsplash.com/photo-1597500993730-613ee0eab73b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "A private, beautifully styled proposal setup overlooking the Pyramids of Giza — romantic decorations, flowers, and candlelight, arranged and ready before you arrive, so all that's left is the moment itself. Pricing depends on the setup and style you choose. This is enquiry-only — our team confirms your setup, styling, and pricing directly with you.",
    goodFor: ["Engagements & proposals", "Couples"],
    included: [
      "Romantic decorations",
      "Flowers and floral arrangements",
      "Candles and romantic lighting",
      "Elegant proposal setup",
      "Personalized decoration options",
      "Professional setup completed before you arrive",
    ],
    addOns: ["Pyramids Proposal Photoshoot — professional photography & fully edited photos"],
    delivery: [
      "The setup fully styled and ready before you arrive",
      "Optional: professional photography and a fully edited photo gallery with the Pyramids Proposal Photoshoot add-on",
    ],
    faqs: [
      {
        question: "Is photography included?",
        answer:
          "Not in the setup itself. The Pyramids Proposal Photoshoot is an add-on that brings a professional photographer and a fully edited gallery. Most people booking a proposal add it, but the setup stands alone if you would rather keep the moment private.",
      },
      {
        question: "When is everything set up?",
        answer:
          "Before you arrive. The decorations, flowers and candles are styled and ready, so you walk into a finished scene rather than waiting while it is built.",
      },
      {
        question: "Can we choose how it looks?",
        answer:
          "Yes \\u2014 personalised decoration options are part of it. Pricing depends on the setup and style you choose, which is why this one is enquiry-only: our team confirms the styling and the price with you directly.",
      },
      {
        question: "Where does it happen?",
        answer:
          "Overlooking the Pyramids of Giza, at the Nine Pyramids View.",
      },
    ],
    destinations: ["Giza"],
  },
  {
    slug: "pyramids-rooftop-flying-dress-photoshoot",
    title: "Pyramids Rooftop Flying Dress Photoshoot",
    duration: "30\u201345 minutes",
    price: { amount: 199, currency: "USD" },
    locations: ["Giza Rooftop"],
    imageLabel: "Flying Dress on a Giza Rooftop",
    imageTone: "giza",
    // A licensed stand-in until Egypt Eye's own rooftop photography is
    // uploaded in the Studio \u2014 a real rooftop view of the pyramids, which is
    // the one thing this product has to show. Nothing from the partner rate
    // card is used: those frames are watermarked and about 640px wide.
    //
    // Swapping in Egypt Eye's own photo is the upgrade path unsplash.ts
    // describes \u2014 replace the image and drop the credit. A Studio upload wins
    // outright, since withLocalImageFallback() only reaches for this field
    // when Sanity leaves its own empty.
    //
    // Photo: Artfox Photography on Unsplash, "The Pyramids of Giza from a
    // Rooftop Restaurant at sunset" \u2014 unsplash.com/photos/
    // the-pyramids-of-giza-are-seen-in-the-distance-S066vM8eWa4
    // Recorded here rather than in an `imageCredit` field because Photoshoot
    // has no such field yet, unlike Activity and Story. The other six
    // photoshoots carry uncredited Unsplash images for the same reason.
    image: unsplashUrl("photo-1734461255986-048992c9d15d"),
    // Inside the roof's 6am\u20133pm window. Sunrise first because it is the
    // thing no photoshoot inside the Giza complex can offer \u2014 the site does
    // not open until 8am. Sunset is deliberately not offered: the earliest
    // sunset of the year is 16:58 in December, two hours after the roof shuts.
    timeSlots: ["6:00 AM", "9:00 AM", "1:00 PM"],
    // Only the fixed-price add-ons. Light makeup, the hairdresser and the
    // custom dress are all quoted "from", and a price that moves after payment
    // is the one thing the deposit flow must never do \u2014 they stay in `addOns`
    // as prose and are handled by enquiry.
    extras: [
      { label: "Full Makeup", priceUsd: 45 },
      { label: "2 Instagram Reels", priceUsd: 25 },
      { label: "Extra Dress", priceUsd: 99 },
    ],
    // `bookable` is deliberately absent, as it is on every other entry here.
    // The listing renders only Sanity documents, but the product PAGE falls
    // back to this entry, so a bookable local copy would take real deposits at
    // a URL nothing links to before anyone had configured the product.
    // isInstantBookable() needs both a price and the switch, and the switch
    // belongs in the Studio.
    description:
      "A flowing dress on a rooftop above Giza, with the pyramids across the skyline and nobody else in the frame. Shot at first light, while the site below is still closed \u2014 and you leave with more than a hundred edited photographs rather than a handful.",
    goodFor: [
      "Solo travelers",
      "Couples",
      "Honeymoons",
      "Birthdays",
      "Content creators",
    ],
    included: [
      "Flying dress from our collection, in the colour you choose",
      "Professional photographer and full posing direction",
      "An assistant to manage the dress throughout",
      "Door-to-door transport, pickup and return",
      "100+ colour-graded photographs",
      "Delivered within 6\u201310 days",
    ],
    addOns: [
      "Light makeup",
      "Hairdresser",
      "Keep a custom-made dress",
    ],
    delivery: ["100+ colour-graded photographs", "Delivered within 6\u201310 days"],
    faqs: [
      {
        question: "How many photos do I get, and when?",
        answer:
          "More than a hundred, colour-graded, delivered within 6 to 10 days.",
      },
      {
        question: "Why sunrise?",
        answer:
          "The Giza site does not open until 8am, so the first light of the day is something no photoshoot inside the complex can offer. From the roof there is no gate \u2014 the pyramids catch the sun while the plateau below is still empty.",
      },
      {
        question: "Do I need a ticket for the pyramids?",
        answer:
          "No. The shoot is on a private rooftop, not inside the archaeological site, so there is no entry ticket and no queue.",
      },
      {
        question: "Do I bring the dress?",
        answer:
          "No. There are twelve colours to choose from and it is yours for the session. Tell us which one when you book.",
      },
      {
        question: "Can my partner be in the photos?",
        answer:
          "Yes. We have traditional Egyptian attire for men in five styles. Let us know when you book.",
      },
      {
        question: "I have never modelled. Will I know what to do?",
        answer:
          "You do not need to. The photographer directs the whole session, and an assistant handles the dress \u2014 which is most of the work once the wind catches it.",
      },
      {
        question: "How long does it take?",
        answer:
          "Thirty to forty-five minutes on the roof, plus the drive each way, which is included door to door.",
      },
    ],
    destinations: ["Giza"],
  },
];

export function getPhotoshootBySlug(slug: string) {
  return photoshoots.find((p) => p.slug === slug);
}
