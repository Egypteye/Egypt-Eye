"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  validateMediaKit,
  MEDIA_KIT_BUCKET,
  MEDIA_KIT_MAX_LABEL,
  MEDIA_KIT_MIME,
} from "@/lib/collaborations/mediaKit";
import { useTr } from "@/i18n/LocaleProvider";
import { PhoneField } from "@/components/PhoneField";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook", "Blog / Website", "Other"];
const COLLAB_TYPES = [
  "Sponsored Trip",
  "Content Partnership",
  "Paid Campaign",
  "Press Trip / Media Coverage",
  "Ambassador Program",
  "Other",
];

type SocialRow = { platform: string; handle: string; followers: string };

function inputClass(extra = "") {
  return `rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold ${extra}`;
}

type Status = "idle" | "sending" | "sent" | "error";

export function CollaborateForm() {
  const tr = useTr();
  // Literal tr() calls, not tr(variable) — values sent to the backend
  // (form.get("collaborationType") etc.) must stay the fixed English
  // strings; only the displayed option text translates.
  const platformLabels: Record<string, string> = {
    Instagram: tr("Instagram"),
    TikTok: tr("TikTok"),
    YouTube: tr("YouTube"),
    Facebook: tr("Facebook"),
    "Blog / Website": tr("Blog / Website"),
    Other: tr("Other"),
  };
  const collabTypeLabels: Record<string, string> = {
    "Sponsored Trip": tr("Sponsored Trip"),
    "Content Partnership": tr("Content Partnership"),
    "Paid Campaign": tr("Paid Campaign"),
    "Press Trip / Media Coverage": tr("Press Trip / Media Coverage"),
    "Ambassador Program": tr("Ambassador Program"),
    Other: tr("Other"),
  };
  const [socials, setSocials] = useState<SocialRow[]>([{ platform: "Instagram", handle: "", followers: "" }]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaKitFile, setMediaKitFile] = useState<File | null>(null);

  // Checked as the file is chosen, not only on submit. Someone who picks a
  // 40 MB PDF should learn that before filling in the rest of the form.
  function onMediaKitFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setMediaKitFile(picked);
    if (!picked) return;
    const check = validateMediaKit({ file: { type: picked.type, size: picked.size } });
    setErrorMessage(check.ok ? null : tr(check.error));
  }

  function updateSocial(index: number, field: keyof SocialRow, value: string) {
    setSocials((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addSocialRow() {
    setSocials((prev) => [...prev, { platform: "Instagram", handle: "", followers: "" }]);
  }

  function removeSocialRow(index: number) {
    setSocials((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const form = new FormData(e.currentTarget);
    if ((form.get("company") as string)?.trim()) {
      setStatus("sent");
      return;
    }

    const validSocials = socials.filter((s) => s.handle.trim());
    if (validSocials.length === 0) {
      setErrorMessage(tr("Please add at least one social media account."));
      return;
    }

    // The media kit is mandatory, and the same rules run here and on the
    // server — one module, imported by both, so the form can never promise
    // something the API will reject.
    const mediaKit = validateMediaKit({
      file: mediaKitFile ? { type: mediaKitFile.type, size: mediaKitFile.size } : null,
      link: (form.get("mediaKitUrl") as string) ?? "",
    });
    if (!mediaKit.ok) {
      setErrorMessage(tr(mediaKit.error));
      return;
    }

    form.set("socialAccounts", JSON.stringify(validSocials));
    // The file never goes to our API: Vercel rejects a request body over
    // 4.5 MB before any of our code runs, and media kits are routinely
    // larger. It goes straight to storage instead, and only the resulting
    // path is submitted with the application.
    form.delete("mediaKitFile");

    setStatus("sending");

    if (mediaKitFile) {
      try {
        const res = await fetch("/api/collaborate-apply/upload-url", { method: "POST" });
        if (!res.ok) throw new Error("no upload url");
        const { path, token } = (await res.json()) as { path: string; token: string };
        const { error: uploadError } = await createClient()
          .storage.from(MEDIA_KIT_BUCKET)
          .uploadToSignedUrl(path, token, mediaKitFile, { contentType: MEDIA_KIT_MIME });
        if (uploadError) throw uploadError;
        form.set("mediaKitPath", path);
      } catch {
        // The link, if they gave one, is still a complete media kit, so the
        // application is worth sending. With no link there is nothing to
        // send: say so rather than submitting an application the team
        // cannot act on.
        if (!mediaKit.link) {
          setErrorMessage(
            tr("We couldn't upload that file. Please try again, or paste a link to your media kit instead.")
          );
          setStatus("idle");
          return;
        }
      }
    }

    try {
      const res = await fetch("/api/collaborate-apply", { method: "POST", body: form });
      if (!res.ok) {
        // The server's message is the useful one — it names the actual
        // problem (wrong type, too large, bad link) instead of a generic
        // failure the applicant can do nothing with.
        const detail = await res.json().catch(() => null);
        if (detail?.error) {
          setErrorMessage(tr(detail.error));
          setStatus("idle");
          return;
        }
        throw new Error("Request failed");
      }
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-gold/15 bg-cream p-10 text-center shadow-xl shadow-black/5">
        <p className="font-display text-2xl font-semibold text-ink">{tr("Application received")}</p>
        <p className="mt-3 text-sm text-ink-soft">{tr("Thanks for reaching out — our team reviews every application and will follow up if it’s a fit.")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative rounded-3xl border border-gold/15 bg-cream p-6 shadow-xl shadow-black/5 sm:p-10">
      <div className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
        <label>{tr("Company")}<input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
          {tr("Full name *")}
          <input name="fullName" required className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
          {tr("Email *")}
          <input type="email" name="email" required className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">{tr("WhatsApp / Phone")}
          <PhoneField errorClassName="text-sm font-semibold text-terracotta" id="collaborate-phone" inputLabel="Phone number" selectClassName={inputClass()} inputClassName={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">{tr("Portfolio / previous work")}<input type="url" name="portfolioUrl" placeholder={tr("https://")} className={inputClass()} />
        </label>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-ink-soft">{tr("Social media accounts *")}</p>
        <div className="flex flex-col gap-3">
          {socials.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
              <select
                value={row.platform}
                onChange={(e) => updateSocial(i, "platform", e.target.value)}
                className={inputClass()}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {platformLabels[p] ?? p}
                  </option>
                ))}
              </select>
              <input
                placeholder={tr("@handle")}
                value={row.handle}
                onChange={(e) => updateSocial(i, "handle", e.target.value)}
                className={inputClass()}
              />
              <input
                placeholder={tr("Followers")}
                value={row.followers}
                onChange={(e) => updateSocial(i, "followers", e.target.value)}
                className={inputClass()}
              />
              <button
                type="button"
                onClick={() => removeSocialRow(i)}
                disabled={socials.length === 1}
                aria-label={tr("Remove this account")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft/85 transition hover:bg-sand-dim hover:text-terracotta disabled:opacity-30"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSocialRow}
          className="mt-2 text-xs font-semibold text-gold-dark hover:underline"
        >
          {tr("+ Add another account")}
        </button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">{tr("Average engagement rate")}<input name="engagementRate" placeholder={tr("e.g. 4-6%")} className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">{tr("Audience countries")}<input name="audienceCountries" placeholder={tr("e.g. USA, UK, Germany")} className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">{tr("Preferred travel dates")}<input name="travelDates" placeholder={tr("e.g. Flexible, or March 2027")} className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
          {tr("Collaboration type *")}
          <select name="collaborationType" required defaultValue="" className={inputClass()}>
            <option value="" disabled>{tr("Select a type")}</option>
            {COLLAB_TYPES.map((t) => (
              <option key={t} value={t}>
                {collabTypeLabels[t] ?? t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft sm:col-span-2">{tr("Tell us about your content and what you have in mind")}<textarea name="message" rows={4} className={inputClass()} />
        </label>

        {/*
          The media kit. Mandatory, but either half satisfies it, so this is
          one labelled group rather than two fields that both look optional.
          The two options are given equal weight on purpose: a creator who
          keeps their kit in Drive should not feel they are taking the lesser
          path, and one who has a PDF to hand should not have to upload it
          somewhere first.
        */}
        <fieldset className="sm:col-span-2 rounded-2xl border border-gold/20 bg-sand/40 p-5">
          <legend className="px-1 text-sm font-semibold text-ink-soft">{tr("Media kit *")}</legend>
          <p className="mt-1 text-xs text-ink-soft/85">
            {tr("Required — give us either one. Your media kit tells us about your audience, reach, engagement and the kind of work you make.")}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-soft">
              {tr("Upload a PDF")}
              <input
                type="file"
                name="mediaKitFile"
                accept={MEDIA_KIT_MIME}
                onChange={onMediaKitFileChange}
                className="w-full rounded-xl border border-gold/25 bg-cream px-3 py-2.5 text-xs font-normal text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-cream hover:file:bg-gold-dark"
              />
              <span className="font-normal text-ink-soft/75">
                {mediaKitFile
                  ? `${mediaKitFile.name} — ${(mediaKitFile.size / (1024 * 1024)).toFixed(1)} MB`
                  : tr(`PDF only, up to ${MEDIA_KIT_MAX_LABEL}.`)}
              </span>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-soft">
              {tr("Or paste a link")}
              <input
                type="url"
                name="mediaKitUrl"
                placeholder={tr("https://drive.google.com/...")}
                className={inputClass()}
              />
              <span className="font-normal text-ink-soft/75">
                {tr("Google Drive, Dropbox, Notion or your own site. Please make sure it is viewable by anyone with the link.")}
              </span>
            </label>
          </div>
        </fieldset>
      </div>

      {errorMessage && <p className="mt-4 text-sm font-semibold text-terracotta">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-8 w-full rounded-full bg-ink py-4 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "sending" ? tr("Sending…") : tr("Submit Application")}
      </button>

      {status === "error" && (
        <p className="mt-3 text-center text-xs text-terracotta">{tr("Something went wrong sending your application. Please message us directly on WhatsApp instead.")}</p>
      )}
    </form>
  );
}
