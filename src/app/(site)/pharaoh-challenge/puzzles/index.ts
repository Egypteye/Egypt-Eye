import type { ComponentType } from "react";
import type { PuzzleProps, PuzzleType } from "@/lib/games/types";
import { SundialGate } from "./SundialGate";
import { ScarabPath } from "./ScarabPath";
import { HieroglyphWheels } from "./HieroglyphWheels";
import { ObeliskShadow } from "./ObeliskShadow";
import { EyeOfRaThreshold } from "./EyeOfRaThreshold";

// puzzle_type (from game_tiers, admin-editable) -> component. A future
// campaign just adds a new PuzzleType + component here — nothing about
// attempts, rewards, or analytics needs to change.
export const PUZZLE_REGISTRY: Record<PuzzleType, ComponentType<PuzzleProps>> = {
  "sundial-gate": SundialGate,
  "scarab-path": ScarabPath,
  "hieroglyph-wheels": HieroglyphWheels,
  "obelisk-shadow": ObeliskShadow,
  "eye-of-ra-threshold": EyeOfRaThreshold,
};
