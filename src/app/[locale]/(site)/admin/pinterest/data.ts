import "server-only";
import { client } from "@/sanity/client";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getPinterestConnection, listBoards } from "@/lib/pinterest/client";

export type PinterestStatus = {
  connected: boolean;
  boardId: string | null;
  boardName: string | null;
  boards: { id: string; name: string }[];
  pinnedCount: number;
  remainingCount: number;
};

export async function getPinterestStatus(): Promise<PinterestStatus> {
  if (!supabaseAdminConfigured) {
    return { connected: false, boardId: null, boardName: null, boards: [], pinnedCount: 0, remainingCount: 0 };
  }

  const connection = await getPinterestConnection();

  const [pinnedCount, remainingCount] = await Promise.all([
    client.fetch<number>(`count(*[_type == "story" && status == "published" && defined(pinterestPinId)])`),
    client.fetch<number>(`count(*[_type == "story" && status == "published" && !defined(pinterestPinId)])`),
  ]);

  let boards: { id: string; name: string }[] = [];
  if (connection && !connection.boardId) {
    try {
      boards = await listBoards(connection.accessToken);
    } catch {
      // Non-fatal — the page just won't show a board picker this load.
    }
  }

  return {
    connected: !!connection,
    boardId: connection?.boardId ?? null,
    boardName: connection?.boardName ?? null,
    boards,
    pinnedCount,
    remainingCount,
  };
}
