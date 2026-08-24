"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SubmitAnswerInput = {
  questionId: string;
  answerText: string;
};

export async function submitApplicationAction(
  applicationId: string,
  clubId: string,
  answers: SubmitAnswerInput[]
): Promise<{ errorMessage?: string; applicationsClosed?: boolean } | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { errorMessage: "You must be logged in to apply." };
    }

    // The RPC locks the application row and checks its active flag and the
    // club deadline in the same transaction that creates the submission.
    const { data: submissionId, error: submissionError } = await supabase.rpc(
      "create_application_submission_if_open",
      { p_application_id: applicationId, p_club_id: clubId }
    );

    if (submissionError) {
      if (submissionError.message.includes("APPLICATION_CLOSED")) {
        return {
          errorMessage: "Applications for this club are closed.",
          applicationsClosed: true,
        };
      }
      if (submissionError.message.includes("ALREADY_SUBMITTED")) {
        return { errorMessage: "You have already submitted an application for this club." };
      }
      if (submissionError.message.includes("APPLICATION_NOT_FOUND")) {
        return { errorMessage: "Application not found." };
      }
      throw submissionError;
    }

    // Insert answers (skip blanks for optional questions)
    const answerRows = answers
      .filter((a) => a.answerText.trim() !== "")
      .map((a) => ({
        submission_id: submissionId,
        question_id: a.questionId,
        answer_text: a.answerText,
      }));

    if (answerRows.length > 0) {
      const { error: answersError } = await supabase
        .from("application_answers")
        .insert(answerRows);
      if (answersError) {
        // Roll back the submission so the student can retry
        await supabase
          .from("application_submissions")
          .delete()
          .eq("id", submissionId);
        return { errorMessage: "Failed to save your answers. Please try again." };
      }
    }

    revalidatePath(`/club/${clubId}`);
    return null;
  } catch (error) {
    console.error("Error submitting application:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { errorMessage: message };
  }
}
