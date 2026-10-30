/**
 * Every image slot on the Flying Dresses site, declared in one place.
 *
 * WHY A REGISTRY RATHER THAN PATHS SPRINKLED THROUGH THE PAGES
 *
 * Because the honest answer to "which of these photographs are actually the
 * agency's work?" has to be checkable, and it stops being checkable the moment
 * image paths are inline in a dozen components. The brief's hard rule is that
 * temporary imagery must never become indistinguishable from real customer
 * work — so each slot states what it is:
 *
 *   kind: "agency"      the agency's own photography. Real client work.
 *   kind: "location"    real Egypt photography already licensed and in use on
 *                       egypteyetravel.com. Shows the PLACE, and is never
 *                       presented as a flying-dress photograph.
 *   kind: "styled"      the PRODUCT is really ours and really photographed;
 *                       the model and the setting around it are generated.
 *                       Added when the owner supplied the accessory and dress
 *                       frames: they photographed each piece and had it
 *                       composited onto generated models, and confirmed the
 *                       pieces render identically to the wardrobe and that
 *                       delivering the exact piece shown is theirs. The files
 *                       carry C2PA provenance naming OpenAI, so this is not a
 *                       judgement call — it is in the bytes, and a slot that
 *                       said "agency" would be contradicted by its own file.
 *   kind: "reference"   a generated SCENE, commissioned and art-directed by
 *                       the owner against a real location and a real
 *                       offering. Distinct from "styled", which means a real
 *                       photographed product placed in a generated setting:
 *                       here nothing in the frame is claimed as a photograph
 *                       of anything. The owner builds these from their own
 *                       reference of the roof, the view and the wardrobe, and
 *                       takes responsibility for delivering what they show.
 *
 *                       WHAT THEY MAY AND MAY NOT DO. They may illustrate
 *                       what a session produces. They may never stand as
 *                       evidence that it already has, never appear in a
 *                       gallery of client work, and never carry a caption
 *                       naming a shoot, a customer or a date. Every one
 *                       renders with a visible credit saying it is generated.
 *
 *                       It exists because the alternative was worse in both
 *                       directions: filing them as "agency" would be the one
 *                       promotion this file says nobody may make quietly, and
 *                       refusing them outright would throw away imagery the
 *                       owner art-directed for exactly this purpose.
 *
 *   kind: "empty"       no photograph exists. Renders as a designed, labelled
 *                       slot (components/Scene.tsx), never as a stock photo.
 *
 * scripts/check-flying-dresses.mts reads this file: every non-empty slot must
 * point at a file that is actually in public/, and every "agency" slot must be
 * one of the known genuine photographs. A path typo therefore fails a check
 * rather than shipping a broken image, and nobody can quietly promote a
 * location photo to agency work by editing a page.
 *
 * docs/FLYING-DRESSES-ASSET-CHECKLIST.md is the owner-facing version of this
 * list, ordered by how much each missing photograph costs.
 */

export type ImageSlot = {
  kind: "agency" | "location" | "styled" | "reference" | "empty";
  /** null only when kind is "empty". */
  src: string | null;
  /** Describes the image to someone who cannot see it. */
  alt: string;
  /** Intrinsic pixel size, so the box is reserved before the bytes land. */
  width: number;
  height: number;
  /**
   * Who made it, where it is published, or which creator collaboration it
   * came from. Agency work keeps its attribution so a reviewer can trace it.
   */
  credit?: string;
  /** For an empty slot: what should go here, shown on the slot itself. */
  wanted?: string;
};

/**
 * Identity, but it pins each entry's type to ImageSlot.
 *
 * Without it the object literals narrow to their exact shape and `credit` or
 * `wanted` simply does not exist on the ones that omit it — so a page that
 * renders a caption for whichever slot it was handed stops compiling. Wrapping
 * each entry keeps the optional fields in the type while leaving the keys
 * precise, which `Record<string, ImageSlot>` would throw away.
 */
function slot(value: ImageSlot): ImageSlot {
  return value;
}

