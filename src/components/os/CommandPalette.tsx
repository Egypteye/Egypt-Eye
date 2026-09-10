"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "./icons";

// ---------------------------------------------------------------------------
// THE COMMAND CENTRE — Cmd/Ctrl + K
// ---------------------------------------------------------------------------
// One box that is both the search and the way you get anywhere. It opens on
// the shortcut, on the header button, and on the mobile search icon.
//
// Results come from /api/os/search, which runs the SAME permission and scope
// checks as the screens. A photographer searching a client name finds the
// trips they are on and nothing else — they do not learn that other trips with
// that client exist, which is exactly what a search box normally leaks.
// ---------------------------------------------------------------------------

export type PaletteAction = { href: string; label: string; icon: IconName; description?: string; group: string };

type Result = {
  type: string;
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
  badge?: string;
};

const TYPE_ICON: Record<string, IconName> = {
  trip: "Trip", client: "Client", employee: "Users", resource: "Truck",
  supplier: "Building", task: "CheckSquare", knowledge: "Book", document: "Doc", incident: "Alert",
};

export function CommandPalette({ actions }: { actions: PaletteAction[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Opening and closing own their own state, rather than an effect reacting
  // to the flag afterwards — that indirection is what produces the cascading
  // render React warns about, and it also makes the reset harder to follow.
  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setResults([]);
    setCursor(0);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((wasOpen) => {
          if (wasOpen) { setQuery(""); setResults([]); return false; }
          setQuery(""); setResults([]); setCursor(0);
          return true;
        });
      }
      if (event.key === "Escape") closePalette();
    }
    window.addEventListener("keydown", onKey);
    // The header button and the mobile search icon both dispatch this.
    window.addEventListener("os:open-command", openPalette);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("os:open-command", openPalette);
    };
  }, [openPalette, closePalette]);

  // Focus the input once the dialog is on screen. No state is set here.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    // Below two characters there is nothing to fetch. The empty result is
    // derived below rather than written to state here.
    if (term.length < 2) return;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const response = await fetch(`/api/os/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("search failed");
        const body = (await response.json()) as { results: Result[] };
        setResults(body.results ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  const filteredActions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return actions.slice(0, 8);
    return actions.filter((a) => a.label.toLowerCase().includes(term) || a.group.toLowerCase().includes(term)).slice(0, 6);
  }, [actions, query]);

  const rows = useMemo(
    () => {
      // Anything shorter than the fetch threshold shows no results, whatever
      // the last request happened to return.
      const visibleResults = query.trim().length < 2 ? [] : results;
      return [
        ...filteredActions.map((a) => ({ kind: "action" as const, href: a.href, title: a.label, subtitle: a.description ?? a.group, icon: a.icon, badge: undefined as string | undefined })),
        ...visibleResults.map((r) => ({ kind: "result" as const, href: r.href, title: r.title, subtitle: r.subtitle ?? "", icon: TYPE_ICON[r.type] ?? "Doc", badge: r.badge })),
      ];
    },
    [filteredActions, results, query],
  );

  const go = useCallback((href: string) => {
    closePalette();
    router.push(href);
  }, [router, closePalette]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/45 px-4 pt-[12vh] backdrop-blur-[2px]"
      onClick={closePalette}
      role="presentation"
    >
      <div
        className="os-fade w-full max-w-xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search and commands"
      >
        <div className="flex items-center gap-2.5 border-b border-os-line px-4 py-3">
          <span className="text-os-faint"><Icon.Search size={18} /></span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, rows.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
              if (e.key === "Enter" && rows[cursor]) { e.preventDefault(); go(rows[cursor].href); }
            }}
            placeholder="Search trips, clients, people, knowledge — or jump to a screen"
            className="w-full bg-transparent text-[14.5px] text-os-text placeholder:text-os-faint focus:outline-none"
            aria-label="Search"
          />
          {loading && query.trim().length >= 2 ? <span className="text-[11px] text-os-faint">searching…</span> : null}
          <kbd className="hidden rounded border border-os-line px-1.5 py-0.5 text-[10px] font-medium text-os-faint sm:block">esc</kbd>
        </div>

        <div className="os-scroll max-h-[52vh] overflow-y-auto py-1.5">
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-os-muted">
              {query.trim().length < 2
                ? "Start typing. Two letters is enough."
                : `Nothing matches “${query.trim()}” that you have access to.`}
            </p>
          ) : (
            rows.map((row, index) => {
              const Glyph = Icon[row.icon as IconName] ?? Icon.Doc;
              return (
                <button
                  key={`${row.kind}-${row.href}-${index}`}
                  onClick={() => go(row.href)}
                  onMouseEnter={() => setCursor(index)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                    index === cursor ? "bg-os-gold-soft" : "hover:bg-black/[0.03]"
                  }`}
                >
                  <span className="text-os-muted"><Glyph size={17} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-os-text">{row.title}</span>
                    {row.subtitle ? <span className="block truncate text-[12px] text-os-muted">{row.subtitle}</span> : null}
                  </span>
                  {row.badge ? (
                    <span className="shrink-0 rounded bg-black/[0.06] px-1.5 py-0.5 text-[10.5px] capitalize text-os-muted">
                      {row.badge.replace(/_/g, " ")}
                    </span>
                  ) : null}
                  {row.kind === "action" ? <span className="shrink-0 text-[10.5px] text-os-faint">go to</span> : null}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-os-line bg-os-canvas px-4 py-2 text-[11px] text-os-faint">
          <span>↑↓ to move · ↵ to open</span>
          <span>Results respect your permissions</span>
        </div>
      </div>
    </div>
  );
}
