"use client";

import { useState } from "react";
import { useTr } from "@/i18n/LocaleProvider";

export function AddExperienceButton({ reservationId, slug, title }: { reservationId: string; slug: string; title: string }) {
  const tr = useTr();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleClick() {
    setStatus("sending");
    try {
      const res = await fetch(`/api/reservations/${reservationId}/change-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestType: "add_experience", slug, title }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p className="text-xs font-semibold text-nile">{tr("Sent to Egypt Eye ✓")}</p>;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "sending"}
      className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-ink-soft transition hover:border-gold/40 hover:text-ink disabled:opacity-60"
    >
      {status === "sending" ? tr("Sending…") : status === "error" ? tr("Try again") : tr("Add to My Trip")}
    </button>
  );
}
