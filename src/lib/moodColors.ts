import type { Mood } from "@/content/types";

// Single source of truth for each mood's color, shared by the mood filter
// buttons (ExploreMapPanel) and the map pins they filter (EgyptMap) — so a
// city tagged "history" always renders in the same orange as the "History &
// Monuments" button, whichever component is doing the coloring.
export const MOOD_COLORS: Record<Mood, { label: string; dot: string; border: string; active: string }> = {
  history: { label: "History & Monuments", dot: "bg-orange-600", border: "border-orange-600", active: "border-orange-600 bg-orange-600 text-white" },
  beaches: { label: "Red Sea & Beaches", dot: "bg-blue-600", border: "border-blue-600", active: "border-blue-600 bg-blue-600 text-white" },
  desert: { label: "Desert & Oases", dot: "bg-amber-700", border: "border-amber-700", active: "border-amber-700 bg-amber-700 text-white" },
  diving: { label: "Diving & Snorkeling", dot: "bg-teal-600", border: "border-teal-600", active: "border-teal-600 bg-teal-600 text-white" },
  nile: { label: "Nile & River Towns", dot: "bg-green-600", border: "border-green-600", active: "border-green-600 bg-green-600 text-white" },
  coast: { label: "Mediterranean Coast", dot: "bg-indigo-600", border: "border-indigo-600", active: "border-indigo-600 bg-indigo-600 text-white" },
};

export const MOOD_ORDER: Mood[] = ["history", "beaches", "desert", "diving", "nile", "coast"];
