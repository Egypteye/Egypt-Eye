"use client";

import { useRef, useState } from "react";
import { useTr } from "@/i18n/LocaleProvider";
import type { TreasureCategory, TreasureProduct } from "@/content/types";

// One form for all four categories.
//
// The questions come from the category's own `personalization` list rather
// than from four near-identical components, so adding "ring size" to
// cartouches is a line of content and nothing else. What differs between
// categories is genuinely only the questions — the situation, the dates and
// the contact details are the same conversation every time.
//
// The situation toggle is first, and deliberately so. Whether someone is at
// home with six weeks to spare or in Cairo with two days left changes what
// Egypt Eye can actually offer them, and a form that asks for it last has
// already wasted their time.

type Status = "idle" | "sending" | "sent" | "error";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function TreasureRequestForm({
  category,
  products,
}: {
  category: TreasureCategory;
  products: TreasureProduct[];
}) {
  const tr = useTr();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [journey, setJourney] = useState<"before-arrival" | "in-egypt">("before-arrival");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);


  function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    if (!file) {
      setPhotoPreview(null);
      setPhotoName(null);
      return;
    }
    // Checked here as well as on the server so the answer arrives instantly
    // rather than after an upload the customer watched fail.
    if (!PHOTO_TYPES.includes(file.type)) {
      setError(tr("Photos need to be JPEG, PNG or WebP."));
      event.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError(tr("That photo is over 8 MB. Please choose a smaller one."));
      event.target.value = "";
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoName(file.name);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const data = new FormData(event.currentTarget);
    data.set("category", category.slug);
    data.set("journey", journey);

    try {
      const res = await fetch("/api/treasure-request", { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Back to idle rather than a dead end: everything they typed is still
        // in the form, and a long personalisation note is not worth losing.
        setError(json.error || tr("Something went wrong. Please try again."));
        setStatus("idle");
        return;
      }
      setStatus("sent");
      formRef.current?.reset();
      setPhotoPreview(null);
      setPhotoName(null);
    } catch {
      setError(tr("Something went wrong. Please try again."));
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-gold/25 bg-gold/5 p-8 text-center">
        <p className="font-display text-xl font-semibold text-ink">{tr("Your request is with us")}</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          {journey === "in-egypt"
            ? tr("We'll come back to you with what's available while you're here, and a time you can come and see it.")
            : tr("We'll come back to you with the specification, the price and the date it can be ready — before anything is made.")}
        </p>
        <p className="mt-4 text-xs text-ink-soft/80">{tr("Nothing has been charged, and nothing is confirmed yet.")}</p>
      </div>
    );
  }

  const label = "block text-sm font-semibold text-ink";
  const input =
    "mt-1.5 w-full rounded-xl border border-black/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      {/* Honeypot — matches every other form on the site. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <fieldset>
        <legend className={label}>{tr("Where are you right now?")}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(
            [
              ["before-arrival", tr("Still planning my trip")],
              ["in-egypt", tr("Already in Egypt")],
            ] as const
          ).map(([value, text]) => (
            <button
              key={value}
              type="button"
              onClick={() => setJourney(value)}
              aria-pressed={journey === value}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                journey === value
                  ? "border-gold/50 bg-gold/10 text-ink"
                  : "border-black/10 bg-cream text-ink-soft hover:border-gold/30"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      </fieldset>

      {products.length > 0 && (
        <div>
          <label className={label} htmlFor="treasure-product">
            {tr("Which piece?")}
          </label>
          <select id="treasure-product" name="product" className={input} defaultValue="">
            <option value="">{tr("Not sure yet — advise me")}</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {category.personalization.map((field) => {
        if (field.kind === "photo") {
          return (
            <div key={field.name}>
              <label className={label} htmlFor={`treasure-${field.name}`}>
                {field.label}
                {field.required && <span aria-hidden className="text-gold-dark"> *</span>}
              </label>
              {field.help && <p className="mt-1 text-xs leading-relaxed text-ink-soft/85">{field.help}</p>}
              <input
                id={`treasure-${field.name}`}
                name={field.name}
                type="file"
                accept={PHOTO_TYPES.join(",")}
                required={field.required}
                onChange={onPhotoChange}
                className="mt-2 block w-full text-sm text-ink-soft file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-5 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-gold-light"
              />
              {photoPreview && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-black/5 bg-cream p-3">
                  {/* Object URL of a file the visitor just chose — next/image
                      cannot optimise a blob, hence the plain img. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt={tr("The photo you selected")}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{photoName}</p>
                    <p className="text-xs text-ink-soft/85">
                      {tr("Used for your commission only. Ask us to delete it at any time.")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        }

        if (field.kind === "choice") {
          return (
            <div key={field.name}>
              <label className={label} htmlFor={`treasure-${field.name}`}>
                {field.label}
                {field.required && <span aria-hidden className="text-gold-dark"> *</span>}
              </label>
              {field.help && <p className="mt-1 text-xs leading-relaxed text-ink-soft/85">{field.help}</p>}
              <select
                id={`treasure-${field.name}`}
                name={field.name}
                required={field.required}
                className={input}
                defaultValue=""
              >
                <option value="" disabled>
                  {tr("Choose one")}
                </option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        const isLong = field.kind === "longtext";
        return (
          <div key={field.name}>
            <label className={label} htmlFor={`treasure-${field.name}`}>
              {field.label}
              {field.required && <span aria-hidden className="text-gold-dark"> *</span>}
            </label>
            {field.help && <p className="mt-1 text-xs leading-relaxed text-ink-soft/85">{field.help}</p>}
            {isLong ? (
              <textarea
                id={`treasure-${field.name}`}
                name={field.name}
                rows={4}
                maxLength={field.maxLength}
                required={field.required}
                className={input}
              />
            ) : (
              <input
                id={`treasure-${field.name}`}
                name={field.name}
                type="text"
                maxLength={field.maxLength}
                required={field.required}
                className={input}
              />
            )}
          </div>
        );
      })}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="treasure-arrival">
            {journey === "in-egypt" ? tr("Until when are you here?") : tr("When do you arrive?")}
          </label>
          <input id="treasure-arrival" name="arrival" type="date" className={input} />
        </div>
        <div>
          <label className={label} htmlFor="treasure-departure">
            {tr("And when do you leave? (optional)")}
          </label>
          <input id="treasure-departure" name="departure" type="date" className={input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="treasure-name">
            {tr("Your name")} <span aria-hidden className="text-gold-dark">*</span>
          </label>
          <input id="treasure-name" name="name" type="text" required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="treasure-email">
            {tr("Email")} <span aria-hidden className="text-gold-dark">*</span>
          </label>
          <input id="treasure-email" name="email" type="email" required className={input} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="treasure-phone">
          {tr("Phone or WhatsApp (optional)")}
        </label>
        <input id="treasure-phone" name="phone" type="tel" className={input} />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm font-semibold text-terracotta">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
        >
          {status === "sending" ? tr("Sending…") : tr("Send my request")}
        </button>
        <p className="text-xs text-ink-soft/85">
          {tr("No payment now. We reply with the specification and the price before anything is made.")}
        </p>
      </div>
    </form>
  );
}
