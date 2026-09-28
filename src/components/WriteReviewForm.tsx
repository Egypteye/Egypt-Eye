"use client";

import { useId, useState, type FormEvent } from "react";
import { useTr } from "@/i18n/LocaleProvider";
import { MEGA_CATEGORIES, type MegaCategory } from "@/lib/reviewSubjects";

// The form at the foot of /testimonials, where a traveler who has been on a
// trip writes their own review.
//
// NOTHING IS SENT ANYWHERE YET. There is deliberately no fetch in this file:
// the submit handler swaps the form for the "under review" panel and the
// traveler's words are discarded. That is the agreed shape for now — the
// page collects nothing and publishes nothing, so no unverified review can
// reach the wall by accident.
//
// When it is wired up, one `await fetch(...)` in handleSubmit is the whole
// change: the field names below are already the payload, the honeypot and
// the disabled-while-sending state are already here, and the panel already
// has a "sending" case to show. See the marked spot in handleSubmit.
//
// The copy is the part to re-read before wiring: the panel tells the
// traveler their review is being checked, which only becomes true once
// something is actually storing it.

export type ReviewProductOption = { key: string; mega: MegaCategory; title: string };

type Status = "idle" | "sending" | "submitted";

const STARS = [1, 2, 3, 4, 5] as const;

const fieldClass =
  "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-sm text-ink outline-none transition focus:border-gold";

export function WriteReviewForm({ products }: { products: ReviewProductOption[] }) {
  const tr = useTr();
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  // Grouped the same way the filters above are, so the traveler picks their
  // trip out of the same three headings they just browsed.
  const grouped = MEGA_CATEGORIES.map((mega) => ({
    label: mega.label,
    items: products.filter((p) => p.mega === mega.mega),
  })).filter((group) => group.items.length > 0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Where the request goes when this is wired up:
    //   setStatus("sending");
    //   await fetch("/api/review-submission", { method: "POST", body: ... });
    // Until then there is no round trip, so "sending" never renders and the
    // panel appears on the click.
    setStatus("submitted");
  }

  if (status === "submitted") {
    return (
      <div className="rounded-3xl border border-black/5 bg-sand-dim px-6 py-12 text-center sm:px-12">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mx-auto h-10 w-10 text-gold-dark"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5l3 1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 className="mt-5 font-display text-2xl font-semibold text-ink">
          {tr("Your review is under review")}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-soft/80">
          {tr(
            "Thank you for taking the time to write it. Every review is checked against a real Egypt Eye booking before it appears on this page, so yours will not show up straight away."
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setRating(0);
          }}
          className="mt-6 text-sm font-semibold text-gold-dark underline underline-offset-4 transition hover:text-ink"
        >
          {tr("Write another review")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-sand-dim px-6 py-10 sm:px-10 sm:py-12">
      <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
        {tr("Been on a trip with us? Write a review")}
      </h2>
      <p className="mt-3 max-w-xl text-[15px] text-ink-soft/80">
        {tr(
          "We publish reviews as they are written. We do not edit them to sound better, and we do not write them ourselves."
        )}
      </p>

      <form onSubmit={handleSubmit} className="relative mt-8 grid gap-5">
        {/* Honeypot, same as every other form on the site. */}
        <div className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
          <label>
            {tr("Company")}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-name`} className="mb-1.5 block text-sm font-medium text-ink">
              {tr("Your name")}
            </label>
            <input
              id={`${uid}-name`}
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder={tr("How you would like it to appear")}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-email`} className="mb-1.5 block text-sm font-medium text-ink">
              {tr("Your email")}
            </label>
            <input
              id={`${uid}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={tr("So we can match it to your booking")}
              className={fieldClass}
            />
            <p className="mt-1.5 text-xs text-ink-soft/60">{tr("Never published.")}</p>
          </div>
        </div>

        <div>
          <label htmlFor={`${uid}-product`} className="mb-1.5 block text-sm font-medium text-ink">
            {tr("What did you do with us?")}
          </label>
          <select id={`${uid}-product`} name="product" required defaultValue="" className={fieldClass}>
            <option value="" disabled>
              {tr("Choose your tour, shoot or service")}
            </option>
            {grouped.map((group) => (
              <optgroup key={group.label} label={tr(group.label)}>
                {group.items.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.title}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="other">{tr("Something else")}</option>
          </select>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">{tr("Your rating")}</legend>
          {/* Radios rather than buttons: a real radiogroup, so it arrives
              with the form data, works without JavaScript and is reachable
              with the arrow keys. The stars are the label, not the input. */}
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHovered(0)}
          >
            {STARS.map((value) => {
              const lit = value <= (hovered || rating);
              return (
                <label
                  key={value}
                  onMouseEnter={() => setHovered(value)}
                  className="cursor-pointer p-0.5"
                >
                  <input
                    type="radio"
                    name="rating"
                    value={value}
                    required
                    checked={rating === value}
                    onChange={() => setRating(value)}
                    className="sr-only peer"
                  />
                  <span className="sr-only">
                    {value === 1 ? tr("1 star") : `${value} ${tr("stars")}`}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className={`h-7 w-7 transition peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:rounded ${
                      lit ? "text-gold" : "text-ink/15"
                    }`}
                  >
                    <path d="M10 1.5l2.6 5.6 6.15.62-4.63 4.2 1.3 6.08L10 14.9l-5.42 3.1 1.3-6.08-4.63-4.2 6.15-.62L10 1.5z" />
                  </svg>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor={`${uid}-body`} className="mb-1.5 block text-sm font-medium text-ink">
            {tr("Your review")}
          </label>
          <textarea
            id={`${uid}-body`}
            name="body"
            required
            minLength={30}
            rows={6}
            placeholder={tr("What did you see, who looked after you, and what would you tell a friend who is thinking about it?")}
            className={`${fieldClass} resize-y`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
          >
            {status === "sending" ? tr("Sending…") : tr("Submit my review")}
          </button>
          <p className="text-xs text-ink-soft/60">
            {tr("We check every review before it goes on the site.")}
          </p>
        </div>
      </form>
    </div>
  );
}