/**
 * THE TWO GENUINE FLYING-DRESS PHOTOGRAPHS on this deployment.
 *
 * Both are already published on egypteyetravel.com's About page as creator
 * collaborations, and the business states there that its flying-dress shoots
 * are run in-house rather than outsourced — so these are the agency's own
 * sessions. Their original attribution is kept.
 *
 * They are small (800px on the long edge), which is why neither is used
 * full-bleed: a 533px-wide file stretched across a 1440px hero is visibly
 * soft, and softness in the first viewport is the one thing a photography
 * brand cannot afford. They are used at card and column size, where they hold
 * up. Higher-resolution originals are the first line of the asset checklist.
 */
export const agency = {
  blueGownDesert: slot({
    kind: "agency",
    src: "/photos/about/briana-trip-flying-dress.jpg",
    alt: "A flying-dress photoshoot in a blue gown against the Egyptian desert",
    width: 533,
    height: 800,
    credit: "Briana Trip collaboration, May 2022",
  }),
  whiteGownDune: slot({
    kind: "agency",
    src: "/photos/about/cherry-travel-flying-dress.jpg",
    alt: "A flying-dress photoshoot in a white gown on a desert dune",
    width: 800,
    height: 533,
    credit: "Cherry Travel collaboration, July 2023",
  }),
  heroRooftop: slot({
    kind: "agency",
    src: "/photos/flying-dresses/rooftop-group.jpg",
    alt: "Six women on the Giza rooftop with their backs to the camera, arms raised, each in a different colour, a pyramid on the skyline",
    width: 2000,
    height: 1333,
    credit: "Agency shoot, supplied October 2026",
  }),
  rooftopPortrait: slot({
    kind: "agency",
    src: "/photos/flying-dresses/rooftop-gold.jpg",
    alt: "A gold dress fanned out across the Giza rooftop, the wearer facing the two pyramids",
    width: 2000,
    height: 1333,
    credit: "Milya shoot, supplied October 2026",
  }),
  fayoumDress: slot({
    kind: "agency",
    src: "/photos/flying-dresses/fayoum-dress.jpg",
    alt: "An amber dress on the shore at Fayoum, its train thrown out across the sand beside the water",
    width: 2000,
    height: 1333,
    credit: "Nunu and Kassy shoot, Fayoum",
  }),
  assistantAtWork: slot({
    kind: "agency",
    src: "/photos/flying-dresses/assistant.jpg",
    alt: "The assistant at the right of frame, mid-throw, sending the gold train up into the air behind the wearer",
    width: 1600,
    height: 1067,
    credit: "Milya shoot. The assistant is visible at the right of the frame.",
  }),

  /* ---------------------------------------------------------------------
     SUPPLIED OCTOBER 2026, from the owner's photo library.

     These four do the same job the four `location` slots below were doing
     with licensed travel photography and stock: they show the place and
     the celebrations. The difference is that they are OUR work,
     with our clients in them, which is the claim the rest of the site
     makes and the one the pictures should support.
     --------------------------------------------------------------------- */

  /* The romance panel was an Elleena frame: a real couple, a real bronze
     train, three pyramids — and the man barefoot in board shorts and a
     printed shirt. Authentic, and the wrong single image to represent
     "Romance" on a brand selling a luxury morning. This is the same
     rooftop and our own work, dressed the way the page promises. */
  couplesRomance: slot({
    kind: "agency",
    src: "/photos/flying-dresses/couple-romance-rooftop.jpg",
    alt: "A couple on the Giza rooftop at sunrise, he in black tie with his arm around her waist, she laughing in a long lace gown, three pyramids across the horizon behind them",
    width: 2000,
    height: 1333,
    credit: "Alessandra shoot, supplied October 2026",
  }),
  couplesVows: slot({
    kind: "agency",
    src: "/photos/flying-dresses/couple-vows-rooftop.jpg",
    alt: "A couple in formal dress on the Giza rooftop at golden hour, her train laid out behind her, two pyramids clear on the horizon",
    width: 2000,
    height: 1333,
    credit: "Alessandra shoot, supplied October 2026",
  }),
  genderReveal: slot({
    kind: "agency",
    src: "/photos/flying-dresses/gender-reveal-rooftop.jpg",
    alt: "Parents and a guest with arms thrown wide beside lit BABY letters and a pink and blue balloon arch, the pyramids behind them at sunset",
    width: 2000,
    height: 1333,
    credit: "Kayan shoot, supplied October 2026",
  }),
  gizaSand: slot({
    kind: "agency",
    src: "/photos/flying-dresses/giza-plateau.jpg",
    alt: "A visitor standing on the sand at Giza in warm afternoon light, two pyramids filling the frame behind her",
    width: 933,
    height: 1400,
    credit: "Luis shoot, supplied October 2026",
  }),

  /* ---------------------------------------------------------------------
     THE PROPOSALS, supplied October 2026.

     Until this folder arrived the proposal page opened by admitting it had
     never photographed a proposal, and its gallery was the roof with the
     captions saying so. That was the honest thing to publish at the time and
     it is simply no longer true: there are three proposals here, two on the
     roof and one on the plateau, each with the ring box open in frame.

     They are kept as separate slots rather than one "proposal" slot because
     they are three different clients on two different sites, and a page that
     wants "a proposal" almost always wants a specific one: the ask, the ring,
     the setup, or the plateau rather than the roof.
     --------------------------------------------------------------------- */

  /* The complete rooftop setup, sharp and legible, which is why this is the
     frame the proposals category renders uncaptioned at the top. */
  proposalHeartArch: slot({
    kind: "agency",
    src: "/photos/flying-dresses/proposal-heart-arch.jpg",
    alt: "A couple standing inside a heart-shaped arch of red and white roses on the Giza rooftop, gold letters reading Will You Marry Me hung in the arch, a bouquet in her hands and a red carpet and candles at their feet, two pyramids on the horizon",
    width: 2000,
    height: 1333,
    credit: "Moustafa shoot, supplied October 2026",
  }),
  /* The ask itself. Portrait, because the photographer shot it portrait. */
  proposalHeartAsk: slot({
    kind: "agency",
    src: "/photos/flying-dresses/proposal-heart-ask.jpg",
    alt: "A man on one knee holding an open red ring box up to a woman whose hand has gone to her mouth, both inside the heart-shaped floral arch with Will You Marry Me in gold behind them, a pyramid and the Giza skyline beyond the rooftop rail",
    width: 1400,
    height: 2100,
    credit: "Moustafa shoot, supplied October 2026",
  }),
  proposalHeartRing: slot({
    kind: "agency",
    src: "/photos/flying-dresses/proposal-heart-ring.jpg",
    alt: "The same couple a moment later, holding each other inside the floral heart arch with her hand raised to show the ring, the pyramids behind them",
    width: 2000,
    height: 1333,
    credit: "Moustafa shoot, supplied October 2026",
  }),
  /* A second rooftop proposal, a different client and a different setup:
     white flowers rather than red, and the steps dressed instead of an arch
     over a carpet. Worth its own slot because it is the evidence that the
     decoration is built per booking rather than one fixed prop. */
  proposalWhiteAsk: slot({
    kind: "agency",
    src: "/photos/flying-dresses/proposal-white-ask.jpg",
    alt: "A man on one knee with a ring box on flower-lined rooftop steps beneath a white floral arch, the woman's hands raised to her face, three pyramids across the horizon behind them",
    width: 2000,
    height: 1333,
    credit: "Parca shoot, supplied October 2026",
  }),
  proposalWhiteTrain: slot({
    kind: "agency",
    src: "/photos/flying-dresses/proposal-white-train.jpg",
    alt: "A woman on the rooftop steps beside the white floral arch with one arm raised, the long train of her white gown thrown out across the decking behind her, the pyramids beyond",
    width: 2000,
    height: 1333,
    credit: "Parca shoot, supplied October 2026",
  }),
  /* NOT THE ROOFTOP. This one is down on the sand, and every caption that
     uses it has to say so: the proposal page sells a private roof, and a
     visitor who books expecting this frame would be booking the wrong
     thing. */
  proposalPlateauAsk: slot({
    kind: "agency",
    src: "/photos/flying-dresses/proposal-plateau-ask.jpg",
    alt: "A man on one knee on the sand of the Giza plateau holding an open ring box, the woman turning to him with a hand at her face, three pyramids filling the horizon behind them",
    width: 2000,
    height: 1333,
    credit: "Jos shoot, supplied October 2026",
  }),

  /* Two more from the Kayan gender reveal already in the library. The first
     is the only frame in the folder that shows the ANSWER rather than the
     setup, which is the thing the reveal page was describing in words. */
  genderRevealGirl: slot({
    kind: "agency",
    src: "/photos/flying-dresses/gender-reveal-girl.jpg",
    alt: "A couple sitting together on the decorated rooftop steps holding a large pink script balloon reading Girl, pink and blue balloons banked around them",
    width: 1400,
    height: 2100,
    credit: "Kayan shoot, supplied October 2026",
  }),
  genderRevealCouple: slot({
    kind: "agency",
    src: "/photos/flying-dresses/gender-reveal-couple.jpg",
    alt: "A couple holding each other beside lit BABY letters and a pink and blue balloon arch on the rooftop at sunset, the pyramids on the horizon behind them",
    width: 2000,
    height: 1333,
    credit: "Kayan shoot, supplied October 2026",
  }),

  /* ---------------------------------------------------------------------
     SIX COLOURS FROM ONE ROOFTOP SESSION, supplied October 2026.

     These replace the two frames the asset checklist has had at the top of
     its list since the site was built: briana-trip (533x800) and
     cherry-travel (800x533), both creator collaborations from 2022 and 2023,
     both too small to use anywhere but a card. They were the only genuine
     flying-dress photographs the brand had, and the home gallery had to be
     designed around their size.

     These are 6000x4000 camera originals from a single morning, which is
     also why they work as a set: one roof, one light, six colours. The
     collaboration frames are NOT deleted. They are real work, properly
     credited, and they stay on the About page where the subject is the
     collaboration rather than the dress.
     --------------------------------------------------------------------- */
  rooftopPurple: slot({
    kind: "agency",
    src: "/photos/flying-dresses/rooftop-purple.jpg",
    alt: "A woman in a purple gown on the Giza rooftop, the train swept out in a long arc across the decking behind her, two pyramids on the horizon",
    width: 2000,
    height: 1333,
    credit: "AAT shoot, supplied October 2026",
  }),
  rooftopRed: slot({
    kind: "agency",
    src: "/photos/flying-dresses/rooftop-red.jpg",
    alt: "A red gown on the Giza rooftop with its train caught by the wind and filling most of the frame, the pyramids beyond it",
    width: 2000,
    height: 1333,
    credit: "AAT shoot, supplied October 2026",
  }),
  rooftopGreen: slot({
    kind: "agency",
    src: "/photos/flying-dresses/rooftop-green.jpg",
    alt: "A woman in an emerald gown standing at the rooftop rail, the train fanned out across the decking, the pyramids pale behind her",
    width: 2000,
    height: 1333,
    credit: "AAT shoot, supplied October 2026",
  }),
  rooftopBlue: slot({
    kind: "agency",
    src: "/photos/flying-dresses/rooftop-blue.jpg",
    alt: "A cobalt blue gown on the Giza rooftop, its train drawn out along the decking to one side, the pyramids on the skyline",
    width: 2000,
    height: 1333,
    credit: "AAT shoot, supplied October 2026",
  }),
  rooftopBronze: slot({
    kind: "agency",
    src: "/photos/flying-dresses/rooftop-bronze.jpg",
    alt: "A bronze gown on the Giza rooftop with the train lifted and billowing above the cushions along the rail, a pyramid behind",
    width: 2000,
    height: 1333,
    credit: "AAT shoot, supplied October 2026",
  }),
  rooftopAmber: slot({
    kind: "agency",
    src: "/photos/flying-dresses/rooftop-amber.jpg",
    alt: "An amber gown on the Giza rooftop, the train streaming out the full width of the frame, the pyramids behind it",
    width: 2000,
    height: 1333,
    credit: "AAT shoot, supplied October 2026",
  }),

  /* The Fayoum frame that used to be location.fayoumLake, kept because it
     is real work and nothing is gained by losing it. See the comment on
     that slot for why it was replaced. */
  fayoumBlack: slot({
    kind: "agency",
    src: "/photos/flying-dresses/fayoum-black.jpg",
    alt: "A black flying dress on the desert shore at Fayoum, its train thrown out along the ground with Lake Qarun behind",
    width: 1600,
    height: 1067,
    credit: "Fayoum shoot",
  }),
  /* The second Nayma frame: the dress standing, the train laid out down
     the rock towards the water. It goes in the Fayoum detail position so
     that shoot's page shows the place twice rather than once. */
  fayoumRedShore: slot({
    kind: "agency",
    src: "/photos/flying-dresses/fayoum-red-shore.jpg",
    alt: "A red flying dress standing on the white rock at Fayoum with the train laid out down the slope behind it, Lake Qarun and the pale desert beyond",
    width: 2000,
    height: 1333,
    credit: "Nayma shoot, Fayoum",
  }),

  /* ---- THE ROOFTOP WORKING AS A PRODUCTION LOCATION -------------------
     Supplied 29 October 2026 from the owner's Drive, from a real commercial
     production run on the rooftop: a DJ set filmed with a camera rig.

     These are the first frames this site has ever had of a CREW WORKING on
     the roof rather than a finished portrait made there, which is exactly
     what a brand booking a location wants to see and what the creator page
     had nothing of.

     PROVENANCE IS ESTABLISHED DIFFERENTLY FROM THE OCTOBER DRIVE FRAMES and
     it is worth being exact about how, because the usual test does not apply.
     Those were 6000x4000 camera originals carrying EXIF copyright=EGYPT.EYE.
     These two are 3072x4096 phone frames whose EXIF has been stripped, which
     a share or an export does, so there is no copyright tag to read.

     What stands behind them instead:
       - They carry NO generated-media provenance at all. Nothing matching
         c2pa, openai, gpt-image or trainedAlgorithmicMedia appears anywhere
         in their bytes. The generated images in the SAME Drive library carry
         those markers in abundance, so the absence is a real signal here.
       - Their dimensions are phone-native. Every generated image in that
         library is exactly 1536x1024; neither of these is.
       - They are frames from the same session as nine video clips in the
         same folder, which agree with them on venue, light, equipment and
         people.
     check-flying-dresses.mts re-runs the first of those on every run.

     A THIRD FRAME FROM THIS SESSION IS DELIBERATELY NOT HERE, and the reason
     matters more than the frame did. production-rooftop-sunset.jpg was the
     best wide view of the deck in the whole delivery, and it carried the
     VENUE'S WORDMARK on the railing, twice, large and perfectly legible.

     The venue's NAME is a held fact: its Studio switch is off until the owner
     confirms the hotel is happy to be named publicly. A photograph must not
     publish what the switch withholds, and blurring it was tried and
     abandoned — the first pass masked one instance and missed the second,
     which is exactly how this kind of fix fails, and a photograph with two
     smudged patches across it is worse than no photograph.

     So it is withheld rather than doctored, and the owner has been asked. If
     they turn the switch on, this frame goes straight back in at full
     resolution and unaltered. See docs/FLYING-DRESSES-CREATOR-SHOOTS.md. */
  productionDecks: slot({
    kind: "agency",
    src: "/photos/flying-dresses/production-decks-daylight.jpg",
    alt: "Pioneer DJ decks and a mixer set up on the rooftop in full daylight, looking out over the Sphinx and four pyramids of the Giza plateau",
    width: 1350,
    height: 1800,
    credit: "Rooftop production shoot, supplied October 2026",
  }),
};

