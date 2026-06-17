"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSubmissionStatusAction(
  submissionId: string,
  status: "pending" | "interview" | "accepted" | "rejected",
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errorMessage: "Not authenticated" };

  const { data: role } = await supabase
    .from("user_roles")
    .select("is_owner, is_admin")
    .eq("user_id", user.id)
    .eq("club_id", clubId)
    .maybeSingle();

  if (!role || (!role.is_owner && !role.is_admin)) {
    return { errorMessage: "Not authorized" };
  }

  const { data: submission, error: fetchError } = await supabase
    .from("application_submissions")
    .select("id, student_id, status")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) return { errorMessage: "Submission not found" };

  const { error } = await supabase
    .from("application_submissions")
    .update({ status })
    .eq("id", submissionId);

  if (error) return { errorMessage: error.message };

  if (status === "accepted" && submission.status !== "accepted") {
    const { data: existing } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("user_id", submission.student_id)
      .eq("club_id", clubId)
      .maybeSingle();

    if (!existing) {
      await supabase.from("user_roles").insert({
        user_id: submission.student_id,
        club_id: clubId,
        title: "Member",
        is_owner: false,
        is_admin: false,
      });
    }
  }

  if (status === "rejected" && submission.status === "accepted") {
    const { data: memberRole } = await supabase
      .from("user_roles")
      .select("user_id, is_owner, is_admin")
      .eq("user_id", submission.student_id)
      .eq("club_id", clubId)
      .maybeSingle();

    if (memberRole && !memberRole.is_owner && !memberRole.is_admin) {
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", submission.student_id)
        .eq("club_id", clubId);
    }
  }

  revalidatePath(`/club/${clubId}/admin`);
  revalidatePath(`/club/${clubId}/admin/applications`);
  return { success: true };
}
