"use client";

import { useSyncExternalStore } from "react";

const CHECKLIST_ITEMS = [
  "Passport (valid 6+ months) + printed visa/e-visa confirmation",
  "Lightweight, modest clothing (light colors, breathable fabric)",
  "A light scarf or shawl for temple/mosque visits",
  "Comfortable, closed-toe walking shoes",
  "Sun protection — hat, sunglasses, high-SPF sunscreen",
  "Reusable water bottle",
  "Light jacket or layer for cool desert evenings",
  "Swimwear (Red Sea / Nile cruise / hotel pool)",
  "Power adapter (Type C/F, 220V)",
  "Any prescription medication in original packaging",
  "Copies of your travel insurance and reservation reference",
  "A small daypack for excursions",
];

const CHANGE_EVENT = "egypt-eye:packing-change";

function readChecked(storageKey: string): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// useSyncExternalStore (not useState+useEffect) avoids a hydration flash —
// same pattern as src/lib/journey.ts's useJourneyItems().
function usePackingState(storageKey: string): Record<string, boolean> {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener(CHANGE_EVENT, callback);
      return () => window.removeEventListener(CHANGE_EVENT, callback);
    },
    () => readChecked(storageKey),
    () => ({})
  );
}

function toggle(storageKey: string, item: string, current: Record<string, boolean>) {
  const next = { ...current, [item]: !current[item] };
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Private browsing / quota — the checklist just won't persist.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function PackingChecklist({ reservationId }: { reservationId: string }) {
  const storageKey = `egypt-eye:packing:${reservationId}`;
  const checked = usePackingState(storageKey);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <p className="mb-3 text-xs font-semibold text-ink-soft/50">
        {checkedCount} of {CHECKLIST_ITEMS.length} packed
      </p>
      <ul className="flex flex-col gap-2">
        {CHECKLIST_ITEMS.map((item) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-soft/80">
              <input
                type="checkbox"
                checked={Boolean(checked[item])}
                onChange={() => toggle(storageKey, item, checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-gold-dark"
              />
              <span className={checked[item] ? "line-through opacity-50" : ""}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
