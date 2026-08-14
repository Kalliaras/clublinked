"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type MemberRole = "Student" | "Admin" | "Owner";

export async function changeMemberRoleAction(
  clubId: string,
  userId: string,
  role: MemberRole
): Promise<{ success?: true; errorMessage?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { errorMessage: "You must be signed in." };

  const { error } = await supabase.rpc("change_club_member_role", {
    p_club_id: clubId,
    p_user_id: userId,
    p_role: role,
  });

  if (error) return { errorMessage: error.message };

  revalidatePath(`/club/${clubId}/admin/members`);
  revalidatePath(`/club/${clubId}/members`);
  revalidatePath(`/club/${clubId}`, "layout");
  return { success: true };
}
