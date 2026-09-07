"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ScorecardInput } from "./types";

export async function saveInterviewFeedbackAction(
  clubId: string,
  interviewId: string,
  scorecard: ScorecardInput,
  submit: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { errorMessage: "You must be signed in to save feedback." };

  if (scorecard.notes.length > 10_000) {
    return { errorMessage: "Interview notes must be 10,000 characters or fewer." };
  }

  const { error } = await supabase.rpc("save_application_note", {
    p_club_id: clubId,
    p_interview_id: interviewId,
    p_analytical_thinking_score: scorecard.analyticalThinking,
    p_communication_score: scorecard.communication,
    p_teamwork_score: scorecard.teamwork,
    p_culture_fit_score: scorecard.cultureFit,
    p_recommendation: scorecard.recommendation,
    p_notes: scorecard.notes.trim(),
    p_is_submitted: submit,
  });

  if (error) return { errorMessage: error.message };

  revalidatePath(`/club/${clubId}/admin/interviews`);
  revalidatePath(`/club/${clubId}/apply`);
  return { success: true };
}
