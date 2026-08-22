"use client";

// "Add to My Journey" — a lightweight, client-only shortlist so a visitor can
// collect tours, experiences, and photoshoots as they browse, then carry the
// whole list into Customize Your Tour in one step. No account needed: it
// lives in localStorage, scoped to this browser only.
//
// getJourneyItems() returns a cached, stable array reference (not a fresh
// JSON.parse every call) so it's safe to use directly as a
// useSyncExternalStore snapshot — see useJourneyItems() below.

import { useSyncExternalStore } from "react";

export type JourneyItemType = "tour" | "experience" | "photoshoot";

export type JourneyItem = {
  id: string;
  type: JourneyItemType;
  slug: string;
  title: string;
  subtitle?: string;
};

const STORAGE_KEY = "egypt-eye:journey";
const CHANGE_EVENT = "egypt-eye:journey-change";
const EMPTY: JourneyItem[] = [];

let cache: JourneyItem[] = EMPTY;
let cacheLoaded = false;

function itemId(type: JourneyItemType, slug: string) {
  return `${type}:${slug}`;
}

function loadCache(): JourneyItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  cacheLoaded = true;
  return cache;
}

export function getJourneyItems(): JourneyItem[] {
  if (typeof window === "undefined") return EMPTY;
  if (!cacheLoaded) return loadCache();
  return cache;
}

function saveJourneyItems(items: JourneyItem[]) {
  cache = items;
  cacheLoaded = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private browsing, quota) — the shortlist simply
    // won't persist this session; nothing to recover from here.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function isInJourney(type: JourneyItemType, slug: string): boolean {
  return getJourneyItems().some((i) => i.id === itemId(type, slug));
}

export function addJourneyItem(item: Omit<JourneyItem, "id">) {
  const id = itemId(item.type, item.slug);
  const items = getJourneyItems();
  if (items.some((i) => i.id === id)) return;
  saveJourneyItems([...items, { ...item, id }]);
}

export function removeJourneyItem(type: JourneyItemType, slug: string) {
  const id = itemId(type, slug);
  saveJourneyItems(getJourneyItems().filter((i) => i.id !== id));
}

export function toggleJourneyItem(item: Omit<JourneyItem, "id">): boolean {
  const id = itemId(item.type, item.slug);
  const items = getJourneyItems();
  const exists = items.some((i) => i.id === id);
  saveJourneyItems(exists ? items.filter((i) => i.id !== id) : [...items, { ...item, id }]);
  return !exists;
}

export function subscribeToJourney(callback: () => void) {
  const handleStorage = () => {
    loadCache();
    callback();
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

// Sync-external-store hook — the recommended way to read this in a
// component: avoids the setState-in-effect anti-pattern (and its
// hydration flash) that manual useState+useEffect subscriptions have.
export function useJourneyItems(): JourneyItem[] {
  return useSyncExternalStore(subscribeToJourney, getJourneyItems, () => EMPTY);
}
