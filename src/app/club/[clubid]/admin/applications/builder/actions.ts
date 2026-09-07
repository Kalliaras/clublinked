"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const questionSchema = z.object({
  id: z.string().uuid().nullable(),
  questionText: z.string().trim().min(1, "Every question needs a prompt.").max(500),
  questionType: z.enum(["text", "textarea", "multiple_choice"]),
  isRequired: z.boolean(),
  options: z.array(z.string().trim().min(1).max(200)).max(20),
}).superRefine((question, context) => {
  if (question.questionType === "multiple_choice" && question.options.length < 2) {
    context.addIssue({
      code: "custom",
      path: ["options"],
      message: "Multiple choice questions need at least two options.",
    });
  }
});

const builderSchema = z.object({
  applicationId: z.string().uuid().nullable(),
  title: z.string().trim().min(1, "Add an application title.").max(160),
  description: z.string().trim().max(4000),
  isActive: z.boolean(),
  questions: z.array(questionSchema).max(50),
});

export type SaveApplicationBuilderInput = z.input<typeof builderSchema>;

export async function saveApplicationBuilderAction(
  clubId: string,
  input: SaveApplicationBuilderInput
) {
  const parsed = builderSchema.safeParse(input);
  if (!parsed.success) {
    return { errorMessage: parsed.error.issues[0]?.message ?? "Check the application details." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errorMessage: "You must be signed in." };

  const { data: applicationId, error } = await supabase.rpc(
    "save_club_application_builder",
    {
      p_club_id: clubId,
      p_application_id: parsed.data.applicationId,
      p_title: parsed.data.title,
      p_description: parsed.data.description,
      p_is_active: parsed.data.isActive,
      p_questions: parsed.data.questions.map((question) => ({
        id: question.id,
        question_text: question.questionText,
        question_type: question.questionType,
        is_required: question.isRequired,
        options: question.questionType === "multiple_choice" ? question.options : null,
      })),
    }
  );

  if (error) return { errorMessage: error.message };

  revalidatePath(`/club/${clubId}/admin`);
  revalidatePath(`/club/${clubId}/admin/applications`);
  revalidatePath(`/club/${clubId}/admin/applications/builder`);
  revalidatePath(`/club/${clubId}/apply`);
  revalidatePath(`/club/${clubId}`);
  updateTag("club-page");
  return { success: true, applicationId };
}
