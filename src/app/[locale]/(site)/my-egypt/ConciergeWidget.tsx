"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { whatsappHref } from "@/lib/whatsapp";

type Message = { role: "user" | "assistant"; content: string; suggestedRequest?: string | null; requestStatus?: "idle" | "sending" | "sent" };

const GREETING = "Ask me anything about your trip — what to wear, pickup times, or whether you can add something.";

export function ConciergeWidget({ reservationId, whatsappLink }: { reservationId: string; whatsappLink: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === "sending") return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");
      setMessages([...next, { role: "assistant", content: data.reply, suggestedRequest: data.suggestedRequest, requestStatus: "idle" }]);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  async function sendToTeam(index: number) {
    const msg = messages[index];
    if (!msg.suggestedRequest) return;
    setMessages((prev) => prev.map((m, i) => (i === index ? { ...m, requestStatus: "sending" } : m)));
    try {
      const res = await fetch(`/api/reservations/${reservationId}/change-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestType: "concierge", title: msg.suggestedRequest }),
      });
      if (!res.ok) throw new Error();
      setMessages((prev) => prev.map((m, i) => (i === index ? { ...m, requestStatus: "sent" } : m)));
    } catch {
      setMessages((prev) => prev.map((m, i) => (i === index ? { ...m, requestStatus: "idle" } : m)));
    }
  }

  return (
    <div className="flex h-[28rem] flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-sand-dim px-4 py-2.5 text-sm text-ink-soft">{GREETING}</div>
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className="flex max-w-[85%] flex-col gap-2">
              <div
                className={
                  m.role === "user"
                    ? "rounded-2xl rounded-tr-sm bg-ink px-4 py-2.5 text-sm text-cream"
                    : "rounded-2xl rounded-tl-sm bg-sand-dim px-4 py-2.5 text-sm text-ink-soft"
                }
              >
                {m.content}
              </div>
              {m.suggestedRequest && (
                <div className="rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs text-ink-soft">
                  <p className="font-medium text-ink">Would you like me to send this request to the Egypt Eye team?</p>
                  <p className="mt-1 text-ink-soft/70">&ldquo;{m.suggestedRequest}&rdquo;</p>
                  {m.requestStatus === "sent" ? (
                    <p className="mt-2 font-semibold text-nile">Sent to Egypt Eye ✓</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => sendToTeam(i)}
                      disabled={m.requestStatus === "sending"}
                      className="mt-2 rounded-full bg-ink px-3 py-1.5 font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
                    >
                      {m.requestStatus === "sending" ? "Sending…" : "Yes, send this request"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {status === "sending" && (
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-sand-dim px-4 py-2.5 text-sm text-ink-soft/50">Thinking…</div>
        )}
        {status === "error" && (
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-terracotta/10 px-4 py-2.5 text-sm text-terracotta">
            {errorMessage} Prefer to talk to a person? Message us on{" "}
            <a
              href={whatsappHref(whatsappLink, { page: "the My Egypt concierge chat", intro: "Hi, I have a question about my trip." })}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              WhatsApp
            </a>
            .
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-black/5 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What should I wear tomorrow?"
          maxLength={1000}
          className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
        <button
          type="submit"
          disabled={status === "sending" || !input.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition hover:bg-gold-light disabled:opacity-40"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M2 10l15-7-4 7 4 7-15-7Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
