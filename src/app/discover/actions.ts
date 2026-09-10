"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const accessCodeSchema = z.string().trim().min(1).max(64);

export async function joinWithAccessCodeAction(accessCode: string): Promise<
  { clubId: string } | { errorMessage: string }
> {
  const parsed = accessCodeSchema.safeParse(accessCode);
  if (!parsed.success) return { errorMessage: "Enter a valid invite code." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { errorMessage: "You must be signed in to join a club." };

  const { data, error } = await supabase.rpc("join_club_with_access_code", {
    p_access_code: parsed.data.toUpperCase(),
  });

  if (error?.message.includes("CODE_NOT_FOUND")) {
    return { errorMessage: "Invite code not found." };
  } else if (error || !data) {
    console.error("[discover/join]", error?.message);
    return { errorMessage: "Could not join the club. Please try again." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/home");
  revalidatePath(`/user/profile/${user.id}/clubs`);
  return { clubId: data };
}