/**
 * Real Egypt photography, used to show the PLACE.
 *
 * Every one of these is already licensed and in use on egypteyetravel.com.
 * None of them contains a flying dress, and none is captioned or framed as if
 * it did — a location panel says where you will be standing, which is a
 * different claim from "here is a photograph we took of a customer".
 */
export const location = {
  /* Was a Pexels photograph of the plateau. It is now our own, with our
     own client in it — the same place, photographed by us. */
  gizaPlateau: agency.gizaSand,
  /* THIS SLOT USED TO BE A PHOTOGRAPH OF PARKED QUAD BIKES.
     ------------------------------------------------------------------
     `/photos/pexels-20189345.jpg` is a row of rental ATVs under sun
     umbrellas on a beach. Its alt text read "Sahara sand dunes at golden
     hour outside Cairo", and it was the picture illustrating the Sand
     Dunes photoshoot — the $179 product — on the home page, on
     /experiences and on the shoot's own page. Three places where a
     customer deciding between three shoots was shown hired ATVs.

     Nothing in the owner's photo library is a dune: it is rooftop and
     pyramid work. So this now points at the one genuine dune photograph
     the brand has — a real flying dress, on a real dune, ours. It is
     small (800px), which is why the asset checklist still asks for a
     high-resolution dune frame; small and true beats large and wrong. */
  saharaDunes: slot({
    kind: "agency",
    src: "/photos/about/cherry-travel-flying-dress.jpg",
    alt: "A flying-dress photoshoot in a white gown on a desert dune, the train thrown out across the sand",
    width: 800,
    height: 533,
    credit: "Cherry Travel collaboration, July 2023",
  }),
  /* THERE IS NO HORSE SLOT ON THIS BRAND.
     ------------------------------------------------------------------
     A horse-at-Giza frame briefly lived here. Horseback riding is an
     Egypt Eye Travel product, not a Flying Dresses one, and a rider in
     black on a decorated horse tells a visitor on this site that we sell
     something we do not. The home-page panel it illustrated is about the
     rooftop at seven in the morning, so it now shows the rooftop.
     `scripts/check-flying-dresses.mts` fails if a horse photograph is
     referenced from this brand again. */
  /* THE FAYOUM CARD SHOWED A BUILDING.
     ------------------------------------------------------------------
     This slot held a Wandee Travel frame of a traveller sitting in an
     ochre archway. A real photograph, really taken in Fayoum, and the
     wrong one for this panel: the Fayoum shoot is sold as the lakes and
     the white dunes, and the card illustrating it showed masonry and no
     flying dress. The owner spotted it on a phone and said so.

     It is the same fault as the quad bikes on the dunes card, in a
     milder form: the picture does not show the product. A visitor
     choosing between three shoots sees a dress on a dune, a dress on a
     rooftop, and then a woman in an archway.

     `fayoum-black.jpg` was already in the library and used nowhere: a
     black flying dress with the train thrown out across the ground,
     Lake Qarun behind it. Landscape at 1600x1067, so it fills
     fd-ratio-landscape without the upright crop the archway needed.

     The archway photograph is not deleted. It is still the right frame
     for the credibility rail on the About page, where the subject is
     the collaboration and not the shoot. */
  /* UPGRADED OCTOBER 2026, and the reason is in the sales copy.
     ------------------------------------------------------------------
     The Fayoum shoot is sold as "the lakes and the white dunes". The
     black-dress frame that held this slot showed the dress and the
     ground it was lying on, with Lake Qarun a thin line at the back,
     and at 1600x1067 it was the smallest hero on the site. It was
     chosen because it was the best of three.

     The Nayma folder has the frame the copy was describing: the dress
     on the white rock with the train running the width of the picture
     and the lake filling the middle distance behind it. Same shoot,
     6000x4000. It carries this slot across all four places that read
     it: the Fayoum hero, the experiences card, the home page and the
     marquee.

     The black frame is kept below rather than deleted. It is real
     work. */
  fayoumLake: slot({
    kind: "agency",
    src: "/photos/flying-dresses/fayoum-red-lake.jpg",
    alt: "A red flying dress on the white rock above Lake Qarun at Fayoum, the train running the full width of the frame behind it and the lake and pale desert beyond",
    width: 2000,
    height: 1333,
    credit: "Nayma shoot, Fayoum",
  }),
};

