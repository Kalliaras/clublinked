"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSubmissionStatusAction(
  submissionId: string,
  status: "pending" | "interview" | "accepted" | "rejected",
  clubId: string,
  interviewTime?: string | null
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errorMessage: "Not authenticated" };

  let normalizedInterviewTime: string | null = null;
  if (interviewTime?.trim()) {
    const parsedInterviewTime = new Date(interviewTime);
    if (Number.isNaN(parsedInterviewTime.getTime())) {
      return { errorMessage: "Choose a valid interview date and time." };
    }
    normalizedInterviewTime = parsedInterviewTime.toISOString();
  }

  const { error } = await supabase.rpc("review_application_submission", {
    p_submission_id: submissionId,
    p_club_id: clubId,
    p_status: status,
    p_interview_time: normalizedInterviewTime,
  });

  if (error) return { errorMessage: error.message };

  revalidatePath(`/club/${clubId}/admin`);
  revalidatePath(`/club/${clubId}/admin/applications`);
  revalidatePath(`/club/${clubId}/apply`);
  return { success: true };
}
