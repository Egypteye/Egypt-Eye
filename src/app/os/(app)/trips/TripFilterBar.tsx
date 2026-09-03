"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Icon } from "@/components/os/icons";
import { savedViewLink, unsupportedNote, type SavedView } from "@/lib/os/saved-views";

// Filters live in the URL, not in component state. That makes every view
// shareable and bookmarkable, survives a refresh, and means a saved view is
// simply a link — no separate storage, no drift between what a saved view
// claims and what the filter bar does.
//
// A saved view's link is built from the `query` document stored on the row,
// translated by src/lib/os/saved-views.ts. Renaming a view therefore changes
// nothing about what it shows, and editing its query is what changes the
// list — which is the behaviour the schema promised.

type Option = { key: string; label: string };

const RANGES: Option[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "week", label: "Next 7 days" },
  { key: "month", label: "This month" },
  { key: "quarter", label: "Last 90 days" },
  { key: "past", label: "Past" },
  { key: "all", label: "All time" },
];

const READINESS: Option[] = [
  { key: "red", label: "Not ready" },
  { key: "yellow", label: "At risk" },
  { key: "green", label: "Ready" },
];

const MISSING: Option[] = [
  { key: "crew", label: "Nobody assigned" },
  { key: "driver", label: "No driver" },
  { key: "guide", label: "No guide" },
  { key: "photographer", label: "No photographer" },
  { key: "vehicle", label: "No vehicle" },
  { key: "media", label: "No media folder" },
];

export function TripFilterBar({
  statuses, units, types, tags, savedViews,
}: {
  statuses: { key: string; label: string }[];
  units: { id: string; name: string }[];
  types: { key: string; name: string }[];
  tags: { key: string; label: string }[];
  savedViews: SavedView[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(params.get("q") ?? "");

  const set = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const filterCount = ["status", "unit", "type", "readiness", "missing", "tag", "produces", "balance", "margin_gte", "margin_lt"]
    .filter((k) => params.get(k)).length;

  // A chip is "on" when the URL already matches everything its stored query
  // asks for, so opening a view and then narrowing it further keeps the chip
  // lit rather than pretending you have left the view.
  const current = params.toString();
  const isActive = (href: string) => {
    const target = new URLSearchParams(href.split("?")[1] ?? "");
    if (![...target.keys()].length) return false;
    for (const [key, value] of target) if (params.get(key) !== value) return false;
    return Boolean(current);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => { e.preventDefault(); set("q", search.trim() || null); }}
          className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-os-line-strong bg-white px-2.5 py-1.5 sm:max-w-xs"
        >
          <span className="text-os-faint"><Icon.Search size={15} /></span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Reference or title"
            className="w-full bg-transparent text-[13px] focus:outline-none"
            aria-label="Search trips"
          />
        </form>

        <div className="flex flex-wrap gap-1">
          {RANGES.map((range) => (
            <button
              key={range.key}
              onClick={() => set("range", range.key === "upcoming" ? null : range.key)}
              className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition ${
                (params.get("range") ?? "upcoming") === range.key
                  ? "bg-os-ink text-white"
                  : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`ml-auto flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium transition ${
            filterCount ? "border-os-gold bg-os-gold-soft text-[#7a6415]" : "border-os-line-strong bg-white text-os-muted hover:text-os-text"
          }`}
        >
          <Icon.Filter size={14} />
          Filters{filterCount ? ` (${filterCount})` : ""}
        </button>
      </div>

      {savedViews.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11.5px] font-medium text-os-faint">Saved views</span>
          {savedViews.map((view) => {
            const link = savedViewLink(view.resource, view.query);
            const note = unsupportedNote(link.unsupported);
            const active = isActive(link.href);
            return (
              <Link
                key={view.id}
                href={link.href}
                title={note}
                className={`rounded-full border px-2.5 py-1 text-[12px] transition ${
                  active
                    ? "border-os-gold bg-os-gold-soft text-[#7a6415]"
                    : "border-os-line-strong bg-white text-os-muted hover:border-os-gold hover:text-os-text"
                }`}
              >
                {view.name}
                {note ? <span className="ml-1 text-os-amber" aria-label="part of this view is not applied">*</span> : null}
              </Link>
            );
          })}
          {[...params.keys()].length ? (
            <Link href={pathname} className="px-1.5 text-[12px] font-medium text-os-gold hover:underline">Clear</Link>
          ) : null}
        </div>
      ) : null}

      {open ? (
        <div className="rounded-xl border border-os-line bg-os-card p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterGroup label="Readiness" options={READINESS} value={params.get("readiness")} onChange={(v) => set("readiness", v)} />
            <FilterGroup label="Missing crew" options={MISSING} value={params.get("missing")} onChange={(v) => set("missing", v)} />
            <FilterGroup label="Service" options={types.map((t) => ({ key: t.key, label: t.name }))} value={params.get("type")} onChange={(v) => set("type", v)} />
            <FilterGroup label="Business unit" options={units.map((u) => ({ key: u.id, label: u.name }))} value={params.get("unit")} onChange={(v) => set("unit", v)} />
          </div>
          <div className="mt-4">
            <FilterGroup label="Status" options={statuses.map((s) => ({ key: s.key, label: s.label }))} value={params.get("status")} onChange={(v) => set("status", v)} wrap />
          </div>
          {tags.length ? (
            <div className="mt-4">
              <FilterGroup label="Tag" options={tags.map((t) => ({ key: t.key, label: t.label }))} value={params.get("tag")} onChange={(v) => set("tag", v)} wrap />
            </div>
          ) : null}
          <div className="mt-4">
            <FilterGroup
              label="Content"
              options={[{ key: "content", label: "Produces content" }]}
              value={params.get("produces")}
              onChange={(v) => set("produces", v)}
            />
          </div>
          {filterCount ? (
            <button onClick={() => router.push(pathname)} className="mt-4 text-[12.5px] font-medium text-os-gold hover:underline">
              Clear all filters
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  function FilterGroup({
    label, options, value, onChange, wrap,
  }: { label: string; options: Option[]; value: string | null; onChange: (v: string | null) => void; wrap?: boolean }) {
    return (
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">{label}</p>
        <div className={`flex gap-1 ${wrap ? "flex-wrap" : "flex-wrap"}`}>
          {options.map((option) => (
            <button
              key={option.key}
              onClick={() => onChange(value === option.key ? null : option.key)}
              className={`rounded-md px-2 py-1 text-[12px] transition ${
                value === option.key ? "bg-os-ink text-white" : "border border-os-line bg-white text-os-muted hover:text-os-text"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
}
