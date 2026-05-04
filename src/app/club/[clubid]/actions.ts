"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function joinClubAction(clubId: string): Promise<{ errorMessage?: string } | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { errorMessage: "You must be logged in to join a club" };
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("club_id", clubId)
      .maybeSingle();

    if (existing) {
      return { errorMessage: "You are already a member of this club" };
    }

    const { error } = await supabase.from("user_roles").insert({
      user_id: user.id,
      club_id: clubId,
      title: "Member",
      is_owner: false,
    });

    if (error) throw error;

    revalidatePath("/", "layout");
    return null;
  } catch (error) {
    console.error("Error joining club:", error);
    return { errorMessage: (error as Error).message };
  }
}
