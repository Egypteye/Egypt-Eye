# Photo worklist

Replacing stock photography with Egypt Eye's own, working alone, without a
developer.

Every item below is a slot that currently shows a licensed stock photo (or, in
the first group, nothing). None of them is broken — this is an upgrade list,
ordered so that the highest-value slots come first and you can stop whenever
you like.

## How to upload

1. Go to **`/studio`** on the live site and sign in.
2. Pick the document type from the list on the left (named under each group
   below), then the item.
3. Drag your JPEG onto the **photo** field.
4. Set **Alt text** — one plain sentence describing what is in the shot. This
   is what a blind visitor hears and what Google reads.
5. Drag the circle on the image to set the **hotspot** — the part that must
   stay visible when the photo is cropped to a card or a wide hero.
6. Publish.

No git, no deploy, no code. The site picks it up on the next page load.

### Exporting from your Mac

In Photos: **File → Export → Export Unmodified Original** if you shot JPEG, or
**File → Export → Export 1 Photo**, Kind: JPEG, Quality: High, Size: Full.

Two things worth knowing:

- **Do not resize before uploading.** Upload the full-size file once. Sanity
  stores the original and generates every size the site needs on its CDN, and
  Next.js then serves each visitor the smallest one that fits their screen. A
  pre-shrunk photo just permanently throws away quality you might want later
  for a hero.
- **Check the format.** iPhone photos are often HEIC, not JPEG. Sanity accepts
  JPEG, PNG and WebP. The export dialog above converts for you.
- Photos taken on a phone carry **GPS coordinates** in their metadata. For most
  of these that is harmless or even useful, but if a shot was taken somewhere
  you would rather not publish the location of, strip the metadata first
  (Preview → Tools → Show Inspector → remove, or export via Photos which drops
  most of it).

## Priority


### Your own products (no photo at all) — 8

Studio: **Take Egypt Home — Product**

- [ ] `cartouche-double-name` — Two-name cartouche
- [ ] `cartouche-open-back` — Open-back cartouche
- [ ] `papyrus-royal-portrait` — Royal portrait
- [ ] `papyrus-offering-scene` — The offering scene
- [ ] `papyrus-nile-boat` — The Nile boat
- [ ] `clothing-cotton-galabeya` — Cotton galabeya
- [ ] `clothing-embroidered-kaftan` — Embroidered kaftan
- [ ] `oil-collection-sampler` — Three-oil sampler

### Take Egypt Home category heroes — 4

Studio: **Take Egypt Home — Category**

- [ ] `cartouches` — Cartouches
- [ ] `papyrus` — Papyrus
- [ ] `clothing` — Clothing
- [ ] `essence-oils` — Essence Oils

### Photoshoot packages — 6

Studio: **Photoshoot Package**

- [ ] `exclusive-pyramids-photoshoot` — Exclusive Pyramids Photoshoot
- [ ] `flying-dress-photoshoot` — Sand Dunes Flying Dress Photoshoot
- [ ] `fayoum-flying-dress-photoshoot` — Fayoum Flying Dress Photoshoot
- [ ] `jumping-horse-photoshoot` — Jumping Horse Photoshoot
- [ ] `running-horse-video-jumping-horse-photoshoot` — Running Horse Video + Jumping Horse Photoshoot
- [ ] `pyramids-proposal-romance-setup` — Pyramids Proposal Romance Setup

### Tours — 31

Studio: **Tour**

- [ ] `cairo-giza-nile-cruise-signature-trip` — Cairo, Giza & Nile Cruise Signature Trip
- [ ] `1-day-giza-tour` — 1 Day Giza Tour: Exploring Ancient Wonders
- [ ] `fayoum-nature-tour` — Fayoum: The Beautiful Nature of Egypt
- [ ] `red-sea-relaxation` — Egypt's Relaxation Mood: Red Sea
- [ ] `3-day-cairo-giza` — Three-Day Excursion: Cairo & Giza
- [ ] `siwa-oasis` — Desert Dreams: Siwa Oasis
- [ ] `3-days-jordan` — 3 Days Exploring the Wonders of Jordan
- [ ] `5-day-giza-cairo-alexandria` — 5-Day Egypt: Giza, Cairo & Alexandria
- [ ] `6-day-cairo-giza-luxor` — 6 Days: Cairo, Giza & Luxor
- [ ] `8-day-essential-egypt-nile-cruise` — 8 Days Essential Egypt + 5-Day Nile Cruise
- [ ] `10-day-private-luxurious-trip` — 10-Day Private & Luxurious Trip
- [ ] `epic-8-day-egypt-escapade` — Epic 8-Day Egypt Escapade
- [ ] `2-day-luxor-tour` — 2 Days in Luxor: Karnak, Valley of the Kings & Hatshepsut
- [ ] `aswan-abu-simbel-tour` — Aswan & Abu Simbel: Nubia's Ancient Temples
- [ ] `alexandria-day-trip` — Alexandria Day Trip: Egypt's Mediterranean Capital
- [ ] `white-desert-safari-bahariya` — White Desert Safari: Bahariya Oasis & the Black Desert
- [ ] `memphis-saqqara-dahshur-tour` — Memphis, Saqqara & Dahshur: Egypt's Forgotten Pyramids
- [ ] `islamic-coptic-cairo-walking-tour` — Islamic Cairo & Coptic Cairo Walking Tour
- [ ] `4-day-nile-cruise-luxor-aswan` — 4-Day Nile Cruise: Luxor to Aswan
- [ ] `7-night-nile-cruise-luxor-aswan` — 7-Night Nile Cruise: Luxor to Aswan
- [ ] `aswan-nubian-village-philae-tour` — Aswan Nubian Village & Philae Temple Day Tour
- [ ] `ras-mohammed-snorkeling-tour` — Sharm El Sheikh: Ras Mohammed National Park Snorkeling
- [ ] `bahariya-oasis-2-day-safari` — Bahariya Oasis 2-Day Desert Safari
- [ ] `fayoum-wadi-el-rayan-waterfalls-tour` — Fayoum & Wadi El Rayan Waterfalls Tour
- [ ] `black-desert-white-desert-combo` — Black Desert & White Desert Combo Safari
- [ ] `12-day-egypt-grand-tour` — 12-Day Egypt Grand Tour
- [ ] `9-day-egypt-jordan-combo` — 9-Day Egypt & Jordan Combo
- [ ] `cairo-luxor-hurghada-beach-combo` — Cairo, Luxor & Hurghada Beach Combo
- [ ] `4-day-cairo-alexandria-fayoum` — 4 Days: Cairo, Alexandria & Fayoum
- [ ] `private-yacht-nile-cruise-luxor-aswan` — Private Yacht Nile Cruise: Luxor to Aswan
- [ ] `overnight-dahabiya-sail-esna-edfu` — Overnight Dahabiya Sail: Esna to Edfu

