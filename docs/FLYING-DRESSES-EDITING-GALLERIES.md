# Changing the Flying Dresses gallery yourself

You asked for a Studio you can use without me. This is it, and this page is
the whole of how it works.

## Where it is

1. Go to **egypteyetravel.com/studio** and sign in.
2. In the left-hand list, find **✿ Flying Dresses — Galleries**.

It is in the Egypt Eye Studio rather than one of its own, because both brands
run from the same project. The Flying Dresses site itself has no `/studio`
address on purpose: it is locked so the brand's domain cannot serve the admin.

## What you can change, and what you cannot

**You can change**, without me:

- which photographs appear in the "What a morning looks like" gallery
- the order they appear in, by dragging
- the caption under each one
- the layout: an even grid, one large frame with the rest supporting it, or a
  row you scroll sideways
- the heading above the gallery

**You cannot change here** (these are still in code, tell me and I will do it):

- prices, inclusions, cancellation terms
- the wardrobe and its twelve colours
- any other page's text

## Adding a photograph

Open the gallery, scroll to **Frames, in order**, and press Add item.

- **Photograph**: upload it. Landscape works best, because every frame on the
  site is a landscape cell. Upload the biggest version you have; the site makes
  its own smaller copies and it can never make a small one bigger.
- **Describe the photograph**: what is happening in it, for someone who cannot
  see it and for Google. "The Cherry dress on the Giza rooftop, the pyramids
  behind." Not the filename.
- **Whose photograph is this?**: *Ours* for a real client shoot, *a photograph
  of the place* for scenery. This is not decoration. A photograph of the place
  must never sit on the site looking like one of your shoots.
- **Caption**: the line under the frame. Usually the shoot: "Nunu and Kassy
  shoot, Fayoum". Leave it empty for no caption.

Then **Publish**. The site picks it up within the hour, or immediately if you
press **Refresh the site from Sanity** on the `/admin/paypal` page.

## If you do not have the photograph yet

Add the frame, leave **Photograph** empty, and fill in **What should go here**.

The site then draws a designed, labelled panel saying a photograph is coming.
It is deliberately not a picture. The one thing this brand must never do is put
a stock photo where a client photograph belongs, because once that happens
nobody, including you, can tell later which frames were real.

## Two things worth knowing

**Six frames fits best.** The grid shows one, two or three across depending on
the screen, and six divides evenly by all three, so no frame is left alone at
the end of a row. Three, nine or twelve also work.

**Once you publish, the Studio is in charge of that gallery.** Whatever is in
the Studio replaces what the site had before, as a whole set rather than frame
by frame. So if you empty the gallery and publish, the section goes empty: that
is treated as something you meant, not a mistake to undo for you. Add the
frames back and publish again to restore it.

## If a change does not show

In order, the usual causes:

1. It is saved as a draft. The **Publish** button is still orange.
2. The page is cached. Press **Refresh the site from Sanity** on
   `/admin/paypal`.
3. The `galleryId` was changed. That field is how the page finds the gallery
   and it should stay as "Home page: What a morning looks like". The heading
   above it is the one that is safe to rename.

If none of those is it, tell me what you changed and I will look.
