"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Message = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hi! I'm the Egypt Eye assistant. Ask me about our tours, destinations, what's included, or how booking works — I'm happy to help.";

export function ChatWidget({ whatsappLink }: { whatsappLink: string }) {
  const [open, setOpen] = useState(false);
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");
      setMessages([...next, { role: "assistant", content: data.reply }]);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-44 right-4 z-50 flex h-[min(65vh,30rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-2xl shadow-black/20 sm:right-6">
          <div className="flex items-center justify-between bg-ink px-5 py-4">
            <div>
              <p className="font-display text-sm font-semibold text-cream">Egypt Eye Assistant</p>
              <p className="text-xs text-cream/50">Usually answers in seconds</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-full text-cream/70 transition hover:bg-white/10 hover:text-cream"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-sand-dim px-4 py-2.5 text-sm text-ink-soft">
              {GREETING}
            </div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-ink px-4 py-2.5 text-sm text-cream"
                    : "max-w-[85%] rounded-2xl rounded-tl-sm bg-sand-dim px-4 py-2.5 text-sm text-ink-soft"
                }
              >
                {m.content}
              </div>
            ))}
            {status === "sending" && (
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-sand-dim px-4 py-2.5 text-sm text-ink-soft/50">
                Thinking…
              </div>
            )}
            {status === "error" && (
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-terracotta/10 px-4 py-2.5 text-sm text-terracotta">
                {errorMessage} Prefer to talk to a person? Message us on{" "}
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="underline">
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
              placeholder="Ask about a tour, destination, or booking…"
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
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream shadow-lg shadow-black/20 transition hover:scale-105 sm:right-6"
      >
        {open ? (
          <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-4.6 3.45A.5.5 0 0 1 3.6 20V6a1 1 0 0 1 1-1Zm4 4v2h8V8H8Zm0 4v2h5v-2H8Z" />
          </svg>
        )}
      </button>
    </>
  );
}
