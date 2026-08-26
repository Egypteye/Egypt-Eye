// Puzzle types currently registered in
// src/app/(site)/pharaoh-challenge/puzzles/index.ts. Adding a future
// campaign with a new puzzle just adds a new value here plus a new
// component in that registry — nothing else in this file changes.
export type PuzzleType =
  | "sundial-gate"
  | "scarab-path"
  | "hieroglyph-wheels"
  | "obelisk-shadow"
  | "eye-of-ra-threshold";

export type GameCampaign = {
  id: string;
  slug: string;
  name: string;
  theme: string;
  story_intro: string;
  story_outro: string;
  active: boolean;
  starts_at: string;
  ends_at: string | null;
};

export type GameTier = {
  id: string;
  campaign_id: string;
  tier_number: number;
  name: string;
  puzzle_type: PuzzleType;
  flavor_text: string;
  config: Record<string, unknown>;
  reward_discount_campaign_id: string | null;
};

export type GameAttemptStatus = "in_progress" | "completed";

export type GameAttempt = {
  id: string;
  campaign_id: string;
  customer_id: string;
  status: GameAttemptStatus;
  current_tier: number;
  highest_tier_completed: number;
  discount_code_id: string | null;
  started_at: string;
  completed_at: string | null;
};

export type ClaimedReward = {
  code: string;
  discountValue: number;
  tierName: string;
};

// Shared prop contract every puzzle component implements — see
// src/app/(site)/pharaoh-challenge/puzzles/index.ts.
export type PuzzleProps = {
  config: Record<string, unknown>;
  onSolved: () => void;
};
