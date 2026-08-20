"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { AnnouncementActionResult, AnnouncementInput } from "./types";

const announcementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Add a subject for your announcement.")
    .max(180, "Keep the subject under 180 characters."),
  body: z
    .string()
    .trim()
    .min(1, "Add a message for your announcement.")
    .max(10_000, "Keep the message under 10,000 characters."),
});

export async function createAnnouncementAction(
  clubId: string,
  input: AnnouncementInput
): Promise<AnnouncementActionResult> {
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) {
    return {
      errorMessage:
        parsed.error.issues[0]?.message ?? "Check the announcement details.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { errorMessage: "You must be signed in." };

  const { data: role } = await supabase
    .from("user_roles")
    .select("is_owner, is_admin")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!role || (!role.is_owner && !role.is_admin)) {
    return {
      errorMessage: "You do not have permission to send announcements for this club.",
    };
  }

  const { error } = await supabase.from("club_announcements").insert({
    club_id: clubId,
    user_id: user.id,
    title: parsed.data.title,
    body: parsed.data.body,
  });

  if (error) {
    console.error("Failed to create announcement:", error.message);
    return { errorMessage: "The announcement could not be sent. Please try again." };
  }

  revalidatePath(`/club/${clubId}/admin/announcements`);
  revalidatePath(`/club/${clubId}/announcements`);

  return { success: true };
}
