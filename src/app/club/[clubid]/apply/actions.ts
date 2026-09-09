"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type SubmitAnswerInput = {
  questionId: string;
  answerText: string;
};

const answersSchema = z.array(
  z.object({
    questionId: z.string().uuid(),
    answerText: z.string().max(20_000),
  })
).max(100);

export async function saveApplicationAction(
  applicationId: string,
  clubId: string,
  answers: SubmitAnswerInput[],
  submit: boolean
): Promise<{ errorMessage?: string; applicationsClosed?: boolean } | null> {
  const parsed = answersSchema.safeParse(answers);
  const idsAreValid = z.string().uuid().safeParse(applicationId).success
    && z.string().uuid().safeParse(clubId).success;

  if (!parsed.success || !idsAreValid) {
    return { errorMessage: "The application answers are invalid." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { errorMessage: "You must be logged in to apply." };
    }

    const { error } = await supabase.rpc("save_student_application", {
      p_application_id: applicationId,
      p_club_id: clubId,
      p_answers: parsed.data.map((answer) => ({
        question_id: answer.questionId,
        answer_text: answer.answerText,
      })),
      p_submit: submit,
    });

    if (error?.message.includes("APPLICATION_CLOSED")) {
      return {
        errorMessage: "Applications for this club are closed.",
        applicationsClosed: true,
      };
    } else if (error?.message.includes("ALREADY_SUBMITTED")) {
      return { errorMessage: "This application has already been submitted." };
    } else if (error?.message.includes("REQUIRED_ANSWERS_MISSING")) {
      return { errorMessage: "Please answer every required question before submitting." };
    } else if (error) {
      throw error;
    }

    revalidatePath(`/club/${clubId}`);
    revalidatePath(`/club/${clubId}/apply`);
    revalidatePath(`/user/profile/${user.id}/applications`);
    return null;
  } catch (error) {
    console.error("Error saving application:", error);
    return { errorMessage: "We could not save your application. Please try again." };
  }
}

export async function submitApplicationAction(
  applicationId: string,
  clubId: string,
  answers: SubmitAnswerInput[]
) {
  return saveApplicationAction(applicationId, clubId, answers, true);
}
