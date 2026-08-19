"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/content/site";

const INTERESTS = [
  "Ancient History",
  "Photography / Photoshoots",
  "Desert Adventure (ATV, Safari)",
  "Nile Cruise",
  "Red Sea / Beach",
  "Food & Culture",
  "Jordan Add-On",
];

export function CustomizeForm() {
  const [interests, setInterests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<string | null>(null);

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name");
    const dates = form.get("dates");
    const travelers = form.get("travelers");
    const message = form.get("message");

    const text = [
      `Hi Egypt Eye! I'd like to customize a tour.`,
      `Name: ${name}`,
      `Dates: ${dates}`,
      `Travelers: ${travelers}`,
      interests.length ? `Interests: ${interests.join(", ")}` : null,
      message ? `Notes: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `${site.contact.whatsappLink}?text=${encodeURIComponent(text)}`;
    setSubmitted(url);
    window.open(url, "_blank");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Full name
          <input
            required
            name="name"
            className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
            placeholder="Jane Traveler"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Number of travelers
          <input
            required
            name="travelers"
            className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
            placeholder="2 adults"
          />
        </label>
      </div>

      <label className="mt-5 flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
        Travel dates
        <input
          required
          name="dates"
          className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
          placeholder="e.g. March 10–17, 2027"
        />
      </label>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-ink-soft">
          What are you most interested in?
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <button
              type="button"
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`rounded-full px-3.5 py-2 text-xs font-medium transition ${
                interests.includes(interest)
                  ? "bg-gold text-ink"
                  : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
        Anything else we should know?
        <textarea
          name="message"
          rows={4}
          className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
          placeholder="Budget range, special occasions, accessibility needs..."
        />
      </label>

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
      >
        Send via WhatsApp
      </button>

      {submitted && (
        <p className="mt-3 text-xs text-ink-soft/60">
          If WhatsApp didn&rsquo;t open automatically,{" "}
          <a href={submitted} target="_blank" className="underline">
            click here
          </a>
          , or email us at{" "}
          <a href={`mailto:${site.contact.email}`} className="underline">
            {site.contact.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}