### Destination hubs — 16

Studio: **Destination Hub**

- [ ] `cairo` — Cairo
- [ ] `giza` — Giza
- [ ] `luxor` — Luxor
- [ ] `aswan` — Aswan
- [ ] `abu-simbel` — Abu Simbel
- [ ] `siwa` — Siwa
- [ ] `hurghada` — Hurghada
- [ ] `el-gouna` — El Gouna
- [ ] `marsa-alam` — Marsa Alam
- [ ] `sharm-el-sheikh` — Sharm El Sheikh
- [ ] `alexandria` — Alexandria
- [ ] `fayoum` — Fayoum
- [ ] `ain-sokhna` — Ain Sokhna
- [ ] `dahab` — Dahab
- [ ] `saint-catherine` — St. Catherine
- [ ] `western-desert` — The Western Desert

### Extra experiences — 23

Studio: **Experience**

- [ ] `quiet-nile-felucca-tour` — Quiet Nile Felucca Tour
- [ ] `atv-quad-bikes-sahara` — ATV Quad Bikes at Pyramids' Sahara Desert
- [ ] `nile-cruise-dinner-show` — Nile Cruise Dinner + Belly Dancer & Oriental Shows
- [ ] `food-tour` — Food Tour
- [ ] `pyramids-proposal-romance-setup` — Pyramids Proposal Romance Setup
- [ ] `camel-ride-giza-pyramids` — Camel Ride at the Pyramids of Giza
- [ ] `dahshur-village-farm-experience` — Village & Farm Experience in Dahshur
- [ ] `nile-kayaking-cairo` — Kayaking on the Nile in Cairo
- [ ] `fayoum-desert-safari` — 4×4 Desert Safari in Fayoum Oasis
- [ ] `fayoum-overnight-camping` — Overnight Camping in Fayoum Oasis
- [ ] `fayoum-stargazing` — Stargazing in Fayoum Oasis
- [ ] `fayoum-kayaking` — Kayaking in Fayoum Oasis
- [ ] `tunis-village-pottery` — Pottery Experience in Tunis Village, Fayoum
- [ ] `ain-sokhna-private-yacht` — Private Yacht Experience in Ain Sokhna
- [ ] `luxor-hot-air-balloon` — Hot Air Balloon Experience in Luxor
- [ ] `nubian-village-aswan` — Nubian Village Visit in Aswan
- [ ] `abu-simbel-excursion-aswan` — Abu Simbel Excursion from Aswan
- [ ] `giftun-island-yacht-trip` — Giftun Island Yacht Trip in Hurghada
- [ ] `orange-bay-yacht-trip` — Orange Bay Yacht Trip in Hurghada
- [ ] `dolphin-house-marsa-alam` — Dolphin House Trip in Marsa Alam
- [ ] `mount-sinai-climb` — Mount Sinai Climbing Experience from Saint Catherine
- [ ] `white-desert-overnight-camping` — White Desert Overnight Camping from Bahariya Oasis
- [ ] `siwa-salt-lakes` — Salt Lakes Swimming & Floating Experience in Siwa Oasis

### Weekly Trips — NOT yet in the Studio — 7

Studio: **n/a — needs a schema first**

- [ ] `white-desert-overnight-camp` — White Desert Overnight Camp
- [ ] `wadi-el-hitan-moonless-night-camp` — Moonless Night in Wadi El Hitan
- [ ] `wadi-el-hitan-fayoum-day-trip` — Wadi El Hitan & the Fayoum Lakes
- [ ] `dahshur-saqqara-memphis-day-trip` — Dahshur, Saqqara & Memphis
- [ ] `siwa-oasis-long-weekend` — Siwa Oasis Long Weekend
- [ ] `sinai-bedouin-beach-camp` — Sinai Bedouin Beach Camp
- [ ] `alexandria-coast-day-trip` — Alexandria on the Mediterranean
