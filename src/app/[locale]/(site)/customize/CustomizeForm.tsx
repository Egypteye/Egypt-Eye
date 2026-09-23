"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { CustomizeFormField, CustomizeFormSection, Destination, Interest, ResolvedSiteSettings } from "@/content/types";
import { removeJourneyItem, useJourneyItems } from "@/lib/journey";
import { WhatsAppBookButton } from "@/components/WhatsAppBookButton";
import { useTr } from "@/i18n/LocaleProvider";
import { countryDialCodes, flagFor } from "@/content/countryCodes";

/**
 * Joins a dialling code and a local number into one submitted value.
 *
 * Returns "" when either half is missing so the caller's required check sees
 * an empty field — picking a code without typing a number, or the reverse,
 * is not a usable phone number. Any leading zero on the local part is dropped:
 * it is a domestic trunk prefix and makes the number undiallable once a
 * country code is in front of it.
 */
function joinDialCode(dial: string, local: string): string {
  const code = dial.trim();
  const number = local.trim().replace(/^0+/, "");
  if (!code || !number) return "";
  return `${code} ${number}`;
}

const CHIPS_TYPES = new Set(["chips", "chips-destinations", "chips-interests"]);

function optionsFor(
  field: CustomizeFormField,
  destinations: readonly Destination[],
  interests: readonly Interest[]
): string[] {
  if (field.fieldType === "chips-destinations") {
    return destinations.map((d) => `${d.name} (${d.days}+ day${d.days > 1 ? "s" : ""})`);
  }
  if (field.fieldType === "chips-interests") {
    return interests.map((i) => i.label);
  }
  return field.options ?? [];
}

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

type Status = "idle" | "sending" | "sent" | "error";

