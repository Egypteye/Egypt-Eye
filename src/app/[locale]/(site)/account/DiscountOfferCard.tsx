"use client";

import { useState } from "react";
import Link from "next/link";

type DiscountCode = {
  id: string;
  code: string;
  status: "available" | "redeemed" | "expired" | "revoked";
  expires_at: string | null;
  discount_campaigns: { name: string; discount_type: string; value: number } | null;
};

const STATUS_STYLE: Record<DiscountCode["status"], string> = {
  available: "bg-nile/10 text-nile",
  redeemed: "bg-black/5 text-ink-soft/60",
  expired: "bg-terracotta/10 text-terracotta",
  revoked: "bg-terracotta/10 text-terracotta",
};

const STATUS_LABEL: Record<DiscountCode["status"], string> = {
  available: "Available",
  redeemed: "Redeemed",
  expired: "Expired",
  revoked: "No Longer Valid",
};

export function DiscountOfferCard({ code }: { code: DiscountCode }) {
  const [copied, setCopied] = useState(false);
  const label =
    code.discount_campaigns?.discount_type === "fixed"
      ? "Special Offer"
      : `${code.discount_campaigns?.value ?? 4}% OFF`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the code is still visible to copy manually.
    }
  }

  return (
    <div className="rounded-2xl border border-gold/20 bg-cream p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">{label}</p>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[code.status]}`}>
          {STATUS_LABEL[code.status]}
        </span>
      </div>
      <p className="mt-2 font-mono text-lg font-bold tracking-wide text-ink">{code.code}</p>
      {code.expires_at && (
        <p className="mt-1 text-xs text-ink-soft/50">
          {code.status === "expired" ? "Expired" : "Valid until"} {new Date(code.expires_at).toLocaleDateString()}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 rounded-full border border-black/10 py-2 text-xs font-semibold text-ink-soft transition hover:border-gold/40 hover:text-ink"
        >
          {copied ? "Copied ✓" : "Copy Code"}
        </button>
        {code.status === "available" && (
          <Link
            href="/explore-egypt"
            className="flex-1 rounded-full bg-ink py-2 text-center text-xs font-semibold text-cream transition hover:bg-gold-dark"
          >
            Use My Discount
          </Link>
        )}
      </div>
    </div>
  );
}
