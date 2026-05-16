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
      if (answersError) throw answersError;
    }

    revalidatePath(`/club/${clubId}`);
    return null;
  } catch (error) {
    console.error("Error submitting application:", error);
    return { errorMessage: (error as Error).message };
  }
}