/**
 * The slots with nothing in them yet.
 *
 * These render as tinted, bordered fields with the wanted subject written
 * across them and the words "photograph to come" underneath. That is the
 * point: a reviewer, the owner and a visitor can all see exactly which frames
 * are still missing, and no stock image is ever mistaken for the agency's
 * work.
 */
/**
 * THE PHOTOGRAPH FOR AN EXPERIENCE CATEGORY, where one honestly exists.
 *
 * Eight categories; three photographs. That ratio is the point of this map
 * rather than an embarrassment to be padded out. There is a real gender
 * reveal, a real couple on the rooftop and now a real proposal, so those
 * three categories get a picture. There is no birthday, no maternity
 * session, no creator shoot and no DJ set in the library, so those four get
 * none — and they render the designed card they rendered before, which says
 * what the experience is in words.
 *
 * The four that go without are NOT short of candidates: the October 2026
 * folder offers an image for every one of them. They are generated, and
 * their own bytes say so (C2PA, "OpenAI", "trainedAlgorithmicMedia"). An
 * uncaptioned frame at the top of a category page is the strongest "this is
 * our work" claim the site makes, so a generated one cannot go there. See
 * docs/FLYING-DRESSES-DRIVE-PHOTO-PLACEMENT.md.
 *
 * The alternative, before the proposals arrived, was to illustrate
 * "Proposals above the pyramids" with the wedding couple, who are not
 * proposing. A visitor cannot tell the difference, which is exactly why it
 * would have been a lie rather than a liberty.
 *
 * Keyed by ExperienceCategoryId. Missing is the normal case.
 */
