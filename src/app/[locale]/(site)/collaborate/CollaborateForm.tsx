"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  validateMediaKit,
  MEDIA_KIT_BUCKET,
  MEDIA_KIT_MAX_LABEL,
  MEDIA_KIT_MIME,
} from "@/lib/collaborations/mediaKit";
import { useTr } from "@/i18n/LocaleProvider";
import { PhoneField } from "@/components/PhoneField";
import {
  scoreCreator,
  VIDEO_SAMPLE,
  type EligiblePlatform,
  type PlatformAccount,
} from "@/lib/creatorClub/scoring";
import {
  ACKNOWLEDGEMENTS,
  STEPS,
  blockingIssues,
  canSubmit,
  emptyDraft,
  stepComplete,
  stepIssues,
  videoProgress,
  type Draft,
  type StepId,
  type VideoRow,
} from "@/lib/creatorClub/application";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook", "Blog / Website", "Other"];
const COLLAB_TYPES = [
  "Sponsored Trip",
  "Content Partnership",
  "Paid Campaign",
  "Press Trip / Media Coverage",
  "Ambassador Program",
  "Other",
];
const CONTENT_TYPES = [
  "Travel",
  "Photography",
  "Videography",
  "Lifestyle",
  "Fashion",
  "Adventure",
  "Luxury",
  "Food",
  "Culture",
  "Family travel",
  "Other",
];

/** Display name -> the key the scoring model uses. Only these three weigh. */
const SCORED_BY_LABEL: Record<string, EligiblePlatform> = {
  Instagram: "instagram",
  TikTok: "tiktok",
  Facebook: "facebook",
};

const emptyVideo = (): VideoRow => ({ views: "", likes: "", comments: "", shares: "" });

