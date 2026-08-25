"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { useJourneyItems } from "@/lib/journey";
import type { JourneyDetailsResponse } from "@/app/api/journey/route";

type FormData = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  tripStartDate: string;
  tripEndDate: string;
  travelersAdults: number;
  travelersChildren: number;
  preferences: string;
  discountCode: string;
};

type DiscountState = { checked: false } | { checked: true; valid: true; discountAmount: number } | { checked: true; valid: false; reason: string };

const STEPS = ["Your Details", "Dates", "Travelers & Preferences", "Discount Code", "Review"];

const emptyDetails: JourneyDetailsResponse = { tours: [], experiences: [], photoshoots: [], destinations: [] };

export function ReserveWizard({ currentUser }: { currentUser: { email: string; firstName: string | null } | null }) {
  const items = useJourneyItems();
  const [fetchedDetails, setDetails] = useState<JourneyDetailsResponse | null>(null);
  const [fetchStatus, setFetchStatus] = useState<"idle" | "error">("idle");
  const details = items.length === 0 ? emptyDetails : (fetchedDetails ?? emptyDetails);
  const loadingDetails = items.length > 0 && fetchedDetails === null && fetchStatus === "idle";
  const [step, setStep] = useState(0);
  const [discountState, setDiscountState] = useState<DiscountState>({ checked: false });
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState<{ reference: string; subtotal: number | null; discountAmount: number; total: number | null } | null>(
    null
  );

  const [form, setForm] = useState<FormData>({
    guestName: currentUser?.firstName ?? "",
    guestEmail: currentUser?.email ?? "",
    guestPhone: "",
    tripStartDate: "",
    tripEndDate: "",
    travelersAdults: 2,
    travelersChildren: 0,
    preferences: "",
    discountCode: "",
  });

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    fetch("/api/journey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(({ type, slug }) => ({ type, slug })) }),
    })
      .then((res) => res.json())
      .then((data: JourneyDetailsResponse) => {
        if (!cancelled) setDetails(data);
      })
      .catch(() => {
        if (!cancelled) setFetchStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [items]);

  const priced = useMemo(
    () => [...details.tours, ...details.experiences, ...details.photoshoots].filter((i) => typeof i.price?.amount === "number"),
    [details]
  );
  const subtotal = useMemo(() => Math.round(priced.reduce((sum, i) => sum + (i.price!.amount as number), 0) * 100) / 100, [priced]);
  const tourSlugs = details.tours.map((t) => t.slug);
  const experienceSlugs = details.experiences.map((e) => e.slug);
  const allTitles = [
    ...details.tours.map((t) => t.title),
    ...details.experiences.map((e) => e.title),
    ...details.photoshoots.map((p) => p.title),
    ...details.destinations.map((d) => d.name),
  ];

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function checkDiscount() {
    if (!form.discountCode.trim()) {
      setDiscountState({ checked: false });
      return;
    }
    setCheckingDiscount(true);
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: form.discountCode, tourSlugs, experienceSlugs, subtotal }),
      });
      const data = await res.json();
      setDiscountState(data.valid ? { checked: true, valid: true, discountAmount: data.discountAmount } : { checked: true, valid: false, reason: data.reason });
    } catch {
      setDiscountState({ checked: true, valid: false, reason: "Couldn't check that code right now." });
    } finally {
      setCheckingDiscount(false);
    }
  }

  async function handleSubmit() {
    setSubmitStatus("submitting");
    setSubmitError("");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: form.guestName,
          guestEmail: form.guestEmail,
          guestPhone: form.guestPhone || undefined,
          tripStartDate: form.tripStartDate || undefined,
          tripEndDate: form.tripEndDate || undefined,
          travelersAdults: form.travelersAdults,
          travelersChildren: form.travelersChildren,
          preferences: form.preferences || undefined,
          discountCode: discountState.checked && discountState.valid ? form.discountCode : undefined,
          items: items.map(({ type, slug }) => ({ type, slug })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setConfirmation({ reference: data.reference, subtotal: data.subtotal, discountAmount: data.discountAmount, total: data.total });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitStatus("error");
    }
  }

  if (confirmation) {
    return <Confirmation confirmation={confirmation} titles={allTitles} form={form} />;
  }

  if (!loadingDetails && items.length === 0) {
    return (
      <section className="bg-sand py-24">
        <Container className="mx-auto max-w-lg text-center">
          <h1 className="font-display text-3xl font-semibold text-ink">Your journey is empty</h1>
          <p className="mt-4 text-ink-soft/70">Add a tour, experience, or destination before requesting a reservation.</p>
          <Link href="/explore-egypt" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark">
            Start Exploring Egypt
          </Link>
        </Container>
      </section>
    );
  }

  const canContinue =
    step === 0 ? Boolean(form.guestName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) : true;

  return (
    <section className="bg-sand py-14 sm:py-20">
      <Container className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">Request Your Journey</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Let&rsquo;s put your trip together</h1>
          <div className="mt-6 flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-gold-dark" : "bg-black/10"}`} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs font-medium text-ink-soft/60">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        <div className="animate-fade-up rounded-3xl border border-gold/15 bg-cream p-6 shadow-xl shadow-black/5 sm:p-9">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              {!currentUser && (
                <div className="rounded-2xl border border-gold/20 bg-sand-dim p-4 text-sm text-ink-soft/70">
                  Booking as a guest.{" "}
                  <Link href="/account/login?next=/reserve" className="font-semibold text-gold-dark underline">
                    Log in
                  </Link>{" "}
                  or{" "}
                  <Link href="/account/signup?next=/reserve" className="font-semibold text-gold-dark underline">
                    create an account
                  </Link>{" "}
                  to track this reservation in My Account.
                </div>
              )}
              <Field label="Full Name *">
                <input value={form.guestName} onChange={(e) => update("guestName", e.target.value)} className={inputClass} required />
              </Field>
              <Field label="Email *">
                <input type="email" value={form.guestEmail} onChange={(e) => update("guestEmail", e.target.value)} className={inputClass} required />
              </Field>
              <Field label="Phone (optional)">
                <input type="tel" value={form.guestPhone} onChange={(e) => update("guestPhone", e.target.value)} className={inputClass} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Field label="Trip start date">
                <input
                  type="date"
                  value={form.tripStartDate}
                  onChange={(e) => update("tripStartDate", e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={inputClass}
                />
              </Field>
              <Field label="Trip end date (optional)">
                <input
                  type="date"
                  value={form.tripEndDate}
                  onChange={(e) => update("tripEndDate", e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={inputClass}
                />
              </Field>
              <p className="text-xs text-ink-soft/50">Not sure yet? Leave these blank — we can finalize dates together.</p>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Adults">
                  <input
                    type="number"
                    min={1}
                    value={form.travelersAdults}
                    onChange={(e) => update("travelersAdults", Math.max(1, Number(e.target.value)))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Children">
                  <input
                    type="number"
                    min={0}
                    value={form.travelersChildren}
                    onChange={(e) => update("travelersChildren", Math.max(0, Number(e.target.value)))}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Preferences or special requests (optional)">
                <textarea
                  value={form.preferences}
                  onChange={(e) => update("preferences", e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder="Dietary needs, accessibility, pace, interests…"
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <Field label="Discount code (optional)">
                <div className="flex gap-2">
                  <input
                    value={form.discountCode}
                    onChange={(e) => {
                      update("discountCode", e.target.value.toUpperCase());
                      setDiscountState({ checked: false });
                    }}
                    placeholder="EGY4-XXXXXX"
                    className={`${inputClass} font-mono uppercase`}
                  />
                  <button
                    type="button"
                    onClick={checkDiscount}
                    disabled={checkingDiscount || !form.discountCode.trim()}
                    className="shrink-0 rounded-lg bg-ink px-4 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-50"
                  >
                    {checkingDiscount ? "Checking…" : "Apply"}
                  </button>
                </div>
              </Field>
              {discountState.checked && discountState.valid && (
                <p className="text-sm font-semibold text-nile">✓ Code applied — ${discountState.discountAmount.toLocaleString()} off</p>
              )}
              {discountState.checked && !discountState.valid && <p className="text-sm text-terracotta">{discountState.reason}</p>}
              <p className="text-xs text-ink-soft/50">Have a 4% off code from our newsletter? Enter it here.</p>
            </div>
          )}

          {step === 4 && (
            <ReviewStep
              form={form}
              titles={allTitles}
              subtotal={subtotal}
              hasUnpriced={priced.length < details.tours.length + details.experiences.length + details.photoshoots.length}
              discountState={discountState}
              submitError={submitError}
            />
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={`text-sm font-semibold text-ink-soft/60 hover:text-ink ${step === 0 ? "invisible" : ""}`}
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-50"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={submitStatus === "submitting"}
                onClick={handleSubmit}
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
              >
                {submitStatus === "submitting" ? "Submitting…" : "Submit Reservation Request"}
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

const inputClass = "rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold w-full";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
      {label}
      {children}
    </label>
  );
}

function ReviewStep({
  form,
  titles,
  subtotal,
  hasUnpriced,
  discountState,
  submitError,
}: {
  form: FormData;
  titles: string[];
  subtotal: number;
  hasUnpriced: boolean;
  discountState: DiscountState;
  submitError: string;
}) {
  const discountAmount = discountState.checked && discountState.valid ? discountState.discountAmount : 0;
  const total = subtotal > 0 ? Math.round((subtotal - discountAmount) * 100) / 100 : null;

  return (
    <div className="flex flex-col gap-5 text-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Traveler</p>
        <p className="mt-1 text-ink">{form.guestName} · {form.guestEmail}{form.guestPhone ? ` · ${form.guestPhone}` : ""}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Dates &amp; Travelers</p>
        <p className="mt-1 text-ink">
          {form.tripStartDate ? new Date(form.tripStartDate).toLocaleDateString() : "Dates to be confirmed"}
          {form.tripEndDate ? ` – ${new Date(form.tripEndDate).toLocaleDateString()}` : ""} · {form.travelersAdults}{" "}
          adult{form.travelersAdults === 1 ? "" : "s"}
          {form.travelersChildren > 0 ? `, ${form.travelersChildren} child${form.travelersChildren === 1 ? "" : "ren"}` : ""}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Your Journey ({titles.length})</p>
        <ul className="mt-1 flex flex-col gap-1 text-ink">
          {titles.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      {form.preferences && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Preferences</p>
          <p className="mt-1 text-ink">{form.preferences}</p>
        </div>
      )}

      <div className="rounded-2xl border border-gold/20 bg-sand-dim p-4">
        {subtotal > 0 ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-ink-soft/70">Trip estimate</span>
              <span className="font-medium text-ink">${subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-nile">
                <span>Discount</span>
                <span>-${discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t border-black/10 pt-1.5 text-base font-semibold text-ink">
              <span>Estimated total</span>
              <span>${total?.toLocaleString()}</span>
            </div>
            <p className="mt-2 text-xs text-ink-soft/60">
              This is an estimate based on listed pricing{hasUnpriced ? " for the items that have one" : ""}. The final
              amount depends on your confirmed itinerary — our team will follow up with exact pricing.
            </p>
          </div>
        ) : (
          <p className="text-xs text-ink-soft/70">
            Your journey includes custom-quoted experiences, so we&rsquo;ll confirm your exact pricing directly
            {discountAmount > 0 || (discountState.checked && discountState.valid) ? " — your discount code will be applied to that quote." : "."}
          </p>
        )}
      </div>

      {submitError && <p className="text-sm text-terracotta">{submitError}</p>}
    </div>
  );
}

function Confirmation({
  confirmation,
  titles,
  form,
}: {
  confirmation: { reference: string; subtotal: number | null; discountAmount: number; total: number | null };
  titles: string[];
  form: FormData;
}) {
  return (
    <section className="bg-sand py-20 sm:py-28">
      <Container className="mx-auto max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">Reservation Requested</p>
        <h1 className="mt-3 text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
          Your Egypt journey is on its way.
        </h1>
        <p className="mt-4 text-ink-soft/80">
          Your request has been received. Our Egypt Eye team will review your journey and contact you with the next
          steps.
        </p>

        <div className="mt-8 rounded-3xl border border-gold/15 bg-cream p-6 text-left shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Reference</p>
          <p className="mt-1 font-mono text-lg font-bold text-ink">{confirmation.reference}</p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Journey ({titles.length})</p>
          <ul className="mt-1 flex flex-col gap-1 text-sm text-ink">
            {titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          {form.tripStartDate && (
            <p className="mt-4 text-sm text-ink-soft/70">
              Trip start: <span className="font-medium text-ink">{new Date(form.tripStartDate).toLocaleDateString()}</span>
            </p>
          )}
          <p className="mt-1 text-sm text-ink-soft/70">
            Travelers: <span className="font-medium text-ink">{form.travelersAdults} adult{form.travelersAdults === 1 ? "" : "s"}{form.travelersChildren > 0 ? `, ${form.travelersChildren} child${form.travelersChildren === 1 ? "" : "ren"}` : ""}</span>
          </p>

          {confirmation.total !== null ? (
            <div className="mt-4 border-t border-black/5 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft/70">Trip estimate</span>
                <span>${confirmation.subtotal?.toLocaleString()}</span>
              </div>
              {confirmation.discountAmount > 0 && (
                <div className="flex justify-between text-nile">
                  <span>Discount used</span>
                  <span>-${confirmation.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between text-base font-semibold text-ink">
                <span>Estimated total</span>
                <span>${confirmation.total.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 border-t border-black/5 pt-4 text-sm text-ink-soft/70">
              We&rsquo;ll follow up with your confirmed pricing.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/my-journey" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark">
            Back to My Journey
          </Link>
          <Link href="/" className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-cream">
            Back to Home
          </Link>
        </div>
      </Container>
    </section>
  );
}
