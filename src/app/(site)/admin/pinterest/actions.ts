"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getPinterestConnection, listBoards } from "@/lib/pinterest/client";
import { pinUnpinnedStories } from "@/lib/pinterest/sync";

export async function pinRemainingStories(): Promise<{ pinned: number; remaining: number; errors: string[] }> {
  await requireAdmin();
  const result = await pinUnpinnedStories({ limit: 25 });
  revalidatePath("/admin/pinterest");
  return result;
}

export async function selectBoard(formData: FormData) {
  await requireAdmin();
  const boardId = String(formData.get("boardId") ?? "");
  if (!boardId) return;

  const connection = await getPinterestConnection();
  if (!connection) return;

  // Look the board's name up server-side rather than trusting a client-
  // supplied value, so the stored board_name always matches the real thing.
  const boards = await listBoards(connection.accessToken);
  const board = boards.find((b) => b.id === boardId);
  if (!board) return;

  const supabase = createAdminSupabaseClient();
  const { data: existing } = await supabase.from("pinterest_connection").select("id").limit(1).maybeSingle();
  if (existing) {
    await supabase
      .from("pinterest_connection")
      .update({ board_id: board.id, board_name: board.name, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  }
  revalidatePath("/admin/pinterest");
}
