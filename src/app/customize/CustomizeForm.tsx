"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/content/site";
import { destinations } from "@/content/destinations";
import { interests } from "@/content/interests";

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onToggle(option)}
          className={`rounded-full px-3.5 py-2 text-left text-xs font-medium transition ${
            selected.includes(option)
              ? "bg-gold text-ink"
              : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function CustomizeForm() {
  const [cities, setCities] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [visitedBefore, setVisitedBefore] = useState("No");
  const [submitted, setSubmitted] = useState(false);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (name: string) => (form.get(name) as string)?.trim();

    const fields: [string, string | undefined][] = [
      ["Name", get("name")],
      ["Nationality", get("nationality")],
      ["Age", get("age")],
      ["Phone", `${get("countryCode") ?? ""} ${get("phone") ?? ""}`.trim()],
      ["Email", get("email")],
      ["Instagram", get("instagram")],
      ["Arrival date", get("arrival")],
      ["Departure date", get("departure")],
      ["Visited Egypt before?", visitedBefore],
      ["Number of guests", get("guests")],
      ["Number of nights", get("nights")],
      ["Cities to visit", cities.join(", ")],
      ["Activities of interest", activities.join(", ")],
      ["Voucher / promo code", get("voucher")],
      ["Health conditions", get("health")],
      ["Special requests", get("notes")],
    ];

    const bodyLines = fields
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`);

    const subject = `Custom Tour Request — ${get("name") || "New Enquiry"}`;
    const body = [
      "Hi Egypt Eye,",
      "",
      "I'd like to build a custom tour with the following details:",
      "",
      ...bodyLines,
      "",
      "Thank you!",
    ].join("\n");

    const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    setSubmitted(true);
    window.location.href = mailto;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-gold/15 bg-cream p-6 shadow-xl shadow-black/5 sm:p-10"
    >
      {/* About you */}
      <FormSection number={1} title="About You">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="name" required placeholder="Jane Traveler" />
          <Field label="Nationality" name="nationality" required placeholder="American" />
          <Field label="Age" name="age" placeholder="34" />
          <div className="grid grid-cols-[100px_1fr] gap-3">
            <Field label="Country code" name="countryCode" placeholder="+1" />
            <Field label="Phone number" name="phone" placeholder="555 123 4567" />
          </div>
          <Field label="Email" name="email" type="email" required placeholder="jane@email.com" />
          <Field label="Instagram username" name="instagram" placeholder="@jane.travels" />
        </div>
      </FormSection>

      {/* Trip details */}
      <FormSection number={2} title="Your Trip">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Arrival date (if known)" name="arrival" placeholder="D/M/Y" />
          <Field label="Departure date (if known)" name="departure" placeholder="D/M/Y" />

          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Have you visited Egypt before?
            <select
              value={visitedBefore}
              onChange={(e) => setVisitedBefore(e.target.value)}
              className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Guests" name="guests" required placeholder="2" />
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Nights
              <select
                name="nights"
                defaultValue="7"
                className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
              >
                {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </FormSection>

      {/* Cities */}
      <FormSection number={3} title="Cities You'd Like to Visit">
        <ChipGroup
          options={destinations.map((d) => `${d.name} (${d.days}+ day${d.days > 1 ? "s" : ""})`)}
          selected={cities}
          onToggle={(v) => toggle(cities, setCities, v)}
        />
      </FormSection>

      {/* Activities */}
      <FormSection number={4} title="Activities You'd Like to Do">
        <ChipGroup
          options={interests.map((i) => i.label)}
          selected={activities}
          onToggle={(v) => toggle(activities, setActivities, v)}
        />
      </FormSection>

      {/* Additional info */}
      <FormSection number={5} title="Anything Else" last>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Voucher / promo code" name="voucher" placeholder="Optional" />
          <Field label="Health conditions we should know about" name="health" placeholder="Optional" />
        </div>
        <label className="mt-5 flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Special requests
          <textarea
            name="notes"
            rows={4}
            className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
            placeholder="Anniversary, dietary needs, accessibility, pace preferences..."
          />
        </label>
      </FormSection>

      <button
        type="submit"
        className="mt-8 w-full rounded-full bg-ink py-4 text-sm font-semibold text-cream transition hover:bg-gold-dark"
      >
        Send My Request by Email
      </button>

      {submitted && (
        <p className="mt-3 text-center text-xs text-ink-soft/60">
          Your email app should have opened with everything filled in. If it
          didn&rsquo;t, message us directly on{" "}
          <a href={site.contact.whatsappLink} target="_blank" className="underline">
            WhatsApp
          </a>{" "}
          or email{" "}
          <a href={`mailto:${site.contact.email}`} className="underline">
            {site.contact.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}

function FormSection({
  number,
  title,
  children,
  last = false,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`${last ? "" : "mb-8 border-b border-black/5 pb-8"}`}>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-dark">
          {number}
        </span>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
      />
    </label>
  );
}
