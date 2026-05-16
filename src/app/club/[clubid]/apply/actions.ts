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
): Promise<{ errorMessage?: string } | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { errorMessage: "You must be logged in to apply." };
    }

    const studentId = user.id;

    // Verify application belongs to this club and is still active
    const { data: app } = await supabase
      .from("club_applications")
      .select("id, is_active")
      .eq("id", applicationId)
      .eq("club_id", clubId)
      .maybeSingle();

    if (!app) return { errorMessage: "Application not found." };
    if (!app.is_active) return { errorMessage: "This application is no longer accepting submissions." };

    // Guard: already submitted?
    const { data: existing } = await supabase
      .from("application_submissions")
      .select("id")
      .eq("application_id", applicationId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (existing) {
      return { errorMessage: "You have already submitted an application for this club." };
    }

    // Insert submission
    const { data: submission, error: submissionError } = await supabase
      .from("application_submissions")
      .insert({
        application_id: applicationId,
        student_id: studentId,
        status: "pending",
      })
      .select("id")
      .single();

    if (submissionError || !submission) {
      throw submissionError ?? new Error("Failed to create submission");
    }

    // Insert answers (skip blanks for optional questions)
    const answerRows = answers
      .filter((a) => a.answerText.trim() !== "")
      .map((a) => ({
        submission_id: submission.id,
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
          .eq("id", submission.id);
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
