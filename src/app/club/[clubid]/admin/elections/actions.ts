"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

type Result = { success: true } | { errorMessage: string };

const createSchema = z.object({
  title: z.string().trim().min(1, "Add an election title.").max(160),
  description: z.string().trim().max(2000),
  closesAt: z.string().min(1, "Choose when voting closes."),
});
const descriptionSchema = z.string().trim().min(1, "Describe the position.").max(2000);
const statementSchema = z.string().trim().max(3000);
const uuidSchema = z.string().uuid();

function refresh(clubId: string) {
  revalidatePath(`/club/${clubId}/admin/elections`);
  revalidatePath(`/club/${clubId}/elections`);
  revalidatePath(`/club/${clubId}/elections/history`);
  revalidatePath(`/club/${clubId}`, "layout");
  revalidatePath("/home");
}

function friendlyError(message?: string) {
  if (message?.includes("OWNER_REQUIRED")) return "Only the club owner can do that.";
  if (message?.includes("HOLDER_OR_OWNER_REQUIRED")) return "Only the current position holder or owner can edit this position.";
  if (message?.includes("CANDIDATE_MUST_BE_MEMBER")) return "Candidates must be current club members.";
  if (message?.includes("ADD_POSITIONS_AND_CANDIDATES")) return "Add at least one candidate to every position before opening voting.";
  if (message?.includes("CLOSE_MUST_BE_FUTURE")) return "The closing time must be in the future.";
  if (message?.includes("VOTING_CLOSED")) return "Voting has already closed.";
  if (message?.includes("unique")) return "That member or position has already been added.";
  return "The election could not be updated. Please try again.";
}

export async function createElectionAction(clubId: string, input: { title: string; description: string; closesAt: string }): Promise<Result> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { errorMessage: parsed.error.issues[0]?.message ?? "Check the election details." };
  const closesAt = new Date(parsed.data.closesAt);
  if (Number.isNaN(closesAt.getTime())) return { errorMessage: "Choose a valid closing time." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_club_election", {
    p_club_id: clubId,
    p_title: parsed.data.title,
    p_description: parsed.data.description,
    p_closes_at: closesAt.toISOString(),
  });
  if (error) return { errorMessage: friendlyError(error.message) };
  refresh(clubId);
  return { success: true };
}

export async function addPositionAction(clubId: string, electionId: string, holderId: string, description: string): Promise<Result> {
  const parsed = z.object({ electionId: uuidSchema, holderId: uuidSchema, description: descriptionSchema }).safeParse({ electionId, holderId, description });
  if (!parsed.success) return { errorMessage: parsed.error.issues[0]?.message ?? "Check the position details." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_election_position", {
    p_election_id: parsed.data.electionId,
    p_current_holder_id: parsed.data.holderId,
    p_description: parsed.data.description,
  });
  if (error) return { errorMessage: friendlyError(error.message) };
  refresh(clubId);
  return { success: true };
}

export async function addCandidateAction(clubId: string, positionId: string, userId: string, statement: string): Promise<Result> {
  const parsed = z.object({ positionId: uuidSchema, userId: uuidSchema, statement: statementSchema }).safeParse({ positionId, userId, statement });
  if (!parsed.success) return { errorMessage: parsed.error.issues[0]?.message ?? "Check the candidate details." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_election_candidate", {
    p_position_id: parsed.data.positionId,
    p_user_id: parsed.data.userId,
    p_statement: parsed.data.statement,
  });
  if (error) return { errorMessage: friendlyError(error.message) };
  refresh(clubId);
  return { success: true };
}

export async function removeCandidateAction(clubId: string, candidateId: string): Promise<Result> {
  const parsed = uuidSchema.safeParse(candidateId);
  if (!parsed.success) return { errorMessage: "Invalid candidate." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_election_candidate", { p_candidate_id: parsed.data });
  if (error) return { errorMessage: friendlyError(error.message) };
  refresh(clubId);
  return { success: true };
}

export async function openElectionAction(clubId: string, electionId: string): Promise<Result> {
  const parsed = uuidSchema.safeParse(electionId);
  if (!parsed.success) return { errorMessage: "Invalid election." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("open_club_election", { p_election_id: parsed.data });
  if (error) return { errorMessage: friendlyError(error.message) };
  refresh(clubId);
  return { success: true };
}

export async function finalizeElectionAction(clubId: string, electionId: string): Promise<Result> {
  const parsed = uuidSchema.safeParse(electionId);
  if (!parsed.success) return { errorMessage: "Invalid election." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("finalize_club_election", { p_election_id: parsed.data });
  if (error) return { errorMessage: friendlyError(error.message) };
  refresh(clubId);
  return { success: true };
}
