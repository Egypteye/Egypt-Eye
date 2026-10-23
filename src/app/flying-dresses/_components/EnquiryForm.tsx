"use client";

import { useMemo, useState } from "react";
import { experienceBySlug, flyingDressExperiences } from "@/content/flyingDressExperiences";
import { track } from "../_lib/analytics";
import { RENTAL_DELIVERY_LABELS, addOns, dresses, flyingDressEnquiry, mensOutfits, packagePricePhrase, packages, rentalServices, urgentCall, whatsappHref } from "@/content/flyingDresses";
import { NAMING_NOTE, accessoryCategories, accessoryByRef } from "@/content/flyingDressAccessories";
import { PhoneField } from "@/components/PhoneField";

/**
 * The enquiry form.
 *
 * -------------------------------------------------------------------------
 * ONE QUESTION FIRST, AND THE REST OF THE FORM ANSWERS TO IT
 * -------------------------------------------------------------------------
 * This used to be one flat list of every field the business could possibly
 * want, and the list was the problem. Somebody who wanted to hire a dress for
 * an afternoon scrolled past a photoshoot location, a headcount and eleven
 * priced photoshoot extras before reaching anything that applied to them; the
 * same visitor could tick "full makeup" on a dress rental and the desk would
 * get an enquiry it had to unpick by hand. Four products in one undivided
 * form reads as one product with a lot of caveats.
 *
 * So the first control asks WHAT, and everything after it is a consequence of
 * the answer:
 *
 *   A photoshoot      location, occasion, headcount, dress, extras
 *   Rent a dress      which dress, dates, how it reaches you
 *   Accessories       which pieces, dates, how they reach you
 *   Men's attire      which gawn, dates, how it reaches you
 *
 * `intent` is the only new piece of state. The payload is unchanged: the
 * three hire intents ARE the three rental slugs, so `service` is still a
 * rental slug or an empty string and the route, the email and the analytics
 * all carry on reading exactly what they read before.
 *
 * THE TWO GATED PICKERS. Accessories and men's attire are each a priced extra
 * AND a wardrobe to choose from, and offering the wardrobe to everybody was
 * how the old form implied both were included. Now the extra is the gate: tick
 * "Accessories" and the thirteen pieces appear, tick "Traditional attire for
 * men" and the five gawns do. Nobody is choosing from a collection they have
 * not asked to be quoted for, and nobody is quoted for a collection they have
 * not chosen from. On the hire paths the gate is the intent itself, because
 * there the wardrobe IS the enquiry.
 *
 * -------------------------------------------------------------------------
 * TWO WAYS OUT, AND BOTH ARE REAL
 * -------------------------------------------------------------------------
 * The form posts to /api/flying-dresses-enquiry, which emails the desk. The
 * WhatsApp button beside it opens a message pre-filled from whatever is
 * currently typed in. Neither is a decoration for the other: a visitor who
 * fills three fields and then decides they would rather chat gets those three
 * fields carried into the chat.
 *
 * The WhatsApp link is a real <a href>, built from component state. It works
 * with no network round-trip, and it is the stated fallback if the POST fails
 * — which it will on any deployment with no RESEND_API_KEY, so that path is
 * not hypothetical.
 *
 * -------------------------------------------------------------------------
 * VALIDATION
 * -------------------------------------------------------------------------
 * Name and email only. Everything else is optional, deliberately: each extra
 * required field on an enquiry form costs completions, and the business can
 * ask for a date in the reply. The server enforces the same two, so the
 * browser's copy is a convenience rather than the rule.
 *
 * Errors are rendered as text next to the field AND wired with
 * `aria-invalid` + `aria-describedby`, because a red border is invisible to a
 * screen reader and to a lot of colour-blind visitors. The summary at the top
 * is focused on failure so a keyboard visitor is told what happened instead of
 * being left where they were.
 *
 * -------------------------------------------------------------------------
 * WHAT IT DOES NOT DO
 * -------------------------------------------------------------------------
 * No card fields. No date-availability check. No total. No "booking
 * confirmed". The success message says the enquiry was sent and that nothing
 * is booked, which is the whole truth about what just happened.
 */

