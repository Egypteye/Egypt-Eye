"use client";

import { useState } from "react";
import { logShare } from "./actions";

const BRAND_MARK_SRC = "/brand/egypt-eye-mark-gold.png";
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920; // Instagram Story aspect ratio (9:16)

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Renders a branded, story-shaped (9:16) achievement card client-side —
// this is what makes real Instagram sharing possible at all. Instagram's
// share target only accepts image/video files, not plain text+links, so
// navigator.share({ url, text }) alone never surfaces Instagram in the OS
// share sheet. Handing it an actual file does.
async function buildAchievementCard(opts: {
  campaignName: string;
  tierName: string;
  rewardPercent: number;
  siteUrl: string;
}): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const bg = ctx.createRadialGradient(
    CARD_WIDTH / 2,
    CARD_HEIGHT * 0.35,
    120,
    CARD_WIDTH / 2,
    CARD_HEIGHT * 0.5,
    CARD_HEIGHT * 0.85
  );
  bg.addColorStop(0, "#22331f");
  bg.addColorStop(0.55, "#1b2a20");
  bg.addColorStop(1, "#0c1109");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = "#e4c878";
  ctx.lineWidth = 2;
  for (let x = -CARD_HEIGHT; x < CARD_WIDTH; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + CARD_HEIGHT, CARD_HEIGHT);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(228,200,120,0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, CARD_WIDTH - 88, CARD_HEIGHT - 88);

  try {
    const mark = await loadImage(BRAND_MARK_SRC);
    const markSize = 190;
    ctx.drawImage(mark, CARD_WIDTH / 2 - markSize / 2, 220, markSize, markSize);
  } catch {
    // Logo is decorative — the card still works without it.
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#e4c878";
  ctx.font = "600 32px Georgia, 'Times New Roman', serif";
  ctx.fillText("P H A R A O H ' S   C H A L L E N G E", CARD_WIDTH / 2, 500);

  ctx.fillStyle = "#f7f2e7";
  ctx.font = "700 76px Georgia, 'Times New Roman', serif";
  const tierLines = wrapLines(ctx, opts.tierName, CARD_WIDTH - 220).slice(0, 2);
  tierLines.forEach((line, i) => ctx.fillText(line, CARD_WIDTH / 2, 660 + i * 90));

  ctx.fillStyle = "#e4c878";
  ctx.font = "700 190px Georgia, 'Times New Roman', serif";
  ctx.fillText(`${opts.rewardPercent}%`, CARD_WIDTH / 2, 1120);

  ctx.fillStyle = "rgba(247,242,231,0.75)";
  ctx.font = "400 42px Georgia, 'Times New Roman', serif";
  ctx.fillText("REWARD UNLOCKED", CARD_WIDTH / 2, 1195);

  ctx.fillStyle = "rgba(247,242,231,0.5)";
  ctx.font = "400 34px Georgia, 'Times New Roman', serif";
  ctx.fillText(opts.campaignName, CARD_WIDTH / 2, 1660);

  ctx.fillStyle = "#e4c878";
  ctx.font = "600 38px Georgia, 'Times New Roman', serif";
  ctx.fillText(opts.siteUrl.replace(/^https?:\/\//, ""), CARD_WIDTH / 2, 1740);

  ctx.fillStyle = "rgba(247,242,231,0.4)";
  ctx.font = "400 30px Georgia, 'Times New Roman', serif";
  ctx.fillText("/pharaoh-challenge", CARD_WIDTH / 2, 1782);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png", 0.95));
}

// Opens Facebook's share dialog in a real popup window rather than a plain
// target="_blank" link — more reliable across mobile browsers and in-app
// webviews (Instagram/Facebook's own in-app browser in particular often
// swallows plain new-tab links), and falls back to the current tab if the
// popup is blocked rather than silently doing nothing.
function openSharePopup(url: string) {
  const width = 580;
  const height = 640;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const popup = window.open(url, "_blank", `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`);
  if (!popup) window.location.href = url;
}

export function ShareAchievement({
  campaignId,
  campaignName,
  tierName,
  rewardPercent,
  shareUrl,
  shareText,
}: {
  campaignId: string;
  campaignName: string;
  tierName: string;
  rewardPercent: number;
  shareUrl: string;
  shareText: string;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"share" | "download" | null>(null);
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  async function track(channel: string) {
    try {
      await logShare(campaignId, channel);
    } catch {
      // Analytics failure shouldn't block sharing.
    }
  }

  async function buildCard(): Promise<Blob | null> {
    return buildAchievementCard({ campaignName, tierName, rewardPercent, siteUrl: shareUrl.replace("/pharaoh-challenge", "") });
  }

  async function handleNativeShare() {
    setBusy("share");
    try {
      const blob = await buildCard();
      const file = blob ? new File([blob], "pharaohs-challenge-egypt-eye.png", { type: "image/png" }) : null;
      const canShareFile = file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

      if (canShareFile && file) {
        // Sharing a real image file is what surfaces Instagram (Stories/DM)
        // as a target in the OS share sheet — text+url alone won't.
        await navigator.share({ title: "Pharaoh's Challenge — Egypt Eye", text: shareText, files: [file] });
      } else {
        await navigator.share({ title: "Pharaoh's Challenge — Egypt Eye", text: shareText, url: shareUrl });
      }
      track("native");
    } catch {
      // User cancelled — nothing to do.
    } finally {
      setBusy(null);
    }
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const blob = await buildCard();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pharaohs-challenge-egypt-eye.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      track("download");
    } finally {
      setBusy(null);
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
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={busy !== null}
            className="rounded-full bg-gold px-6 py-3 text-base font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
          >
            {busy === "share" ? "Preparing image…" : "Share My Achievement"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            openSharePopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
            track("facebook");
          }}
          className="rounded-full border border-cream/25 px-6 py-3 text-base font-semibold text-cream/80 transition hover:bg-cream/10"
        >
          Facebook
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp")}
          className="rounded-full border border-cream/25 px-6 py-3 text-base font-semibold text-cream/80 transition hover:bg-cream/10"
        >
          WhatsApp
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-cream/25 px-6 py-3 text-base font-semibold text-cream/80 transition hover:bg-cream/10"
        >
          {copied ? "Link Copied ✓" : "Copy Link"}
        </button>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy !== null}
        className="text-sm font-semibold text-cream/60 underline underline-offset-4 transition hover:text-cream disabled:opacity-60"
      >
        {busy === "download" ? "Preparing image…" : "Download my achievement card"}
      </button>
      <p className="max-w-xs text-center text-sm text-cream/40">
        For Instagram: tap Share My Achievement (or download the card) and post it to your Story.
      </p>
    </div>
  );
}
