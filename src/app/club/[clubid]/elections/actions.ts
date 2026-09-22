"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function castVoteAction(clubId: string, positionId: string, candidateId: string): Promise<{ success: true } | { errorMessage: string }> {
  const parsed = z.object({ clubId: z.string().uuid(), positionId: z.string().uuid(), candidateId: z.string().uuid() }).safeParse({ clubId, positionId, candidateId });
  if (!parsed.success) return { errorMessage: "Choose a valid candidate." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("cast_election_vote", {
    p_position_id: parsed.data.positionId,
    p_candidate_id: parsed.data.candidateId,
  });
  if (error?.message.includes("VOTING_CLOSED")) return { errorMessage: "Voting has closed." };
  if (error) return { errorMessage: "Your vote could not be saved. Please try again." };
  revalidatePath(`/club/${clubId}/elections`, "layout");
  revalidatePath(`/club/${clubId}`);
  return { success: true };
}