type Status = "idle" | "sending" | "sent" | "error";

/**
 * What the visitor is here for. The three hire values ARE rental slugs, which
 * is what keeps the payload identical to the flat form's — see the note above.
 */
type Intent = "photoshoot" | "dress-rental" | "accessories" | "mens-wear";

const INTENTS: { id: Intent; label: string; blurb: string }[] = [
  {
    id: "photoshoot",
    label: "A photoshoot",
    blurb: "A session with our photographer and stylist, in the dress.",
  },
  {
    id: "dress-rental",
    label: "Rent a dress",
    blurb: "The dress on its own, for your own camera. No photographer.",
  },
  {
    id: "accessories",
    label: "Accessories",
    blurb: "Headpieces, collars, earrings, cuffs and rings.",
  },
  {
    id: "mens-wear",
    label: "Men's attire",
    blurb: "Five styles of traditional gawn.",
  },
];

/** The two add-on ids that open a wardrobe rather than just being ticked. */
const ACCESSORIES_EXTRA = "accessories";
const MENS_EXTRA = "mens-attire";

export function EnquiryForm({
  initialPackage = "",
  initialService = "",
  initialExperience = "",
  initialDress = "",
  initialMens = "",
  phone: contactPhone = urgentCall.fallback,
}: {
  initialPackage?: string;
  initialService?: string;
  initialExperience?: string;
  initialDress?: string;
  initialMens?: string;
  /**
   * The live primary number, for the failure state below. Defaults to the
   * content file so a caller that has no settings to hand still renders a
   * real number rather than nothing; the enquire page passes the Studio's.
   */
  phone?: { display: string; tel: string };
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneProblem, setPhoneProblem] = useState<string | null>(null);

  // THE LINK DECIDES THE OPENING ANSWER, because the link already knows it.
  // /enquire?service=mens-wear comes from the men's wear page, and asking
  // that visitor what they came for would be asking a question they have
  // already answered by clicking.
  const [intent, setIntent] = useState<Intent>(() =>
    initialService === "dress-rental" ||
    initialService === "accessories" ||
    initialService === "mens-wear"
      ? initialService
      : "photoshoot"
  );
  const isShoot = intent === "photoshoot";

  const [pkg, setPkg] = useState(initialPackage);
  // Selectable now rather than carried. The catalogue is eight occasions and
  // the old form had no way to say "this is a proposal" — which is the single
  // most useful thing the desk can know before it replies, because it changes
  // the timing, the discretion and who else is told.
  const [experience, setExperience] = useState(initialExperience);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("");
  const [dress, setDress] = useState(initialDress);
  const [mens, setMens] = useState(initialMens);
  const [accessories, setAccessories] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [hotel, setHotel] = useState("");
  const [delivery, setDelivery] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    form?: string;
  }>({});

  /**
   * The hire slug the payload carries. Derived, never stored twice: a second
   * piece of state saying the same thing as `intent` is a second thing that
   * can disagree with it.
   */
  const service = isShoot ? "" : intent;

  /** Delivery only makes sense when something is being handed over. */
  const needsDelivery = !isShoot;

  // Which wardrobes are open. On a shoot the priced extra is the gate; on a
  // hire the intent is, because there the wardrobe is the whole enquiry.
  const showAccessories = isShoot ? extras.includes(ACCESSORIES_EXTRA) : intent === "accessories";
  const showMens = isShoot ? extras.includes(MENS_EXTRA) : intent === "mens-wear";
  const showDress = isShoot || intent === "dress-rental";

  /**
   * Fields the visitor filled in and then switched away from are dropped
   * rather than carried silently. Somebody who picked the Pyramids Rooftop,
   * changed to a dress rental and sent it should not have a rooftop in the
   * email: they un-asked for it, and a stale value in an enquiry is a
   * question the desk has to ring up and resolve.
   */
  const chooseIntent = (next: Intent) => {
    setIntent(next);
    setDelivery("");
    if (next !== "photoshoot") {
      setPkg("");
      setExperience("");
      setPeople("");
      setExtras([]);
    }
    if (next !== "photoshoot" && next !== "dress-rental") setDress("");
    if (next !== "photoshoot" && next !== "mens-wear") setMens("");
    if (next !== "photoshoot" && next !== "accessories") setAccessories([]);
  };

  /** Unticking the extra closes its wardrobe and forgets what was in it. */
  const toggleExtra = (id: string, checked: boolean) => {
    setExtras((current) => (checked ? [...current, id] : current.filter((x) => x !== id)));
    if (!checked && id === ACCESSORIES_EXTRA) setAccessories([]);
    if (!checked && id === MENS_EXTRA) setMens("");
  };

  // The WhatsApp message, kept in sync with the form. Built through the same
  // encoder the buttons elsewhere on the site use, so there is one message
  // shape rather than one per entry point.
  const whatsappMessage = useMemo(() => {
    const chosenPackage = packages.find((p) => p.slug === pkg);
    const chosenService = rentalServices.find((s) => s.slug === service);
    // The experience is in the subject too. Without it, a visitor who read the
    // whole proposal page, opened the form and then chose WhatsApp arrived in
    // the chat asking about "a flying-dress photoshoot" — the same context
    // leak the phone bar had, on the other of the two paths out of this form.
    const chosenExperience = experienceBySlug(experience);
    return flyingDressEnquiry({
      subject:
        chosenService?.title ?? chosenPackage?.title ?? chosenExperience?.title ?? undefined,
      name,
      location: chosenPackage?.name,
      date,
      people,
      dress: dresses.find((d) => d.id === dress)?.name,
      mensOutfit: mensOutfits.find((m) => m.id === mens)?.name,
      // Name AND reference. The name is what they will say on the phone; the
      // reference is what the desk matches against the rail of stock.
      accessories: accessories
        .map((ref) => accessoryByRef(ref))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((item) => `${item.name} (${item.ref})`),
      extras: extras
        .map((id) => addOns.find((a) => a.id === id)?.label)
        .filter((label): label is string => Boolean(label)),
      hotel,
      delivery: delivery ? RENTAL_DELIVERY_LABELS[delivery as "hotel-delivery" | "collection"] : undefined,
      notes: message,
    });
  }, [pkg, service, experience, name, date, people, dress, mens, accessories, extras, hotel, delivery, message]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: typeof errors = {};
    if (!name.trim()) next.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Please give us an email address we can reply to.";
    }
    // A NUMBER WITHOUT A COUNTRY CODE IS NOT A NUMBER WE CAN RING.
    //
    // Asked for directly, and the reason is in the enquiries themselves: they
    // arrive as "01285343630", which is dialable from inside Egypt and from
    // nowhere else. The desk then cannot call it, and WhatsApp — the channel
    // this brand actually runs on — cannot resolve it at all, because WhatsApp
    // identifies an account by its full international number.
    //
    // The field STAYS OPTIONAL. Plenty of people would rather be emailed, and
    // making a phone number mandatory to ask a question costs more enquiries
    // than it saves. But a number that IS given has to be one we can use.
    //
    // What counts as usable is NOT decided here. This used to carry its own
    // regular expression — leading +, one to four digits, then six more — and
    // its own wording for failing it, which made three different answers to
    // the same question across the site: this, the booking popup's, and the
    // one the shared field briefly grew. src/lib/booking/phone.ts is the
    // authority; PhoneField hands its verdict back and this records it.
    if (phoneProblem) {
      next.phone = phoneProblem;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("idle");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/flying-dresses-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          package: pkg,
          service,
          experience,
          date,
          people,
          dress,
          mens,
          accessories,
          extras,
          hotel,
          delivery,
          message,
          company,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setErrors({ form: data.error || "We could not send that just now." });
        setStatus("error");
        return;
      }
      setStatus("sent");

      // AFTER the server confirmed it, and only then.
      //
      // The brief's rule, and the right one: do not record an outcome the
      // system has not verified. A lead counted on submit rather than on a
      // 2xx counts the sends that failed, and a conversion number that is
      // quietly too high is worse than none — it is the number someone
      // spends money against.
      //
      // The subject is a product slug or nothing. No name, no email, no
      // message: see the note at the top of _lib/analytics.ts.
      track("generate_lead", {
        method: "form",
        item: pkg || service || experience || undefined,
      });
    } catch {
      setErrors({
        form: "We could not reach the server. Please message us on WhatsApp instead.",
      });
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="fd-form-status" role="status">
        <p className="fd-display fd-h4" style={{ margin: "0 0 0.5rem" }}>
          Thank you. Your enquiry is with us.
        </p>
        <p style={{ margin: "0 0 0.75rem" }}>
          We have emailed you a copy. We will come back to you about the date, and about the price
          where it is not published.
        </p>
        <p className="fd-muted" style={{ margin: 0, fontSize: "var(--fd-step--1)" }}>
          Nothing is booked yet and nothing has been charged. If you chose a dress we have noted it
          as your preference, and we will tell you before your shoot if it is not available on the
          day.
        </p>
      </div>
    );
  }

  return (
    <form className="fd-form" onSubmit={onSubmit} noValidate>
      {status === "error" && errors.form ? (
        <div className="fd-form-status" data-tone="error" role="alert" tabIndex={-1}>
          <p style={{ margin: "0 0 0.75rem" }}>{errors.form}</p>
          <a
            className="fd-btn fd-btn-ghost"
            href={whatsappHref(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Send it on WhatsApp instead
            <span className="fd-sr"> (opens in a new tab)</span>
          </a>
          {/* AND THE NUMBER, IN PLAIN TEXT.
              This block is what somebody sees when their enquiry did not
              send, which is the moment they have least patience for another
              route that might also fail. WhatsApp was the only way out of
              here, and WhatsApp is an app that has to be installed and
              signed in to. A tel: link needs neither, and the digits are
              written out so they can be copied by somebody for whom neither
              link does anything. */}
          <p style={{ margin: "0.75rem 0 0" }}>
            Or call us on{" "}
            <a href={`tel:${contactPhone.tel}`} className="fd-link">
              {contactPhone.display}
            </a>
            .
          </p>
        </div>
      ) : null}

      {/* ===================================================================
          STEP ONE. Radios rather than a dropdown, and the reason is that a
          dropdown hides the answers: this control decides what the rest of
          the page even contains, and a visitor who cannot see that hiring a
          dress on its own is possible will never open a menu to find out.
          =================================================================== */}
      <fieldset className="fd-intent">
        <legend className="fd-intent-legend">What would you like to book?</legend>
        <div className="fd-intent-grid">
          {INTENTS.map((option) => (
            <label
              key={option.id}
              className="fd-intent-option"
              data-selected={intent === option.id ? "true" : undefined}
            >
              <input
                type="radio"
                name="intent"
                value={option.id}
                checked={intent === option.id}
                onChange={() => chooseIntent(option.id)}
              />
              <span>
                <span className="fd-intent-label">{option.label}</span>
                <span className="fd-intent-blurb">{option.blurb}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="fd-hint" style={{ marginTop: "0.75rem" }}>
          {isShoot
            ? "Everything below is about the session. Dress hire, accessories and men's attire can be added to it further down."
            : "A hire, without a photographer. Tell us the dates and we will come back with the terms and the cost in writing."}
        </p>
      </fieldset>

      <div className="fd-form fd-form-2">
        <Field id="fd-name" label="Your name" error={errors.name} required>
          <input
            id="fd-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "fd-name-error" : undefined}
            required
          />
        </Field>

        <Field id="fd-email" label="Email" error={errors.email} required>
          <input
            id="fd-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "fd-email-error" : undefined}
            required
          />
        </Field>

        <Field
          id="fd-phone"
          label="Phone or WhatsApp"
          error={errors.phone}
          hint="Optional, but it is the fastest way to reach you. Pick your country first so we can actually ring you."
        >
          <PhoneField
            id="fd-phone"
            showInlineError={false}
            value={phone}
            onChange={(next, problem) => {
              setPhone(next);
              setPhoneProblem(problem);
            }}
            placeholder="100 123 4567"
            invalid={Boolean(errors.phone)}
            describedBy={errors.phone ? "fd-phone-error" : undefined}
          />
        </Field>

        <Field
          id="fd-date"
          label={isShoot ? "Preferred date" : "When do you need it"}
          hint="We will confirm whether it is free."
        >
          <input
            id="fd-date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        {isShoot ? (
          <>
            <Field id="fd-package" label="Photoshoot location">
              <select
                id="fd-package"
                name="package"
                value={pkg}
                onChange={(e) => setPkg(e.target.value)}
              >
                <option value="">Not sure yet, advise me</option>
                {packages.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}: {packagePricePhrase(p)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="fd-experience"
              label="What is the occasion"
              hint="It changes how we plan the day. A proposal is run differently from a creator shoot."
            >
              <select
                id="fd-experience"
                name="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="">No particular occasion</option>
                {flyingDressExperiences.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="fd-people" label="How many people">
              <input
                id="fd-people"
                name="people"
                type="number"
                min={1}
                max={20}
                inputMode="numeric"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
              />
            </Field>
          </>
        ) : null}

        {showDress ? (
          <Field
            id="fd-dress"
            label="Dress"
            hint={isShoot ? "A preference, not a reservation." : "Twelve colours. We will confirm the one you pick is free."}
          >
            <select
              id="fd-dress"
              name="dress"
              value={dress}
              onChange={(e) => setDress(e.target.value)}
            >
              <option value="">{isShoot ? "No preference" : "Not sure yet, advise me"}</option>
              {dresses.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {needsDelivery ? (
          <Field id="fd-delivery" label="Delivery or collection">
            <select
              id="fd-delivery"
              name="delivery"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
            >
              <option value="">Either is fine</option>
              <option value="hotel-delivery">{RENTAL_DELIVERY_LABELS["hotel-delivery"]}</option>
              <option value="collection">{RENTAL_DELIVERY_LABELS.collection}</option>
            </select>
          </Field>
        ) : null}

        {/* ===============================================================
            THE PRICED EXTRAS. Photoshoot only: there is nothing to add to
            a dress that is going out on its own, and offering makeup with
            a rental was one of the ways the flat form implied a rental
            came with a session.
            =============================================================== */}
        {isShoot ? (
          <div className="fd-field fd-field-full">
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend
                style={{
                  fontSize: "var(--fd-step--1)",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fd-ink-soft)",
                  padding: 0,
                  marginBottom: "0.6rem",
                }}
              >
                Anything to add
              </legend>
              <div className="fd-swatch-row">
                {addOns.map((addOn) => {
                  const checked = extras.includes(addOn.id);
                  return (
                    <label
                      key={addOn.id}
                      className="fd-swatch"
                      style={{ cursor: "pointer", textTransform: "none", letterSpacing: "0.02em" }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleExtra(addOn.id, e.target.checked)}
                        // 1.5rem = 24px, WCAG 2.2 2.5.8 Target Size (Minimum). These were
                        // 1.1rem/17.6px and failed it.
                        style={{ width: "1.5rem", height: "1.5rem", minHeight: 0, flex: "none" }}
                      />
                      <span>
                        {addOn.label}
                        {": "}
                        {addOn.priceUsd === null
                          ? "on request"
                          : `${addOn.fromPrice ? "from " : ""}$${addOn.priceUsd}`}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="fd-hint" style={{ marginTop: "0.6rem" }}>
                Nothing here is charged now. Anything marked &ldquo;from&rdquo; or &ldquo;on
                request&rdquo; is confirmed with you before you commit.
              </p>
            </fieldset>
          </div>
        ) : null}

        {/* ===============================================================
            THE ACCESSORY COLLECTION, once it has been asked for.

            Checkboxes with the piece, where it is worn and its reference,
            because "Necklace 2" means nothing to somebody choosing and
            everything to the desk reading the email. Grouped by the
            business's own five headings so the order on this list matches
            the order on the collection page they probably just read.
            =============================================================== */}
        {showAccessories ? (
          <div className="fd-field fd-field-full">
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend
                style={{
                  fontSize: "var(--fd-step--1)",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fd-ink-soft)",
                  padding: 0,
                  marginBottom: "0.6rem",
                }}
              >
                Which accessories
              </legend>
              <p className="fd-hint" style={{ marginTop: 0, marginBottom: "0.9rem" }}>
                {NAMING_NOTE}
              </p>
              {accessoryCategories.map((category) => (
                <div key={category.slug} style={{ marginBottom: "1.1rem" }}>
                  <p className="fd-eyebrow" style={{ marginBottom: "0.5rem" }}>
                    {category.title}
                  </p>
                  <div className="fd-pick-list">
                    {category.items.map((item) => (
                      <label key={item.ref} className="fd-pick">
                        <input
                          type="checkbox"
                          checked={accessories.includes(item.ref)}
                          onChange={(e) =>
                            setAccessories((current) =>
                              e.target.checked
                                ? [...current, item.ref]
                                : current.filter((r) => r !== item.ref)
                            )
                          }
                          style={{ width: "1.5rem", height: "1.5rem", minHeight: 0, flex: "none" }}
                        />
                        <span>
                          <span className="fd-pick-name">
                            {item.name}{" "}
                            <span className="fd-pick-ref">{item.ref}</span>
                          </span>
                          <span className="fd-pick-worn">{item.worn}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <p className="fd-hint" style={{ marginTop: "0.2rem" }}>
                {isShoot
                  ? "Accessories are charged on top of the shoot and quoted with it. Pick as many as you like here; nothing is held or charged until we have written back."
                  : "Pick as many as you like. We will come back with what is free on your dates and what it costs, in writing."}
              </p>
            </fieldset>
          </div>
        ) : null}

        {/* ===============================================================
            THE GAWNS, once the extra has been ticked.

            The cost line is not decoration. For most visitors this is the
            only place they find out that dressing a second person is not
            part of the shoot price they just read on the location list —
            see the note on the `mens-attire` add-on in content.
            =============================================================== */}
        {showMens ? (
          <Field
            id="fd-mens"
            label="Which gawn"
            full
            hint={
              isShoot
                ? "Charged on top of the shoot, not included in it. The cost depends on the style and your dates, so we quote it to you in writing before anything is agreed."
                : "Five traditional styles. We will come back with the cost and the fit in writing."
            }
          >
            <select id="fd-mens" name="mens" value={mens} onChange={(e) => setMens(e.target.value)}>
              <option value="">Not sure yet, advise me</option>
              {mensOutfits.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        <Field
          id="fd-hotel"
          label={isShoot ? "Hotel or pickup area" : "Hotel or delivery area"}
          hint={
            isShoot
              ? "For door-to-door transport on the day."
              : "Where in Cairo we would be delivering to, if you would rather not collect."
          }
          full
        >
          <input
            id="fd-hotel"
            name="hotel"
            autoComplete="off"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
          />
        </Field>

        <Field id="fd-message" label="Anything else" full>
          <textarea
            id="fd-message"
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>
      </div>

      {/* Off-screen rather than display:none — some bots fill positioned
          fields and skip hidden ones, which is the point of it. */}
      <div className="fd-honeypot" aria-hidden="true">
        <label htmlFor="fd-company">Company</label>
        <input
          id="fd-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="fd-actions">
        <button className="fd-btn" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </button>
        <a
          className="fd-btn fd-btn-ghost"
          href={whatsappHref(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Send on WhatsApp
          <span className="fd-sr"> (opens in a new tab)</span>
        </a>
      </div>

      <p className="fd-muted" style={{ fontSize: "var(--fd-step--1)", margin: 0 }}>
        This form sends an enquiry. It does not book anything and it never asks for card details.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  required = false,
  full = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`fd-field${full ? " fd-field-full" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required ? (
          <>
            {" "}
            <span aria-hidden="true">*</span>
            <span className="fd-sr"> (required)</span>
          </>
        ) : null}
      </label>
      {children}
      {hint ? <p className="fd-hint">{hint}</p> : null}
      {error ? (
        <p className="fd-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