/**
 * Generated scenes the owner art-directed, for the commercial shoots page.
 *
 * Supplied October 2026 in the Drive library's own "Creator, editorial and
 * brand shoots" folder, and the owner was explicit about them: they are built
 * with careful reference to the real roof, the real view and the real
 * wardrobe, and delivering what they show is the business's responsibility.
 *
 * All four are 1536x1024 and their source files carry C2PA provenance naming
 * OpenAI, "gpt-image" and "trainedAlgorithmicMedia". That is not a judgement
 * call, it is in the bytes, which is exactly why they are filed here and not
 * as agency work. (The served JPEGs lose the C2PA box in conversion, the same
 * way the dress-rental composite does. The provenance record is this file.)
 *
 * WHAT THEY ARE FOR. The creator page sells a LOCATION and a set of services,
 * to brands planning a shoot that has not happened yet. An illustration of
 * what the roof produces is a legitimate thing to show them, in the way an
 * architect's render is. What it must never become is a portfolio: not one of
 * these may be captioned as a client session, given a date, or placed in a
 * gallery of real work. scripts/check-flying-dresses.mts enforces the credit;
 * the rest is editorial discipline on whoever writes the captions.
 */
export const reference = {
  creatorPortrait: slot({
    kind: "reference",
    src: "/photos/flying-dresses/creator-rooftop-portrait.jpg",
    alt: "A woman in a cream two-piece seated on a kilim-covered rooftop daybed at golden hour, three pyramids of the Giza plateau behind her",
    width: 1536,
    height: 1024,
    credit: "Generated scene, art-directed from our own rooftop and wardrobe. Not a photograph of a client session.",
  }),
  creatorCouple: slot({
    kind: "reference",
    src: "/photos/flying-dresses/creator-rooftop-couple.jpg",
    alt: "A couple in cream linen reclining together on the rooftop daybed at golden hour with the pyramids behind them",
    width: 1536,
    height: 1024,
    credit: "Generated scene, art-directed from our own rooftop and wardrobe. Not a photograph of a client session.",
  }),
  creatorLinen: slot({
    kind: "reference",
    src: "/photos/flying-dresses/creator-rooftop-linen.jpg",
    alt: "A woman in an open cream linen shirt and wide trousers reclining on the rooftop daybed, the pyramids across the skyline behind her",
    width: 1536,
    height: 1024,
    credit: "Generated scene, art-directed from our own rooftop and wardrobe. Not a photograph of a client session.",
  }),
  creatorWorking: slot({
    kind: "reference",
    src: "/photos/flying-dresses/creator-rooftop-working.jpg",
    alt: "A woman working on the rooftop daybed with a laptop, notebook and coffee, the pyramids behind her at golden hour",
    width: 1536,
    height: 1024,
    credit: "Generated scene, art-directed from our own rooftop and wardrobe. Not a photograph of a client session.",
  }),
};

