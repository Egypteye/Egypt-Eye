"use client";

import { useMemo, useState, type FormEvent } from "react";
import { transfersPage } from "@/content/transfers";
import { getTransferQuote } from "@/lib/transferPricing";
import type { TransferCategory, TransferVehicleId, TransferZone } from "@/content/types";

const { categories, vehicles, zones } = transfersPage;

const DURATION_OPTIONS = [3, 4, 5, 6, 8, 10];

type Status = "idle" | "sending" | "sent" | "error";

function zonesFor(category: TransferCategory): TransferZone[] {
  if (category === "intercity") return [...zones];
  return zones.filter((z) => z.group === "Cairo & Giza" || z.isCustom);
}

function inputClass(extra = "") {
  return `rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold ${extra}`;
}

function Stepper({ value, onChange, min = 1, max = 60, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className={inputClass("flex items-center justify-between gap-3")}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label={`Decrease ${label}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand-dim text-ink-soft transition hover:bg-sand-deep hover:text-ink"
      >
        −
      </button>
      <span className="text-sm font-semibold text-ink">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label={`Increase ${label}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand-dim text-ink-soft transition hover:bg-sand-deep hover:text-ink"
      >
        +
      </button>
    </div>
  );
}

export function TransferBookingForm() {
  const [category, setCategory] = useState<TransferCategory>("airport");
  const [fromZoneId, setFromZoneId] = useState("");
  const [toZoneId, setToZoneId] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [isDailyRate, setIsDailyRate] = useState(false);
  const [durationHours, setDurationHours] = useState(4);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [vehicleId, setVehicleId] = useState<TransferVehicleId>("sedan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const zoneOptions = zonesFor(category);
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId)!;
  const fromZone = zones.find((z) => z.id === fromZoneId);
  const toZone = zones.find((z) => z.id === toZoneId);
  const isPrivateDriver = category === "private-driver";
  const isCustomCategory = category === "custom";
  const overCapacity = passengers > selectedVehicle.passengers;

  const quote = useMemo(
    () =>
      getTransferQuote({
        category,
        fromZoneId: fromZoneId || undefined,
        toZoneId: toZoneId || undefined,
        vehicleId,
        durationHours: isPrivateDriver ? durationHours : undefined,
        isDailyRate: isPrivateDriver ? isDailyRate : undefined,
      }),
    [category, fromZoneId, toZoneId, vehicleId, durationHours, isDailyRate, isPrivateDriver]
  );

  function routeSummary(): string {
    if (isPrivateDriver) return `Private Driver — ${isDailyRate ? "Full day" : `${durationHours} hours`} (${selectedVehicle.name})`;
    if (isCustomCategory) return `${customFrom || "Pickup (custom)"} → ${customTo || "Destination (custom)"}`;
    const fromLabel = fromZone?.isCustom ? customFrom || "Pickup (custom)" : fromZone?.label || "Pickup";
    const toLabel = toZone?.isCustom ? customTo || "Destination (custom)" : toZone?.label || "Destination";
    return `${fromLabel} → ${toLabel}`;
  }

  function priceSummary(): string {
    if (quote.kind === "priced") {
      const suffix = isPrivateDriver && !isDailyRate ? ` for ${durationHours}h` : "";
      return `$${quote.amount}${suffix}`;
    }
    return "Quote requested";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const form = new FormData(e.currentTarget);
    if ((form.get("company") as string)?.trim()) {
      setStatus("sent");
      return;
    }

    if (!date || !name || !email || !phone) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (isCustomCategory && (!customFrom.trim() || !customTo.trim())) {
      setErrorMessage("Please tell us your pickup location and destination.");
      return;
    }
    if (!isPrivateDriver && !isCustomCategory && (!fromZoneId || !toZoneId)) {
      setErrorMessage("Please select a pickup location and destination.");
      return;
    }
    if ((fromZone?.isCustom && !customFrom.trim()) || (toZone?.isCustom && !customTo.trim())) {
      setErrorMessage("Please specify the custom location.");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/transfer-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeSummary: routeSummary(),
          priceSummary: priceSummary(),
          vehicle: `${selectedVehicle.name} (up to ${selectedVehicle.passengers} passengers, ${selectedVehicle.luggage} bags)`,
          date,
          time,
          passengers: String(passengers),
          luggage: String(luggage),
          name,
          email,
          phone,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-gold/15 bg-cream p-10 text-center shadow-xl shadow-black/5">
        <p className="font-display text-2xl font-semibold text-ink">Request sent</p>
        <p className="mt-3 text-sm text-ink-soft/70">
          We&rsquo;ve received your transfer request for <strong>{routeSummary()}</strong>. We&rsquo;ll confirm by email
          shortly{quote.kind === "quote" ? " with your quote" : ""}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative rounded-3xl border border-gold/15 bg-cream p-6 shadow-xl shadow-black/5 sm:p-10">
      <div className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* Step 1 — category */}
      <div className="mb-8 border-b border-black/5 pb-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-dark">1</span>
          <h3 className="font-display text-lg font-semibold text-ink">How would you like to travel?</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategory(c.id);
                setFromZoneId("");
                setToZoneId("");
                setCustomFrom("");
                setCustomTo("");
              }}
              aria-pressed={category === c.id}
              className={`rounded-2xl border p-4 text-left transition ${
                category === c.id ? "border-gold-dark bg-gold/10" : "border-black/10 hover:border-gold/40"
              }`}
            >
              <p className="text-sm font-semibold text-ink">{c.label}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft/70">{c.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — route / duration */}
      <div className="mb-8 border-b border-black/5 pb-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-dark">2</span>
          <h3 className="font-display text-lg font-semibold text-ink">
            {isPrivateDriver ? "Duration & pickup" : "Pickup & destination"}
          </h3>
        </div>

        {isPrivateDriver ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Pickup area
              <select value={fromZoneId} onChange={(e) => setFromZoneId(e.target.value)} className={inputClass()}>
                <option value="">Select an area</option>
                {zoneOptions
                  .filter((z) => !z.isCustom)
                  .map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label}
                    </option>
                  ))}
              </select>
            </label>
            <div className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Hire length
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsDailyRate(false)}
                  className={`rounded-full px-3.5 py-2 text-xs font-medium transition ${
                    !isDailyRate ? "bg-gold text-ink" : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
                  }`}
                >
                  By the hour
                </button>
                <button
                  type="button"
                  onClick={() => setIsDailyRate(true)}
                  className={`rounded-full px-3.5 py-2 text-xs font-medium transition ${
                    isDailyRate ? "bg-gold text-ink" : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
                  }`}
                >
                  Full day
                </button>
              </div>
              {!isDailyRate && (
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className={inputClass("mt-1")}
                >
                  {DURATION_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h} hours
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ) : isCustomCategory ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Pickup location
              <input
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                placeholder="e.g. Marsa Alam Airport"
                className={inputClass()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Destination
              <input
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                placeholder="e.g. Cairo, Downtown Hotel"
                className={inputClass()}
              />
            </label>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Pickup location
              <select value={fromZoneId} onChange={(e) => setFromZoneId(e.target.value)} className={inputClass()}>
                <option value="">Select pickup</option>
                {zoneOptions.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
              {fromZone?.isCustom && (
                <input
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  placeholder="Tell us the pickup location"
                  className={inputClass("mt-1")}
                />
              )}
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
              Destination
              <select value={toZoneId} onChange={(e) => setToZoneId(e.target.value)} className={inputClass()}>
                <option value="">Select destination</option>
                {zoneOptions.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
              {toZone?.isCustom && (
                <input
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  placeholder="Tell us the destination"
                  className={inputClass("mt-1")}
                />
              )}
            </label>
          </div>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              required
              className={inputClass()}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Time
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass()} />
          </label>
          <div className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Passengers
            <Stepper value={passengers} onChange={setPassengers} max={40} label="passengers" />
          </div>
          <div className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Luggage
            <Stepper value={luggage} onChange={setLuggage} min={0} max={30} label="luggage" />
          </div>
        </div>
      </div>

      {/* Step 3 — vehicle */}
      <div className="mb-8 border-b border-black/5 pb-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-dark">3</span>
          <h3 className="font-display text-lg font-semibold text-ink">Choose your vehicle</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {vehicles.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVehicleId(v.id)}
              aria-pressed={vehicleId === v.id}
              className={`rounded-2xl border p-4 text-left transition ${
                vehicleId === v.id ? "border-gold-dark bg-gold/10" : "border-black/10 hover:border-gold/40"
              }`}
            >
              <p className="text-sm font-semibold text-ink">{v.name}</p>
              <p className="mt-1 text-xs text-ink-soft/60">{v.tagline}</p>
              <p className="mt-2 text-[11px] uppercase tracking-wide text-ink-soft/50">
                Up to {v.passengers} pax · {v.luggage} bags
              </p>
            </button>
          ))}
        </div>
        {overCapacity && (
          <p className="mt-3 text-xs font-medium text-terracotta">
            {selectedVehicle.name} seats up to {selectedVehicle.passengers} passengers — choose a larger vehicle or reduce your
            passenger count.
          </p>
        )}
      </div>

      {/* Live quote */}
      <div className="mb-8 flex flex-col items-center gap-1.5 rounded-2xl bg-ink px-6 py-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">{routeSummary()}</p>
        <p className="font-display text-xl font-semibold text-cream">We&rsquo;ll send you a quote for this route</p>
      </div>

      {/* Step 4 — contact */}
      <div className="mb-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-dark">4</span>
          <h3 className="font-display text-lg font-semibold text-ink">Your details</h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Full name *
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass()} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            Email *
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass()} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            WhatsApp / Phone *
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClass()} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft sm:col-span-2">
            Flight number or other notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Flight number, hotel name, extra stops — anything that helps us plan your pickup."
              className={inputClass()}
            />
          </label>
        </div>
      </div>

      {errorMessage && <p className="mb-4 text-sm font-medium text-terracotta">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-ink py-4 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Request This Transfer"}
      </button>

      {status === "error" && (
        <p className="mt-3 text-center text-xs text-terracotta">
          Something went wrong sending your request. Please message us directly on WhatsApp instead.
        </p>
      )}
    </form>
  );
}