function toNumber(value: string): number {
  const n = Number.parseFloat(value.replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function inputClass(extra = "") {
  return `w-full rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold ${extra}`;
}

const labelClass = "flex flex-col gap-1.5 text-sm font-semibold text-ink-soft";

type Status = "idle" | "sending" | "sent" | "error";

export function CollaborateForm() {
  const tr = useTr();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [stepIndex, setStepIndex] = useState(0);
  /** Issues appear once someone tries to leave a step, not while they type. */
  const [showIssues, setShowIssues] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaKitFile, setMediaKitFile] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const step: StepId = STEPS[stepIndex].id;
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // --- derived -------------------------------------------------------------
  const scoredRows = draft.socials
    .map((row) => ({ key: SCORED_BY_LABEL[row.platform], followers: toNumber(row.followers) }))
    .filter((r): r is { key: EligiblePlatform; followers: number } => Boolean(r.key) && r.followers > 0);

  const scoredRowsKey = JSON.stringify(scoredRows);
  const videosKey = JSON.stringify(draft.videos);

  const platformAccounts: PlatformAccount[] = useMemo(() => {
    const byPlatform = new Map<EligiblePlatform, PlatformAccount>();
    for (const row of scoredRows) {
      const existing = byPlatform.get(row.key);
      if (existing && existing.followers >= row.followers) continue;
      byPlatform.set(row.key, {
        platform: row.key,
        followers: row.followers,
        videos: (draft.videos[row.key] ?? [])
          .filter((v) => toNumber(v.views) > 0)
          .map((v) => ({
            views: toNumber(v.views),
            likes: toNumber(v.likes),
            comments: toNumber(v.comments),
            shares: toNumber(v.shares),
          })),
      });
    }
    return [...byPlatform.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoredRowsKey, videosKey]);

  /** A preview. The server recomputes and its answer is the one stored. */
  const preview = useMemo(
    () => (platformAccounts.length > 0 ? scoreCreator(platformAccounts) : null),
    [platformAccounts],
  );

  const issues = stepIssues(step, draft);
  const outstanding = blockingIssues(draft);

  // --- media kit -----------------------------------------------------------
  function onMediaKitFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setMediaKitFile(picked);
    set("hasMediaKitFile", picked !== null);
    if (!picked) return;
    const check = validateMediaKit({ file: { type: picked.type, size: picked.size } });
    setErrorMessage(check.ok ? null : tr(check.error));
  }

  // --- navigation ----------------------------------------------------------
  // The draft lives in state, never in the DOM, so stepping away from a
  // screen and back does not lose what was typed on it.
  function scrollUp() {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    if (issues.length > 0) {
      setShowIssues(true);
      return;
    }
    setShowIssues(false);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    scrollUp();
  }

  function goBack() {
    setShowIssues(false);
    setStepIndex((i) => Math.max(i - 1, 0));
    scrollUp();
  }

  function jumpTo(index: number) {
    setShowIssues(false);
    setStepIndex(index);
    scrollUp();
  }

  // --- submit --------------------------------------------------------------
  async function submit() {
    setErrorMessage(null);
    if (honeypot.trim()) {
      setStatus("sent");
      return;
    }
    if (!canSubmit(draft)) {
      setShowIssues(true);
      return;
    }

    const mediaKit = validateMediaKit({
      file: mediaKitFile ? { type: mediaKitFile.type, size: mediaKitFile.size } : null,
      link: draft.mediaKitUrl,
    });
    if (!mediaKit.ok) {
      setErrorMessage(tr(mediaKit.error));
      return;
    }

    setStatus("sending");
    const form = new FormData();

    // The PDF never travels through our API: Vercel rejects a body over
    // 4.5 MB before our code runs, and media kits are routinely larger.
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
        if (!mediaKit.link) {
          setErrorMessage(
            tr("We couldn't upload that file. Please try again, or paste a link to your media kit instead."),
          );
          setStatus("idle");
          return;
        }
      }
    }

    form.set("fullName", draft.fullName);
    form.set("creatorName", draft.creatorName);
    form.set("email", draft.email);
    form.set("phone", draft.phone);
    form.set("country", draft.country);
    form.set("portfolioUrl", draft.website);
    form.set("collaborationType", draft.collaborationType);
    form.set("audienceCountries", draft.audienceCountries);
    form.set("travelDates", draft.travelDates);
    form.set("message", draft.message);
    if (mediaKit.link) form.set("mediaKitUrl", mediaKit.link);
    form.set("socialAccounts", JSON.stringify(draft.socials.filter((s) => s.handle.trim())));
    form.set("platformAccounts", JSON.stringify(platformAccounts));
    form.set(
      "creatorProfile",
      JSON.stringify({
        contentTypes: draft.contentTypes,
        languages: draft.languages,
        whyEgyptEye: draft.whyEgyptEye,
        bestWork: draft.bestWork,
      }),
    );
    form.set(
      "travelPreferences",
      JSON.stringify({
        destinations: draft.destinations,
        requestedExperience: draft.requestedExperience,
        travellingAlone: draft.travellingAlone,
      }),
    );
    form.set(
      "acknowledgements",
      JSON.stringify({ confirmedAt: new Date().toISOString(), points: draft.acknowledged }),
    );

    try {
      const res = await fetch("/api/collaborate-apply", { method: "POST", body: form });
      if (!res.ok) {
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
        <p className="mt-3 text-sm text-ink-soft">
          {tr("Our Collaborations team reads every application and checks the figures against your insights and media kit. We will be in touch if it is a fit.")}
        </p>
      </div>
    );
  }

  const scorePanel = preview ? (
    <div className="mt-6 rounded-2xl border border-gold/25 bg-ink p-5 text-cream">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{tr("Indicative score")}</p>
        <p className="font-display text-3xl font-semibold">
          {preview.earned}
          <span className="text-base font-normal text-cream/60">/100</span>
        </p>
      </div>
      <p className="mt-2 text-sm text-cream/85">
        {preview.complete
          ? tr("All six categories assessed.")
          : `${preview.assessedCount}/6 ${tr("categories assessed")} · ${preview.pendingPoints} ${tr("points still pending")}`}
      </p>
      {!preview.complete && preview.indicative !== null && (
        <p className="mt-1 text-xs text-cream/70">
          {tr("On this rate the finished assessment would land near")}{" "}
          <span className="font-semibold text-gold">{preview.indicative}</span>
          {tr(" — an estimate from the categories assessed so far, not a score and not a tier.")}
        </p>
      )}
      <p className="mt-3 text-sm">
        {preview.eligible
          ? tr("Meets the 10,000-follower minimum for a complimentary package.")
          : tr("Below the 10,000-follower minimum for a complimentary package — paid and discounted collaborations are considered separately, so your application is still welcome.")}
      </p>
      <ul className="mt-4 flex flex-col gap-1.5 text-xs">
        {preview.categories.map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-3 border-t border-cream/10 pt-1.5">
            <span className="text-cream/75">{c.key}</span>
            <span className={c.status === "pending" ? "text-gold/80" : "font-semibold"}>
              {c.status === "pending" ? tr("pending") : `${c.points}/${c.max}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] leading-relaxed text-cream/60">
        {tr("Every figure here is the one you typed. Nothing is confirmed until our team has checked it against your insights and media kit, and a score is not an approval — complimentary experiences are selective and agreed case by case.")}
      </p>
    </div>
  ) : null;

  return (
    <div className="relative rounded-3xl border border-gold/15 bg-cream p-5 shadow-xl shadow-black/5 sm:p-10">
      {/* Honeypot, same as every other form on the site. */}
      <div className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
        <label>
          {tr("Company")}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      {/* Progress. A labelled count plus a bar per step: readable at 390px
          without the labels wrapping into three lines. */}
      <nav aria-label={tr("Application progress")} className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
          {tr("Step")} {stepIndex + 1}/{STEPS.length} · {tr(STEPS[stepIndex].title)}
        </p>
        <ol className="mt-2 flex gap-1.5">
          {STEPS.map((s, i) => {
            const done = i < stepIndex && stepComplete(s.id, draft);
            return (
              <li key={s.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-label={`${tr("Go to step")} ${i + 1}: ${tr(s.title)}`}
                  aria-current={i === stepIndex ? "step" : undefined}
                  className={`h-1.5 w-full rounded-full transition ${
                    i === stepIndex ? "bg-ink" : done ? "bg-gold" : "bg-sand-deep"
                  }`}
                />
              </li>
            );
          })}
        </ol>
      </nav>

      {step === "personal" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            {tr("Full name *")}
            <input value={draft.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputClass()} />
          </label>
          <label className={labelClass}>
            {tr("Creator name")}
            <input
              value={draft.creatorName}
              onChange={(e) => set("creatorName", e.target.value)}
              placeholder={tr("If different from your name")}
              className={inputClass()}
            />
          </label>
          <label className={labelClass}>
            {tr("Email *")}
            <input
              type="email"
              inputMode="email"
              value={draft.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass()}
            />
          </label>
          <PhoneField id="creator-phone" value={draft.phone} onChange={(v: string) => set("phone", v)} />
          <label className={labelClass}>
            {tr("Country you are based in *")}
            <input value={draft.country} onChange={(e) => set("country", e.target.value)} className={inputClass()} />
          </label>
          <label className={labelClass}>
            {tr("Website or portfolio")}
            <input
              type="url"
              inputMode="url"
              value={draft.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder={tr("https://")}
              className={inputClass()}
            />
          </label>
        </div>
      )}

      {step === "social" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft/85">
            {tr("Add every account you would post from. Instagram, TikTok and Facebook are the three we score; the rest are read by our team.")}
          </p>
          {draft.socials.map((row, i) => (
            <div key={i} className="rounded-2xl border border-gold/20 bg-sand/40 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
                  {tr("Platform")}
                  <select
                    value={row.platform}
                    onChange={(e) =>
                      set("socials", draft.socials.map((r, j) => (j === i ? { ...r, platform: e.target.value } : r)))
                    }
                    className={inputClass("text-sm")}
                  >
                    {PLATFORMS.map((pf) => (
                      <option key={pf} value={pf}>
                        {tr(pf)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
                  {tr("Handle")}
                  <input
                    value={row.handle}
                    onChange={(e) =>
                      set("socials", draft.socials.map((r, j) => (j === i ? { ...r, handle: e.target.value } : r)))
                    }
                    placeholder="@"
                    className={inputClass("text-sm")}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
                  {tr("Followers")}
                  <input
                    inputMode="numeric"
                    value={row.followers}
                    onChange={(e) =>
                      set("socials", draft.socials.map((r, j) => (j === i ? { ...r, followers: e.target.value } : r)))
                    }
                    className={inputClass("text-sm")}
                  />
                </label>
              </div>
              {draft.socials.length > 1 && (
                <button
                  type="button"
                  onClick={() => set("socials", draft.socials.filter((_, j) => j !== i))}
                  className="mt-2 text-xs font-semibold text-ink-soft/70 underline"
                >
                  {tr("Remove")}
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("socials", [...draft.socials, { platform: "TikTok", handle: "", followers: "" }])}
            className="self-start text-sm font-semibold text-gold-dark underline"
          >
            {tr("Add another account")}
          </button>
          {scorePanel}
        </div>
      )}

      {step === "performance" && (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-ink-soft/85">
            {tr("Your last ten videos on each scored platform. We use the median, so one viral video will not flatter the result and one quiet one will not sink it.")}
          </p>

          {scoredRows.length === 0 && (
            <p className="rounded-xl border border-gold/20 bg-sand/40 px-4 py-3 text-sm text-ink-soft/85">
              {tr("Add an Instagram, TikTok or Facebook account on the previous step to enter video figures.")}
            </p>
          )}

          {scoredRows.map(({ key }) => {
            const rows = draft.videos[key] ?? [];
            const done = videoProgress(draft, key);
            return (
              <div key={key} className="rounded-2xl border border-gold/20 bg-sand/40 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{key}</p>
                  <p className={`text-xs font-semibold ${done >= VIDEO_SAMPLE ? "text-gold-dark" : "text-ink-soft/70"}`}>
                    {done}/{VIDEO_SAMPLE} {tr("videos")}
                  </p>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-sand-deep">
                  <div
                    className="h-1 rounded-full bg-gold transition-all"
                    style={{ width: `${Math.min(100, (done / VIDEO_SAMPLE) * 100)}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {rows.map((row, i) => (
                    <div key={i} className="rounded-xl border border-black/5 bg-cream p-2.5">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft/60">
                        {tr("Video")} {i + 1}
                      </p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(["views", "likes", "comments", "shares"] as const).map((field) => (
                          <label key={field} className="flex flex-col gap-0.5 text-[10px] text-ink-soft/70">
                            {tr(field)}
                            <input
                              inputMode="numeric"
                              value={row[field]}
                              onChange={(e) =>
                                set("videos", {
                                  ...draft.videos,
                                  [key]: rows.map((r, j) => (j === i ? { ...r, [field]: e.target.value } : r)),
                                })
                              }
                              className="w-full rounded-md border border-black/10 bg-sand px-2 py-1.5 text-sm text-ink outline-none focus:border-gold"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex gap-3">
                  {rows.length < VIDEO_SAMPLE && (
                    <button
                      type="button"
                      onClick={() => set("videos", { ...draft.videos, [key]: [...rows, emptyVideo()] })}
                      className="text-xs font-semibold text-gold-dark underline"
                    >
                      {rows.length === 0 ? tr("Add a video") : tr("Add another")}
                    </button>
                  )}
                  {rows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => set("videos", { ...draft.videos, [key]: rows.slice(0, -1) })}
                      className="text-xs font-semibold text-ink-soft/70 underline"
                    >
                      {tr("Remove last")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <fieldset className="rounded-2xl border border-gold/20 bg-sand/40 p-4">
            <legend className="px-1 text-sm font-semibold text-ink-soft">{tr("Media kit *")}</legend>
            <p className="mt-1 text-xs text-ink-soft/85">{tr("Required — give us either one.")}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-soft">
                {tr("Upload a PDF")}
                <input
                  type="file"
                  accept={MEDIA_KIT_MIME}
                  onChange={onMediaKitFileChange}
                  className="w-full rounded-xl border border-gold/25 bg-cream px-3 py-2.5 text-xs font-normal text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-cream"
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
                  inputMode="url"
                  value={draft.mediaKitUrl}
                  onChange={(e) => set("mediaKitUrl", e.target.value)}
                  placeholder={tr("https://drive.google.com/...")}
                  className={inputClass("text-sm font-normal")}
                />
              </label>
            </div>
          </fieldset>

          {scorePanel}
        </div>
      )}

      {step === "profile" && (
        <div className="flex flex-col gap-5">
          <fieldset>
            <legend className="text-sm font-semibold text-ink-soft">{tr("What do you make? *")}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONTENT_TYPES.map((t) => {
                const on = draft.contentTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      set("contentTypes", on ? draft.contentTypes.filter((x) => x !== t) : [...draft.contentTypes, t])
                    }
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                      on ? "bg-ink text-cream" : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
                    }`}
                  >
                    {tr(t)}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className={labelClass}>
            {tr("Languages you publish in")}
            <input value={draft.languages} onChange={(e) => set("languages", e.target.value)} className={inputClass()} />
          </label>
          <label className={labelClass}>
            {tr("Where most of your audience is")}
            <input
              value={draft.audienceCountries}
              onChange={(e) => set("audienceCountries", e.target.value)}
              placeholder={tr("e.g. USA, UK, Germany")}
              className={inputClass()}
            />
          </label>
          <label className={labelClass}>
            {tr("Why Egypt Eye?")}
            <textarea
              rows={3}
              value={draft.whyEgyptEye}
              onChange={(e) => set("whyEgyptEye", e.target.value)}
              className={inputClass()}
            />
          </label>
          <label className={labelClass}>
            {tr("Links to your three best pieces of work")}
            <textarea
              rows={3}
              value={draft.bestWork}
              onChange={(e) => set("bestWork", e.target.value)}
              placeholder={tr("One per line")}
              className={inputClass()}
            />
          </label>
        </div>
      )}

      {step === "travel" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            {tr("Collaboration type *")}
            <select
              value={draft.collaborationType}
              onChange={(e) => set("collaborationType", e.target.value)}
              className={inputClass()}
            >
              <option value="">{tr("Select a type")}</option>
              {COLLAB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {tr(t)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {tr("Preferred travel dates")}
            <input
              value={draft.travelDates}
              onChange={(e) => set("travelDates", e.target.value)}
              placeholder={tr("e.g. Flexible, or March 2027")}
              className={inputClass()}
            />
          </label>
          <label className={labelClass}>
            {tr("Destinations you are interested in")}
            <input
              value={draft.destinations}
              onChange={(e) => set("destinations", e.target.value)}
              className={inputClass()}
            />
          </label>
          <label className={labelClass}>
            {tr("The experience you would most like")}
            <input
              value={draft.requestedExperience}
              onChange={(e) => set("requestedExperience", e.target.value)}
              className={inputClass()}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            {tr("Are you travelling alone?")}
            <input
              value={draft.travellingAlone}
              onChange={(e) => set("travellingAlone", e.target.value)}
              className={inputClass()}
            />
            <span className="text-xs font-normal text-ink-soft/70">
              {tr("A complimentary package covers you only, unless a companion is separately approved.")}
            </span>
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            {tr("Anything else you would like us to know")}
            <textarea
              rows={4}
              value={draft.message}
              onChange={(e) => set("message", e.target.value)}
              className={inputClass()}
            />
          </label>
        </div>
      )}

      {step === "agree" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft/85">
            {tr("How the Creator Club works. Please confirm you have read each one — these are the operating rules, not a contract. If we go ahead, the full campaign terms come to you in writing first.")}
          </p>
          {ACKNOWLEDGEMENTS.map((a) => (
            <label
              key={a.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-gold/20 bg-sand/40 px-4 py-3 text-sm text-ink-soft"
            >
              <input
                type="checkbox"
                checked={Boolean(draft.acknowledged[a.id])}
                onChange={(e) => set("acknowledged", { ...draft.acknowledged, [a.id]: e.target.checked })}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#1d2b22]"
              />
              <span>{tr(a.text)}</span>
            </label>
          ))}
        </div>
      )}

      {step === "review" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft/85">{tr("A last look before it goes to our Collaborations team.")}</p>
          <dl className="rounded-2xl border border-gold/20 bg-sand/40 p-4 text-sm">
            {[
              [tr("Name"), draft.fullName],
              [tr("Creator name"), draft.creatorName || "—"],
              [tr("Email"), draft.email],
              [tr("Country"), draft.country],
              [
                tr("Accounts"),
                draft.socials
                  .filter((s) => s.handle.trim())
                  .map((s) => `${s.platform} ${s.handle}`)
                  .join(", ") || "—",
              ],
              [tr("Media kit"), draft.hasMediaKitFile ? tr("PDF attached") : draft.mediaKitUrl || "—"],
              [tr("Content"), draft.contentTypes.join(", ") || "—"],
              [tr("Collaboration"), draft.collaborationType || "—"],
              [tr("Travel dates"), draft.travelDates || "—"],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex gap-3 border-b border-black/5 py-1.5 last:border-0">
                <dt className="w-32 shrink-0 text-ink-soft/70">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          {outstanding.length > 0 && (
            <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta">
              <p className="font-semibold">{tr("Still needed before you can send this:")}</p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {outstanding.map(({ step: s, issues: list }) => {
                  const index = STEPS.findIndex((x) => x.id === s);
                  return (
                    <li key={s}>
                      <button type="button" onClick={() => jumpTo(index)} className="underline">
                        {tr(STEPS[index].title)}
                      </button>
                      {" — "}
                      {list.map((i) => tr(i.message)).join(", ")}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {scorePanel}
        </div>
      )}

      {showIssues && issues.length > 0 && (
        <ul className="mt-5 rounded-xl border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta">
          {issues.map((i) => (
            <li key={i.field}>{tr(i.message)}</li>
          ))}
        </ul>
      )}

      {errorMessage && <p className="mt-4 text-sm font-semibold text-terracotta">{errorMessage}</p>}

      <div className="mt-8 flex gap-3">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="rounded-full border border-ink/15 px-5 py-3.5 text-sm font-semibold text-ink-soft"
          >
            {tr("Back")}
          </button>
        )}
        {step !== "review" ? (
          <button
            type="button"
            onClick={goNext}
            className="flex-1 rounded-full bg-ink py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
          >
            {tr("Continue")}
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={status === "sending" || !canSubmit(draft)}
            className="flex-1 rounded-full bg-ink py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-50"
          >
            {status === "sending" ? tr("Sending…") : tr("Submit application")}
          </button>
        )}
      </div>

      {status === "error" && (
        <p className="mt-3 text-center text-xs text-terracotta">
          {tr("Something went wrong sending your application. Please message us directly on WhatsApp instead.")}
        </p>
      )}
    </div>
  );
}