export const categoryPhoto: Partial<Record<string, ImageSlot>> = {
  // Each of these is GENUINELY the occasion its category sells, which is the
  // bar for appearing here: the route renders this frame large, at the top,
  // with a credit but NO CAPTION, so it reads as "this is what we do".
  "gender-reveal": agency.genderReveal,
  // The whole rooftop setup with the sign legible in frame. Nobody has to be
  // told what they are looking at, which is the test for this map.
  proposals: agency.proposalHeartArch,
  // The Alessandra shoot is an anniversary shoot in wedding clothes, so it
  // belongs to this category and needs no qualifier.
  romance: agency.couplesRomance,
  // "vows-engagement" DELIBERATELY ABSENT. The obvious candidate is
  // agency.couplesVows, and it is the same anniversary shoot: a couple in
  // wedding clothes. Uncaptioned at the top of a vow renewal page it claims a
  // ceremony we have never photographed. It appears in that page's gallery
  // instead, where its caption says what it actually is.
};

export const empty = {
  couple: slot({
    kind: "empty",
    src: null,
    alt: "A couple photographed together, one in a flying dress and one in a traditional gawn",
    width: 1800,
    height: 1200,
    // Deliberately still empty. The supplied group photographs are several
    // women together, which is a different picture and a different sale: this
    // slot sits beside the men's wear and has to show a dress and a gawn in
    // one frame or it is arguing for something it does not show.
    wanted: "A couples' frame: a dress and a gawn together",
  }),
  mensGawn: slot({
    kind: "empty",
    src: null,
    alt: "The five traditional gawns, photographed as a set",
    width: 1800,
    height: 1200,
    // The five garments are photographed now and render in the wardrobe grid
    // from dressPhotos. What this landscape slot still wants is the thing none
    // of those five frames is: all five together, so the range reads at a
    // glance instead of one portrait at a time.
    wanted: "The five gawns together in one frame",
  }),
  accessories: slot({
    kind: "empty",
    src: null,
    alt: "The accessories available to wear with a flying dress",
    width: 1800,
    height: 1200,
    // Still empty, and still worth filling: the thirteen accessory frames on
    // the rentals page are portraits of single pieces, and this slot is the
    // landscape header that would show the collection together. Nothing in
    // the folder is that shot.
    wanted: "The accessory collection together, in one landscape frame",
  }),
  redSeaYacht: slot({
    kind: "empty",
    src: null,
    alt: "A flying dress photographed on a yacht on the Red Sea at Ain Sokhna",
    width: 1800,
    height: 1200,
    // The October 2026 operating brief confirms this experience exists and
    // the website did not mention it at all. There is no photograph of it in
    // the library yet, so it renders as a labelled gap rather than borrowing
    // a dune or a rooftop — which would show a customer the wrong sea.
    wanted: "The yacht at Ain Sokhna: the only one of the four on water",
  }),
  dressRental: slot({
    // The hire range, in one frame. NOT the packed-for-delivery photograph
    // this slot was waiting for, which is still worth taking: this shows what
    // you can hire, not what arrives at your hotel.
    kind: "styled",
    src: "/photos/flying-dresses/rent-a-dress-collection.jpg",
    alt: "A row of flying dresses in teal, blue, red, green, black, white, gold, purple and pink, displayed on mannequins in open desert",
    width: 1536,
    height: 1024,
    credit: "Dresses photographed from the collection; the display and setting are generated.",
  }),
};

/**
 * The wardrobe in one photograph.
 *
 * Added when the owner's October 2026 shoot folder turned out to contain group
 * frames: seven women, seven colours in one frame, which says what the
 * wardrobe page spends a grid of tiles saying.
 *
 * Both descriptions of this file used to be wrong about it — "eight women"
 * here and "a line of gowns in twelve colours" in shareImages. It is seven
 * women wearing the dresses, not a rail of them, and the count of colours in
 * the frame has nothing to do with the size of the collection. Counted off
 * the photograph itself.
 */
export const wardrobeLineup = slot({
  kind: "agency",
  src: "/photos/flying-dresses/wardrobe-lineup.jpg",
  alt: "Seven women together on the Giza rooftop, each in a different colour from the collection",
  width: 2000,
  height: 1333,
  credit: "Agency group shoot, supplied October 2026",
});

/** Everything, for the check script and the asset checklist. */
export const allSlots: Record<string, ImageSlot> = {
  ...agency,
  ...location,
  ...reference,
  ...empty,
  wardrobeLineup,
};
