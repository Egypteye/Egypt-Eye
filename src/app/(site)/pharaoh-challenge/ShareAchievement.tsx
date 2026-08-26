"use client";

import { useState } from "react";
import { logShare } from "./actions";

// Instagram has no public web "share to Story" API without Instagram
// Business API access, so this deliberately doesn't fake one. On mobile,
// navigator.share() hands off to the OS share sheet — which is exactly how
// a website can genuinely offer "share to Instagram" — with WhatsApp,
// Facebook, and Copy Link as always-available fallbacks (same clipboard
// pattern as DiscountOfferCard.tsx).
export function ShareAchievement({
  campaignId,
  shareUrl,
  shareText,
}: {
  campaignId: string;
  shareUrl: string;
  shareText: string;
}) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  async function track(channel: string) {
    try {
      await logShare(campaignId, channel);
    } catch {
      // Analytics failure shouldn't block sharing.
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title: "Pharaoh's Challenge — Egypt Eye", text: shareText, url: shareUrl });
      track("native");
    } catch {
      // User cancelled — nothing to do.
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      track("copy_link");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the link is still visible to copy manually.
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-gold-light"
        >
          Share My Achievement
        </button>
      )}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => track("whatsapp")}
        className="rounded-full border border-cream/25 px-5 py-2.5 text-sm font-semibold text-cream/80 transition hover:bg-cream/10"
      >
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => track("facebook")}
        className="rounded-full border border-cream/25 px-5 py-2.5 text-sm font-semibold text-cream/80 transition hover:bg-cream/10"
      >
        Facebook
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full border border-cream/25 px-5 py-2.5 text-sm font-semibold text-cream/80 transition hover:bg-cream/10"
      >
        {copied ? "Link Copied ✓" : "Copy Link"}
      </button>
    </div>
  );
}
