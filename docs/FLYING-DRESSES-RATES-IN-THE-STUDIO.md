# Changing your prices from the Studio

The three rates are now yours to edit from a browser. No developer, no deploy.

**Where:** `flyingdressesegypt.com/studio` (or `egypteyetravel.com/studio` — same
backend, either works) → **✿ Flying Dresses — Rates**.

It is already filled in with exactly what the site says today: $150 per hour,
$199 per person, $100 per person. Nothing changed when this went in. You are
editing real values, not an empty form.

## What you change, and what happens

| You edit | Where it shows up |
|---|---|
| **Rooftop reservation — US dollars per HOUR** | The vow renewal page's money section, and every sentence quoting the rooftop rate |
| **Flying dress photoshoot — per PERSON** | The anniversary and maternity money sections, and the answers that quote it |
| **Regular photoshoot — per PERSON** | The same places |
| The label and "what it buys" for each | The line beside the figure |
| The three sentences | The paragraph under the money on the occasion pages |

Change a figure, press Publish, and **every** place that quotes it changes
together. That is the whole point: before this, the price lived in one file and
was also typed into FAQ answers by hand, so changing it in one place left the
other saying the old number.

## Enter the number only

Type `175`. Not `$175`, not `$175 per hour`.

The site writes "per hour" or "per person" itself. That is deliberate: if you
could type the whole string, there would be two places holding one price, and
the day they disagree the page shows the wrong one and nothing warns you.

## Four things you cannot do here, on purpose

**You cannot change "per hour" to "per person".** That is not a price, it is
how the thing is charged, and whole paragraphs are written on it ("a session is
priced per person, an event is the room by the hour"). Changing it means
rewriting that copy too, so it is a job for a developer. Ask and it takes
minutes.

**You cannot set a price to 0.** An empty field means "use the figure in the
code". Zero would mean "free", which is what a customer would read and what
Google would index. If something really is free, say so in the detail text.

**You cannot put decoration-is-included on the birthday page.** That sentence
is only printed where decoration really is included: anniversaries, maternity
and vow renewals. You told us birthdays are quoted separately, so that page
does not print it no matter what is typed in the box.

**You cannot break a price with a typo.** If a figure ever arrives as blank,
negative, a fraction or nonsense, the site falls back to the figure in the code
rather than publishing it. A page will never show "$NaN per person".

## If you clear a field

It goes back to what the code says. Clearing is how you undo, not how you blank
something out. To actually remove a sentence, replace it with the wording you do
want.

## Still not here

The package prices ($179, $199, $349, $399 on the photoshoot pages) are a
separate thing and already editable under **✿ Flying Dresses — Photoshoots**.

The music and experiences pages still quote `$150` as typed text in a few
places. Those are on the list and will follow the rate card like the occasion
pages do; until then, if you change the rooftop rate, tell me and I will sweep
the rest.

A minimum booking, a deposit, an overtime rate and a cancellation policy are
still unpublished because none has been set. If you set one, change the
"Terms that have not been set" box **and tell me**, because a published deposit
changes what the booking flow is allowed to do.