export function CustomizeForm({
  sections,
  siteSettings: site,
}: {
  sections: readonly CustomizeFormSection[];
  siteSettings: ResolvedSiteSettings;
}) {
  const tr = useTr();
  const [chipSelections, setChipSelections] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const journeyItems = useJourneyItems();

  function toggleChip(fieldKey: string, value: string) {
    setChipSelections((prev) => {
      const current = prev[fieldKey] ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [fieldKey]: next };
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const form = new FormData(e.currentTarget);

    // Honeypot: real visitors never fill this hidden field in; bots often do.
    if ((form.get("company") as string)?.trim()) {
      setStatus("sent");
      return;
    }

    const collected: { fieldKey: string; label: string; fieldType: string; value: string }[] = [];
    let missingRequired = false;

    for (const section of sections) {
      for (const field of section.fields) {
        // A tel-country field renders two controls and reports one value, so
        // the team receives "+20 1234567890" rather than a bare number they
        // have to guess the country of. Blank unless BOTH parts are filled,
        // which is what makes the required check below cover the code too.
        const value = CHIPS_TYPES.has(field.fieldType)
          ? (chipSelections[field.fieldKey] ?? []).join(", ")
          : field.fieldType === "tel-country"
            ? joinDialCode(
                (form.get(`${field.fieldKey}CountryCode`) as string) ?? "",
                (form.get(field.fieldKey) as string) ?? ""
              )
            : ((form.get(field.fieldKey) as string) ?? "").trim();

        if (field.required && !value) missingRequired = true;
        collected.push({ fieldKey: field.fieldKey, label: field.label, fieldType: field.fieldType, value });
      }
    }

    if (missingRequired) {
      setErrorMessage(tr("Please fill in all required fields."));
      return;
    }

    const filled = collected.filter((f) => f.value);
    if (journeyItems.length > 0) {
      filled.push({
        fieldKey: "journeyItems",
        label: "Added from My Journey",
        fieldType: "text",
        value: journeyItems.map((i) => i.title).join("; "),
      });
    }
    const name = collected.find((f) => f.fieldKey === "fullName")?.value;
    const replyToEmail = collected.find((f) => f.fieldType === "email")?.value;
    const subject = `Custom Tour Request — ${name || "New Enquiry"}`;

    setStatus("sending");
    try {
      const res = await fetch("/api/customize-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: filled.map(({ label, value }) => ({ label, value })),
          subject,
          replyToEmail,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-3xl border border-gold/15 bg-cream p-6 shadow-xl shadow-black/5 sm:p-10"
    >
      {/* Honeypot — hidden from real visitors via size/opacity rather than display:none, so basic bots that skip display:none fields still fill it in. Positioned within the form (not off-screen) to avoid any page-level horizontal overflow. */}
      <div className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
        <label>{tr("Company")}<input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {journeyItems.length > 0 && (
        <div className="mb-8 rounded-2xl border border-gold/20 bg-sand-dim p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-dark">{tr("From Your Journey")}</p>
          <p className="mt-1 text-xs text-ink-soft/60">{tr("These will be included with your request. Remove anything that doesn’t belong.")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {journeyItems.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-ink"
              >
                {item.title}
                <button
                  type="button"
                  onClick={() => removeJourneyItem(item.type, item.slug)}
                  aria-label={`${tr("Remove")} ${item.title}`}
                  className="text-ink-soft/50 hover:text-terracotta"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {sections.map((section, sectionIndex) => (
        <FormSection
          key={section.title}
          number={sectionIndex + 1}
          title={section.title}
          last={sectionIndex === sections.length - 1}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {section.fields.map((field) => (
              <FieldRenderer
                key={field.fieldKey}
                field={field}
                selected={chipSelections[field.fieldKey] ?? []}
                onToggleChip={(value) => toggleChip(field.fieldKey, value)}
                destinations={site.destinations}
                interests={site.interests}
              />
            ))}
          </div>
        </FormSection>
      ))}

      {errorMessage && <p className="mt-4 text-sm font-medium text-terracotta">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-8 w-full rounded-full bg-ink py-4 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "sending" ? tr("Sending…") : tr("Send My Request")}
      </button>

      {/* Requesting a quote is free and non-binding — payment happens later,
          off-site — so this points at the policy rather than implying that
          sending the form accepts it. */}
      <p className="mt-3 text-center text-xs text-ink-soft/60">
        {tr("Free to ask, no obligation. Deposits become non-refundable once a booking is confirmed —")}{" "}
        <Link href="/cancellation-policy" className="underline underline-offset-2 hover:text-ink">
          {tr("see our Cancellation Policy")}
        </Link>
        .
      </p>

      {status === "sent" && (
        <p className="mt-3 text-center text-xs text-ink-soft/60">
          {tr("Thanks — your request has been sent. We'll reply by email soon. Prefer to chat now? Message us on")}{" "}
          <WhatsAppBookButton
            whatsappLink={site.contact.whatsappLink}
            context={{ page: "the Customize Your Tour page", intro: "Hi, I'd like to plan a custom trip." }}
            className="underline">{tr("WhatsApp")}</WhatsAppBookButton>
          .
        </p>
      )}

      {status === "error" && (
        <p className="mt-3 text-center text-xs text-terracotta">
          {tr("Something went wrong sending your request. Please message us directly on")}{" "}
          <WhatsAppBookButton
            whatsappLink={site.contact.whatsappLink}
            context={{ page: "the Customize Your Tour page", intro: "Hi, I'd like to plan a custom trip." }}
            className="underline">{tr("WhatsApp")}</WhatsAppBookButton>{" "}
          {tr("or email")}{" "}
          <a href={`mailto:${site.contact.email}`} className="underline">
            {site.contact.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}

function FieldRenderer({
  field,
  selected,
  onToggleChip,
  destinations,
  interests,
}: {
  field: CustomizeFormField;
  selected: string[];
  onToggleChip: (value: string) => void;
  destinations: readonly Destination[];
  interests: readonly Interest[];
}) {
  const tr = useTr();
  const widthClass = field.width === "full" ? "sm:col-span-2" : "";
  const label = field.required ? `${field.label} *` : field.label;

  if (CHIPS_TYPES.has(field.fieldType)) {
    return (
      <div className={widthClass}>
        <p className="mb-2 text-sm font-medium text-ink-soft">{label}</p>
        <ChipGroup options={optionsFor(field, destinations, interests)} selected={selected} onToggle={onToggleChip} />
      </div>
    );
  }

  // Two controls, one field. They share a single bordered shell so the pair
  // reads as one input, matching every other field on the form; the border
  // lives on the wrapper and focus-within moves it to gold the way :focus
  // does elsewhere.
  if (field.fieldType === "tel-country") {
    return (
      <div className={widthClass}>
        <label htmlFor={field.fieldKey} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
        <div className="mt-1.5 flex rounded-lg border border-black/10 bg-sand focus-within:border-gold">
          <select
            name={`${field.fieldKey}CountryCode`}
            required={field.required}
            defaultValue=""
            aria-label={tr("Country code")}
            className="w-[7.5rem] shrink-0 cursor-pointer rounded-l-lg border-0 border-r border-black/10 bg-transparent py-2.5 pl-3 pr-1 text-ink outline-none"
          >
            <option value="" disabled>
              {tr("Code")}
            </option>
            {countryDialCodes.map((c) => (
              // Value carries only the dial code — the name and flag are for
              // finding your country in the list, not for the team's inbox.
              <option key={c.iso} value={c.dial}>
                {flagFor(c.iso)} {c.dial} · {c.name}
              </option>
            ))}
          </select>
          <input
            id={field.fieldKey}
            name={field.fieldKey}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required={field.required}
            placeholder={field.placeholder}
            className="w-full min-w-0 rounded-r-lg border-0 bg-transparent px-4 py-2.5 text-ink outline-none"
          />
        </div>
      </div>
    );
  }

  if (field.fieldType === "textarea") {
    return (
      <label className={`flex flex-col gap-1.5 text-sm font-medium text-ink-soft ${widthClass}`}>
        {label}
        <textarea
          name={field.fieldKey}
          required={field.required}
          rows={4}
          placeholder={field.placeholder}
          className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
        />
      </label>
    );
  }

  if (field.fieldType === "select") {
    return (
      <label className={`flex flex-col gap-1.5 text-sm font-medium text-ink-soft ${widthClass}`}>
        {label}
        <select
          name={field.fieldKey}
          required={field.required}
          defaultValue={field.options?.[0] ?? ""}
          className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
        >
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.fieldType === "date") {
    return (
      <label className={`flex flex-col gap-1.5 text-sm font-medium text-ink-soft ${widthClass}`}>
        {label}
        <input
          name={field.fieldKey}
          type="date"
          required={field.required}
          onClick={(e) => e.currentTarget.showPicker?.()}
          className="cursor-pointer rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
        />
      </label>
    );
  }

  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium text-ink-soft ${widthClass}`}>
      {label}
      <input
        name={field.fieldKey}
        type={field.fieldType}
        required={field.required}
        placeholder={field.placeholder}
        className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
      />
    </label>
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
